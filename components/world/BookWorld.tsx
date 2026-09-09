'use client';

/*
 * M19 — AWESOME BOOKS WORLD (bruno-simon.com-style prototype).
 * A night street you drive down in a little book cart: physics books to
 * knock over (our real covers), lampposts, and the actual storefront at
 * the end — pull up to the door and step into /books.
 * three + @react-three/fiber + rapier physics.
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

/* ── the cart: kinematic body + visual group + follow camera ─────────── */
function Cart({joy, onNear}: {joy: React.MutableRefObject<Input>; onNear: (b: boolean) => void}) {
  const body = useRef<RapierRigidBody>(null);
  const vis = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Mesh[]>([]);
  const readInput = useInput(joy);
  const st = useRef({x: 0, z: 30, h: 0, v: 0, near: false});
  const camPos = useRef(new THREE.Vector3(0, 7, 44));

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
    s.x = Math.max(-70, Math.min(70, s.x));
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

  const wood = '#7a5230';
  const dark = '#3a2817';
  return (
    <>
      <RigidBody ref={body} type="kinematicPosition" colliders={false}>
        <CuboidCollider args={[1.15, 0.85, 1.7]} />
      </RigidBody>
      <group ref={vis}>
        {/* cart tub */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[2.1, 1, 3.1]} />
          <meshStandardMaterial color={wood} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[2.3, 0.16, 3.3]} />
          <meshStandardMaterial color={dark} roughness={0.8} />
        </mesh>
        {/* a couple of books riding along */}
        <mesh position={[-0.4, 1.85, -0.3]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.9, 0.28, 1.3]} />
          <meshStandardMaterial color="#22334d" roughness={0.6} />
        </mesh>
        <mesh position={[0.45, 1.82, 0.5]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.85, 0.24, 1.2]} />
          <meshStandardMaterial color="#8a2f2a" roughness={0.6} />
        </mesh>
        {/* handle */}
        <mesh position={[0, 1.9, 1.75]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[1.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#caa25c" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* wheels */}
        {[
          [-1.05, -1.05],
          [1.05, -1.05],
          [-1.05, 1.05],
          [1.05, 1.05]
        ].map(([wx, wz], i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) wheels.current[i] = m;
            }}
            position={[wx, 0.45, wz]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.45, 0.45, 0.28, 18]} />
            <meshStandardMaterial color="#17100a" roughness={0.9} />
          </mesh>
        ))}
        {/* headlamp */}
        <mesh position={[0, 1.35, -1.62]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial emissive="#ffe2a0" emissiveIntensity={3} color="#ffe2a0" />
        </mesh>
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

function GiantBook({ed, position, rotY}: {ed: (typeof EDITIONS)[0]; position: [number, number, number]; rotY: number}) {
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
        <boxGeometry args={[2.4, 3.5, 0.6]} />
      </mesh>
    </RigidBody>
  );
}

/* ── lamppost ─────────────────────────────────────────────────────────── */
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
      {/* doorstep glow */}
      <pointLight position={[0, 5, 8]} color="#ffbe73" intensity={620} distance={34} decay={2} />
    </group>
  );
}

/* ── street floor ─────────────────────────────────────────────────────── */
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
    </>
  );
}

/* ── page component ──────────────────────────────────────────────────── */
export default function BookWorld() {
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
          pos: [side * (10.5 + (i % 3) * 3.2), 1.76, 18 - i * 8.5] as [number, number, number],
          rot: side * (0.5 + (i % 4) * 0.35)
        };
      }),
    []
  );

  return (
    <div className="wd-wrap">
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
            <Cart joy={joy} onNear={setNear} />
            {books.map((b, i) => (
              <GiantBook key={i} ed={b.ed} position={b.pos} rotY={b.rot} />
            ))}
          </Physics>
          {[-9.5, 9.5].flatMap((x) => [4, -26, -48].map((z) => <Lamp key={`${x}:${z}`} x={x} z={z} />))}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="wd-hud" aria-hidden="true">
        <p className="wd-title">AWESOME BOOKS WORLD</p>
        <p className="wd-hint">W A S D · 방향키로 카트 운전 — 책을 밀어보세요 · Drive the cart</p>
      </div>
      {near ? (
        <button type="button" className="wd-enter" onClick={() => router.push('/books')}>
          🚪 서점 입장 · Enter the store ⏎
        </button>
      ) : null}
      <button type="button" className="wd-back" onClick={() => router.push('/books')}>
        ← 서점으로
      </button>
      <div className="wd-joy" ref={joyEl}>
        <div className="wd-joy-nub" ref={nubEl} />
      </div>
    </div>
  );
}
