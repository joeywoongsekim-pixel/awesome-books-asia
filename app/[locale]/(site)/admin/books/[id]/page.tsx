import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {createSupabaseServer} from '../../../../../../lib/supabase/server';
import BookForm, {
  type AdminBook,
  type AdminEdition
} from '../../../../../../components/admin/BookForm';

export const dynamic = 'force-dynamic';

export default async function AdminBookEdit({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  setRequestLocale(locale);

  if (id === 'new') return <BookForm book={null} editions={[]} />;

  const supabase = await createSupabaseServer();
  const {data: book} = await supabase
    .from('books')
    .select('id, slug, title, author, category, level, is_new, price_cents, page_count, published_at')
    .eq('id', id)
    .maybeSingle();
  if (!book) notFound();

  const {data: editions} = await supabase
    .from('book_editions')
    .select('id, locale, title, pdf_path, epub_path')
    .eq('book_id', id)
    .order('locale');

  return <BookForm book={book as AdminBook} editions={(editions ?? []) as AdminEdition[]} />;
}
