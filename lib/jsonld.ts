// M28 — schema.org structured data (SEO/AEO). Serialized into
// <script type="application/ld+json"> tags by the layout and the book
// detail pages, so search engines and AI answer engines can read the
// publisher and catalogue as typed entities instead of prose.

import {CAT_EN, catsOf, type Book} from './books';
import {EDITIONS} from './retailers';

export const SITE = 'https://www.awesomebooks.asia';

const LANG_TAG: Record<string, string> = {KO: 'ko', EN: 'en', JA: 'ja'};

export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Awesome Books Asia',
  alternateName: ['어썸북스아시아', 'オーサムブックスアジア'],
  url: SITE,
  logo: `${SITE}/icon.png`,
  description:
    'Independent publishing house making learning for the AI age in Korean, English and Japanese — from economics and AI to picture books, written to be finished. Sold on Amazon, Kyobo, YES24 and Aladin, with samples readable in the browser.',
  knowsLanguage: ['ko', 'en', 'ja']
};

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#site`,
  name: 'Awesome Books Asia',
  url: SITE,
  publisher: {'@id': `${SITE}/#org`},
  inLanguage: ['en', 'ko', 'ja', 'hi', 'fil', 'de', 'fr', 'es', 'pt']
};

export function bookJsonLd(book: Book) {
  const links = EDITIONS[book.id] ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${SITE}/en/books/${book.id}#book`,
    name: book.title,
    author: {'@type': 'Person', name: book.author},
    publisher: {'@id': `${SITE}/#org`},
    description: book.blurb,
    image: book.img ? `${SITE}${book.img}` : undefined,
    inLanguage: book.langs.map((l) => LANG_TAG[l] ?? l.toLowerCase()),
    numberOfPages: book.pages,
    datePublished: book.published,
    genre: catsOf(book).map((c) => CAT_EN[c]),
    url: `${SITE}/en/books/${book.id}`,
    // Verified retailer listings for this work's editions.
    sameAs: links.map((e) => e.url),
    offers: links
      .filter((e) => e.price)
      .map((e) => {
        const currency = e.price!.includes('원')
          ? 'KRW'
          : e.price!.includes('¥')
            ? 'JPY'
            : e.price!.includes('₹')
              ? 'INR'
              : 'USD';
        return {
          '@type': 'Offer',
          price: Number(e.price!.replace(/[^\d.]/g, '')),
          priceCurrency: currency,
          availability: 'https://schema.org/InStock',
          url: e.url,
          seller: {'@type': 'Organization', name: e.store}
        };
      }),
    workExample: links.map((e) => ({
      '@type': 'Book',
      bookFormat:
        e.format === 'print' ? 'https://schema.org/Paperback' : 'https://schema.org/EBook',
      inLanguage: LANG_TAG[e.lang] ?? e.lang.toLowerCase(),
      bookEdition: e.note ?? `${e.lang} ${e.format === 'print' ? 'print' : 'ebook'} edition`,
      url: e.url
    }))
  };
}

export function breadcrumbJsonLd(locale: string, book: Book) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/${locale}`},
      {'@type': 'ListItem', position: 2, name: 'Bookstore', item: `${SITE}/${locale}/books`},
      {'@type': 'ListItem', position: 3, name: book.title, item: `${SITE}/${locale}/books/${book.id}`}
    ]
  };
}
