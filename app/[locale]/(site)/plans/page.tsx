import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {PLANS_PAGE_LIVE} from '../../../../lib/flags';
import {routing} from '../../../../i18n/routing';
import Plans from '../../../../components/home/Plans';

// Where to buy, and the terms behind the reader — free until the shelf
// reaches 30 books, a free sample subscription to 100, new titles held by
// Amazon for their first 90 days, and sign-up by coupon during the trial.
//
// This used to sit on the home page. A visitor arriving at a publisher
// does not need to be handed all of it before they have seen a book, but
// it is all still owed to anyone who goes looking, so it has a page.
/* Hidden for now — see lib/flags.ts. Unlinking it from the menu is not
   hiding it: the address still answers, and what is already in a search
   index still leads here. So the page refuses, and no locale of it is
   built. */
export function generateStaticParams() {
  return PLANS_PAGE_LIVE ? routing.locales.map((locale) => ({locale})) : [];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  if (!PLANS_PAGE_LIVE) return {title: 'Awesome Books Asia', robots: {index: false, follow: false}};
  const t = await getTranslations({locale, namespace: 'plans'});
  return {title: `${t('title')} — Awesome Books Asia`, description: t('lead')};
}

export default async function PlansPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  if (!PLANS_PAGE_LIVE) notFound();
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  return <Plans />;
}
