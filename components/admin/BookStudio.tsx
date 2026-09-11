'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import ChapterStudio, {type StudioContent} from './ChapterStudio';
import PrePubCheck from './PrePubCheck';

// M29 — the KDP-style book setup flow (modelled on Amazon KDP's title
// setup): three steps across the top — Details, Content, Pricing — each a
// card of fields with helper text underneath. Content and Pricing unlock
// once the title exists; the Content step is where a book is actually
// written (ChapterStudio) or uploaded (EPUB/PDF pipeline).

export type AdminBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  level: number;
  is_new: boolean;
  published: boolean;
  price_cents: number;
  page_count: number | null;
  published_at: string | null;
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
const CATEGORIES = ['biz', 'ai', 'edu', 'kids'];

export default function BookStudio({
  book,
  editions,
  contents = [],
  studio = []
}: {
  book: AdminBook | null;
  editions: AdminEdition[];
  contents?: AdminContent[];
  studio?: StudioContent[];
}) {
  const t = useTranslations('admin');
  const tDetail = useTranslations('detail');
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    slug: book?.slug ?? '',
    title: book?.title ?? '',
    author: book?.author ?? '',
    category: book?.category ?? 'biz',
    level: book?.level ?? 2,
    is_new: book?.is_new ?? false,
    published: book?.published ?? false,
    priceUsd: book ? (book.price_cents / 100).toString() : '0',
    page_count: book?.page_count?.toString() ?? '',
    published_at: book?.published_at ?? ''
  });
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkErrors, setCheckErrors] = useState<boolean | null>(null);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({...f, [k]: v}));

  const hasContent = contents.length > 0 || studio.some((s) => s.chapters?.length);

  async function save(goNext = false) {
    setBusy(true);
    setMsg('');
    const row = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category,
      level: Number(form.level) || 2,
      is_new: form.is_new,
      published: form.published,
      price_cents: Math.round(Number(form.priceUsd || '0') * 100),
      page_count: form.page_count ? Number(form.page_count) : null,
      published_at: form.published_at || null
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
            <input value={form.title} onChange={(e) => set('title')(e.target.value)} />
            <p className="kdp-hint">{t('titleHint')}</p>
          </div>
          <div className="kdp-row">
            <div className="kdp-field">
              <label>{t('fieldAuthor')}</label>
              <input value={form.author} onChange={(e) => set('author')(e.target.value)} />
              <p className="kdp-hint">{t('authorHint')}</p>
            </div>
            <div className="kdp-field">
              <label>{t('slug')}</label>
              <input
                value={form.slug}
                onChange={(e) => set('slug')(e.target.value)}
                placeholder="my-new-book"
              />
              <p className="kdp-hint">{t('slugHint')}</p>
            </div>
          </div>
          <div className="kdp-row">
            <div className="kdp-field">
              <label>{t('category')}</label>
              <select value={form.category} onChange={(e) => set('category')(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`cat_${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="kdp-field">
              <label>{t('level')}</label>
              <input
                type="number"
                min="1"
                max="3"
                value={form.level}
                onChange={(e) => set('level')(e.target.value)}
              />
            </div>
            <div className="kdp-field">
              <label>{tDetail('pages')}</label>
              <input
                type="number"
                min="0"
                value={form.page_count}
                onChange={(e) => set('page_count')(e.target.value)}
              />
            </div>
            <div className="kdp-field">
              <label>{tDetail('published')}</label>
              <input
                type="date"
                value={form.published_at}
                onChange={(e) => set('published_at')(e.target.value)}
              />
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
