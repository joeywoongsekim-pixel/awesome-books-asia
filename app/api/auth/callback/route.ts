import {NextResponse, type NextRequest} from 'next/server';
import {createServerClient} from '@supabase/ssr';

// OAuth + email-confirmation callback. Lives under /api so the intl proxy
// never rewrites it. Exchanges the code, then sends the user to their library.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/en/library';
  const response = NextResponse.redirect(new URL(next, url.origin));

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({name, value, options}) =>
              response.cookies.set(name, value, options)
            )
        }
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
