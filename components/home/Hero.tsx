import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import MiniDesk from './MiniDesk';

export default function Hero() {
  const t = useTranslations('home');

  return (
    <section className="hero">
      <div className="hero-in">
        <div>
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
            <Link href="/read/ai-bible" className="btn-g">
              {t('ctaPrimary')} →
            </Link>
            <Link href="/books" className="btn-o">
              {t('ctaSecondary')}
            </Link>
          </div>
          <div className="h-tags">
            <div className="h-tag">{t('tags.four')}</div>
            <div className="h-tag">{t('tags.pages')}</div>
            <div className="h-tag">{t('tags.ai')}</div>
            <div className="h-tag">{t('tags.coupons')}</div>
          </div>
        </div>

        <MiniDesk
          caption={t.rich('demoCaption', {
            b: (chunks) => <b>{chunks}</b>
          })}
        />
      </div>
    </section>
  );
}
