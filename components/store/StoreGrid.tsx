'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {BOOKS, CATEGORIES, CAT_KEY, catsOf, type Category, type Lang} from '../../lib/books';
import StoreCard from './StoreCard';
import ShelfHero from './ShelfHero';

type CatFilter = 'all' | Category;
type LangFilter = 'all' | Lang;

export default function StoreGrid() {
  const t = useTranslations('store');
  /* A subject tile on the landing page links here with ?cat=ECON, so the
     store opens on what was clicked rather than on everything. An unknown
     or absent subject is simply 'all'. */
  const asked = useSearchParams().get('cat');
  const [cat, setCat] = useState<CatFilter>(
    asked && (CATEGORIES as string[]).includes(asked) ? (asked as Category) : 'all'
  );
  const [lang, setLang] = useState<LangFilter>('all');

  // A book answers to every subject it carries, not just the one it
  // stands under on the shelf.
  const list = BOOKS.filter(
    (b) =>
      (cat === 'all' || catsOf(b).includes(cat)) && (lang === 'all' || b.langs.includes(lang))
  );

  // Twelve subjects are defined; a chip is only offered for the ones that
  // have a book behind them, so the filter never leads to an empty shelf.
  const stocked = new Set(BOOKS.flatMap(catsOf));
  const cats: {key: CatFilter; label: string}[] = [
    {key: 'all', label: t('all')},
    ...CATEGORIES.filter((c) => stocked.has(c)).map((c) => ({
      key: c as CatFilter,
      label: t(CAT_KEY[c])
    }))
  ];
  const langs: {key: LangFilter; label: string}[] = [
    {key: 'all', label: t('any')},
    {key: 'EN', label: 'EN'},
    {key: 'KO', label: 'KO'},
    {key: 'JA', label: 'JA'}
  ];

  return (
    <>
      <div className="store-hero">
        <div className="eyebrow">{t('eyebrow')}</div>
        <h1 className="h2" style={{fontSize: 'clamp(32px,4.4vw,50px)'}}>
          {t('title')}
        </h1>
        <p className="lead">{t('lead')}</p>
        <div className="store-count">{t('count', {shown: list.length, total: BOOKS.length})}</div>

        <ShelfHero />

        <div className="filters">
          <div className="fgroup">
            <div className="flabel">{t('subject')}</div>
            {cats.map(({key, label}) => (
              <button
                type="button"
                key={key}
                className={key === cat ? 'fpill on' : 'fpill'}
                onClick={() => setCat(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="fgroup">
            <div className="flabel">{t('language')}</div>
            {langs.map(({key, label}) => (
              <button
                type="button"
                key={key}
                className={key === lang ? 'fpill on' : 'fpill'}
                onClick={() => setLang(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="store-grid">
        {list.length ? (
          list.map((book) => <StoreCard key={book.id} book={book} />)
        ) : (
          <div className="empty">{t('empty')}</div>
        )}
      </div>
    </>
  );
}
