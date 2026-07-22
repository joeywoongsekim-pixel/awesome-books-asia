import {useTranslations} from 'next-intl';
import Multiline from '../Multiline';
import Reveal from '../Reveal';

// Pillar visuals are decorative, CSS-driven scenes (see globals.css .v-*).
function DeskVis() {
  return (
    <div className="v-desk">
      <div className="v-bk">
        <i />
        <i />
        <i />
      </div>
      <div className="v-bk main">
        <i />
        <i />
        <i />
      </div>
      <div className="v-bk">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function PageVis() {
  return (
    <div className="v-page">
      <div className="v-sheet" />
      <div className="v-curl" />
    </div>
  );
}

// Demo content mirrors the prototype; the desk-context answers stay in the
// books' authored language.
function AiVis() {
  return (
    <div className="v-ai">
      <div className="v-row q">How do all four explain &quot;prompting&quot;?</div>
      <div className="v-row">
        🧠 AI Bible — as a five-part structure<s>p.6</s>
      </div>
      <div className="v-row">
        📝 Prompt Guide — as seven patterns<s>p.2</s>
      </div>
      <div className="v-row">
        🧒 Unplugged — as saying steps in order<s>p.4</s>
      </div>
    </div>
  );
}

const PILLARS = [
  {key: 'p1', vis: <DeskVis />},
  {key: 'p2', vis: <PageVis />},
  {key: 'p3', vis: <AiVis />}
] as const;

export default function Pillars() {
  const t = useTranslations('pillars');

  return (
    <section className="sec" id="reader">
      <div className="sec-in">
        <Reveal>
          <div className="eyebrow">{t('eyebrow')}</div>
          <h2 className="h2">
            <Multiline text={t.raw('title') as string} />
          </h2>
          <p className="lead">{t('lead')}</p>

          <div className="pillars">
            {PILLARS.map(({key, vis}) => (
              <div className="pillar" key={key}>
                <div className="p-txt">
                  <div className="p-no">{t(`${key}.no`)}</div>
                  <h3 className="p-h">
                    <Multiline text={t.raw(`${key}.title`) as string} />
                  </h3>
                  <p className="p-d">{t(`${key}.desc`)}</p>
                  <div className="p-note">{t(`${key}.note`)}</div>
                </div>
                <div className="p-vis">{vis}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
