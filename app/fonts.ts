import {
  Montserrat,
  Noto_Serif_KR,
  Noto_Sans_KR,
  Noto_Serif_JP,
  Playfair_Display,
  Lora,
  DM_Sans,
  Space_Mono
} from 'next/font/google';

/* ── Brand fonts (Awesome Books Asia design guide) ─────────────────────── */

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

export const fontVariables = [
  notoSerifKR.variable,
  notoSansKR.variable,
  montserrat.variable,
  notoSerifJP.variable,
  playfair.variable,
  lora.variable,
  dmSans.variable,
  spaceMono.variable
].join(' ');
