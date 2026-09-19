import type {SupabaseClient} from '@supabase/supabase-js';

// M157 — lifting the pictures out of a pasted article.
//
// An article arrives as HTML with its photographs encoded into it as data:
// URIs. Leaving them there would make the row megabytes wide, carry those
// megabytes to the translator eight times, and — because the sanitiser
// blocks data: URIs, an <img src="data:text/html,…"> being a page rather
// than a picture — lose the photographs entirely on save.
//
// So the console lifts each one out on the way to saving: decode it, put it
// in the article-images bucket, leave a URL behind. The writer pastes and
// saves and does nothing else.
//
// This runs in the browser on purpose. A five-photograph article is a
// dozen megabytes, and the request-body ceiling on a serverless function is
// a few — going through our own API would be the thing that breaks. From
// the browser the bytes go straight to storage and never touch it.

const BUCKET = 'article-images';

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
};

export type LiftResult = {
  html: string;
  /** photographs moved into our own storage */
  stored: number;
  /** pictures left exactly as they were, and why */
  skipped: string[];
};

/** Content-addressed, so the same photograph pasted twice is stored once. */
async function digest(bytes: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

function decodeDataUrl(src: string): {bytes: Uint8Array; type: string} | null {
  const m = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i.exec(src.trim());
  if (!m) return null;
  const type = m[1].toLowerCase();
  if (!EXT[type]) return null;
  try {
    const binary = atob(m[2].replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return {bytes, type};
  } catch {
    return null;
  }
}

async function put(
  supabase: SupabaseClient,
  slug: string,
  bytes: Uint8Array,
  type: string
): Promise<string> {
  const name = `${slug}/${await digest(bytes.buffer as ArrayBuffer)}.${EXT[type]}`;
  // upsert, because the same photograph in two articles is the same file
  const {error} = await supabase.storage
    .from(BUCKET)
    .upload(name, bytes, {contentType: type, upsert: true, cacheControl: '31536000'});
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
}

/**
 * Put one picture — pasted from the clipboard, or dropped on the form —
 * into storage and hand back its URL.
 */
export async function uploadImage(
  file: File | Blob,
  slug: string,
  supabase: SupabaseClient
): Promise<string> {
  const type = (file.type || '').toLowerCase();
  if (!EXT[type]) {
    throw new Error(`${type || 'that file'} is not a picture we can store`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  return put(supabase, slug, bytes, type);
}

/** Every <img src> in the markup, in the order they appear. */
export function imageSources(html: string): string[] {
  return [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]);
}

/**
 * Which of those pictures a reader would not see. A src that is already in
 * our storage is fine by construction; everything else is asked for, which
 * is how a path typed in before the file existed gets caught.
 */
export async function missingImages(html: string): Promise<string[]> {
  const out: string[] = [];
  for (const src of new Set(imageSources(html))) {
    if (src.startsWith('data:') || src.includes(`/${BUCKET}/`)) continue;
    try {
      const res = await fetch(src, {method: 'HEAD'});
      if (!res.ok) out.push(src);
    } catch {
      out.push(src);
    }
  }
  return out;
}

/** Point every copy of one src at another, leaving the rest of the markup alone. */
export function replaceSource(html: string, from: string, to: string): string {
  return html.replaceAll(`src="${from}"`, `src="${to}"`);
}

/**
 * Rewrite every <img> in `html` to point at our own storage.
 *
 * Pasted-in photographs (data:) are decoded and uploaded from here.
 * Pictures hotlinked from somewhere else are copied through the mirror
 * route — a URL is small enough to send to our own server, and the copy is
 * what stops the article going blank the day that host reorganises.
 * Anything that cannot be moved is left untouched and reported.
 */
export async function liftImages(
  html: string,
  slug: string,
  supabase: SupabaseClient,
  onProgress?: (done: number, total: number) => void
): Promise<LiftResult> {
  if (!html.includes('<img')) return {html, stored: 0, skipped: []};

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const imgs = [...doc.querySelectorAll('img')];
  const skipped: string[] = [];
  let stored = 0;

  for (const [n, img] of imgs.entries()) {
    onProgress?.(n, imgs.length);
    const src = img.getAttribute('src') ?? '';
    if (!src) continue;

    // already ours, or already a path on this site
    if (src.startsWith('/') || src.includes(`/${BUCKET}/`)) continue;

    const inline = decodeDataUrl(src);
    if (inline) {
      try {
        img.setAttribute('src', await put(supabase, slug, inline.bytes, inline.type));
        stored++;
      } catch (e) {
        skipped.push(e instanceof Error ? e.message : 'upload failed');
      }
      continue;
    }

    if (/^https?:/i.test(src)) {
      try {
        const res = await fetch('/api/admin/mirror-image', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({url: src, slug})
        });
        const body = (await res.json()) as {url?: string; error?: string};
        if (res.ok && body.url) {
          img.setAttribute('src', body.url);
          stored++;
        } else {
          skipped.push(`${new URL(src).host}: ${body.error ?? res.status}`);
        }
      } catch {
        skipped.push(`${src.slice(0, 40)}: could not be copied`);
      }
      continue;
    }

    skipped.push(`${src.slice(0, 40)}: not a picture we can store`);
  }

  onProgress?.(imgs.length, imgs.length);
  return {html: doc.body.innerHTML, stored, skipped};
}

/** How many pasted-in photographs an article is carrying, before saving. */
export function inlineImageCount(html: string): number {
  return (html.match(/<img[^>]+src="data:image\//gi) ?? []).length;
}
