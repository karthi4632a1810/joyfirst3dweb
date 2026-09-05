"use client";

import { Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { globalCameraState } from "./CameraController";

interface LightingProps {
  quality: "high" | "low";
}

/**
 * Photorealistic Lighting Rig conforming to Section 6.
 * - 1 DirectionalLight (Sun 5600K -> #FFF4E2) with 2048x2048 PCF soft shadows,
 *   retargeted to current space.
 * - Soft SpotLight over Atrium roof light aperture.
 * - Non-shadow-casting PointLights (3000K -> #FFD9A8, decay: 2) placed at visible fixtures.
 * - Corridor lighting is 40% dimmer for compression/release contrast.
 * - Smooth outdoor -> indoor transition lerp across scroll 0.24 -> 0.32 (§6.5).
 */
export function Lighting({ quality }: LightingProps) {
  const high = quality === "high";

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const interiorGroupRef = useRef<THREE.Group>(null);
  const atriumSpotRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const scroll = globalCameraState.activeScroll;

    // Transition parameter t across scroll 0.24 -> 0.32
    const t = THREE.MathUtils.clamp((scroll - 0.24) / (0.32 - 0.24), 0, 1);
    const easedT = t * t * (3 - 2 * t);

    // 1. Sun intensity: 3.2 -> 1.4
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(3.2, 1.4, easedT);

      // Retarget shadow camera smoothly to camera vicinity
      const cam = state.camera;
      sunRef.current.target.position.set(cam.position.x * 0.5, 1.5, cam.position.z * 0.5);
      sunRef.current.target.updateMatrixWorld();
    }

    // 2. Sky ambient hemisphere light: 0.60 -> 0.30
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(0.60, 0.30, easedT);
    }

    // 3. Interior master intensity: 0 -> 1.0 (gradually illuminates as camera reaches entrance)
    if (interiorGroupRef.current) {
      const interiorMaster = THREE.MathUtils.lerp(0.15, 1.0, easedT);
      interiorGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.PointLight) {
          const baseIntensity = child.userData.baseIntensity ?? 2.5;
          child.intensity = baseIntensity * interiorMaster;
        }
      });
    }

    // 4. Tone mapping exposure: 1.05 -> 0.90
    state.gl.toneMappingExposure = THREE.MathUtils.lerp(1.05, 0.90, easedT);

    // 5. Exterior Fog removal across scroll 0.24 -> 0.30 (§2.3)
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.far = THREE.MathUtils.lerp(160, 500, easedT);
    }
  });

  return (
    <>
      {/* 1. Sky Ambient Hemisphere Light (§6.3: 5600K sky, warm bounce) */}
      <hemisphereLight
        ref={hemiRef}
        args={["#BFD4E8", "#6B6055", 0.60]}
      />

      {/* 2. Main Sun Directional Light (§6.1: 1 shadow-casting sun, 5600K #FFF4E2) */}
      <directionalLight
        ref={sunRef}
        position={[14, 22, 14]}
        color="#FFF4E2"
        intensity={3.2}
        castShadow={high}
        shadow-mapSize={high ? [2048, 2048] : [512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* 3. Soft SpotLight over Atrium Roof Light (§6.2) */}
      <spotLight
        ref={atriumSpotRef}
        position={[0, 6.8, 0]}
        target-position={[0, 0, 0]}
        color="#FFF4E2"
        intensity={high ? 3.5 : 1.8}
        angle={Math.PI / 4}
        penumbra={0.6}
        distance={12}
        decay={2}
        castShadow={false}
      />

      {/* 4. Warm Interior Architectural Light Group (3000K #FFD9A8) */}
      <group ref={interiorGroupRef}>
        {/* RECEPTION (C): Cove & feature lighting */}
        <pointLight
          position={[-1.4, 2.7, 4.4]}
          color="#FFD9A8"
          intensity={4.5}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.5 }}
        />
        <pointLight
          position={[-3.0, 2.6, 3.8]}
          color="#FFD9A8"
          intensity={3.5}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 3.5 }}
        />

        {/* RING CORRIDOR (B): 40% dimmer for arrival compression/release (§6.4) */}
        <pointLight
          position={[0, 2.5, 2.5]}
          color="#FFD9A8"
          intensity={2.2}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 2.2 }}
        />
        <pointLight
          position={[3.7, 2.5, 0]}
          color="#FFD9A8"
          intensity={2.2}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 2.2 }}
        />
        <pointLight
          position={[0, 2.5, -2.5]}
          color="#FFD9A8"
          intensity={2.2}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 2.2 }}
        />
        <pointLight
          position={[-3.7, 2.5, 0]}
          color="#FFD9A8"
          intensity={2.2}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 2.2 }}
        />

        {/* OPEN WORKSPACE (D): Linear pendants pools */}
        <pointLight
          position={[7.2, 2.3, 0.5]}
          color="#FFD9A8"
          intensity={4.0}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.0 }}
        />
        <pointLight
          position={[7.2, 2.3, 2.3]}
          color="#FFD9A8"
          intensity={4.0}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.0 }}
        />
        <pointLight
          position={[7.2, 2.3, 4.1]}
          color="#FFD9A8"
          intensity={4.0}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.0 }}
        />

        {/* COLLABORATION (E): Warm pool over communal table */}
        <pointLight
          position={[7.2, 2.4, -3.3]}
          color="#FFD9A8"
          intensity={4.2}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.2 }}
        />

        {/* GLASS MEETING ROOM (F): Pendant & Downlights */}
        <pointLight
          position={[2.6, 2.4, -4.6]}
          color="#FFD9A8"
          intensity={4.0}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 4.0 }}
        />

        {/* EXECUTIVE OFFICE (G): Warm cove & task lighting */}
        <pointLight
          position={[-2.0, 2.6, -4.6]}
          color="#FFD496"
          intensity={3.2}
          distance={5.5}
          decay={2}
          userData={{ baseIntensity: 3.2 }}
        />
        {/* Executive floor lamp */}
        <pointLight
          position={[-1.7, 1.5, -4.0]}
          color="#FFD496"
          intensity={2.8}
          distance={3.5}
          decay={2}
          userData={{ baseIntensity: 2.8 }}
        />

        {/* DESIGN STUDIO (H): Track lighting */}
        <pointLight
          position={[-7.2, 2.6, -3.4]}
          color="#FFD9A8"
          intensity={3.8}
          distance={6}
          decay={2}
          userData={{ baseIntensity: 3.8 }}
        />

        {/* PANTRY (I): Island pendants */}
        <pointLight
          position={[-7.2, 2.2, 0.1]}
          color="#FFD9A8"
          intensity={3.5}
          distance={5}
          decay={2}
          userData={{ baseIntensity: 3.5 }}
        />

        {/* RESIDENTIAL LOUNGE (J): Lamp-lit warmth */}
        <pointLight
          position={[-7.2, 1.8, 3.5]}
          color="#FFD496"
          intensity={3.0}
          distance={4.5}
          decay={2}
          userData={{ baseIntensity: 3.0 }}
        />
        <pointLight
          position={[-5.8, 1.5, 4.4]}
          color="#FFD496"
          intensity={2.5}
          distance={3.5}
          decay={2}
          userData={{ baseIntensity: 2.5 }}
        />

        {/* ATRIUM (A): Lower volume ambient fill */}
        <pointLight
          position={[0, 2.5, 0]}
          color="#FFD9A8"
          intensity={3.6}
          distance={7}
          decay={2}
          userData={{ baseIntensity: 3.6 }}
        />
      </group>

      {/* 5. Reflective Environment HDRI (§2.2) */}
      <Environment
        files="/hdr/interior_studio_1k.hdr"
        background={false}
        environmentIntensity={high ? 0.7 : 0.45}
      />
    </>
  );
}
