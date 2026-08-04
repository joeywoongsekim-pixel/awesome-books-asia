'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {BOOKS, type Book} from '../../lib/books';
import BigPage, {ctxOf} from './BigPage';
import AiPanel from './AiPanel';

const SWAP_MS = 260; // matches .spread opacity transition
const SNAP_MS = 500; // matches .flipper.snap transform transition
const COMMIT_DEG = 78; // release past this angle commits the turn
const FREE_SPREADS = 3; // spreads readable without entitlement (M6 sample rule)

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');

type Turn = {
  dir: 1 | -1;
  angle: number;
  snap: boolean;
};

type Drag = {
  from: number; // desk slot: 0 = main, 1..3 = shelf
  x: number;
  y: number;
  moved: boolean;
  over: number | null;
};

const DRAG_THRESHOLD = 6;

const inRect = (x: number, y: number, r: DOMRect) =>
  x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

type DragHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
};

function ShelfBook({
  book,
  spread,
  label,
  isSource,
  isHot,
  handlers
}: {
  book: Book;
  spread: number;
  label: string;
  isSource: boolean;
  isHot: boolean;
  handlers: DragHandlers;
}) {
  // Shelf shows the book's current right-hand page, cropped and faded at the
  // bottom (never scaled down — ~10px type stays readable).
  const pi = Math.min(spread * 2 + 1, book.sp.length - 1);
  const p = book.sp[pi] ?? book.sp[0];
  const c = ctxOf(book, pi);

  return (
    <div className={`sbk${isSource ? ' dsrc' : ''}${isHot ? ' dhot' : ''}`} {...handlers}>
      <div className="sb-pg">
        <div className="sb-ch">
          {book.ic} {c.ch}
        </div>
        {c.h && <div className="sb-head">{c.h}</div>}
        {p.fig && (
          <div className="sb-fig">
            <b>{p.fig.i}</b>
            <span dangerouslySetInnerHTML={{__html: p.fig.t}} />
          </div>
        )}
        <div className="sb-body">{stripTags(p.x)}</div>
        <div className="sb-num">{pi + 1}</div>
      </div>
      <div className="sb-pick">
        {book.ic} {label}
      </div>
      <div className="sb-lb">{book.title}</div>
    </div>
  );
}

