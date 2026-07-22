import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS} from '../../lib/books';
import BookCard from '../BookCard';
import Reveal from '../Reveal';

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
            <Link href="/books" className="viewall">
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
