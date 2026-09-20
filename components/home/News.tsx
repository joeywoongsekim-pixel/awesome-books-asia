import {getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import {livePosts, pick} from '../../lib/posts';

// M166 — Awesome News, one section directly under the magazine.
//
// Deliberately not a third and fourth magazine band. The magazine is two
// full-width bands because an article is a piece of writing you are being
// invited into; news is a book out, a fair, a price — short, dated, and
// read at a glance. Three of them in a row under one heading says that,
// and it keeps the two sections telling apart at a glance when they sit on
// top of each other.
//
// Nothing to show means nothing is rendered: an empty section should leave
// no gap above the philosophy carousel.
export default async function News({locale}: {locale: string}) {
  const t = await getTranslations('news');
  const posts = await livePosts('news', 3);
  if (posts.length === 0) return null;

  /* Rows line up with each other. When some items have a picture and some
     do not, the picture column stays and the ones without simply leave it
     empty; when none of them has one, the list drops the column rather
     than indenting every row past an empty gutter. */
  const anyCover = posts.some((p) => p.cover);

  return (
    <section className="sec nw">
      <div className="sec-in">
        <Reveal>
          <div className="mz-head">
            <h2 className="h2">{t('title')}</h2>
            <Link href="/news" className="mz-all">
              {t('all')}
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <ul className={anyCover ? 'nw-list' : 'nw-list flush'}>
            {posts.map((post) => (
              <li className="nw-item" key={post.id}>
                <Link href={`/news/${post.slug}`} className="nw-link">
                  {/* The frame is only drawn where there is a picture, so an
                      item without one shows nothing, not an empty box. */}
                  {post.cover && (
                    <span className="nw-vis">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.cover} alt="" loading="lazy" />
                    </span>
                  )}
                  <span className="nw-txt">
                    <span className="nw-k">
                      {post.published_at.slice(0, 10).replace(/-/g, '.')}
                    </span>
                    <span className="nw-t">{pick(post.title, locale)}</span>
                    <span className="nw-x">{pick(post.dek, locale)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
