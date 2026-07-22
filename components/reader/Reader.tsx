'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS, type Book} from '../../lib/books';
import BigPage, {ctxOf} from './BigPage';

const SWAP_MS = 260; // matches .spread opacity transition

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');

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

  const [order, setOrder] = useState<number[]>(() => [
    initialIndex,
    ...BOOKS.map((_, i) => i)
      .filter((i) => i !== initialIndex)
      .slice(0, 3)
  ]);
  // Reading position per book (index into spreads), reset when the desk opens.
  // The setter arrives with the page-turn stage.
  const [spreadOf] = useState<Record<number, number>>({});
  const [swapping, setSwapping] = useState(false);
  const [focus, setFocus] = useState(false);
  const [busy, setBusy] = useState(false);

  const main: Book = BOOKS[order[0]];
  const spread = spreadOf[order[0]] ?? 0;
  const left = spread * 2;
  const right = left + 1;

  function swapSlots(a: number, b: number) {
    if (a === b || busy) return;
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
            <div className={`spread${swapping ? ' swapping' : ''}`}>
              <div className="page l">
                <BigPage book={main} index={left} />
              </div>
              <div className="spine" />
              <div className="page r">
                <BigPage book={main} index={right} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
