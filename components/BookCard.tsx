import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import type {Book} from '../lib/books';
import {fromPrice} from '../lib/retailers';
import BookCover from './BookCover';

// Shared card (§9.5): typographic cover + title / author / price meta.
// The price is the cheapest real retailer listing, in the reader's currency.
export default function BookCard({book}: {book: Book}) {
  const t = useTranslations('books');
  const locale = useLocale();
  const price = fromPrice(book.id, locale);

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
        <span className="bk-quick">{t('details')}</span>
      </div>
      <div className="bk-b">
        <div className="bk-t">{book.title}</div>
        <div className="bk-a">{book.author}</div>
        <div className="bk-f">
          <div className="bk-p">
            {price
              ? t.rich('priceFrom', {
                  price,
                  em: (chunks) => <em>{chunks}</em>
                })
              : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
