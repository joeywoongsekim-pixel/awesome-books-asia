import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {BOOKS, DEMO_BOOKS} from '../../../../lib/books';
import {redirect} from '../../../../i18n/navigation';
import Reader from '../../../../components/reader/Reader';
import DbReader, {type DbContent} from '../../../../components/reader/DbReader';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {isEntitled} from '../../../../lib/entitlement';

// The reader owns its chrome (no site nav/footer) — it lives outside the
// (site) route group. Auth-backed reading progress makes this route dynamic.
export const dynamic = 'force-dynamic';

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const demo = BOOKS.find((b) => b.id === slug);
  if (demo) return {title: `${demo.title} — Awesome Books Asia Reader`};
  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServer();
    const {data} = await supabase.from('books').select('title').eq('slug', slug).maybeSingle();
    if (data) return {title: `${data.title} — Awesome Books Asia Reader`};
  }
  return {};
}

export default async function ReadPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const index = DEMO_BOOKS.findIndex((b) => b.id === slug);
  // A catalogue title with no sample yet sends the reader to its book page.
  const inCatalogue = BOOKS.some((b) => b.id === slug);
  const noSample = () =>
    inCatalogue ? redirect({href: `/books/${slug}`, locale}) : notFound();

  // The reader is members-only, samples included: nobody opens a book here
  // without an account. `next` brings them back to this page afterwards.
  const toLogin = () =>
    redirect({href: {pathname: '/auth/login', query: {next: `/read/${slug}`}}, locale});

  // Without Supabase there is no session to check, so the gate fails closed.
  if (!hasSupabaseEnv()) return toLogin();

  const supabase = await createSupabaseServer();
  const [
    {
      data: {user}
    },
    {data: bookRow},
    {data: content}
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('books').select('id, slug, title, author').eq('slug', slug).maybeSingle(),
    // Sampling is enforced inside the RPC: unentitled sessions get the
    // sample chapters and full=false; entitled ones the whole book.
    supabase.rpc('get_book_content', {p_slug: slug, p_locale: locale})
  ]);
  if (!user) return toLogin();
  const signedIn = true;

  // Pipeline-processed book → the DB-backed reader.
  if (content && bookRow) {
    let initialPage = 0;
    let canSync = false;
    if (user) {
      canSync = true;
      const {data: progress} = await supabase
        .from('reading_progress')
        .select('spread_index')
        .eq('book_id', bookRow.id)
        .eq('locale', locale)
        .maybeSingle();
      initialPage = Math.max(progress?.spread_index ?? 0, 0);
    }
    return (
      <DbReader
        slug={bookRow.slug}
        locale={locale}
        title={bookRow.title}
        author={bookRow.author}
        content={content as DbContent}
        bookId={bookRow.id}
        signedIn={signedIn}
        canSync={canSync}
        initialPage={initialPage}
        owner={user?.email ?? null}
      />
    );
  }

  // Legacy demo desk (the built-in books with sample spreads).
  if (index === -1) return noSample();

  let bookId: string | null = bookRow?.id ?? null;
  let initialSpread = 0;
  let canSync = false;
  let entitled = false;
  if (user && bookId) {
    canSync = true;
    entitled = await isEntitled(supabase, bookId);
    const {data: progress} = await supabase
      .from('reading_progress')
      .select('spread_index')
      .eq('book_id', bookId)
      .eq('locale', locale)
      .maybeSingle();
    const max = Math.ceil(DEMO_BOOKS[index].sp.length / 2) - 1;
    initialSpread = Math.min(Math.max(progress?.spread_index ?? 0, 0), max);
    // Unentitled readers never resume past the free sample.
    if (!entitled) initialSpread = Math.min(initialSpread, 2);
  }

  return (
    <Reader
      initialIndex={index}
      locale={locale}
      bookId={bookId}
      initialSpread={initialSpread}
      canSync={canSync}
      entitled={entitled}
      signedIn={signedIn}
      owner={user?.email ?? null}
    />
  );
}
