"use client";

import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";

import { CameraController } from "@/components/three/CameraController";
import type { CameraKeyframe } from "@/lib/camera";
import { Lighting } from "@/components/three/Lighting";
import { ModelLoader } from "@/components/three/ModelLoader";
import { tierSupports3D, usePerformanceTier } from "@/lib/device";
import { useReducedMotion } from "@/lib/hooks";
import { usePointerRef } from "@/lib/useScrollProgress";

interface ArchitectureSceneProps {
  keyframes: CameraKeyframe[];
  progress: React.RefObject<number>;
  /** Optional GLB. Falls back to the procedural villa when absent or broken. */
  modelSrc?: string;
  className?: string;
}

/**
 * The R3F canvas, with its capability gate.
 *
 * Three tiers:
 *   desktop — full geometry, shadow maps, DPR up to 1.75
 *   mobile  — reduced geometry, no shadows, DPR capped at 1.25
 *   none/low — renders nothing at all
 *
 * On that last branch it returns null rather than an image, because every
 * caller already paints <ModelFallback /> as a server-rendered base layer
 * underneath. The canvas is opaque, so when 3D is available it simply covers
 * that photograph — and when it is not, the photograph is what stays. Nothing
 * has to detect anything for the page to look finished.
 */
export function ArchitectureScene({
  keyframes,
  progress,
  modelSrc,
  className = "",
}: ArchitectureSceneProps) {
  const tier = usePerformanceTier();
  const reducedMotion = useReducedMotion();
  const pointer = usePointerRef();

  if (!tierSupports3D(tier)) return null;

  const high = tier === "desktop";

  return (
    <div className={className}>
      <Canvas
        // The camera is positioned by CameraController on its first frame; this
        // is only the starting point before that runs.
        camera={{ position: keyframes[0]?.position ?? [16, 9, 34], fov: keyframes[0]?.fov ?? 36, near: 0.1, far: 220 }}
        dpr={high ? [1, 1.75] : [1, 1.25]}
        shadows={high ? "soft" : false}
        gl={{
          antialias: high,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        // Nothing in the scene is interactive, so the canvas stays out of the
        // way of text selection and the custom cursor.
        style={{ pointerEvents: "none" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        {/* Daylight sky, slightly cooler than the page so the building reads
            against it, with fog carrying the same tone into the distance. */}
        <color attach="background" args={["#dfe3e7"]} />
        <fog attach="fog" args={["#dfe3e7", 40, 130]} />

        <Suspense fallback={null}>
          <Lighting quality={high ? "high" : "low"} />
          <ModelLoader
            src={modelSrc}
            detail={high ? "high" : "low"}
            pointer={pointer}
            reducedMotion={reducedMotion}
            castShadows={high}
          />
          <Preload all />
        </Suspense>

        <CameraController
          keyframes={keyframes}
          progress={progress}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />

        {/* Drops resolution automatically if the frame rate falls. */}
        <AdaptiveDpr pixelated={false} />
      </Canvas>
    </div>
  );
}
