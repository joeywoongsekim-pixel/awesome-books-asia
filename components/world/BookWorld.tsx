'use client';

/*
 * M19/M20 — AWESOME BOOKS WORLD (bruno-simon.com-style).
 * A lamplit night neighbourhood you drive through in a little book
 * delivery truck: buildings with lit windows, trees, physics toys
 * (cones, a ball, a row of book dominoes), giant knockable books with
 * our real covers — and the actual storefront at the end of the street.
 * three + @react-three/fiber + rapier physics. Loaded client-side only.
 */

import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {Stars} from '@react-three/drei';
import {Physics, RigidBody, CuboidCollider, type RapierRigidBody} from '@react-three/rapier';
import * as THREE from 'three';
import {useRouter} from '../../i18n/navigation';

const DOOR = new THREE.Vector3(0, 0, -62); // storefront doorstep
const ENTER_DIST = 9;

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
    return {
      fwd: fwd || joy.current.fwd,
      turn: turn || joy.current.turn
    };
  };
}

/* ── little canvas textures (windows, awning stripes) ────────────────── */
function makeWindowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 96;
  const g = c.getContext('2d')!;
  g.fillStyle = '#191009';
  g.fillRect(0, 0, 64, 96);
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++) {
      const lit = (x * 7 + y * 13) % 4 > 0;
      g.fillStyle = lit ? `rgba(255, ${170 + ((x + y) % 3) * 24}, 110, ${0.75 + ((x * y) % 2) * 0.2})` : '#241a12';
      g.fillRect(7 + x * 19, 8 + y * 18, 11, 12);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function makeStripeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? '#f2e4bf' : '#22334d';
    g.fillRect(i * 8, 0, 8, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── the delivery truck: kinematic body + visual + follow camera ─────── */
function Truck({joy, onNear}: {joy: React.MutableRefObject<Input>; onNear: (b: boolean) => void}) {
  const body = useRef<RapierRigidBody>(null);
  const vis = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const readInput = useInput(joy);
  const st = useRef({x: 0, z: 30, h: 0, v: 0, near: false});
  const camPos = useRef(new THREE.Vector3(0, 7, 44));
  const stripes = useMemo(makeStripeTexture, []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const s = st.current;
    const {fwd, turn} = readInput();
    s.v += fwd * 26 * d;
    s.v *= Math.pow(0.35, d); // drag
    if (Math.abs(s.v) < 0.02 && !fwd) s.v = 0;
    s.h += turn * Math.min(1, Math.abs(s.v) / 6) * 2.2 * d * (s.v >= 0 ? 1 : -1);
    s.x -= Math.sin(s.h) * s.v * d;
    s.z -= Math.cos(s.h) * s.v * d;
    s.x = Math.max(-17.5, Math.min(17.5, s.x)); // stay on the street + plazas
    s.z = Math.max(-58, Math.min(60, s.z));

    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s.h, 0));
    body.current?.setNextKinematicTranslation({x: s.x, y: 0.9, z: s.z});
    body.current?.setNextKinematicRotation(q);
    if (vis.current) {
      vis.current.position.set(s.x, 0, s.z);
      vis.current.quaternion.copy(q);
    }
    for (const w of wheels.current) if (w) w.rotation.x -= (s.v * d) / 0.45;

    // chase camera
    const back = new THREE.Vector3(Math.sin(s.h), 0, Math.cos(s.h));
    const want = new THREE.Vector3(s.x, 0, s.z).add(back.multiplyScalar(11)).add(new THREE.Vector3(0, 6.2, 0));
    camPos.current.lerp(want, 1 - Math.pow(0.02, d));
    state.camera.position.copy(camPos.current);
    state.camera.lookAt(s.x, 1.6, s.z);

    const near = Math.hypot(s.x - DOOR.x, s.z - DOOR.z) < ENTER_DIST;
    if (near !== s.near) {
      s.near = near;
      onNear(near);
    }
  });

  const navy = '#22334d';
  const cream = '#f2e4bf';
  const wood = '#7a5230';
  return (
    <>
      <RigidBody ref={body} type="kinematicPosition" colliders={false}>
        <CuboidCollider args={[1.15, 0.9, 1.9]} />
      </RigidBody>
      <group ref={vis}>
        {/* chassis */}
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[2, 0.5, 3.6]} />
          <meshStandardMaterial color="#2c2118" roughness={0.85} />
        </mesh>
        {/* wooden bed */}
        <mesh position={[0, 1.32, 0.72]} castShadow>
          <boxGeometry args={[2.1, 0.8, 2.05]} />
          <meshStandardMaterial color={wood} roughness={0.7} />
        </mesh>
        {/* cab */}
        <mesh position={[0, 1.72, -1.05]} castShadow>
          <boxGeometry args={[2, 1.15, 1.35]} />
          <meshStandardMaterial color={navy} roughness={0.45} metalness={0.15} />
        </mesh>
        <mesh position={[0, 2.36, -1.05]}>
          <boxGeometry args={[2.06, 0.18, 1.42]} />
          <meshStandardMaterial color={cream} roughness={0.5} />
        </mesh>
        {/* windshield */}
        <mesh position={[0, 1.95, -1.74]} rotation={[-0.12, 0, 0]}>
          <planeGeometry args={[1.66, 0.72]} />
          <meshStandardMaterial color="#101c30" roughness={0.08} metalness={0.5} />
        </mesh>
        {/* bumper */}
        <mesh position={[0, 1.02, -1.8]}>
          <boxGeometry args={[2.02, 0.28, 0.14]} />
          <meshStandardMaterial color={cream} roughness={0.55} />
        </mesh>
        {/* headlights */}
        {[-0.7, 0.7].map((hx) => (
          <mesh key={hx} position={[hx, 1.32, -1.82]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#ffe2a0" emissive="#ffe2a0" emissiveIntensity={2.6} />
          </mesh>
        ))}
        {/* striped awning over the bed */}
        {[
          [-1, -0.2],
          [1, -0.2],
          [-1, 1.62],
          [1, 1.62]
        ].map(([px, pz], i) => (
          <mesh key={i} position={[px, 2.05, pz]}>
            <cylinderGeometry args={[0.045, 0.045, 1.15, 8]} />
            <meshStandardMaterial color="#caa25c" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 2.66, 0.71]} rotation={[0.06, 0, 0]}>
          <boxGeometry args={[2.35, 0.09, 2.3]} />
          <meshStandardMaterial map={stripes} roughness={0.75} />
        </mesh>
        {/* books riding in the bed */}
        <mesh position={[-0.4, 1.85, 0.45]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.9, 0.26, 1.25]} />
          <meshStandardMaterial color={navy} roughness={0.6} />
        </mesh>
        <mesh position={[0.45, 1.83, 0.95]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.85, 0.24, 1.15]} />
          <meshStandardMaterial color="#8a2f2a" roughness={0.6} />
        </mesh>
        <mesh position={[0.1, 2.08, 0.4]} rotation={[0, 0.12, 0]}>
          <boxGeometry args={[0.8, 0.22, 1.1]} />
          <meshStandardMaterial color="#e9c568" roughness={0.6} />
        </mesh>
        {/* wheels */}
        {[
          [-1.05, -1.15],
          [1.05, -1.15],
          [-1.05, 1.15],
          [1.05, 1.15]
        ].map(([wx, wz], i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) wheels.current[i] = m;
            }}
            position={[wx, 0.45, wz]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.45, 0.45, 0.3, 18]} />
            <meshStandardMaterial color="#17100a" roughness={0.9} />
          </mesh>
        ))}
        {/* headlight beam */}
        <spotLight
          position={[0, 1.6, -1.4]}
          target-position={[0, 0.4, -12]}
          angle={0.55}
          penumbra={0.6}
          intensity={900}
          distance={44}
          color="#ffd28a"
          castShadow
        />
      </group>
    </>
  );
}

