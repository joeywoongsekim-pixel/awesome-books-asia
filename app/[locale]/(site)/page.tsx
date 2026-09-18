import {setRequestLocale} from 'next-intl/server';
import BookHero from '../../../components/home/BookHero';
import HeroVision from '../../../components/home/HeroVision';
import Shelf from '../../../components/home/Shelf';
import Categories from '../../../components/home/Categories';
import Spotlights from '../../../components/home/Spotlights';
import HowItWorks from '../../../components/home/HowItWorks';
import Plans from '../../../components/home/Plans';
import Newsletter from '../../../components/home/Newsletter';
import Journal from '../../../components/home/Journal';
import RecentlyViewed from '../../../components/home/RecentlyViewed';
import UspBar from '../../../components/home/UspBar';

// Homepage skeleton: book hero (one title at a time, full-bleed) → the
// shelf (tabbed, books standing) → categories → spotlights → (plans) →
// newsletter → journal → USP bar → the philosophy carousel, which closes
// the page just above the footer. The announce bar and sticky nav live in
// the (site) layout.
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
      <Spotlights />
      <HowItWorks />
      <Plans />
      <Newsletter />
      <Journal />
      <RecentlyViewed />
      <UspBar />
      <HeroVision />
    </>
  );
}
