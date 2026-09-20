import {getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';
import {livePage, pick, safeHtml, SECTION, PAGE_SIZE, type Kind} from '../../lib/posts';

// M166 — the body of a section's list page, for both mastheads.
//
// The magazine and the news are laid out the same way on purpose: five
// pieces to a page, each one whole rather than a teaser, and under them the
// arrows either side of the numbers. What changes between them is the
// masthead, the path and the wording — so those are arguments, and the
// layout is written once. A change to how a list reads is a change to both.
export default async function PostList({
  kind,
  locale,
  page
}: {
  kind: Kind;
  locale: string;
  page: number;
}) {
  const {path, ns} = SECTION[kind];
  const t = await getTranslations(ns);
  const {posts, pages} = await livePage(kind, page);

  const at = (n: number) => ({pathname: path, query: n > 1 ? {page: n} : {}});

  return (
    <div className="mz-page">
      <div className="art-in">
        <div className="store-hero">
          <div className="eyebrow">{t('eyebrow')}</div>
          <h1 className="h2" style={{fontSize: 'clamp(32px,4.4vw,50px)'}}>
            {t('title')}
          </h1>
          <p className="lead">{t('lead')}</p>
        </div>

        {posts.length === 0 ? (
          <p className="ac-empty">{t('empty')}</p>
        ) : (
          posts.map((post, i) => (
            <article className="mz-full" key={post.id} id={post.slug}>
              <div className="art-k">{post.published_at.slice(0, 10).replace(/-/g, '.')}</div>
              {/* The heading is the permalink. Nothing says "read more",
                  because the piece is already here — but a reader who wants
                  to send this one to somebody needs its own address, and
                  the title is where people look for it. */}
              <h2 className="art-t">
                <Link href={`${path}/${post.slug}`}>{pick(post.title, locale)}</Link>
              </h2>
              <p className="art-d">{pick(post.dek, locale)}</p>
              {post.cover && (
                <figure className="art-vis">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover}
                    alt=""
                    loading={i === 0 ? undefined : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : undefined}
                  />
                </figure>
              )}
              <div
                className="art-body"
                dangerouslySetInnerHTML={{__html: safeHtml(pick(post.body, locale))}}
              />
            </article>
          ))
        )}

        {/* One page of five needs no pager; from the sixth piece on, the
            arrows sit either side of the numbers. */}
        {pages > 1 && (
          <nav className="mz-pager" aria-label={t('pagesLabel')}>
            {page > 1 ? (
              <Link href={at(page - 1)} className="mz-arrow" aria-label={t('prev')}>
                ←
              </Link>
            ) : (
              <span className="mz-arrow off" aria-hidden="true">
                ←
              </span>
            )}

            <div className="mz-nums">
              {Array.from({length: pages}, (_, n) => n + 1).map((n) =>
                n === page ? (
                  <span key={n} className="mz-num on" aria-current="page">
                    {n}
                  </span>
                ) : (
                  <Link key={n} href={at(n)} className="mz-num">
                    {n}
                  </Link>
                )
              )}
            </div>

            {page < pages ? (
              <Link href={at(page + 1)} className="mz-arrow" aria-label={t('next')}>
                →
              </Link>
            ) : (
              <span className="mz-arrow off" aria-hidden="true">
                →
              </span>
            )}
          </nav>
        )}

        {pages > 1 && <p className="mz-count">{t('count', {page, pages, per: PAGE_SIZE})}</p>}
      </div>
    </div>
  );
}
