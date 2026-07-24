import type {SupabaseClient} from '@supabase/supabase-js';

// True only when the caller's JWT e-mail is in admin_emails (see the M7
// migration). Before that migration is applied the RPC does not exist and
// this safely reports false for everyone.
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {data, error} = await supabase.rpc('is_admin');
  return !error && data === true;
}
