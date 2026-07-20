import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-in">
        <div className="h-badge">
          <i /> {t('badge')}
        </div>
        <h1 className="h-title">
          {t.rich('title', {
            em: (chunks) => <em>{chunks}</em>
          })}
        </h1>
        <p className="h-sub">{t('subtitle')}</p>
        <div className="h-meta">{t('meta')}</div>
        <div className="h-btns">
          <Link href="/" className="btn-g">
            📖 {t('ctaPrimary')} →
          </Link>
          <Link href="/" className="btn-o">
            {t('ctaSecondary')}
          </Link>
        </div>
        <div className="scaffold-note">⚙ {t('scaffoldNote')}</div>
      </div>
    </section>
  );
}
