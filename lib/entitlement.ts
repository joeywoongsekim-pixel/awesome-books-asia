import type {SupabaseClient} from '@supabase/supabase-js';

// Launch offer: while the catalogue is below this size, any signed-in
// account reads everything for free. Subscriptions switch on afterwards.
export const FREE_CATALOGUE_LIMIT = 200;

export async function isFreePeriod(supabase: SupabaseClient): Promise<boolean> {
  const {count} = await supabase
    .from('books')
    .select('id', {count: 'exact', head: true});
  return (count ?? 0) < FREE_CATALOGUE_LIMIT;
}

// A signed-in reader is entitled to a book when they own it outright or hold
// an active subscription that has not lapsed. RLS scopes both queries to the
// caller's own rows.
export async function isEntitled(
  supabase: SupabaseClient,
  bookId: string
): Promise<boolean> {
  const [{data: purchase}, {data: sub}] = await Promise.all([
    supabase.from('purchases').select('id').eq('book_id', bookId).limit(1).maybeSingle(),
    supabase
      .from('subscriptions')
      .select('id')
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .limit(1)
      .maybeSingle()
  ]);
  return Boolean(purchase || sub);
}
