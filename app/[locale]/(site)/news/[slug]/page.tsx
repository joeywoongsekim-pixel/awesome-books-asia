import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import PostArticle from '../../../../../components/posts/PostArticle';
import {articleMetadata} from '../../../../../components/posts/meta';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  return articleMetadata('news', locale, slug);
}

export default async function NewsItemPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  return <PostArticle kind="news" locale={locale} slug={slug} />;
}
