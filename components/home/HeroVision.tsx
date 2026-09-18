'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';

// §9.4 — the hero carries the house philosophy in seven slides. Each is one
// headline, one line under it, and a picture behind it that says the same
// thing without words. Auto-advances, pauses on hover/focus and under
// reduced motion, and answers dots, arrows, arrow keys and swipes.
const SLIDES = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;
const INTERVAL_MS = 7000;

// Slides whose plate sits on the left. Kept here because the floating bar
// has to know: on these the logo and menu are over the photograph.
const LEFT_PLATE = new Set<string>(['s2', 's4', 's6']);

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

  // The floating bar is lit by whatever is under it, and on these slides that
  // changes side. The bar is not inside this section — it is a sibling of the
  // page wrapper — so the current side is published on <html> for it to read.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.heroPlate = LEFT_PLATE.has(SLIDES[i]) ? 'left' : 'right';
    return () => {
      delete root.dataset.heroPlate;
    };
  }, [i]);

  return (
    <section
      className="vh"
      // Each slide lays itself out differently — which side the plate takes,
      // how wide it is, where the copy sits vertically — so seven slides in
      // a row do not read as one frozen composition.
      data-l={SLIDES[i]}
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
      <div className="vh-photo" aria-hidden="true">
        {SLIDES.map((slide, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide}
            src={`/hero/${slide}.webp`}
            alt=""
            data-slide={slide}
            className={n === i ? 'on' : undefined}
            loading={n === 0 ? 'eager' : 'lazy'}
            fetchPriority={n === 0 ? 'high' : undefined}
          />
        ))}
        <span className="vh-scrim" />
      </div>

      <div className="vh-in">
        {/* One grid cell holds all seven, so a slide change moves nothing. */}
        <div className="vh-stage">
          {SLIDES.map((s, n) => (
            <div
              key={s}
              className={`vh-slide${n === i ? ' on' : ''}`}
              aria-hidden={n !== i}
              role="group"
              aria-roledescription="slide"
            >
              <h1 className="vh-t">
                <Multiline text={t.raw(`${s}.t`) as string} />
              </h1>
              <p className="vh-d">{t(`${s}.d`)}</p>
            </div>
          ))}
        </div>

        <div className="vh-cta">
          <Link href="/books" className="btn-gold">
            {t('ctaBooks')}
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
