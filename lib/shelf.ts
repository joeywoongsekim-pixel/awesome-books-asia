// M24 — the illustrated bookcase: one shelf per subject, every published
// edition standing on it as a spine.
//
// M177 — the shelves are worked out from the catalogue now instead of
// being written by hand. They had drifted: after the editions were split
// into entries of their own the bookcase still showed the old set, so AI
// carried four spines where the store filter found six, the Japanese
// token book stood nowhere at all, and the two teaching shelves said
// "coming soon" under a book that was already on them.
//
// That drift was not an oversight, it was the shape of the thing — two
// lists of the same books, kept in step by remembering to. So only what
// cannot be derived is written here: a spine's cloth, its foil, how wide
// and how tall it stands. Where a book goes comes from the subjects it
// answers to, which is the same answer the store's filter gives.

import {BOOKS, CATEGORIES, catsOf, type Book, type Category} from './books';

export type Tri = {ko: string; en: string; ja: string};

export function tri(locale: string, t: Tri): string {
  if (locale === 'ko') return t.ko;
  if (locale === 'ja') return t.ja;
  return t.en;
}

export type EdLang = 'KO' | 'EN' | 'JA';

export interface ShelfEdition {
  slug: string; // BOOKS id / detail route
  lang: EdLang;
  title: string; // this edition's own title
  cover: string; // /covers/*.jpg
  bg: string; // spine cloth
  fg: string; // spine foil
  desc: Tri;
  w: number; // spine width px
  h: number; // spine height px
  tilt?: number; // leaning angle (deg)
}

export interface ShelfRow {
  cat: Category;
  items: ShelfEdition[];
  ghosts: number; // dashed "coming soon" slots
}

/* One line per book, shown when a spine is pulled off the shelf. Keyed by
   work, because the editions of one book say the same thing about it. */
const DESCS: Record<string, Tri> = {
  'quantum-econ': {
    ko: '경제가 양자 법칙을 따른다면? 선택과 가격을 다시 쓰는 새로운 의사결정 경제학.',
    en: 'What if the economy obeys quantum rules? Why you choose what you choose.',
    ja: '日銀・消費税・推し活まで、ぜんぶ「量子」で説明する教養経済学。'
  },
  isekai: {
    ko: '경영 이론과 판타지 세계가 만났다 — 실전으로 배우는 기업가정신.',
    en: 'Business theory meets a fantasy world — entrepreneurship learned in the field.',
    ja: '経営学×異世界ファンタジー！実戦で学ぶ起業家精神。'
  },
  'ai-bible': {
    ko: '첫 프롬프트부터 조직 정책까지, 생성형 AI의 전 과정을 담은 완전판.',
    en: 'The complete guide to generative AI, from your first prompt to organisational policy.',
    ja: '最初のプロンプトから組織ポリシーまで、生成AIの完全ガイド。'
  },
  'ai-answer': {
    ko: 'AI의 답을 받은 다음, 사람은 무엇을 더해야 하는가 — 목적을 정하고, 근거로 돌아가고, 쓸지를 고르는 기술.',
    en: 'After AI answers, what do humans add? Purpose, evidence and the decision to use.',
    ja: 'AIの答えを受け取ったあと、人間は何を足すのか。目的・根拠・使い方を選ぶ技術を、図解と物語で。'
  },
  'ai-token': {
    ko: 'AI가 내놓은 초안, 그대로 내도 될까 — 품질·비용·시간을 재는 법.',
    en: 'An AI draft arrives in seconds; knowing it is ready takes judgement.',
    ja: 'AIの下書きは数秒で届く。出せるかどうかを決めるのは人の判断。'
  },
  'ninja-cat': {
    ko: '마을에서 제일 덜렁대는 닌자 고양이 쿠로의 좌충우돌 수련기.',
    en: "The village's clumsiest ninja cat fails every mission in the best possible way.",
    ja: '村いちばんのおっちょこちょい忍者猫、クロの修行記。'
  }
};

/* How each book stands: its cloth and foil, a name short enough to read
   down a spine, and its dimensions. This is the part a machine cannot
   work out, so it is the only part written by hand — and a book missing
   from here still gets a spine, just a plain one. */
