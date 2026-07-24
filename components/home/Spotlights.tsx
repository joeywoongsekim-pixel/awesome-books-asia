import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import Multiline from '../Multiline';
import Reveal from '../Reveal';
import MiniDesk from './MiniDesk';

// §9.7 — two spotlight bands, photo/panel left-right alternated. Ours carry
// the product plates: the interactive four-book desk, then the AI desk.
export default function Spotlights() {
  const t = useTranslations();

  return (
    <div className="spots">
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
              <div className="v-row q">How do all four explain &quot;prompting&quot;?</div>
              <div className="v-row">
                AI Bible — as a five-part structure<s>p.6</s>
              </div>
              <div className="v-row">
                Prompt Guide — as seven patterns<s>p.2</s>
              </div>
              <div className="v-row">
                Unplugged — as saying steps in order<s>p.4</s>
              </div>
            </div>
          </div>
          <div className="spot-txt">
            <div className="eyebrow">{t('pillars.eyebrow')}</div>
            <h2 className="spot-t">
              <Multiline text={t.raw('pillars.p3.title') as string} />
            </h2>
            <p className="spot-lead">{t('pillars.p3.desc')}</p>
            <Link href="/books" className="btn-o">
              {t('books.viewAll')}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
