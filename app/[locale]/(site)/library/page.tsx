import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {redirect} from '../../../../i18n/navigation';
import {Link} from '../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

type BookRef = {slug: string; title: string; author: string | null; icon: string | null};
const bookRef = (b: BookRef | BookRef[] | null): BookRef | null =>
  Array.isArray(b) ? (b[0] ?? null) : b;

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'library'});
  return {title: `${t('title')} — AwesomeBooks`};
}

export default async function LibraryPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  const t = await getTranslations('library');

  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) redirect({href: '/auth/login', locale});

  const [{data: progress}, {data: purchases}, {data: bookmarks}] = await Promise.all([
    supabase
      .from('reading_progress')
      .select('spread_index, locale, updated_at, books(slug, title, author, icon)')
      .order('updated_at', {ascending: false}),
    supabase
      .from('purchases')
      .select('created_at, books(slug, title, author, icon)')
      .order('created_at', {ascending: false}),
    supabase
      .from('bookmarks')
      .select('id, page_index, locale, created_at, books(slug, title, author, icon)')
      .order('created_at', {ascending: false})
      .limit(20)
  ]);

  return (
    <div className="lib">
      <div className="eyebrow">{user!.email}</div>
      <h1 className="h2">{t('title')}</h1>

      <h2 className="lib-h">{t('continue')}</h2>
      {progress?.length ? (
        <div className="lib-grid">
          {progress.map((row) => {
            const b = bookRef(row.books);
            if (!b) return null;
            return (
              <Link
                href={`/read/${b.slug}`}
                className="lib-card"
                key={`${b.slug}-${row.locale}`}
              >
                <span className="lib-ic">{b.icon}</span>
                <span className="lib-t">{b.title}</span>
                <span className="lib-m">
                  {row.locale.toUpperCase()} · p.{row.spread_index * 2 + 2}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="lib-empty">
          {t('empty')} <Link href="/books">{t('browse')}</Link>
        </p>
      )}

      <h2 className="lib-h">{t('owned')}</h2>
      {purchases?.length ? (
        <div className="lib-grid">
          {purchases.map((row) => {
            const b = bookRef(row.books);
            if (!b) return null;
            return (
              <Link href={`/read/${b.slug}`} className="lib-card" key={b.slug}>
                <span className="lib-ic">{b.icon}</span>
                <span className="lib-t">{b.title}</span>
                <span className="lib-m">{b.author}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="lib-empty">
          {t('empty')} <Link href="/books">{t('browse')}</Link>
        </p>
      )}

      <h2 className="lib-h">{t('bookmarks')}</h2>
      {bookmarks?.length ? (
        <ul className="lib-marks">
          {bookmarks.map((row) => {
            const b = bookRef(row.books);
            if (!b) return null;
            return (
              <li key={row.id}>
                <Link href={`/read/${b.slug}`}>
                  {b.icon} {b.title}
                </Link>
                <s>
                  {row.locale.toUpperCase()} · p.{row.page_index + 1}
                </s>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="lib-empty">{t('empty')}</p>
      )}
    </div>
  );
}
