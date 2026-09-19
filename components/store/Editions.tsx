'use client';

import {createContext, useContext, useState} from 'react';
import BookCover from '../BookCover';
import {coverFor, type Book, type Lang} from '../../lib/books';

// M164 — the edition tabs now choose the jacket.
//
// They were a row of buttons with a state of their own that nothing read:
// whichever edition you picked, the page kept showing book.img. So the
// Korean page of the ninja cat showed the Japanese jacket, and six cover
// files that exist on disk — the Korean 쿠로, the Japanese 量子経済学, the
// English AI's Answers among them — had never been on screen at all.
//
// The tabs and the cover sit in different columns of the layout, so the
// choice lives in a context between them rather than in either one.

const LABELS: Record<Lang, string> = {
  EN: 'English',
  KO: '한국어',
  JA: '日本語'
};

const Chosen = createContext<{lang: Lang; set: (l: Lang) => void} | null>(null);

export function EditionProvider({
  initial,
  children
}: {
  initial: Lang;
  children: React.ReactNode;
}) {
  const [lang, set] = useState<Lang>(initial);
  return <Chosen.Provider value={{lang, set}}>{children}</Chosen.Provider>;
}

export function EditionCover({book}: {book: Book}) {
  const chosen = useContext(Chosen);
  // coverFor falls back to the book's own jacket when an edition has none
  // of its own, which is what the regional twins of Quantum Economics do.
  return <BookCover book={book} src={chosen ? coverFor(book.id, chosen.lang) : undefined} />;
}

export function EditionTabs({langs}: {langs: Lang[]}) {
  const chosen = useContext(Chosen);
  if (!chosen || langs.length === 0) return null;
  return (
    <div className="d-langs" role="tablist">
      {langs.map((lang) => (
        <button
          type="button"
          key={lang}
          role="tab"
          aria-selected={lang === chosen.lang}
          className={lang === chosen.lang ? 'd-lang on' : 'd-lang'}
          onClick={() => chosen.set(lang)}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
