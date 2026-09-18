import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';
import Reveal from '../Reveal';

// §9.9 — three short notes from the editors, each about one of the
// books on the shelf and linking to it.
const POSTS = [
  {key: 'p1', href: '/books/ai-bible', tone: '', img: 's5'},
  {key: 'p2', href: '/books/ninja-cat', tone: '', img: 's7'},
  {key: 'p3', href: '/books/isekai', tone: '', img: 's6'}
] as const;

export default function Journal() {
  const t = useTranslations('journal');

  return (
    <section className="sec">
      <div className="sec-in">
        <Reveal>
          <h2 className="h2">{t('title')}</h2>
          <div className="jr-grid">
            {POSTS.map(({key, href, tone, img}) => (
              <Link href={href} className={`jr-card ${tone}`} key={key}>
                <div className="jr-vis">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/hero/${img}.webp`} alt="" loading="lazy" />
                </div>
                <div className="jr-body">
                  <span className="jr-k">{t(`${key}.no`)}</span>
                  <h3 className="jr-t">
                    <Multiline text={t.raw(`${key}.title`) as string} />
                  </h3>
                  <p className="jr-x">{t(`${key}.desc`)}</p>
                  <span className="jr-l">{t('readMore')}</span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
