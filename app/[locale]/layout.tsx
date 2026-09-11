import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '../../i18n/routing';
import {fontVariables} from '../fonts';
import '../globals.css';
import DeskBackground from '../../components/DeskBackground';
import SiteGuard from '../../components/SiteGuard';

// Required by next-intl so every locale is statically known at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'meta'});
  const ogLocale: Record<string, string> = {
    en: 'en_US', ko: 'ko_KR', ja: 'ja_JP', fil: 'fil_PH',
    de: 'de_DE', fr: 'fr_FR', es: 'es_ES', pt: 'pt_BR'
  };
  return {
    metadataBase: new URL('https://www.awesomebooks.asia'),
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: Object.fromEntries([
        ...routing.locales.map((l) => [l, `/${l}`]),
        ['x-default', '/en']
      ])
    },
    openGraph: {
      type: 'website',
      siteName: 'Awesome Books Asia',
      title: t('title'),
      description: t('description'),
      locale: ogLocale[locale] ?? 'en_US',
      images: [{url: '/og.png', width: 1200, height: 630}]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og.png']
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Mandatory in the layout AND in every page. Omitting it builds locally but
  // throws DYNAMIC_SERVER_USAGE 500s on Vercel.
  setRequestLocale(locale);

  // Site chrome (nav + footer) lives in the (site) route group so the reader
  // route can render with its own chrome, per the spec.
  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <SiteGuard />
          <DeskBackground />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
