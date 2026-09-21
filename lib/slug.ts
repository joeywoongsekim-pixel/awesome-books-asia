// M188 — working out a book's web name so nobody has to type one.
//
// The slug is not decoration. The store's detail page sends a reader to
// /read/<the shelf entry's id>, and that page looks the book up in the
// database by slug — so a book whose slug does not match its shelf id is
// a book whose "read" button finds nothing. Typing it by hand is exactly
// the wrong way to set a value that has to agree with another file.
//
// Hence: match the title against the shelf first and use that book's id.
// Only when the title is a stranger do we make a name up, and only out of
// letters a URL can carry — which for a Korean or Japanese title is
// nothing, so it says nothing rather than guessing.

import {BOOKS} from './books';

/** Loosened for comparison: case, spacing and the punctuation a title
    picks up between a cover and a form field. */
function tidy(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[:·・,.!?"'’“”\-–—()[\]{}]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A URL-safe name out of a Latin title. Empty for a title with no
    Latin letters in it, which is the honest answer — we cannot
    romanise Korean or Japanese here, and a slug of stripped-out
    nothing would be worse than an empty box. */
export function slugify(title: string): string {
  const out = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // drop accents, keep the letter
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
  // A stub of a title makes a stub of a slug. "The" becoming "the" is
  // not a web name, it is a half-typed one.
  return out.length >= 4 ? out : '';
}

/** The shelf id for a title the shelf already carries, or null.

    Exact first. Then either way round on prefixes, because the console
    splits a title from its subtitle where the shelf keeps one long
    string: "The AI Token Economy" typed here is the start of the
    shelf's "The AI Token Economy: Making Better Decisions…". A prefix
    has to be substantial to count, or "The" would match three books. */
export function catalogueSlug(title: string): string | null {
  const want = tidy(title);
  if (want.length < 4) return null;

  const shelf = BOOKS.map((b) => ({id: b.id, key: tidy(b.title)}));

  const exact = shelf.find((b) => b.key === want);
  if (exact) return exact.id;

  const starts = shelf.filter((b) => b.key.startsWith(want) || want.startsWith(b.key));
  // One clear answer only: two books sharing a beginning is not a match.
  return starts.length === 1 ? starts[0].id : null;
}

/** What to put in the slug box for this title.

    A title that looks like it belongs to the shelf but cannot be pinned
    to one entry gets an empty box rather than an invented name. Both
    editions of the AI Bible begin "Awesome AI Bible 2026", and making
    up `awesome-ai-bible-2026` for that would be a slug matching no
    shelf entry at all — a broken read button that looks filled in. The
    list of unclaimed entries is right there in the box. */
export function suggestSlug(title: string): string {
  const shelf = catalogueSlug(title);
  if (shelf) return shelf;
  return ambiguousOnShelf(title) ? '' : slugify(title);
}

/** True when the title begins more than one shelf entry. */
function ambiguousOnShelf(title: string): boolean {
  const want = tidy(title);
  if (want.length < 4) return false;
  return BOOKS.filter((b) => tidy(b.title).startsWith(want)).length > 1;
}

/** Shelf entries with no book behind them yet, newest first — offered as
    choices in the slug box so picking the right one is a click. */
export function unusedShelfSlugs(taken: readonly string[]): {id: string; title: string}[] {
  const used = new Set(taken);
  return BOOKS.filter((b) => !used.has(b.id))
    .slice()
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((b) => ({id: b.id, title: b.title}));
}
