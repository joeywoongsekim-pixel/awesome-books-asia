'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';

// §9.4 — the hero carries the house philosophy in seven slides: the vision,
// why reading still matters when machines answer, who the books are for, how
// they are made, the expertise behind them, the reach beyond wealthy markets,
// and the promise about access. Auto-advances,
// pauses on hover/focus and under reduced motion, and answers dots, arrows,
// arrow keys and swipes.
const SLIDES = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;
const INTERVAL_MS = 7000;

export default function HeroVision() {
  const t = useTranslations('vision');
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
      className="vh"
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
      <div className="vh-in">
        {SLIDES.map((s, n) => (
          <div
            key={s}
            className={`vh-slide${n === i ? ' on' : ''}`}
            aria-hidden={n !== i}
            role="group"
            aria-roledescription="slide"
          >
            <div className="vh-k">{t(`${s}.k`)}</div>
            <h1 className="vh-t">
              <Multiline text={t.raw(`${s}.t`) as string} />
            </h1>
            <p className="vh-d">{t(`${s}.d`)}</p>
          </div>
        ))}

        <div className="vh-cta">
          <Link href="/books" className="btn-gold">
            {t('ctaBooks')}
          </Link>
          <Link href="/read/ai-bible" className="btn-goldo">
            {t('ctaSample')}
          </Link>
        </div>

        <div className="vh-nav">
          <button type="button" onClick={() => go(i - 1)} aria-label={t('prev')}>
            ‹
          </button>
          <div className="vh-dots">
            {SLIDES.map((s, n) => (
              <button
                key={s}
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
