import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../../i18n/navigation';
import {createSupabaseServer} from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

type BookRow = {
  id: string;
  title: string;
  published: boolean;
  book_content: {locale: string}[];
};
type CouponRow = {
  id: string;
  code: string;
  type: string;
  is_used: boolean;
  created_at: string;
};

// The overview used to be five tiles and then nothing — a page you looked
// at rather than worked from. The numbers now sit in one compact strip and
// the space below answers the two questions actually asked at a desk:
// which coupons went out, and which books still need something done.
export default async function AdminOverview({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const [sales, subs, allCoupons, usedCoupons, recent, books] = await Promise.all([
    supabase.from('purchases').select('books(price_cents)'),
    supabase.from('subscriptions').select('id', {count: 'exact', head: true}).eq('status', 'active'),
    supabase.from('coupons').select('id', {count: 'exact', head: true}),
    supabase.from('coupons').select('id', {count: 'exact', head: true}).eq('is_used', true),
    supabase
      .from('coupons')
      .select('id, code, type, is_used, created_at')
      .order('created_at', {ascending: false})
      .limit(6),
    supabase.from('books').select('id, title, published, book_content(locale)')
  ]);

  const rows = (sales.data ?? []) as {books: {price_cents: number} | {price_cents: number}[] | null}[];
  const revenueCents = rows.reduce((sum, r) => {
    const b = Array.isArray(r.books) ? r.books[0] : r.books;
    return sum + (b?.price_cents ?? 0);
  }, 0);

  const shelf = (books.data ?? []) as unknown as BookRow[];
  const live = shelf.filter((b) => b.published).length;
  // Nothing readable saved yet — the one state that always needs a person.
  const needsWork = shelf.filter((b) => b.book_content.length === 0);
  const coupons = (recent.data ?? []) as CouponRow[];
  const spare = (allCoupons.count ?? 0) - (usedCoupons.count ?? 0);

  const kpis = [
    {label: t('catalogue'), value: String(shelf.length), sub: `${t('live')} ${live}`},
    {label: t('couponsLeft'), value: String(spare), sub: `${t('used')} ${usedCoupons.count ?? 0}`},
    {label: t('subs'), value: String(subs.count ?? 0)},
    {label: t('sales'), value: String(rows.length)},
    {label: t('revenue'), value: `$${(revenueCents / 100).toFixed(2)}`}
  ];

  const typeLabel = (type: string) =>
    type === 'subscription_30d'
      ? t('type30')
      : type === 'subscription_365d'
        ? t('type365')
        : t('fieldBook');

  return (
    <>
      <div className="ac-head">
        <h1 className="ac-h1">{t('overview')}</h1>
        <div className="ac-acts">
          <Link href="/admin/books/new" className="ac-btn primary">
            + {t('newBook')}
          </Link>
          <Link href="/admin/coupons" className="ac-btn">
            {t('generate')}
          </Link>
        </div>
      </div>

      <div className="ac-kpis">
        {kpis.map(({label, value, sub}) => (
          <div className="ac-kpi" key={label}>
            <div className="ac-kpi-l">{label}</div>
            <div className="ac-kpi-v">{value}</div>
            <div className="ac-kpi-s">{sub ?? ''}</div>
          </div>
        ))}
      </div>

      <div className="ac-panels">
        <section className="ac-panel">
          <div className="ac-panel-h">
            <h2>{t('recentCoupons')}</h2>
            <Link href="/admin/coupons">{t('seeAll')}</Link>
          </div>
          {coupons.length === 0 ? (
            <p className="ac-empty">{t('nothingYet')}</p>
          ) : (
            <ul className="ac-list">
              {coupons.map((c) => (
                <li key={c.id}>
                  <span className="adm-mono ac-list-t">{c.code}</span>
                  <span className="ac-list-m">{typeLabel(c.type)}</span>
                  <span className={`ac-pill${c.is_used ? ' on' : ''}`}>
                    {c.is_used ? t('used') : t('unused')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ac-panel">
          <div className="ac-panel-h">
            <h2>{t('needsWork')}</h2>
            <Link href="/admin/books">{t('seeAll')}</Link>
          </div>
          {needsWork.length === 0 ? (
            <p className="ac-empty">{t('allReady')}</p>
          ) : (
            <ul className="ac-list">
              {needsWork.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/books/${b.id}`} className="ac-list-t">
                    {b.title}
                  </Link>
                  <span className="ac-list-m">{b.published ? t('live') : t('draft')}</span>
                  <span className="ac-pill warn">{t('noContent')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
