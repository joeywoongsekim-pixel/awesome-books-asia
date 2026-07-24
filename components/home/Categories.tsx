import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';

// §9.6 — category tiles: white card, hairline border, gold corner rule,
// Latin label above a serif localized title.
const TILES = [
  {en: 'AI & Technology', key: 'catAI'},
  {en: 'Education', key: 'catEDU'},
  {en: 'Children', key: 'catKIDS'},
  {en: 'The Library', key: 'all'}
] as const;

export default function Categories() {
  const t = useTranslations('store');
  const tFooter = useTranslations('footer.libraryLinks');

  return (
    <section className="sec sec-tight">
      <div className="sec-in">
        <Reveal>
          <div className="cats">
            {TILES.map(({en, key}) => (
              <Link href="/books" className="cat" key={key}>
                <span className="cat-k">{en}</span>
                <span className="cat-t">{key === 'all' ? tFooter('all') : t(key)}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
