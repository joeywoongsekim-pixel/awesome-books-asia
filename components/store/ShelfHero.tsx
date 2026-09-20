'use client';

/*
 * M24 — the illustrated shelf (C안 of the launch redesign).
 * A flat, warm bookcase: one shelf row per category, every published
 * edition standing (or lying) as a colored spine. Clicking a spine pulls
 * the book out over a dimmed backdrop with its story, edition facts and
 * the real retailer buy links. Pure CSS — no 3D, launch-safe.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {SHELF, tri, type ShelfEdition} from '../../lib/shelf';
import {EDITIONS} from '../../lib/retailers';
import {BOOKS, CAT_KEY} from '../../lib/books';

export default function ShelfHero() {
  const locale = useLocale();
  const t = useTranslations('store');
  const [open, setOpen] = useState<ShelfEdition | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const pick = (ed: ShelfEdition, el: HTMLElement) => {
    lastFocus.current = el;
    setOpen(ed);
  };

  const authorOf = (slug: string) => BOOKS.find((b) => b.id === slug)?.author ?? '';
  const buyLinks = (ed: ShelfEdition) => (EDITIONS[ed.slug] ?? []).filter((e) => e.lang === ed.lang);

  return (
    <section className="shf" aria-label={t('shelfTitle')}>
      <div className="shf-frame">
        {SHELF.map((row) => (
          <div className="shf-row" key={row.cat}>
            <div
              className={
                row.items.length && row.items.every((ed) => ed.flat)
                  ? 'shf-books shf-books-pile'
                  : 'shf-books'
              }
            >
              {/* Books that lie down rather than stand go in a pile above
                  the shelf. Which those are is a property of the book, not
                  of the subject it is filed under. */}
              {row.items.some((ed) => ed.flat) ? (
                <div className="shf-pile">
                  {row.items
                    .filter((ed) => ed.flat)
                    .map((ed) => (
                      <button
                        key={ed.slug}
                        type="button"
                        className="shf-flat"
                        style={{width: ed.w, height: ed.h, background: ed.bg, color: ed.fg}}
                        onClick={(e) => pick(ed, e.currentTarget)}
                      >
                        {ed.title}
                      </button>
                    ))}
                </div>
              ) : null}
              {row.items
                .filter((ed) => !ed.flat)
                .map((ed) => (
                  <button
                    key={ed.slug}
                    type="button"
                    className="shf-sp"
                    style={{
                      width: ed.w,
                      height: ed.h,
                      background: ed.bg,
                      color: ed.fg,
                      transform: ed.tilt ? `rotate(${ed.tilt}deg)` : undefined
                    }}
                    onClick={(e) => pick(ed, e.currentTarget)}
                  >
                    {ed.title}
                  </button>
                ))}
              {Array.from({length: row.ghosts}, (_, i) => (
                <span className="shf-sp shf-ghost" key={`g${i}`} style={{height: 176 + ((i * 7) % 3) * 8}}>
                  {t('shelfSoon')}
                </span>
              ))}
            </div>
            <div className="shf-board">
              <span className="shf-plate">{t(CAT_KEY[row.cat])}</span>
            </div>
          </div>
        ))}
      </div>

      {open
        ? createPortal(
            <div className="shf-modal" role="dialog" aria-modal="true" aria-label={open.title}>
              <div className="shf-dim" onClick={close} aria-hidden="true" />
              <div className="shf-pop">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="shf-cover" src={open.cover} alt="" />
                <div className="shf-panel" ref={panelRef} tabIndex={-1}>
                  <button type="button" className="shf-x" onClick={close} aria-label={t('shelfClose')}>
                    ×
                  </button>
                  <p className="shf-kick">
                    {t(CAT_KEY[SHELF.find((r) => r.items.includes(open))?.cat ?? 'BIZ'])} — {open.lang}
                  </p>
                  <h3 className="shf-title">{open.title}</h3>
                  <p className="shf-author">{authorOf(open.slug)}</p>
                  <p className="shf-desc">{tri(locale, open.desc)}</p>
                  <div className="shf-buy">
                    {buyLinks(open).map((e, i) => (
                      <a key={i} href={e.url} target="_blank" rel="noopener noreferrer">
                        {e.store} · {e.format === 'print' ? t('fmtPrint') : 'eBook'}
                        {e.note ? ` · ${e.note}` : ''}
                        {e.price ? ` · ${e.price}` : ''} ↗
                      </a>
                    ))}
                  </div>
                  <Link className="shf-more" href={`/books/${open.slug}`}>
                    {t('shelfDetail')} →
                  </Link>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
