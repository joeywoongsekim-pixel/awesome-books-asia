import {useTranslations} from 'next-intl';

// §9.10 — the strip above the footer: the shops that sell the books, as
// their own marks rather than as set names, sliding leftward without end.
// A ticker because four or five names on one 1280 line read as a caption,
// and the same marks sliding past read as a shelf that carries on off the
// edge of the screen.
//
// Every file here is the shop's own logo, taken from the shop's own site.
// The heights are not uniform and should not be: these marks are drawn to
// different proportions — Kindle Unlimited is a long word on a tight box,
// the Aladin lamp is a symbol on a squarer one — so each is set to the
// size at which it reads the same weight as the others, not to the same
// number of pixels.
const STORES = [
  {key: 'amazon', src: '/brand/stores/amazon.svg', h: 19},
  {key: 'ku', src: '/brand/kindle-unlimited.svg', h: 15},
  {key: 'kyobo', src: '/brand/stores/kyobo.svg', h: 26},
  {key: 'yes24', src: '/brand/stores/yes24.png', h: 20},
  {key: 'aladin', src: '/brand/stores/aladin.png', h: 24}
] as const;

/** Repeats per run — enough that a single run overflows the widest screen. */
const REPEATS = 5;

export default function UspBar() {
  const t = useTranslations('home.stores');
  const run = Array.from({length: REPEATS}, () => STORES).flat();

  return (
    <div className="usp">
      {/* The shops named once, for a screen reader; the moving copy is
          scenery and repeats itself far too often to be read aloud. */}
      <ul className="usp-sr">
        {STORES.map(({key}) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      {/* Two identical runs; the track travels exactly one run's width and
          starts over, so the loop has no seam. */}
      <div className="usp-track" aria-hidden="true">
        {[0, 1].map((n) => (
          <ul className="usp-run" key={n}>
            {run.map(({key, src, h}, i) => (
              <li key={`${n}-${i}`}>
                {/* Not lazy: the copies waiting off the right edge are the
                    ones about to slide in, and there are only five files
                    behind all of these tags. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" height={h} style={{height: h}} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
