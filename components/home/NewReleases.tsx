'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS} from '../../lib/books';
import {blurbOf} from '../../lib/blurbs';
import {fromPrice} from '../../lib/retailers';
import BookCover from '../BookCover';

// §9.5 — the new-release band directly under the hero: one book per slide,
// cover beside its story, price and the two real actions. Newest first.
const INTERVAL_MS = 8000;

export default function NewReleases() {
  const t = useTranslations('newrel');
  const tDetail = useTranslations('detail');
  const tBooks = useTranslations('books');
  const locale = useLocale();

  // Newest by publication date; regional twins of the same work are skipped
  // so the band shows four distinct titles.
  const seen = new Set<string>();
  const slides = [...BOOKS]
    .sort((a, b) => b.published.localeCompare(a.published))
    .filter((b) => {
      const work = b.id.replace(/-(uk|in)$/, '');
      if (seen.has(work)) return false;
      seen.add(work);
      return true;
    })
    .slice(0, 4);

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, i, slides.length]);

  return (
    <section
      className="nr"
      aria-roledescription="carousel"
      aria-label={t('title')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touch.current = null;
      }}
    >
      <div className="nr-in">
        <div className="nr-head">
          <div className="eyebrow">{t('eyebrow')}</div>
          <h2 className="h2">{t('title')}</h2>
        </div>

        <div className="nr-stage">
          <button type="button" className="nr-arw l" onClick={() => go(i - 1)} aria-label={t('prev')}>
            ‹
          </button>

          {slides.map((book, n) => {
            const price = fromPrice(book.id, locale);
            return (
              <div
                key={book.id}
                className={`nr-slide${n === i ? ' on' : ''}`}
                aria-hidden={n !== i}
                role="group"
                aria-roledescription="slide"
              >
                <Link href={`/books/${book.id}`} className="nr-cover" tabIndex={n === i ? 0 : -1}>
                  <BookCover book={book} />
                  {book.isNew && <span className="nr-badge">{tBooks('new')}</span>}
                </Link>
                <div className="nr-txt">
                  <div className="nr-cat">{book.catLabel}</div>
                  <h3 className="nr-t">{book.title}</h3>
                  <div className="nr-a">{book.author}</div>
                  <p className="nr-d">{blurbOf(book, locale)}</p>
                  <div className="nr-foot">
                    {price && (
                      <span className="nr-p">
                        {price}
                        <small>{tDetail('priceNote')}</small>
                      </span>
                    )}
                    <Link
                      href={`/books/${book.id}`}
                      className="btn-g"
                      tabIndex={n === i ? 0 : -1}
                    >
                      {tDetail('buy')}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          <button type="button" className="nr-arw r" onClick={() => go(i + 1)} aria-label={t('next')}>
            ›
          </button>
        </div>

        <div className="nr-dots">
          {slides.map((b, n) => (
            <button
              key={b.id}
              type="button"
              className={n === i ? 'on' : undefined}
              aria-label={b.title}
              aria-current={n === i}
              onClick={() => go(n)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
