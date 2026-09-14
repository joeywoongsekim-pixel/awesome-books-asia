import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link} from '../i18n/navigation';
import FooterLangs from './FooterLangs';
import AdminLink from './AdminLink';

const CONTACT = 'contact@awesomebooks.asia';

export default function Footer() {
  const t = useTranslations('footer');

  // Only real destinations: the company column is a contact address until
  // the about/FAQ/refund pages exist — no links that lead back to home.
  const columns = [
    {
      heading: t('library'),
      links: [
        {label: t('libraryLinks.all'), href: '/books'},
        {label: t('libraryLinks.ai'), href: '/books'},
        {label: t('libraryLinks.kids'), href: '/books'},
        {label: t('libraryLinks.education'), href: '/books'},
        {label: t('libraryLinks.new'), href: '/books'}
      ],
      extra: null
    },
    {
      heading: t('account'),
      links: [
        {label: t('accountLinks.signup'), href: '/auth/signup'},
        {label: t('accountLinks.login'), href: '/auth/login'},
        {label: t('accountLinks.library'), href: '/library'},
        {label: t('accountLinks.redeem'), href: '/redeem'}
      ],
      extra: <AdminLink />
    },
    {
      heading: t('company'),
      links: [],
      extra: (
        <li>
          <a href={`mailto:${CONTACT}`}>{t('companyLinks.contact')}</a>
        </li>
      )
    }
  ];

  return (
    <footer>
      <div className="f-top">
        <div>
          <Image src="/logo.jpg" alt="" width={56} height={56} className="f-logo" />
          <div className="f-name">{t('brand')}</div>
          <div className="f-tag">Awesome Books Asia · Publishing House</div>
          <div className="f-d">{t('description')}</div>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="f-ct">{col.heading}</div>
            <ul className="f-l">
              {col.links.map(({label, href}) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
              {col.extra}
            </ul>
          </div>
        ))}
      </div>
      <div className="f-bot">
        <div>{t('copyright')}</div>
        <FooterLangs />
      </div>
    </footer>
  );
}
