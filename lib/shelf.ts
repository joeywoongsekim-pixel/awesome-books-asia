// M24 — the illustrated shelf (C안): one shelf row per subject, every
// published edition standing as a spine. Rows follow the store's taxonomy,
// in its order, and only subjects that have books get a row — an empty
// shelf for a subject nothing is published in yet says nothing. Ghost slots
// show where the next titles in a stocked subject will stand.

import {CATEGORIES, type Category} from './books';

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
  flat?: boolean; // lying in the horizontal pile
}

export interface ShelfRow {
  cat: Category;
  items: ShelfEdition[];
  ghosts: number; // dashed "coming soon" slots
}

const QUANTUM_DESC: Tri = {
  ko: '경제가 양자 법칙을 따른다면? 선택과 가격을 다시 쓰는 새로운 의사결정 경제학.',
  en: 'What if the economy obeys quantum rules? Why you choose what you choose.',
  ja: '日銀・消費税・推し活まで、ぜんぶ「量子」で説明する教養経済学。'
};
const ISEKAI_DESC: Tri = {
  ko: '경영 이론과 판타지 세계가 만났다 — 실전으로 배우는 기업가정신.',
  en: 'Business theory meets a fantasy world — entrepreneurship learned in the field.',
  ja: '経営学×異世界ファンタジー！実戦で学ぶ起業家精神。'
};
const BIBLE_DESC: Tri = {
  ko: '첫 프롬프트부터 조직 정책까지, 생성형 AI의 전 과정을 담은 완전판.',
  en: 'The complete guide to generative AI, from your first prompt to organisational policy.',
  ja: '最初のプロンプトから組織ポリシーまで、生成AIの完全ガイド。'
};
const ANSWER_DESC: Tri = {
  ko: 'AI의 답을 받은 다음, 사람은 무엇을 더해야 하는가 — 목적을 정하고, 근거로 돌아가고, 쓸지를 고르는 기술.',
  en: 'After AI answers, what do humans add? Purpose, evidence and the decision to use — an illustrated AI-literacy reader.',
  ja: 'AIの答えを受け取ったあと、人間は何を足すのか。目的・根拠・使い方を選ぶ技術を、図解と物語で。'
};
const TOKEN_IN_DESC: Tri = {
  ko: 'AI가 내놓은 초안, 그대로 내도 될까 — 품질·비용·시간을 재는 법. 인도 스페셜 에디션.',
  en: 'An AI draft arrives in seconds; knowing it is ready takes judgement. The India Special Edition.',
  ja: 'AIの下書きは数秒で届く。出せるかどうかを決めるのは人の判断。インド特別版。'
};
const NINJA_DESC: Tri = {
  ko: '마을에서 제일 덜렁대는 닌자 고양이 쿠로의 좌충우돌 수련기.',
  en: "The village's clumsiest ninja cat fails every mission in the best possible way.",
  ja: '村いちばんのおっちょこちょい忍者猫、クロの修行記。'
};

/* ISEKAI stands on two shelves, because the book is two things: it is
   filed under 경영 and answers to 소설 as well, which is what the store's
   subject filter has always said about it.

   The copies are separate objects rather than the same ones twice. The
   modal finds which shelf a spine came from with items.includes(), so
   sharing them would caption the 소설 copy as 경영 — the reader would
   click a novel and be told they were in business. The second set leans
   differently too: the same three spines twice over, identical to the
   degree, reads as a mistake rather than as one book on two shelves. */
function isekaiEditions(): ShelfEdition[] {
  return [
    {slug: 'isekai', lang: 'KO', title: '이세계 엔터프리너십 입문', cover: '/covers/isekai-ko.jpg', bg: '#b98f3a', fg: '#241b0e', desc: ISEKAI_DESC, w: 42, h: 192},
    {slug: 'isekai', lang: 'EN', title: 'ISEKAI Entrepreneurship', cover: '/covers/isekai.jpg', bg: '#233f37', fg: '#f2c94c', desc: ISEKAI_DESC, w: 46, h: 200},
    {slug: 'isekai', lang: 'JA', title: '異世界アントレプレナーシップ入門', cover: '/covers/isekai-ja.jpg', bg: '#44502a', fg: '#f2e4b8', desc: ISEKAI_DESC, w: 42, h: 190, tilt: -4}
  ];
}

