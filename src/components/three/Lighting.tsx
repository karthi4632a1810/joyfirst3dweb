"use client";

import { Environment, Lightformer } from "@react-three/drei";

interface LightingProps {
  /** Mobile drops shadow casting and the environment resolution. */
  quality: "high" | "low";
}

/**
 * Daylight rig for the architectural scenes.
 *
 * Mid-morning rather than golden hour: a high, slightly cool key with crisp
 * shadows, strong sky fill, and a warm bounce off the ground. That is the light
 * architectural photography is actually shot in, and it is what keeps white
 * concrete reading as white instead of cream.
 *
 * The environment map is built from Lightformers rather than an HDRI preset —
 * drei's presets fetch a file from a CDN at runtime, which would put a
 * third-party request on the critical path and break the scene offline. Three
 * emissive planes give the glass and concrete believable reflections for a few
 * kilobytes of geometry.
 */
export function Lighting({ quality }: LightingProps) {
  const high = quality === "high";

  return (
    <>
      {/* Open-sky ambient. High on a bright scene — shadows are shaped by the
          key light, not by starving the fill. */}
      <ambientLight intensity={1.05} color="#e8eef4" />

      {/* Sky above, warm ground bounce below. */}
      <hemisphereLight args={["#cfe0ef", "#b9ac96", 1.5]} />

      {/* Key: high sun, slightly warm, crisp shadows. */}
      <directionalLight
        position={[14, 18, 10]}
        intensity={3.1}
        color="#fff6e6"
        castShadow={high}
        shadow-mapSize={high ? [2048, 2048] : [512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />

      {/* Cool sky fill from the shadow side, so shadowed faces stay open. */}
      <directionalLight position={[-12, 8, -10]} intensity={0.9} color="#cfe2f2" />

      {/* Ground bounce back up into the soffits and the roof overhang. */}
      <directionalLight position={[0, -6, 6]} intensity={0.4} color="#d8cbb4" />

      <Environment resolution={high ? 256 : 128}>
        {/* Sky dome */}
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#eaf2fa"
          position={[0, 16, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[42, 42, 1]}
        />
        {/* Sun card */}
        <Lightformer
          form="rect"
          intensity={4}
          color="#fff4e2"
          position={[16, 10, 10]}
          rotation={[0, -Math.PI / 3.2, 0]}
          scale={[14, 10, 1]}
        />
        {/* Cool sky on the opposite side */}
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#c3d7ea"
          position={[-16, 7, -8]}
          rotation={[0, Math.PI / 2.6, 0]}
          scale={[20, 10, 1]}
        />
        {/* Warm ground plane, reflected in the glazing */}
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#c7b79c"
          position={[0, -8, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[40, 40, 1]}
        />
      </Environment>
    </>
  );
}
