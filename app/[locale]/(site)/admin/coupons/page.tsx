import {setRequestLocale, getTranslations} from 'next-intl/server';
import {createSupabaseServer} from '../../../../../lib/supabase/server';
import CouponGenerator from '../../../../../components/admin/CouponGenerator';

export const dynamic = 'force-dynamic';

type CouponRow = {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
  books: {title: string} | {title: string}[] | null;
};

export default async function AdminCoupons({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const [{data: coupons}, {data: books}] = await Promise.all([
    supabase
      .from('coupons')
      .select('id, code, type, is_used, expires_at, created_at, books(title)')
      .order('created_at', {ascending: false})
      .limit(200),
    supabase.from('books').select('id, title').order('title')
  ]);

  const typeLabel = (type: string) =>
    type === 'subscription_30d'
      ? t('type30')
      : type === 'subscription_365d'
        ? t('type365')
        : t('fieldBook');

  return (
    <>
      <CouponGenerator books={books ?? []} />
      <table className="adm-table">
        <thead>
          <tr>
            <th>{t('code')}</th>
            <th>{t('type')}</th>
            <th>{t('fieldBook')}</th>
            <th>{t('status')}</th>
            <th>{t('expires')}</th>
          </tr>
        </thead>
        <tbody>
          {((coupons ?? []) as CouponRow[]).map((c) => {
            const b = Array.isArray(c.books) ? c.books[0] : c.books;
            return (
              <tr key={c.id}>
                <td className="adm-mono">{c.code}</td>
                <td>{typeLabel(c.type)}</td>
                <td>{b?.title ?? '—'}</td>
                <td>{c.is_used ? t('used') : t('unused')}</td>
                <td className="adm-mono">
                  {c.expires_at ? c.expires_at.slice(0, 10) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
