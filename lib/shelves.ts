// M9 bookstore walkthrough — shelf wall data.
// Only the published catalogue is shelved (M10): 3 rows × 2 bays sized to the
// four real works. Empty bays carry a "coming soon" plate and filler scenery.
// Fillers are generated in the component — deterministic, aria-hidden.

export type Tri = {ko: string; en: string; ja: string};

export interface WalkBook {
  slug: string; // '' = no detail page yet (drawer hides the link)
  ko: string;
  en: string;
  ja: string;
  desc: Tri; // one sentence
  status: 'out' | 'soon';
  face?: boolean; // front-facing display copy
  rep?: boolean; // the single awesome-blue accent (AI shelf flagship)
  cover?: string;
}

export interface WalkBay {
  sign: Tri; // brass plate
  books: WalkBook[]; // titled books; the rest of the slots are fillers
}

export interface WalkShelf {
  no: string;
  ko: string;
  en: string;
  ja: string;
  foil: string; // spine text colour
  cloths: string[]; // 6 cloth colours, cycled
  low?: boolean; // shorter, thinner books
  bays: WalkBay[];
}

const d = (ko: string, en: string, ja: string): Tri => ({ko, en, ja});

const SOON = d('근간 예정', 'Coming Soon', '近刊予定');

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
        books: [
          {
            slug: 'quantum-econ',
            ko: '양자경제학',
            en: 'Quantum Economics',
            ja: '量子経済学',
            desc: d(
              '경제가 양자 법칙을 따른다면? 선택과 가격을 다시 쓰는 새로운 의사결정 경제학.',
              'What if the economy obeys quantum rules? Why you choose what you choose.',
              '日銀・消費税・推し活まで、ぜんぶ「量子」で説明する教養経済学。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {
        sign: d('시장과 진입', 'Market & Entry', '市場と参入'),
        books: [
          {
            slug: 'isekai',
            ko: '이세계 엔터프리너십 입문',
            en: 'ISEKAI Entrepreneurship',
            ja: '異世界アントレプレナーシップ入門',
            desc: d(
              '경영 이론과 판타지 세계가 만났다 — 실전으로 배우는 기업가정신.',
              'Business theory meets a fantasy world — entrepreneurship learned in the field.',
              '経営学×異世界ファンタジー！実戦で学ぶ起業家精神。'
            ),
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
        books: [
          {
            slug: 'ai-bible',
            ko: '어썸 AI 바이블 2026',
            en: 'Awesome AI Bible 2026',
            ja: 'オーサムAIバイブル2026',
            desc: d(
              '첫 프롬프트부터 조직 정책까지, 생성형 AI의 전 과정을 담은 완전판.',
              'The complete guide to generative AI, from your first prompt to organisational policy.',
              '最初のプロンプトから組織ポリシーまで、生成AIの完全ガイド。'
            ),
            status: 'out',
            face: true,
            rep: true
          }
        ]
      },
      {sign: SOON, books: []}
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
        books: [
          {
            slug: 'ninja-cat',
            ko: '덜렁이 닌자 고양이 쿠로편',
            en: 'Clumsy Ninja Cat Kuro',
            ja: 'おっちょこ忍キャット クロの巻',
            desc: d(
              '마을에서 제일 덜렁대는 닌자 고양이 쿠로의 좌충우돌 수련기.',
              "The village's clumsiest ninja cat fails every mission in the best possible way.",
              '村いちばんのおっちょこちょい忍者猫、クロの修行記。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {sign: SOON, books: []}
    ]
  }
];

// Rail zone captions follow the walk left→right; the rail reads them from
// row 01's bay signs.
export const ZONES: Tri[] = SHELVES[0].bays.map((b) => b.sign);

export function tri(locale: string, t: Tri): string {
  if (locale === 'ko') return t.ko;
  if (locale === 'ja') return t.ja;
  return t.en;
}
