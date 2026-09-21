'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import ChapterStudio, {type StudioContent} from './ChapterStudio';
import PrePubCheck from './PrePubCheck';
import {CATEGORIES, CAT_KEY, type Category} from '../../lib/books';
import {suggestSlug, unusedShelfSlugs} from '../../lib/slug';

// M29 — the KDP-style book setup flow (modelled on Amazon KDP's title
// setup): three steps across the top — Details, Content, Pricing — each a
// card of fields with helper text underneath. Content and Pricing unlock
// once the title exists; the Content step is where a book is actually
// written (ChapterStudio) or uploaded (EPUB/PDF pipeline).

export type AdminBook = {
  id: string;
  slug: string;
  title: string;
  /* The half after the colon, kept apart from the title so a listing can
     show one without the other. Optional — plenty of books are a title. */
  subtitle: string | null;
  /* The three names the trade prints. Only the author is asked for:
     a book with no pictures and no translator leaves the other two
     empty, which is most books. */
  author: string;
  illustrator: string | null;
  translator: string | null;
  /* One to three of the shelf's twelve subjects. A book stands under
     the first and answers to the rest, the way the shelf itself works. */
  categories: string[] | null;
  is_new: boolean;
  published: boolean;
  price_cents: number;
  published_at: string | null;
  /* The day the KDP Select window ends and the ebook may be opened in
     our reader. Enforced inside get_book_content, not here. */
  reader_from: string | null;
  cover_url: string | null;
};
export type AdminContent = {locale: string; kind: string; processed_at: string};
export type AdminEdition = {
  id: string;
  locale: string;
  title: string;
  pdf_path: string | null;
  epub_path: string | null;
};

const EDITION_LOCALES = ['en', 'ko', 'ja'] as const;

/* Past three, a subject stops narrowing anything. The database holds the
   same rule as a check constraint, so this is the polite half of it. */
const MAX_CATEGORIES = 3;

