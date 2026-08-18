'use client';

/*
 * M15 — the bookstore as a room (adventure-game view).
 * Scroll-driven entrance (doors) → you stand INSIDE the store: three walls,
 * two bookcases each. Scrolling turns your head across the room; clicking a
 * bookcase walks you up to it, where the published books can be pulled off
 * the shelf. Esc / "back to the store" steps back into the room.
 * Pure CSS 3D transforms — no libraries, native scroll preserved.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '../../i18n/navigation';
import {tri, type Tri, type WalkBook} from '../../lib/shelves';
import {CASES, type RoomCase} from '../../lib/room';
import {BOOKS} from '../../lib/books';

const ENTERED_KEY = 'bw-entered';

// framed wall poster copy (the brand slogan, localized)
const POSTER: Tri = {
  ko: '아시아의\n이야기를\n세계의\n언어로',
  en: "Asian stories\nin the world's\nlanguages",
  ja: 'アジアの\n物語を、\n世界の\n言葉で'
};

// room geometry (rig space, camera at the origin) — scaled by k on small screens
const ROOM_W = 1700;
const DEPTH = 1400;
const CASE_W = 620;
const CASE_GAP = 120;
const APPROACH = 170; // camera-to-case distance when browsing
const SWEEP = 55; // deg each way

function authorOf(slug: string): string | null {
  const b = BOOKS.find((x) => x.id === slug);
  return b ? b.author : null;
}

// per-case rig transform when approached (see geometry notes in the repo log)
function caseTransform(i: number, k: number): string {
  const half = (CASE_W + CASE_GAP) / 2;
  const off = DEPTH / 2 + (i % 2 === 0 ? -half : half) * (i < 2 ? 1 : -1);
  if (i < 2) {
    // left wall: children near→far, centers z = -(DEPTH/2 ∓ half)
    const zc = -(DEPTH / 2 + (i === 0 ? -half : half));
    return `rotateY(-90deg) translate3d(${(ROOM_W / 2 - APPROACH) * k}px, 0, ${-zc * k}px)`;
  }
  if (i < 4) {
    const cx = (i === 2 ? -half : half);
    return `translate3d(${-cx * k}px, 0, ${(DEPTH - APPROACH) * k}px)`;
  }
  // right wall: children far→near, centers z = -(DEPTH/2 ± half)
  const zc = -(DEPTH / 2 + (i === 4 ? half : -half));
  void off;
  return `rotateY(90deg) translate3d(${(APPROACH - ROOM_W / 2) * k}px, 0, ${-zc * k}px)`;
}

export default function RoomStore() {
  const locale = useLocale();
  const t = useTranslations('walk');

  const trackRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLImageElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const geo = useRef({trackTop: 0, range: 1, entry: 0, look: 1, k: 1});
  const cur = useRef(0);
  const target = useRef(0);
  const rm = useRef(false);
  const seenSaved = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const modeRef = useRef<'room' | number>('room');

  const [entryOn, setEntryOn] = useState(false);
  const [mode, setMode] = useState<'room' | number>('room');
  const [zone, setZone] = useState(0);
  const [k, setK] = useState(1);
  const [drawer, setDrawer] = useState<{book: WalkBook; kase: RoomCase} | null>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const zoneRef = useRef(0);
  const yawRef = useRef(0);

  const savedY = useRef(0);
  const lockRef = useRef(false);
  // overflow:hidden on the root collapses scrollY, so save/restore it and
  // freeze the camera loop while locked
  const lock = (on: boolean) => {
    if (on === lockRef.current) return;
    lockRef.current = on;
    if (on) {
      savedY.current = window.scrollY;
      document.documentElement.classList.add('bw-lock');
      // sticky stops pinning under overflow:hidden while Chrome keeps the
      // scroll offset — park at 0 so the unpinned view fills the viewport
      window.scrollTo(0, 0);
    } else {
      document.documentElement.classList.remove('bw-lock');
      window.scrollTo(0, savedY.current);
    }
  };

  useLayoutEffect(() => {
    rm.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm.current) return;
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

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /* ── geometry + camera loop ─────────────────────────────────────────── */
  useEffect(() => {
    const track = trackRef.current!;
    const rig = rigRef.current!;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const kk = Math.min(1, Math.max(0.42, vw / 1500));
      setK(kk);
      geo.current.k = kk;
      const entryScroll = entryOn ? Math.round(vh * 1.2) : 0;
      const lookScroll = Math.round(vh * 1.7);
      const trackH = vh + entryScroll + lookScroll;
      track.style.height = `${trackH}px`;
      geo.current.trackTop = track.getBoundingClientRect().top + window.scrollY;
      geo.current.entry = entryScroll;
      geo.current.look = lookScroll;
      geo.current.range = Math.max(1, trackH - vh);
      onScroll();
    };

    const onScroll = () => {
      if (lockRef.current) return; // scroll collapses to 0 under the lock
      const g = geo.current;
      target.current = Math.min(
        1,
        Math.max(0, (window.scrollY - g.trackTop) / g.range)
      );
    };

    const apply = (c: number) => {
      const g = geo.current;
      const sPx = c * g.range;
      const sRaw = target.current * g.range;
      const e = g.entry > 0 ? Math.min(1, Math.max(0, sRaw / g.entry)) : 1;
      if (enterRef.current) {
        const el = enterRef.current;
        if (e >= 0.999) {
          el.style.visibility = 'hidden';
          if (skipRef.current) skipRef.current.style.display = 'none';
          if (!seenSaved.current) {
            seenSaved.current = true;
            try {
              sessionStorage.setItem(ENTERED_KEY, '1');
            } catch {}
          }
        } else {
          el.style.visibility = 'visible';
          if (skipRef.current) skipRef.current.style.display = '';
          const zoom = e < 0.3 ? 1 : 1 + Math.pow((e - 0.3) / 0.7, 1.55) * 6.2;
          el.style.transform = `translateZ(0) scale(${zoom.toFixed(4)})`;
          el.style.opacity =
            e > 0.8 ? `${Math.max(0, 1 - (e - 0.8) / 0.19).toFixed(3)}` : '1';
          if (openRef.current)
            openRef.current.style.opacity = `${Math.min(1, e / 0.34).toFixed(3)}`;
          if (hintRef.current)
            hintRef.current.style.opacity = `${Math.max(0, 1 - e * 4).toFixed(3)}`;
        }
      }
      // look-around (only while standing in the room)
      const p = Math.min(1, Math.max(0, (sPx - g.entry) / g.look));
      if (modeRef.current === 'room') {
        const theta = -SWEEP + 2 * SWEEP * p;
        rig.style.transform = `rotateY(${theta.toFixed(3)}deg)`;
        yawRef.current = theta;
      }
      // billboard props always face the camera
      const kk = g.k;
      rig.querySelectorAll<HTMLElement>('.rm-prop').forEach((el) => {
        const px = Number(el.dataset.x) * kk;
        const pz = Number(el.dataset.z) * kk;
        const flip = el.dataset.flip ? ' scaleX(-1)' : '';
        el.style.transform = `translate3d(${px}px, 0, ${pz}px) rotateY(${(-yawRef.current).toFixed(3)}deg) scale(${kk})${flip}`;
      });
      const z = Math.min(5, Math.floor(p * 6));
      if (z !== zoneRef.current) {
        zoneRef.current = z;
        setZone(z);
      }
    };

    let raf = 0;
    let applied = false; // the first frame must apply even when cur === target
    const loop = () => {
      const tg = target.current;
      let c = cur.current;
      if (rm.current) c = tg;
      else {
        c += (tg - c) * 0.11;
        if (Math.abs(tg - c) < 0.0002) c = tg;
      }
      if (c !== cur.current || !applied) {
        applied = true;
        cur.current = c;
        apply(c);
      }
      raf = requestAnimationFrame(loop);
    };

    measure();
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

  /* ── approach / step back ───────────────────────────────────────────── */
  const approach = useCallback((i: number) => {
    const rig = rigRef.current;
    if (!rig) return;
    modeRef.current = i; // immediately — the rAF loop must stop steering
    setMode(i);
    lock(true);
    rig.classList.add('rm-anim');
    rig.style.transform = caseTransform(i, geo.current.k);
    yawRef.current = i < 2 ? -90 : i < 4 ? 0 : 90;
  }, []);

  const stepBack = useCallback(() => {
    const rig = rigRef.current;
    modeRef.current = 'room';
    setMode('room');
    lock(false);
    if (rig) {
      // return to wherever the head was turned
      const g = geo.current;
      const sPx = cur.current * g.range;
      const p = Math.min(1, Math.max(0, (sPx - g.entry) / g.look));
      rig.style.transform = `rotateY(${(-SWEEP + 2 * SWEEP * p).toFixed(3)}deg)`;
      setTimeout(() => rig.classList.remove('rm-anim'), 950);
    }
  }, []);

  // approach from the chips: also aim the head at that wall for the return
  const goCase = useCallback(
    (i: number) => {
      if (mode === i) return;
      approach(i);
    },
    [mode, approach]
  );

  useEffect(() => {
    if (typeof mode !== 'number') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !drawer) stepBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, drawer, stepBack]);

  /* ── drawer ─────────────────────────────────────────────────────────── */
  const openDrawer = useCallback((book: WalkBook, kase: RoomCase, src: HTMLElement) => {
    lastFocus.current = src;
    setDrawer({book, kase});
    lock(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawer(null);
    if (modeRef.current === 'room') lock(false);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawer) return;
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeDrawer();
      }
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
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [drawer, closeDrawer]);

  const replay = useCallback(() => {
    try {
      sessionStorage.removeItem(ENTERED_KEY);
    } catch {}
    seenSaved.current = false;
    if (typeof modeRef.current === 'number') stepBack();
    window.scrollTo(0, 0);
    if (!rm.current) setEntryOn(true);
  }, [stepBack]);

  const skipEntry = useCallback(() => {
    const g = geo.current;
    try {
      sessionStorage.setItem(ENTERED_KEY, '1');
    } catch {}
    seenSaved.current = true;
    window.scrollTo({top: g.trackTop + g.entry});
  }, []);

  /* ── render ─────────────────────────────────────────────────────────── */
  const label = (b: WalkBook) => tri(locale, b as unknown as Tri);

  const renderBook = (b: WalkBook, kase: RoomCase, active: boolean, key: number) => {
    const aria = `${label(b)}${b.ed ? ` (${tri(locale, b.ed)})` : ''} — ${tri(locale, kase.name)}`;
    return (
      <button
        key={key}
        type="button"
        className={`bw-book bw-pull${b.rep ? ' bw-rep' : ''}`}
        aria-label={aria}
        tabIndex={active ? 0 : -1}
        onClick={(e) => openDrawer(b, kase, e.currentTarget)}
        style={{height: '64%'}}
      >
        <span className="bw-b3" style={{['--cov' as string]: `url(${b.cover})`}}>
          <i className="bw-b3-spine" style={{backgroundColor: b.spineBg, color: b.spineFg}}>
            <b>{label(b)}</b>
          </i>
          <i className="bw-b3-back" style={{backgroundColor: b.spineBg}} />
          <i className="bw-b3-cover">
            <img src={b.cover} alt="" loading="lazy" decoding="async" />
            <u className="bw-b3-pages" aria-hidden="true" />
          </i>
        </span>
      </button>
    );
  };

  const renderCase = (kase: RoomCase, i: number) => {
    const active = mode === i;
    return (
      <div className={`rm-case${active ? ' rm-case-on' : ''}`} key={kase.no}>
        <div className="rm-case-sign">
          <b>{kase.no}</b> {tri(locale, kase.name)}
        </div>
        {kase.levels.map((lv, li) => (
          <div
            className="rm-level"
            key={li}
            style={{backgroundPosition: `${25 + ((i * 3 + li) % 3) * 25}% 90%`}}
          >
            {lv.map((b, bi) => renderBook(b, kase, active, bi))}
            {kase.soon && li === 1 ? (
              <span className="rm-soonplate">{t('soon')}</span>
            ) : null}
          </div>
        ))}
        {!active ? (
          <button
            type="button"
            className="rm-hit"
            aria-label={`${tri(locale, kase.name)} — ${t('browseCase')}`}
            onClick={() => goCase(i)}
          />
        ) : null}
      </div>
    );
  };

  const dBook = drawer?.book;
  const dCase = drawer?.kase;
  const dims = {
    roomW: ROOM_W * k,
    depth: DEPTH * k,
    caseW: CASE_W * k,
    gap: CASE_GAP * k
  };

  // a framed cover poster hung on a wall (left/top are wall-relative)
  const art = (src: string, left: string, top: string, w: number) => (
    <span
      key={`${src}@${left}`}
      className="rm-art"
      style={{left, top, width: w * k}}
      aria-hidden="true"
    >
      <img src={src} alt="" />
    </span>
  );

  return (
    <div className="bw rm" data-mode={typeof mode === 'number' ? 'case' : 'room'}>
      <div className="bw-track" ref={trackRef}>
        <div className="bw-view rm-view" ref={viewRef}>
          <div className="rm-rig" ref={rigRef}>
            {/* back wall */}
            <div
              className="rm-wall rm-wall-back"
              style={{
                width: dims.roomW,
                marginLeft: -dims.roomW / 2,
                transform: `translateZ(${-dims.depth}px)`,
                gap: dims.gap,
                ...( {['--casew']: `${dims.caseW}px`} as object )
              }}
            >
              {[CASES[2], CASES[3]].map((c, j) => renderCase(c, 2 + j))}
              {art('/covers/ai-bible.jpg', '5%', '22%', 118)}
              {art('/covers/quantum-econ.jpg', '50%', '25%', 86)}
              {art('/covers/isekai-ja.jpg', '95%', '22%', 118)}
              <span
                className="rm-clock"
                style={{left: '50%', top: '8%', width: 46 * k, height: 46 * k}}
                aria-hidden="true"
              />
            </div>
            {/* left wall */}
            <div
              className="rm-wall rm-wall-left"
              style={{
                width: dims.depth,
                marginLeft: -dims.roomW / 2,
                transform: 'rotateY(90deg)',
                gap: dims.gap,
                ...( {['--casew']: `${dims.caseW}px`} as object )
              }}
            >
              {[CASES[0], CASES[1]].map((c, j) => renderCase(c, j))}
              {art('/covers/ninja-cat-ko.jpg', '50%', '25%', 86)}
            </div>
            {/* right wall */}
            <div
              className="rm-wall rm-wall-right"
              style={{
                width: dims.depth,
                marginLeft: dims.roomW / 2,
                transform: `translateZ(${-dims.depth}px) rotateY(-90deg)`,
                gap: dims.gap,
                ...( {['--casew']: `${dims.caseW}px`} as object )
              }}
            >
              {[CASES[4], CASES[5]].map((c, j) => renderCase(c, 4 + j))}
              <span
                className="rm-art rm-art-brand"
                style={{
                  left: '50%',
                  top: '24%',
                  width: 96 * k,
                  padding: `${16 * k}px ${7 * k}px`
                }}
                aria-hidden="true"
              >
                <u />
                <i style={{fontSize: Math.max(7, 8.5 * k)}}>AWESOME BOOKS ASIA</i>
                <b style={{fontSize: Math.max(10, 12.5 * k)}}>{tri(locale, POSTER)}</b>
                <u />
              </span>
            </div>
            {/* floor */}
            <div
              className="rm-floor"
              style={{
                width: dims.roomW,
                height: dims.depth,
                marginLeft: -dims.roomW / 2
              }}
              aria-hidden="true"
            />

            {/* furniture — billboarded standees (steered from the loop) */}
            <div className="rm-prop rm-p-table" data-x="0" data-z="-800" aria-hidden="true">
              <img src="/walk/prop-table.webp" alt="" loading="lazy" decoding="async" />
              <span className="rm-banker">
                <i className="rm-banker-shade" />
                <i className="rm-banker-stem" />
                <i className="rm-banker-base" />
                <i className="rm-banker-glow" />
              </span>
            </div>
            <div className="rm-prop rm-p-chair" data-x="-430" data-z="-660" aria-hidden="true">
              <img src="/walk/prop-chair.webp" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="rm-prop rm-p-chair rm-p-chair2" data-x="440" data-z="-720" data-flip="1" aria-hidden="true">
              <img src="/walk/prop-chair.webp" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="rm-prop rm-p-chair rm-p-chair3" data-x="150" data-z="-1000" aria-hidden="true">
              <img src="/walk/prop-chair.webp" alt="" loading="lazy" decoding="async" />
            </div>
            <div className="rm-prop rm-p-hifi" data-x="710" data-z="-1090" aria-hidden="true">
              <i className="rm-hifi-lid" />
              <i className="rm-hifi-dial" />
              <i className="rm-hifi-dial rm-hifi-dial2" />
              <i className="rm-hifi-grille" />
              <i className="rm-hifi-sp" />
              <i className="rm-hifi-sp rm-hifi-sp2" />
              <i className="rm-hifi-legs" />
            </div>
            <div className="rm-prop rm-p-kiosk" data-x="-640" data-z="-1000" aria-hidden="true">
              <img src="/walk/prop-cashier.webp" alt="" />
            </div>
          </div>

          {/* vignette + HUD */}
          <div className="rm-vig" aria-hidden="true" />
          <div className="bw-hud">
            {typeof mode === 'number' ? (
              <button type="button" className="bw-again" onClick={stepBack}>
                ← {t('backRoom')}
              </button>
            ) : (
              <button type="button" className="bw-again" onClick={replay}>
                {t('again')}
              </button>
            )}
          </div>

          {/* category chips */}
          <div className="rm-chips" role="tablist" aria-label={t('railLabel')}>
            {CASES.map((c, i) => (
              <button
                key={c.no}
                type="button"
                className={`rm-chip${(typeof mode === 'number' ? mode : zone) === i ? ' rm-chip-on' : ''}`}
                onClick={() => goCase(i)}
              >
                {tri(locale, c.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* entrance — scroll-driven */}
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
              <button type="button" className="bw-skipbtn" ref={skipRef} onClick={skipEntry}>
                {t('skip')}
              </button>
            </div>,
            document.body
          )
        : null}

      {/* drawer */}
      {dBook && dCase
        ? createPortal(
            <div className="bw bw-portal">
              <div className="bw-dim" onClick={closeDrawer} aria-hidden="true" />
              <aside
                className="bw-drawer"
                role="dialog"
                aria-modal="true"
                aria-label={label(dBook)}
                ref={drawerRef}
                tabIndex={-1}
              >
                <button type="button" className="bw-x" onClick={closeDrawer} aria-label={t('close')}>
                  ×
                </button>
                {dBook.cover ? (
                  <div className="bw-dcover bw-dcover-img">
                    <img src={dBook.cover} alt="" decoding="async" />
                  </div>
                ) : null}
                <p className="bw-dcat">
                  {dCase.no} · {tri(locale, dCase.name)}
                </p>
                <h3 className="bw-dtitle">{label(dBook)}</h3>
                {dBook.ed ? <p className="bw-ded">{tri(locale, dBook.ed)}</p> : null}
                {authorOf(dBook.slug) ? (
                  <p className="bw-dauthor">{authorOf(dBook.slug)}</p>
                ) : null}
                <p className="bw-ddesc">{tri(locale, dBook.desc)}</p>
                <p>
                  <span className={`bw-badge bw-badge-${dBook.status}`}>{t(dBook.status)}</span>
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
