'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {
  BESTSELLERS,
  COMING_SOON,
  NEW_RELEASES,
  coverFor,
  BOOKS,
  type Pick
} from '../../lib/books';
import {priceForLang} from '../../lib/retailers';

// The shelf under the hero: three tabs, four books to a row, each cover
// standing as an object rather than lying flat as a card.
//
// A pick names a book and, where it matters, which language edition of it —
// so the same title can appear twice with its own cover and its own price.
// Its own title shows only where the house has given us one; otherwise the
// base title carries an edition label rather than a translated title being
// invented here. All three lists live in lib/books.ts, and a tab with
// nothing in it is not rendered, so the row never shows a guess.
const byId = (id: string) => BOOKS.find((b) => b.id === id);

export default function Shelf() {
  const t = useTranslations('shelf');

  const tabs = (
    [
      {key: 'new', picks: NEW_RELEASES},
      {key: 'best', picks: BESTSELLERS},
      {key: 'soon', picks: COMING_SOON}
    ] as const
  )
    .map((tab) => ({
      ...tab,
      rows: tab.picks
        .map((p: Pick) => ({pick: p, book: byId(p.id)}))
        .filter((r) => r.book)
    }))
    .filter((tab) => tab.rows.length > 0);

  const [active, setActive] = useState(0);
  const shown = tabs[Math.min(active, tabs.length - 1)];
  if (!shown) return null;

  return (
    <section className="nsh">
      <div className="nsh-in">
        {tabs.length > 1 ? (
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
        ) : (
          <h2 className="nsh-one">{t(shown.key)}</h2>
        )}

        <div className="nsh-row">
          {shown.rows.map(({pick, book}, n) => {
            const b = book!;
            const price = priceForLang(b.id, pick.lang);
            const cover = coverFor(b.id, pick.lang);
            return (
              <Link href={`/books/${b.id}`} className="nsh-bk" key={`${b.id}-${pick.lang ?? n}`}>
                <span className="nsh-3d">
                  <span className="nsh-blk">
                    <span className="nsh-spine" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover ?? '/og.png'} alt="" loading="lazy" />
                  </span>
                </span>
                <span className="nsh-im">{b.author}</span>
                <span className="nsh-t">
                  {pick.title ?? b.title}
                  {!pick.title && pick.lang && (
                    <span className="nsh-ed"> · {t(`ed${pick.lang}`)}</span>
                  )}
                </span>
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
