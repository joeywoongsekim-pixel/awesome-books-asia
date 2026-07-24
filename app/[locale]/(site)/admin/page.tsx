import {setRequestLocale, getTranslations} from 'next-intl/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminOverview({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const [sales, subs, usedCoupons, allCoupons, books] = await Promise.all([
    supabase.from('purchases').select('books(price_cents)'),
    supabase
      .from('subscriptions')
      .select('id', {count: 'exact', head: true})
      .eq('status', 'active'),
    supabase
      .from('coupons')
      .select('id', {count: 'exact', head: true})
      .eq('is_used', true),
    supabase.from('coupons').select('id', {count: 'exact', head: true}),
    supabase.from('books').select('id', {count: 'exact', head: true})
  ]);

  const rows = (sales.data ?? []) as {books: {price_cents: number} | {price_cents: number}[] | null}[];
  const revenueCents = rows.reduce((sum, r) => {
    const b = Array.isArray(r.books) ? r.books[0] : r.books;
    return sum + (b?.price_cents ?? 0);
  }, 0);

  const stats = [
    {label: t('revenue'), value: `$${(revenueCents / 100).toFixed(2)}`},
    {label: t('sales'), value: String(rows.length)},
    {label: t('subs'), value: String(subs.count ?? 0)},
    {label: t('redeemed'), value: `${usedCoupons.count ?? 0} / ${allCoupons.count ?? 0}`},
    {label: t('catalogue'), value: String(books.count ?? 0)}
  ];

  return (
    <div className="adm-stats">
      {stats.map(({label, value}) => (
        <div className="adm-stat" key={label}>
          <div className="adm-stat-v">{value}</div>
          <div className="adm-stat-l">{label}</div>
        </div>
      ))}
    </div>
  );
}
