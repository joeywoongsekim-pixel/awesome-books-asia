'use client';

import dynamic from 'next/dynamic';

// three/rapier are browser-only — skip SSR entirely
const BookWorld = dynamic(() => import('./BookWorld'), {
  ssr: false,
  loading: () => <div className="wd-wrap wd-loading">LOADING WORLD…</div>
});

export default function WorldClient() {
  return <BookWorld />;
}
