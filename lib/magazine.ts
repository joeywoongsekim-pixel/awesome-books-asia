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

   The list is exactly what the article stylesheet draws. */
export const ARTICLE_TAGS = [
  'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption',
  'img', 'a', 'strong', 'b', 'em', 'i', 'code', 'pre', 'hr', 'br', 'span'
];

export function safeHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading']
    },
    // no data: URIs — an <img src="data:text/html,…"> is a page, not a picture
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

   The minute on the fetch matters. Without it Next keeps the response in
   its data cache, and that cache survives a deploy — an article published
   in the console would sit behind a build from last week with no way to
   shift it. A minute is short enough that publishing feels immediate and
   long enough that a burst of traffic does not become a burst of queries. */
export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {persistSession: false},
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, {...init, next: {revalidate: 60}} as RequestInit)
    }
  });
}

/** Newest published articles. Returns [] if the database is unreachable —
    a magazine that cannot be read is a quiet section, not a broken page. */
export async function livePosts(limit: number, offset = 0): Promise<Post[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const {data, error} = await supabase
    .from('posts')
    .select(COLUMNS)
    .eq('published', true)
    .order('published_at', {ascending: false})
    .range(offset, offset + limit - 1);
  return error ? [] : ((data ?? []) as Post[]);
}

/** One page of the list, plus how many pages there are in total. */
export async function livePage(page: number): Promise<{posts: Post[]; pages: number}> {
  const supabase = publicClient();
  if (!supabase) return {posts: [], pages: 0};
  const from = (page - 1) * PAGE_SIZE;
  const {data, count, error} = await supabase
    .from('posts')
    .select(COLUMNS, {count: 'exact'})
    .eq('published', true)
    .order('published_at', {ascending: false})
    .range(from, from + PAGE_SIZE - 1);
  if (error) return {posts: [], pages: 0};
  return {posts: (data ?? []) as Post[], pages: Math.ceil((count ?? 0) / PAGE_SIZE)};
}

export async function livePost(slug: string): Promise<Post | null> {
  const supabase = publicClient();
  if (!supabase) return null;
  const {data, error} = await supabase
    .from('posts')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return error || !data ? null : (data as Post);
}
