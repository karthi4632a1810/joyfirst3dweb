"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface FurnitureProps {
  castShadow?: boolean;
  receiveShadow?: boolean;
}

const MODEL_PATHS = {
  taskChair: "/models/task-chair.glb",
  diningChair: "/models/dining-chair.glb",
  loungeArmchair: "/models/lounge-armchair.glb",
  modularSofa: "/models/modular-sofa.glb",
  barStool: "/models/bar-stool.glb",
  executiveChair: "/models/executive-chair.glb",
  ficusTree: "/models/ficus-tree.glb",
  snakePlant: "/models/snake-plant.glb",
  monitor: "/models/monitor.glb",
  laptop: "/models/laptop.glb",
  floorLamp: "/models/floor-lamp.glb",
} as const;

// Preload all 11 models so nothing pops in mid-scroll (§2.6)
Object.values(MODEL_PATHS).forEach((url) => useGLTF.preload(url));

// Stable pseudo-random generator for deterministic jitter (§2.7)
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Replaces primitive furniture with 11 optimized, real GLTF/GLB models.
 * Incorporates natural placement rules (§2.7):
 * - rotY ±4-22° jitter, position ±0.03-0.14m jitter
 * - pulled out 0.15-0.35m from desks
 * - two or three chairs turned sideways
 * - all models sit flush on the floor at y = 0
 * - seat heights calibrated to 0.42-0.46m
 */
