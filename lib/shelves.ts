// M14 bookstore walkthrough — the empty-shelf catalogue.
// Every bay shows an EMPTY shelf backdrop (walk/wall-empty.webp) and the only
// books standing on it are our published editions — the shelf fills up one
// real book at a time as we publish. Each language edition is its own
// physical book with its own cover art.

export type Tri = {ko: string; en: string; ja: string};

export interface WalkBook {
  slug: string; // detail page id (lib/books.ts)
  ko: string;
  en: string;
  ja: string;
  desc: Tri; // one sentence
  status: 'out' | 'soon';
  face?: boolean;
  rep?: boolean; // the single awesome-blue accent
  cover?: string; // this edition's front cover
  spineBg?: string;
  spineFg?: string;
  ed?: Tri; // edition label (language/format)
}

export interface WalkBay {
  sign: Tri; // brass plate
  photo?: string; // /public/walk/<photo>.webp bay backdrop
  pos?: string; // background-position crop
  zoom?: string; // background-size
  seat?: number; // px from bay bottom to the shelf lip
  books: WalkBook[];
}

export interface WalkShelf {
  no: string;
  ko: string;
  en: string;
  ja: string;
  foil: string;
  cloths: string[];
  low?: boolean;
  bays: WalkBay[];
}

const d = (ko: string, en: string, ja: string): Tri => ({ko, en, ja});

const SOON = d('근간 예정', 'Coming Soon', '近刊予定');
const ED_KO = d('한국어판', 'Korean Edition', '韓国語版');
const ED_EN = d('영문판', 'English Edition', '英語版');
const ED_JA = d('일본어판', 'Japanese Edition', '日本語版');

// shared shelf backdrop — crops vary so bays read as different spots
const EMPTY = {photo: 'wall-empty', zoom: '130%', seat: 62};

const QUANTUM_DESC = d(
  '경제가 양자 법칙을 따른다면? 선택과 가격을 다시 쓰는 새로운 의사결정 경제학.',
  'What if the economy obeys quantum rules? Why you choose what you choose.',
  '日銀・消費税・推し活まで、ぜんぶ「量子」で説明する教養経済学。'
);
const ISEKAI_DESC = d(
  '경영 이론과 판타지 세계가 만났다 — 실전으로 배우는 기업가정신.',
  'Business theory meets a fantasy world — entrepreneurship learned in the field.',
  '経営学×異世界ファンタジー！実戦で学ぶ起業家精神。'
);
const BIBLE_DESC = d(
  '첫 프롬프트부터 조직 정책까지, 생성형 AI의 전 과정을 담은 완전판.',
  'The complete guide to generative AI, from your first prompt to organisational policy.',
  '最初のプロンプトから組織ポリシーまで、生成AIの完全ガイド。'
);
const NINJA_DESC = d(
  '마을에서 제일 덜렁대는 닌자 고양이 쿠로의 좌충우돌 수련기.',
  "The village's clumsiest ninja cat fails every mission in the best possible way.",
  '村いちばんのおっちょこちょい忍者猫、クロの修行記。'
);

const same = (s: string): Tri => ({ko: s, en: s, ja: s});

export const SHELVES: WalkShelf[] = [
  {
    no: '01',
    ko: '경제 · 경영',
    en: 'Economics & Business',
    ja: '経済・経営',
    foil: '#EFD9A0',
    cloths: ['#4a3b2f', '#5d4632', '#6e5a3a', '#3e3a45', '#57423b', '#4c4a3a'],
    bays: [
      {
        sign: d('가격과 이익', 'Pricing & Profit', '価格と利益'),
        ...EMPTY,
        pos: '30% 90%',
        books: [
          {
            slug: 'quantum-econ',
            cover: '/covers/quantum-econ.jpg',
            spineBg: '#ece7db',
            spineFg: '#20242c',
            ...same('Quantum Economics'),
            ed: ED_EN,
            desc: QUANTUM_DESC,
            status: 'out',
            face: true
          }
        ]
      },
      {
        sign: d('시장과 진입', 'Market & Entry', '市場と参入'),
        ...EMPTY,
        pos: '70% 90%',
        books: [
          {
            slug: 'isekai',
            cover: '/covers/isekai-ko.jpg',
            spineBg: '#b98f3a',
            spineFg: '#241b0e',
            ...same('이세계 엔터프리너십 입문'),
            ed: ED_KO,
            desc: ISEKAI_DESC,
            status: 'out',
            face: true
          }
        ]
      }
    ]
  },
  {
    no: '02',
    ko: 'AI',
    en: 'AI & Technology',
    ja: 'AI・テクノロジー',
    foil: '#D8E2F5',
    cloths: ['#20304f', '#2b3a5c', '#31456e', '#243b54', '#1c2c44', '#3a4a6b'],
    bays: [
      {
        sign: d('첫 프롬프트', 'First Prompts', 'はじめてのプロンプト'),
        ...EMPTY,
        pos: '50% 90%',
        books: [
          {
            slug: 'ai-bible',
            cover: '/covers/ai-bible.jpg',
            spineBg: '#101c36',
            spineFg: '#e9c568',
            ...same('Awesome AI Bible 2026'),
            ed: ED_EN,
            desc: BIBLE_DESC,
            status: 'out',
            face: true,
            rep: true
          }
        ]
      },
      {sign: SOON, ...EMPTY, pos: '30% 90%', books: []}
    ]
  },
  {
    no: '03',
    ko: '그림책 · 아동',
    en: 'Picture Books & Kids',
    ja: '絵本・子ども',
    foil: '#F2E3C2',
    cloths: ['#3f5243', '#57604a', '#6b5b3e', '#4e4438', '#375046', '#5c5244'],
    bays: [
      {
        sign: d('그림책과 놀이', 'Picture Books & Play', '絵本とあそび'),
        ...EMPTY,
        pos: '70% 90%',
        books: [
          {
            slug: 'ninja-cat',
            cover: '/covers/ninja-cat-ko.jpg',
            spineBg: '#f2cf5b',
            spineFg: '#3a2a1a',
            ...same('덜렁이 닌자 고양이 쿠로편'),
            ed: ED_KO,
            desc: NINJA_DESC,
            status: 'out',
            face: true
          }
        ]
      },
      {sign: SOON, ...EMPTY, pos: '50% 90%', books: []}
    ]
  }
];

// Rail zone captions come from row 01's bay signs.
export const ZONES: Tri[] = SHELVES[0].bays.map((b) => b.sign);

export function tri(locale: string, t: Tri): string {
  if (locale === 'ko') return t.ko;
  if (locale === 'ja') return t.ja;
  return t.en;
}