export default function Reader({
  initialIndex,
  locale,
  bookId,
  initialSpread = 0,
  canSync = false,
  entitled = true,
  signedIn = false
}: {
  initialIndex: number;
  locale: string;
  bookId: string | null;
  initialSpread?: number;
  canSync?: boolean;
  entitled?: boolean;
  signedIn?: boolean;
}) {
  const t = useTranslations('reader');
  const tPay = useTranslations('paywall');
  const tDetail = useTranslations('detail');
  const tAuth = useTranslations('auth');
  const tAcct = useTranslations('footer.accountLinks');
  const router = useRouter();

  const [order, setOrder] = useState<number[]>(() => [
    initialIndex,
    ...BOOKS.map((_, i) => i)
      .filter((i) => i !== initialIndex)
      .slice(0, 3)
  ]);
  // Reading position per book (index into spreads). The route book resumes
  // from the signed-in user's saved progress.
  const [spreadOf, setSpreadOf] = useState<Record<number, number>>(() =>
    initialSpread ? {[initialIndex]: initialSpread} : {}
  );
  const [marked, setMarked] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [hintHidden, setHintHidden] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const spreadRef = useRef<HTMLDivElement>(null);
  const draggingCorner = useRef(false);

  const main: Book = BOOKS[order[0]];
  const spread = spreadOf[order[0]] ?? 0;
  const left = spread * 2;
  const right = left + 1;
  const maxSpread = Math.ceil(main.sp.length / 2) - 1;

  const canGo = (dir: 1 | -1) => (dir > 0 ? spread < maxSpread : spread > 0);
  // Sample gate: unentitled readers may open the first FREE_SPREADS spreads
  // of whichever book is on the desk; going further raises the paywall.
  const gatedNext = (dir: 1 | -1) =>
    dir > 0 && !entitled && spread >= FREE_SPREADS - 1;

  function swapSlots(a: number, b: number) {
    if (a === b || busy || turn) return;
    setBusy(true);
    setSwapping(true);
    setTimeout(() => {
      setOrder((o) => {
        const next = [...o];
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
      setSwapping(false);
      setBusy(false);
    }, SWAP_MS);
  }

  // ── page turn ──────────────────────────────────────────────────────────
  function commit(dir: 1 | -1) {
    setBusy(true);
    setTurn({dir, angle: 180, snap: true});
    setTimeout(() => {
      setSpreadOf((s) => ({...s, [order[0]]: (s[order[0]] ?? 0) + dir}));
      setTurn(null);
      setBusy(false);
    }, SNAP_MS);
  }

  function cancel(dir: 1 | -1) {
    setBusy(true);
    setTurn({dir, angle: 0, snap: true});
    setTimeout(() => {
      setTurn(null);
      setBusy(false);
    }, SNAP_MS);
  }

  function turnPage(dir: 1 | -1) {
    if (busy || turn) return;
    if (gatedNext(dir)) {
      setPaywall(true);
      return;
    }
    if (!canGo(dir)) return;
    setTurn({dir, angle: 0, snap: false});
    // Two frames so the flipper paints at 0° before the snap transition runs.
    requestAnimationFrame(() => requestAnimationFrame(() => commit(dir)));
  }

  // Corner drag — pointer events so touch works too (the prototype was
  // mouse-only; that is fixed here).
  function onCornerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy || turn) return;
    if (gatedNext(1)) {
      setPaywall(true);
      return;
    }
    if (!canGo(1)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingCorner.current = true;
    setHintHidden(true);
    setTurn({dir: 1, angle: 0, snap: false});
  }

  function onCornerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingCorner.current) return;
    const rect = spreadRef.current?.getBoundingClientRect();
    if (!rect) return;
    const angle = Math.max(0, Math.min(180, ((rect.right - e.clientX) / rect.width) * 2 * 180));
    setTurn((tn) => (tn ? {...tn, angle} : tn));
  }

  function onCornerUp() {
    if (!draggingCorner.current) return;
    draggingCorner.current = false;
    setTurn((tn) => {
      if (!tn) return tn;
      if (tn.angle > COMMIT_DEG) commit(tn.dir);
      else cancel(tn.dir);
      return tn;
    });
  }

  // ── book moving (pointer-event drag from shelf books or the grip) ──────
  function dragHandlers(from: number): DragHandlers {
    return {
      onPointerDown: (e) => {
        if (busy || turn || drag) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag({from, x: e.clientX, y: e.clientY, moved: false, over: null});
      },
      onPointerMove: (e) => {
        // Pointer capture + React's synchronous flush on discrete events keep
        // this closure's `drag` current between renders.
        if (!drag || drag.from !== from) return;
        const moved =
          drag.moved || Math.hypot(e.clientX - drag.x, e.clientY - drag.y) >= DRAG_THRESHOLD;
        if (moved && !hintHidden) setHintHidden(true);
        let over: number | null = null;
        if (drag.from !== 0) {
          const sr = document.querySelector('.rd .spread')?.getBoundingClientRect();
          if (sr && inRect(e.clientX, e.clientY, sr)) over = 0;
        }
        document.querySelectorAll('.rd .shelf .sbk').forEach((el, i) => {
          if (inRect(e.clientX, e.clientY, el.getBoundingClientRect())) over = i + 1;
        });
        setDrag({...drag, x: e.clientX, y: e.clientY, moved, over});
      },
      onPointerUp: () => {
        if (!drag || drag.from !== from) return;
        setDrag(null);
        if (!drag.moved) {
          // A tap on a shelf book still brings it straight down.
          if (drag.from !== 0) swapSlots(0, drag.from);
        } else if (drag.over !== null && drag.over !== drag.from) {
          swapSlots(drag.from, drag.over);
        }
      },
      onPointerCancel: () => setDrag(null)
    };
  }

  const dragging = Boolean(drag?.moved);
  const dragBook = drag ? BOOKS[order[drag.from]] : null;

  // ── progress sync (signed-in readers, route book only) ─────────────────
  const routeSpread = spreadOf[initialIndex] ?? 0;
  useEffect(() => {
    if (!canSync || !bookId) return;
    const id = setTimeout(async () => {
      const {createSupabaseBrowser} = await import('../../lib/supabase/client');
      const supabase = createSupabaseBrowser();
      await supabase.from('reading_progress').upsert(
        {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          book_id: bookId,
          locale,
          spread_index: routeSpread,
          updated_at: new Date().toISOString()
        },
        {onConflict: 'user_id,book_id,locale'}
      );
    }, 800);
    return () => clearTimeout(id);
  }, [routeSpread, canSync, bookId, locale]);

  async function addBookmark() {
    if (!canSync || !bookId || marked) return;
    const {createSupabaseBrowser} = await import('../../lib/supabase/client');
    const supabase = createSupabaseBrowser();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const {error} = await supabase.from('bookmarks').insert({
      user_id: user.id,
      book_id: bookId,
      locale,
      page_index: (spreadOf[order[0]] ?? 0) * 2 + 1
    });
    if (!error) {
      setMarked(true);
      setTimeout(() => setMarked(false), 1600);
    }
  }

  // ── keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') turnPage(1);
      else if (e.key === 'ArrowLeft') turnPage(-1);
      else if (e.key >= '1' && e.key <= '3') swapSlots(0, Number(e.key));
      else if (e.key === 'Escape') {
        if (focus) setFocus(false);
        else router.push('/books');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── flip faces ─────────────────────────────────────────────────────────
  // Forward: face A = current right page, face B = next spread's left page.
  // Backward: face A = current left page, face B = previous spread's right.
  const faceA = turn ? (turn.dir > 0 ? right : left) : null;
  const faceB = turn ? (turn.dir > 0 ? (spread + 1) * 2 : (spread - 1) * 2 + 1) : null;
  // While turning, the uncovered static page already shows the destination.
  const staticRight = turn && turn.dir > 0 ? (spread + 1) * 2 + 1 : right;
  const staticLeft = turn && turn.dir < 0 ? (spread - 1) * 2 : left;

  const shade = turn ? Math.min(turn.angle / 180, 1) : 0;

  const progressPct = ((right + 1) / main.sp.length) * 100;

  return (
    <div className={`rd${focus ? ' focus' : ''}${dragging ? ' dragging' : ''}`}>
      <div className="rd-room" />
      <div className="rd-lamp" />

      <div className="rd-tb">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Link href="/books" className="rd-back">
            {t('back')}
          </Link>
          <div>
            <div className="rd-title">{main.title}</div>
            <div className="rd-sub">{focus ? t('focusMode') : t('deskMode')}</div>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {canSync && (
            <button
              type="button"
              className={`rd-btn${marked ? ' on' : ''}`}
              title={t('bookmark')}
              onClick={addBookmark}
            >
              🔖
            </button>
          )}
          <button
            type="button"
            className={`rd-btn${focus ? ' on' : ''}`}
            onClick={() => setFocus((f) => !f)}
          >
            🎯 {t('focusBtn')}
          </button>
          <button
            type="button"
            className={`rd-btn${aiOpen ? ' on' : ''}`}
            onClick={() => setAiOpen((v) => !v)}
          >
            ✨ {t('aiBtn')}
          </button>
        </div>
      </div>

      <div className={`rd-stage${aiOpen ? ' px' : ''}`}>
        <div className="shelf">
          {order.slice(1).map((bi, si) => (
            <ShelfBook
              key={BOOKS[bi].id}
              book={BOOKS[bi]}
              spread={spreadOf[bi] ?? 0}
              label={t('bringDown')}
              isSource={dragging && drag?.from === si + 1}
              isHot={dragging && drag?.over === si + 1 && drag?.from !== si + 1}
              handlers={dragHandlers(si + 1)}
            />
          ))}
        </div>

        <div className="main-wrap">
          <div className="desk-pos">
            <div className="grip" {...dragHandlers(0)}>
              ⠿ {t('grip')}
            </div>
            <div
              className={`mdrop${dragging && drag?.from !== 0 ? ' armed' : ''}${
                dragging && drag?.over === 0 ? ' hot' : ''
              }`}
            >
              <span>{t('dropMain')}</span>
            </div>
            <button
              type="button"
              className="pgnav p"
              aria-label="previous"
              onClick={() => turnPage(-1)}
            >
              ‹
            </button>

            <div
              className={`spread${swapping ? ' swapping' : ''}${
                dragging && drag?.from === 0 ? ' dsrc' : ''
              }`}
              ref={spreadRef}
            >
              <div className="page l">
                <BigPage book={main} index={staticLeft} />
              </div>
              <div className="spine" />
              <div className="page r">
                <BigPage book={main} index={staticRight} />
              </div>

              {turn && (
                <div
                  className={`flipper live${turn.snap ? ' snap' : ''}`}
                  style={{
                    left: turn.dir > 0 ? 'auto' : 0,
                    right: turn.dir > 0 ? 0 : 'auto',
                    transformOrigin: turn.dir > 0 ? 'left center' : 'right center',
                    transform: `rotateY(${turn.dir > 0 ? -turn.angle : turn.angle}deg)`
                  }}
                >
                  <div className="fface a">
                    {faceA !== null && <BigPage book={main} index={faceA} />}
                    <div className="fshade" style={{opacity: shade * 0.9}} />
                  </div>
                  <div className="fface b">
                    {faceB !== null && faceB >= 0 && faceB < main.sp.length && (
                      <BigPage book={main} index={faceB} />
                    )}
                    <div className="fshade" style={{opacity: (1 - shade) * 0.55}} />
                  </div>
                </div>
              )}

              <div
                className="corner"
                onPointerDown={onCornerDown}
                onPointerMove={onCornerMove}
                onPointerUp={onCornerUp}
                onPointerCancel={onCornerUp}
              />
            </div>

            <button
              type="button"
              className="pgnav n"
              aria-label="next"
              onClick={() => turnPage(1)}
            >
              ›
            </button>

            <div className="prog">
              <div className="prog-t">{right + 1}</div>
              <div className="prog-bar">
                <div className="prog-fill" style={{width: `${progressPct}%`}} />
              </div>
              <div className="prog-t">{main.sp.length}</div>
            </div>
          </div>
        </div>
      </div>

      {paywall && !entitled && (
        <div className="rd-pay" role="dialog" aria-modal="true">
          <div className="rd-pay-card">
            <div className="rd-pay-t">{tPay('title')}</div>
            <p className="rd-pay-b">{tPay('body')}</p>
            <div className="rd-pay-btns">
              {main.price ? (
                <Link href={`/books/${main.id}`} className="rd-pay-buy">
                  {tDetail('buy')}
                </Link>
              ) : (
                <Link href="/#plans" className="rd-pay-buy">
                  {tPay('plans')}
                </Link>
              )}
              {main.price ? (
                <Link href="/#plans" className="rd-pay-alt">
                  {tPay('plans')}
                </Link>
              ) : null}
              <Link href="/redeem" className="rd-pay-alt">
                {tAcct('redeem')}
              </Link>
              {!signedIn && (
                <Link href="/auth/login" className="rd-pay-alt">
                  {tAuth('loginTitle')}
                </Link>
              )}
            </div>
            <button type="button" className="rd-pay-x" onClick={() => setPaywall(false)}>
              {tPay('close')}
            </button>
          </div>
        </div>
      )}
      <AiPanel open={aiOpen} order={order} spreadOf={spreadOf} />

      {dragging && dragBook && drag && (
        <div className="ghost" style={{left: drag.x, top: drag.y}}>
          <b>{dragBook.ic}</b>
          <i>{dragBook.title}</i>
          <s>{drag.from === 0 ? t('ghostLift') : t('ghostDrop')}</s>
        </div>
      )}

      <div className="rd-hint" style={hintHidden ? {display: 'none'} : undefined}>
        <span>
          💡{' '}
          {t.rich('hintPick', {
            b: (chunks) => <b>{chunks}</b>
          })}
        </span>
        <span style={{opacity: 0.4}}>·</span>
        <span>{t('hintCorner')}</span>
        <span style={{opacity: 0.4}}>·</span>
        <kbd>1</kbd>
        <kbd>2</kbd>
        <kbd>3</kbd>
        <kbd>←</kbd>
        <kbd>→</kbd>
      </div>
    </div>
  );
}
