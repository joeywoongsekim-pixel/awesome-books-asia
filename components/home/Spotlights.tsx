import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — two spotlight bands. First: the web reader (a live demo desk —
// tap a book, it comes down). It is the room subscribers will read in, not
// a sample viewer; the copy says so, and says plainly that subscriptions
// are not open yet. Second: how the house makes books — one title written
// for three languages, and where each edition is sold.
export default function Spotlights() {
  const t = useTranslations();
  const rows = ['r1', 'r2', 'r3'] as const;

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
            <Link href="/read/ai-bible" className="btn-o">
              {t('home.ctaPrimary')}
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="spot flip">
          <div className="spot-vis">
            <div className="v-ai">
              {rows.map((r) => (
                <div className="v-row" key={r}>
                  {t(`story.${r}`)}
                  <s>{t(`story.${r}s`)}</s>
                </div>
              ))}
            </div>
          </div>
          <div className="spot-txt">
            <div className="eyebrow">{t('story.eyebrow')}</div>
            <h2 className="spot-t">
              <Multiline text={t.raw('story.title') as string} />
            </h2>
            <p className="spot-lead">{t('story.lead')}</p>
            <Link href="/books" className="btn-o">
              {t('story.cta')}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
