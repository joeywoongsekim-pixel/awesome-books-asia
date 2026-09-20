import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {editionsOf, type Book, type Lang} from '../../lib/books';

// M175 — the other editions of this book, as links.
//
// These used to be tabs that swapped the jacket in place on one page. They
// are not tabs any more because the editions are not one book: the
// Japanese Quantum Economics is "for Japan" and runs 369 pages to the
// English 278, and the English AI's Answers is the India Special Edition
// at 303 to the Japanese 337. Each has its own page, its own address and
// its own entry in the shop, which is what a different book gets.
//
// What a reader loses in that move is the way across, so it is given back
// here: every sibling edition, named by its language, one click away.

const LABELS: Record<Lang, string> = {
  EN: 'English',
  KO: '한국어',
  JA: '日本語'
};

export default function OtherEditions({book}: {book: Book}) {
  const t = useTranslations('detail');
  const all = editionsOf(book);
  if (all.length < 2) return null;

  return (
    <div className="d-eds">
      <span className="d-eds-l">{t('otherEditions')}</span>
      <div className="d-langs">
        {all.map((ed) => {
          const here = ed.id === book.id;
          /* Two editions can share a language — Quantum Economics has an
             English base, a UK and an India — so the language alone does
             not name them. Where it repeats, the edition's own note comes
             with it. */
          const region = regionOf(ed);
          const label = region ? `${LABELS[ed.langs[0]]} · ${region}` : LABELS[ed.langs[0]];
          return here ? (
            <span key={ed.id} className="d-lang on" aria-current="page">
              {label}
            </span>
          ) : (
            <Link key={ed.id} href={`/books/${ed.id}`} className="d-lang">
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* Which region an edition is for, where its id says so. Quantum
   Economics has three English editions — the base one, a UK and an India
   — so the language alone does not tell them apart. The base carries no
   suffix and is named by its language alone. */
function regionOf(book: Book): string | null {
  const tail = /-(uk|in|us)$/.exec(book.id)?.[1];
  return tail ? tail.toUpperCase() : null;
}
