import {useTranslations} from 'next-intl';

// §9.10 — USP bar: quiet strip above the footer, SEOUL — TOKYO at the end.
export default function UspBar() {
  const t = useTranslations('home.tags');

  return (
    <div className="usp">
      <div className="usp-in">
        <span>{t('four')}</span>
        <span>{t('pages')}</span>
        <span>{t('ai')}</span>
        <span>{t('coupons')}</span>
        <span className="usp-city">Seoul — Tokyo</span>
      </div>
    </div>
  );
}
