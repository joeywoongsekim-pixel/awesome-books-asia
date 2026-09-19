// M82 — the people behind the books. Credits, not a roster.
//
// A person can hold more than one role, and the books are recorded per
// role: what someone wrote and what they translated are different lists,
// so one cannot stand in for the other. Where a role's list is empty the
// credit simply is not recorded here yet, and the name shows without one
// rather than borrowing the other role's titles.

import type {Lang} from './books';

export type Role = 'author' | 'illustrator' | 'translator';

/** A credit is a book, and for a translator also the edition: which
    language you carried it into is the whole of the claim. */
export type Credit = {id: string; langs?: Lang[]};

export type Person = {
  id: string;
  name: string;
  /** books from lib/books.ts, per role */
  credits: Partial<Record<Role, Credit[]>>;
  /** roles held but not yet published in — "at work on a first title" */
  forthcoming?: Role[];
  /** the profile lives in messages as people.bio.<id>, paragraphs split on
      a blank line, so it is written once per locale like everything else */
  hasBio?: boolean;
  /** Titles at work on, per role. It shows under a role that already has
      credits as well as under one that has none, because "has published
      before and is working on another" is the common case and the old
      field could not say it. */
  soon?: Partial<Record<Role, string[]>>;
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
    credits: {
      author: [{id: 'quantum-econ'}, {id: 'ai-bible'}, {id: 'ai-answer'}, {id: 'ai-token'}],
      translator: []
    },
    forthcoming: ['translator'],
    hasBio: true,
    photo: true
  },
  {id: 'lyra-mizuki', name: 'Lyra Mizuki', credits: {author: [{id: 'isekai'}]}, hasBio: true, photo: true},
  {id: 'fumi-yamaneko', name: 'Fumi Yamaneko', credits: {author: [{id: 'ninja-cat'}]}, hasBio: true, photo: true},
  {
    id: 'joey-kim',
    name: 'Joey W. Kim',
    credits: {author: [], translator: []},
    forthcoming: ['author', 'translator'],
    soon: {
      author: ['Introduction to Cricket', 'Introduction to Rugby'],
      // Both are English into Korean, which is the direction his profile
      // already describes. North Shore moved here off Vega Choi, who
      // carries Japanese and only Japanese.
      translator: ['Akira Murata’s books', 'North Shore']
    },
    hasBio: true,
    photo: true
  },
  {
    // Invented, like Lyra, Fumi, Orion and Vega. No published credit yet:
    // the empty author list plus `forthcoming` is what makes the card read
    // "at work on" rather than "nothing recorded".
    id: 'halley-brooks',
    name: 'Halley Brooks',
    credits: {author: []},
    forthcoming: ['author'],
    soon: {author: ['North Shore']},
    hasBio: true,
    photo: true
  },
  {
    id: 'orion-carter',
    name: 'Orion Carter',
    credits: {illustrator: [{id: 'isekai'}, {id: 'ninja-cat'}]},
    soon: {illustrator: ['North Shore']},
    hasBio: true,
    photo: true
  },
  {
    id: 'vega-choi',
    name: 'Vega Choi',
    credits: {
      translator: [{id: 'isekai', langs: ['KO', 'EN']}, {id: 'ninja-cat', langs: ['KO']}]
    },
    hasBio: true,
    photo: true
  }
];

export const inRole = (role: Role) => PEOPLE.filter((p) => p.credits[role] !== undefined);

/** Initials for the monogram that stands in for a missing portrait. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
