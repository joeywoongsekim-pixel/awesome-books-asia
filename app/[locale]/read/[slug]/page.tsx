import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '../../../../i18n/navigation';
import {BOOKS, type Book} from '../../../../lib/books';

// The reader owns its chrome (no site nav/footer) — it lives outside the
// (site) route group. M4 replaces this placeholder with the four-book desk.

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

function ReaderSoon({book}: {book: Book}) {
  const t = useTranslations('reader');

  return (
    <main className="reader-soon">
      <div className="rs-ic" aria-hidden="true">
        {book.ic}
      </div>
      <div className="rs-book">{book.title}</div>
      <h1 className="rs-title">{t('soonTitle')}</h1>
      <p className="rs-desc">{t('soonDesc')}</p>
      <Link href="/books" className="btn-o">
        {t('back')}
      </Link>
    </main>
  );
}

export default async function ReadPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const book = BOOKS.find((b) => b.id === slug);
  if (!book) notFound();

  return <ReaderSoon book={book} />;
}
