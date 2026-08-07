import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Link} from '../../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

// KDP-Bookshelf-style catalogue: one card per title with its cover, live/draft
// state and per-locale file + processing status at a glance.

type EditionRow = {locale: string; pdf_path: string | null; epub_path: string | null};
type ContentRow = {locale: string; kind: string};
type ShelfBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  price_cents: number;
  is_new: boolean;
  published: boolean;
  cover_url: string | null;
  book_editions: EditionRow[];
  book_content: ContentRow[];
};

const LOCALES = ['en', 'ko', 'ja'] as const;

export default async function AdminBooks({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const {data} = await supabase
    .from('books')
    .select(
      'id, slug, title, author, category, price_cents, is_new, published, cover_url, book_editions(locale, pdf_path, epub_path), book_content(locale, kind)'
    )
    .order('created_at', {ascending: true});
  const books = (data ?? []) as unknown as ShelfBook[];

  return (
    <>
      <div className="adm-bar">
        <Link href="/admin/books/new" className="btn-g adm-btn">
          + {t('newBook')}
        </Link>
      </div>

      <div className="bks">
        {books.map((b) => {
          const anyFile = b.book_editions.some((e) => e.pdf_path || e.epub_path);
          return (
            <div className="bks-row" key={b.id}>
              <div className="bks-cover">
                {b.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.cover_url} alt="" />
                ) : (
                  <span>{b.title.slice(0, 1)}</span>
                )}
              </div>

              <div className="bks-main">
                <div className="bks-title">
                  {b.title}
                  {b.is_new && <span className="adm-new">NEW</span>}
                </div>
                <div className="bks-by">
                  {b.author} · <span className="adm-mono">{b.slug}</span> · {b.category}
                </div>
                <div className="bks-formats">
                  {!anyFile && <span className="bks-fmt none">{t('noFiles')}</span>}
                  {LOCALES.map((loc) => {
                    const ed = b.book_editions.find((e) => e.locale === loc);
                    const proc = b.book_content.find((c) => c.locale === loc);
                    if (!ed?.pdf_path && !ed?.epub_path && !proc) return null;
                    return (
                      <span key={loc} className={`bks-fmt${proc ? ' done' : ''}`}>
                        {loc.toUpperCase()}
                        {ed?.epub_path && <i>EPUB</i>}
                        {ed?.pdf_path && <i>PDF</i>}
                        {proc && <b>✓ {t('processed')}</b>}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={`bks-status${b.published ? ' live' : ''}`}>
                {b.published ? t('live') : t('draft')}
              </div>

              <div className="bks-actions">
                <Link href={`/admin/books/${b.id}`} className="bks-act primary">
                  {t('edit')}
                </Link>
                <Link href={`/read/${b.slug}`} className="bks-act">
                  {t('viewOnSite')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
