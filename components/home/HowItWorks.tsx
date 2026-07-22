import {useTranslations} from 'next-intl';
import Reveal from '../Reveal';

const STEPS = [
  {key: 's1', icon: '👤'},
  {key: 's2', icon: '💳'},
  {key: 's3', icon: '📖'}
] as const;

export default function HowItWorks() {
  const t = useTranslations('steps');

  return (
    <section className="sec sheet sec-tight">
      <div className="sec-in" style={{textAlign: 'center'}}>
        <Reveal>
          <div className="eyebrow mid">{t('eyebrow')}</div>
          <h2 className="h2">{t('title')}</h2>
          <p className="lead" style={{margin: '0 auto'}}>
            {t('lead')}
          </p>
          <div className="steps" style={{textAlign: 'left'}}>
            {STEPS.map(({key, icon}) => (
              <div className="step" key={key}>
                <div className="st-n">{t(`${key}.no`)}</div>
                <span className="st-i">{icon}</span>
                <div className="st-h">{t(`${key}.title`)}</div>
                <div className="st-d">{t(`${key}.desc`)}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