/* ── a giant knockable book with a real cover ────────────────────────── */
const EDITIONS = [
  {img: '/covers/quantum-econ.jpg', bg: '#ece7db'},
  {img: '/covers/quantum-econ-ja.jpg', bg: '#1a1440'},
  {img: '/covers/isekai-ko.jpg', bg: '#b98f3a'},
  {img: '/covers/isekai.jpg', bg: '#233f37'},
  {img: '/covers/isekai-ja.jpg', bg: '#44502a'},
  {img: '/covers/ai-bible.jpg', bg: '#101c36'},
  {img: '/covers/ai-bible-ja.jpg', bg: '#16233d'},
  {img: '/covers/ninja-cat-ko.jpg', bg: '#f2cf5b'},
  {img: '/covers/ninja-cat.jpg', bg: '#e8b64a'}
];

function GiantBook({
  ed,
  position,
  rotY,
  size = [2.4, 3.5, 0.6]
}: {
  ed: (typeof EDITIONS)[0];
  position: [number, number, number];
  rotY: number;
  size?: [number, number, number];
}) {
  const tex = useLoader(THREE.TextureLoader, ed.img);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mats = useMemo(() => {
    const solid = (c: string) => new THREE.MeshStandardMaterial({color: c, roughness: 0.65});
    return [
      solid('#efe6d2'), // fore-edge (pages)
      solid(ed.bg), // spine
      solid('#efe6d2'), // top
      solid('#5a4832'), // bottom
      new THREE.MeshStandardMaterial({map: tex, roughness: 0.55}), // front cover
      solid(ed.bg) // back
    ];
  }, [tex, ed.bg]);
  return (
    <RigidBody colliders="cuboid" position={position} rotation={[0, rotY, 0]} restitution={0.15} friction={0.9}>
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={size} />
      </mesh>
    </RigidBody>
  );
}

