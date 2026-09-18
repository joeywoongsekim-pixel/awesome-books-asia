'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';

// The hero: one book at a time, its photograph full-bleed behind a small
// category label, the title, and a single line about it. Auto-advances,
// pauses on hover/focus and under reduced motion, and answers the dots,
// the arrows, arrow keys and swipes.
const SLIDES = [
  {id: 'ai-answer', img: '1'},
  {id: 'quantum-econ', img: '2'},
  {id: 'ai-bible', img: '3'},
  {id: 'isekai', img: '4'},
  {id: 'ninja-cat', img: '5'}
] as const;
const INTERVAL_MS = 7000;

export default function BookHero() {
  const t = useTranslations('bookHero');
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);

  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, i]);

  return (
    <section
      className="bh"
      aria-roledescription="carousel"
      aria-label={t('label')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(i + 1);
        if (e.key === 'ArrowLeft') go(i - 1);
      }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touch.current = null;
      }}
      tabIndex={-1}
    >
      <div className="bh-art" aria-hidden="true">
        {SLIDES.map((s, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.id}
            src={`/bookhero/${s.img}.webp`}
            alt=""
            data-slide={s.id}
            className={n === i ? 'on' : undefined}
            loading={n === 0 ? 'eager' : 'lazy'}
            fetchPriority={n === 0 ? 'high' : undefined}
          />
        ))}
        <span className="bh-scrim" />
      </div>

      <div className="bh-in">
        <div className="bh-stage">
          {SLIDES.map((s, n) => (
            <Link
              key={s.id}
              href={`/books/${s.id}`}
              className={`bh-slide${n === i ? ' on' : ''}`}
              aria-hidden={n !== i}
              tabIndex={n === i ? undefined : -1}
            >
              <span className="bh-k">{t(`${s.id}.k`)}</span>
              <span className="bh-t">{t(`${s.id}.t`)}</span>
              <span className="bh-d">{t(`${s.id}.d`)}</span>
            </Link>
          ))}
        </div>

        <div className="bh-nav">
          <button type="button" onClick={() => go(i - 1)} aria-label={t('prev')}>
            ‹
          </button>
          <div className="bh-dots">
            {SLIDES.map((s, n) => (
              <button
                key={s.id}
                type="button"
                className={n === i ? 'on' : undefined}
                aria-label={`${n + 1}`}
                aria-current={n === i}
                onClick={() => go(n)}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(i + 1)} aria-label={t('next')}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
