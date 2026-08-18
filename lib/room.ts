// M15 — the bookstore as a room (adventure-game view).
// Three walls, two bookcases per wall, six category cases in sweep order
// (left wall near→far, back wall left→right, right wall far→near).
// Each case has three shelf levels; every book on them is a published
// edition. Empty cases wait for future titles.

import type {Tri, WalkBook} from './shelves';

export interface RoomCase {
  no: string;
  name: Tri;
  soon?: boolean; // no published titles yet
  levels: WalkBook[][]; // exactly 3 shelf levels, top→bottom
}

const d = (ko: string, en: string, ja: string): Tri => ({ko, en, ja});
const same = (s: string): Tri => ({ko: s, en: s, ja: s});

const ED_KO = d('한국어판', 'Korean Edition', '韓国語版');
const ED_EN = d('영문판', 'English Edition', '英語版');
const ED_JA = d('일본어판', 'Japanese Edition', '日本語版');

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

const quantumEN: WalkBook = {
  slug: 'quantum-econ',
  cover: '/covers/quantum-econ.jpg',
  spineBg: '#ece7db',
  spineFg: '#20242c',
  ...same('Quantum Economics'),
  ed: ED_EN,
  desc: QUANTUM_DESC,
  status: 'out',
  face: true
};
const quantumJA: WalkBook = {
  slug: 'quantum-econ',
  cover: '/covers/quantum-econ-ja.jpg',
  spineBg: '#1a1440',
  spineFg: '#f2df66',
  ...same('量子経済学'),
  ed: ED_JA,
  desc: QUANTUM_DESC,
  status: 'out',
  face: true
};
const isekaiKO: WalkBook = {
  slug: 'isekai',
  cover: '/covers/isekai-ko.jpg',
  spineBg: '#b98f3a',
  spineFg: '#241b0e',
  ...same('이세계 엔터프리너십 입문'),
  ed: ED_KO,
  desc: ISEKAI_DESC,
  status: 'out',
  face: true
};
const isekaiEN: WalkBook = {
  slug: 'isekai',
  cover: '/covers/isekai.jpg',
  spineBg: '#233f37',
  spineFg: '#f2c94c',
  ...same('ISEKAI Entrepreneurship'),
  ed: ED_EN,
  desc: ISEKAI_DESC,
  status: 'out',
  face: true
};
const isekaiJA: WalkBook = {
  slug: 'isekai',
  cover: '/covers/isekai-ja.jpg',
  spineBg: '#44502a',
  spineFg: '#f2e4b8',
  ...same('異世界アントレプレナーシップ入門'),
  ed: ED_JA,
  desc: ISEKAI_DESC,
  status: 'out',
  face: true
};
const bibleEN: WalkBook = {
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
};
const bibleJA: WalkBook = {
  slug: 'ai-bible',
  cover: '/covers/ai-bible-ja.jpg',
  spineBg: '#16233d',
  spineFg: '#e9c568',
  ...same('AIバイブル 2026'),
  ed: ED_JA,
  desc: BIBLE_DESC,
  status: 'out',
  face: true
};
const ninjaKO: WalkBook = {
  slug: 'ninja-cat',
  cover: '/covers/ninja-cat-ko.jpg',
  spineBg: '#f2cf5b',
  spineFg: '#3a2a1a',
  ...same('덜렁이 닌자 고양이 쿠로편'),
  ed: ED_KO,
  desc: NINJA_DESC,
  status: 'out',
  face: true
};
const ninjaJA: WalkBook = {
  slug: 'ninja-cat',
  cover: '/covers/ninja-cat.jpg',
  spineBg: '#e8b64a',
  spineFg: '#3a2a1a',
  ...same('おっちょこ忍キャット クロの巻'),
  ed: ED_JA,
  desc: NINJA_DESC,
  status: 'out',
  face: true
};

export const CASES: RoomCase[] = [
  // ── left wall ──
  {
    no: '01',
    name: d('그림책 · 아동', 'Picture Books & Kids', '絵本・子ども'),
    levels: [[], [ninjaKO, ninjaJA], []]
  },
  {
    no: '02',
    name: d('교육 · 어학', 'Education & Language', '教育・語学'),
    soon: true,
    levels: [[], [], []]
  },
  // ── back wall ──
  {
    no: '03',
    name: d('경제 · 경영', 'Economics & Business', '経済・経営'),
    levels: [[quantumEN, quantumJA], [isekaiKO, isekaiEN, isekaiJA], []]
  },
  {
    no: '04',
    name: d('AI · 테크', 'AI & Technology', 'AI・テック'),
    levels: [[], [bibleEN, bibleJA], []]
  },
  // ── right wall ──
  {
    no: '05',
    name: d('에세이 · 교양', 'Essays & Ideas', 'エッセイ・教養'),
    soon: true,
    levels: [[], [], []]
  },
  {
    no: '06',
    name: d('문고판 · 클래식', 'Paperback Classics', '文庫・クラシック'),
    soon: true,
    levels: [[], [], []]
  }
];
