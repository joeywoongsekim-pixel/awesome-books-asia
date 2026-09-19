import {useLocale} from 'next-intl';
import type {Book} from '../lib/books';
import {BOOKS, coverFor, preferredEdition} from '../lib/books';

// §9.5 — typographic cover: brand label / serif title / author + series
// number, on a rotating brand palette (navy / cream / gold / deep / white).
const ROTATION = ['cvA', 'cvB', 'cvC', 'cvD', 'cvE'] as const;

export function seriesNo(book: Book) {
  const idx = BOOKS.findIndex((b) => b.id === book.id);
  return `ABA ${String(idx + 1).padStart(3, '0')}`;
}

export default function BookCover({
  book,
  className,
  /* Which jacket, where the book has more than one — the edition a reader
     chose on the detail page, or the one a promo card is advertising.
     Left out, the jacket is the one this reader's own page will open:
     ai-answer is filed under its Japanese cover, so a card showing book.img
     sent an English reader to a page whose cover changed under them. */
  src
}: {
  book: Book;
  className?: string;
  src?: string;
}) {
  const locale = useLocale();
  const idx = Math.max(0, BOOKS.findIndex((b) => b.id === book.id));
  const art = src ?? coverFor(book.id, preferredEdition(book.langs, locale));
  if (art) {
    // Published titles show their real cover art.
    return (
      <div className={`cv cv-img ${className ?? ''}`}>
        <img src={art} alt="" loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <div className={`cv ${ROTATION[idx % ROTATION.length]} ${className ?? ''}`}>
      <span className="cv-brand">Awesome Books Asia</span>
      <span className="cv-title">{book.title}</span>
      <span className="cv-foot">
        <i>{book.author}</i>
        <b>{seriesNo(book)}</b>
      </span>
    </div>
  );
}
