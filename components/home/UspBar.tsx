import {useTranslations} from 'next-intl';

// §9.10 — the strip above the footer. It used to carry four claims about
// the house and end with SEOUL — TOKYO; it now names the shops that sell
// the books, and nothing else.
//
// A ticker rather than a row: four names set across a 1280 line read as a
// caption, four names sliding past read as a shelf that keeps going. It
// runs leftward without pausing and has no seam — the track holds two
// identical runs and slides by exactly one of them before starting over.

/** Repeats per run — enough that a single run overflows the widest screen. */
const REPEATS = 6;

export default function UspBar() {
  const t = useTranslations('home.stores');
  const stores = [t('amazon'), t('kyobo'), t('yes24'), t('aladin')];
  const run = Array.from({length: REPEATS}, () => stores).flat();

  return (
    <div className="usp">
      {/* The four names once, for a screen reader; the moving copy is
          scenery and repeats itself too often to be read aloud. */}
      <ul className="usp-sr">
        {stores.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <div className="usp-track" aria-hidden="true">
        {[0, 1].map((n) => (
          <ul className="usp-run" key={n}>
            {run.map((name, i) => (
              <li key={`${n}-${i}`}>{name}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
