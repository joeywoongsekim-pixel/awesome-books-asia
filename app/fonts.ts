import {
  Cormorant_Garamond,
  Montserrat,
  Noto_Serif_KR,
  Noto_Sans_KR,
  Noto_Serif_JP,
  Noto_Sans_Devanagari,
  Playfair_Display,
  Lora,
  DM_Sans,
  Righteous,
  Instrument_Serif,
  Space_Mono
} from 'next/font/google';

/* ── Brand fonts (brand guide v1.0 · 타이포그래피) ──────────────────────
   The guide names exactly two: Righteous for the wordmark and short English
   titles (one weight, no Korean or Japanese glyphs, never body text), and
   Pretendard for every title and paragraph in all three languages.
   Pretendard is not on Google Fonts; the layout head loads its dynamic
   subset from the CDN, which is why it does not appear here.            */

// 1/2 — 로고 워드마크 + 짧은 영문 제목 전용
export const righteous = Righteous({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous',
  display: 'swap'
});

// 3 — 힌디어. Pretendard has no Devanagari, so Hindi would fall through to
// whatever the device happens to have. This makes the Hindi site look the
// same everywhere, and it is only downloaded on html[lang='hi'].
export const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-devanagari',
  display: 'swap',
  preload: false
});

// 4 — 디스플레이 서체. Righteous carried the display layer for one release
// and read as futuristic, which a publisher is not. Instrument Serif is the
// opposite end: a high-contrast editorial serif, the face a bookshop sets
// its section headings in. One weight, Latin only — same constraints as
// Righteous, so the display-layer rules below it did not have to change.
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display-serif',
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
  notoDevanagari.variable,
  instrumentSerif.variable,
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
