import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {useFormatter, useLocale, useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {Link, redirect} from '../../../../../i18n/navigation';
import {
  BOOKS,
  CAT_KEY,
  catsOf,
  editionsOf,
  readerOpen,
  type Book
} from '../../../../../lib/books';
import BookCard from '../../../../../components/BookCard';
import RetailerLinks from '../../../../../components/RetailerLinks';
import BookCover from '../../../../../components/BookCover';
import OtherEditions from '../../../../../components/store/Editions';
import {blurbOf, tocOf} from '../../../../../lib/blurbs';
import {EDITIONS, fromPrice} from '../../../../../lib/retailers';
import JsonLd from '../../../../../components/JsonLd';
import {bookJsonLd, breadcrumbJsonLd} from '../../../../../lib/jsonld';

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
  if (!book) return {};
  return {
    title: `${book.title} — Awesome Books Asia`,
    description: book.blurb,
    openGraph: {
      type: 'book',
      title: book.title,
      description: book.blurb,
      images: book.img ? [{url: book.img}] : undefined
    }
  };
}

// Sync server component so useTranslations works; the async page below
// resolves params first.
function BookDetail({book}: {book: Book}) {
  const t = useTranslations('detail');
  const tNav = useTranslations('nav');
  const tBooks = useTranslations('books');
  const tStore = useTranslations('store');
  const locale = useLocale();
  const format = useFormatter();
  const eds = EDITIONS[book.id] ?? [];
  const formats = [
    eds.some((e) => e.format === 'ebook') ? t('fmtEbook') : null,
    eds.some((e) => e.format === 'print') ? t('fmtPrint') : null
  ]
    .filter(Boolean)
    .join(' · ') || t('fmtEbook');
  const others = BOOKS.filter((b) => b.id !== book.id).slice(0, 3);


  return (
    <div className="detail">
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
          {/* Every subject the book answers to, in the reader's language.
              Not joined with a middot: two of the subjects are called
              "AI · 테크" and "대학 · 성인교육", so a middot between them
              made one line of five things out of two subjects. */}
          <div className="d-cat">{catsOf(book).map((c) => tStore(CAT_KEY[c])).join(' / ')}</div>
          <h1 className="d-title">{book.title}</h1>
          <div className="d-author">{book.author}</div>
          <p className="d-blurb">{blurbOf(book, locale)}</p>
          <OtherEditions book={book} />
          {/* A book inside its Kindle Unlimited window keeps its page and
              its shops; what it loses is the button that opens it here.
              Naming the day is the point — the reader is coming, and in
              the meantime there is somewhere to buy it. */}
          <div className="d-buy">
            {book.sp.length > 0 && readerOpen(book) ? (
              <>
                <Link href={`/read/${book.id}`} className="btn-g">
                  {t('sample')}
                </Link>
                <a href="#stores" className="btn-o">
                  {t('buy')}
                </a>
              </>
            ) : (
              <a href="#stores" className="btn-g">
                {t('buy')}
              </a>
            )}
          </div>
          {book.sp.length > 0 && !readerOpen(book) && book.readerFrom && (
            <div className="d-waiting">
              {t('readerFrom', {
                date: format.dateTime(new Date(`${book.readerFrom}T00:00:00Z`), {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC'
                })
              })}
            </div>
          )}
          <div id="stores">
            <RetailerLinks bookId={book.id} title={book.title} />
          </div>
          <div className="d-subnote">
            {t.rich('subnote', {
              b: (chunks) => <b>{chunks}</b>
            })}
          </div>
        </div>
      </div>

      <div className="d-cols">
        <div>
          {tocOf(book, locale).length > 0 && (
            <>
              <div className="d-h3">{t('contents')}</div>
              <ul className="toc">
                {tocOf(book, locale).map((item, i) => (
                  <li key={item}>
                    <s>{String(i + 1).padStart(2, '0')}</s>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          <div className="d-h3">{t('detailsHeading')}</div>
          <dl className="meta-table">
            <div className="meta-row">
              <dt>{t('format')}</dt>
              <dd>{formats}</dd>
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
              <dd>Awesome Books Asia</dd>
            </div>
            {/* Only where it is true. This row was printed on every book,
                so a title with no sample loaded, or one inside its Kindle
                Unlimited window, promised a reader in the facts while the
                buttons above withheld it — on the very page whose job is
                to say the reader is waiting. A book that is waiting says
                so in the note by the buttons, with the day; a book with
                nothing to open says nothing. */}
            {book.sp.length > 0 && readerOpen(book) && (
              <div className="meta-row">
                <dt>{t('reader')}</dt>
                <dd>{t('readerValue')}</dd>
              </div>
            )}
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
  params,
  searchParams
}: {
  params: Promise<{locale: string; slug: string}>;
  /* ?ed=EN used to pick an edition on a shared page. Every edition has a
     page of its own now, but links carrying it are out in the world — on
     the launch popup, in anything anybody saved — so the old address
     still arrives at the right book instead of the wrong one. */
  searchParams: Promise<{ed?: string}>;
}) {
  const {locale, slug} = await params;
  const {ed} = await searchParams;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const book = BOOKS.find((b) => b.id === slug);
  if (!book) notFound();

  if (ed && !book.langs.includes(ed.toUpperCase() as never)) {
    const wanted = editionsOf(book).find((b) => b.langs[0] === ed.toUpperCase());
    if (wanted) redirect({href: `/books/${wanted.id}`, locale});
  }

  return (
    <>
      <JsonLd data={bookJsonLd(book)} />
      <JsonLd data={breadcrumbJsonLd(locale, book)} />
      <BookDetail book={book} />
    </>
  );
}
