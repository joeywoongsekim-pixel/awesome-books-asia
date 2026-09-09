'use client';

/*
 * M21 — BOOK CART QUEST (in-store shopping RPG).
 * You push a book cart around the store interior, weaving between the
 * six category bookcases. The nine published editions hover in front of
 * their categories as pickups — drive close and they land in your cart
 * (visibly stacking up), then roll to the cashier to check out: the
 * checkout panel links every collected book to its real detail page.
 * three + @react-three/fiber (no physics needed — pickups + zones).
 */

import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {Billboard} from '@react-three/drei';
import * as THREE from 'three';
import {Link, useRouter} from '../../i18n/navigation';

const CASHIER = new THREE.Vector3(-18, 0, 22);
const CASHIER_DIST = 5;
const PICK_DIST = 3.4;
const BOUND = 27;

/* ── the catalogue: 9 editions, their category case, pickup spot ─────── */
export const QUEST_BOOKS = [
  {slug: 'ninja-cat', img: '/covers/ninja-cat-ko.jpg', bg: '#f2cf5b', label: '덜렁이 닌자 고양이 쿠로편', pos: [-25, -18]},
  {slug: 'ninja-cat', img: '/covers/ninja-cat.jpg', bg: '#e8b64a', label: 'おっちょこ忍キャット', pos: [-25, -12]},
  {slug: 'quantum-econ', img: '/covers/quantum-econ.jpg', bg: '#ece7db', label: 'Quantum Economics', pos: [-19, -25]},
  {slug: 'quantum-econ', img: '/covers/quantum-econ-ja.jpg', bg: '#1a1440', label: '量子経済学', pos: [-13, -25]},
  {slug: 'isekai', img: '/covers/isekai-ko.jpg', bg: '#b98f3a', label: '이세계 엔터프리너십 입문', pos: [-16, -20]},
  {slug: 'isekai', img: '/covers/isekai.jpg', bg: '#233f37', label: 'ISEKAI Entrepreneurship', pos: [-9, -21]},
  {slug: 'isekai', img: '/covers/isekai-ja.jpg', bg: '#44502a', label: '異世界アントレプレナーシップ', pos: [-5, -25]},
  {slug: 'ai-bible', img: '/covers/ai-bible.jpg', bg: '#101c36', label: 'Awesome AI Bible 2026', pos: [12, -25]},
  {slug: 'ai-bible', img: '/covers/ai-bible-ja.jpg', bg: '#16233d', label: 'AIバイブル 2026', pos: [18, -22]}
] as const;

const CASES = [
  {no: '01', name: '그림책 · 아동', x: -31, z: -15, rotY: Math.PI / 2},
  {no: '02', name: '교육 · 어학', x: -31, z: 9, rotY: Math.PI / 2},
  {no: '03', name: '경제 · 경영', x: -13, z: -31, rotY: 0},
  {no: '04', name: 'AI · 테크', x: 13, z: -31, rotY: 0},
  {no: '05', name: '에세이 · 교양', x: 31, z: -15, rotY: -Math.PI / 2},
  {no: '06', name: '문고판 · 클래식', x: 31, z: 9, rotY: -Math.PI / 2}
] as const;

/* ── input (keyboard + touch joystick share one ref) ─────────────────── */
type Input = {fwd: number; turn: number};

function useInput(joy: React.MutableRefObject<Input>) {
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, []);
  return () => {
    const k = keys.current;
    const fwd = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0);
    const turn = (k['a'] || k['arrowleft'] ? 1 : 0) - (k['d'] || k['arrowright'] ? 1 : 0);
    return {fwd: fwd || joy.current.fwd, turn: turn || joy.current.turn};
  };
}

