import {createClient} from '@supabase/supabase-js';

// Service-role client for trusted server contexts only (Stripe webhook).
// Never import from client components; the key bypasses RLS.
export function createSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {auth: {persistSession: false}});
}
