"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  N8AO,
  DepthOfField,
  Bloom,
  Vignette,
  SMAA,
} from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { globalCameraState } from "./CameraController";

interface PostProcessingProps {
  quality: "high" | "low";
}

/**
 * Screen-space post-processing chain conforming to Section 7 & Addendum A.
 * Chain order: N8AO -> DepthOfField -> Bloom -> Vignette -> SMAA.
 * N8AO provides contact shadows beneath furniture and wall junctions.
 * Dynamic DepthOfField auto-focuses live via CircleOfConfusionMaterial uniforms.
 */
export function PostProcessing({ quality }: PostProcessingProps) {
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const high = quality === "high";

  // Low-power hardware gates (§7)
  const isHighConcurrency =
    typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) >= 8 : true;
  const enableDof = high && isHighConcurrency;

  useFrame((state, delta) => {
    // Addendum Fix 1: Live uniform update for DepthOfField
    if (dofRef.current?.circleOfConfusionMaterial?.uniforms?.focusDistance) {
      const dist = state.camera.position.distanceTo(globalCameraState.target);
      const normalised = THREE.MathUtils.clamp(dist / state.camera.far, 0, 1);
      const current = dofRef.current.circleOfConfusionMaterial.uniforms.focusDistance.value;
      dofRef.current.circleOfConfusionMaterial.uniforms.focusDistance.value =
        THREE.MathUtils.damp(current, normalised, 4, Math.min(delta, 0.1));
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      {/* 1. N8AO Contact Shadows — verified deep dark contact shadows */}
      <N8AO
        aoRadius={1.0}
        intensity={2.8}
        distanceFalloff={0.8}
        color="#000000"
        halfRes={!high}
      />

      {/* 2. Dynamic Depth of Field (Addendum A Fix 1) */}
      {enableDof && (
        <DepthOfField
          ref={dofRef}
          focalLength={0.02}
          bokehScale={1.4}
          height={480}
        />
      )}

      {/* 3. Bloom: threshold 0.92, intensity 0.16 (prevents wash out) */}
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.3}
        intensity={0.16}
        mipmapBlur
      />

      {/* 4. Vignette for architectural lens grading */}
      <Vignette offset={0.28} darkness={0.42} />

      {/* 5. Subpixel Morphological Antialiasing */}
      <SMAA />
    </EffectComposer>
  );
}
