'use client';

/*
 * M20 — the World on the homepage: a click-to-start embed.
 * Shows a lightweight poster; three/rapier (~1.4MB) load only after
 * the visitor presses start, so the landing page stays fast.
 */

import {useState} from 'react';
import dynamic from 'next/dynamic';
import {Link} from '../../i18n/navigation';

const BookWorld = dynamic(() => import('./BookWorld'), {
  ssr: false,
  loading: () => <div className="wd-wrap wd-embed wd-loading">LOADING WORLD…</div>
});

export default function WorldHero() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <section className="wh">
        <BookWorld embed />
      </section>
    );
  }

  return (
    <section className="wh">
      <div className="wh-poster">
        <div className="wh-copy">
          <p className="wh-kicker">INTERACTIVE</p>
          <h2 className="wh-title">AWESOME BOOKS WORLD</h2>
          <p className="wh-sub">
            북 트럭을 몰고 밤거리를 달려 서점까지 — 책을 밀고, 도미노를 넘어뜨리세요
            <br />
            Drive the book truck through the night street to our store
          </p>
          <div className="wh-ctas">
            <button type="button" className="wh-start" onClick={() => setStarted(true)}>
              🚚 운전 시작 · Start driving
            </button>
            <Link className="wh-store" href="/books">
              바로 서점으로 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
