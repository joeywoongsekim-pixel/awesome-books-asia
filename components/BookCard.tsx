import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import type {Book} from '../lib/books';

// Shared card: home grid (server) and store grid (client) both render this.
export default function BookCard({book}: {book: Book}) {
  const t = useTranslations('books');

  return (
    <Link href={`/books/${book.id}`} className="bk">
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
