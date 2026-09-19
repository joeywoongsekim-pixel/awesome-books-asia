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

/* Two ways out, and they mean different things.

   Close puts it away for this visit. It is kept in sessionStorage, so it
   does not come back while someone is reading their way around the site
   and does come back next time — which is the point of a popup that only
   runs for six days.

   Not today puts it away until tomorrow, and is kept in localStorage as
   the local date it was pressed on. A date string rather than a timestamp
   because "today" is the reader's calendar day, and comparing two YYYY-MM-DD
   strings needs no timezone arithmetic to get wrong.

   Every read and write is wrapped: in a private window or with site data
   blocked these throw rather than return null, and a popup is not worth an
   exception on first paint. If storage is unavailable the popup simply
   shows again next time, which is the harmless failure. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function alreadyDismissed() {
  try {
    if (window.sessionStorage.getItem(KEY) === 'visit') return true;
  } catch {
    /* fall through to the day check */
  }
  try {
    return window.localStorage.getItem(KEY) === today();
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
      window.sessionStorage.setItem(KEY, 'visit');
    } catch {
      /* it just does not persist; the popup is still gone for now */
    }
    lastFocus.current?.focus?.();
  }, []);

  const hideToday = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(KEY, today());
    } catch {
      /* same: gone now, back next time rather than an error */
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
          {editions.map(({book, link, title, cover}) => (
            <li key={`${book.id}-${link.url}`} className="pmo-b">
              <Link href={`/books/${book.id}`} className="pmo-b-cv" onClick={close}>
                {cover ? (
                  <BookCover book={{...book, img: cover}} />
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
                  Amazon.in
                  {link.ku ? (
                    <em>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/brand/kindle-unlimited.svg" alt={t('ku')} />
                    </em>
                  ) : null}
                  {link.price ? <i>{link.price}</i> : null}
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* The chips point at the Indian storefront, because that is the
            listing the ₹ price belongs to. The edition is not confined to
            it — the same ASIN sells on every Amazon store — so the list
            says so rather than letting the .in links imply otherwise. */}
        <p className="pmo-note">{t('worldwide')}</p>

        <div className="pmo-acts">
          <button type="button" className="pmo-btn" onClick={close}>
            {t('close')}
          </button>
          <button type="button" className="pmo-btn pmo-btn-quiet" onClick={hideToday}>
            {t('hideToday')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
