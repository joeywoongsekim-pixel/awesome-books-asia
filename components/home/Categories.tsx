import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS, CATEGORIES, CAT_KEY, catsOf} from '../../lib/books';
import Reveal from '../Reveal';

// §9.6 — the house's subjects, under a heading of their own. A photograph,
// then the name under it: the label never sits on the picture.
//
// It used to show all twelve subjects whether or not a book stood in one,
// on the reasoning that this is the shape of the shelf rather than its
// stock. That was the wrong call. Every tile went to /books unfiltered, so
// 스포츠 and 여행 — which the store has no chip for and no book in — took a
// reader to a shelf of AI and economics, and the two pages read as
// different catalogues. The shelf now shows what the store shows, and a
// tile lands on that subject rather than beside it.
export default function Categories() {
  const t = useTranslations('store');
  const stocked = new Set(BOOKS.flatMap(catsOf));

  return (
    <section className="sec sec-tight sec-cats">
      <div className="sec-in">
        <Reveal>
          <h2 className="cats-h">{t('catsTitle')}</h2>
          <div className="cats">
            {CATEGORIES.filter((c) => stocked.has(c)).map((c) => (
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
