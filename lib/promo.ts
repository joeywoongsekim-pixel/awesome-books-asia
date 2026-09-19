import {BOOKS, type Book} from './books';
import {EDITIONS, type EditionLink} from './retailers';

/* The renewal / India launch popup (M101).

   One campaign, one window, defined here so the component carries no dates
   of its own. The end is the close of 24 September in India, written as the
   UTC instant it falls on: the event is in India, so the popup should not
   vanish at teatime there because a clock in Seoul has already turned over.
   A visitor in Seoul therefore keeps it a few hours into the 25th, which is
   the harmless direction to be wrong in.

   The window is checked in the browser, not at build time. These pages are
   prerendered, so a build-time check would freeze whatever was true the
   moment the site was built and the popup would never expire on its own. */
export const PROMO = {
  id: 'india-launch-2026-09',
  /** Inclusive. 2026-09-19T00:00+05:30. */
  from: Date.parse('2026-09-18T18:30:00Z'),
  /** Exclusive: the first instant of 25 September in India. */
  until: Date.parse('2026-09-24T18:30:00Z')
} as const;

export function promoIsLive(now: number = Date.now()) {
  return now >= PROMO.from && now < PROMO.until;
}

export type IndiaEdition = {
  book: Book;
  link: EditionLink;
  /** The edition's own title where it differs from the book's. */
  title: string;
  /** This edition's jacket, or null when none is on file for it. */
  cover: string | null;
};

/* Which jacket belongs to this edition.

   An edition's own img wins outright. Otherwise the book's img is used
   only if it is for the same language: cover files are named by edition —
   ai-answer-ja.jpg, isekai-ko.jpg, and the base English one with no suffix
   at all — so a -ja file under an English title is the wrong jacket, which
   is the trap the 신간 shelf already avoids. With nothing that fits, the
   card falls back to a brand tile, which is a designed placeholder rather
   than the wrong book. */
function coverFor(book: Book, link: EditionLink) {
  if (link.img) return link.img;
  if (!book.img) return null;
  const m = /-(ja|ko|en)\.[a-z]+$/i.exec(book.img);
  return (m ? m[1].toUpperCase() : 'EN') === link.lang ? book.img : null;
}

/* The books in the popup are not a hand-written list: they are every
   edition the catalogue sells on Amazon India. Add a third India edition to
   lib/retailers.ts and it appears here with no further edit. */
export function indiaEditions(): IndiaEdition[] {
  const out: IndiaEdition[] = [];
  for (const book of BOOKS) {
    for (const link of EDITIONS[book.id] ?? []) {
      if (link.store !== 'Amazon IN') continue;
      out.push({
        book,
        link,
        title: link.note ?? book.title,
        cover: coverFor(book, link)
      });
    }
  }
  return out;
}
