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
   every other language it already has alone.

   Since M156 the others usually arrive by themselves: save with 자동 번역
   ticked and the article is translated into the remaining eight, one at a
   time, with the count filling in as they land. One language at a time
   because a single request for eight is the one that times out on a long
   article, and because a failure should cost one language, not all of
   them — whatever fails is named and can be run again on its own. */
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
  const [auto, setAuto] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  /** Translate one article out of `from` into every other locale. */
  async function translateAll(slug: string, from: string) {
    const targets = routing.locales.filter((l) => l !== from);
    const failed: string[] = [];
    for (const [n, to] of targets.entries()) {
      setRunning(t('mzTranslating', {done: n, total: targets.length, lang: to}));
      try {
        const res = await fetch('/api/admin/translate-post', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({slug, from, to})
        });
        if (!res.ok) {
          const {error} = (await res.json().catch(() => ({}))) as {error?: string};
          failed.push(`${to}${error ? ` (${error})` : ''}`);
        }
      } catch {
        failed.push(to);
      }
    }
    setRunning(null);
    setMsg(
      failed.length
        ? t('mzTranslatedSome', {n: targets.length - failed.length, failed: failed.join(', ')})
        : t('mzTranslated', {n: targets.length})
    );
    router.refresh();
  }

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
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg(t('saved'));
    startNew();
    router.refresh();
    // The article is saved either way; translating is what happens next.
    if (auto) await translateAll(slug, lang);
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
          <label className="adm-check">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            {t('mzAuto')}
          </label>
          <button
            type="button"
            className="ac-btn"
            onClick={save}
            disabled={busy || running !== null}
          >
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
          {running && <span className="adm-msg adm-run">{running}</span>}
          {!running && msg && <span className="adm-msg">{msg}</span>}
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
                <td className="adm-mono">
                  {langs.length === routing.locales.length ? (
                    <span className="ac-pill on">{t('mzAllLangs')}</span>
                  ) : (
                    langs.join(' · ') || '—'
                  )}
                </td>
                <td>{p.published ? t('live') : t('draft')}</td>
                <td className="adm-row-acts">
                  <button type="button" className="adm-link" onClick={() => load(p)}>
                    {t('edit')}
                  </button>
                  {/* Fills in whatever is missing, from the language the
                      article already has — for articles written before the
                      translator existed, and for retrying one that failed. */}
                  <button
                    type="button"
                    className="adm-link"
                    disabled={running !== null}
                    onClick={() => translateAll(p.slug, langs.includes(lang) ? lang : langs[0])}
                  >
                    {t('mzTranslate')}
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
