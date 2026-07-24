'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '../i18n/navigation';
import {routing, type Locale} from '../i18n/routing';

const LABELS: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  fil: 'Filipino',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português'
};

export default function FooterLangs() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="f-langs">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          className={l === locale ? 'on' : undefined}
          onClick={() => l !== locale && router.replace(pathname, {locale: l})}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