const ROWS: ShelfRow[] = [
  {
    cat: 'ECON',
    ghosts: 0,
    items: [
      {slug: 'quantum-econ', lang: 'EN', title: 'Quantum Economics', cover: '/covers/quantum-econ.jpg', bg: '#ece7db', fg: '#20242c', desc: QUANTUM_DESC, w: 44, h: 196},
      {slug: 'quantum-econ-uk', lang: 'EN', title: 'Quantum Economics (UK)', cover: '/covers/quantum-econ.jpg', bg: '#dcd6c6', fg: '#20242c', desc: QUANTUM_DESC, w: 40, h: 188},
      {slug: 'quantum-econ-in', lang: 'EN', title: 'Quantum Economics (India)', cover: '/covers/quantum-econ.jpg', bg: '#cfc7b4', fg: '#20242c', desc: QUANTUM_DESC, w: 40, h: 184, tilt: 3},
      {slug: 'quantum-econ', lang: 'JA', title: '量子経済学', cover: '/covers/quantum-econ-ja.jpg', bg: '#1a1440', fg: '#f2df66', desc: QUANTUM_DESC, w: 40, h: 184}
    ]
  },
  {
    cat: 'BIZ',
    ghosts: 0,
    items: isekaiEditions()
  },
  {
    cat: 'FICTION',
    ghosts: 1,
    // the same three, leaning their own way
    items: isekaiEditions().map((ed, i) => ({
      ...ed,
      tilt: [4, undefined, -2][i],
      h: ed.h - 4
    }))
  },
  {
    cat: 'AI',
    ghosts: 0,
    items: [
      {slug: 'ai-answer', lang: 'JA', title: 'AIの答えに、人間は何を足すのか', cover: '/covers/ai-answer-ja.jpg', bg: '#f1ede2', fg: '#1f2a3a', desc: ANSWER_DESC, w: 44, h: 200},
      {slug: 'ai-bible', lang: 'EN', title: 'Awesome AI Bible 2026', cover: '/covers/ai-bible.jpg', bg: '#101c36', fg: '#e9c568', desc: BIBLE_DESC, w: 46, h: 206},
      {slug: 'ai-bible', lang: 'JA', title: 'AIバイブル 2026', cover: '/covers/ai-bible-ja.jpg', bg: '#16233d', fg: '#e9c568', desc: BIBLE_DESC, w: 40, h: 188, tilt: 5},
      // out 20 September; the jacket's own blue and white
      {slug: 'ai-token-in', lang: 'EN', title: 'The AI Token Economy', cover: '/covers/ai-token-in.jpg', bg: '#1b4f8f', fg: '#f4f7fb', desc: TOKEN_IN_DESC, w: 44, h: 198}
    ]
  },
  {
    cat: 'PICTURE',
    ghosts: 1,
    items: [
      {slug: 'ninja-cat', lang: 'KO', title: '덜렁이 닌자 고양이 쿠로편', cover: '/covers/ninja-cat-ko.jpg', bg: '#f2cf5b', fg: '#3a2a1a', desc: NINJA_DESC, w: 178, h: 34, flat: true},
      {slug: 'ninja-cat', lang: 'JA', title: 'おっちょこ忍キャット クロの巻', cover: '/covers/ninja-cat.jpg', bg: '#e8b64a', fg: '#3a2a1a', desc: NINJA_DESC, w: 166, h: 32, flat: true}
    ]
  }
];

/* Rows are shown in the taxonomy's own order, whatever order they are
   written in above, so adding a subject never means re-sorting by hand.

   Every subject gets a shelf, including the eight with nothing on them
   yet: the bookcase is the house's plan, and an empty shelf under a
   nameplate says a subject is coming far better than its absence does.
   A row with no books is three dashed slots, which is what `ghosts` has
   always drawn for the gaps in a part-filled row. */
const EMPTY_SHELF_GHOSTS = 3;

export const SHELF: ShelfRow[] = CATEGORIES.map(
  (c) => ROWS.find((r) => r.cat === c) ?? {cat: c, items: [], ghosts: EMPTY_SHELF_GHOSTS}
);
