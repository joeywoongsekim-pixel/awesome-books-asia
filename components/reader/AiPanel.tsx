'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {BOOKS, type Book} from '../../lib/books';

// Canned demo answers, generated from the LIVE desk (order + reading
// positions) exactly like the prototype — every answer cites book and page.
// Answers quote the books' authored (English) content; a real model arrives
// with the M5+ backend.

type DeskItem = {book: Book; page: number};
type Msg = {kind: 'me' | 'ai' | 'think'; content: string};

const cite = (d: DeskItem) =>
  `<span class="src">${d.book.ic} ${d.book.title.split(' ').slice(0, 2).join(' ')} p.${d.page}</span>`;

function answerFor(n: number, desk: DeskItem[]): string {
  if (n === 0) {
    return (
      `<p>Four different framings sitting side by side — that is the useful part.</p>` +
      desk.map((d) => `<p><b>${d.book.title}</b> treats it ${d.book.angle}. ${cite(d)}</p>`).join('') +
      `<p style="opacity:.7">→ The gap between <b>${desk[0].book.title}</b> and <b>${
        desk[desk.length - 1].book.title
      }</b> is the widest, which makes them the most useful pair to read against each other.</p>`
    );
  }
  if (n === 1) {
    const kid = desk.find((d) => d.book.kids);
    const rest = desk.filter((d) => !d.book.kids);
    return kid
      ? `<p><b>${kid.book.title}</b>, without hesitation. ${cite(kid)}</p>` +
          `<p>It is the only book on this desk written for that age, and it deliberately leaves out the abstractions the others lean on.</p>` +
          `<p>Once they are comfortable, <b>${rest[0].book.title}</b> is the natural next step — same ideas, adult vocabulary. ${cite(rest[0])}</p>` +
          `<p style="opacity:.7">→ Skipping straight to the adult titles usually produces recall without understanding.</p>`
      : `<p>Nothing currently on your desk is written for that age.</p><p>Bring <b>Unplugged Coding for Kids</b> or <b>Little Robot's Big Day</b> down from the library and I can compare them properly.</p>`;
  }
  const sorted = [...desk].sort((a, b) => (a.book.level || 2) - (b.book.level || 2));
  const weeks = ['Weeks 1–3', 'Weeks 4–7', 'Weeks 8–10', 'Weeks 11–12'];
  return (
    `<p>The four on your desk separate cleanly by level, so a <b>twelve-week shape</b> falls out almost by itself.</p>` +
    sorted
      .map(
        (d, i) =>
          `<p><b>${weeks[i]}</b> — ${d.book.title} ${cite(d)}<br><span style="opacity:.62">${
            d.book.blurb.split('.')[0]
          }.</span></p>`
      )
      .join('') +
    `<p style="opacity:.7">→ ${
      sorted[sorted.length - 1].book.title
    } goes last because the earlier three teach <b>how</b>, and it is the only one that asks <b>why</b>.</p>`
  );
}

function customAnswer(desk: DeskItem[]): string {
  const names = desk.map((d) => d.book.title).join(', ');
  return (
    `<p>This is where I would read across <b>${desk.length} books</b> on your desk — ${names}.</p>` +
    `<p style="opacity:.6">※ Prototype: no live model is connected. In the real build, the current page text of every open book is sent along as context.</p>`
  );
}

export default function AiPanel({
  open,
  order,
  spreadOf
}: {
  open: boolean;
  order: number[];
  spreadOf: Record<number, number>;
}) {
  const t = useTranslations('reader');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  const desk: DeskItem[] = order.map((bi) => ({
    book: BOOKS[bi],
    page: (spreadOf[bi] ?? 0) * 2 + 2
  }));

  const asked = msgs.length > 0;

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  function ask(n: number | null, custom?: string) {
    const q = custom ?? t(`sugg${(n ?? 0) + 1}`);
    const answer = custom !== undefined ? customAnswer(desk) : answerFor(n ?? 0, desk);
    setMsgs((m) => [...m, {kind: 'me', content: q}, {kind: 'think', content: ''}]);
    setTimeout(() => {
      setMsgs((m) => [...m.filter((x) => x.kind !== 'think'), {kind: 'ai', content: answer}]);
    }, 1050);
  }

  function send() {
    const v = input.trim();
    if (!v) return;
    setInput('');
    ask(null, v);
  }

  return (
    <aside className={`ai${open ? ' open' : ''}`}>
      <div className="ai-top">
        <div className="ai-title">
          <span className="ai-dot" /> {t('aiTitle')}
        </div>
        <div className="ai-note">
          {t.rich('aiNote', {
            b: (chunks) => <b>{chunks}</b>
          })}
        </div>
      </div>

      <div className="ai-desk">
        <div className="ai-dh">◆ {t('aiDeskHeading')}</div>
        <div>
          {desk.map((d, i) => (
            <div className={`chip${i === 0 ? ' main' : ''}`} key={d.book.id}>
              <span>{d.book.ic}</span>
              <u>{d.book.title}</u>
              <s>
                {i === 0 ? 'MAIN · ' : ''}p.{d.page}
              </s>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-body" ref={bodyRef}>
        {!asked && (
          <>
            <div className="ai-sh">{t('aiSuggHeading')}</div>
            {[0, 1, 2].map((n) => (
              <div className="sugg" key={n} onClick={() => ask(n)}>
                {t(`sugg${n + 1}`)}
              </div>
            ))}
          </>
        )}
        {msgs.map((m, i) => (
          <div className="msg" key={i}>
            {m.kind === 'me' && <div className="msg-me">{m.content}</div>}
            {m.kind === 'think' && (
              <div className="think">
                <i />
                <i />
                <i />
              </div>
            )}
            {m.kind === 'ai' && (
              <div className="msg-ai" dangerouslySetInnerHTML={{__html: m.content}} />
            )}
          </div>
        ))}
      </div>

      <div className="ai-in">
        <input
          value={input}
          placeholder={t('aiPlaceholder')}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
        />
        <button type="button" className="ai-send" onClick={send}>
          ↑
        </button>
      </div>
    </aside>
  );
}
