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

// M174 — what the tabs change besides the jacket.
//
// These editions are not one text in several languages. The Japanese
// Quantum Economics is "for Japan" and runs 369 pages to the English 278;
// the English AI's Answers is the India Special Edition at 303 to the
// Japanese 337. Until now the tabs swapped the cover and nothing else, so
// picking English left the Japanese title, the Japanese description and
// the Japanese page count on screen under an English jacket.
//
// The server works out every edition's facts — including the description
// in the reader's language, which only it can do — and hands them over as
// one object. These components choose which of them to show.

export type Facts = {title: string; blurb: string; pages: number; published: string};

function pick(facts: Record<string, Facts>, lang: Lang | undefined): Facts {
  return (lang && facts[lang]) || Object.values(facts)[0];
}

export function EditionTitle({facts}: {facts: Record<string, Facts>}) {
  const chosen = useContext(Chosen);
  return <h1 className="d-title">{pick(facts, chosen?.lang).title}</h1>;
}

export function EditionBlurb({facts}: {facts: Record<string, Facts>}) {
  const chosen = useContext(Chosen);
  return <p className="d-blurb">{pick(facts, chosen?.lang).blurb}</p>;
}

export function EditionPages({facts}: {facts: Record<string, Facts>}) {
  const chosen = useContext(Chosen);
  return <>{pick(facts, chosen?.lang).pages}</>;
}

export function EditionPublished({facts}: {facts: Record<string, Facts>}) {
  const chosen = useContext(Chosen);
  return <>{pick(facts, chosen?.lang).published}</>;
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
