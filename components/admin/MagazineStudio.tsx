'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import {routing} from '../../i18n/routing';
import {safeHtml, type LocaleText, type Post} from '../../lib/magazine';

const BLANK = {
  slug: '',
  cover: '',
  date: new Date().toISOString().slice(0, 10),
  title: '',
  dek: '',
  body: '',
  published: false
};

/* An article is written in one language and gains the others later, so the
   console edits one language at a time: pick the language, fill the three
   fields, save. Saving merges that language into the article and leaves
   every other language it already has alone. */
export default function MagazineStudio({posts}: {posts: Post[]}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [id, setId] = useState<string | null>(null);
  const [lang, setLang] = useState('ko');
  const [f, setF] = useState(BLANK);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = (k: keyof typeof BLANK, v: string | boolean) =>
    setF((prev) => ({...prev, [k]: v}));

  function startNew() {
    setId(null);
    setF(BLANK);
    setMsg('');
    setPreview(false);
  }

  // Load an article into the form, in the language currently selected.
  function load(post: Post, forLang = lang) {
    setId(post.id);
    setLang(forLang);
    setF({
      slug: post.slug,
      cover: post.cover ?? '',
      date: post.published_at.slice(0, 10),
      title: post.title[forLang] ?? '',
      dek: post.dek[forLang] ?? '',
      body: post.body[forLang] ?? '',
      published: post.published
    });
    setMsg('');
    setPreview(false);
  }

  // Switching language mid-edit swaps the three text fields for that
  // language's, keeping the slug, cover, date and published state.
  function switchLang(next: string) {
    const post = posts.find((p) => p.id === id);
    setLang(next);
    if (!post) return;
    setF((prev) => ({
      ...prev,
      title: post.title[next] ?? '',
      dek: post.dek[next] ?? '',
      body: post.body[next] ?? ''
    }));
  }

  const merge = (field: LocaleText | undefined, value: string): LocaleText => {
    const next = {...(field ?? {})};
    if (value.trim()) next[lang] = value.trim();
    else delete next[lang];
    return next;
  };

  async function save() {
    const slug = f.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      setMsg(t('mzSlugBad'));
      return;
    }
    if (!f.title.trim()) {
      setMsg(t('mzTitleNeeded'));
      return;
    }
    setBusy(true);
    setMsg('');

    const current = posts.find((p) => p.id === id);
    const row = {
      slug,
      cover: f.cover.trim() || null,
      title: merge(current?.title, f.title),
      dek: merge(current?.dek, f.dek),
      body: merge(current?.body, f.body),
      published: f.published,
      published_at: new Date(`${f.date}T09:00:00Z`).toISOString()
    };

    const {error} = id
      ? await supabase.from('posts').update(row).eq('id', id)
      : await supabase.from('posts').insert(row);

    setBusy(false);
    setMsg(error ? error.message : t('saved'));
    if (!error) {
      startNew();
      router.refresh();
    }
  }

  async function remove(post: Post) {
    if (!window.confirm(t('deleteConfirm'))) return;
    const {error} = await supabase.from('posts').delete().eq('id', post.id);
    setMsg(error ? error.message : t('saved'));
    if (!error) {
      if (id === post.id) startNew();
      router.refresh();
    }
  }

  return (
    <>
      <div className="adm-form mz-studio">
        <div className="adm-grid">
          <label>
            {t('slug')}
            <input
              value={f.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="ai-token-launch"
              disabled={Boolean(id)}
            />
          </label>
          <label>
            {t('mzCover')}
            <input
              value={f.cover}
              onChange={(e) => set('cover', e.target.value)}
              placeholder="/hero/s5.webp"
            />
          </label>
          <label>
            {t('mzDate')}
            <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label>
            {t('mzLang')}
            <select value={lang} onChange={(e) => switchLang(e.target.value)}>
              {routing.locales.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="adm-wide">
          {t('fieldTitle')}
          <input value={f.title} onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="adm-wide">
          {t('mzDek')}
          <input
            value={f.dek}
            onChange={(e) => set('dek', e.target.value)}
            placeholder={t('mzDekHint')}
          />
        </label>
        <label className="adm-wide">
          {t('mzBody')}
          <textarea
            className="mz-html"
            rows={16}
            value={f.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="<p>…</p>"
            spellCheck={false}
          />
        </label>
        <p className="adm-hint">{t('mzBodyHint')}</p>

        <div className="adm-actions">
          <label className="adm-check">
            <input
              type="checkbox"
              checked={f.published}
              onChange={(e) => set('published', e.target.checked)}
            />
            {t('publish')}
          </label>
          <button type="button" className="ac-btn" onClick={save} disabled={busy}>
            {busy ? t('uploading') : t('save')}
          </button>
          <button
            type="button"
            className="ac-btn quiet"
            onClick={() => setPreview((v) => !v)}
          >
            {t('mzPreview')}
          </button>
          {id && (
            <button type="button" className="ac-btn quiet" onClick={startNew}>
              {t('mzNew')}
            </button>
          )}
          {msg && <span className="adm-msg">{msg}</span>}
        </div>

        {preview && (
          <div className="mz-prev">
            <div className="art-k">{f.date.replace(/-/g, '.')}</div>
            <h3 className="art-t">{f.title || '—'}</h3>
            <p className="art-d">{f.dek}</p>
            <div
              className="art-body"
              dangerouslySetInnerHTML={{__html: safeHtml(f.body)}}
            />
          </div>
        )}
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>{t('mzDate')}</th>
            <th>{t('fieldTitle')}</th>
            <th>{t('mzLangs')}</th>
            <th>{t('status')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => {
            const langs = Object.keys(p.title).filter((k) => p.title[k]?.trim());
            return (
              <tr key={p.id}>
                <td className="adm-mono">{p.published_at.slice(0, 10)}</td>
                <td>{p.title[lang] ?? p.title.en ?? Object.values(p.title)[0] ?? p.slug}</td>
                <td className="adm-mono">{langs.join(' · ') || '—'}</td>
                <td>{p.published ? t('live') : t('draft')}</td>
                <td className="adm-row-acts">
                  <button type="button" className="adm-link" onClick={() => load(p)}>
                    {t('edit')}
                  </button>
                  <button type="button" className="adm-link warn" onClick={() => remove(p)}>
                    {t('delete')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
