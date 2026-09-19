import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';

// M152 — Awesome Magazine. Articles live in public.posts; title, dek and
// body are keyed by locale, so an article written in Korean is readable
// everywhere and gains its other languages later.

/** Five to a page, which is what the arrows at the foot of the list step by. */
export const PAGE_SIZE = 5;

export type LocaleText = Record<string, string>;

export type Post = {
  id: string;
  slug: string;
  cover: string | null;
  title: LocaleText;
  dek: LocaleText;
  body: LocaleText;
  published: boolean;
  published_at: string;
};

const COLUMNS = 'id, slug, cover, title, dek, body, published, published_at';

/* Newest first, and "newest" has to be decided every time.
   published_at is a date the writer chooses, so two articles put up on the
   same day used to carry the identical stamp and Postgres was free to
   return them either way round — the new one could come out underneath the
   old one, and differently on each request. The moment an article was
   created breaks the tie, so the second piece of the day sits above the
   first and stays there. */

/** The visitor's language, then English, then whatever the article has. */
export function pick(field: LocaleText | null | undefined, locale: string): string {
  if (!field) return '';
  const own = field[locale]?.trim();
  if (own) return own;
  const en = field.en?.trim();
  if (en) return en;
  return Object.values(field).find((v) => v?.trim())?.trim() ?? '';
}

/** Which languages an article has been written in, for the console's list. */
export function languagesOf(post: Post): string[] {
  return Object.keys(post.title).filter((k) => post.title[k]?.trim());
}

/* The body is HTML — typed in the console by an admin, and since M156 also
   written by a model translating that admin's Korean. Neither is a reason
   to hand a reader's browser something that can run, so an allow-list, not
   a list of things to strip: anything not named here does not survive.
   sanitize-html parses the markup rather than pattern-matching it, which a
   set of regexes cannot do safely.

   An article here is not a run of paragraphs for the site's stylesheet to
   dress. It arrives as a finished piece — the writer lays it out, sets its
   measure and its captions, and pastes the whole thing in. So the list
   carries the elements and the attributes that layout is made of, style
   among them.

   That is a deliberate line, not an oversight. CSS cannot run anything in
   any current browser, and the only people who can write here are the two
   admins. What stays out is what executes or fetches: script, iframe,
   object, embed, form, link, meta, base — and any scheme that is not http,
   https or mailto, so a data: or javascript: URL never reaches a reader. */
export const ARTICLE_TAGS = [
  'p', 'div', 'section', 'article', 'span',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'blockquote', 'figure', 'figcaption', 'img', 'a',
  'strong', 'b', 'em', 'i', 'u', 's', 'small', 'sup', 'sub', 'mark',
  'code', 'pre', 'hr', 'br',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'
];

export function safeHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    allowedAttributes: {
      // layout and language belong to every element the writer lays out
      '*': ['style', 'class', 'lang', 'dir', 'title', 'role', 'aria-label', 'aria-hidden'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'sizes'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      col: ['span'],
      colgroup: ['span']
    },
    // no data: URIs — an <img src="data:text/html,…"> is a page, not a
    // picture. Pasted-in photographs are lifted into storage before this
    // runs (lib/postImages.ts), so by now there are none left to lose.
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    // a link that leaves the site should not hand over the opener
    transformTags: {
      a: (tagName, attribs) =>
        /^https?:/i.test(attribs.href ?? '')
          ? {tagName, attribs: {...attribs, target: '_blank', rel: 'noopener noreferrer'}}
          : {tagName, attribs}
    }
  });
}

/* A cookie-free client, so the home page and the article list stay
   prerendered: reading published articles needs no session, and asking for
   cookies would make every page dynamic.

   How the answer is cached is the caller's business, and getting it wrong
   is not a small mistake. A minute on the fetch was meant to keep the
   magazine feeling immediate; it did not — Next held the response well
   past it, and an article published in the console never reached the list.

   So the pages that must be right ask for `fresh`, and get no caching at
   all. They are dynamic already: nothing is saved by caching them and a
   stale magazine is the one thing this must never be. The home band, which
   is a prerendered page refreshed on its own timer, keeps the cached read
   — one query per regeneration is the right number — and its minute
   matches the page's, so a new article reaches the home page about as fast
   as it reaches the magazine. */
export function publicClient(fresh = false): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {persistSession: false},
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, {
          ...init,
          ...(fresh ? {cache: 'no-store'} : {next: {revalidate: 60}})
        } as RequestInit)
    }
  });
}

/** Newest published articles. Returns [] if the database is unreachable —
    a magazine that cannot be read is a quiet section, not a broken page. */
export async function livePosts(limit: number, offset = 0, fresh = false): Promise<Post[]> {
  const supabase = publicClient(fresh);
  if (!supabase) return [];
  const {data, error} = await supabase
    .from('posts')
    .select(COLUMNS)
    .eq('published', true)
    .order('published_at', {ascending: false})
    .order('created_at', {ascending: false})
    .range(offset, offset + limit - 1);
  return error ? [] : ((data ?? []) as Post[]);
}

/** One page of the list, plus how many pages there are in total. */
export async function livePage(page: number): Promise<{posts: Post[]; pages: number}> {
  const supabase = publicClient(true);
  if (!supabase) return {posts: [], pages: 0};
  const from = (page - 1) * PAGE_SIZE;
  const {data, count, error} = await supabase
    .from('posts')
    .select(COLUMNS, {count: 'exact'})
    .eq('published', true)
    .order('published_at', {ascending: false})
    .order('created_at', {ascending: false})
    .range(from, from + PAGE_SIZE - 1);
  if (error) return {posts: [], pages: 0};
  return {posts: (data ?? []) as Post[], pages: Math.ceil((count ?? 0) / PAGE_SIZE)};
}

export async function livePost(slug: string): Promise<Post | null> {
  const supabase = publicClient(true);
  if (!supabase) return null;
  const {data, error} = await supabase
    .from('posts')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return error || !data ? null : (data as Post);
}
