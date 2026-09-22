import {createSupabaseBrowser, supabaseConfigured} from './supabase/client';

export type InboxKind = 'letter' | 'contact';

// Everything a visitor types into the letter band or the contact form goes
// into public.inbox. The table is write-only for the public and readable
// only by admins, so the browser can insert straight into it — no API
// route in between, nothing to keep in step.
//
// M189 — and then it tells us. Because the write goes straight to
// PostgREST there is no server of ours in the middle to hang a send on,
// so the browser makes a second call with the id it just wrote and
// /api/notify-inbox posts the row on to the house address.
//
// The id is made here rather than read back: the public may write to this
// table but may not read it, so asking PostgREST to return the new row
// would fail the insert it just did. Supplying our own uuid asks for
// nothing back.
export async function sendToInbox(row: {
  kind: InboxKind;
  email: string;
  name?: string;
  message?: string;
  locale?: string;
}): Promise<{ok: boolean; error?: string}> {
  if (!supabaseConfigured()) return {ok: false, error: 'not configured'};
  const supabase = createSupabaseBrowser();
  const id = newId();
  const {error} = await supabase.from('inbox').insert({
    id,
    kind: row.kind,
    email: row.email.trim(),
    name: row.name?.trim() || null,
    message: row.message?.trim() || null,
    locale: row.locale ?? null
  });
  if (error) return {ok: false, error: error.message};

  /* The row is the record and the email is a convenience, so this is
     told to nobody if it fails. A visitor who has been thanked has been
     heard whether or not the mail went out, and the message is sitting
     in the console either way. */
  void fetch('/api/notify-inbox', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id})
  }).catch(() => {});

  return {ok: true};
}

/* randomUUID needs a secure context, which every page we serve is — but
   an http:// preview or an older browser would throw, and losing a
   reader's message over a missing id would be absurd. */
function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += hex[(Math.random() * 4) | 8];
    else out += hex[(Math.random() * 16) | 0];
  }
  return out;
}
