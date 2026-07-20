import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import FooterLangs from './FooterLangs';

export default function Footer() {
  const t = useTranslations('footer');

  // Destinations arrive in later milestones; links resolve to home for now.
  const columns = [
    {
      heading: t('library'),
      links: [
        t('libraryLinks.all'),
        t('libraryLinks.ai'),
        t('libraryLinks.kids'),
        t('libraryLinks.education'),
        t('libraryLinks.new')
      ]
    },
    {
      heading: t('account'),
      links: [
        t('accountLinks.signup'),
        t('accountLinks.login'),
        t('accountLinks.library'),
        t('accountLinks.subscription'),
        t('accountLinks.redeem')
      ]
    },
    {
      heading: t('company'),
      links: [
        t('companyLinks.about'),
        t('companyLinks.partnerships'),
        t('companyLinks.contact'),
        t('companyLinks.faq'),
        t('companyLinks.refund')
      ]
    }
  ];

  return (
    <footer>
      <div className="f-top">
        <div>
          <div className="f-name">{t('brand')}</div>
          <div className="f-tag">{t('tagline')}</div>
          <div className="f-d">{t('description')}</div>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="f-ct">{col.heading}</div>
            <ul className="f-l">
              {col.links.map((label) => (
                <li key={label}>
                  <Link href="/">{label}</Link>
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
