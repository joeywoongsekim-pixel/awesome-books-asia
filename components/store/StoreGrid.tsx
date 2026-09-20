'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {BOOKS, CATEGORIES, CAT_KEY, catsOf, type Category, type Lang} from '../../lib/books';
import StoreCard from './StoreCard';
import ShelfHero from './ShelfHero';

type CatFilter = 'all' | Category;
type LangFilter = 'all' | Lang;

/* Sixteen to a page, which is the four-by-four the grid already draws, so
   a page is a full block of shelf rather than a ragged tail. */
const PER_PAGE = 16;

/* Five page numbers at a time. Past that the pager would grow wider than
   the shelf it belongs to, and the arrows carry the rest. */
const WINDOW = 5;

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
  const [page, setPage] = useState(1);

  /* Narrowing the shelf puts you back at its start. Staying on page three
     of a filter that now has one page is how a shelf comes out empty for
     no visible reason. */
  const choose = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  // A book answers to every subject it carries, not just the one it
  // stands under on the shelf.
  const list = BOOKS.filter(
    (b) =>
      (cat === 'all' || catsOf(b).includes(cat)) && (lang === 'all' || b.langs.includes(lang))
  )
    /* Newest first. `published` is YYYY-MM, so it sorts as a string.
       Books out the same month are grouped by the work they belong to, or
       the editions of one book would be scattered through the month by
       whatever order the catalogue happens to list them in. */
    .sort(
      (a, b) =>
        b.published.localeCompare(a.published) ||
        (a.work ?? a.id).localeCompare(b.work ?? b.id)
    );

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  /* The window of numbers keeps the current page near its middle, and
     stops sliding at either end so it never shows numbers that are not
     there. */
  const first = Math.max(1, Math.min(current - Math.floor(WINDOW / 2), pages - WINDOW + 1));
  const numbers = Array.from({length: Math.min(WINDOW, pages)}, (_, i) => first + i);

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
                onClick={() => choose(setCat)(key)}
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
                onClick={() => choose(setLang)(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="store-grid">
        {shown.length ? (
          shown.map((book) => <StoreCard key={book.id} book={book} />)
        ) : (
          <div className="empty">{t(subjectEmpty ? 'emptySubject' : 'empty')}</div>
        )}
      </div>

      {/* One page of sixteen needs no pager. The arrows sit either side of
          the numbers, as they do at the foot of the magazine. */}
      {pages > 1 && (
        <nav className="st-pager mz-pager" aria-label={t('pagesLabel')}>
          <button
            type="button"
            className={current > 1 ? 'mz-arrow' : 'mz-arrow off'}
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label={t('prev')}
          >
            ←
          </button>

          <div className="mz-nums">
            {numbers.map((n) => (
              <button
                type="button"
                key={n}
                className={n === current ? 'mz-num on' : 'mz-num'}
                onClick={() => setPage(n)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={current < pages ? 'mz-arrow' : 'mz-arrow off'}
            onClick={() => setPage(current + 1)}
            disabled={current === pages}
            aria-label={t('next')}
          >
            →
          </button>
        </nav>
      )}
    </>
  );
}
