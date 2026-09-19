import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import type {Book} from '../lib/books';
import BookCover from './BookCover';

// Shared card (§9.5): typographic cover + title / author.
/* Prices are not printed anywhere on the site: nothing here is sold by the
   single copy, so a figure on a card reads as a shop price we do not offer.
   The figures themselves stay recorded in lib/retailers.ts, and fromPrice /
   priceForLang stay with them, so putting them back is a render change and
   not a research job. */
export default function BookCard({book}: {book: Book}) {
  const t = useTranslations('books');

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
      </div>
    </Link>
  );
}
