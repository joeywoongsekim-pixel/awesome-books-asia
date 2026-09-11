'use client';

import {useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {createSupabaseBrowser} from '../../lib/supabase/client';

// M29 — the writing studio inside the admin book page. Chapters are written
// as light text (blank line = paragraph, # heading, **bold**, *italic*,
// > quote); the source is kept alongside the generated HTML in the chapters
// JSONB so an authored book can always be re-opened for editing. Saving
// upserts book_content exactly like the EPUB pipeline does, so the reader,
// sampling RPC and paywall need no changes at all.

export type StudioChapter = {id: string; title: string; html: string; src?: string};
export type StudioContent = {
  locale: string;
  kind: string;
  chapters: StudioChapter[];
  sample: StudioChapter[];
};

const LOCALES = ['en', 'ko', 'ja'] as const;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');

export function toHtml(src: string): string {
  return src
    .split(/\n\s*\n/)
    .map((block) => {
      const b = block.trim();
      if (!b) return '';
      if (b.startsWith('## ')) return `<h3>${inline(b.slice(3))}</h3>`;
      if (b.startsWith('# ')) return `<h2>${inline(b.slice(2))}</h2>`;
      if (b.startsWith('> '))
        return `<blockquote><p>${inline(b.replace(/^> ?/gm, ''))}</p></blockquote>`;
      return `<p>${inline(b).replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('');
}

// Editing a chapter that only has pipeline HTML (no src): degrade gracefully.
function toSrc(html: string): string {
  return html
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n\n# $1\n\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n\n## $1\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<b>([\s\S]*?)<\/b>/g, '**$1**')
    .replace(/<i>([\s\S]*?)<\/i>/g, '*$1*')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type Draft = {title: string; src: string};

export default function ChapterStudio({
  bookId,
  slug,
  initial
}: {
  bookId: string;
  slug: string;
  initial: StudioContent[];
}) {
  const t = useTranslations('admin');
  const uiLocale = useLocale();
  const supabase = createSupabaseBrowser();

  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('en');
  const [drafts, setDrafts] = useState<Record<string, Draft[]>>(() => {
    const out: Record<string, Draft[]> = {};
    for (const c of initial) {
      out[c.locale] = (c.chapters ?? []).map((ch) => ({
        title: ch.title,
        src: ch.src ?? toSrc(ch.html)
      }));
    }
    return out;
  });
  const [sampleN, setSampleN] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const c of initial) out[c.locale] = Math.max(c.sample?.length ?? 1, 1);
    return out;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const chapters = drafts[locale] ?? [];
  const n = Math.min(Math.max(sampleN[locale] ?? 1, 1), Math.max(chapters.length, 1));
  const setChapters = (list: Draft[]) => setDrafts((d) => ({...d, [locale]: list}));

  const words = useMemo(
    () => chapters.reduce((sum, c) => sum + c.src.split(/\s+/).filter(Boolean).length, 0),
    [chapters]
  );

  function move(i: number, dir: -1 | 1) {
    const list = [...chapters];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setChapters(list);
  }

  async function save() {
    const list = chapters.filter((c) => c.title.trim() || c.src.trim());
    if (!list.length) {
      setMsg(t('noChapters'));
      return;
    }
    setBusy(true);
    setMsg('');
    const full: StudioChapter[] = list.map((c, i) => ({
      id: `ch${i + 1}`,
      title: c.title.trim() || `${t('chapterN')} ${i + 1}`,
      html: toHtml(c.src),
      src: c.src
    }));
    const toc = full.map((c, i) => ({title: c.title, index: i}));
    const {error} = await supabase.from('book_content').upsert(
      {
        book_id: bookId,
        locale,
        kind: 'epub',
        toc,
        chapters: full,
        sample: full.slice(0, n),
        page_count: null,
        processed_at: new Date().toISOString()
      },
      {onConflict: 'book_id,locale'}
    );
    setMsg(error ? error.message : t('contentSaved'));
    setBusy(false);
  }

  return (
    <div className="std">
      <div className="std-tabs">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            className={`std-tab${locale === loc ? ' on' : ''}`}
            onClick={() => setLocale(loc)}
          >
            {loc.toUpperCase()}
            {(drafts[loc]?.length ?? 0) > 0 && <i>{drafts[loc].length}</i>}
          </button>
        ))}
        <span className="std-count">
          {chapters.length} {t('chapterN')} · {words} {t('words')}
        </span>
      </div>

      <p className="kdp-hint">{t('formatHint')}</p>

      {chapters.map((ch, i) => (
        <div className={`std-ch${i < n ? ' free' : ''}`} key={i}>
          <div className="std-ch-head">
            <span className="std-ch-n">
              {i + 1}
              {i < n && <b>{t('freeSample')}</b>}
            </span>
            <input
              className="std-ch-title"
              placeholder={`${t('chapterN')} ${i + 1}`}
              value={ch.title}
              onChange={(e) =>
                setChapters(chapters.map((c, j) => (j === i ? {...c, title: e.target.value} : c)))
              }
            />
            <div className="std-ch-tools">
              <button type="button" onClick={() => move(i, -1)} aria-label="up" disabled={i === 0}>
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                aria-label="down"
                disabled={i === chapters.length - 1}
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (window.confirm(t('removeChConfirm')))
                    setChapters(chapters.filter((_, j) => j !== i));
                }}
              >
                ×
              </button>
            </div>
          </div>
          <textarea
            className="std-ch-body"
            spellCheck
            lang={locale}
            placeholder={t('chBodyPh')}
            value={ch.src}
            rows={Math.min(Math.max(ch.src.split('\n').length + 2, 6), 24)}
            onChange={(e) =>
              setChapters(chapters.map((c, j) => (j === i ? {...c, src: e.target.value} : c)))
            }
          />
        </div>
      ))}

      <button
        type="button"
        className="std-add"
        onClick={() => setChapters([...chapters, {title: '', src: ''}])}
      >
        + {t('addChapter')}
      </button>

      <div className="std-foot">
        <label className="std-sample">
          {t('sampleN')}
          <input
            type="number"
            min={1}
            max={Math.max(chapters.length, 1)}
            value={n}
            onChange={(e) => setSampleN((s) => ({...s, [locale]: Number(e.target.value) || 1}))}
          />
          <span className="kdp-hint">{t('sampleHint')}</span>
        </label>
        <div className="std-actions">
          <button type="button" className="btn-g adm-btn" onClick={save} disabled={busy}>
            {t('saveContent')}
          </button>
          <a className="std-preview" href={`/${uiLocale}/read/${slug}`} target="_blank" rel="noreferrer">
            {t('previewReader')} ↗
          </a>
          {msg && <span className="adm-msg">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
