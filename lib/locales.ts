import type {Locale} from '../i18n/routing';

// Shared by the nav language switcher and the footer language row.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  fil: 'Filipino',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português'
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  ko: '🇰🇷',
  ja: '🇯🇵',
  fil: '🇵🇭',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇵🇹'
};
