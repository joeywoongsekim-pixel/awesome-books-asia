import {
  Cormorant_Garamond,
  Montserrat,
  Noto_Serif_KR,
  Noto_Sans_KR,
  Noto_Serif_JP,
  Playfair_Display,
  Lora,
  DM_Sans,
  Righteous,
  Space_Mono
} from 'next/font/google';

/* ── Brand fonts (brand guide v1.0 · 타이포그래피) ──────────────────────
   The guide names exactly two: Righteous for the wordmark and short English
   titles (one weight, no Korean or Japanese glyphs, never body text), and
   Pretendard for every title and paragraph in all three languages.
   Pretendard is not on Google Fonts; the layout head loads its dynamic
   subset from the CDN, which is why only Righteous appears here.        */

// 1/2 — 로고 워드마크 + 짧은 영문 제목 전용
export const righteous = Righteous({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous',
  display: 'swap'
});

/* ── Legacy faces: the reader desk and the demo book interiors ────────── */

// Headings — 제목 (Serif KR 900/700)
export const notoSerifKR = Noto_Serif_KR({
  weight: ['400', '600', '700', '900'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
  preload: false
});

// Body — 본문 (Sans KR 400/500/700)
export const notoSansKR = Noto_Sans_KR({
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: false
});

// Latin labels — 영문 라벨 (Montserrat 700, uppercase, tracked)
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap'
});

// Japanese headings — 和文見出し
export const notoSerifJP = Noto_Serif_JP({
  weight: ['600'],
  variable: '--font-noto-serif-jp',
  display: 'swap',
  preload: false
});

/* ── Reader fonts (dark desk keeps its original book typography) ───────── */

export const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap'
});

export const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap'
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap'
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap'
});

// Bookstore walkthrough headings/spines (M9) — only the weights it uses
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-cormorant',
  display: 'swap'
});

export const fontVariables = [
  righteous.variable,
  cormorant.variable,
  notoSerifKR.variable,
  notoSansKR.variable,
  montserrat.variable,
  notoSerifJP.variable,
  playfair.variable,
  lora.variable,
  dmSans.variable,
  spaceMono.variable
].join(' ');
