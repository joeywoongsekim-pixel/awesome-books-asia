import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';

// Issues a signed URL (10 minutes) for a book file. The storage bucket is
// private and its RLS policy only lets entitled users (a purchase of this
// book, or an active subscription) read objects — so the entitlement check
// is enforced by the database even if this handler is called directly.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const locale = url.searchParams.get('locale') ?? 'en';
  const format = url.searchParams.get('format') === 'epub' ? 'epub' : 'pdf';
  if (!slug) return NextResponse.json({error: 'missing slug'}, {status: 400});

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {}
      }
    }
  );

  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'not signed in'}, {status: 401});

  const {data: edition} = await supabase
    .from('book_editions')
    .select('pdf_path, epub_path, books!inner(slug)')
    .eq('books.slug', slug)
    .eq('locale', locale)
    .maybeSingle();
  if (!edition) return NextResponse.json({error: 'edition not found'}, {status: 404});

  const path = format === 'epub' ? edition.epub_path : edition.pdf_path;
  if (!path) return NextResponse.json({error: 'file not available'}, {status: 404});

  // 10 minutes, per spec. Fails (RLS) unless the user is entitled.
  const {data: signed, error} = await supabase.storage.from('books').createSignedUrl(path, 600);
  if (error || !signed) {
    return NextResponse.json({error: 'not entitled'}, {status: 403});
  }
  return NextResponse.json({url: signed.signedUrl, expiresIn: 600});
}
