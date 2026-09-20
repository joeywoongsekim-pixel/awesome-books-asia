import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import PostList from '../../../../components/posts/PostList';
import {listMetadata} from '../../../../components/posts/meta';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  return listMetadata('news', (await params).locale);
}

// M166 — the news, cut into fives the same way the magazine is.
export default async function NewsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const asked = Number((await searchParams).page ?? '1');
  const page = Number.isFinite(asked) && asked >= 1 ? Math.floor(asked) : 1;

  return <PostList kind="news" locale={locale} page={page} />;
}
