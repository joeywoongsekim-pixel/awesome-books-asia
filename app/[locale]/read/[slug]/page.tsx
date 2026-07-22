import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BOOKS} from '../../../../lib/books';
import Reader from '../../../../components/reader/Reader';

// The reader owns its chrome (no site nav/footer) — it lives outside the
// (site) route group.

export function generateStaticParams() {
  return BOOKS.map((book) => ({slug: book.id}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const book = BOOKS.find((b) => b.id === slug);
  return book ? {title: `${book.title} — AwesomeBooks Reader`} : {};
}

export default async function ReadPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const index = BOOKS.findIndex((b) => b.id === slug);
  if (index === -1) notFound();

  return <Reader initialIndex={index} />;
}
