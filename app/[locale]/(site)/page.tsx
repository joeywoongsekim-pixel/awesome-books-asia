import {setRequestLocale} from 'next-intl/server';
import BookHero from '../../../components/home/BookHero';
import HeroVision from '../../../components/home/HeroVision';
import Shelf from '../../../components/home/Shelf';
import Categories from '../../../components/home/Categories';
import People from '../../../components/home/People';
import Spotlights from '../../../components/home/Spotlights';
import Newsletter from '../../../components/home/Newsletter';
import Journal from '../../../components/home/Journal';
import RecentlyViewed from '../../../components/home/RecentlyViewed';
import UspBar from '../../../components/home/UspBar';

// Homepage skeleton: book hero (one title at a time, full-bleed) → the
// shelf (tabbed, books standing) → categories → the people → Awesome
// Reader → newsletter → journal → USP bar → the philosophy carousel,
// which closes the page just above the footer. How-to-buy used to sit
// after the reader; it moved to its own page, because a visitor who has
// not seen a book yet does not need the terms first. The announce bar and
// sticky nav live in the (site) layout.
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
      <Journal />
      <RecentlyViewed />
      <UspBar />
      <HeroVision />
    </>
  );
}
