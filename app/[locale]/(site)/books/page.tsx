import type {Metadata} from 'next';
import {Suspense} from 'react';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import StoreGrid from '../../../../components/store/StoreGrid';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'store'});
  return {title: `${t('title')} — Awesome Books Asia`};
}

export default async function BooksPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  /* The grid reads ?cat= to open on a subject, and a component that reads
     the query string has to sit behind a boundary or the page cannot be
     prerendered at all. */
  return (
    <Suspense>
      <StoreGrid />
    </Suspense>
  );
}
