import Anthropic from '@anthropic-ai/sdk';
import {NextResponse} from 'next/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {isAdmin} from '../../../../lib/admin';
import {routing} from '../../../../i18n/routing';
import {safeHtml, type LocaleText} from '../../../../lib/magazine';

// M156 — write an article once, in whichever language it came to you in,
// and have the other eight follow.
//
// One locale per request, on purpose. Eight translations in a single call
// would be one long function invocation that either times out on a long
// article or loses all eight when the seventh fails; the console calls
// this once per language and shows the row filling in. A failure costs one
// language and says which.
export const runtime = 'nodejs';
export const maxDuration = 120;

const MODEL = 'claude-opus-5';

const LANGUAGE: Record<string, string> = {
  en: 'British English',
  ko: 'Korean',
  ja: 'Japanese',
  hi: 'Hindi',
  fil: 'Filipino (Tagalog)',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese'
};

type Field = 'title' | 'dek' | 'body';
const FIELDS: Field[] = ['title', 'dek', 'body'];

/* The house's own names, and the books', are titles rather than words: a
   reader looking for 『AIトークン経済入門』 on Amazon needs the string that is
   printed on it, not a rendering of what it means. */
const SYSTEM = `You are the staff translator for Awesome Books Asia, a small publisher in Seoul and Tokyo. You translate its magazine articles.

You will receive JSON with three fields: title, dek (a one-line standfirst) and body (HTML).

Return ONLY a JSON object with the same three keys. No markdown fence, no commentary.

Rules:
- Translate the meaning, not the words. These are editorial pieces; they should read as though written in the target language by the person who wrote the original, not as a translation of it. Keep the register, the rhythm, and the length of the sentences.
- body is HTML. Preserve every tag, attribute and href exactly as given; translate only the text between tags. Do not add, remove or reorder tags. Do not wrap the result in anything.
- Leave untranslated: the publisher's name (Awesome Books Asia), its products (Awesome Reader, Awesome Magazine), retailer names (Amazon, Kindle Unlimited, Kyobo, YES24, Aladin), and the titles of books exactly as they are printed — including Japanese and Korean titles inside 『』. A book title is a name, not a phrase to be rendered.
- Personal names stay as they are written in Latin script (Takashi, Kyoko, Akira Murata, Kuro).
- Numbers, dates and prices keep their values; format them the way the target language does.
- If a sentence relies on a pun or a rhythm that does not survive, write the sentence the author would have written in that language to make the same point.`;

function jsonError(status: number, error: string) {
  return NextResponse.json({error}, {status});
}

/* The links inside a body point at this site, and a path carries the
   locale: /ko/books/ai-token on the German page would send the reader to
   the Korean catalogue. Only our own root-relative paths are touched. */
function relocalise(html: string, from: string, to: string): string {
  const locales = routing.locales.join('|');
  return html.replace(
    new RegExp(`(href=")/(${locales})(/|")`, 'g'),
    (_m, head: string, loc: string, tail: string) =>
      loc === from ? `${head}/${to}${tail}` : `${head}/${loc}${tail}`
  );
}

async function translate(
  client: Anthropic,
  source: Record<Field, string>,
  to: string
): Promise<Record<Field, string>> {
  const request = {
    model: MODEL,
    max_tokens: 16000,
    system: `${SYSTEM}\n\nTranslate into ${LANGUAGE[to]}.`,
    messages: [{role: 'user' as const, content: JSON.stringify(source, null, 2)}]
  };

  // Streaming because an article can be long, and a long non-streaming
  // response is the one that hits an HTTP timeout.
  //
  // The fallbacks parameter is a beta: if the flag shape moves under us the
  // request 400s, and a translator that stops working because of a header
  // is worse than one without a safety net — so the plain call is the
  // retry, not the failure.
  let message;
  try {
    message = await client.beta.messages
      .stream({
        ...request,
        betas: ['server-side-fallback-2026-06-01'],
        fallbacks: [{model: 'claude-opus-4-8'}]
      })
      .finalMessage();
  } catch (e) {
    if (!(e instanceof Anthropic.BadRequestError)) throw e;
    message = await client.messages.stream(request).finalMessage();
  }

  if (message.stop_reason === 'refusal') {
    throw new Error('the model declined to translate this article');
  }

  // The two calls above return different message types, so the blocks are
  // read through one array type rather than off whichever came back.
  const blocks: Array<Anthropic.Beta.BetaContentBlock | Anthropic.ContentBlock> =
    message.content;
  const text = blocks
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`the model did not return JSON: ${text.slice(0, 160)}`);
  }
  const out = parsed as Partial<Record<Field, unknown>>;
  for (const f of FIELDS) {
    if (typeof out[f] !== 'string') throw new Error(`the model left ${f} out`);
  }
  return out as Record<Field, string>;
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) return jsonError(401, 'not signed in');
  if (!(await isAdmin(supabase))) return jsonError(403, 'not an admin');

  const {slug, from, to} = (await req.json()) as {
    slug?: string;
    from?: string;
    to?: string;
  };
  if (!slug || !from || !to) return jsonError(400, 'slug, from and to are required');
  if (!routing.locales.includes(from as never) || !routing.locales.includes(to as never)) {
    return jsonError(400, 'unknown locale');
  }
  if (from === to) return jsonError(400, 'from and to are the same language');

  // RLS lets an admin read drafts as well as what is live.
  const {data: post, error: readError} = await supabase
    .from('posts')
    .select('id, title, dek, body')
    .eq('slug', slug)
    .maybeSingle();
  if (readError || !post) return jsonError(404, 'no such article');

  const source = {
    title: (post.title as LocaleText)?.[from] ?? '',
    dek: (post.dek as LocaleText)?.[from] ?? '',
    body: (post.body as LocaleText)?.[from] ?? ''
  };
  if (!source.title.trim() || !source.body.trim()) {
    return jsonError(400, `the article has no ${from} title or body to translate from`);
  }

  // Last, so that a caller with a bad request is told what is wrong with it
  // rather than about a key they may not be missing.
  if (!process.env.ANTHROPIC_API_KEY) {
    return jsonError(503, 'ANTHROPIC_API_KEY is not set on this deployment');
  }

  let done: Record<Field, string>;
  try {
    done = await translate(new Anthropic(), source, to);
  } catch (e) {
    const why = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({error: why, to}, {status: 502});
  }

  // Whatever came back is markup from a model; it goes through the same
  // allow-list the page renders with before it is stored.
  const merge = (field: unknown, value: string): LocaleText => ({
    ...((field ?? {}) as LocaleText),
    [to]: value
  });

  const {error: writeError} = await supabase
    .from('posts')
    .update({
      title: merge(post.title, done.title.trim()),
      dek: merge(post.dek, done.dek.trim()),
      body: merge(post.body, safeHtml(relocalise(done.body, from, to)))
    })
    .eq('id', post.id);
  if (writeError) return jsonError(500, writeError.message);

  return NextResponse.json({ok: true, to});
}
