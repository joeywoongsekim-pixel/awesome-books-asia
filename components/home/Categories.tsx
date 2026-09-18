import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';

// §9.6 — four ways into the shelf. A photograph, then the name under it:
// the label never sits on the picture.
const TILES = [
  {en: 'AI & Technology', key: 'catAI', img: 's2'},
  {en: 'Education', key: 'catEDU', img: 's3'},
  {en: 'Children', key: 'catKIDS', img: 's4'},
  {en: 'The Library', key: 'all', img: 's1'}
] as const;

export default function Categories() {
  const t = useTranslations('store');
  const tFooter = useTranslations('footer.libraryLinks');

  return (
    <section className="sec sec-tight">
      <div className="sec-in">
        <Reveal>
          <div className="cats">
            {TILES.map(({en, key, img}) => (
              <Link href="/books" className="cat" key={key}>
                <span className="cat-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/hero/${img}.webp`} alt="" loading="lazy" />
                </span>
                <span className="cat-t">{key === 'all' ? tFooter('all') : t(key)}</span>
                <span className="cat-k">{en}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
