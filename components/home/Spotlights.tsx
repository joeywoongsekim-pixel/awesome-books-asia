import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — the web reader, on a live demo desk: tap a book and it comes down.
// It is the room subscribers read in, not a sample viewer. The lead says
// what the room is; the three points say what you do in it, which is what
// the old four-sentence paragraph was trying to carry all at once.
const POINTS = ['desk', 'langs', 'resume'] as const;

export default function Spotlights() {
  const t = useTranslations();

  return (
    <div className="spots" id="reader">
      <Reveal>
        <div className="spot">
          <div className="spot-vis">
            <MiniDesk
              caption={t.rich('home.demoCaption', {
                b: (chunks) => <b>{chunks}</b>
              })}
            />
          </div>
          <div className="spot-txt">
            <div className="eyebrow">{t('home.badge')}</div>
            <h2 className="spot-t">
              {t.rich('home.title', {
                em: (chunks) => <em>{chunks}</em>
              })}
            </h2>
            <p className="spot-lead">{t('home.subtitle')}</p>

            <ul className="spot-points">
              {POINTS.map((key) => (
                <li key={key}>
                  <span className="spot-pt">{t(`home.points.${key}.t`)}</span>
                  <span className="spot-pd">{t(`home.points.${key}.d`)}</span>
                </li>
              ))}
            </ul>

            <Link href="/read/ai-bible" className="btn-o">
              {t('home.ctaPrimary')}
            </Link>
            {/* Signing in is the first thing that happens when they click. */}
            <p className="spot-note">{t('home.ctaNote')}</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