/* ── physics toys: traffic cones + a big gold ball ───────────────────── */
function Cone({position}: {position: [number, number, number]}) {
  return (
    <RigidBody colliders="hull" position={position} restitution={0.3} friction={0.7}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.52, 1.15, 12]} />
        <meshStandardMaterial color="#e8762a" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.58, 0.62, 0.1, 12]} />
        <meshStandardMaterial color="#c9581c" roughness={0.7} />
      </mesh>
    </RigidBody>
  );
}

function Ball() {
  return (
    <RigidBody colliders="ball" position={[4, 1.4, -14]} restitution={0.65} friction={0.5} density={0.25}>
      <mesh castShadow>
        <sphereGeometry args={[1.15, 20, 20]} />
        <meshStandardMaterial color="#e9c568" roughness={0.4} />
      </mesh>
    </RigidBody>
  );
}

/* ── neighbourhood: buildings with lit windows, trees, lamps ─────────── */
function Buildings() {
  const tex = useMemo(makeWindowTexture, []);
  const spots = useMemo(
    () =>
      [
        {x: -26, z: 18, w: 12, h: 13, d: 10, c: '#241812'},
        {x: -25, z: 0, w: 10, h: 17, d: 10, c: '#1d1712'},
        {x: -27, z: -22, w: 13, h: 11, d: 11, c: '#26190f'},
        {x: -25, z: -44, w: 11, h: 15, d: 10, c: '#1f150e'},
        {x: 26, z: 12, w: 11, h: 15, d: 10, c: '#211711'},
        {x: 25, z: -8, w: 12, h: 12, d: 10, c: '#26190f'},
        {x: 27, z: -30, w: 12, h: 18, d: 11, c: '#1d1712'},
        {x: 25, z: -50, w: 10, h: 12, d: 10, c: '#241812'}
      ] as const,
    []
  );
  return (
    <>
      {spots.map((b, i) => {
        const t = tex.clone();
        t.needsUpdate = true;
        t.repeat.set(Math.round(b.w / 5), Math.round(b.h / 6));
        return (
          <mesh key={i} position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.c}
              roughness={0.9}
              emissive="#ffb46a"
              emissiveMap={t}
              emissiveIntensity={0.55}
            />
          </mesh>
        );
      })}
    </>
  );
}

function Tree({x, z, s = 1}: {x: number; z: number; s?: number}) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 2.8, 8]} />
        <meshStandardMaterial color="#4a3421" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[1.7, 12, 12]} />
        <meshStandardMaterial color="#2e4a33" roughness={0.95} />
      </mesh>
      <mesh position={[0.9, 2.6, 0.3]}>
        <sphereGeometry args={[1.1, 10, 10]} />
        <meshStandardMaterial color="#28402c" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Lamp({x, z}: {x: number; z: number}) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 5.2, 10]} />
        <meshStandardMaterial color="#17100a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.3, 0]}>
        <sphereGeometry args={[0.42, 14, 14]} />
        <meshStandardMaterial color="#ffd98f" emissive="#ffd98f" emissiveIntensity={2.4} />
      </mesh>
      <pointLight position={[0, 5.2, 0]} color="#ffbe73" intensity={420} distance={34} decay={2} />
    </group>
  );
}

/* ── the storefront at the end of the street ─────────────────────────── */
function Storefront() {
  const facade = useLoader(THREE.TextureLoader, '/walk/facade-closed.webp');
  facade.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={[0, 0, -70]}>
      <mesh position={[0, 8, -1]}>
        <boxGeometry args={[40, 22, 10]} />
        <meshStandardMaterial color="#120c07" roughness={0.95} />
      </mesh>
      <mesh position={[0, 7.05, 4.05]}>
        <planeGeometry args={[32, 21.3]} />
        <meshBasicMaterial map={facade} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 5, 8]} color="#ffbe73" intensity={620} distance={34} decay={2} />
    </group>
  );
}

