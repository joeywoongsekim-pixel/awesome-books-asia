import {setRequestLocale} from 'next-intl/server';
import HeroVision from '../../../components/home/HeroVision';
import NewReleases from '../../../components/home/NewReleases';
import Categories from '../../../components/home/Categories';
import Spotlights from '../../../components/home/Spotlights';
import HowItWorks from '../../../components/home/HowItWorks';
import Plans from '../../../components/home/Plans';
import Newsletter from '../../../components/home/Newsletter';
import Journal from '../../../components/home/Journal';
import RecentlyViewed from '../../../components/home/RecentlyViewed';
import UspBar from '../../../components/home/UspBar';

// Homepage skeleton: vision hero (slides) → new-release slider → categories →
// spotlights → (plans) → newsletter → journal → USP bar. The announce bar and
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
      <HeroVision />
      <NewReleases />
      <Categories />
      <Spotlights />
      <HowItWorks />
      <Plans />
      <Newsletter />
      <Journal />
      <RecentlyViewed />
      <UspBar />
    </>
  );
}
