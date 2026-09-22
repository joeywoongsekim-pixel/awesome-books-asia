// Sending one email, over Resend's HTTP API.
//
// No SDK: it is a single POST with a JSON body, and a dependency that
// wraps one fetch is a dependency to keep up to date for nothing.
//
// Configured by two variables in Vercel:
//   RESEND_API_KEY   — required; without it nothing is sent and the
//                      caller is told so rather than failing.
//   INBOX_MAIL_FROM  — optional. Resend will only send from a domain you
//                      have verified, so until awesomebooks.asia has its
//                      DNS records this falls back to Resend's own test
//                      sender, which can reach the account's own address.

const ENDPOINT = 'https://api.resend.com/emails';

/* Resend's test sender works with no DNS at all, but only delivers to the
   address that owns the Resend account. Set INBOX_MAIL_FROM to something
   at our own domain once it is verified. */
const FALLBACK_FROM = 'Awesome Books Asia <onboarding@resend.dev>';

export type MailResult = {ok: boolean; reason?: string; id?: string};

export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail(mail: {
  to: string;
  subject: string;
  text: string;
  /** So hitting reply in the mail client writes to the person, not to us. */
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return {ok: false, reason: 'no api key'};

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        from: process.env.INBOX_MAIL_FROM || FALLBACK_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? {reply_to: [mail.replyTo]} : {})
      })
    });
  } catch (e) {
    return {ok: false, reason: e instanceof Error ? e.message : 'network'};
  }

  if (!res.ok) {
    /* Resend explains a rejection in the body — an unverified sending
       domain, a bad key — and that sentence is the whole diagnosis, so
       it is worth carrying back rather than just the status. */
    const body = await res.text().catch(() => '');
    return {ok: false, reason: `${res.status} ${body.slice(0, 300)}`};
  }

  const data = (await res.json().catch(() => null)) as {id?: string} | null;
  return {ok: true, id: data?.id};
}
