import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import RoomStore from '../../../../components/store/RoomStore';
import WorldHero from '../../../../components/world/WorldHero';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'store'});
  return {title: `${t('title')} — AwesomeBooks`};
}

export default async function BooksPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  return (
    <>
      <RoomStore />
      <WorldHero />
    </>
  );
}
