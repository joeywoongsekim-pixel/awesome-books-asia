'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BESTSELLERS, COMING_SOON, byId, newestBooks, type Book} from '../../lib/books';
import {fromPrice} from '../../lib/retailers';

// The shelf under the hero: three tabs, four books to a row, each cover
// standing as an object rather than lying flat as a card.
//
// 신간 comes from the catalogue's own publication dates. The other two lists
// live in lib/books.ts because nothing here can derive them — there is no
// sales data and no forthcoming titles — and a tab with nothing in it is
// not rendered, so the row never shows a guess.
const PER_TAB = 4;

export default function Shelf() {
  const t = useTranslations('shelf');
  const locale = useLocale();

  const tabs = (
    [
      {key: 'new', books: newestBooks(PER_TAB)},
      {key: 'best', books: BESTSELLERS.map(byId).filter(Boolean) as Book[]},
      {key: 'soon', books: COMING_SOON.map(byId).filter(Boolean) as Book[]}
    ] as const
  ).filter((tab) => tab.books.length > 0);

  const [active, setActive] = useState(0);
  const shown = tabs[Math.min(active, tabs.length - 1)];
  if (!shown) return null;

  return (
    <section className="nsh">
      <div className="nsh-in">
        {tabs.length > 1 && (
          <div className="nsh-tabs" role="tablist">
            {tabs.map((tab, n) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={n === active}
                className={n === active ? 'on' : undefined}
                onClick={() => setActive(n)}
              >
                {t(tab.key)}
              </button>
            ))}
          </div>
        )}
        {tabs.length === 1 && <h2 className="nsh-one">{t(shown.key)}</h2>}

        <div className="nsh-row">
          {shown.books.map((b) => {
            const price = fromPrice(b.id, locale);
            return (
              <Link href={`/books/${b.id}`} className="nsh-bk" key={b.id}>
                <span className="nsh-3d">
                  <span className="nsh-blk">
                    <span className="nsh-spine" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.img ?? '/og.png'} alt="" loading="lazy" />
                  </span>
                </span>
                <span className="nsh-im">{b.author}</span>
                <span className="nsh-t">{b.title}</span>
                {price && <span className="nsh-p">{price}</span>}
              </Link>
            );
          })}
        </div>

        <div className="nsh-all">
          <Link href="/books" className="nsh-btn">
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}
