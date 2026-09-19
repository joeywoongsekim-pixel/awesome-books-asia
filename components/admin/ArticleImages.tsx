'use client';

import {useCallback, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import type {SupabaseClient} from '@supabase/supabase-js';
import {missingImages, replaceSource, uploadImage} from '../../lib/postImages';

// M160 — pictures, by paste.
//
// Two things happen here, and they are the same thing seen from two ends.
//
// The tray takes a picture off the clipboard or off the desktop, puts it in
// storage, and hands back an address to paste into the markup. That is for
// writing an article: paste the photograph, paste the address, carry on.
//
// The slots below it are for an article already written. A piece composed
// somewhere else arrives with its pictures named but not yet anywhere —
// /magazine/…/01-main-door.png, typed in before the file existed. Every
// such address is asked for, and the ones nobody answers get a slot. Drop
// the right file on a slot and the address in the body is repointed at the
// copy now in storage. Nothing has to be renamed to match.

type Shot = {url: string; name: string};

export default function ArticleImages({
  slug,
  body,
  onBody,
  onReplace,
  supabase
}: {
  slug: string;
  body: string;
  onBody: (next: string) => void;
  /* A picture filled in here is the same picture in every language: the
     translator copies an address across untouched, so the broken path sits
     in all nine bodies. The studio is told about the swap so it can apply
     it to the other eight on save. */
  onReplace: (from: string, to: string) => void;
  supabase: SupabaseClient;
}) {
  const t = useTranslations('admin');
  const [shots, setShots] = useState<Shot[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState('');

  const named = slug.trim() || 'untitled';

  // Which pictures this article names but nobody serves. Re-checked as the
  // body is edited, but not on every keystroke.
  useEffect(() => {
    let live = true;
    const id = setTimeout(() => {
      missingImages(body).then((m) => live && setMissing(m));
    }, 700);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [body]);

  const take = useCallback(
    async (files: (File | Blob)[], into?: string) => {
      setErr('');
      const pictures = files.filter((f) => f.type.startsWith('image/'));
      if (pictures.length === 0) {
        setErr(t('mzNotAPicture'));
        return;
      }
      for (const [n, file] of pictures.entries()) {
        setBusy(t('mzImages', {done: n, total: pictures.length}));
        try {
          const url = await uploadImage(file, named, supabase);
          if (into) {
            onBody(replaceSource(body, into, url));
            onReplace(into, url);
            setMissing((m) => m.filter((s) => s !== into));
          } else {
            setShots((s) => [
              {url, name: 'name' in file ? (file as File).name : t('mzPasted')},
              ...s
            ]);
          }
        } catch (e) {
          setErr(e instanceof Error ? e.message : 'upload failed');
        }
      }
      setBusy('');
    },
    [body, named, onBody, onReplace, supabase, t]
  );

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setErr(t('mzCopyFailed'));
    }
  }

  return (
    <div className="mz-pics">
      {/* A textarea swallows a pasted image, so the tray takes the paste
          itself — click it once and press the keys. */}
      <div
        className={over ? 'mz-drop on' : 'mz-drop'}
        tabIndex={0}
        onPaste={(e) => {
          const files = [...e.clipboardData.files];
          if (files.length) {
            e.preventDefault();
            void take(files);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void take([...e.dataTransfer.files]);
        }}
      >
        <span>{busy || t('mzDropHint')}</span>
        <label className="mz-pick">
          {t('mzChooseFile')}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              void take([...(e.target.files ?? [])]);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {err && <p className="adm-msg mz-err">{err}</p>}

      {missing.length > 0 && (
        <div className="mz-missing">
          <p className="adm-hint">{t('mzMissing', {n: missing.length})}</p>
          {missing.map((src) => (
            <div
              key={src}
              className="mz-slot"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void take([...e.dataTransfer.files], src);
              }}
            >
              <code>{src}</code>
              <label className="mz-pick">
                {t('mzFillSlot')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    void take([...(e.target.files ?? [])], src);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {shots.length > 0 && (
        <ul className="mz-shots">
          {shots.map((s) => (
            <li key={s.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="" />
              <code>{s.url}</code>
              <button type="button" className="ac-btn quiet" onClick={() => copy(s.url)}>
                {copied === s.url ? t('mzCopied') : t('mzCopy')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
