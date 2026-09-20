import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {CATEGORIES, CAT_KEY} from '../../lib/books';
import Reveal from '../Reveal';

// §9.6 — the house's subjects, under a heading of their own. A photograph,
// then the name under it: the label never sits on the picture.
//
// All twelve, stocked or not: this is the shape of the house's shelf, not
// a stock list, and a publisher with three books still publishes in twelve
// subjects. M164 cut it to the five with a book behind them because the
// tiles all went to /books unfiltered, so 스포츠 landed a reader on a shelf
// of AI and economics and the two pages read as different catalogues.
// That link is fixed rather than the shelf: a tile now carries its subject
// (/books?cat=SPORT), the store opens on it, and a subject with nothing in
// it yet says so instead of showing somebody else's books.
export default function Categories() {
  const t = useTranslations('store');

  return (
    <section className="sec sec-tight sec-cats">
      <div className="sec-in">
        <Reveal>
          <h2 className="cats-h">{t('catsTitle')}</h2>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <Link href={{pathname: '/books', query: {cat: c}}} className="cat" key={c}>
                <span className="cat-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/cats/${c.toLowerCase()}.webp`} alt="" loading="lazy" />
                </span>
                <span className="cat-t">{t(CAT_KEY[c])}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