type Spine = {
  title: string;
  bg: string;
  fg: string;
  w: number;
  h: number;
  tilt?: number;
};

const SPINES: Record<string, Spine> = {
  'ai-token': {title: 'AIトークン経済入門', bg: '#a8781f', fg: '#f6e7c1', w: 42, h: 194},
  'ai-token-in': {title: 'The AI Token Economy', bg: '#1b4f8f', fg: '#f4f7fb', w: 44, h: 198},
  'ai-answer': {title: 'AIの答えに、人間は何を足すのか', bg: '#f1ede2', fg: '#1f2a3a', w: 44, h: 200},
  'ai-answer-in': {title: "What Do Humans Add?", bg: '#dfe9f3', fg: '#1f2a3a', w: 42, h: 192, tilt: -3},
  'ai-bible': {title: 'Awesome AI Bible 2026', bg: '#101c36', fg: '#e9c568', w: 46, h: 206},
  'ai-bible-ja': {title: 'AIバイブル 2026', bg: '#16233d', fg: '#e9c568', w: 40, h: 188, tilt: 5},
  'quantum-econ': {title: 'Quantum Economics', bg: '#ece7db', fg: '#20242c', w: 44, h: 196},
  'quantum-econ-uk': {title: 'Quantum Economics (UK)', bg: '#dcd6c6', fg: '#20242c', w: 40, h: 188},
  'quantum-econ-in': {title: 'Quantum Economics (India)', bg: '#cfc7b4', fg: '#20242c', w: 40, h: 184, tilt: 3},
  'quantum-econ-ja': {title: '量子経済学', bg: '#1a1440', fg: '#f2df66', w: 40, h: 184},
  isekai: {title: 'ISEKAI Entrepreneurship', bg: '#233f37', fg: '#f2c94c', w: 46, h: 200},
  'isekai-ko': {title: '이세계 엔터프리너십 입문', bg: '#b98f3a', fg: '#241b0e', w: 42, h: 192},
  'isekai-ja': {title: '異世界アントレプレナーシップ入門', bg: '#44502a', fg: '#f2e4b8', w: 42, h: 190, tilt: -4},
  /* The picture books stand with the rest. They are shorter than the
     textbooks beside them and broader across the spine, which is what a
     picture book is — and they used to lie in a pile, which read as a
     different kind of thing rather than as a shorter book. */
  'ninja-cat': {title: 'おっちょこ忍キャット クロの巻', bg: '#e8b64a', fg: '#3a2a1a', w: 50, h: 174},
  'ninja-cat-ko': {title: '덜렁이 닌자 고양이 쿠로편', bg: '#f2cf5b', fg: '#3a2a1a', w: 52, h: 168, tilt: 4}
};

/* A book with no spine written for it still stands, in the house's paper
   and ink. It keeps a new title on the shelf from the day it is added
   rather than from the day somebody remembers this file. */
const PLAIN: Omit<Spine, 'title'> = {bg: '#e7e2d6', fg: '#20242c', w: 42, h: 192};

function spineFor(book: Book): ShelfEdition {
  const spine = SPINES[book.id] ?? {...PLAIN, title: book.title};
  return {
    ...spine,
    slug: book.id,
    lang: book.langs[0],
    cover: book.img ?? '/og.png',
    desc: DESCS[book.work ?? book.id] ?? DESCS[book.id] ?? {
      ko: book.blurb,
      en: book.blurb,
      ja: book.blurb
    }
  };
}

/* Every subject gets a shelf, including the ones with nothing on them
   yet: the bookcase is the house's plan, and an empty shelf under a
   nameplate says a subject is coming where its absence said nothing.

   A book stands on every shelf it answers to, so the three that are both
   business and fiction stand on both. The spines are built fresh for each
   row rather than shared, because the modal works out which shelf a spine
   came from by identity — sharing them would caption the novel as
   business. */
const EMPTY_SHELF_GHOSTS = 3;

export const SHELF: ShelfRow[] = CATEGORIES.map((cat) => {
  const items = BOOKS.filter((b) => catsOf(b).includes(cat)).map(spineFor);
  return {cat, items, ghosts: items.length ? 0 : EMPTY_SHELF_GHOSTS};
});
