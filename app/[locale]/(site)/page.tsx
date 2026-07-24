import {setRequestLocale} from 'next-intl/server';
import Hero from '../../../components/home/Hero';
import Pillars from '../../../components/home/Pillars';
import BooksSection from '../../../components/home/BooksSection';
import Collections from '../../../components/home/Collections';
import HowItWorks from '../../../components/home/HowItWorks';
import Plans from '../../../components/home/Plans';
import Partner from '../../../components/home/Partner';

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
      <Hero />
      <Pillars />
      <BooksSection />
      <Collections />
      <HowItWorks />
      <Plans />
      <Partner />
    </>
  );
}
