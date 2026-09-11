import type {MetadataRoute} from 'next';
import {routing} from '../i18n/routing';
import {BOOKS} from '../lib/books';

const BASE = 'https://www.awesomebooks.asia';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/books', ...BOOKS.map((b) => `/books/${b.id}`)];
  return routing.locales.flatMap((locale) =>
    paths.map((p) => ({
      url: `${BASE}/${locale}${p}`,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : p === '/books' ? 0.9 : 0.7
    }))
  );
}
