'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';

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
const CATEGORIES = ['ai', 'edu', 'kids'];

export default function BookForm({
  book,
  editions,
  contents = []
}: {
  book: AdminBook | null;
  editions: AdminEdition[];
  contents?: AdminContent[];
}) {
  const t = useTranslations('admin');
  const tDetail = useTranslations('detail');
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [form, setForm] = useState({
    slug: book?.slug ?? '',
    title: book?.title ?? '',
    author: book?.author ?? '',
    category: book?.category ?? 'ai',
    level: book?.level ?? 2,
    is_new: book?.is_new ?? false,
    published: book?.published ?? false,
    priceUsd: book ? (book.price_cents / 100).toString() : '0',
    page_count: book?.page_count?.toString() ?? '',
    published_at: book?.published_at ?? ''
  });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({...f, [k]: v}));

  async function save() {
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
      if (!error) router.refresh();
    } else {
      const {data, error} = await supabase.from('books').insert(row).select('id').single();
      if (error) setMsg(error.message);
      else router.replace(`/admin/books/${data.id}`);
    }
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

  return (
    <div className="adm-form">
      <div className="adm-grid">
        <label>
          {t('fieldTitle')}
          <input value={form.title} onChange={(e) => set('title')(e.target.value)} />
        </label>
        <label>
          {t('slug')}
          <input value={form.slug} onChange={(e) => set('slug')(e.target.value)} />
        </label>
        <label>
          {t('fieldAuthor')}
          <input value={form.author} onChange={(e) => set('author')(e.target.value)} />
        </label>
        <label>
          {t('category')}
          <select value={form.category} onChange={(e) => set('category')(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('price')}
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.priceUsd}
            onChange={(e) => set('priceUsd')(e.target.value)}
          />
        </label>
        <label>
          {t('level')}
          <input
            type="number"
            min="1"
            max="3"
            value={form.level}
            onChange={(e) => set('level')(e.target.value)}
          />
        </label>
        <label>
          {tDetail('pages')}
          <input
            type="number"
            min="0"
            value={form.page_count}
            onChange={(e) => set('page_count')(e.target.value)}
          />
        </label>
        <label>
          {tDetail('published')}
          <input
            type="date"
            value={form.published_at}
            onChange={(e) => set('published_at')(e.target.value)}
          />
        </label>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) => set('is_new')(e.target.checked)}
          />
          {t('markNew')}
        </label>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published')(e.target.checked)}
          />
          {t('publish')}
        </label>
      </div>

      <div className="adm-actions">
        <button type="button" className="btn-g adm-btn" onClick={save} disabled={busy}>
          {t('save')}
        </button>
        {book && (
          <button type="button" className="adm-danger" onClick={remove} disabled={busy}>
            {t('delete')}
          </button>
        )}
        {msg && <span className="adm-msg">{msg}</span>}
      </div>

      {book && (
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
      )}
    </div>
  );
}
