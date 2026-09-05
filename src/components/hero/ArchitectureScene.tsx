"use client";

import { AdaptiveDpr, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";

import { CameraController } from "@/components/three/CameraController";
import { Lighting } from "@/components/three/Lighting";
import { ModelLoader } from "@/components/three/ModelLoader";
import { PostProcessing } from "@/components/three/PostProcessing";
import { tierSupports3D, usePerformanceTier } from "@/lib/device";
import { useReducedMotion } from "@/lib/hooks";
import { usePointerRef } from "@/lib/useScrollProgress";

interface ArchitectureSceneProps {
  progress: React.RefObject<number>;
  /** Optional GLB. Falls back to the procedural villa when absent or broken. */
  modelSrc?: string;
  className?: string;
  keyframes?: unknown;
}

/**
 * The R3F Canvas configured per Section 2.1 and Section 7.
 * - ACES Filmic Tone Mapping with exposure 0.92
 * - Fixed 42 deg FOV architectural camera lens (near 0.05, far 200)
 * - PCF Soft Shadow Map
 * - SMAA + N8AO + Dynamic DepthOfField + Bloom + Vignette post-processing chain
 */
export function ArchitectureScene({
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
        camera={{ position: [14.0, 7.5, 26.0], fov: 42, near: 0.05, far: 200 }}
        dpr={high ? [1, 1.75] : [1, 1.25]}
        shadows={high ? "soft" : false}
        gl={{
          antialias: false, // Antialiasing handled by SMAA post-processing
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.92;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        style={{ pointerEvents: "none" }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        {/* Exterior sky backdrop with gentle distance fog that fades on interior entry (§2.3) */}
        <color attach="background" args={["#c0c7ce"]} />
        <fog attach="fog" args={["#b8b3aa", 45, 160]} />

        <Suspense fallback={null}>
          <Lighting quality={high ? "high" : "low"} />
          <ModelLoader
            src={modelSrc}
            detail={high ? "high" : "low"}
            pointer={pointer}
            reducedMotion={reducedMotion}
            castShadows={high}
          />
          <PostProcessing quality={high ? "high" : "low"} />
          <Preload all />
        </Suspense>

        <CameraController
          progress={progress}
          pointer={pointer}
          reducedMotion={reducedMotion}
        />

        {/* Drops resolution automatically if frame rate drops */}
        <AdaptiveDpr pixelated={false} />
      </Canvas>
    </div>
  );
}