/* ── brass sign texture for each case ────────────────────────────────── */
function makeSignTexture(no: string, name: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = '#241b12';
  g.fillRect(0, 0, 512, 96);
  g.strokeStyle = 'rgba(233,197,104,0.5)';
  g.lineWidth = 4;
  g.strokeRect(8, 8, 496, 80);
  g.fillStyle = '#c9a24a';
  g.font = '28px serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(`${no}  ${name}`, 256, 52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── a category bookcase against the wall ────────────────────────────── */
function Bookcase({no, name, x, z, rotY}: (typeof CASES)[number]) {
  const sign = useMemo(() => makeSignTexture(no, name), [no, name]);
  const minis = useMemo(() => {
    const cols = ['#4a3b2f', '#5d4632', '#3e3a45', '#57423b', '#22334d', '#6e5a3a', '#8a2f2a'];
    return Array.from({length: 14}, (_, i) => ({
      x: -3.6 + (i % 7) * 1.15 + ((i * 13) % 3) * 0.12,
      y: i < 7 ? 3.1 : 5.6,
      h: 1.5 + ((i * 7) % 4) * 0.16,
      c: cols[(i * 5) % 7]
    }));
  }, []);
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* frame + glowing interior */}
      <mesh position={[0, 4.5, -0.5]}>
        <boxGeometry args={[10, 9, 1.4]} />
        <meshStandardMaterial color="#241b12" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.4, 0.22]}>
        <planeGeometry args={[9, 8.2]} />
        <meshStandardMaterial color="#4a3018" roughness={0.85} emissive="#8a5a26" emissiveIntensity={0.35} />
      </mesh>
      {/* shelves */}
      {[2.2, 4.7, 7.2].map((sy) => (
        <mesh key={sy} position={[0, sy, 0.28]}>
          <boxGeometry args={[9.2, 0.3, 0.9]} />
          <meshStandardMaterial color="#2c1e0d" roughness={0.8} />
        </mesh>
      ))}
      {/* decorative mini spines */}
      {minis.map((m, i) => (
        <mesh key={i} position={[m.x, m.y - 0.75 + m.h / 2, 0.3]}>
          <boxGeometry args={[0.66, m.h, 0.5]} />
          <meshStandardMaterial color={m.c} roughness={0.7} />
        </mesh>
      ))}
      {/* sign */}
      <mesh position={[0, 9.6, 0.1]}>
        <planeGeometry args={[7.6, 1.4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* case light */}
      <pointLight position={[0, 8.4, 2.4]} color="#ffbe73" intensity={160} distance={14} decay={2} />
    </group>
  );
}

/* ── a hovering pickup book (RPG item) ───────────────────────────────── */
function PickupBook({
  book,
  index,
  takenRef
}: {
  book: (typeof QUEST_BOOKS)[number];
  index: number;
  takenRef: React.MutableRefObject<boolean[]>;
}) {
  const tex = useLoader(THREE.TextureLoader, book.img);
  tex.colorSpace = THREE.SRGBColorSpace;
  const grp = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const mats = useMemo(() => {
    const solid = (c: string) => new THREE.MeshStandardMaterial({color: c, roughness: 0.6});
    return [
      solid('#efe6d2'),
      solid(book.bg),
      solid('#efe6d2'),
      solid('#5a4832'),
      new THREE.MeshStandardMaterial({map: tex, roughness: 0.5}),
      solid(book.bg)
    ];
  }, [tex, book.bg]);

  useFrame(({clock}) => {
    const g = grp.current;
    if (!g) return;
    const taken = takenRef.current[index];
    // pop away once collected
    const target = taken ? 0 : 1;
    const s = g.scale.x + (target - g.scale.x) * 0.18;
    g.scale.setScalar(Math.max(0.0001, s));
    g.visible = s > 0.01;
    if (!taken) {
      const t = clock.elapsedTime;
      g.position.y = 1.9 + Math.sin(t * 1.8 + index) * 0.22;
      g.rotation.y = t * 0.7 + index;
      if (ring.current) {
        const p = 1 + Math.sin(t * 2.4 + index) * 0.08;
        ring.current.scale.setScalar(p);
      }
    }
  });

  return (
    <group ref={grp} position={[book.pos[0], 1.9, book.pos[1]]}>
      <mesh material={mats} castShadow>
        <boxGeometry args={[1.7, 2.5, 0.42]} />
      </mesh>
      <mesh ref={ring} position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.4, 32]} />
        <meshBasicMaterial color="#e9c568" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ── billboard sprites reused from the room (cashier, reading table) ─── */
