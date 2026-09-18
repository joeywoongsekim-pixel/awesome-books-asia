import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {CATEGORIES, CAT_KEY} from '../../lib/books';
import Reveal from '../Reveal';

// §9.6 — the house's twelve subjects, four across and three down, under a
// heading of their own. A photograph, then the name under it: the label
// never sits on the picture. Every subject is shown whether or not a book
// stands in it yet — this is the shape of the shelf, not its stock.
export default function Categories() {
  const t = useTranslations('store');

  return (
    <section className="sec sec-tight sec-cats">
      <div className="sec-in">
        <Reveal>
          <h2 className="cats-h">{t('catsTitle')}</h2>
          <div className="cats">
            {CATEGORIES.map((c) => (
              <Link href="/books" className="cat" key={c}>
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
