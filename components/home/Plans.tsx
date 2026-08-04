import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import CheckoutButton from '../CheckoutButton';
import Reveal from '../Reveal';

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
            <div className="plan">
              <div className="plan-n">{t('single.name')}</div>
              <div className="plan-p">
                $7<span style={{fontSize: 19, color: 'var(--ink-3)'}}>–15</span>
              </div>
              <div className="plan-pd">{t('single.pd')}</div>
              <div className="plan-hr" />
              <ul className="plan-f">
                <li>{t('single.f1')}</li>
                <li>{t('single.f2')}</li>
                <li>{t('single.f3')}</li>
                <li>{t('single.f4')}</li>
              </ul>
              <Link href="/books" className="plan-c pc-o">
                {t('single.cta')}
              </Link>
            </div>

            <div className="plan hot">
              <div className="plan-tag">{t('monthly.tag')}</div>
              <div className="plan-n">{t('monthly.name')}</div>
              <div className="plan-p">$9.99</div>
              <div className="plan-pd">{t('monthly.pd')}</div>
              <div className="plan-hr" />
              <ul className="plan-f">
                <li>{t('monthly.f1')}</li>
                <li>{t('monthly.f2')}</li>
                <li>{t('monthly.f3')}</li>
                <li>{t('monthly.f4')}</li>
                <li>{t('monthly.f5')}</li>
              </ul>
              <CheckoutButton target={{kind: 'sub', plan: 'monthly'}} className="plan-c pc-g">
                {t('monthly.cta')}
              </CheckoutButton>
            </div>

            <div className="plan">
              <div className="plan-n">{t('annual.name')}</div>
              <div className="plan-p">
                $79<span style={{fontSize: 18, color: 'var(--ink-3)'}}>.99</span>
              </div>
              <div className="plan-pd">{t('annual.pd')}</div>
              <div className="plan-hr" />
              <ul className="plan-f">
                <li>{t('annual.f1')}</li>
                <li>{t('annual.f2')}</li>
                <li>{t('annual.f3')}</li>
                <li>{t('annual.f4')}</li>
              </ul>
              <CheckoutButton target={{kind: 'sub', plan: 'annual'}} className="plan-c pc-o">
                {t('annual.cta')}
              </CheckoutButton>
            </div>
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
