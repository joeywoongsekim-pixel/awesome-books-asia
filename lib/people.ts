// M82 — the people behind the books. Credits, not a roster.
//
// A person can hold more than one role, and the books are recorded per
// role: what someone wrote and what they translated are different lists,
// so one cannot stand in for the other. Where a role's list is empty the
// credit simply is not recorded here yet, and the name shows without one
// rather than borrowing the other role's titles.

export type Role = 'author' | 'illustrator' | 'translator';

export type Person = {
  id: string;
  name: string;
  /** book ids from lib/books.ts, per role */
  credits: Partial<Record<Role, string[]>>;
  /** roles held but not yet published in — "at work on a first title" */
  forthcoming?: Role[];
  /** a short note, shown only on the opened card */
  bio?: string;
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
    credits: {author: ['quantum-econ', 'ai-bible', 'ai-answer'], translator: []},
    forthcoming: ['translator']
  },
  {id: 'lyra-mizuki', name: 'Lyra Mizuki', credits: {author: ['isekai']}},
  {id: 'fumi-yamaneko', name: 'Fumi Yamaneko', credits: {author: ['ninja-cat']}},
  {
    id: 'joey-kim',
    name: 'Joey Kim',
    credits: {author: [], translator: []},
    forthcoming: ['author', 'translator']
  },
  {id: 'orion-carter', name: 'Orion Carter', credits: {illustrator: ['isekai', 'ninja-cat']}},
  {id: 'vega-choi', name: 'Vega Choi', credits: {translator: []}}
];

export const inRole = (role: Role) => PEOPLE.filter((p) => p.credits[role] !== undefined);

/** Initials for the monogram that stands in for a missing portrait. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
