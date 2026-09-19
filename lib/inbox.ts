import {createSupabaseBrowser, supabaseConfigured} from './supabase/client';

export type InboxKind = 'letter' | 'contact';

// Everything a visitor types into the letter band or the contact form goes
// into public.inbox. The table is write-only for the public and readable
// only by admins, so the browser can insert straight into it — no API
// route in between, nothing to keep in step.
export async function sendToInbox(row: {
  kind: InboxKind;
  email: string;
  name?: string;
  message?: string;
  locale?: string;
}): Promise<{ok: boolean; error?: string}> {
  if (!supabaseConfigured()) return {ok: false, error: 'not configured'};
  const supabase = createSupabaseBrowser();
  const {error} = await supabase.from('inbox').insert({
    kind: row.kind,
    email: row.email.trim(),
    name: row.name?.trim() || null,
    message: row.message?.trim() || null,
    locale: row.locale ?? null
  });
  return error ? {ok: false, error: error.message} : {ok: true};
}
