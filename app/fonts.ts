import {
  Playfair_Display,
  Lora,
  DM_Sans,
  Space_Mono,
  Noto_Serif_KR
} from 'next/font/google';

// Display / headings
export const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap'
});

// Body serif (prose, book text)
export const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap'
});

// UI / labels / buttons
export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap'
});

// Numerals, metadata, code
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap'
});

// Korean fallback serif. No `latin` subset is required; skip preload.
export const notoSerifKR = Noto_Serif_KR({
  weight: ['400', '600'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
  preload: false
});

export const fontVariables = [
  playfair.variable,
  lora.variable,
  dmSans.variable,
  spaceMono.variable,
  notoSerifKR.variable
].join(' ');
