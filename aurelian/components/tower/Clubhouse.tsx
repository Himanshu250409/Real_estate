"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { atmos } from "./constants";
import { makeLatticeTexture, makeSignTexture } from "./signs";

/** Clubhouse footprint in the scene (podium top is y = 1). Used by CameraRig too. */
export const CLUB = { x: -7.5, y: 1, z: 6.2, w: 9, d: 6, h: 1.8 };
const GOLD = "#c9a35f";

type P3 = [number, number, number];
const Box = ({ p, s, m, r = [0, 0, 0] }: { p: P3; s: P3; m: THREE.Material; r?: P3 }) => (
  <mesh position={p} rotation={r} material={m} castShadow receiveShadow><boxGeometry args={s} /></mesh>
);

function Label({ p, text }: { p: P3; text: string }) {
  return (
    <Html position={p} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <span style={{ background: "rgba(10,14,12,.9)", color: "#f4efe6", border: "1px solid #c2a878", padding: "6px 12px", borderRadius: 999, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", whiteSpace: "nowrap", fontFamily: "Inter, system-ui, sans-serif" }}>{text}</span>
    </Html>
  );
}

/** Green lattice-roofed clubhouse with a glazed double-height entrance lobby, lounge, café, gym and home theatre. */
export default function Clubhouse() {
  const { w, d, h } = CLUB;
  const view = useStore((s) => s.view);
  const roofGroup = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const m = useMemo(() => {
    const roofTex = makeLatticeTexture("#2f5d4b", "#c9a35f"); roofTex.repeat.set(5, 4);
    const wallTex = makeLatticeTexture("#16231d", "#c9a35f"); wallTex.repeat.set(6, 1.4);
    const sign = makeSignTexture([{ text: "EDEN COURT", size: 74 }, { text: "BY SILVERBILL", size: 30, color: "#f4efe6", spacing: 10 }], 640, 220);
    return {
      roof: new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.55, metalness: 0.25, transparent: true }),
      lattice: new THREE.MeshStandardMaterial({ map: wallTex, emissive: new THREE.Color("#c9a35f"), emissiveMap: wallTex, emissiveIntensity: 0.3, roughness: 0.5 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#a9c9d6", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false, clearcoat: 1 }),
      gold: new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.28 }),
      marble: new THREE.MeshStandardMaterial({ color: "#efe6d6", roughness: 0.18, metalness: 0.08 }),
      wood: new THREE.MeshStandardMaterial({ color: "#5b4330", roughness: 0.6 }),
      fabric: new THREE.MeshStandardMaterial({ color: "#d9c9a8", roughness: 0.95 }),
      fabric2: new THREE.MeshStandardMaterial({ color: "#3e6b57", roughness: 0.95 }),
      dark: new THREE.MeshStandardMaterial({ color: "#1d2420", roughness: 0.7 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#3f7a46", roughness: 0.9 }),
      lamp: new THREE.MeshStandardMaterial({ color: "#fff1d0", emissive: new THREE.Color("#ffd9a0"), emissiveIntensity: 1.2 }),
      screen: new THREE.MeshStandardMaterial({ color: "#0b1a33", emissive: new THREE.Color("#3b6cc9"), emissiveIntensity: 0.9 }),
      sign: new THREE.MeshBasicMaterial({ map: sign, transparent: true, toneMapped: false }),
    };
  }, []);

  useFrame((_, dt) => {
    const inside = useStore.getState().view === "clubhouse";
    const k = 1 - Math.exp(-dt * 4);
    m.roof.opacity = THREE.MathUtils.lerp(m.roof.opacity, inside ? 0 : 1, k);
    if (roofGroup.current) roofGroup.current.visible = m.roof.opacity > 0.03;
    m.lamp.emissiveIntensity = 0.9 + atmos.glow * 1.6;
    m.lattice.emissiveIntensity = 0.2 + atmos.glow * 0.5;
    if (light.current) light.current.intensity = 0.8 + atmos.glow * 2.4;
  });

  const open = (e: { stopPropagation: () => void; delta: number }) => {
    e.stopPropagation();
    if (e.delta > 6) return;
    const s = useStore.getState();
    if (s.view !== "clubhouse") s.setView("clubhouse");
  };

  return (
    <group position={[CLUB.x, CLUB.y, CLUB.z]} onClick={open}>
      {/* floor + low plinth */}
      <Box p={[0, 0.03, 0]} s={[w + 0.4, 0.06, d + 0.4]} m={m.marble} />
      {/* back feature wall (lattice) + logo above the reception desk */}
      <Box p={[0, h / 2, -d / 2 + 0.08]} s={[w, h, 0.16]} m={m.lattice} />
      <mesh position={[0, 1.15, -d / 2 + 0.2]} material={m.sign}><planeGeometry args={[2.6, 0.9]} /></mesh>
      {/* side + front glazing (door gap in the middle) */}
      {[-1, 1].map((s) => <Box key={s} p={[s * (w / 2), h / 2, 0]} s={[0.04, h, d]} m={m.glass} />)}
      {[-1, 1].map((s) => <Box key={`f${s}`} p={[s * 2.9, h / 2, d / 2]} s={[3.2, h, 0.04]} m={m.glass} />)}
      <Box p={[0, h - 0.2, d / 2]} s={[2.6, 0.4, 0.04]} m={m.glass} />
      {[-4.5, -3.3, -2.1, -1.3, 1.3, 2.1, 3.3, 4.5].map((x) => <Box key={x} p={[x, h / 2, d / 2]} s={[0.05, h, 0.06]} m={m.gold} />)}
      {/* entrance canopy + columns */}
      <Box p={[0, h - 0.08, d / 2 + 0.8]} s={[3.6, 0.09, 1.6]} m={m.gold} />
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, (h - 0.1) / 2, d / 2 + 1.5]} material={m.gold} castShadow><cylinderGeometry args={[0.06, 0.06, h - 0.1, 12]} /></mesh>
      ))}

      {/* hip roof with broad eaves — shrinks away when you step inside */}
      <group ref={roofGroup}>
        <group position={[0, h, 0]} scale={[1, 1, 0.7]}>
          <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} material={m.roof} castShadow receiveShadow>
            <cylinderGeometry args={[3.2, 7.9, 1.0, 4, 1]} />
          </mesh>
        </group>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx * (w / 2 + 0.3), h / 2, sz * (d / 2 + 0.2)]} material={m.gold} castShadow><cylinderGeometry args={[0.07, 0.07, h, 12]} /></mesh>
        ))}
      </group>

      {/* ───── interior ───── */}
      <pointLight ref={light} position={[0, h - 0.3, 0.2]} color="#ffd9a0" distance={10} decay={1.6} />

      {/* chandelier + pendants */}
      <mesh position={[0, h - 0.45, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}><torusGeometry args={[0.5, 0.025, 8, 32]} /></mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * 0.5, h - 0.5, 0.6 + Math.sin(a) * 0.5]} material={m.lamp}><sphereGeometry args={[0.05, 10, 8]} /></mesh>;
      })}
      <mesh position={[0, h - 0.5, 0.6]} material={m.lamp}><sphereGeometry args={[0.13, 14, 10]} /></mesh>
      {([[-3, -0.6], [3, -0.6], [-3, 1.8], [3, 1.8]] as [number, number][]).map(([x, z]) => (
        <group key={`${x}${z}`}>
          <mesh position={[x, h - 0.2, z]} material={m.gold}><cylinderGeometry args={[0.008, 0.008, 0.4, 6]} /></mesh>
          <mesh position={[x, h - 0.45, z]} material={m.lamp}><sphereGeometry args={[0.1, 12, 10]} /></mesh>
        </group>
      ))}

      {/* reception desk */}
      <Box p={[0, 0.25, -1.55]} s={[2.4, 0.42, 0.5]} m={m.wood} />
      <Box p={[0, 0.48, -1.55]} s={[2.5, 0.04, 0.58]} m={m.marble} />
      <Box p={[0, 0.3, -1.29]} s={[2.1, 0.05, 0.02]} m={m.lamp} />
      {[-0.7, 0.7].map((x) => <Box key={x} p={[x, 0.12, -2.2]} s={[0.26, 0.24, 0.26]} m={m.fabric2} />)}

      {/* lounge (front-left): rug, two facing sofas, coffee table */}
      <mesh position={[-2.7, 0.07, 1.0]} material={m.fabric}><cylinderGeometry args={[1.3, 1.3, 0.015, 40]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[-2.7, 0, 1.0 + s * 0.75]} rotation={[0, s > 0 ? Math.PI : 0, 0]}>
          <Box p={[0, 0.16, 0]} s={[1.3, 0.2, 0.5]} m={m.fabric2} />
          <Box p={[0, 0.34, -0.2]} s={[1.3, 0.28, 0.1]} m={m.fabric2} />
        </group>
      ))}
      <mesh position={[-2.7, 0.18, 1.0]} material={m.gold}><cylinderGeometry args={[0.3, 0.3, 0.1, 24]} /></mesh>

      {/* café (front-right): counter, stools, two small tables */}
      <Box p={[3.5, 0.2, 0.6]} s={[0.4, 0.34, 1.8]} m={m.wood} />
      <Box p={[3.5, 0.39, 0.6]} s={[0.46, 0.04, 1.86]} m={m.marble} />
      {[-0.4, 0.2, 0.8].map((z) => <mesh key={z} position={[3.0, 0.14, 0.6 + z * 0.9]} material={m.gold}><cylinderGeometry args={[0.07, 0.07, 0.28, 12]} /></mesh>)}
      {[[2.3, 1.9], [1.5, 1.4]].map(([x, z]) => (
        <group key={`${x}`}>
          <mesh position={[x, 0.22, z]} material={m.marble}><cylinderGeometry args={[0.24, 0.24, 0.03, 20]} /></mesh>
          <mesh position={[x, 0.11, z]} material={m.gold}><cylinderGeometry args={[0.02, 0.02, 0.22, 8]} /></mesh>
        </group>
      ))}

      {/* back-half partitions */}
      {[-1.9, 1.9].map((x) => <Box key={x} p={[x, h * 0.45, -1.65]} s={[0.04, h * 0.9, 2.7]} m={m.glass} />)}

      {/* gym (back-left) */}
      {[-0.7, 0, 0.7].map((z) => (
        <group key={z} position={[-3.3, 0, -1.5 + z * 0.9]}>
          <Box p={[0, 0.1, 0]} s={[0.35, 0.14, 0.75]} m={m.dark} />
          <Box p={[0, 0.42, -0.34]} s={[0.35, 0.5, 0.05]} m={m.dark} />
        </group>
      ))}
      <Box p={[-2.5, 0.12, -2.4]} s={[0.4, 0.14, 0.9]} m={m.fabric2} />

      {/* home theatre (back-right): screen + two rows of seats */}
      <Box p={[3.4, 1.0, -d / 2 + 0.2]} s={[2.4, 0.95, 0.05]} m={m.screen} />
      {[0, 1].map((r) => [-0.7, 0, 0.7].map((x) => (
        <Box key={`${r}${x}`} p={[3.4 + x, 0.14 + r * 0.06, -1.9 + r * 0.8]} s={[0.5, 0.26 + r * 0.06, 0.5]} m={m.fabric2} />
      )))}

      {/* plants */}
      {[[-4.1, 2.5], [4.1, 2.5], [-4.1, -2.5]].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.15, 0]} material={m.gold}><cylinderGeometry args={[0.14, 0.11, 0.3, 12]} /></mesh>
          <mesh position={[0, 0.55, 0]} material={m.leaf}><icosahedronGeometry args={[0.28, 1]} /></mesh>
        </group>
      ))}

      {/* zone labels — only while you are inside */}
      {view === "clubhouse" && (
        <>
          <Label p={[0, 1.15, 2.3]} text="Entrance lobby" />
          <Label p={[0, 0.95, -1.55]} text="Reception" />
          <Label p={[-2.7, 0.8, 1.0]} text="Lounge" />
          <Label p={[3.4, 0.8, 0.6]} text="Café" />
          <Label p={[-3.3, 0.9, -1.5]} text="Gym" />
          <Label p={[3.4, 1.0, -1.9]} text="Home theatre" />
        </>
      )}
    </group>
  );
}
