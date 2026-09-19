import type {SupabaseClient} from '@supabase/supabase-js';

// True only when the caller's JWT e-mail is in admin_emails (see the M7
// migration). Before that migration is applied the RPC does not exist and
// this safely reports false for everyone.
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {data, error} = await supabase.rpc('is_admin');
  return !error && data === true;
}

// The console language this admin works in — Joey Korean, Akira Japanese
// (M132) — or null for everyone else. The preference sits beside the
// allowlist rather than in the browser bundle, so nothing on the sign-in
// path discloses who the admins are: admin_home() only ever answers about
// its own caller. Older sessions predating the migration get null.
export async function adminHome(supabase: SupabaseClient): Promise<string | null> {
  const {data, error} = await supabase.rpc('admin_home');
  return error || typeof data !== 'string' ? null : data;
}
