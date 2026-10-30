"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { site } from "@/config/site";
import { atmos } from "./constants";
import Clubhouse, { CLUB } from "./Clubhouse";
import { makeSignTexture } from "./signs";

const WARM = new THREE.Color("#ffcf8a");
const TILE_W = 4.31; // world width of one facade-photo tile…
const TILE_N = 14;   // …which spans 14 storeys
const BASE_Y = 1;    // podium top

/** Facade materials cut from the supplied render, tiled to each building's real size (no stretching). */
function useFacade() {
  const gl = useThree((s) => s.gl);
  const base = useTexture(site.images.facadeFront);
  const all = useRef<THREE.MeshStandardMaterial[]>([]);
  const make = useMemo(() => (w: number, n: number) => {
    const t = base.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w / TILE_W, Math.min(1, n / TILE_N));
    t.offset.set(0, 1 - Math.min(1, n / TILE_N)); // crown of the photo at the top of every tower
    t.needsUpdate = true;
    const mat = new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: WARM.clone(), emissiveIntensity: 0, roughness: 0.55, metalness: 0.08, side: THREE.DoubleSide });
    all.current.push(mat);
    return mat;
  }, [base, gl]);
  useFrame(() => { const g = atmos.glow * 0.32; for (const m of all.current) m.emissiveIntensity = g; });
  return make;
}

const slabMat = new THREE.MeshStandardMaterial({ color: "#e9e1d2", roughness: 0.75 });
const roofGreen = new THREE.MeshStandardMaterial({ color: "#4f7a4a", roughness: 1 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#3f7a46", roughness: 0.9 });
const trunkMat = new THREE.MeshStandardMaterial({ color: "#5a4632", roughness: 1 });

/** One thin balcony ledge per storey (instanced = a single draw call per tower). */
function Ledges({ w, d, n }: { w: number; d: number; n: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(0, i + 0.03, d / 2 + 0.14); o.updateMatrix(); ref.current?.setMatrixAt(i, o.matrix); }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [n, d]);
  return <instancedMesh ref={ref} args={[undefined, undefined, n]} material={slabMat} castShadow><boxGeometry args={[w * 0.82, 0.05, 0.28]} /></instancedMesh>;
}

function RoofGarden({ w, d, n }: { w: number; d: number; n: number }) {
  return (
    <group position={[0, n, 0]}>
      <mesh position={[0, 0.06, 0]} material={slabMat} castShadow><boxGeometry args={[w + 0.2, 0.12, d + 0.2]} /></mesh>
      <mesh position={[0, 0.14, 0]} material={roofGreen}><boxGeometry args={[w - 0.2, 0.04, d - 0.2]} /></mesh>
      {[-0.3, 0.1, 0.35].map((x, i) => <mesh key={i} position={[x * w, 0.35, (i - 1) * 0.5]} material={leafMat} scale={[1, 0.8, 1]}><icosahedronGeometry args={[0.28, 1]} /></mesh>)}
    </group>
  );
}

function Tower({ pos, w, d, n, rotY = 0, make, sign }: { pos: [number, number, number]; w: number; d: number; n: number; rotY?: number; make: (w: number, n: number) => THREE.Material; sign?: boolean }) {
  const front = useMemo(() => make(w, n), [make, w, n]);
  const side = useMemo(() => make(d, n), [make, d, n]);
  const emblem = useTexture("/images/emblem.png");
  const text = useMemo(() => makeSignTexture([{ text: "EDEN", size: 92, spacing: 14 }, { text: "COURT", size: 92, spacing: 14 }], 256, 300), []);
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, n / 2, 0]} castShadow receiveShadow material={[side, side, slabMat, slabMat, front, front]}><boxGeometry args={[w, n, d]} /></mesh>
      <Ledges w={w} d={d} n={n} />
      <RoofGarden w={w} d={d} n={n} />
      {sign && (
        <group position={[0, n * 0.62, d / 2 + 0.07]}>
          <mesh><boxGeometry args={[1.25, 4.6, 0.1]} /><meshStandardMaterial color="#17201b" roughness={0.6} /></mesh>
          <mesh position={[0, 1.3, 0.06]}><planeGeometry args={[0.95, 0.95]} /><meshBasicMaterial map={emblem} transparent toneMapped={false} /></mesh>
          <mesh position={[0, -0.5, 0.06]}><planeGeometry args={[0.95, 1.1]} /><meshBasicMaterial map={text} transparent toneMapped={false} /></mesh>
        </group>
      )}
    </group>
  );
}

