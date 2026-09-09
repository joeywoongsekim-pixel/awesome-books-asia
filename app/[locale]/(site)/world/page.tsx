import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import WorldClient from '../../../../components/world/WorldClient';

export const metadata: Metadata = {
  title: 'World — AwesomeBooks'
};

export default async function WorldPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  return <WorldClient />;
}