function Sprite({url, w, h, position}: {url: string; w: number; h: number; position: [number, number, number]}) {
  const tex = useLoader(THREE.TextureLoader, url);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <Billboard position={position} follow lockX lockZ>
      <mesh position={[0, h / 2, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} transparent alphaTest={0.12} roughness={0.8} />
      </mesh>
    </Billboard>
  );
}

/* ── the cart: movement, camera, pickups, zones ──────────────────────── */
function Cart({
  joy,
  takenRef,
  onPick,
  onCashier
}: {
  joy: React.MutableRefObject<Input>;
  takenRef: React.MutableRefObject<boolean[]>;
  onPick: (i: number) => void;
  onCashier: (b: boolean) => void;
}) {
  const vis = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const readInput = useInput(joy);
  const st = useRef({x: 0, z: 20, h: 0, v: 0, nearC: false});
  const camPos = useRef(new THREE.Vector3(0, 6, 30));

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const s = st.current;
    const {fwd, turn} = readInput();
    s.v += fwd * 22 * d;
    s.v *= Math.pow(0.32, d);
    if (Math.abs(s.v) < 0.02 && !fwd) s.v = 0;
    s.h += turn * Math.min(1, Math.abs(s.v) / 5) * 2.4 * d * (s.v >= 0 ? 1 : -1);
    s.x -= Math.sin(s.h) * s.v * d;
    s.z -= Math.cos(s.h) * s.v * d;
    s.x = Math.max(-BOUND, Math.min(BOUND, s.x));
    s.z = Math.max(-BOUND, Math.min(BOUND, s.z));

    if (vis.current) {
      vis.current.position.set(s.x, 0, s.z);
      vis.current.rotation.y = s.h;
    }
    for (const w of wheels.current) if (w) w.rotation.x -= (s.v * d) / 0.42;

    // pickups
    for (let i = 0; i < QUEST_BOOKS.length; i++) {
      if (takenRef.current[i]) continue;
      const b = QUEST_BOOKS[i];
      if (Math.hypot(s.x - b.pos[0], s.z - b.pos[1]) < PICK_DIST) {
        takenRef.current[i] = true;
        onPick(i);
      }
    }
    // cashier zone
    const nearC = Math.hypot(s.x - CASHIER.x, s.z - CASHIER.z) < CASHIER_DIST;
    if (nearC !== s.nearC) {
      s.nearC = nearC;
      onCashier(nearC);
    }

    // chase camera
    const back = new THREE.Vector3(Math.sin(s.h), 0, Math.cos(s.h));
    const want = new THREE.Vector3(s.x, 0, s.z).add(back.multiplyScalar(9)).add(new THREE.Vector3(0, 5.6, 0));
    camPos.current.lerp(want, 1 - Math.pow(0.02, d));
    state.camera.position.copy(camPos.current);
    state.camera.lookAt(s.x, 1.4, s.z);
  });

  const wood = '#7a5230';
  return (
    <group ref={vis}>
      {/* tub */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[1.9, 0.95, 2.7]} />
        <meshStandardMaterial color={wood} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[2.08, 0.14, 2.9]} />
        <meshStandardMaterial color="#3a2817" roughness={0.8} />
      </mesh>
      {/* brass handle */}
      <mesh position={[0, 1.95, 1.55]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[1.7, 0.09, 0.09]} />
        <meshStandardMaterial color="#caa25c" metalness={0.6} roughness={0.35} />
      </mesh>
      {[-0.82, 0.82].map((hx) => (
        <mesh key={hx} position={[hx, 1.75, 1.44]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.7, 8]} />
          <meshStandardMaterial color="#caa25c" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {/* collected books stack up in the tub */}
      {QUEST_BOOKS.map((b, i) => (
        <CartBook key={i} index={i} bg={b.bg} takenRef={takenRef} />
      ))}
      {/* wheels */}
      {[
        [-0.95, -0.95],
        [0.95, -0.95],
        [-0.95, 0.95],
        [0.95, 0.95]
      ].map(([wx, wz], i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) wheels.current[i] = m;
          }}
          position={[wx, 0.42, wz]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.42, 0.42, 0.26, 16]} />
          <meshStandardMaterial color="#17100a" roughness={0.9} />
        </mesh>
      ))}
      {/* little lantern on the handle */}
      <mesh position={[0.8, 2.12, 1.5]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#ffe2a0" emissive="#ffe2a0" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0, 2.4, 0]} color="#ffd28a" intensity={60} distance={12} decay={2} />
    </group>
  );
}

