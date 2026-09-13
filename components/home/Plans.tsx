import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';

// §9.8 — "how to buy": the site sells nothing itself, so this section
// points at the three real ways to get a book — ebook and print at the
// retailers, samples in the web reader — with no invented pricing.
const WAYS = [
  {key: 'ebook', href: '/books', hot: false},
  {key: 'print', href: '/books', hot: false},
  {key: 'reader', href: '/read/ai-bible', hot: true}
] as const;

export default function Plans() {
  const t = useTranslations('plans');

  return (
    <section className="sec" id="plans">
      <div className="sec-in" style={{textAlign: 'center'}}>
        <Reveal>
          <div className="eyebrow mid">{t('eyebrow')}</div>
          <h2 className="h2">{t('title')}</h2>
          <p className="lead" style={{margin: '0 auto'}}>
            {t('lead')}
          </p>

          <div className="plans" style={{textAlign: 'left'}}>
            {WAYS.map(({key, href, hot}) => (
              <div className={`plan${hot ? ' hot' : ''}`} key={key}>
                <div className="plan-n">{t(`${key}.name`)}</div>
                <div className="plan-where">{t(`${key}.where`)}</div>
                <div className="plan-hr" />
                <p className="plan-d">{t(`${key}.desc`)}</p>
                <Link href={href} className={`plan-c ${hot ? 'pc-g' : 'pc-o'}`}>
                  {t(`${key}.cta`)}
                </Link>
              </div>
            ))}
          </div>

          <div className="coupon">
            {t.rich('coupon', {
              b: (chunks) => <b>{chunks}</b>
            })}
            <Link href="/redeem">{t('couponCta')}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
