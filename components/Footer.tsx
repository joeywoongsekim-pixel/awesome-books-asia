import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link} from '../i18n/navigation';
import FooterLangs from './FooterLangs';

export default function Footer() {
  const t = useTranslations('footer');

  // Account/company destinations arrive in later milestones (M5+).
  const columns = [
    {
      heading: t('library'),
      links: [
        {label: t('libraryLinks.all'), href: '/books'},
        {label: t('libraryLinks.ai'), href: '/books'},
        {label: t('libraryLinks.kids'), href: '/books'},
        {label: t('libraryLinks.education'), href: '/books'},
        {label: t('libraryLinks.new'), href: '/books'}
      ]
    },
    {
      heading: t('account'),
      links: [
        {label: t('accountLinks.signup'), href: '/'},
        {label: t('accountLinks.login'), href: '/'},
        {label: t('accountLinks.library'), href: '/'},
        {label: t('accountLinks.subscription'), href: '/'},
        {label: t('accountLinks.redeem'), href: '/'}
      ]
    },
    {
      heading: t('company'),
      links: [
        {label: t('companyLinks.about'), href: '/'},
        {label: t('companyLinks.partnerships'), href: '/'},
        {label: t('companyLinks.contact'), href: '/'},
        {label: t('companyLinks.faq'), href: '/'},
        {label: t('companyLinks.refund'), href: '/'}
      ]
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
