'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {createSupabaseBrowser} from '../../lib/supabase/client';

// M30 — the KDP-style pre-publish check. One button sweeps the SAVED state
// of a title (metadata, cover, every locale's chapters) with rule-based
// checks — the same class of automated QA KDP runs after an upload — and
// reports errors / warnings / passes. Deliberately deterministic: every
// finding is explainable and reproducible.

export type CheckLevel = 'error' | 'warn' | 'ok';
export type Finding = {level: CheckLevel; text: string};

type Row = {
  locale: string;
  kind: string;
  chapters: Array<{id: string; title: string; html: string; src?: string}>;
  sample: Array<{id: string}>;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEHOLDER_RE = /lorem ipsum|\bTODO\b|\bFIXME\b|\bxxx\b/i;
const BADCHAR_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/;

const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ');
const wordsOf = (s: string) => s.split(/\s+/).filter(Boolean).length;

function scriptRatio(s: string, re: RegExp): number {
  const letters = s.replace(/[\s\d\p{P}]/gu, '');
  if (!letters.length) return 0;
  const hits = letters.match(re);
  return (hits?.length ?? 0) / letters.length;
}

function loadImage(url: string): Promise<{w: number; h: number} | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({w: img.naturalWidth, h: img.naturalHeight});
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function PrePubCheck({
  bookId,
  title,
  author,
  slug,
  coverUrl,
  priceUsd,
  publishedAt,
  onResult
}: {
  bookId: string;
  title: string;
  author: string;
  slug: string;
  coverUrl: string | null;
  priceUsd: string;
  publishedAt: string;
  onResult?: (hasErrors: boolean) => void;
}) {
  const t = useTranslations('admin');
  const supabase = createSupabaseBrowser();
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const out: Finding[] = [];
    const push = (level: CheckLevel, text: string) => out.push({level, text});

    // ── metadata ──────────────────────────────────────────────────────
    if (!title.trim()) push('error', t('ckTitleMissing'));
    if (!author.trim()) push('error', t('ckAuthorMissing'));
    if (!SLUG_RE.test(slug.trim())) push('error', t('ckSlugBad'));
    if (!publishedAt) push('warn', t('ckDateMissing'));
    if (Number(priceUsd || '0') === 0) push('warn', t('ckPriceZero'));
    if (!out.some((f) => f.level !== 'ok')) push('ok', t('ckMetaOk'));

    // ── cover ─────────────────────────────────────────────────────────
    if (!coverUrl) push('warn', t('ckCoverMissing'));
    else {
      const dim = await loadImage(coverUrl);
      if (!dim) push('error', t('ckCoverLoad'));
      else if (dim.w >= dim.h) push('warn', t('ckCoverLandscape', {w: dim.w, h: dim.h}));
      else if (dim.h < 1000) push('warn', t('ckCoverSmall', {w: dim.w, h: dim.h}));
      else push('ok', t('ckCoverOk', {w: dim.w, h: dim.h}));
    }

    // ── content, per saved locale ─────────────────────────────────────
    const {data} = await supabase
      .from('book_content')
      .select('locale, kind, chapters, sample')
      .eq('book_id', bookId);
    const rows = (data ?? []) as Row[];
    const textRows = rows.filter((r) => r.kind !== 'pdf');

    if (!rows.length) {
      push('error', t('ckContentNone'));
    }
    for (const row of textRows) {
      const L = row.locale.toUpperCase();
      const chs = row.chapters ?? [];
      let clean = true;
      let words = 0;
      chs.forEach((ch, i) => {
        const body = textOf(ch.html);
        words += wordsOf(body);
        const src = ch.src ?? '';
        if (!body.trim()) {
          push('warn', t('ckChEmpty', {loc: L, n: i + 1}));
          clean = false;
        }
        if (!ch.title.trim()) {
          push('warn', t('ckChUntitled', {loc: L, n: i + 1}));
          clean = false;
        }
        if (src && (src.match(/\*\*/g)?.length ?? 0) % 2 === 1) {
          push('warn', t('ckMdUnbalanced', {loc: L, n: i + 1}));
          clean = false;
        }
        if (PLACEHOLDER_RE.test(body)) {
          push('warn', t('ckPlaceholder', {loc: L, n: i + 1}));
          clean = false;
        }
        if (BADCHAR_RE.test(body)) {
          push('warn', t('ckBadChars', {loc: L, n: i + 1}));
          clean = false;
        }
      });

      const all = chs.map((c) => textOf(c.html)).join(' ');
      if (words < 300) {
        push('warn', t('ckShort', {loc: L, words}));
        clean = false;
      }
      const hangul = scriptRatio(all, /[\uAC00-\uD7AF]/g);
      const kanaKanji = scriptRatio(all, /[\u3040-\u30FF\u4E00-\u9FFF]/g);
      if (row.locale === 'ko' && hangul < 0.3) {
        push('warn', t('ckLangMismatch', {loc: L}));
        clean = false;
      }
      if (row.locale === 'ja' && kanaKanji < 0.2) {
        push('warn', t('ckLangMismatch', {loc: L}));
        clean = false;
      }
      if (row.locale === 'en' && hangul + kanaKanji > 0.3) {
        push('warn', t('ckLangMismatch', {loc: L}));
        clean = false;
      }
      if ((row.sample?.length ?? 0) >= chs.length && chs.length > 0) {
        push('warn', t('ckSampleAll', {loc: L}));
        clean = false;
      }
      const bytes = JSON.stringify(row.chapters).length;
      if (bytes > 2_000_000) {
        push('warn', t('ckSizeBig', {loc: L, mb: (bytes / 1_048_576).toFixed(1)}));
        clean = false;
      }
      if (clean) push('ok', t('ckContentOk', {loc: L, n: chs.length, words}));
    }
    for (const row of rows.filter((r) => r.kind === 'pdf')) {
      push('ok', t('ckPdfNote', {loc: row.locale.toUpperCase()}));
    }

    setFindings(out);
    onResult?.(out.some((f) => f.level === 'error'));
    setRunning(false);
  }

  const errs = findings?.filter((f) => f.level === 'error').length ?? 0;
  const warns = findings?.filter((f) => f.level === 'warn').length ?? 0;

  return (
    <div className="chk">
      <div className="chk-bar">
        <button type="button" className="btn-g adm-btn" onClick={run} disabled={running}>
          {running ? t('ckRunning') : t('ckRun')}
        </button>
        {findings && (
          <span className={`chk-sum${errs ? ' bad' : warns ? ' meh' : ' good'}`}>
            {errs
              ? t('ckSumErrors', {errs, warns})
              : warns
                ? t('ckSumWarns', {warns})
                : t('ckSumClean')}
          </span>
        )}
      </div>
      {findings && (
        <ul className="chk-list">
          {findings.map((f, i) => (
            <li key={i} className={`chk-${f.level}`}>
              <i>{f.level === 'error' ? '✕' : f.level === 'warn' ? '!' : '✓'}</i>
              {f.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
