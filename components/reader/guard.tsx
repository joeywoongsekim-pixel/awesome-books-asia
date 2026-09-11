'use client';

import {useEffect, useMemo} from 'react';

// M27 — copy deterrence for the readers. The real protection is server-side
// (the sampling RPC and storage RLS only ever hand out what a session may
// read); this layer closes the casual paths — select/copy, right-click save,
// drag-out, save/print shortcuts — and stamps a per-reader watermark so a
// full-content screen capture identifies the account it came from.

const isFormField = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
};

export function useReadGuard() {
  useEffect(() => {
    const swallow = (e: Event) => {
      if (isFormField(e.target)) return;
      e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'p' || k === 's') e.preventDefault();
      else if (!isFormField(e.target) && (k === 'c' || k === 'x' || k === 'a')) e.preventDefault();
    };
    const blocked: Array<[string, (e: Event) => void]> = [
      ['copy', swallow],
      ['cut', swallow],
      ['contextmenu', swallow],
      ['dragstart', swallow],
      ['selectstart', swallow]
    ];
    blocked.forEach(([n, f]) => document.addEventListener(n, f));
    window.addEventListener('keydown', onKey);
    return () => {
      blocked.forEach(([n, f]) => document.removeEventListener(n, f));
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}

export function Watermark({owner}: {owner?: string | null}) {
  const bg = useMemo(() => {
    const label = (owner ? `${owner} · awesomebooks.asia` : 'AWESOME BOOKS ASIA · SAMPLE')
      .slice(0, 60)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;');
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='440' height='280'>` +
      `<text x='220' y='140' text-anchor='middle' transform='rotate(-24 220 140)' ` +
      `font-family='Georgia, serif' font-size='15' fill='#4a3a28'>${label}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [owner]);
  return <div className="rd-wm" aria-hidden="true" style={{backgroundImage: bg}} />;
}