/** Curved sky-link building (Tower C) — a crescent that wraps the courtyard and meets the main tower. */
function Arc({ make, n }: { make: (w: number, n: number) => THREE.Material; n: number }) {
  const R = 8, r = 5.8, span = 1.5, start = Math.PI - span / 2;
  const outer = useMemo(() => new THREE.CylinderGeometry(R, R, n, 64, 1, true, start, span), [n, start]);
  const inner = useMemo(() => new THREE.CylinderGeometry(r, r, n, 64, 1, true, start, span), [n, start]);
  const outerMat = useMemo(() => make(R * span, n), [make, n]);
  const innerMat = useMemo(() => make(r * span, n), [make, n]);
  const mid = (R + r) / 2;
  const ends = [start, start + span];
  return (
    <group position={[-7.5, BASE_Y, 7]}>
      <mesh geometry={outer} material={outerMat} position={[0, n / 2, 0]} castShadow receiveShadow />
      <mesh geometry={inner} material={innerMat} position={[0, n / 2, 0]} castShadow receiveShadow />
      {ends.map((a) => (
        <mesh key={a} position={[Math.sin(a) * mid, n / 2, Math.cos(a) * mid]} rotation={[0, a, 0]} material={slabMat} castShadow><boxGeometry args={[0.1, n, R - r]} /></mesh>
      ))}
      {/* curved roof garden */}
      <mesh position={[0, n + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={roofGreen} receiveShadow><ringGeometry args={[r, R, 64, 1, Math.PI / 2 - span / 2, span]} /></mesh>
      <mesh position={[0, n + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={slabMat}><ringGeometry args={[R - 0.15, R + 0.1, 64, 1, Math.PI / 2 - span / 2, span]} /></mesh>
    </group>
  );
}

/** Podium, lawns, pool, paths, palms and uplights. */
function Grounds() {
  const trees = useMemo<[number, number][]>(() => [[-21, 6], [-18.5, 8.5], [-16, 9.5], [-12.5, 9.8], [-3, 9.5], [-1, 8], [1.5, 8.8], [4.5, 8], [-22, 3], [5.5, 5.5], [-10, 3.2], [-5, 3.4]], []);
  return (
    <group>
      <mesh position={[-8.5, BASE_Y / 2, 3.5]} receiveShadow castShadow material={slabMat}><boxGeometry args={[30, BASE_Y, 14]} /></mesh>
      <mesh position={[-8.5, BASE_Y + 0.01, 3.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[29.4, 13.4]} /><meshStandardMaterial color="#5d7d52" roughness={1} /></mesh>
      {/* paved approach + courtyard */}
      <mesh position={[CLUB.x, BASE_Y + 0.02, 8.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[3, 3.4]} /><meshStandardMaterial color="#d9d2c5" roughness={0.6} /></mesh>
      <mesh position={[CLUB.x, BASE_Y + 0.02, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[12, 9]} /><meshStandardMaterial color="#cfc6b4" roughness={0.7} /></mesh>
      {/* swimming pool */}
      <mesh position={[-15.5, BASE_Y + 0.05, 7.4]}><boxGeometry args={[5.4, 0.08, 2.4]} /><meshStandardMaterial color="#e9e1d2" /></mesh>
      <mesh position={[-15.5, BASE_Y + 0.1, 7.4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5, 2]} /><meshStandardMaterial color="#5fb7cf" emissive="#5fb7cf" emissiveIntensity={0.55} roughness={0.05} metalness={0.3} /></mesh>
      {/* palms */}
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, BASE_Y, z]}>
          <mesh position={[0, 0.7, 0]} material={trunkMat} castShadow><cylinderGeometry args={[0.05, 0.08, 1.4, 6]} /></mesh>
          <mesh position={[0, 1.55, 0]} material={leafMat} castShadow scale={[1, 0.7, 1]}><icosahedronGeometry args={[0.55 + (i % 3) * 0.08, 1]} /></mesh>
        </group>
      ))}
    </group>
  );
}

/** All five buildings of Eden Court + podium + clubhouse. The interactive main tower (Tower D) is the existing Floor stack at the origin. */
export default function Complex() {
  const make = useFacade();
  return (
    <group>
      <Grounds />
      <Tower pos={[-20.2, BASE_Y, 1.4]} w={5.2} d={3.2} n={11} rotY={0.08} make={make} />          {/* A · left wing */}
      <Tower pos={[-14.2, BASE_Y, 0.4]} w={3.6} d={3.4} n={13} make={make} sign />                    {/* B · logo tower */}
      <Arc make={make} n={10} />                                                                       {/* C · curved link */}
      {/* D · main tower = interactive Floor stack (TowerCanvas) */}
      <Tower pos={[3.9, BASE_Y, 0.2]} w={2.6} d={3.0} n={13} make={make} />                           {/* E · slim tower */}
      <Clubhouse />
    </group>
  );
}
