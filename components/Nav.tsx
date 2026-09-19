'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/navigation';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import NavAuth from './NavAuth';
import AdminSwitch from './AdminSwitch';

export default function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isHome = pathname === '/';
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

  // M62 — the hero begins under the bar rather than behind it, so there is
  // nothing for the bar to be transparent over: it carries its 페이퍼 ground
  // on every route, from the first pixel of scroll.
  const className = 'nav solid';

  // The reader still anchors to its home section; how-to-buy has its own
  // page now, so it links there.
  const items = [
    {key: 'home', href: '/'},
    {key: 'bookstore', href: '/books'},
    {key: 'reader', href: '/#reader'},
    {key: 'plans', href: '/plans'}
  ] as const;

  return (
    <nav className={className}>
      {/* M60 — menu on the left, the mark in the middle, and on the right
          only the two things a reader needs: the language and the account.
          The burger sits with the menu it opens, not across from it. */}
      <div className="nav-left">
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
      </div>

      <Link href="/" className="nav-logo" aria-label={t('brand')}>
        <BrandLogo size={32} />
      </Link>

      <div className="nav-right">
        {/* Only an admin sees this, and only they can use it. */}
        <AdminSwitch />
        <LanguageSwitcher />
        <NavAuth />
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
          {/* Account moves in here on a phone: the bar itself only has room
              for the logo, the language flag and the burger. */}
          <div className="nav-sheet-auth" onClick={() => setOpen(false)}>
            <AdminSwitch />
            <NavAuth flat />
          </div>
        </div>
      )}
    </nav>
  );
}
