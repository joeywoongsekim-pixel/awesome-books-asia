import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BOOKS} from '../../../../lib/books';
import Reader from '../../../../components/reader/Reader';
import {createSupabaseServer} from '../../../../lib/supabase/server';

// The reader owns its chrome (no site nav/footer) — it lives outside the
// (site) route group. Auth-backed reading progress makes this route dynamic.
export const dynamic = 'force-dynamic';

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

  // Signed-in readers resume where they left off; progress and bookmarks
  // sync back as they read (RLS: each user sees only their own rows).
  let bookId: string | null = null;
  let initialSpread = 0;
  let canSync = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createSupabaseServer();
    const [
      {
        data: {user}
      },
      {data: bookRow}
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('books').select('id').eq('slug', slug).maybeSingle()
    ]);
    bookId = bookRow?.id ?? null;
    if (user && bookId) {
      canSync = true;
      const {data: progress} = await supabase
        .from('reading_progress')
        .select('spread_index')
        .eq('book_id', bookId)
        .eq('locale', locale)
        .maybeSingle();
      const max = Math.ceil(BOOKS[index].sp.length / 2) - 1;
      initialSpread = Math.min(Math.max(progress?.spread_index ?? 0, 0), max);
    }
  }

  return (
    <Reader
      initialIndex={index}
      locale={locale}
      bookId={bookId}
      initialSpread={initialSpread}
      canSync={canSync}
    />
  );
}
