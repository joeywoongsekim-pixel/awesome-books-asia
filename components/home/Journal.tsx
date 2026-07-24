import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';
import Reveal from '../Reveal';

// §9.9 — journal, three cards. The posts carry the product pillars as
// editorial notes; each links to a related book.
const POSTS = [
  {key: 'p1', href: '/books/ai-bible', tone: '', num: '01'},
  {key: 'p2', href: '/books/unplugged', tone: 'gold', num: '02'},
  {key: 'p3', href: '/books/prompt-guide', tone: '', num: '03'}
] as const;

export default function Journal() {
  const t = useTranslations('journal');
  const tp = useTranslations('pillars');

  return (
    <section className="sec">
      <div className="sec-in">
        <Reveal>
          <h2 className="h2">{t('title')}</h2>
          <div className="jr-grid">
            {POSTS.map(({key, href, tone, num}) => (
              <Link href={href} className={`jr-card ${tone}`} key={key}>
                <div className="jr-vis">
                  <span className="jr-num">{num}</span>
                </div>
                <div className="jr-body">
                  <span className="jr-k">{tp(`${key}.no`)}</span>
                  <h3 className="jr-t">
                    <Multiline text={tp.raw(`${key}.title`) as string} />
                  </h3>
                  <p className="jr-x">{tp(`${key}.desc`)}</p>
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