/* a mini book that appears in the tub once its edition is collected */
function CartBook({index, bg, takenRef}: {index: number; bg: string; takenRef: React.MutableRefObject<boolean[]>}) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!m.current) return;
    const target = takenRef.current[index] ? 1 : 0.0001;
    const s = m.current.scale.x + (target - m.current.scale.x) * 0.2;
    m.current.scale.setScalar(s);
    m.current.visible = s > 0.01;
  });
  const col = index % 3;
  const row = Math.floor(index / 3);
  return (
    <mesh
      ref={m}
      scale={0.0001}
      position={[-0.55 + col * 0.55, 1.72 + (row % 2) * 0.24, -0.55 + row * 0.55]}
      rotation={[0, (index * 37) % 2 ? 0.35 : -0.25, 0]}
    >
      <boxGeometry args={[0.62, 0.22, 0.9]} />
      <meshStandardMaterial color={bg} roughness={0.6} />
    </mesh>
  );
}

/* ── the store interior: floor, walls, pendants ──────────────────────── */
function Interior() {
  const wood = useLoader(THREE.TextureLoader, '/walk/floor.webp');
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(4, 4);
  wood.colorSpace = THREE.SRGBColorSpace;
  const wall = '#6b5638';
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[66, 66]} />
        <meshStandardMaterial map={wood} roughness={0.85} color="#a98c6c" />
      </mesh>
      {/* walls */}
      {[
        {p: [0, 6, -33] as [number, number, number], r: 0, w: 66},
        {p: [-33, 6, 0] as [number, number, number], r: Math.PI / 2, w: 66},
        {p: [33, 6, 0] as [number, number, number], r: -Math.PI / 2, w: 66},
        {p: [-20, 6, 33] as [number, number, number], r: Math.PI, w: 26},
        {p: [20, 6, 33] as [number, number, number], r: Math.PI, w: 26}
      ].map((wl, i) => (
        <mesh key={i} position={wl.p} rotation={[0, wl.r, 0]}>
          <planeGeometry args={[wl.w, 12]} />
          <meshStandardMaterial color={wall} roughness={0.95} />
        </mesh>
      ))}
      {/* warm glow spilling in from the entrance gap */}
      <pointLight position={[0, 5, 30]} color="#ffbe73" intensity={220} distance={22} decay={2} />
      {/* pendants */}
      {[
        [-12, 0],
        [12, 0],
        [0, -14],
        [0, 14]
      ].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 10.6, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.8, 6]} />
            <meshStandardMaterial color="#171008" />
          </mesh>
          <mesh position={[0, 9.1, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#ffd98f" emissive="#ffd98f" emissiveIntensity={2.2} />
          </mesh>
          <pointLight position={[0, 8.8, 0]} color="#ffbe73" intensity={340} distance={30} decay={2} />
        </group>
      ))}
    </>
  );
}

