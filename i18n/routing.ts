import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // `en` is the authored source. `ko` / `ja` are generated from messages/en.json.
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'en'
});

export type Locale = (typeof routing.locales)[number];
