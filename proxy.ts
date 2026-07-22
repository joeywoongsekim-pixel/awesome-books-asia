import createMiddleware from 'next-intl/middleware';
import {createServerClient} from '@supabase/ssr';
import type {NextRequest} from 'next/server';
import {routing} from './i18n/routing';

// Next 16 renamed `middleware.ts` to `proxy.ts`. next-intl's request handler
// runs first; Supabase then refreshes the auth session cookies on the same
// response so Server Components always see a valid session.
const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intl(request);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({name, value, options}) =>
            response.cookies.set(name, value, options)
          )
      }
    });
    // Touching auth refreshes an expiring session (writes new cookies).
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api, /trpc (API routes — includes the Supabase auth callback)
  // - /_next, /_vercel (internals)
  // - anything containing a dot (static files, e.g. favicon.ico)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
