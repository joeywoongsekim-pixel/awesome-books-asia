import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — Awesome Reader, on a live demo desk: tap a book and it comes down.
//
// This section used to carry a feature list — four books at once, three
// languages, the page kept across devices. That is a spec sheet, and a
// publisher's home page is not where anyone reads one. A visitor needs to
// know our books can be read here and where the button is; the rest they
// find by using it.
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
