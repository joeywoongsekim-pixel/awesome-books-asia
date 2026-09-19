import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — Awesome Reader, on a live demo desk: tap a book and it comes down.
//
// The section says where the books come from and what they are for: you
// subscribe to Awesome Books Asia here and read it in Awesome Reader, and
// what you are reading is what a changing era is about to ask of you.
// Earlier passes described the software instead — how many books it holds
// open, that it needs no install, what it costs. None of that is the
// reason anyone reads these books.
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
