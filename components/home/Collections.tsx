import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';

// Gestalten-style editorial collection tiles. Both tiles land on the
// bookstore; its subject filters take over from there.
const TILES = [
  {key: 'catAI', cover: 'c1', icon: '🧠'},
  {key: 'catKIDS', cover: 'c3', icon: '🧒'}
] as const;

export default function Collections() {
  const t = useTranslations('store');
  const tBooks = useTranslations('books');

  return (
    <section className="sec sec-tight sheet">
      <div className="sec-in">
        <Reveal>
          <div className="colls">
            {TILES.map(({key, cover, icon}) => (
              <Link href="/books" className={`coll ${cover}`} key={key}>
                <span className="coll-ic" aria-hidden="true">
                  {icon}
                </span>
                <span className="coll-k">{t('eyebrow')}</span>
                <span className="coll-t">{t(key)}</span>
                <span className="coll-l">{tBooks('viewAll')}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
