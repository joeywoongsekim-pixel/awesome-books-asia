import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — Awesome Reader, on a live demo desk: tap a book and it comes down.
//
// Written from the reader's side. This section has carried, in turn, a
// feature list, a claim about browsers and installs, and a price sticker
// under the button — none of which anyone came here to read. What is left
// is the thing a reader actually feels at a desk like this one: the book
// you put down is still open where you left it.
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
          </div>
        </div>
      </Reveal>
    </div>
  );
}