/* ── page component ──────────────────────────────────────────────────── */
export default function BookWorld({embed = false}: {embed?: boolean}) {
  const router = useRouter();
  const joy = useRef<Input>({fwd: 0, turn: 0});
  const takenRef = useRef<boolean[]>(Array(QUEST_BOOKS.length).fill(false));
  const [taken, setTaken] = useState<boolean[]>(() => Array(QUEST_BOOKS.length).fill(false));
  const [nearCashier, setNearCashier] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const joyEl = useRef<HTMLDivElement>(null);
  const nubEl = useRef<HTMLDivElement>(null);

  const count = taken.filter(Boolean).length;
  const all = count === QUEST_BOOKS.length;

  const onPick = (i: number) => {
    setTaken((t) => {
      const n = [...t];
      n[i] = true;
      return n;
    });
    setToast(`🛒 ${QUEST_BOOKS[i].label}`);
    window.setTimeout(() => setToast(null), 1800);
  };

  // touch joystick
  useEffect(() => {
    const el = joyEl.current;
    if (!el) return;
    let id = -1;
    const set = (dx: number, dy: number) => {
      const m = Math.hypot(dx, dy) || 1;
      const c = Math.min(1, m / 34);
      const nx = (dx / m) * c;
      const ny = (dy / m) * c;
      joy.current = {fwd: -ny, turn: -nx};
      if (nubEl.current) nubEl.current.style.transform = `translate(${nx * 30}px, ${ny * 30}px)`;
    };
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      el.setPointerCapture(id);
      const r = el.getBoundingClientRect();
      set(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const r = el.getBoundingClientRect();
      set(e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      joy.current = {fwd: 0, turn: 0};
      if (nubEl.current) nubEl.current.style.transform = '';
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <div className={`wd-wrap${embed ? ' wd-embed' : ''}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{position: [0, 6, 30], fov: 54, near: 0.4, far: 200}}
        gl={{antialias: true}}
        onCreated={({scene, gl}) => {
          scene.background = new THREE.Color('#120b06');
          scene.fog = new THREE.Fog('#120b06', 46, 90);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.25;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight color="#6b543a" intensity={1.15} />
          <hemisphereLight color="#3a3550" groundColor="#3a2513" intensity={0.8} />
          <Interior />
          {CASES.map((c) => (
            <Bookcase key={c.no} {...c} />
          ))}
          {QUEST_BOOKS.map((b, i) => (
            <PickupBook key={i} book={b} index={i} takenRef={takenRef} />
          ))}
          {/* cashier + reading table, as billboard sprites from the room */}
          <Sprite url="/walk/prop-cashier.webp" w={10.4} h={9.6} position={[CASHIER.x, 0, CASHIER.z]} />
          <Sprite url="/walk/prop-table.webp" w={9.5} h={5.9} position={[10, 0, -3]} />
          <Cart joy={joy} takenRef={takenRef} onPick={onPick} onCashier={setNearCashier} />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="wd-hud" aria-hidden="true">
        <p className="wd-title">BOOK CART QUEST</p>
        <p className="wd-hint">
          {all
            ? '전 권 수집 완료! 계산대로 가세요 🎉 · All collected — head to the cashier'
            : '카트를 몰고 떠 있는 책을 담은 뒤 계산대로 · Collect the books, then check out'}
        </p>
      </div>
      <div className="wd-count" aria-hidden="true">
        🛒 {count} / {QUEST_BOOKS.length}
      </div>
      {toast ? <div className="wd-toast">{toast}</div> : null}
      {nearCashier ? (
        count > 0 ? (
          <button type="button" className="wd-enter" onClick={() => setCheckout(true)}>
            💳 계산하기 · Check out ({count})
          </button>
        ) : (
          <div className="wd-enter wd-enter-empty">🛒 카트가 비었어요 — 책을 먼저 담아 오세요</div>
        )
      ) : null}
      {!embed ? (
        <button type="button" className="wd-back" onClick={() => router.push('/books')}>
          ← 서점으로
        </button>
      ) : null}
      <div className="wd-joy" ref={joyEl}>
        <div className="wd-joy-nub" ref={nubEl} />
      </div>

      {/* checkout panel */}
      {checkout ? (
        <div className="wd-checkout">
          <div className="wd-co-panel">
            <button type="button" className="wd-co-x" onClick={() => setCheckout(false)} aria-label="close">
              ×
            </button>
            <p className="wd-co-title">🧾 계산대 · Checkout</p>
            <p className="wd-co-sub">담은 책 {count}권 — 표지를 누르면 구매 페이지로 이동합니다</p>
            <div className="wd-co-grid">
              {QUEST_BOOKS.map((b, i) =>
                taken[i] ? (
                  <Link key={i} className="wd-co-item" href={`/books/${b.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.img} alt={b.label} />
                    <span>{b.label}</span>
                  </Link>
                ) : null
              )}
            </div>
            {all ? <p className="wd-co-done">🏆 전 권 수집! 진정한 책방 단골이시군요.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
