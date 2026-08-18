// M9 bookstore walkthrough — shelf wall data (spec §7).
// Row order is fixed: 01 경제·경영 / 02 AI / 03 교육 / 04 문고판.
// Titled books link to /books/:slug when a detail page exists (lib/books.ts ids);
// planned titles (문고판 readers) ship with status:'soon' and no slug yet.
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
  books: WalkBook[]; // 0–3 titled books; the rest of the 20 slots are fillers
}

export interface WalkShelf {
  no: string;
  ko: string;
  en: string;
  ja: string;
  foil: string; // spine text colour
  cloths: string[]; // 6 cloth colours, cycled
  low?: boolean; // 문고판 — shorter, thinner books (66–75% height)
  bays: [WalkBay, WalkBay, WalkBay];
}

const d = (ko: string, en: string, ja: string): Tri => ({ko, en, ja});

export const SHELVES: WalkShelf[] = [
  {
    no: '01',
    ko: '경제 · 경영',
    en: 'Economics & Business',
    ja: '経済・経営',
    foil: '#EFD9A0',
    cloths: ['#4a3b2f', '#5d4632', '#6e5a3a', '#3e3a45', '#57423b', '#4c4a3a'],
    bays: [
      {sign: d('가격과 이익', 'Pricing & Profit', '価格と利益'), books: []},
      {
        sign: d('시장과 진입', 'Market & Entry', '市場と参入'),
        books: [
          {
            slug: 'isekai',
            ko: '이세계 창업기',
            en: 'Isekai Entrepreneurship',
            ja: '異世界起業記',
            desc: d(
              '판타지 라이트노벨 속에 숨겨 담은 창업의 기본기.',
              'Business fundamentals smuggled inside a fantasy light novel.',
              'ライトノベルに忍ばせた起業の基本。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {
        sign: d('조직과 실행', 'Teams & Execution', '組織と実行'),
        books: [
          {
            slug: 'sme-ai',
            ko: '스몰 비즈니스를 위한 AI',
            en: 'AI for Small Business',
            ja: '中小企業のためのAI',
            desc: d(
              '사람 다섯인 회사가 다음 주부터 쓸 수 있는 AI 실전 도입기.',
              'A hands-on AI playbook a five-person company can start next week.',
              '5人の会社が来週から使えるAI導入の実践書。'
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
      {
        sign: d('일과 자동화', 'Work & Automation', '仕事と自動化'),
        books: [
          {
            slug: 'prompt-guide',
            ko: '프롬프트 엔지니어링 가이드',
            en: 'Prompt Engineering Guide',
            ja: 'プロンプト設計ガイド',
            desc: d(
              '같은 질문에서 다른 결과가 나오는 이유와, 반복 가능한 프롬프트 설계법.',
              'Why the same prompt gives different answers — and how to design repeatable ones.',
              '同じ質問で結果が変わる理由と、再現できるプロンプトの設計法。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {sign: d('조직 도입', 'AI at the Office', '組織への導入'), books: []}
    ]
  },
  {
    no: '03',
    ko: '교육',
    en: 'Education',
    ja: '教育',
    foil: '#F2E3C2',
    cloths: ['#3f5243', '#57604a', '#6b5b3e', '#4e4438', '#375046', '#5c5244'],
    bays: [
      {
        sign: d('디지털 리터러시', 'Digital Literacy', 'デジタルリテラシー'),
        books: [
          {
            slug: 'unplugged',
            ko: '언플러그드 코딩',
            en: 'Unplugged Coding for Kids',
            ja: 'アンプラグド・コーディング',
            desc: d(
              '컴퓨터 없이 종이와 몸으로 배우는 컴퓨팅 사고력.',
              'Computational thinking taught with paper and play — no screen required.',
              'コンピュータなしで学ぶ、紙とあそびのプログラミング思考。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {
        sign: d('아이와 AI', 'Kids & AI', '子どもとAI'),
        books: [
          {
            slug: 'little-robot',
            ko: '꼬마 로봇의 신나는 하루',
            en: "Little Robot's Big Day",
            ja: 'ちびロボのだいぼうけん',
            desc: d(
              'AI가 무엇인지 궁금해진 아이를 위한 첫 그림책.',
              'A first picture book for the child who just asked what AI is.',
              '「AIってなに？」に答える、はじめての絵本。'
            ),
            status: 'out',
            face: true
          }
        ]
      },
      {sign: d('그림책과 놀이', 'Picture Books & Play', '絵本とあそび'), books: []}
    ]
  },
  {
    no: '04',
    ko: '문고판',
    en: 'Paperback Readers',
    ja: '文庫版',
    foil: '#EAD9B0',
    low: true,
    cloths: ['#5a4a56', '#4a4440', '#6b4a3e', '#3f4a55', '#54463a', '#494f58'],
    bays: [
      {
        // 문고판 표지판은 CEFR 레벨 — 순서 고정 (spec §7)
        sign: d('A1 – A2', 'A1 – A2', 'A1 – A2'),
        books: [
          {
            slug: '',
            ko: '이상한 나라의 앨리스',
            en: 'Alice in Wonderland',
            ja: '不思議の国のアリス',
            desc: d(
              '1865년 원작을 A1–A2 어휘로 다시 쓴 첫걸음 리더.',
              'The 1865 classic retold in A1–A2 vocabulary.',
              '1865年の名作をA1–A2語彙で読む。'
            ),
            status: 'soon',
            face: true
          },
          {
            slug: '',
            ko: '홍길동전',
            en: 'The Tale of Hong Gildong',
            ja: '洪吉童伝',
            desc: d(
              '조선의 의적 이야기를 쉬운 문장으로 만나는 한국 고전.',
              "Korea's outlaw-hero classic in simple graded prose.",
              '朝鮮の義賊物語をやさしい文章で。'
            ),
            status: 'soon'
          },
          {
            slug: '',
            ko: '셜록 홈즈 단편선',
            en: 'Sherlock Holmes Stories',
            ja: 'ホームズ短編集',
            desc: d(
              '1892년 단편 세 편을 고른 입문용 추리 리더.',
              'Three 1892 cases picked for first-time mystery readers.',
              '1892年の短編から3話を選んだ入門ミステリー。'
            ),
            status: 'soon'
          }
        ]
      },
      {
        sign: d('B1', 'B1', 'B1'),
        books: [
          {
            slug: '',
            ko: '라쇼몬',
            en: 'Rashomon',
            ja: '羅生門',
            desc: d(
              '아쿠타가와의 1915년 단편, 중급 독해를 위한 판본.',
              "Akutagawa's 1915 story, edited for intermediate readers.",
              '芥川の1915年作を中級向けに編集。'
            ),
            status: 'soon',
            face: true
          },
          {
            slug: '',
            ko: '오만과 편견',
            en: 'Pride and Prejudice',
            ja: '高慢と偏見',
            desc: d(
              '1813년의 대화극을 살린 B1 축약본.',
              'An abridged B1 edition that keeps the 1813 wit intact.',
              '1813年の機知を残したB1縮約版。'
            ),
            status: 'soon'
          },
          {
            slug: '',
            ko: '제인 에어',
            en: 'Jane Eyre',
            ja: 'ジェーン・エア',
            desc: d(
              '1847년 성장 소설을 중급 어휘로 옮긴 판본.',
              'The 1847 coming-of-age novel in intermediate vocabulary.',
              '1847年の成長物語を中級語彙で。'
            ),
            status: 'soon'
          }
        ]
      },
      {
        sign: d('B2 이상', 'B2 and up', 'B2以上'),
        books: [
          {
            slug: '',
            ko: '위대한 개츠비',
            en: 'The Great Gatsby',
            ja: 'グレート・ギャツビー',
            desc: d(
              '1925년 원문의 리듬을 살린 상급 리더.',
              'An upper-level reader that keeps the rhythm of the 1925 text.',
              '1925年原文のリズムを残した上級リーダー。'
            ),
            status: 'soon',
            face: true
          },
          {
            slug: '',
            ko: '죄와 벌',
            en: 'Crime and Punishment',
            ja: '罪と罰',
            desc: d(
              '1866년 심리 소설의 핵심 장면을 담은 상급 판본.',
              'The key movements of the 1866 psychological novel, upper level.',
              '1866年の心理小説の核心を収めた上級版。'
            ),
            status: 'soon'
          },
          {
            slug: '',
            ko: '구운몽',
            en: 'The Cloud Dream of Nine',
            ja: '九雲夢',
            desc: d(
              '1689년 김만중의 꿈 소설, 한국 고전의 정수.',
              "Kim Man-jung's 1689 dream novel — a pinnacle of Korean classics.",
              '1689年、金萬重の夢の物語。'
            ),
            status: 'soon'
          }
        ]
      }
    ]
  }
];

// Rail zone captions follow the walk left→right; the prototype used shelf 01's
// bay names as the zone names (spec §6), so the rail reads them from row 01.
export const ZONES: Tri[] = SHELVES[0].bays.map((b) => b.sign);

export function tri(locale: string, t: Tri): string {
  if (locale === 'ko') return t.ko;
  if (locale === 'ja') return t.ja;
  return t.en;
}
