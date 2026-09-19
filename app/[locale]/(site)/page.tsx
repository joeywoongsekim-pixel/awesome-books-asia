import {setRequestLocale} from 'next-intl/server';
import BookHero from '../../../components/home/BookHero';
import HeroVision from '../../../components/home/HeroVision';
import Shelf from '../../../components/home/Shelf';
import Categories from '../../../components/home/Categories';
import People from '../../../components/home/People';
import Spotlights from '../../../components/home/Spotlights';
import Newsletter from '../../../components/home/Newsletter';
import Magazine from '../../../components/home/Magazine';
import UspBar from '../../../components/home/UspBar';

// Homepage skeleton: book hero (one title at a time, full-bleed) → the
// shelf (tabbed, books standing) → categories → the people → Awesome
// Reader → newsletter → Awesome Magazine → the philosophy carousel → the
// shops that carry the books, a quiet ticker that closes the page just
// above the footer. The carousel used to sit last; a claim about what
// books are for is a better note to end the reading on than a list of
// storefronts, and the storefronts belong next to the footer's links.
// How-to-buy used
// to sit after the reader; it moved to its own page, because a visitor who
// has not seen a book yet does not need the terms first. The editors'
// notes and the recently-viewed shelf stood where the magazine is now: the
// first was three cards frozen into the translation files, the second
// showed most visitors nothing at all. The announce bar and the sticky nav
// live in the (site) layout.
//
// The magazine reads the database, so the page refreshes on a timer rather
// than staying frozen at build: a new article appears within ten minutes
// without a deploy, and the HTML stays prerendered for everyone else.
export const revalidate = 600;

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  return (
    <>
      <BookHero />
      <Shelf />
      <Categories />
      <People />
      <Spotlights />
      <Newsletter />
      <Magazine locale={locale} />
      <HeroVision />
      <UspBar />
    </>
  );
}
