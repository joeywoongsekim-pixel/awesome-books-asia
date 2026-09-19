'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import {routing} from '../../i18n/routing';
import {safeHtml, type LocaleText, type Post} from '../../lib/magazine';
import {inlineImageCount, liftImages, uploadImage} from '../../lib/postImages';
import ArticleImages from './ArticleImages';

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
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  /* Pictures filled in on this visit: a dead address and the copy that now
     answers for it. The same dead address sits in the other eight
     languages, so the swap is applied to all of them on save. */
  const [swaps, setSwaps] = useState<Record<string, string>>({});

  /* Paste a photograph straight into the markup: it goes to storage and an
     <img> tag lands where the cursor was. The alternative — the browser's
     own behaviour — is nothing at all, because a textarea drops an image
     on the floor. */
  async function pasteImage(files: File[]) {
    const pictures = files.filter((x) => x.type.startsWith('image/'));
    if (pictures.length === 0) return false;
    const el = bodyRef.current;
    const at = el?.selectionStart ?? f.body.length;
    const to = el?.selectionEnd ?? at;
    setRunning(t('mzImages', {done: 0, total: pictures.length}));
    const tags: string[] = [];
    try {
      for (const [n, file] of pictures.entries()) {
        setRunning(t('mzImages', {done: n, total: pictures.length}));
        const url = await uploadImage(file, f.slug.trim() || 'untitled', supabase);
        tags.push(`<img src="${url}" alt="" loading="lazy">`);
      }
      setF((prev) => ({
        ...prev,
        body: prev.body.slice(0, at) + tags.join('\n') + prev.body.slice(to)
      }));
      setMsg(t('mzImagesStored', {n: tags.length}));
    } catch (e) {
      setMsg(t('mzImagesFailed', {why: e instanceof Error ? e.message : 'unknown'}));
    }
    setRunning(null);
    return true;
  }

  /** The same, for the one picture that lives in a field rather than the body. */
  async function coverImage(file: File) {
    setRunning(t('mzImages', {done: 0, total: 1}));
    try {
      const url = await uploadImage(file, f.slug.trim() || 'untitled', supabase);
      setF((prev) => ({...prev, cover: url}));
      setMsg(t('mzImagesStored', {n: 1}));
    } catch (e) {
      setMsg(t('mzImagesFailed', {why: e instanceof Error ? e.message : 'unknown'}));
    }
    setRunning(null);
  }

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

    // Before anything is written: move the photographs out of the markup
    // and into our own storage. Pasted-in pictures would otherwise be
    // dropped on save — the sanitiser does not pass data: URIs — and a
    // hotlinked one would go blank the day its host moves it.
    let body = f.body;
    let pictures = '';
    try {
      const lifted = await liftImages(body, slug, supabase, (done, total) =>
        setRunning(t('mzImages', {done, total}))
      );
      body = lifted.html;
      setRunning(null);
      if (lifted.stored) pictures = t('mzImagesStored', {n: lifted.stored});
      if (lifted.skipped.length) {
        setBusy(false);
        setRunning(null);
        setMsg(t('mzImagesFailed', {why: lifted.skipped.join('; ')}));
        return;
      }
    } catch (e) {
      setBusy(false);
      setRunning(null);
      setMsg(t('mzImagesFailed', {why: e instanceof Error ? e.message : 'unknown'}));
      return;
    }

    const current = posts.find((p) => p.id === id);

    /* Every language's body carries the same picture addresses, because the
       translator copies them across untouched. A picture filled in above is
       therefore fixed in all nine at once — otherwise the Korean article
       would come right and the other eight would stay broken. */
    const bodies: LocaleText = {...((current?.body ?? {}) as LocaleText)};
    for (const [from, to] of Object.entries(swaps)) {
      for (const loc of Object.keys(bodies)) {
        bodies[loc] = bodies[loc].replaceAll(`src="${from}"`, `src="${to}"`);
      }
    }

    const row = {
      slug,
      cover: f.cover.trim() || null,
      title: merge(current?.title, f.title),
      dek: merge(current?.dek, f.dek),
      body: {...bodies, ...merge(bodies, body)},
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
    setMsg(pictures ? `${t('saved')} ${pictures}` : t('saved'));
    setSwaps({});
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
          {/* The cover takes a paste or a drop as well — it is a picture
              like any other, and typing a path for a file that does not
              exist yet is how the last one ended up blank. */}
          <label>
            {t('mzCover')}
            <input
              value={f.cover}
              onChange={(e) => set('cover', e.target.value)}
              onPaste={(e) => {
                const files = [...e.clipboardData.files];
                if (files.some((x) => x.type.startsWith('image/'))) {
                  e.preventDefault();
                  void coverImage(files[0]);
                }
              }}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('Files')) e.preventDefault();
              }}
              onDrop={(e) => {
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith('image/')) {
                  e.preventDefault();
                  void coverImage(file);
                }
              }}
              placeholder={t('mzCoverHint')}
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
            ref={bodyRef}
            className="mz-html"
            rows={16}
            value={f.body}
            onChange={(e) => set('body', e.target.value)}
            onPaste={(e) => {
              const files = [...e.clipboardData.files];
              if (files.some((x) => x.type.startsWith('image/'))) {
                e.preventDefault();
                void pasteImage(files);
              }
            }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('Files')) e.preventDefault();
            }}
            onDrop={(e) => {
              const files = [...e.dataTransfer.files];
              if (files.some((x) => x.type.startsWith('image/'))) {
                e.preventDefault();
                void pasteImage(files);
              }
            }}
            placeholder="<p>…</p>"
            spellCheck={false}
          />
        </label>
        <p className="adm-hint">
          {t('mzBodyHint')}
          {/* Pasted-in photographs are noticed before you press save, so
              nobody has to wonder whether they survived. */}
          {inlineImageCount(f.body) > 0 && (
            <>
              {' '}
              <b>{t('mzImagesFound', {n: inlineImageCount(f.body)})}</b>
            </>
          )}
        </p>

        <ArticleImages
          slug={f.slug}
          body={f.body}
          onBody={(next) => set('body', next)}
          onReplace={(from, to) => setSwaps((s) => ({...s, [from]: to}))}
          supabase={supabase}
        />

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
