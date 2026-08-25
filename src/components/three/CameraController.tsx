"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import type { CameraKeyframe } from "@/lib/camera";

interface CameraControllerProps {
  /** Ordered camera stops. Scroll progress interpolates between them. */
  keyframes: CameraKeyframe[];
  /** 0..1, written from a GSAP ScrollTrigger outside the Canvas. */
  progress: React.RefObject<number>;
  /** Normalised pointer, -1..1. Adds a small parallax offset. */
  pointer?: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
  /** Higher damps harder — the camera lags further behind the scroll. */
  smoothing?: number;
  /** Pointer parallax range in world units. */
  parallax?: number;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Drives the camera along a keyframed path from scroll progress.
 *
 * Progress arrives through a ref rather than a prop so ScrollTrigger can update
 * it every frame without re-rendering React — the camera moves inside useFrame,
 * which is the only place that touches the camera each tick.
 *
 * Movement is critically damped with `THREE.MathUtils.damp`, so the feel is
 * identical at 60Hz and 144Hz.
 */
export function CameraController({
  keyframes,
  progress,
  pointer,
  reducedMotion = false,
  smoothing = 3.2,
  parallax = 0.6,
}: CameraControllerProps) {
  // Scratch vectors, reused each frame — allocating inside useFrame would churn
  // the GC sixty times a second. Held in a ref because the frame loop mutates
  // them, which is the one thing a memoised value must never be used for.
  const scratchRef = useRef({
    position: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    currentLookAt: new THREE.Vector3(),
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
  });

  const initialised = useRef(false);

  // The camera comes from the frame state rather than useThree() so the loop
  // only ever mutates values it was handed, not values captured from a hook.
  useFrame((state, delta) => {
    if (keyframes.length === 0) return;

    const camera = state.camera;
    const scratch = scratchRef.current;

    // Long frames (a tab returning to the foreground) would otherwise snap the
    // camera across the whole path.
    const dt = Math.min(delta, 0.1);

    const t = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    const segments = keyframes.length - 1;

    const scaled = segments > 0 ? t * segments : 0;
    const index = segments > 0 ? Math.min(Math.floor(scaled), segments - 1) : 0;
    const from = keyframes[index];
    const to = keyframes[Math.min(index + 1, keyframes.length - 1)];
    const localT = segments > 0 ? smoothstep(scaled - index) : 0;

    scratch.a.fromArray(from.position);
    scratch.b.fromArray(to.position);
    scratch.position.lerpVectors(scratch.a, scratch.b, localT);

    scratch.a.fromArray(from.lookAt);
    scratch.b.fromArray(to.lookAt);
    scratch.lookAt.lerpVectors(scratch.a, scratch.b, localT);

    if (!reducedMotion && pointer?.current) {
      scratch.position.x += pointer.current.x * parallax;
      scratch.position.y += pointer.current.y * parallax * 0.55;
    }

    if (reducedMotion || !initialised.current) {
      // First frame: sit exactly on the path rather than flying in from the
      // default camera position.
      camera.position.copy(scratch.position);
      scratch.currentLookAt.copy(scratch.lookAt);
      initialised.current = true;
    } else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, scratch.position.x, smoothing, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, scratch.position.y, smoothing, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, scratch.position.z, smoothing, dt);

      scratch.currentLookAt.x = THREE.MathUtils.damp(scratch.currentLookAt.x, scratch.lookAt.x, smoothing, dt);
      scratch.currentLookAt.y = THREE.MathUtils.damp(scratch.currentLookAt.y, scratch.lookAt.y, smoothing, dt);
      scratch.currentLookAt.z = THREE.MathUtils.damp(scratch.currentLookAt.z, scratch.lookAt.z, smoothing, dt);
    }

    camera.lookAt(scratch.currentLookAt);

    const targetFov = THREE.MathUtils.lerp(from.fov ?? 38, to.fov ?? 38, localT);
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, smoothing, dt);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
