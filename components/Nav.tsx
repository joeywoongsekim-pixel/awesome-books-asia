'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link, usePathname} from '../i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import NavAuth from './NavAuth';

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

  // Reader and Plans anchor to their home sections (per prototype).
  const items = [
    {key: 'home', href: '/'},
    {key: 'bookstore', href: '/books'},
    {key: 'reader', href: '/#reader'},
    {key: 'plans', href: '/#plans'}
  ] as const;

  return (
    <nav className={className}>
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

      <Link href="/" className="nav-logo">
        <Image src="/logo.jpg" alt="" width={40} height={40} className="nav-mark" />
        <span className="nav-name">{t('brand')}</span>
      </Link>

      <div className="nav-right">
        <NavAuth />
        <LanguageSwitcher />
        <Link href="/read/ai-bible" className="nav-cta">
          {t('cta')} →
        </Link>
      </div>
    </nav>
  );
}
