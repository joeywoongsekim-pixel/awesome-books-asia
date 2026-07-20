import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Next 16 renamed `middleware.ts` to `proxy.ts`. next-intl's request handler
// works unchanged as the proxy default export.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api, /trpc (API routes)
  // - /_next, /_vercel (internals)
  // - anything containing a dot (static files, e.g. favicon.ico)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
