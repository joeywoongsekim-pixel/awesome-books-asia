import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // `en` is the authored source; every other locale is generated from messages/en.json.
  locales: ['en', 'ko', 'ja', 'fil', 'de', 'fr', 'es', 'pt'],
  defaultLocale: 'en'
});

export type Locale = (typeof routing.locales)[number];
