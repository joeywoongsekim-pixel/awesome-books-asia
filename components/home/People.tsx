'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslations} from 'next-intl';
import {BOOKS} from '../../lib/books';
import {PEOPLE, ROLES, ROLE_LABEL, inRole, initials, type Person, type Role} from '../../lib/people';

// §9.6b — the people behind the books. Three tabs, worked the same way as
// the shelf's 신간/베스트셀러/커밍순, and under them one row that runs on
// sideways: the cards are the width of a category tile and the row scrolls
// rather than wrapping. The row carries the name and nothing else; press a
// portrait and the card opens with everything the house has on that person.
function titleOf(id: string) {
  return BOOKS.find((b) => b.id === id)?.title ?? '';
}

function Portrait({p}: {p: Person}) {
  return p.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/people/${p.id}.webp`} alt="" loading="lazy" />
  ) : (
    <span className="ppl-mono" aria-hidden="true">
      {initials(p.name)}
    </span>
  );
}

export default function People() {
  const t = useTranslations('people');
  const live = ROLES.filter((r) => inRole(r).length > 0);
  const [role, setRole] = useState<Role>(live[0] ?? 'author');
  const [open, setOpen] = useState<Person | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (live.length === 0) return null;
  const list = inRole(role);

  return (
    <section className="sec sec-tight sec-ppl">
      <div className="sec-in">
        <h2 className="cats-h">{t('title')}</h2>

        {live.length > 1 && (
          // the shelf's tab row, so the two read as the same control
          <div className="nsh-tabs" role="tablist">
            {live.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === role}
                className={r === role ? 'on' : undefined}
                onClick={() => setRole(r)}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        )}

        <div className="ppl-scroll" tabIndex={0} aria-label={ROLE_LABEL[role]}>
          {list.map((p) => (
            <div className="ppl-p" key={p.id}>
              <button
                type="button"
                className="ppl-img"
                aria-label={p.name}
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setOpen(p);
                }}
              >
                <Portrait p={p} />
              </button>
              <span className="ppl-n">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pc-back" onClick={close}>
            <div
              className="pc"
              role="dialog"
              aria-modal="true"
              aria-label={open.name}
              tabIndex={-1}
              ref={panel}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="pc-x" onClick={close} aria-label={t('close')}>
                ×
              </button>
              <div className="pc-img">
                <Portrait p={open} />
              </div>
              <div className="pc-txt">
                <div className="pc-roles">
                  {ROLES.filter((r) => open.credits[r] !== undefined)
                    .map((r) => ROLE_LABEL[r])
                    .join(' · ')}
                </div>
                <h3 className="pc-n">{open.name}</h3>
                {open.hasBio &&
                  (t(`bio.${open.id}`) as string)
                    .split('\n\n')
                    .map((para, n) => (
                      <p className="pc-bio" key={n}>
                        {para}
                      </p>
                    ))}

                {ROLES.filter((r) => (open.credits[r] ?? []).length > 0).map((r) => (
                  <div className="pc-cr" key={r}>
                    <div className="pc-cr-h">{ROLE_LABEL[r]}</div>
                    <ul>
                      {(open.credits[r] ?? []).map((c) => (
                        <li key={`${r}-${c.id}-${c.langs?.join('') ?? ''}`}>
                          {titleOf(c.id)}
                          {c.langs?.length ? <i className="pc-ed">{c.langs.join(' · ')}</i> : null}
                        </li>
                      ))}
                      {/* Published work and work in progress belong under the
                          same heading — it is the same role — but a title that
                          is not out yet says so rather than sitting in the list
                          as though it were. */}
                      {(open.soon?.[r] ?? []).map((title) => (
                        <li className="pc-wip" key={`${r}-soon-${title}`}>
                          {title}
                          <i className="pc-ed">{t('inProgress')}</i>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* A role held but not yet published in says so under its own
                    heading: "nothing recorded" and "not out yet" are different
                    facts and must not be collapsed into one line. */}
                {ROLES.filter(
                  (r) => open.credits[r] !== undefined && (open.credits[r] ?? []).length === 0
                ).map((r) => (
                  <div className="pc-cr" key={`soon-${r}`}>
                    <div className="pc-cr-h">{ROLE_LABEL[r]}</div>
                    <p className="pc-bio pc-soon">
                      {open.forthcoming?.includes(r) ? t('inProgress') : t('noCredits')}
                      {open.soon?.[r]?.length ? ` · ${open.soon[r]!.join(' · ')}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