export default function BookStudio({
  book,
  editions,
  contents = [],
  studio = [],
  takenSlugs = []
}: {
  book: AdminBook | null;
  editions: AdminEdition[];
  contents?: AdminContent[];
  studio?: StudioContent[];
  /* Slugs the database already holds, so the shelf entries offered in
     the slug box are only the ones still waiting for a book. */
  takenSlugs?: string[];
}) {
  const t = useTranslations('admin');
  const tDetail = useTranslations('detail');
  // The shelf's own words for its subjects, so the console and the
  // storefront call the same shelf by the same name.
  const tStore = useTranslations('store');
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    slug: book?.slug ?? '',
    title: book?.title ?? '',
    subtitle: book?.subtitle ?? '',
    author: book?.author ?? '',
    illustrator: book?.illustrator ?? '',
    translator: book?.translator ?? '',
    categories: (book?.categories ?? ['AI']) as string[],
    is_new: book?.is_new ?? false,
    published: book?.published ?? false,
    priceUsd: book ? (book.price_cents / 100).toString() : '0',
    published_at: book?.published_at ?? '',
    // stored as a timestamp, edited as a day
    reader_from: book?.reader_from ? book.reader_from.slice(0, 10) : ''
  });
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkErrors, setCheckErrors] = useState<boolean | null>(null);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({...f, [k]: v}));

  /* Tick to add, tick again to remove, and the last one will not come
     off — a book has to stand somewhere. Beyond three the boxes go quiet
     rather than disappearing, so it is clear the limit was reached and
     not that the subject went missing. */
  const toggleCategory = (c: Category) =>
    setForm((f) => {
      const on = f.categories.includes(c);
      if (on) {
        return f.categories.length === 1 ? f : {...f, categories: f.categories.filter((x) => x !== c)};
      }
      if (f.categories.length >= MAX_CATEGORIES) return f;
      return {...f, categories: [...f.categories, c]};
    });

  /* The web name is worked out from the title rather than typed: it has
     to match the shelf entry's id or the store's "read" button looks up
     a book that is not there. Only while creating, and only until the
     box is touched — an existing book's slug is a live URL. */
  const [slugTouched, setSlugTouched] = useState(Boolean(book));
  const onTitle = (v: string) =>
    setForm((f) => ({...f, title: v, slug: slugTouched ? f.slug : suggestSlug(v)}));

  const hasContent = contents.length > 0 || studio.some((s) => s.chapters?.length);
  // This book's own slug stays on the list while editing it.
  const shelfChoices = unusedShelfSlugs(takenSlugs.filter((x) => x !== book?.slug));

  async function save(goNext = false) {
    setBusy(true);
    setMsg('');
    const row = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      author: form.author.trim(),
      /* Empty means nobody, not an empty name: an unfilled box should
         leave the column null rather than storing "". */
      illustrator: form.illustrator.trim() || null,
      translator: form.translator.trim() || null,
      categories: form.categories,
      is_new: form.is_new,
      published: form.published,
      price_cents: Math.round(Number(form.priceUsd || '0') * 100),
      published_at: form.published_at || null,
      /* Midnight UTC on the chosen day: the exclusivity ends on a date,
         not at an hour, and the book should open at the start of it. */
      reader_from: form.reader_from ? `${form.reader_from}T00:00:00Z` : null
    };
    if (book) {
      const {error} = await supabase.from('books').update(row).eq('id', book.id);
      setMsg(error ? error.message : t('saved'));
      if (!error) {
        router.refresh();
        if (goNext) setStep(2);
      }
    } else {
      const {data, error} = await supabase.from('books').insert(row).select('id').single();
      if (error) setMsg(error.message);
      else router.replace(`/admin/books/${data.id}`);
    }
    setBusy(false);
  }

  async function setPublished(published: boolean) {
    if (!book) return;
    // KDP-style gate: hard findings from the pre-publish check ask first.
    if (published && checkErrors && !window.confirm(t('ckConfirmPublish'))) return;
    setBusy(true);
    const {error} = await supabase.from('books').update({published}).eq('id', book.id);
    if (!error) {
      set('published')(published);
      setMsg(published ? t('nowLive') : t('nowDraft'));
      router.refresh();
    } else setMsg(error.message);
    setBusy(false);
  }

  async function remove() {
    if (!book || !window.confirm(t('deleteConfirm'))) return;
    setBusy(true);
    const {error} = await supabase.from('books').delete().eq('id', book.id);
    if (error) {
      setMsg(error.message);
      setBusy(false);
    } else {
      router.push('/admin/books');
    }
  }

  async function uploadCover(file: File) {
    if (!book) return;
    setBusy(true);
    setMsg(t('uploading'));
    const ext = file.type.includes('png') ? 'png' : 'jpg';
    const path = `${book.slug}.${ext}`;
    const {error: upErr} = await supabase.storage
      .from('covers')
      .upload(path, file, {upsert: true, contentType: file.type || 'image/jpeg'});
    if (upErr) {
      setMsg(upErr.message);
      setBusy(false);
      return;
    }
    const {data: pub} = supabase.storage.from('covers').getPublicUrl(path);
    const url = `${pub.publicUrl}?v=${Date.now()}`;
    const {error} = await supabase.from('books').update({cover_url: url}).eq('id', book.id);
    if (!error) setCoverUrl(url);
    setMsg(error ? error.message : t('coverSaved'));
    setBusy(false);
  }

  async function processContent(locale: string) {
    if (!book) return;
    setBusy(true);
    setMsg(t('uploading'));
    const res = await fetch('/api/admin/process-book', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({slug: book.slug, locale})
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (res?.ok && data?.ok) {
      setMsg(`${t('processed')} — ${data.kind === 'pdf' ? `PDF · ${data.pages}p` : `EPUB · ${data.chapters}ch`}`);
      router.refresh();
    } else {
      setMsg(data?.error ?? 'processing failed');
    }
    setBusy(false);
  }

  async function upload(locale: string, format: 'pdf' | 'epub', file: File) {
    if (!book) return;
    setBusy(true);
    setMsg(t('uploading'));
    const path = `${book.slug}/${locale}.${format}`;
    const {error: upErr} = await supabase.storage
      .from('books')
      .upload(path, file, {upsert: true, contentType: file.type || undefined});
    if (upErr) {
      setMsg(upErr.message);
      setBusy(false);
      return;
    }
    const existing = editions.find((e) => e.locale === locale);
    const col = format === 'pdf' ? 'pdf_path' : 'epub_path';
    const {error: dbErr} = existing
      ? await supabase.from('book_editions').update({[col]: path}).eq('id', existing.id)
      : await supabase
          .from('book_editions')
          .insert({book_id: book.id, locale, title: book.title, [col]: path});
    setMsg(dbErr ? dbErr.message : t('fileSaved'));
    setBusy(false);
    if (!dbErr) router.refresh();
  }

  const steps: Array<{n: 1 | 2 | 3; label: string; done: boolean}> = [
    {n: 1, label: t('stepDetails'), done: Boolean(book)},
    {n: 2, label: t('stepContent'), done: hasContent || Boolean(coverUrl)},
    {n: 3, label: t('stepPricing'), done: Boolean(book?.published)}
  ];

  return (
    <div className="kdp">
      {/* ── KDP-style step rail ─────────────────────────────────────── */}
      <div className="kdp-steps">
        {steps.map((s, i) => (
          <button
            key={s.n}
            type="button"
            className={`kdp-step${step === s.n ? ' on' : ''}${s.done ? ' done' : ''}`}
            disabled={!book && s.n > 1}
            onClick={() => setStep(s.n)}
          >
            <i>{s.done ? '✓' : s.n}</i>
            {s.label}
            {i < steps.length - 1 && <em aria-hidden="true" />}
          </button>
        ))}
      </div>

      {/* ── 1 · Details ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="kdp-card">
          <h2 className="kdp-h">{t('stepDetails')}</h2>
          <div className="kdp-field">
            <label>{t('fieldTitle')}</label>
            <input value={form.title} onChange={(e) => onTitle(e.target.value)} />
            <p className="kdp-hint">{t('titleHint')}</p>
          </div>
          <div className="kdp-field">
            <label>{t('fieldSubtitle')}</label>
            <input value={form.subtitle} onChange={(e) => set('subtitle')(e.target.value)} />
            <p className="kdp-hint">{t('subtitleHint')}</p>
          </div>
          {/* Three names, because a picture book has two people on its
              cover and a translated one has three. Only the first is
              required; the other two stay empty for most books. */}
          <div className="kdp-row">
            <div className="kdp-field">
              <label>{t('fieldAuthor')}</label>
              <input value={form.author} onChange={(e) => set('author')(e.target.value)} />
              <p className="kdp-hint">{t('authorHint')}</p>
            </div>
            <div className="kdp-field">
              <label>{t('fieldIllustrator')}</label>
              <input
                value={form.illustrator}
                onChange={(e) => set('illustrator')(e.target.value)}
              />
              <p className="kdp-hint">{t('illustratorHint')}</p>
            </div>
            <div className="kdp-field">
              <label>{t('fieldTranslator')}</label>
              <input
                value={form.translator}
                onChange={(e) => set('translator')(e.target.value)}
              />
              <p className="kdp-hint">{t('translatorHint')}</p>
            </div>
          </div>
          <div className="kdp-row">
            <div className="kdp-field">
              <label>{t('slug')}</label>
              <input
                value={form.slug}
                list="shelf-slugs"
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug')(e.target.value);
                }}
                placeholder="my-new-book"
              />
              {/* The entries on the shelf that have no book behind them
                  yet. Picking one is the whole job: it is the id the
                  store's "read" button will ask this database for. */}
              <datalist id="shelf-slugs">
                {shelfChoices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </datalist>
              <p className="kdp-hint">{t('slugHint')}</p>
            </div>
          </div>
          <div className="kdp-row">
            <div className="kdp-field kdp-wide">
              <label>
                {t('category')} <span className="kdp-count">{form.categories.length}/{MAX_CATEGORIES}</span>
              </label>
              {/* The shelf's twelve subjects, not a list of four kept
                  separately from it — and several at once, because the
                  token book is AI and economics and the shelf has always
                  known that. */}
              <div className="kdp-chips">
                {CATEGORIES.map((c) => {
                  const on = form.categories.includes(c);
                  const full = !on && form.categories.length >= MAX_CATEGORIES;
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`kdp-chip${on ? ' on' : ''}`}
                      aria-pressed={on}
                      disabled={full}
                      onClick={() => toggleCategory(c)}
                    >
                      {tStore(CAT_KEY[c])}
                    </button>
                  );
                })}
              </div>
              <p className="kdp-hint">{t('categoryHint')}</p>
            </div>
            {/* No difficulty and no page count. The first was a 1-3
                number typed by hand that nothing ever read; the second
                is worked out from the uploaded file, and a person
                guessing at it could only be wrong. */}
            <div className="kdp-field">
              <label>{tDetail('published')}</label>
              <input
                type="date"
                value={form.published_at}
                onChange={(e) => set('published_at')(e.target.value)}
              />
            </div>
            {/* Empty for a book that was never in KDP Select, which is
                most of them. Set it and the reader refuses the book until
                that morning, whoever is asking and whatever they own. */}
            <div className="kdp-field">
              <label>{t('bkReaderFrom')}</label>
              <input
                type="date"
                value={form.reader_from}
                onChange={(e) => set('reader_from')(e.target.value)}
              />
              <p className="adm-hint">{t('bkReaderFromHint')}</p>
            </div>
          </div>
          <label className="adm-check">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => set('is_new')(e.target.checked)}
            />
            {t('markNew')}
          </label>

          <div className="kdp-foot">
            <button type="button" className="btn-g adm-btn" onClick={() => save(true)} disabled={busy}>
              {book ? t('saveContinue') : t('createBook')}
            </button>
            {book && (
              <button type="button" className="adm-danger" onClick={remove} disabled={busy}>
                {t('delete')}
              </button>
            )}
            {msg && <span className="adm-msg">{msg}</span>}
          </div>
        </div>
      )}

      {/* ── 2 · Content ─────────────────────────────────────────────── */}
      {step === 2 && book && (
        <>
          <div className="kdp-card">
            <h2 className="kdp-h">{t('coverSection')}</h2>
            <div className="kdp-cover">
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" />
              ) : (
                <div className="kdp-cover-empty">{book.title.slice(0, 1)}</div>
              )}
              <div>
                <label className="adm-file">
                  {t('coverUpload')}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCover(f);
                    }}
                  />
                </label>
                <p className="kdp-hint">{t('coverHint')}</p>
              </div>
            </div>
          </div>

          <div className="kdp-card">
            <h2 className="kdp-h">{t('writeSection')}</h2>
            <p className="kdp-hint">{t('writeHint')}</p>
            <ChapterStudio bookId={book.id} slug={book.slug} initial={studio} />
          </div>

          <div className="kdp-card">
            <h2 className="kdp-h">{t('uploadSection')}</h2>
            <p className="kdp-hint">{t('uploadHint')}</p>
            <div className="adm-editions">
              {EDITION_LOCALES.map((loc) => {
                const ed = editions.find((e) => e.locale === loc);
                const content = contents.find((c) => c.locale === loc);
                return (
                  <div className="adm-ed" key={loc}>
                    <div className="adm-ed-l">{loc.toUpperCase()}</div>
                    <div className="adm-ed-files">
                      <label className="adm-file">
                        {t('uploadPdf')}
                        {ed?.pdf_path && <s>✓</s>}
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) upload(loc, 'pdf', f);
                          }}
                        />
                      </label>
                      <label className="adm-file">
                        {t('uploadEpub')}
                        {ed?.epub_path && <s>✓</s>}
                        <input
                          type="file"
                          accept="application/epub+zip,.epub"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) upload(loc, 'epub', f);
                          }}
                        />
                      </label>
                      {(ed?.epub_path || ed?.pdf_path) && (
                        <button
                          type="button"
                          className="adm-process"
                          onClick={() => processContent(loc)}
                          disabled={busy}
                        >
                          {t('process')}
                        </button>
                      )}
                      {content && (
                        <span className="adm-status">
                          ✓ {t('processed')} · {content.kind.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="kdp-card">
            <h2 className="kdp-h">{t('ckTitle')}</h2>
            <p className="kdp-hint">{t('ckHint')}</p>
            <PrePubCheck
              bookId={book.id}
              title={form.title}
              author={form.author}
              slug={form.slug}
              coverUrl={coverUrl}
              priceUsd={form.priceUsd}
              publishedAt={form.published_at}
              onResult={setCheckErrors}
            />
            <div className="kdp-foot">
              <button type="button" className="btn-g adm-btn" onClick={() => setStep(3)}>
                {t('saveContinue')}
              </button>
              {msg && <span className="adm-msg">{msg}</span>}
            </div>
          </div>
        </>
      )}

      {/* ── 3 · Pricing & publish ───────────────────────────────────── */}
      {step === 3 && book && (
        <div className="kdp-card">
          <h2 className="kdp-h">{t('stepPricing')}</h2>
          <div className="kdp-row">
            <div className="kdp-field">
              <label>{t('price')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.priceUsd}
                onChange={(e) => set('priceUsd')(e.target.value)}
              />
              <p className="kdp-hint">{t('priceHint')}</p>
            </div>
          </div>

          <div className={`kdp-pubstate${form.published ? ' live' : ''}`}>
            {form.published ? t('live') : t('draft')}
            <p className="kdp-hint">{t('publishHint')}</p>
          </div>

          <h2 className="kdp-h" style={{marginTop: 22}}>{t('ckTitle')}</h2>
          <PrePubCheck
            bookId={book.id}
            title={form.title}
            author={form.author}
            slug={form.slug}
            coverUrl={coverUrl}
            priceUsd={form.priceUsd}
            publishedAt={form.published_at}
            onResult={setCheckErrors}
          />

          <div className="kdp-foot">
            <button type="button" className="btn-g adm-btn" onClick={() => save()} disabled={busy}>
              {t('save')}
            </button>
            {form.published ? (
              <button
                type="button"
                className="adm-danger"
                onClick={() => setPublished(false)}
                disabled={busy}
              >
                {t('unpublish')}
              </button>
            ) : (
              <button
                type="button"
                className="kdp-publish"
                onClick={() => setPublished(true)}
                disabled={busy}
              >
                {t('publishNow')}
              </button>
            )}
            {msg && <span className="adm-msg">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