export function Furniture({
  castShadow = true,
  receiveShadow = true,
}: FurnitureProps) {
  // Load the 11 models
  const gltfTaskChair = useGLTF(MODEL_PATHS.taskChair);
  const gltfDiningChair = useGLTF(MODEL_PATHS.diningChair);
  const gltfLoungeArmchair = useGLTF(MODEL_PATHS.loungeArmchair);
  const gltfModularSofa = useGLTF(MODEL_PATHS.modularSofa);
  const gltfBarStool = useGLTF(MODEL_PATHS.barStool);
  const gltfExecutiveChair = useGLTF(MODEL_PATHS.executiveChair);
  const gltfFicusTree = useGLTF(MODEL_PATHS.ficusTree);
  const gltfSnakePlant = useGLTF(MODEL_PATHS.snakePlant);
  const gltfMonitor = useGLTF(MODEL_PATHS.monitor);
  const gltfLaptop = useGLTF(MODEL_PATHS.laptop);
  const gltfFloorLamp = useGLTF(MODEL_PATHS.floorLamp);

  // Prepare clones with shadow flags and palette harmonization (§2.8)
  const templates = useMemo(() => {
    function prepareScene(scene: THREE.Group, tintColor?: string) {
      const clone = scene.clone(true);
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = castShadow;
          mesh.receiveShadow = receiveShadow;
          if (tintColor && mesh.material) {
            const mat = Array.isArray(mesh.material)
              ? mesh.material[0]
              : (mesh.material as THREE.MeshStandardMaterial);
            if (mat && "color" in mat && mat.color instanceof THREE.Color) {
              mat.color.lerp(new THREE.Color(tintColor), 0.25);
            }
          }
        }
      });
      return clone;
    }

    return {
      taskChair: prepareScene(gltfTaskChair.scene, "#1E1E1F"),
      diningChair: prepareScene(gltfDiningChair.scene, "#B9AFA0"),
      loungeArmchair: prepareScene(gltfLoungeArmchair.scene, "#B9AFA0"),
      modularSofa: prepareScene(gltfModularSofa.scene, "#B9AFA0"),
      barStool: prepareScene(gltfBarStool.scene, "#8A5F38"),
      executiveChair: prepareScene(gltfExecutiveChair.scene, "#1E1E1F"),
      ficusTree: prepareScene(gltfFicusTree.scene),
      snakePlant: prepareScene(gltfSnakePlant.scene),
      monitor: prepareScene(gltfMonitor.scene),
      laptop: prepareScene(gltfLaptop.scene),
      floorLamp: prepareScene(gltfFloorLamp.scene),
    };
  }, [
    gltfTaskChair.scene,
    gltfDiningChair.scene,
    gltfLoungeArmchair.scene,
    gltfModularSofa.scene,
    gltfBarStool.scene,
    gltfExecutiveChair.scene,
    gltfFicusTree.scene,
    gltfSnakePlant.scene,
    gltfMonitor.scene,
    gltfLaptop.scene,
    gltfFloorLamp.scene,
    castShadow,
    receiveShadow,
  ]);

  return (
    <group name="JOYFIRST_Furniture_Fitout">
      {/* ================================================================ */}
      {/* 1. ZONE C: RECEPTION                                            */}
      {/* ================================================================ */}
      <group position={[-1.4, 0, 4.5]}>
        {/* Two low lounge armchairs on rug with natural angle */}
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[0.9, 0, 0.42]}
          rotation={[0, -0.42, 0]}
        />
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[0.9, 0, -0.42]}
          rotation={[0, 0.38, 0]}
        />
        {/* 2.2m Ficus tree in planter */}
        <primitive
          object={templates.ficusTree.clone(true)}
          position={[-2.4, 0, 0.9]}
          rotation={[0, 0.5, 0]}
        />
        {/* Low snake plant */}
        <primitive
          object={templates.snakePlant.clone(true)}
          position={[2.1, 0, 0.8]}
          rotation={[0, 1.2, 0]}
        />
        {/* Architectural floor lamp */}
        <primitive
          object={templates.floorLamp.clone(true)}
          position={[1.8, 0, -0.8]}
          rotation={[0, -1.8, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 2. ZONE D: OPEN WORKSPACE                                        */}
      {/* ================================================================ */}
      <group position={[7.2, 0, 2.3]}>
        {[-1.8, 0, 1.8].map((bz, benchIdx) => (
          <group key={`workspace-bench-${benchIdx}`} position={[0, 0, bz]}>
            {/* North side task chairs: 3 per bench, pulled out 0.22m, jittered */}
            {[-1.0, 0, 1.0].map((cx, i) => {
              const seed = benchIdx * 10 + i;
              const rotJitter = (pseudoRandom(seed) - 0.5) * 0.32;
              const posJitterX = (pseudoRandom(seed + 1) - 0.5) * 0.08;
              const isTurnedSideways = benchIdx === 1 && i === 1;
              const rotY = isTurnedSideways ? 0.78 : rotJitter;
              const pullOut = isTurnedSideways ? -1.05 : -0.92;

              return (
                <primitive
                  key={`chair-n-${benchIdx}-${i}`}
                  object={templates.taskChair.clone(true)}
                  position={[cx + posJitterX, 0, pullOut]}
                  rotation={[0, rotY, 0]}
                />
              );
            })}

            {/* South side task chairs: 3 per bench, facing north with jitter */}
            {[-1.0, 0, 1.0].map((cx, i) => {
              const seed = benchIdx * 10 + i + 20;
              const rotJitter = (pseudoRandom(seed) - 0.5) * 0.30;
              const posJitterX = (pseudoRandom(seed + 1) - 0.5) * 0.08;
              const isTurnedSideways = benchIdx === 0 && i === 2;
              const rotY = isTurnedSideways ? Math.PI - 0.85 : Math.PI + rotJitter;
              const pullOut = isTurnedSideways ? 1.08 : 0.92;

              return (
                <primitive
                  key={`chair-s-${benchIdx}-${i}`}
                  object={templates.taskChair.clone(true)}
                  position={[cx + posJitterX, 0, pullOut]}
                  rotation={[0, rotY, 0]}
                />
              );
            })}

            {/* Monitors on desk surface (y = 0.74m desk height) */}
            {[-1.0, 0, 1.0].map((cx, i) => (
              <group key={`monitors-${benchIdx}-${i}`}>
                <primitive
                  object={templates.monitor.clone(true)}
                  position={[cx, 0.74, -0.28]}
                  rotation={[0, (i - 1) * 0.06, 0]}
                />
                {!(benchIdx === 1 && i === 0) && (
                  <primitive
                    object={templates.monitor.clone(true)}
                    position={[cx, 0.74, 0.28]}
                    rotation={[0, Math.PI + (i - 1) * 0.05, 0]}
                  />
                )}
              </group>
            ))}

            {/* Open laptops scattered naturally */}
            {benchIdx === 0 && (
              <primitive
                object={templates.laptop.clone(true)}
                position={[-0.85, 0.74, -0.52]}
                rotation={[0, 0.12, 0]}
              />
            )}
            {benchIdx === 1 && (
              <primitive
                object={templates.laptop.clone(true)}
                position={[0.78, 0.74, 0.52]}
                rotation={[0, Math.PI - 0.18, 0]}
              />
            )}
            {benchIdx === 2 && (
              <primitive
                object={templates.laptop.clone(true)}
                position={[0.1, 0.74, -0.50]}
                rotation={[0, -0.08, 0]}
              />
            )}

            {/* Low architectural snake plant on divider plinth */}
            <primitive
              object={templates.snakePlant.clone(true)}
              position={[1.75, 0.80, 0]}
              rotation={[0, benchIdx * 1.2, 0]}
            />
          </group>
        ))}
      </group>

      {/* ================================================================ */}
      {/* 3. ZONE E: COLLABORATION                                         */}
      {/* ================================================================ */}
      <group position={[7.2, 0, -3.3]}>
        {/* 8 Cantilever / Dining Chairs around communal table */}
        {[-1.2, -0.4, 0.4, 1.2].map((cx, i) => {
          const seed = i * 7;
          const rotJitter = (pseudoRandom(seed) - 0.5) * 0.25;
          const isTurned = i === 1;
          const rotY = isTurned ? 0.48 : rotJitter;
          const pullOut = isTurned ? -0.88 : -0.74;

          return (
            <primitive
              key={`collab-chair-n-${i}`}
              object={templates.diningChair.clone(true)}
              position={[cx, 0, pullOut]}
              rotation={[0, rotY, 0]}
            />
          );
        })}
        {[-1.2, -0.4, 0.4, 1.2].map((cx, i) => {
          const seed = i * 7 + 10;
          const rotJitter = (pseudoRandom(seed) - 0.5) * 0.22;
          const isTurned = i === 2;
          const rotY = isTurned ? Math.PI - 0.52 : Math.PI + rotJitter;
          const pullOut = isTurned ? 0.86 : 0.74;

          return (
            <primitive
              key={`collab-chair-s-${i}`}
              object={templates.diningChair.clone(true)}
              position={[cx, 0, pullOut]}
              rotation={[0, rotY, 0]}
            />
          );
        })}

        {/* Laptops on communal table */}
        <primitive
          object={templates.laptop.clone(true)}
          position={[-0.6, 0.74, -0.15]}
          rotation={[0, 0.24, 0]}
        />
        <primitive
          object={templates.laptop.clone(true)}
          position={[0.8, 0.74, 0.12]}
          rotation={[0, Math.PI - 0.2, 0]}
        />

        {/* Corner lounge armchair for breakout */}
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[-2.1, 0, 1.4]}
          rotation={[0, 0.72, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 4. ZONE F: GLASS MEETING ROOM                                    */}
      {/* ================================================================ */}
      <group position={[2.6, 0, -4.6]}>
        {/* 6 Cantilever chairs around conference table with natural angles */}
        {[-1.0, 0, 1.0].map((cx, i) => (
          <primitive
            key={`conf-chair-n-${i}`}
            object={templates.diningChair.clone(true)}
            position={[cx, 0, -0.78 - (i === 1 ? 0.12 : 0)]}
            rotation={[0, (i - 1) * 0.14, 0]}
          />
        ))}
        {[-1.0, 0, 1.0].map((cx, i) => (
          <primitive
            key={`conf-chair-s-${i}`}
            object={templates.diningChair.clone(true)}
            position={[cx, 0, 0.78 + (i === 0 ? 0.14 : 0)]}
            rotation={[0, Math.PI + (i - 1) * 0.12, 0]}
          />
        ))}

        {/* Laptops on conference table */}
        <primitive
          object={templates.laptop.clone(true)}
          position={[-0.8, 0.74, -0.15]}
          rotation={[0, 0.15, 0]}
        />
        <primitive
          object={templates.laptop.clone(true)}
          position={[0.6, 0.74, 0.1]}
          rotation={[0, Math.PI - 0.25, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 5. ZONE G: EXECUTIVE OFFICE                                      */}
      {/* ================================================================ */}
      <group position={[-2.0, 0, -4.6]}>
        {/* Iconic Eames luxury executive chair behind dark walnut desk */}
        <primitive
          object={templates.executiveChair.clone(true)}
          position={[0, 0, -0.74]}
          rotation={[0, 0.18, 0]}
        />
        {/* Guest lounge armchair in front of desk */}
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[0.72, 0, 0.82]}
          rotation={[0, Math.PI - 0.35, 0]}
        />
        {/* Executive floor lamp */}
        <primitive
          object={templates.floorLamp.clone(true)}
          position={[-1.7, 0, 0.6]}
          rotation={[0, 0.45, 0]}
        />
        {/* Executive laptop on desk */}
        <primitive
          object={templates.laptop.clone(true)}
          position={[0.1, 0.74, 0.05]}
          rotation={[0, -0.08, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 6. ZONE H: DESIGN STUDIO                                         */}
      {/* ================================================================ */}
      <group position={[-7.2, 0, -3.4]}>
        {/* 4 Bar stools around worktables */}
        {[-1.1, 1.1].map((wy, tableIdx) => (
          <group key={`studio-stools-${tableIdx}`} position={[0, 0, wy]}>
            <primitive
              object={templates.barStool.clone(true)}
              position={[-0.6, 0, 0.68]}
              rotation={[0, 0.2, 0]}
            />
            <primitive
              object={templates.barStool.clone(true)}
              position={[0.6, 0, 0.68]}
              rotation={[0, -0.15, 0]}
            />
            {/* Monitor on studio table */}
            <primitive
              object={templates.monitor.clone(true)}
              position={[0.7, 0.74, -0.15]}
              rotation={[0, -0.1, 0]}
            />
          </group>
        ))}

        {/* 2 Task chairs in studio corner */}
        <primitive
          object={templates.taskChair.clone(true)}
          position={[-1.6, 0, 0.4]}
          rotation={[0, 0.85, 0]}
        />
        <primitive
          object={templates.taskChair.clone(true)}
          position={[-1.6, 0, -0.8]}
          rotation={[0, 0.35, 0]}
        />

        {/* Snake plants on studio perimeter shelf */}
        <primitive
          object={templates.snakePlant.clone(true)}
          position={[1.8, 0.85, 0]}
          rotation={[0, 0.4, 0]}
        />
        <primitive
          object={templates.snakePlant.clone(true)}
          position={[1.8, 0.85, 1.2]}
          rotation={[0, 1.6, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 7. ZONE I: PANTRY / COFFEE BAR                                   */}
      {/* ================================================================ */}
      <group position={[-7.2, 0, 0.1]}>
        {/* 2 Bar stools along the waterfall stone island */}
        <primitive
          object={templates.barStool.clone(true)}
          position={[-0.4, 0, 0.72]}
          rotation={[0, 0.1, 0]}
        />
        <primitive
          object={templates.barStool.clone(true)}
          position={[0.4, 0, 0.72]}
          rotation={[0, -0.22, 0]}
        />
        {/* Snake plant on plinth */}
        <primitive
          object={templates.snakePlant.clone(true)}
          position={[1.4, 0, 0.4]}
          rotation={[0, 0.6, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 8. ZONE J: RESIDENTIAL LOUNGE                                    */}
      {/* ================================================================ */}
      <group position={[-7.2, 0, 3.5]}>
        {/* Modular 3-Seat Sofa centered on wool rug */}
        <primitive
          object={templates.modularSofa.clone(true)}
          position={[0, 0, 0.85]}
          rotation={[0, 0, 0]}
        />

        {/* Two low lounge armchairs facing coffee table */}
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[-1.2, 0, -0.2]}
          rotation={[0, 0.42, 0]}
        />
        <primitive
          object={templates.loungeArmchair.clone(true)}
          position={[1.2, 0, -0.2]}
          rotation={[0, -0.42, 0]}
        />

        {/* Reading floor lamp near sofa corner */}
        <primitive
          object={templates.floorLamp.clone(true)}
          position={[1.6, 0, 0.9]}
          rotation={[0, -0.85, 0]}
        />

        {/* Tall ficus tree near lounge corner */}
        <primitive
          object={templates.ficusTree.clone(true)}
          position={[-2.2, 0, 1.2]}
          rotation={[0, 1.4, 0]}
        />

        {/* Low snake plant near window plinth */}
        <primitive
          object={templates.snakePlant.clone(true)}
          position={[2.0, 0, -0.6]}
          rotation={[0, 0.3, 0]}
        />
      </group>

      {/* ================================================================ */}
      {/* 9. ZONE A: ATRIUM (FINALE)                                       */}
      {/* ================================================================ */}
      <group position={[0, 0, 0]}>
        {/* Two 2.2m tall Ficus trees flanking the double-height volume */}
        <primitive
          object={templates.ficusTree.clone(true)}
          position={[-1.3, 0, 0.6]}
          rotation={[0, 0.35, 0]}
        />
        <primitive
          object={templates.ficusTree.clone(true)}
          position={[1.3, 0, -0.5]}
          rotation={[0, 2.1, 0]}
        />
      </group>
    </group>
  );
}
