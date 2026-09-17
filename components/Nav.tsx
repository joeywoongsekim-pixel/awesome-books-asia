'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/navigation';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import NavAuth from './NavAuth';

export default function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // The mobile sheet closes on navigation and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Transparent over the hero; blurred dark backdrop after 40px of scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On non-home routes it starts solid; on home it depends on scroll.
  const className = [
    'nav',
    !isHome ? 'solid' : scrolled ? 'stuck' : ''
  ]
    .filter(Boolean)
    .join(' ');

  // Reader and Plans anchor to their home sections (per prototype).
  const items = [
    {key: 'home', href: '/'},
    {key: 'bookstore', href: '/books'},
    {key: 'reader', href: '/#reader'},
    {key: 'plans', href: '/#plans'}
  ] as const;

  return (
    <nav className={className}>
      {/* Guide §웹사이트: the horizontal lockup sits top-left, 28–36px tall. */}
      <Link href="/" className="nav-logo" aria-label={t('brand')}>
        <BrandLogo size={32} />
      </Link>

      <ul className="nav-menu">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className={item.key === 'home' && isHome ? 'on' : undefined}
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-right">
        <NavAuth />
        <LanguageSwitcher />
        <Link href="/read/ai-bible" className="nav-cta">
          {t('cta')} →
        </Link>
        <button
          type="button"
          className={`nav-burger${open ? ' open' : ''}`}
          aria-label={t('menu')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav-sheet">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={item.key === 'home' && isHome ? 'on' : undefined}
              onClick={() => setOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <Link href="/read/ai-bible" className="nav-sheet-cta" onClick={() => setOpen(false)}>
            {t('cta')} →
          </Link>
          {/* Account moves in here on a phone: the bar itself only has room
              for the logo, the language flag and this button. */}
          <div className="nav-sheet-auth" onClick={() => setOpen(false)}>
            <NavAuth />
          </div>
        </div>
      )}
    </nav>
  );
}
