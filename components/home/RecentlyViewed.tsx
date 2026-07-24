'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BOOKS} from '../../lib/books';
import BookCard from '../BookCard';

// Rendered only once the visitor has opened at least one detail page
// (RecordVisit keeps the list in localStorage).
export default function RecentlyViewed() {
  const t = useTranslations('recent');
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem('aba-recent') ?? '[]'));
    } catch {
      /* corrupted storage — treat as empty */
    }
  }, []);

  const books = ids
    .map((id) => BOOKS.find((b) => b.id === id))
    .filter((b): b is (typeof BOOKS)[number] => Boolean(b))
    .slice(0, 4);
  if (books.length === 0) return null;

  return (
    <section className="sec sec-tight">
      <div className="sec-in">
        <h2 className="h2 h2-s">{t('title')}</h2>
        <div className="books">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
