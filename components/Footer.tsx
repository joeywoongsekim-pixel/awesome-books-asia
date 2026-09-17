import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import BrandLogo from './BrandLogo';
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
          {/* 반전형 — 어두운 바탕에서는 워드마크를 페이퍼로. Under it, the
              localized name: 한국어 어썸북스아시아, 일본어 オーサムブックス
              アジア, always beside the English so the two are read together.
              Locales that use the English name skip the line. */}
          <BrandLogo size={40} reverse className="f-logo" />
          {t('brand') !== 'Awesome Books Asia' && <div className="f-tag">{t('brand')}</div>}
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
