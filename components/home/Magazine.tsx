import {getTranslations} from 'next-intl/server';
import {Link} from '../../i18n/navigation';
import Reveal from '../Reveal';
import {livePosts, pick} from '../../lib/posts';

// M152 — the two newest articles from Awesome Magazine, one band each:
// the first with its picture on the right, the second with its picture on
// the left. Replaces the editors' notes, which were three fixed cards
// written into the translation files.
//
// Nothing to show means nothing is rendered — an empty magazine should
// leave no gap between the newsletter and the USP bar.
export default async function Magazine({locale}: {locale: string}) {
  const t = await getTranslations('magazine');
  const posts = await livePosts('magazine', 2);
  if (posts.length === 0) return null;

  return (
    <section className="sec mz">
      <div className="sec-in">
        <Reveal>
          <div className="mz-head">
            <h2 className="h2">{t('title')}</h2>
            <Link href="/magazine" className="mz-all">
              {t('all')}
            </Link>
          </div>
        </Reveal>

        {posts.map((post, i) => (
          <Reveal key={post.id}>
            <article className={i % 2 === 1 ? 'mz-band flip' : 'mz-band'}>
              <Link href={`/magazine/${post.slug}`} className="mz-vis" tabIndex={-1}>
                {/* Decorative: the headline beside it carries the meaning. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover ?? '/hero/s5.webp'} alt="" loading="lazy" />
              </Link>
              <div className="mz-txt">
                <div className="mz-k">{post.published_at.slice(0, 10).replace(/-/g, '.')}</div>
                <h3 className="mz-t">
                  <Link href={`/magazine/${post.slug}`}>{pick(post.title, locale)}</Link>
                </h3>
                <p className="mz-x">{pick(post.dek, locale)}</p>
                <Link href={`/magazine/${post.slug}`} className="mz-l">
                  {t('read')}
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
