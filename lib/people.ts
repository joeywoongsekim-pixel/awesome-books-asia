// M81 — the people behind the books. Credits, not a roster: a name only
// appears here if it is on a book the house has actually published, and
// the books listed under it are the ones it is credited on.
//
// The role split for a title credited to two people is not recorded in
// lib/books.ts, which carries a single combined `author` string. Until the
// house confirms who did what, everyone stays under the credit the book
// itself gives them.

export type Role = 'author' | 'illustrator' | 'translator';

export type Person = {
  id: string;
  name: string;
  role: Role;
  /** book ids from lib/books.ts, in publication order */
  books: string[];
  /** /public/people/<id>.webp — a monogram stands in until one exists */
  photo?: boolean;
};

export const ROLE_LABEL: Record<Role, string> = {
  author: 'Awesome Author',
  illustrator: 'Awesome Illustrator',
  translator: 'Awesome Translator'
};

export const ROLES: Role[] = ['author', 'illustrator', 'translator'];

export const PEOPLE: Person[] = [
  {
    id: 'akira-murata',
    name: 'Akira Murata',
    role: 'author',
    books: ['quantum-econ', 'ai-bible', 'ai-answer']
  },
  {
    id: 'lyra-mizuki',
    name: 'Lyra Mizuki',
    role: 'author',
    books: ['isekai']
  },
  {
    id: 'orion-carter',
    name: 'Orion Carter',
    role: 'author',
    books: ['isekai', 'ninja-cat']
  },
  {
    id: 'fumi-yamaneko',
    name: 'Fumi Yamaneko',
    role: 'author',
    books: ['ninja-cat']
  }
];

/** Initials for the monogram that stands in for a missing portrait. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
