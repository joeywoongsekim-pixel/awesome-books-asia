import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';

// §9.7 — Awesome Reader.
//
// The section says where the books come from and what they are for: you
// subscribe to Awesome Books Asia here and read it in Awesome Reader, and
// what you are reading is what a changing era is about to ask of you.
// Earlier passes described the software instead — how many books it holds
// open, that it needs no install, what it costs. None of that is the
// reason anyone reads these books.
//
// The picture used to be an interactive demo desk: tap a book on the shelf
// and it came down into the spread. That demonstrated the software, which
// is the thing this section stopped being about. A still life does the
// branding work instead — a publisher that makes objects worth looking at,
// with the paper book and the screen lit by the same late sun.
export default function Spotlights() {
  const t = useTranslations();

  return (
    <div className="spots" id="reader">
      <Reveal>
        <div className="spot">
          <div className="spot-vis">
            <figure className="spot-photo">
              {/* Decorative: the heading beside it carries the meaning. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/spot/reader-desk.webp"
                alt=""
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
            </figure>
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
