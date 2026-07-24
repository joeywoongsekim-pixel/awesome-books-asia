import {useTranslations} from 'next-intl';

// §9.2 — deep-navy band carrying the brand slogan.
export default function AnnounceBar() {
  const t = useTranslations('home');
  return <div className="announce">{t('announce')}</div>;
}
