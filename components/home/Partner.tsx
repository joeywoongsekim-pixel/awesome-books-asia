import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';
import Reveal from '../Reveal';

export default function Partner() {
  const t = useTranslations('partner');

  return (
    <section className="partner">
      <div className="partner-in">
        <Reveal>
          <div className="eyebrow mid">{t('eyebrow')}</div>
          <h2 className="h2">
            <Multiline text={t.raw('title') as string} />
          </h2>
          <p className="lead" style={{margin: '0 auto 30px', textAlign: 'center'}}>
            {t('lead')}
          </p>
          <Link href="/" className="btn-o">
            {t('cta')}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
