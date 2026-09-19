import {NextResponse} from 'next/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {isAdmin} from '../../../../lib/admin';

// M157 — copy a hotlinked picture into our own storage.
//
// A pasted article sometimes points at an image on somebody else's server.
// That works until the day it doesn't, and then the article has a hole in
// it. This fetches the picture once, puts it in the article-images bucket,
// and hands back our URL.
//
// Only the address travels through here — the bytes never pass through the
// browser, so the request stays small. Photographs pasted inline go
// straight from the browser to storage instead (lib/postImages.ts).
export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'article-images';
const LIMIT = 15 * 1024 * 1024;

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'not signed in'}, {status: 401});
  if (!(await isAdmin(supabase))) {
    return NextResponse.json({error: 'not an admin'}, {status: 403});
  }

  const {url, slug} = (await req.json()) as {url?: string; slug?: string};
  if (!url || !slug) {
    return NextResponse.json({error: 'url and slug are required'}, {status: 400});
  }

  // An admin is asking the server to fetch a URL, so the server should be
  // fussy about which: http(s) only, no request to an address on our own
  // network.
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({error: 'not a URL'}, {status: 400});
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({error: 'only http and https'}, {status: 400});
  }
  if (
    /^(localhost|\[?::1\]?|0\.0\.0\.0)$/i.test(target.hostname) ||
    /^(10|127)\./.test(target.hostname) ||
    /^169\.254\./.test(target.hostname) ||
    /^192\.168\./.test(target.hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(target.hostname)
  ) {
    return NextResponse.json({error: 'that address is not reachable'}, {status: 400});
  }

  let bytes: ArrayBuffer;
  let type: string;
  try {
    const res = await fetch(target, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: {'User-Agent': 'AwesomeBooksAsia/1.0 (+https://www.awesomebooks.asia)'}
    });
    if (!res.ok) {
      return NextResponse.json({error: `the host answered ${res.status}`}, {status: 502});
    }
    type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (!EXT[type]) {
      return NextResponse.json({error: `that is ${type || 'not a picture'}`}, {status: 415});
    }
    bytes = await res.arrayBuffer();
  } catch {
    return NextResponse.json({error: 'the host did not answer'}, {status: 502});
  }
  if (bytes.byteLength > LIMIT) {
    return NextResponse.json({error: 'larger than 15 MB'}, {status: 413});
  }

  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    (b) => b.toString(16).padStart(2, '0')
  )
    .join('')
    .slice(0, 32);
  const name = `${slug}/${hash}.${EXT[type]}`;

  const {error} = await supabase.storage
    .from(BUCKET)
    .upload(name, bytes, {contentType: type, upsert: true, cacheControl: '31536000'});
  if (error) return NextResponse.json({error: error.message}, {status: 500});

  return NextResponse.json({
    url: supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
  });
}
