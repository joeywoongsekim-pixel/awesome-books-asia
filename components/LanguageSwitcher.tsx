'use client';

import {useState, useRef, useEffect} from 'react';
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

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, {locale: next});
  }

  return (
    <div className="nav-lang" ref={ref}>
      <button
        type="button"
        className="nav-lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🌐 {LABELS[locale]} ▾
      </button>
      {open && (
        <div className="nav-lang-menu" role="listbox">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              className={l === locale ? 'on' : undefined}
              onClick={() => switchTo(l)}
            >
              {LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
