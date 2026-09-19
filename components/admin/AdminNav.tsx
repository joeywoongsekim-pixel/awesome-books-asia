'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../../i18n/navigation';

// A rail rather than tabs: the sections stay on screen while you work in
// one, and the content keeps the full width instead of sharing a row with
// the navigation. On a phone it lies down into a scrolling strip.
const SECTIONS = [
  {href: '/admin', key: 'overview', exact: true},
  {href: '/admin/books', key: 'books', exact: false},
  {href: '/admin/coupons', key: 'coupons', exact: false},
  {href: '/admin/inbox', key: 'inbox', exact: false}
] as const;

export default function AdminNav() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <nav className="ac-nav" aria-label={t('title')}>
      {SECTIONS.map(({href, key, exact}) => {
        const on = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={key} href={href} className={on ? 'on' : undefined}>
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
