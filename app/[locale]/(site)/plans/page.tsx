import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {routing} from '../../../../i18n/routing';
import Plans from '../../../../components/home/Plans';

// Where to buy, and the terms behind the reader — free until the shelf
// reaches 30 books, a free sample subscription to 100, new titles held by
// Amazon for their first 90 days, and sign-up by coupon during the trial.
//
// This used to sit on the home page. A visitor arriving at a publisher
// does not need to be handed all of it before they have seen a book, but
// it is all still owed to anyone who goes looking, so it has a page.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'plans'});
  return {title: `${t('title')} — Awesome Books Asia`, description: t('lead')};
}

export default async function PlansPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  return <Plans />;
}
