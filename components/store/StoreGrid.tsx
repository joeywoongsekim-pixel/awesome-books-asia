'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {BOOKS, type Category, type Lang} from '../../lib/books';
import BookCard from '../BookCard';

type CatFilter = 'all' | Category;
type LangFilter = 'all' | Lang;

export default function StoreGrid() {
  const t = useTranslations('store');
  const [cat, setCat] = useState<CatFilter>('all');
  const [lang, setLang] = useState<LangFilter>('all');

  const list = BOOKS.filter(
    (b) => (cat === 'all' || b.cat === cat) && (lang === 'all' || b.langs.includes(lang))
  );

  const cats: {key: CatFilter; label: string}[] = [
    {key: 'all', label: t('all')},
    {key: 'AI', label: t('catAI')},
    {key: 'EDU', label: t('catEDU')},
    {key: 'KIDS', label: t('catKIDS')}
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
          list.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <div className="empty">{t('empty')}</div>
        )}
      </div>
    </>
  );
}
