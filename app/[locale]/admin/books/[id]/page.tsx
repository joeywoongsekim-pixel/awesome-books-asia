import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {createSupabaseServer} from '../../../../../lib/supabase/server';
import BookStudio, {
  type AdminBook,
  type AdminContent,
  type AdminEdition
} from '../../../../../components/admin/BookStudio';
import type {StudioContent} from '../../../../../components/admin/ChapterStudio';

export const dynamic = 'force-dynamic';

export default async function AdminBookEdit({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  if (id === 'new') return <BookStudio book={null} editions={[]} />;

  const supabase = await createSupabaseServer();
  const {data: book} = await supabase
    .from('books')
    .select(
      'id, slug, title, author, category, level, is_new, published, price_cents, page_count, published_at, reader_from, cover_url'
    )
    .eq('id', id)
    .maybeSingle();
  if (!book) notFound();

  const [{data: editions}, {data: contents}] = await Promise.all([
    supabase
      .from('book_editions')
      .select('id, locale, title, pdf_path, epub_path')
      .eq('book_id', id)
      .order('locale'),
    // Full rows: the writing studio re-opens authored chapters for editing.
    supabase
      .from('book_content')
      .select('locale, kind, processed_at, chapters, sample')
      .eq('book_id', id)
  ]);

  return (
    <BookStudio
      book={book as AdminBook}
      editions={(editions ?? []) as AdminEdition[]}
      contents={(contents ?? []) as AdminContent[]}
      studio={(contents ?? []) as unknown as StudioContent[]}
    />
  );
}
