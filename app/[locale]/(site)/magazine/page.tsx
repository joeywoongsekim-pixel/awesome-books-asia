import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../../../i18n/navigation';
import {livePage, pick, safeHtml, PAGE_SIZE} from '../../../../lib/magazine';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'magazine'});
  return {title: `${t('title')} — Awesome Books Asia`, description: t('lead')};
}

// M152 — the magazine itself: five articles to a page, laid out as the
// home bands are, the picture changing sides down the page. Under them the
// arrows and the page numbers, which is how the list is cut into fives.
export default async function MagazinePage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{page?: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('magazine');

  const asked = Number((await searchParams).page ?? '1');
  const page = Number.isFinite(asked) && asked >= 1 ? Math.floor(asked) : 1;
  const {posts, pages} = await livePage(page);

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
              <div className="art-k">
                {post.published_at.slice(0, 10).replace(/-/g, '.')}
              </div>
              {/* The heading is the permalink. Nothing says "read more",
                  because the article is already here — but a reader who
                  wants to send this one piece to somebody needs its own
                  address, and the title is where people look for it. */}
              <h2 className="art-t">
                <Link href={`/magazine/${post.slug}`}>{pick(post.title, locale)}</Link>
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

        {/* One page of five needs no pager; from the sixth article on, the
            arrows sit either side of the numbers. */}
        {pages > 1 && (
          <nav className="mz-pager" aria-label={t('pagesLabel')}>
            {page > 1 ? (
              <Link
                href={{pathname: '/magazine', query: page - 1 > 1 ? {page: page - 1} : {}}}
                className="mz-arrow"
                aria-label={t('prev')}
              >
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
                  <Link
                    key={n}
                    href={{pathname: '/magazine', query: n > 1 ? {page: n} : {}}}
                    className="mz-num"
                  >
                    {n}
                  </Link>
                )
              )}
            </div>

            {page < pages ? (
              <Link
                href={{pathname: '/magazine', query: {page: page + 1}}}
                className="mz-arrow"
                aria-label={t('next')}
              >
                →
              </Link>
            ) : (
              <span className="mz-arrow off" aria-hidden="true">
                →
              </span>
            )}
          </nav>
        )}

        {pages > 1 && (
          <p className="mz-count">{t('count', {page, pages, per: PAGE_SIZE})}</p>
        )}
      </div>
    </div>
  );
}
