'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Nav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

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

  // Routes beyond the home page arrive in later milestones. For now every
  // menu item resolves to home so the shell has no dead links.
  const items = [
    {key: 'home', href: '/'},
    {key: 'bookstore', href: '/'},
    {key: 'reader', href: '/'},
    {key: 'plans', href: '/'}
  ] as const;

  return (
    <nav className={className}>
      <Link href="/" className="nav-logo">
        <div className="nav-mark">AW</div>
        <div>
          <div className="nav-name">{t('brand')}</div>
          <div className="nav-tag">{t('tagline')}</div>
        </div>
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
        <LanguageSwitcher />
        <Link href="/" className="nav-cta">
          {t('cta')} →
        </Link>
      </div>
    </nav>
  );
}