/* ── street floor + sidewalks ────────────────────────────────────────── */
function Ground() {
  const wood = useLoader(THREE.TextureLoader, '/walk/floor.webp');
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(1, 7);
  wood.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 1, 100]} position={[0, -1, 0]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#20150c" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -6]} receiveShadow>
        <planeGeometry args={[15, 128]} />
        <meshStandardMaterial map={wood} roughness={0.85} color="#b99a78" />
      </mesh>
      {/* sidewalks */}
      {[-9.6, 9.6].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, -6]} receiveShadow>
          <planeGeometry args={[4, 128]} />
          <meshStandardMaterial color="#37281a" roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

/* ── page component ──────────────────────────────────────────────────── */
export default function BookWorld({embed = false}: {embed?: boolean}) {
  const router = useRouter();
  const joy = useRef<Input>({fwd: 0, turn: 0});
  const [near, setNear] = useState(false);
  const joyEl = useRef<HTMLDivElement>(null);
  const nubEl = useRef<HTMLDivElement>(null);

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

  // Enter key enters the store when at the door
  useEffect(() => {
    if (!near) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') router.push('/books');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [near, router]);

  const books = useMemo(
    () =>
      EDITIONS.map((ed, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return {
          ed,
          pos: [side * (11 + (i % 3) * 2.6), 1.76, 18 - i * 8.5] as [number, number, number],
          rot: side * (0.5 + (i % 4) * 0.35)
        };
      }),
    []
  );

  // a row of book dominoes on the left side of the street
  const dominoes = useMemo(
    () => Array.from({length: 6}, (_, i) => ({ed: EDITIONS[(i * 2) % 9], z: -4 - i * 1.35})),
    []
  );

  return (
    <div className={`wd-wrap${embed ? ' wd-embed' : ''}`}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{position: [0, 7, 44], fov: 52, near: 0.5, far: 320}}
        gl={{antialias: true}}
        onCreated={({scene, gl}) => {
          scene.background = new THREE.Color('#0b0703');
          scene.fog = new THREE.Fog('#0b0703', 80, 240);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight color="#6b543a" intensity={1.1} />
          <hemisphereLight color="#2a3350" groundColor="#3a2513" intensity={0.9} />
          <directionalLight position={[30, 40, 20]} color="#41527a" intensity={1.1} />
          <Stars radius={140} depth={40} count={1400} factor={3.2} fade speed={0.4} />
          <Physics gravity={[0, -22, 0]}>
            <Ground />
            <Storefront />
            <Truck joy={joy} onNear={setNear} />
            {books.map((b, i) => (
              <GiantBook key={i} ed={b.ed} position={b.pos} rotY={b.rot} />
            ))}
            {dominoes.map((dm, i) => (
              <GiantBook key={`dm${i}`} ed={dm.ed} position={[-14, 1.2, dm.z]} rotY={0} size={[1.5, 2.3, 0.24]} />
            ))}
            {[
              [-2.5, 24],
              [0.5, 22],
              [3, 25],
              [-0.8, 19]
            ].map(([cx, cz], i) => (
              <Cone key={i} position={[cx, 0.6, cz]} />
            ))}
            <Ball />
          </Physics>
          <Buildings />
          <Tree x={-19.5} z={30} s={1.1} />
          <Tree x={20} z={26} s={1.1} />
          <Tree x={-19} z={-14} />
          <Tree x={19.5} z={-36} s={1.25} />
          <Tree x={-20} z={-52} s={0.9} />
          {[-9.5, 9.5].flatMap((x) => [14, -10, -34, -52].map((z) => <Lamp key={`${x}:${z}`} x={x} z={z} />))}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="wd-hud" aria-hidden="true">
        <p className="wd-title">AWESOME BOOKS WORLD</p>
        <p className="wd-hint">W A S D · 방향키로 트럭 운전 — 책과 장난감을 밀어보세요 · Drive the truck</p>
      </div>
      {near ? (
        <button type="button" className="wd-enter" onClick={() => router.push('/books')}>
          🚪 서점 입장 · Enter the store ⏎
        </button>
      ) : null}
      {!embed ? (
        <button type="button" className="wd-back" onClick={() => router.push('/books')}>
          ← 서점으로
        </button>
      ) : null}
      <div className="wd-joy" ref={joyEl}>
        <div className="wd-joy-nub" ref={nubEl} />
      </div>
    </div>
  );
}
