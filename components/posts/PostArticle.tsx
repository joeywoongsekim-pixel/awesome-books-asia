import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';
import {livePost, livePosts, pick, safeHtml, SECTION, type Kind} from '../../lib/posts';

// One piece, under either masthead. The body is HTML written in the
// console; safeHtml strips anything that could run before it reaches the
// page. What follows it are the other pieces from the same section — the
// news does not send a reader off to the magazine and back.
export default async function PostArticle({
  kind,
  locale,
  slug
}: {
  kind: Kind;
  locale: string;
  slug: string;
}) {
  const {path, ns} = SECTION[kind];
  const t = await getTranslations(ns);
  const tNav = await getTranslations('nav');

  const post = await livePost(kind, slug);
  if (!post) notFound();

  const more = (await livePosts(kind, 4)).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="art">
      <div className="art-in">
        <div className="crumb">
          <Link href="/">{tNav('home')}</Link>
          <i>›</i>
          <Link href={path}>{t('title')}</Link>
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
                  <Link href={`${path}/${p.slug}`}>
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

        <Link href={path} className="btn-o art-back">
          {t('backToList')}
        </Link>
      </div>
    </article>
  );
}
