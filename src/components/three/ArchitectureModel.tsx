"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface ArchitectureModelProps {
  /** Low detail drops the louvre screen, planting and pool geometry. */
  detail?: "high" | "low";
  /** Normalised pointer, -1..1 on both axes. Ignored when motion is reduced. */
  pointer?: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
  castShadows?: boolean;
}

/**
 * A contemporary villa assembled from primitives.
 *
 * This is the scene's default subject and needs no downloaded asset, so the
 * hero renders identically offline, on a cold cache, and when a GLB fails. When
 * a real model is supplied to <ModelLoader /> it takes this one's place.
 *
 * Dimensions are in metres. The building is centred on the origin with the
 * ground plane at y = 0.
 */
export function ArchitectureModel({
  detail = "high",
  pointer,
  reducedMotion = false,
  castShadows = true,
}: ArchitectureModelProps) {
  const group = useRef<THREE.Group>(null);
  const high = detail === "high";

  // Materials are created once and shared across every mesh — a fresh material
  // per mesh would mean a fresh shader program per mesh.
  const materials = useMemo(() => {
    // Off-white architectural concrete. High env intensity is what stops a
    // white surface going flat and grey under a bright sky.
    const concrete = new THREE.MeshStandardMaterial({
      color: "#e6e2da",
      roughness: 0.72,
      metalness: 0.02,
      envMapIntensity: 0.9,
    });
    // Recessed volumes: mid stone, not black — in daylight a shaded soffit is
    // still lit by the sky.
    const concreteDark = new THREE.MeshStandardMaterial({
      color: "#8d887e",
      roughness: 0.86,
      metalness: 0.02,
      envMapIntensity: 0.6,
    });
    // Daytime glazing reads as reflected sky, not as a lit interior.
    const glass = new THREE.MeshStandardMaterial({
      color: "#93a7b8",
      roughness: 0.05,
      metalness: 0.95,
      envMapIntensity: 2.1,
    });
    const timber = new THREE.MeshStandardMaterial({
      color: "#a57c4f",
      roughness: 0.58,
      metalness: 0.03,
      envMapIntensity: 0.7,
    });
    // Interiors sit behind glass in daylight, so this is a soft warm wall
    // catching light — not the glowing box it was at dusk.
    const interiorGlow = new THREE.MeshBasicMaterial({
      color: "#cfc4b2",
      toneMapped: true,
    });
    const ground = new THREE.MeshStandardMaterial({
      color: "#b8b1a3",
      roughness: 0.94,
      metalness: 0.02,
      envMapIntensity: 0.5,
    });
    const water = new THREE.MeshStandardMaterial({
      color: "#7d99ac",
      roughness: 0.03,
      metalness: 0.98,
      envMapIntensity: 2.4,
    });
    const foliage = new THREE.MeshStandardMaterial({
      color: "#5c6b4a",
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.6,
    });

    return { concrete, concreteDark, glass, timber, interiorGlow, ground, water, foliage };
  }, []);

  // Vertical louvres in front of the western glazing.
  const louvres = useMemo(() => {
    if (!high) return [];
    const fins: number[] = [];
    for (let x = -1.5; x <= 12.4; x += 0.62) fins.push(x);
    return fins;
  }, [high]);

  useFrame((state) => {
    const node = group.current;
    if (!node || reducedMotion) return;

    const t = state.clock.elapsedTime;
    const px = pointer?.current?.x ?? 0;
    const py = pointer?.current?.y ?? 0;

    // A slow drift, plus a small pointer-driven parallax. Both are damped so
    // the building never feels like it is being spun.
    const targetY = Math.sin(t * 0.055) * 0.055 + px * 0.09;
    const targetX = py * 0.028;

    node.rotation.y += (targetY - node.rotation.y) * 0.035;
    node.rotation.x += (targetX - node.rotation.x) * 0.035;
  });

  const shadow = castShadows;

  return (
    <group ref={group} dispose={null}>
      {/* ---- Ground ------------------------------------------------------ */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow={shadow}
        material={materials.ground}
      >
        <planeGeometry args={[160, 160]} />
      </mesh>

      {/* ---- Podium ------------------------------------------------------ */}
      <mesh position={[0, 0.18, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
        <boxGeometry args={[26, 0.36, 16]} />
      </mesh>

      {/* ---- Lower storey: recessed and dark, so the upper mass floats ---- */}
      <mesh position={[0, 2, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[20, 3.3, 12]} />
      </mesh>
      {/* Lower glazing, proud of the dark box */}
      <mesh position={[0, 2, 6.05]} material={materials.glass}>
        <boxGeometry args={[19.2, 2.7, 0.12]} />
      </mesh>
      <mesh position={[0, 1.7, 5.85]} material={materials.interiorGlow}>
        <planeGeometry args={[18.4, 1.9]} />
      </mesh>

      {/* ---- Intermediate slab, cantilevered ----------------------------- */}
      <mesh position={[0, 3.83, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
        <boxGeometry args={[24.4, 0.36, 14.4]} />
      </mesh>

      {/* ---- Upper storey ------------------------------------------------ */}
      {/* Solid western end */}
      <mesh position={[-6.6, 5.75, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
        <boxGeometry args={[7.2, 3.5, 12]} />
      </mesh>
      {/* Glazed eastern run */}
      <mesh position={[4.4, 5.75, 0]} castShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[14.8, 3.5, 11.6]} />
      </mesh>
      <mesh position={[4.4, 5.75, 5.85]} material={materials.glass}>
        <boxGeometry args={[14.6, 3.2, 0.12]} />
      </mesh>
      <mesh position={[4.4, 5.6, 5.6]} material={materials.interiorGlow}>
        <planeGeometry args={[14, 2.4]} />
      </mesh>
      {/* East gable glazing */}
      <mesh position={[11.75, 5.75, 0]} material={materials.glass}>
        <boxGeometry args={[0.12, 3.2, 11.4]} />
      </mesh>

      {/* Mullions across the glazed run */}
      {high &&
        Array.from({ length: 9 }, (_, i) => (
          <mesh
            key={`mullion-${i}`}
            position={[-2.6 + i * 1.75, 5.75, 5.95]}
            material={materials.concrete}
          >
            <boxGeometry args={[0.1, 3.3, 0.16]} />
          </mesh>
        ))}

      {/* ---- Roof slab --------------------------------------------------- */}
      <mesh position={[0, 7.7, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
        <boxGeometry args={[27, 0.42, 17]} />
      </mesh>

      {/* ---- Columns carrying the roof overhang -------------------------- */}
      {[-11.4, -5.6, 0.6, 6.6, 12].map((x) => (
        <mesh
          key={`col-${x}`}
          position={[x, 5.75, 7.9]}
          castShadow={shadow}
          material={materials.concrete}
        >
          <boxGeometry args={[0.26, 3.5, 0.26]} />
        </mesh>
      ))}

      {/* ---- Louvre screen ----------------------------------------------- */}
      {louvres.map((x, i) => (
        <mesh
          key={`fin-${i}`}
          position={[x, 5.75, 7.3]}
          castShadow={shadow}
          material={materials.timber}
        >
          <boxGeometry args={[0.08, 3.4, 0.34]} />
        </mesh>
      ))}

      {/* ---- Entrance ---------------------------------------------------- */}
      <mesh position={[-2.2, 1.5, 6.3]} castShadow={shadow} material={materials.timber}>
        <boxGeometry args={[2.4, 2.7, 0.14]} />
      </mesh>
      <mesh position={[-2.2, 0.2, 8.6]} receiveShadow={shadow} material={materials.concrete}>
        <boxGeometry args={[4.4, 0.12, 4.8]} />
      </mesh>

      {/* ---- Reflecting pool --------------------------------------------- */}
      {high && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.06, 15]} material={materials.water}>
            <planeGeometry args={[22, 9]} />
          </mesh>
          <mesh position={[2, 0.1, 19.6]} receiveShadow={shadow} material={materials.concrete}>
            <boxGeometry args={[22.6, 0.2, 0.5]} />
          </mesh>
        </>
      )}

      {/* ---- Landscape --------------------------------------------------- */}
      {high &&
        [
          [-17, 11],
          [16, 9],
          [-14, -8],
          [19, -4],
          [-20, 2],
        ].map(([x, z], i) => (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 1.5, 0]} castShadow={shadow} material={materials.foliage}>
              <cylinderGeometry args={[0.09, 0.14, 3, 6]} />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow={shadow} material={materials.foliage}>
              <icosahedronGeometry args={[1.5, 1]} />
            </mesh>
            <mesh position={[0.5, 2.9, 0.3]} castShadow={shadow} material={materials.foliage}>
              <icosahedronGeometry args={[1, 1]} />
            </mesh>
          </group>
        ))}

      {/* Low planting beds flanking the approach */}
      {high &&
        [-9, 9].map((x) => (
          <mesh key={`bed-${x}`} position={[x, 0.45, 10.5]} receiveShadow={shadow} material={materials.foliage}>
            <boxGeometry args={[7, 0.5, 2.4]} />
          </mesh>
        ))}
    </group>
  );
}
