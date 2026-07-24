'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '../i18n/navigation';
import {routing, type Locale} from '../i18n/routing';
import {LOCALE_LABELS, LOCALE_FLAGS} from '../lib/locales';

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
          {LOCALE_FLAGS[l]} {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
