import {useTranslations} from 'next-intl';
import {BOOKS} from '../../lib/books';
import {ROLES, ROLE_LABEL, inRole, initials} from '../../lib/people';
import Reveal from '../Reveal';

// §9.6b — the people behind the books, laid out the way the categories are:
// a picture, then the name under it. One group per role, and a group is
// only rendered when someone is credited in it, so no heading stands over
// an empty row. Someone with two roles appears in both.
function titleOf(id: string) {
  return BOOKS.find((b) => b.id === id)?.title ?? '';
}

export default function People() {
  const t = useTranslations('people');
  const groups = ROLES.map((r) => [r, inRole(r)] as const).filter(([, list]) => list.length > 0);

  return (
    <section className="sec sec-tight sec-ppl">
      <div className="sec-in">
        <Reveal>
          <h2 className="cats-h">{t('title')}</h2>
          {groups.map(([role, list]) => (
            <div className="ppl-g" key={role}>
              <div className="ppl-role">{ROLE_LABEL[role]}</div>
              <div className="ppl">
                {list.map((p) => {
                  const books = p.credits[role] ?? [];
                  return (
                    <div className="ppl-p" key={p.id}>
                      <span className="ppl-img">
                        {p.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/people/${p.id}.webp`} alt="" loading="lazy" />
                        ) : (
                          <span className="ppl-mono" aria-hidden="true">
                            {initials(p.name)}
                          </span>
                        )}
                      </span>
                      <span className="ppl-n">{p.name}</span>
                      {books.length > 0 ? (
                        <span className="ppl-b">{books.map(titleOf).join(' · ')}</span>
                      ) : p.forthcoming ? (
                        <span className="ppl-b ppl-soon">{t('inProgress')}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
