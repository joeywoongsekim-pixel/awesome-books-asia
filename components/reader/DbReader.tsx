'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';

// Reader for pipeline-processed books (book_content via get_book_content).
// EPUB editions arrive as sanitised chapter HTML and are laid out as a
// two-column paper spread (CSS multicol + translateX paging); PDF editions
// render page-by-page with pdf.js from a short-lived signed URL. Sampling is
// enforced server-side — unentitled readers only ever receive the sample
// chapters, and the page-turn past the end raises the paywall.

export type DbChapter = {id: string; title: string; html: string};
export type DbTocEntry = {title: string; index: number};
export type DbContent = {
  kind: 'epub' | 'pdf';
  full: boolean;
  toc: DbTocEntry[] | null;
  page_count: number | null;
  chapters: DbChapter[];
};

const GAP = 56; // must match .pv-flow column-gap
const SYNC_MS = 800;

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: {scale: number}) => {width: number; height: number};
    render: (o: {canvasContext: CanvasRenderingContext2D; viewport: unknown}) => {
      promise: Promise<void>;
    };
  }>;
};

export default function DbReader({
  slug,
  locale,
  title,
  author,
  content,
  bookId,
  signedIn,
  canSync,
  initialPage = 0
}: {
  slug: string;
  locale: string;
  title: string;
  author: string;
  content: DbContent;
  bookId: string;
  signedIn: boolean;
  canSync: boolean;
  initialPage?: number;
}) {
  const t = useTranslations('reader');
  const tPay = useTranslations('paywall');
  const tAuth = useTranslations('auth');
  const tAcct = useTranslations('footer.accountLinks');
  const router = useRouter();

  const isPdf = content.kind === 'pdf';
  const full = content.full;

  const [page, setPage] = useState(isPdf ? initialPage : 0);
  const [pages, setPages] = useState(1);
  const [chapterPages, setChapterPages] = useState<number[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  // PDF has no free sample — the file only opens for entitled readers.
  const [paywall, setPaywall] = useState(isPdf && !full);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const viewRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDoc = useRef<PdfDoc | null>(null);
  const restored = useRef(false);

  // ── EPUB pagination: measure multicol overflow into page count ─────────
  const measure = useCallback(() => {
    const view = viewRef.current;
    const flow = flowRef.current;
    if (!view || !flow) return;
    // column-width only takes lengths, so the two-column width is set here
    // in px (one column under 640px — the phone layout).
    const cols = view.clientWidth < 640 ? 1 : 2;
    flow.style.columnWidth = `${(view.clientWidth - GAP * (cols - 1)) / cols}px`;
    const step = view.clientWidth + GAP;
    const n = Math.max(1, Math.ceil((flow.scrollWidth + GAP) / step));
    setPages(n);
    const fr = flow.getBoundingClientRect();
    const starts: number[] = [];
    flow.querySelectorAll('section[data-ch]').forEach((sec) => {
      starts.push(
        Math.max(0, Math.round((sec.getBoundingClientRect().left - fr.left) / step))
      );
    });
    setChapterPages(starts);
    setPage((p) => {
      // First measurement restores saved progress; later ones (resize) clamp.
      if (!restored.current) {
        restored.current = true;
        return Math.min(Math.max(initialPage, 0), n - 1);
      }
      return Math.min(p, n - 1);
    });
  }, [initialPage]);

  useEffect(() => {
    if (isPdf) return;
    measure();
    const view = viewRef.current;
    if (!view) return;
    const ro = new ResizeObserver(measure);
    ro.observe(view);
    return () => ro.disconnect();
  }, [isPdf, measure]);

  // ── PDF: signed URL → pdf.js document ──────────────────────────────────
  useEffect(() => {
    if (!isPdf || !full) return;
    let dead = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/read-file?slug=${encodeURIComponent(slug)}&locale=${locale}&format=pdf`
        );
        if (!res.ok) throw new Error('file unavailable');
        const {url} = (await res.json()) as {url: string};
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const doc = (await pdfjs.getDocument({url}).promise) as unknown as PdfDoc;
        if (dead) return;
        pdfDoc.current = doc;
        setPages(doc.numPages);
        setPage((p) => Math.min(Math.max(p, 0), doc.numPages - 1));
        setPdfReady(true);
      } catch (e) {
        if (!dead) setPdfError(e instanceof Error ? e.message : 'error');
      }
    })();
    return () => {
      dead = true;
    };
  }, [isPdf, full, slug, locale]);

  useEffect(() => {
    if (!pdfReady) return;
    const doc = pdfDoc.current;
    const canvas = canvasRef.current;
    const view = viewRef.current;
    if (!doc || !canvas || !view) return;
    let dead = false;
    (async () => {
      const pg = await doc.getPage(page + 1);
      if (dead) return;
      const dpr = window.devicePixelRatio || 1;
      const base = pg.getViewport({scale: 1});
      const fit = Math.min(view.clientWidth / base.width, view.clientHeight / base.height);
      const vp = pg.getViewport({scale: fit * dpr});
      canvas.width = vp.width;
      canvas.height = vp.height;
      canvas.style.width = `${vp.width / dpr}px`;
      canvas.style.height = `${vp.height / dpr}px`;
      await pg.render({canvasContext: canvas.getContext('2d')!, viewport: vp}).promise;
    })();
    return () => {
      dead = true;
    };
  }, [page, pdfReady]);

  // ── paging ──────────────────────────────────────────────────────────────
  function go(dir: 1 | -1) {
    setTocOpen(false);
    if (dir < 0) {
      setPage((p) => Math.max(0, p - 1));
      return;
    }
    if (page < pages - 1) setPage((p) => p + 1);
    // The sample simply runs out; the next turn past its last page pays.
    else if (!full) setPaywall(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') router.push('/books');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── progress sync (signed-in readers) ───────────────────────────────────
  useEffect(() => {
    if (!canSync || !restored.current) return;
    const id = setTimeout(async () => {
      const {createSupabaseBrowser} = await import('../../lib/supabase/client');
      const supabase = createSupabaseBrowser();
      await supabase.from('reading_progress').upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          book_id: bookId,
          locale,
          spread_index: page,
          updated_at: new Date().toISOString()
        },
        {onConflict: 'user_id,book_id,locale'}
      );
    }, SYNC_MS);
    return () => clearTimeout(id);
  }, [page, canSync, bookId, locale]);

  function jumpToc(i: number) {
    setTocOpen(false);
    if (i < chapterPages.length) setPage(Math.min(chapterPages[i], pages - 1));
    // Entry beyond the sample's chapters → that content is paid.
    else if (!full) setPaywall(true);
  }

  const pct = pages > 1 ? ((page + 1) / pages) * 100 : 100;

  return (
    <div className="rd pv">
      <div className="rd-room" />
      <div className="rd-lamp" />

      <div className="rd-tb">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Link href="/books" className="rd-back">
            {t('back')}
          </Link>
          <div>
            <div className="rd-title">{title}</div>
            <div className="rd-sub">{author}</div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {!isPdf && (content.toc?.length ?? 0) > 0 && (
            <button
              type="button"
              className={`rd-btn${tocOpen ? ' on' : ''}`}
              aria-label="contents"
              onClick={() => setTocOpen((v) => !v)}
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {tocOpen && content.toc && (
        <div className="pv-toc" role="menu">
          {content.toc.map((e, i) => (
            <button
              type="button"
              key={`${e.index}-${e.title}`}
              className={`pv-toc-i${i >= chapterPages.length ? ' locked' : ''}`}
              onClick={() => jumpToc(i)}
            >
              {e.title}
            </button>
          ))}
        </div>
      )}

      <div className="pv-stage">
        <div className="pv-book">
          <div className="pv-view" ref={viewRef}>
            {isPdf ? (
              <div className="pv-canvas-wrap">
                {full && !pdfError && <canvas ref={canvasRef} />}
                {pdfError && <div className="pv-note">{tPay('title')}</div>}
              </div>
            ) : (
              <div
                className="pv-flow"
                ref={flowRef}
                style={{
                  transform: `translateX(calc(${-page} * (100% + ${GAP}px)))`
                }}
              >
                {content.chapters.map((ch, i) => (
                  <section
                    key={ch.id || i}
                    data-ch={i}
                    dangerouslySetInnerHTML={{__html: ch.html}}
                  />
                ))}
              </div>
            )}
          </div>

          <button type="button" className="pv-zone l" aria-label="previous" onClick={() => go(-1)} />
          <button type="button" className="pv-zone r" aria-label="next" onClick={() => go(1)} />
        </div>

        <div className="pv-foot">
          <span className="pv-num">{page + 1}</span>
          <span className="pv-bar">
            <i style={{width: `${pct}%`}} />
          </span>
          <span className="pv-num">{pages}</span>
        </div>
      </div>

      {paywall && !full && (
        <div className="rd-pay" role="dialog" aria-modal="true">
          <div className="rd-pay-card">
            <div className="rd-pay-t">{tPay('title')}</div>
            <p className="rd-pay-b">{tPay('body')}</p>
            <div className="rd-pay-btns">
              {signedIn ? (
                <Link href="/redeem" className="rd-pay-buy">
                  {tAcct('redeem')}
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="rd-pay-buy">
                    {tAuth('signupTitle')}
                  </Link>
                  <Link href="/auth/login" className="rd-pay-alt">
                    {tAuth('loginTitle')}
                  </Link>
                </>
              )}
              <Link href="/#plans" className="rd-pay-alt">
                {tPay('plans')}
              </Link>
            </div>
            <button type="button" className="rd-pay-x" onClick={() => setPaywall(false)}>
              {tPay('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
