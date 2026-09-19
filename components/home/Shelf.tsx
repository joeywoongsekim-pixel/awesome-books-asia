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
  type Forthcoming,
  type Pick
} from '../../lib/books';

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

  /* 신간 and 베스트셀러 point at the catalogue; 커밍순 cannot, because the
     books are not written. The two shapes are kept apart here rather than
     forced into one, so a forthcoming title never has to pretend it has a
     cover, an author or a page to link to. */
  const shelved = (picks: Pick[]) =>
    picks.map((p) => ({pick: p, book: byId(p.id)})).filter((r) => r.book);

  const tabs = [
    {key: 'new' as const, rows: shelved(NEW_RELEASES), soon: [] as Forthcoming[]},
    {key: 'best' as const, rows: shelved(BESTSELLERS), soon: [] as Forthcoming[]},
    {key: 'soon' as const, rows: [] as ReturnType<typeof shelved>, soon: COMING_SOON}
  ].filter((tab) => tab.rows.length + tab.soon.length > 0);

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
              </Link>
            );
          })}

          {/* A blank jacket with the title on it. Not a link: there is
              nothing to open yet, and a dead page is worse than none. */}
          {shown.soon.map((f: Forthcoming) => (
            <span className="nsh-bk nsh-bk-soon" key={f.title}>
              <span className="nsh-3d">
                <span className="nsh-blk">
                  <span className="nsh-spine" aria-hidden="true" />
                  <span className="nsh-soon">
                    <i>Awesome Books Asia</i>
                    <b>{f.title}</b>
                  </span>
                </span>
              </span>
              <span className="nsh-im">{f.author ?? '\u00a0'}</span>
              <span className="nsh-t">{f.title}</span>
            </span>
          ))}
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
