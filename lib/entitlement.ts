import type {SupabaseClient} from '@supabase/supabase-js';

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
