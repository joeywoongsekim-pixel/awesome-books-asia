import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS, CATEGORIES, CAT_KEY, type Category} from '../../lib/books';
import Reveal from '../Reveal';

// §9.6 — ways into the shelf, under a heading of their own. A photograph,
// then the name under it: the label never sits on the picture. Twelve
// subjects are defined; a tile is only offered for the ones that have a
// book behind them, so none of them leads to an empty shelf.
const PHOTO: Partial<Record<Category, string>> = {
  AI: 's2',
  ECON: 's1',
  BIZ: 's5',
  PICTURE: 's4',
  ELEM: 's3',
  SECOND: 's6',
  HIGHER: 's7',
  FICTION: 's8'
};

export default function Categories() {
  const t = useTranslations('store');
  const stocked = new Set(BOOKS.map((b) => b.cat));
  const tiles = CATEGORIES.filter((c) => stocked.has(c) && PHOTO[c]);

  return (
    <section className="sec sec-tight sec-cats">
      <div className="sec-in">
        <Reveal>
          <h2 className="cats-h">{t('catsTitle')}</h2>
          <div className="cats">
            {tiles.map((c) => (
              <Link href="/books" className="cat" key={c}>
                <span className="cat-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/hero/${PHOTO[c]}.webp`} alt="" loading="lazy" />
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
