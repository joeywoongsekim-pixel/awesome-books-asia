import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminBooks({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const {data: books} = await supabase
    .from('books')
    .select('id, slug, title, author, category, price_cents, is_new, book_editions(id)')
    .order('created_at', {ascending: true});

  return (
    <>
      <div className="adm-bar">
        <Link href="/admin/books/new" className="btn-g adm-btn">
          {t('newBook')}
        </Link>
      </div>
      <table className="adm-table">
        <thead>
          <tr>
            <th>{t('fieldTitle')}</th>
            <th>{t('slug')}</th>
            <th>{t('category')}</th>
            <th>{t('fieldAuthor')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(books ?? []).map((b) => (
            <tr key={b.id}>
              <td>
                {b.title}
                {b.is_new && <span className="adm-new">NEW</span>}
              </td>
              <td className="adm-mono">{b.slug}</td>
              <td>{b.category}</td>
              <td>{b.author}</td>
              <td>
                <Link href={`/admin/books/${b.id}`} className="adm-link">
                  {t('edit')} →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
