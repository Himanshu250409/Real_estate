"use client";
import { useEffect, useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { FH, MID_Y } from "./constants";
import { CLUB } from "./Clubhouse";

interface Controls {
  target: THREE.Vector3; autoRotate: boolean; autoRotateSpeed: number; update: () => void;
  enableRotate: boolean; enableZoom: boolean; domElement: HTMLElement;
  minDistance: number; maxDistance: number; maxPolarAngle: number;
}

const COMPLEX_T = new THREE.Vector3(-8, MID_Y - 1, 2);                         // centre of all five buildings
const CLUB_T = new THREE.Vector3(CLUB.x, CLUB.y + 1.0, CLUB.z + 0.2);           // inside the entrance lobby

/**
 * Orbit camera. Three modes, all glided with exponential damping:
 *  • complex   — whole community, slow auto-orbit
 *  • floor     — glides to the selected floor of the main tower (plan panel open)
 *  • clubhouse — steps inside the entrance lobby (wider FOV, roof fades away, drag to look round)
 */
export default function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as Controls | null;
  const last = useRef("free");
  const t = useRef(10);
  const off = useMemo(() => new THREE.Vector3(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);

  // Touch devices: keep vertical swipes for page scroll (no drag-rotate), orbit stays automatic.
  useEffect(() => {
    if (!controls) return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.domElement.style.touchAction = "pan-y";
    }
  }, [controls]);

  useFrame((_, dt) => {
    if (!controls) return;
    const st = useStore.getState();
    const focused = st.selectedFloor != null && st.isPanelOpen && !st.isPanelMinimised;
    const club = !focused && st.view === "clubhouse";
    const key = focused ? `${st.selectedFloor}-${st.insideUnit}` : `free-${st.view}`;
    if (key !== last.current) {
      last.current = key; t.current = 0;
      if (club) camera.position.set(CLUB_T.x + 0.6, CLUB_T.y + 0.5, CLUB_T.z + 2.6); // start just inside the doors
    }
    t.current += dt;
    controls.autoRotate = !focused;
    controls.autoRotateSpeed = club ? 0.18 : 0.45;
    controls.minDistance = club ? 1.2 : 4.5;
    controls.maxDistance = club ? 7 : 60;
    controls.maxPolarAngle = club ? 1.6 : 1.52;

    const k = 1 - Math.exp(-dt * 3);
    const fov = club ? 64 : 36;
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = THREE.MathUtils.lerp(camera.fov, fov, k); camera.updateProjectionMatrix(); }

    if (focused || t.current < 2.6) {
      if (focused) goal.set(0, (st.selectedFloor as number) * FH + FH / 2, 0);
      else goal.copy(club ? CLUB_T : COMPLEX_T);
      controls.target.lerp(goal, k);
      const wanted = focused ? (st.insideUnit ? 5 : 9.5) : club ? 3.4 : 30;
      off.copy(camera.position).sub(controls.target);
      off.setLength(THREE.MathUtils.lerp(off.length(), wanted, k));
      camera.position.copy(controls.target).add(off);
    }
    controls.update();
  });

  return (
    <OrbitControls
      makeDefault enablePan={false} enableDamping dampingFactor={0.06}
      minDistance={4.5} maxDistance={60} minPolarAngle={0.35} maxPolarAngle={1.52}
      autoRotateSpeed={0.45} target={[-8, MID_Y - 1, 2]}
    />
  );
}
