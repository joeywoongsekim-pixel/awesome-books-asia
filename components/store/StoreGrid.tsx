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

  /* All twelve, matching the subject tiles on the landing page and the
     shelves in the bookcase above. A chip only for the stocked five made
     the store read as a shorter catalogue than the rest of the site
     advertises — and a tile arriving as ?cat=SPORT had no chip to light
     up, so the shelf emptied with nothing saying which subject was on or
     any way back to everything. */
  const cats: {key: CatFilter; label: string}[] = [
    {key: 'all', label: t('all')},
    ...CATEGORIES.map((c) => ({key: c as CatFilter, label: t(CAT_KEY[c])}))
  ];
  const langs: {key: LangFilter; label: string}[] = [
    {key: 'all', label: t('any')},
    {key: 'EN', label: 'EN'},
    {key: 'KO', label: 'KO'},
    {key: 'JA', label: 'JA'}
  ];

  /* Two different emptinesses, and telling somebody to widen the language
     filter when the subject has no book in any language is advice that
     cannot work. A subject with nothing in it says so. */
  const subjectEmpty = cat !== 'all' && !BOOKS.some((b) => catsOf(b).includes(cat));

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
          <div className="empty">{t(subjectEmpty ? 'emptySubject' : 'empty')}</div>
        )}
      </div>
    </>
  );
}
