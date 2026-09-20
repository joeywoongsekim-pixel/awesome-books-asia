import {getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import {livePosts, pick} from '../../lib/posts';

// M168 — Awesome News, one section directly under the magazine.
//
// It takes the room of a single magazine band and spends it the other way
// up: the picture across the top, the words beneath it. Stacked rather
// than side by side is what keeps the two sections from reading as the
// same section twice when they sit on top of each other — and one item
// rather than a list is what keeps a section that is not the magazine
// from taking more of the page than the magazine does.
//
// The picture is wide (16/5) rather than the band's 4/3 for the same
// reason: a full-column 4/3 photograph would be 960px tall on a laptop
// and the section would dwarf everything above it.
//
// Nothing to show means nothing is rendered: an empty section should leave
// no gap above the philosophy carousel.
export default async function News({locale}: {locale: string}) {
  const t = await getTranslations('news');
  const [post] = await livePosts('news', 1);
  if (!post) return null;

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
          <article className="nw-lead">
            <Link href={`/news/${post.slug}`} className="nw-link">
              {/* A news item need not carry a picture. Without one the
                  words simply start at the top of the section. */}
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
          </article>
        </Reveal>
      </div>
    </section>
  );
}
