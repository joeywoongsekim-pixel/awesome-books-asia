'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import BookCover, {seriesNo} from './BookCover';
import {PROMO, indiaEditions, promoIsLive} from '../lib/promo';

// M101 — the renewal / India launch popup. It runs to the close of
// 24 September (see lib/promo.ts) and then stops appearing on its own,
// with no deploy needed to retire it.
const KEY = `aba.promo.${PROMO.id}`;

function alreadyDismissed() {
  // Private windows and blocked site data make this throw rather than
  // return null, and a popup is not worth an exception on first paint.
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export default function PromoPopup() {
  const t = useTranslations('promo');
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const editions = indiaEditions();

  // The window is read on mount, never during render: these pages are
  // prerendered, and a server that decided this would bake one answer into
  // the HTML for the life of the deploy.
  useEffect(() => {
    if (!promoIsLive() || alreadyDismissed() || editions.length === 0) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(id);
  }, [editions.length]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* dismissal just does not persist; the popup is still gone for now */
    }
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div className="pmo-wrap" onClick={close}>
      <div
        className="pmo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pmo-h"
        tabIndex={-1}
        ref={panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pmo-x" onClick={close} aria-label={t('close')}>
          ×
        </button>

        <p className="eyebrow pmo-kick">{t('kicker')}</p>
        <h2 id="pmo-h" className="pmo-h">
          {t('title')}
        </h2>
        <p className="pmo-sub">{t('sub')}</p>

        <p className="pmo-lead">{t('lead')}</p>

        <ul className="pmo-books">
          {editions.map(({book, link, title, coverFits}) => (
            <li key={`${book.id}-${link.url}`} className="pmo-b">
              <Link href={`/books/${book.id}`} className="pmo-b-cv" onClick={close}>
                {coverFits ? (
                  <BookCover book={book} />
                ) : (
                  /* BookCover's typographic face wants about 200px and
                     clips to nonsense in a 74px column, so the card that
                     has no cover of its own for this edition gets a plain
                     brand tile instead. It reads as a placeholder, which
                     is what it is — an English cover is still to come. */
                  <span className="pmo-b-mini" aria-hidden="true">
                    <i>Awesome Books Asia</i>
                    <b>{seriesNo(book)}</b>
                  </span>
                )}
              </Link>
              <div className="pmo-b-t">
                <Link href={`/books/${book.id}`} className="pmo-b-n" onClick={close}>
                  {title}
                </Link>
                <span className="pmo-b-a">{book.author}</span>
                <a
                  className="pmo-b-buy"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Amazon.in{link.price ? <i>{link.price}</i> : null}
                </a>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/books" className="pmo-cta" onClick={close}>
          {t('cta')}
        </Link>
      </div>
    </div>,
    document.body
  );
}
