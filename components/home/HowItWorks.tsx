import {useTranslations} from 'next-intl';
import Reveal from '../Reveal';

const STEPS = [{key: 's1'}, {key: 's2'}, {key: 's3'}] as const;

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
            {STEPS.map(({key}) => (
              <div className="step" key={key}>
                <div className="st-n">{t(`${key}.no`)}</div>
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
