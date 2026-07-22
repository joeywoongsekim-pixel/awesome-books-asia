import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS, type Book} from '../../lib/books';
import Reveal from '../Reveal';

// Detail routes arrive in M3; cards resolve to home until then.
function BookCard({book}: {book: Book}) {
  const t = useTranslations('books');

  return (
    <Link href="/" className="bk">
      <div className={`bk-cv ${book.cover}`}>
        {book.ic}
        {book.isNew && <div className="bk-new">{t('new')}</div>}
        <div className="bk-lang">
          {book.langs.map((lang) => (
            <span key={lang}>{lang}</span>
          ))}
        </div>
      </div>
      <div className="bk-b">
        <div className="bk-cat">{book.catLabel}</div>
        <div className="bk-t">{book.title}</div>
        <div className="bk-a">{book.author}</div>
        <div className="bk-f">
          <div className="bk-p">
            {book.price
              ? t.rich('priceFrom', {
                  price: book.price,
                  em: (chunks) => <em>{chunks}</em>
                })
              : t('inSubscription')}
          </div>
          <div className="bk-btn">{book.price ? t('details') : t('subscribe')}</div>
        </div>
      </div>
    </Link>
  );
}

export default function BooksSection() {
  const t = useTranslations('books');

  return (
    <section className="sec sheet" id="books">
      <div className="sec-in">
        <Reveal>
          <div className="books-head">
            <div>
              <div className="eyebrow">{t('eyebrow')}</div>
              <h2 className="h2">{t('title')}</h2>
              <p className="lead">{t('lead')}</p>
            </div>
            <Link href="/#books" className="viewall">
              {t('viewAll')}
            </Link>
          </div>
          <div className="books">
            {BOOKS.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
