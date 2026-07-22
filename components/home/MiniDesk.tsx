'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {BOOKS, type Book} from '../../lib/books';

const SWAP_MS = 270; // matches .spread-s opacity transition (0.28s)
const FLIP_MS = 820; // matches .flip-s.go transform transition (0.78s)
const TURN_INTERVAL_MS = 5600;

const stripTags = (html: string) => html.replace(/<[^>]+>/g, '');

// One page of the small spread — same DOM as the prototype's miniPage().
function MiniPage({book, index}: {book: Book; index: number}) {
  const p = book.sp[index];
  if (!p) return null;
  const body = (p.fig ? `<div class="pi-fig"><b>${p.fig.i}</b>${p.fig.t}</div>` : '') + p.x;
  return (
    <>
      {p.ch && <div className="pi-ch">{p.ch}</div>}
      {p.h && <div className="pi-h" dangerouslySetInnerHTML={{__html: p.h}} />}
      <div className="pi-t" dangerouslySetInnerHTML={{__html: body}} />
      <div className="pi-n">{index + 1}</div>
    </>
  );
}

export default function MiniDesk({caption}: {caption: ReactNode}) {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);
  const [swapping, setSwapping] = useState(false);
  const [flip, setFlip] = useState<'idle' | 'live' | 'go'>('idle');
  const busyRef = useRef(false);

  const main = BOOKS[order[0]];

  // Tap a shelf book: fade the spread, swap it into the main slot, fade back.
  function swap(slot: number) {
    if (busyRef.current) return;
    busyRef.current = true;
    setSwapping(true);
    setTimeout(() => {
      setOrder((o) => {
        const next = [...o];
        [next[0], next[slot]] = [next[slot], next[0]];
        return next;
      });
      setSwapping(false);
      busyRef.current = false;
    }, SWAP_MS);
  }

  // Decorative auto page-turn on a 5.6s interval.
  useEffect(() => {
    const id = setInterval(() => {
      if (busyRef.current || document.hidden) return;
      busyRef.current = true;
      setFlip('live');
      // Two frames so the flipper paints at 0° before the transition starts.
      requestAnimationFrame(() => requestAnimationFrame(() => setFlip('go')));
      setTimeout(() => {
        setFlip('idle');
        busyRef.current = false;
      }, FLIP_MS);
    }, TURN_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo">
      <div className="demo-shelf">
        {order.slice(1).map((bi, si) => {
          const b = BOOKS[bi];
          return (
            <div className="mb" key={b.id} onClick={() => swap(si + 1)}>
              <div className="mb-pg">
                <div className="mb-ch">
                  {b.ic} {b.sp[0].ch ?? ''}
                </div>
                <div className="mb-h">{stripTags((b.sp[0].h ?? '').replace(/<br>/g, ' '))}</div>
                <div className="mb-t">{stripTags(b.sp[1].x)}</div>
              </div>
              <div className="mb-lb">{b.title}</div>
            </div>
          );
        })}
      </div>

      <div className="demo-main">
        <div className={swapping ? 'spread-s swap' : 'spread-s'}>
          <div className="pg-s l">
            <div className="pi">
              <MiniPage book={main} index={0} />
            </div>
          </div>
          <div className="sp-s" />
          <div className="pg-s r">
            <div className="pi">
              <MiniPage book={main} index={1} />
            </div>
          </div>
          <div
            className={`flip-s${flip !== 'idle' ? ' live' : ''}${flip === 'go' ? ' go' : ''}`}
            style={{transform: flip === 'go' ? 'rotateY(-172deg)' : 'rotateY(0deg)'}}
          >
            <div className="ff ff-a">
              <div className="pi">
                <MiniPage book={main} index={1} />
              </div>
              <div className="ff-sh" />
            </div>
            <div className="ff ff-b">
              <div className="pi">
                <MiniPage book={main} index={0} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-cap">{caption}</div>
    </div>
  );
}
