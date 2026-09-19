import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import {ADMIN_MAIL} from '../../lib/contact';

// §9.8 — "how to buy": the site sells nothing itself, so this section
// points at the three real ways to get a book — ebook and print at the
// retailers, the web reader — with no invented pricing.
const WAYS = [
  {key: 'ebook', href: '/books', hot: false},
  {key: 'print', href: '/books', hot: false},
  {key: 'reader', href: '/read/ai-bible', hot: true}
] as const;

// The three things a visitor has to know before the reader makes sense:
// what the membership costs and until when, why a brand-new title is not
// here yet, and how to get an account while we are still in trial.
const NOTES = ['noteFree', 'noteAmazon', 'noteInvite'] as const;

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

          <ul className="plan-notes">
            {NOTES.map((key) => (
              <li key={key}>
                {t.rich(key, {
                  b: (chunks) => <b>{chunks}</b>,
                  mail: (chunks) => <a href={`mailto:${ADMIN_MAIL}`}>{chunks}</a>
                })}
              </li>
            ))}
          </ul>

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
