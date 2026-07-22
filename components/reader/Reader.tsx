'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {BOOKS, type Book} from '../../lib/books';
import BigPage, {ctxOf} from './BigPage';

const SWAP_MS = 260; // matches .spread opacity transition
const SNAP_MS = 500; // matches .flipper.snap transform transition
const COMMIT_DEG = 78; // release past this angle commits the turn

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');

type Turn = {
  dir: 1 | -1;
  angle: number;
  snap: boolean;
};

function ShelfBook({
  book,
  spread,
  label,
  onTap
}: {
  book: Book;
  spread: number;
  label: string;
  onTap: () => void;
}) {
  // Shelf shows the book's current right-hand page, cropped and faded at the
  // bottom (never scaled down — ~10px type stays readable).
  const pi = Math.min(spread * 2 + 1, book.sp.length - 1);
  const p = book.sp[pi] ?? book.sp[0];
  const c = ctxOf(book, pi);

  return (
    <div className="sbk" onClick={onTap}>
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

export default function Reader({initialIndex}: {initialIndex: number}) {
  const t = useTranslations('reader');
  const router = useRouter();

  const [order, setOrder] = useState<number[]>(() => [
    initialIndex,
    ...BOOKS.map((_, i) => i)
      .filter((i) => i !== initialIndex)
      .slice(0, 3)
  ]);
  // Reading position per book (index into spreads), reset when the desk opens.
  const [spreadOf, setSpreadOf] = useState<Record<number, number>>({});
  const [swapping, setSwapping] = useState(false);
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [hintHidden, setHintHidden] = useState(false);

  const spreadRef = useRef<HTMLDivElement>(null);
  const draggingCorner = useRef(false);

  const main: Book = BOOKS[order[0]];
  const spread = spreadOf[order[0]] ?? 0;
  const left = spread * 2;
  const right = left + 1;
  const maxSpread = Math.ceil(main.sp.length / 2) - 1;

  const canGo = (dir: 1 | -1) => (dir > 0 ? spread < maxSpread : spread > 0);

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
    if (busy || turn || !canGo(dir)) return;
    setTurn({dir, angle: 0, snap: false});
    // Two frames so the flipper paints at 0° before the snap transition runs.
    requestAnimationFrame(() => requestAnimationFrame(() => commit(dir)));
  }

  // Corner drag — pointer events so touch works too (the prototype was
  // mouse-only; that is fixed here).
  function onCornerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy || turn || !canGo(1)) return;
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
    <div className={`rd${focus ? ' focus' : ''}`}>
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
          <button
            type="button"
            className={`rd-btn${focus ? ' on' : ''}`}
            onClick={() => setFocus((f) => !f)}
          >
            🎯 {t('focusBtn')}
          </button>
          <button type="button" className="rd-btn">
            ✨ {t('aiBtn')}
          </button>
        </div>
      </div>

      <div className="rd-stage">
        <div className="shelf">
          {order.slice(1).map((bi, si) => (
            <ShelfBook
              key={BOOKS[bi].id}
              book={BOOKS[bi]}
              spread={spreadOf[bi] ?? 0}
              label={t('bringDown')}
              onTap={() => swapSlots(0, si + 1)}
            />
          ))}
        </div>

        <div className="main-wrap">
          <div className="desk-pos">
            <button
              type="button"
              className="pgnav p"
              aria-label="previous"
              onClick={() => turnPage(-1)}
            >
              ‹
            </button>

            <div className={`spread${swapping ? ' swapping' : ''}`} ref={spreadRef}>
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
