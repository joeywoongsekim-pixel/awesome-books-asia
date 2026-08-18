'use client';

/*
 * M9 — bookstore walkthrough (/books).
 * Entrance overlay (once per session) → sticky viewport where vertical scroll
 * maps to a horizontal walk along a 4-row shelf wall. Three layers move at
 * 0.35 / 1.00 / 1.40× so the scene reads as walking, not sliding (spec §4).
 * No libraries; transforms only; native scroll is never hijacked (spec §13).
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {SHELVES, ZONES, tri, type WalkBook, type WalkShelf} from '../../lib/shelves';
import {BOOKS} from '../../lib/books';

const ENTERED_KEY = 'bw-entered';
const FILLERS = 17; // 구획당 채움 17권 고정 (spec §7)

/* Deterministic integer hash → [0,1). Math.sin seeding can differ across
 * engines in the last bits and break hydration; integer ops cannot. */
function h01(n: number): number {
  let x = (n ^ 61) ^ (n >>> 16);
  x = (x + (x << 3)) | 0;
  x ^= x >>> 4;
  x = Math.imul(x, 0x27d4eb2d);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

function authorOf(slug: string): string | null {
  const b = BOOKS.find((x) => x.id === slug);
  return b ? b.author : null;
}

type Slot =
  | {kind: 'fill'; w: number; hPct: number; cloth: string; gap: number; lean: boolean}
  | {kind: 'book'; book: WalkBook; w: number; hPct: number; cloth: string; gap: number};

function baySlots(shelf: WalkShelf, si: number, bi: number): Slot[] {
  const bay = shelf.bays[bi];
  const T = bay.books.length;
  const n = FILLERS + T;
  const at = bay.books.map((_, k) => Math.round(((k + 1) * n) / (T + 1)));
  const slots: Slot[] = [];
  for (let i = 0; i < n; i++) {
    const seed = si * 977 + bi * 131 + i;
    const a = h01(seed);
    const b = h01(seed + 7919);
    const gap = i % 7 === 3 ? Math.round(18 + a * 46) : 0;
    const cloth = shelf.cloths[(i + bi * 2) % shelf.cloths.length];
    const bk = at.indexOf(i);
    if (bk >= 0) {
      slots.push({
        kind: 'book',
        book: bay.books[bk],
        w: bay.books[bk].face ? 92 : Math.round(26 + a * 6),
        hPct: shelf.low
          ? bay.books[bk].face
            ? 75
            : Math.round(70 + a * 5)
          : bay.books[bk].face
            ? 88
            : Math.round(87 + a * 6),
        cloth,
        gap
      });
    } else {
      slots.push({
        kind: 'fill',
        w: Math.round(17 + a * 8),
        hPct: shelf.low ? Math.round(66 + b * 9) : Math.round(74 + b * 20),
        cloth,
        gap,
        lean: i === Math.floor(h01(si * 53 + bi) * n)
      });
    }
  }
  return slots;
}

export default function BookWalk() {
  const locale = useLocale();
  const t = useTranslations('walk');

  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);

  const geo = useRef({travel: 0, trackTop: 0, range: 1, viewW: 1, entry: 0, walk: 1, bays: [] as number[]});
  const cur = useRef(0);
  const target = useRef(0);
  const zoneRef = useRef(-1);
  const rm = useRef(false);
  const seenSaved = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLImageElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // Scroll-driven entrance: the first stretch of the track opens the doors
  // and dollies through them — the visitor walks in with the wheel, nothing
  // plays on a timer. Scrolling back up walks out again.
  const [entryOn, setEntryOn] = useState(false);
  const [zone, setZone] = useState(0);
  const [ticks, setTicks] = useState<number[]>([0.33, 0.66]);
  const [drawer, setDrawer] = useState<{book: WalkBook; shelf: WalkShelf} | null>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const lock = (on: boolean) =>
    document.documentElement.classList.toggle('bw-lock', on);

  useLayoutEffect(() => {
    rm.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm.current) return; // 연출 전체 생략
    let seen = false;
    try {
      seen = sessionStorage.getItem(ENTERED_KEY) === '1';
    } catch {}
    const direct = new URLSearchParams(window.location.search).has('ref');
    if (!seen && !direct) {
      window.scrollTo(0, 0);
      setEntryOn(true);
    }
  }, []);

  /* ── geometry + camera loop (spec §6) ───────────────────────────────── */
  useEffect(() => {
    const track = trackRef.current!;
    const view = viewRef.current!;
    const wall = wallRef.current!;
    const back = backRef.current!;
    const front = frontRef.current!;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const viewW = view.clientWidth;
      const travel = Math.max(0, wall.scrollWidth - viewW);
      // scroll budget: entry dolly (≈1.2 screens) + shelf walk
      const entryScroll = entryOn ? Math.round(vh * 1.2) : 0;
      const walkScroll = Math.round((travel / vw) * 0.85 * vh);
      const trackH = vh + entryScroll + walkScroll;
      track.style.height = `${trackH}px`;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      geo.current.travel = travel;
      geo.current.trackTop = trackTop;
      geo.current.entry = entryScroll;
      geo.current.walk = Math.max(1, walkScroll);
      geo.current.range = Math.max(1, trackH - vh);
      geo.current.viewW = viewW;
      back.style.width = `${Math.ceil(travel * 0.35 + viewW + 200)}px`;
      front.style.width = `${Math.ceil(travel * 1.4 + viewW + 200)}px`;
      // bay boundaries (row 01) → rail ticks + zone detection
      const wallX = wall.getBoundingClientRect().left;
      const bays = Array.from(
        wall.querySelectorAll<HTMLElement>('.bw-row:first-child .bw-bay')
      ).map((el) => el.getBoundingClientRect().left - wallX);
      geo.current.bays = bays;
      if (travel > 0 && bays.length > 1) {
        setTicks(
          bays
            .slice(1)
            .map((x) => Math.min(0.98, Math.max(0.02, (x - viewW / 2) / travel)))
        );
      }
      onScroll();
    };

    const onScroll = () => {
      const g = geo.current;
      target.current = Math.min(
        1,
        Math.max(0, (window.scrollY - g.trackTop) / g.range)
      );
    };

    const apply = (c: number) => {
      const g = geo.current;
      const sPx = c * g.range;
      // entry dolly (scroll-driven doors + zoom-through)
      const e = g.entry > 0 ? Math.min(1, Math.max(0, sPx / g.entry)) : 1;
      if (enterRef.current) {
        const el = enterRef.current;
        if (e >= 0.999) {
          el.style.visibility = 'hidden';
          if (!seenSaved.current) {
            seenSaved.current = true;
            try {
              sessionStorage.setItem(ENTERED_KEY, '1');
            } catch {}
          }
        } else {
          el.style.visibility = 'visible';
          const zoom =
            e < 0.3 ? 1 : 1 + Math.pow((e - 0.3) / 0.7, 1.55) * 6.2;
          el.style.transform = `translateZ(0) scale(${zoom.toFixed(4)})`;
          el.style.opacity =
            e > 0.8 ? `${Math.max(0, 1 - (e - 0.8) / 0.19).toFixed(3)}` : '1';
          if (openRef.current)
            openRef.current.style.opacity = `${Math.min(1, e / 0.34).toFixed(3)}`;
          if (hintRef.current)
            hintRef.current.style.opacity = `${Math.max(0, 1 - e * 4).toFixed(3)}`;
        }
      }
      // shelf walk
      const w =
        g.entry > 0
          ? Math.min(1, Math.max(0, (sPx - g.entry) / g.walk))
          : Math.min(1, Math.max(0, sPx / g.walk));
      const x = w * g.travel;
      wall.style.transform = `translate3d(${-x}px,0,0)`;
      back.style.transform = `translate3d(${-x * 0.35}px,0,0)`;
      front.style.transform = `translate3d(${-x * 1.4}px,0,0)`;
      if (dotRef.current) dotRef.current.style.left = `${w * 100}%`;
      if (capRef.current)
        capRef.current.style.left = `${Math.min(88, Math.max(12, w * 100))}%`;
      const cx = x + g.viewW / 2;
      let z = 0;
      for (let i = 0; i < g.bays.length; i++) if (cx >= g.bays[i]) z = i;
      if (z !== zoneRef.current) {
        zoneRef.current = z;
        setZone(z);
      }
    };

    let raf = 0;
    const loop = () => {
      const tg = target.current;
      let c = cur.current;
      if (rm.current) c = tg; // 관성 보간 생략 — 즉시 반영
      else {
        c += (tg - c) * 0.11;
        if (Math.abs(tg - c) < 0.0002) c = tg;
      }
      if (c !== cur.current || raf === 0) {
        cur.current = c;
        apply(c);
      }
      raf = requestAnimationFrame(loop);
    };

    measure();
    // re-measure once fonts settle (spine widths shift slightly)
    const t2 = setTimeout(measure, 600);
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', measure);
    raf = requestAnimationFrame(loop);
    return () => {
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, [entryOn]);

  /* ── keyboard focus follows the camera (spec §10) ───────────────────── */
  const followFocus = useCallback((el: HTMLElement) => {
    const wall = wallRef.current;
    if (!wall) return;
    const g = geo.current;
    if (g.travel <= 0) return;
    const x =
      el.getBoundingClientRect().left -
      wall.getBoundingClientRect().left +
      el.offsetWidth / 2;
    const p = Math.min(1, Math.max(0, (x - g.viewW / 2) / g.travel));
    window.scrollTo({top: g.trackTop + g.entry + p * g.walk});
  }, []);

  /* ── drawer (spec §8) ───────────────────────────────────────────────── */
  const openDrawer = useCallback((book: WalkBook, shelf: WalkShelf, src: HTMLElement) => {
    lastFocus.current = src;
    setDrawer({book, shelf});
    lock(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer(null);
    lock(false);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawer) return;
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab' && drawerRef.current) {
        const f = drawerRef.current.querySelectorAll<HTMLElement>('button, a[href]');
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer, closeDrawer]);

  const replay = useCallback(() => {
    try {
      sessionStorage.removeItem(ENTERED_KEY);
    } catch {}
    seenSaved.current = false;
    window.scrollTo(0, 0);
    if (!rm.current) setEntryOn(true);
  }, []);

  // Skip jumps the scroll to the end of the entry stretch — the camera lerp
  // turns the jump into a quick dolly-through.
  const skipEntry = useCallback(() => {
    const g = geo.current;
    try {
      sessionStorage.setItem(ENTERED_KEY, '1');
    } catch {}
    seenSaved.current = true;
    window.scrollTo({top: g.trackTop + g.entry});
  }, []);

  /* ── render helpers ─────────────────────────────────────────────────── */
  const spineLabel = (b: WalkBook) => tri(locale, b);
  const rowLabel = (s: WalkShelf) => tri(locale, s);

  const renderSlot = (slot: Slot, shelf: WalkShelf, key: number) => {
    if (slot.kind === 'fill') {
      return (
        <span
          key={key}
          className={`bw-fill${slot.lean ? ' bw-lean' : ''}`}
          aria-hidden="true"
          style={{
            width: slot.w,
            height: `${slot.hPct}%`,
            background: slot.cloth,
            marginLeft: slot.gap || undefined
          }}
        />
      );
    }
    const b = slot.book;
    const label = spineLabel(b);
    // §12 — 영문·일문 책등이 넘치면 축소, 그래도 넘치면 채움용으로 강등
    if (!b.face && label.length > 28) {
      return (
        <span
          key={key}
          className="bw-fill"
          aria-hidden="true"
          style={{
            width: slot.w,
            height: `${slot.hPct}%`,
            background: slot.cloth,
            marginLeft: slot.gap || undefined
          }}
        />
      );
    }
    const aria = `${label} — ${rowLabel(shelf)}`;
    if (b.face) {
      // Real books stand shelved as spines; hover/focus pulls the book off
      // the shelf and turns it to show the actual front cover (M12c).
      if (b.cover) {
        return (
          <button
            key={key}
            type="button"
            className={`bw-book bw-pull${b.rep ? ' bw-rep' : ''}`}
            aria-label={aria}
            onClick={(e) => openDrawer(b, shelf, e.currentTarget)}
            onFocus={(e) => followFocus(e.currentTarget)}
            style={{height: `${Math.min(slot.hPct, 79)}%`, marginLeft: slot.gap || undefined}}
          >
            <span
              className="bw-b3"
              style={{['--cov' as string]: `url(${b.cover})`}}
            >
              <i
                className="bw-b3-spine"
                style={{backgroundColor: b.spineBg, color: b.spineFg}}
              >
                <b>{label}</b>
              </i>
              <i className="bw-b3-back" style={{backgroundColor: b.spineBg}} />
              <i className="bw-b3-cover">
                <img src={b.cover} alt="" loading="lazy" decoding="async" />
                <u className="bw-b3-pages" aria-hidden="true" />
              </i>
            </span>
          </button>
        );
      }
      return (
        <button
          key={key}
          type="button"
          className={`bw-book bw-face${b.rep ? ' bw-rep' : ''}`}
          aria-label={aria}
          onClick={(e) => openDrawer(b, shelf, e.currentTarget)}
          onFocus={(e) => followFocus(e.currentTarget)}
          style={{
            width: slot.w,
            height: `${slot.hPct}%`,
            background: b.rep ? undefined : slot.cloth,
            marginLeft: slot.gap || undefined,
            color: shelf.foil
          }}
        >
          <span className="bw-face-t">{label}</span>
          {authorOf(b.slug) ? (
            <span className="bw-face-a">{authorOf(b.slug)}</span>
          ) : null}
        </button>
      );
    }
    return (
      <button
        key={key}
        type="button"
        className="bw-book bw-spine"
        aria-label={aria}
        onClick={(e) => openDrawer(b, shelf, e.currentTarget)}
        onFocus={(e) => followFocus(e.currentTarget)}
        style={{
          width: slot.w,
          height: `${slot.hPct}%`,
          background: slot.cloth,
          marginLeft: slot.gap || undefined,
          color: shelf.foil,
          fontSize: label.length > 16 && locale !== 'ko' ? 10 : undefined
        }}
      >
        <span className="bw-spine-t">{label}</span>
      </button>
    );
  };

  const dBook = drawer?.book;
  const dShelf = drawer?.shelf;

  return (
    <div className="bw" data-entry={entryOn ? 'scroll' : 'done'}>
      <div className="bw-track" ref={trackRef}>
        <div className="bw-view" ref={viewRef}>
          {/* back — 0.35× (photographic interior, M12) */}
          <div className="bw-back bw-back-photo" ref={backRef} aria-hidden="true" />

          {/* wall — 1.00× */}
          <div className="bw-wall" ref={wallRef}>
            <div className="bw-porch" aria-hidden="true" />
            <div className="bw-shelfblock">
              {SHELVES.map((shelf, si) => (
                <div className={`bw-row${shelf.low ? ' bw-low' : ''}`} key={shelf.no}>
                  {shelf.bays.map((bay, bi) => (
                    <div
                      className={`bw-bay${bay.photo ? ' bw-bay-photo' : ''}`}
                      key={bi}
                      style={
                        bay.photo
                          ? {
                              backgroundImage: `url(/walk/${bay.photo}.webp)`,
                              backgroundPosition: bay.pos,
                              backgroundSize: bay.zoom
                            }
                          : undefined
                      }
                    >
                      <div className="bw-signplate" aria-hidden="true">
                        {tri(locale, bay.sign)}
                      </div>
                      <div className="bw-slotrow">
                        {bay.photo
                          ? // photographic shelves carry their own books — only
                            // the real, interactive titles are overlaid
                            baySlots(shelf, si, bi)
                              .filter((s) => s.kind === 'book')
                              .map((slot, i) => renderSlot(slot, shelf, i))
                          : baySlots(shelf, si, bi).map((slot, i) =>
                              renderSlot(slot, shelf, i)
                            )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="bw-endwall" aria-hidden="true">
              <div className="bw-emblem">AB</div>
              <p>{t('endnote')}</p>
            </div>
          </div>

          {/* floor — fixed */}
          <div className="bw-floor" aria-hidden="true" />

          {/* front — 1.40× (photographic props, M12) */}
          <div className="bw-front" ref={frontRef} aria-hidden="true">
            <img className="bw-prop" src="/walk/prop-table.webp" alt="" style={{left: '13%'}} loading="lazy" decoding="async" />
            <img className="bw-prop bw-prop-chair" src="/walk/prop-chair.webp" alt="" style={{left: '72%'}} loading="lazy" decoding="async" />
          </div>

          {/* gutter — 좌측 분류 라벨 */}
          <div className="bw-gutter" aria-hidden="true">
            {SHELVES.map((s, i) => (
              <div
                className="bw-glabel"
                key={s.no}
                style={{top: `${((i + 0.5) * 100) / SHELVES.length}%`}}
              >
                <b>{s.no}</b>
                <span>{rowLabel(s)}</span>
                {locale !== 'en' ? <i>{s.en}</i> : null}
              </div>
            ))}
          </div>

          {/* hud */}
          <div className="bw-hud">
            <button type="button" className="bw-again" onClick={replay}>
              {t('again')}
            </button>
          </div>

          {/* rail — 하단 진행 레일 */}
          <div className="bw-rail" role="img" aria-label={t('railLabel')}>
            <div className="bw-rail-line">
              {ticks.map((f, i) => (
                <i key={i} style={{left: `${f * 100}%`}} />
              ))}
              <div className="bw-dot" ref={dotRef} />
            </div>
            <div className="bw-cap" ref={capRef}>
              {tri(locale, ZONES[zone] ?? ZONES[0])}
            </div>
          </div>
        </div>
      </div>

      {/* ── entrance — scroll-driven dolly through the doors ───────────── */}
      {entryOn
        ? createPortal(
            <div className="bw bw-portal">
              <div className="bw-enter bw-enter-scroll" role="presentation" ref={enterRef}>
                <div className="bw-fcd">
                  <img className="bw-fcd-img" src="/walk/facade-closed.webp" alt="" />
                  <img
                    className="bw-fcd-img bw-fcd-open"
                    src="/walk/facade-open.webp"
                    alt=""
                    ref={openRef}
                  />
                  <div className="bw-fsign">
                    <b>AWESOME BOOKS</b>
                    <i>어썸북스 · オーサムブックス · Awesome Books</i>
                  </div>
                  <div className="bw-plaque bw-fplaque">OPEN · 영업중</div>
                </div>
                <div className="bw-hint" ref={hintRef}>
                  {t('scrollHint')}
                  <span aria-hidden="true">⌄</span>
                </div>
              </div>
              <button type="button" className="bw-skipbtn" onClick={skipEntry}>
                {t('skip')}
              </button>
            </div>,
            document.body
          )
        : null}

      {/* ── detail drawer (spec §8) — portaled above the sticky nav ───── */}
      {dBook && dShelf
        ? createPortal(
            <div className="bw bw-portal">
              <div className="bw-dim" onClick={closeDrawer} aria-hidden="true" />
          <aside
            className="bw-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={spineLabel(dBook)}
            ref={drawerRef}
            tabIndex={-1}
          >
            <button
              type="button"
              className="bw-x"
              onClick={closeDrawer}
              aria-label={t('close')}
            >
              ×
            </button>
            {dBook.cover ? (
              <div className="bw-dcover bw-dcover-img">
                <img src={dBook.cover} alt="" decoding="async" />
              </div>
            ) : (
              <div
                className={`bw-dcover${dBook.rep ? ' bw-rep' : ''}`}
                style={{
                  background: dBook.rep ? undefined : dShelf.cloths[1],
                  color: dShelf.foil
                }}
              >
                <span>{spineLabel(dBook)}</span>
              </div>
            )}
            <p className="bw-dcat">
              {dShelf.no} · {rowLabel(dShelf)}
            </p>
            <h3 className="bw-dtitle">{spineLabel(dBook)}</h3>
            <p className="bw-dalts">
              {[dBook.ko, dBook.en, dBook.ja]
                .filter((x) => x !== spineLabel(dBook))
                .join(' · ')}
            </p>
            {authorOf(dBook.slug) ? (
              <p className="bw-dauthor">{authorOf(dBook.slug)}</p>
            ) : null}
            <p className="bw-ddesc">{tri(locale, dBook.desc)}</p>
            <p>
              <span className={`bw-badge bw-badge-${dBook.status}`}>
                {t(dBook.status)}
              </span>
            </p>
            {dBook.slug ? (
              <Link className="bw-dlink" href={`/books/${dBook.slug}`}>
                {t('detail')}
              </Link>
            ) : null}
          </aside>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
