"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { sampleTourPosition, sampleTourTarget } from "@/lib/camera";

export const globalCameraState = {
  dofFocus: 0.08,
  activeScroll: 0,
  currentZone: "EXTERIOR",
  target: new THREE.Vector3(),
};

interface CameraControllerProps {
  /** 0..1, written from GSAP ScrollTrigger */
  progress: React.RefObject<number>;
  /** Normalised pointer -1..1 */
  pointer?: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Determines current zone based on scroll position for editorial HUD.
 */
function getZoneName(scroll: number): string {
  if (scroll < 0.24) return "01 / EXTERIOR APPROACH";
  if (scroll < 0.36) return "02 / RECEPTION & FOYER";
  if (scroll < 0.45) return "03 / CIRCULATION CORRIDOR";
  if (scroll < 0.55) return "04 / OPEN WORKSPACE";
  if (scroll < 0.66) return "05 / COLLABORATION";
  if (scroll < 0.78) return "06 / GLASS MEETING ROOM";
  if (scroll < 0.86) return "07 / EXECUTIVE OFFICE";
  if (scroll < 0.92) return "08 / DESIGN STUDIO";
  if (scroll < 0.96) return "09 / RESIDENTIAL LOUNGE";
  return "10 / ATRIUM FINALE";
}

/**
 * Centripetal Catmull-Rom spline camera controller.
 * Drives camera smoothly through all rooms with arc-length parameterization,
 * differential position-target damping (target lags slightly for natural head turn),
 * and locked roll.
 */
export function CameraController({
  progress,
  pointer,
  reducedMotion = false,
}: CameraControllerProps) {
  const smoothedScroll = useRef(0);
  const lookTarget = useRef(new THREE.Vector3());
  const initialised = useRef(false);

  useFrame((state, delta) => {
    const camera = state.camera;
    const dt = Math.min(delta, 0.1);

    const rawScroll = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);

    // Smooth scroll interpolation
    smoothedScroll.current = THREE.MathUtils.damp(
      smoothedScroll.current,
      rawScroll,
      reducedMotion ? 24 : 4.5,
      dt
    );

    const eased = easeInOutCubic(smoothedScroll.current);
    const p = sampleTourPosition(eased);
    const t = sampleTourTarget(eased);

    // Subtle pointer parallax only when outdoors or subtle indoors
    if (!reducedMotion && pointer?.current) {
      const parallaxFactor = eased < 0.24 ? 0.4 : 0.08;
      p.x += pointer.current.x * parallaxFactor;
      p.y += pointer.current.y * parallaxFactor * 0.4;
    }

    if (!initialised.current) {
      camera.position.copy(p);
      lookTarget.current.copy(t);
      initialised.current = true;
    } else {
      // Frame-rate independent exponential damping
      // Position: lambda = 9
      camera.position.lerp(p, 1 - Math.exp(-9 * dt));
      // LookTarget: lambda = 6 (slower damping produces natural head-turn)
      lookTarget.current.lerp(t, 1 - Math.exp(-6 * dt));
    }

    camera.lookAt(lookTarget.current);
    // Lock roll every frame to guarantee 0 roll
    camera.up.set(0, 1, 0);

    // Ensure fixed FOV 42
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 42;
      camera.near = 0.05;
      camera.far = 200;
      camera.updateProjectionMatrix();
    }

    // Dynamic focus distance for DepthOfField post-processing
    const dist = camera.position.distanceTo(lookTarget.current);
    globalCameraState.target.copy(lookTarget.current);
    globalCameraState.dofFocus = THREE.MathUtils.clamp(dist / camera.far, 0.005, 0.4);
    globalCameraState.activeScroll = smoothedScroll.current;
    globalCameraState.currentZone = getZoneName(smoothedScroll.current);

    // Debug hook for headless test scripts
    if (typeof window !== "undefined") {
      (window as Window & { __heroCameraDebug?: Record<string, unknown> }).__heroCameraDebug = {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [lookTarget.current.x, lookTarget.current.y, lookTarget.current.z],
        scroll: smoothedScroll.current,
        eased,
        zone: globalCameraState.currentZone,
      };
    }
  });

  return null;
}
