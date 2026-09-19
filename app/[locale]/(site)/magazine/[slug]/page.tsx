import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../../../../i18n/navigation';
import {livePost, livePosts, pick, safeHtml} from '../../../../../lib/magazine';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = await livePost(slug);
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

// One article. The body is HTML written in the console; safeHtml strips
// anything that could run before it reaches the page.
export default async function ArticlePage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('magazine');
  const tNav = await getTranslations('nav');

  const post = await livePost(slug);
  if (!post) notFound();

  const more = (await livePosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="art">
      <div className="art-in">
        <div className="crumb">
          <Link href="/">{tNav('home')}</Link>
          <i>›</i>
          <Link href="/magazine">{t('title')}</Link>
        </div>

        <div className="art-k">{post.published_at.slice(0, 10).replace(/-/g, '.')}</div>
        <h1 className="art-t">{pick(post.title, locale)}</h1>
        <p className="art-d">{pick(post.dek, locale)}</p>

        {post.cover && (
          <figure className="art-vis">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover} alt="" />
          </figure>
        )}

        <div
          className="art-body"
          dangerouslySetInnerHTML={{__html: safeHtml(pick(post.body, locale))}}
        />

        {more.length > 0 && (
          <div className="art-more">
            <h2 className="h2 h2-s">{t('more')}</h2>
            <ul className="art-more-l">
              {more.map((p) => (
                <li key={p.id}>
                  <Link href={`/magazine/${p.slug}`}>
                    <span className="art-more-k">
                      {p.published_at.slice(0, 10).replace(/-/g, '.')}
                    </span>
                    <span className="art-more-t">{pick(p.title, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/magazine" className="btn-o art-back">
          {t('backToList')}
        </Link>
      </div>
    </article>
  );
}
