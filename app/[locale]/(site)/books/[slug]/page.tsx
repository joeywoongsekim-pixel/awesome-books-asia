import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {Link} from '../../../../../i18n/navigation';
import {BOOKS, type Book} from '../../../../../lib/books';
import BookCard from '../../../../../components/BookCard';
import BookCover from '../../../../../components/BookCover';
import RecordVisit from '../../../../../components/RecordVisit';
import RetailerLinks from '../../../../../components/RetailerLinks';
import LangTabs from '../../../../../components/store/LangTabs';

export function generateStaticParams() {
  return BOOKS.map((book) => ({slug: book.id}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const book = BOOKS.find((b) => b.id === slug);
  return book ? {title: `${book.title} — AwesomeBooks`} : {};
}

// Sync server component so useTranslations works; the async page below
// resolves params first.
function BookDetail({book}: {book: Book}) {
  const t = useTranslations('detail');
  const tNav = useTranslations('nav');
  const tBooks = useTranslations('books');
  const tPlans = useTranslations('plans');
  const others = BOOKS.filter((b) => b.id !== book.id).slice(0, 3);

  return (
    <div className="detail">
      <RecordVisit slug={book.id} />
      <div className="crumb">
        <Link href="/">{tNav('home')}</Link>
        <i>›</i>
        <Link href="/books">{tNav('bookstore')}</Link>
        <i>›</i>
        <span className="crumb-here">{book.title}</span>
      </div>

      <div className="d-top">
        <div className="d-cover-wrap">
          <BookCover book={book} />
        </div>
        <div>
          <div className="d-cat">{book.catLabel}</div>
          <h1 className="d-title">{book.title}</h1>
          <div className="d-author">{book.author}</div>
          <p className="d-blurb">{book.blurb}</p>
          <LangTabs langs={book.langs} />
          <div className="d-buy">
            <div className="d-price">
              {book.price ? `$${book.price}` : tBooks('inSubscription')}
              <small>{book.price ? tPlans('single.pd') : t('included')}</small>
            </div>
            <Link href={`/read/${book.id}`} className="btn-g">
              {t('sample')}
            </Link>
            <Link href="/#plans" className="btn-o">
              {t('subscribeCta')}
            </Link>
          </div>
          <RetailerLinks title={book.title} />
          <div className="d-subnote">
            {t.rich('subnote', {
              b: (chunks) => <b>{chunks}</b>
            })}
          </div>
        </div>
      </div>

      <div className="d-cols">
        <div>
          <div className="d-h3">{t('contents')}</div>
          <ul className="toc">
            {book.toc.map((item, i) => (
              <li key={item}>
                <s>{String(i + 1).padStart(2, '0')}</s>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="d-h3">{t('detailsHeading')}</div>
          <dl className="meta-table">
            <div className="meta-row">
              <dt>{t('format')}</dt>
              <dd>PDF + EPUB</dd>
            </div>
            <div className="meta-row">
              <dt>{t('pages')}</dt>
              <dd>{book.pages}</dd>
            </div>
            <div className="meta-row">
              <dt>{t('editions')}</dt>
              <dd>{book.langs.join(' · ')}</dd>
            </div>
            <div className="meta-row">
              <dt>{t('published')}</dt>
              <dd>{book.published}</dd>
            </div>
            <div className="meta-row">
              <dt>{t('publisher')}</dt>
              <dd>AwesomeBooks</dd>
            </div>
            <div className="meta-row">
              <dt>{t('reader')}</dt>
              <dd>{t('readerValue')}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="more-books">
        <div className="eyebrow">{t('keepGoing')}</div>
        <h2 className="h2" style={{fontSize: 28}}>
          {t('more')}
        </h2>
        <div className="more-grid">
          {others.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function BookDetailPage({
  params
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const book = BOOKS.find((b) => b.id === slug);
  if (!book) notFound();

  return <BookDetail book={book} />;
}
