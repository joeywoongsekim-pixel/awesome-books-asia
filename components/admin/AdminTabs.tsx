'use client';

import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../../i18n/navigation';

const TABS = [
  {href: '/admin', key: 'overview', exact: true},
  {href: '/admin/books', key: 'books', exact: false},
  {href: '/admin/coupons', key: 'coupons', exact: false}
] as const;

export default function AdminTabs() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <nav className="adm-tabs">
      {TABS.map(({href, key, exact}) => {
        const on = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={key} href={href} className={on ? 'on' : undefined}>
            {t(key)}
          </Link>
        );
      })}
      <Link href="/" className="adm-back">
        ← {t('back')}
      </Link>
    </nav>
  );
}
