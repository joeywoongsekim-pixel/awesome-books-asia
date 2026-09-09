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
          <h2 className="wh-title">BOOK CART QUEST</h2>
          <p className="wh-sub">
            북카트를 밀며 카테고리 책장 사이를 누비고, 책을 담아 계산대로!
            <br />
            Push the cart, collect our books, and check out at the cashier
          </p>
          <div className="wh-ctas">
            <button type="button" className="wh-start" onClick={() => setStarted(true)}>
              🛒 퀘스트 시작 · Start the quest
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
