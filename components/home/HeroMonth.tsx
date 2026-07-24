import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {BOOKS} from '../../lib/books';
import BookCover from '../BookCover';

// §9.4 — book-of-the-month hero: deep-navy full-bleed with a left-to-right
// navy gradient overlay, copy capped at 520px, gold fill + gold outline CTAs.
export default function HeroMonth() {
  const t = useTranslations('home');
  const tDetail = useTranslations('detail');
  const book = BOOKS.find((b) => b.isNew) ?? BOOKS[0];

  return (
    <section className="hero">
      <div className="hero-in">
        <div className="h-copy">
          <div className="h-label">{t('month')}</div>
          <h1 className="h-title">{book.title}</h1>
          <p className="h-sub">{book.blurb}</p>
          <div className="h-btns">
            <Link href={`/books/${book.id}`} className="btn-gold">
              {t('explore')}
            </Link>
            <Link href={`/read/${book.id}`} className="btn-goldo">
              {tDetail('sample')}
            </Link>
          </div>
        </div>
        <BookCover book={book} className="h-cover" />
      </div>
    </section>
  );
}
