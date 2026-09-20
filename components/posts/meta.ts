import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {livePost, pick, SECTION, type Kind} from '../../lib/posts';

// The <head> for a section's list page and for one piece in it. Shared for
// the same reason the pages are: whatever is true of the magazine's tab
// title and card is true of the news's.

export async function listMetadata(kind: Kind, locale: string): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: SECTION[kind].ns});
  return {title: `${t('title')} — Awesome Books Asia`, description: t('lead')};
}

export async function articleMetadata(
  kind: Kind,
  locale: string,
  slug: string
): Promise<Metadata> {
  const post = await livePost(kind, slug);
  if (!post) return {};
  const title = pick(post.title, locale);
  const dek = pick(post.dek, locale);
  return {
    title: `${title} — Awesome Books Asia`,
    description: dek,
    openGraph: {
      type: 'article',
      title,
      description: dek,
      images: post.cover ? [{url: post.cover}] : undefined
    }
  };
}
