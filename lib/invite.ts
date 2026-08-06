import type {SupabaseClient} from '@supabase/supabase-js';

// Invite code parked at sign-up, redeemed on the first signed-in session.
export const INVITE_KEY = 'aba-invite';

// Fire-and-forget: redeem a parked invite code once a session exists. The
// RPC is race-safe, so double calls (e.g. two tabs) cannot double-spend.
export async function redeemParkedInvite(supabase: SupabaseClient) {
  let code: string | null = null;
  try {
    code = localStorage.getItem(INVITE_KEY);
  } catch {
    return;
  }
  if (!code) return;
  const {data, error} = await supabase.rpc('redeem_coupon', {p_code: code});
  // Clear on any definitive outcome; keep only on transient errors.
  if (!error || data === 'invalid' || data === 'expired') {
    try {
      localStorage.removeItem(INVITE_KEY);
    } catch {
      /* ignore */
    }
  }
}
