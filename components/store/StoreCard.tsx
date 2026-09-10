import {Fragment} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import type {Book} from '../../lib/books';
import BookCover from '../BookCover';
import {EDITIONS} from '../../lib/retailers';

// A안의 카드: shared BookCard + the edition availability matrix
// (language × format, straight from the verified retailer links).
const LANGS = ['KO', 'EN', 'JA'] as const;

export default function StoreCard({book}: {book: Book}) {
  const t = useTranslations('books');
  const ts = useTranslations('store');
  const eds = EDITIONS[book.id] ?? [];
  const has = (lang: string, format: 'ebook' | 'print') =>
    eds.some((e) => e.lang === lang && e.format === format);

  return (
    <Link href={`/books/${book.id}`} className="bk">
      <div className="bk-cvwrap">
        <BookCover book={book} />
        {book.isNew && <div className="bk-new">{t('new')}</div>}
        <div className="bk-lang">
          {book.langs.map((lang) => (
            <span key={lang}>{lang}</span>
          ))}
        </div>
        <span className="bk-quick">{book.price ? t('details') : t('subscribe')}</span>
      </div>
      <div className="bk-b">
        <div className="bk-t">{book.title}</div>
        <div className="bk-a">{book.author}</div>
        <div className="bk-mx" aria-hidden="true">
          <span />
          <span className="bk-mx-h">EBOOK</span>
          <span className="bk-mx-h">{ts('fmtPrint')}</span>
          {LANGS.map((lang) => (
            <Fragment key={lang}>
              <span className="bk-mx-l">{lang}</span>
              <span className={has(lang, 'ebook') ? 'bk-mx-y' : 'bk-mx-n'}>
                {has(lang, 'ebook') ? '●' : '—'}
              </span>
              <span className={has(lang, 'print') ? 'bk-mx-y' : 'bk-mx-n'}>
                {has(lang, 'print') ? '●' : '—'}
              </span>
            </Fragment>
          ))}
        </div>
        <div className="bk-f">
          <div className="bk-p">
            {book.price
              ? t.rich('priceFrom', {
                  price: book.price,
                  em: (chunks) => <em>{chunks}</em>
                })
              : t('inSubscription')}
          </div>
        </div>
      </div>
    </Link>
  );
}
