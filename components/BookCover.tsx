import type {Book} from '../lib/books';
import {BOOKS} from '../lib/books';

// §9.5 — typographic cover: brand label / serif title / author + series
// number, on a rotating brand palette (navy / cream / gold / deep / white).
const ROTATION = ['cvA', 'cvB', 'cvC', 'cvD', 'cvE'] as const;

export function seriesNo(book: Book) {
  const idx = BOOKS.findIndex((b) => b.id === book.id);
  return `ABA ${String(idx + 1).padStart(3, '0')}`;
}

export default function BookCover({
  book,
  className
}: {
  book: Book;
  className?: string;
}) {
  const idx = Math.max(0, BOOKS.findIndex((b) => b.id === book.id));
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
