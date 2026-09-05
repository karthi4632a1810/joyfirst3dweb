"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  createBoardConcreteTexture,
  createCeilingTexture,
  createFabricTexture,
  createGravelTexture,
  createKotaStoneTexture,
  createLawnTexture,
  createLimestonePavingTexture,
  createPlasterTexture,
  createRoughnessMap,
  createRugTexture,
  createTeakTexture,
  createWalnutTexture,
  createSlattedWoodTexture,
  createMarbleTexture,
  createMonitorScreenTexture,
  createBlueprintTexture,
} from "./proceduralTextures";
import { OfficeInterior } from "./OfficeInterior";

interface ArchitectureModelProps {
  /** Low detail drops secondary interior props and foliage density. */
  detail?: "high" | "low";
  /** Normalised pointer, -1..1 on both axes. Ignored when motion is reduced. */
  pointer?: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
  castShadows?: boolean;
}

/**
 * Photorealistic Contemporary Residence.
 *
 * Preserves the exact massing, cantilever roof, vertical facade fins, entrance position,
 * and camera composition of the original hero villa, while replacing placeholder blocks
 * with real hollow architectural construction, realistic wall thickness, bevelled reveals,
 * physical PBR materials, and a fully furnished luxury interior visible through the glass
 * and fully entered upon scrolling.
 */
export function ArchitectureModel({
  detail = "high",
  pointer,
  reducedMotion = false,
  castShadows = true,
}: ArchitectureModelProps) {
  const group = useRef<THREE.Group>(null);
  const doorGroup = useRef<THREE.Group>(null);
  const high = detail === "high";
  const shadow = castShadows;

  // Generate procedural materials with micro-textures, roughness variation and bump maps
  const materials = useMemo(() => {
    const boardConcreteTex = createBoardConcreteTexture();
    const teakTex = createTeakTexture();
    const plasterTex = createPlasterTexture();
    const ceilingTex = createCeilingTexture();
    const kotaTex = createKotaStoneTexture();
    const limestoneTex = createLimestonePavingTexture();
    const fabricTex = createFabricTexture();
    const rugTex = createRugTexture();
    const roughMap = createRoughnessMap();
    const gravelTex = createGravelTexture();
    const lawnTex = createLawnTexture();
    const walnutTex = createWalnutTexture();
    const slattedWoodTex = createSlattedWoodTexture();
    const marbleTex = createMarbleTexture();
    const monitorScreenTex = createMonitorScreenTexture();
    const blueprintTex = createBlueprintTexture();

    // Configure repeat rates for architectural scale
    boardConcreteTex.repeat.set(4, 2);
    plasterTex.repeat.set(2, 2);
    ceilingTex.repeat.set(2, 2);
    teakTex.repeat.set(2, 2);
    kotaTex.repeat.set(6, 6);
    limestoneTex.repeat.set(8, 8);
    fabricTex.repeat.set(3, 2);
    rugTex.repeat.set(4, 3);
    gravelTex.repeat.set(16, 16);
    lawnTex.repeat.set(18, 18);
    walnutTex.repeat.set(2, 2);
    slattedWoodTex.repeat.set(2, 1);
    marbleTex.repeat.set(1, 1);

    // Architectural board-formed concrete
    const concrete = new THREE.MeshStandardMaterial({
      color: "#e2ddd5",
      map: boardConcreteTex,
      bumpMap: boardConcreteTex,
      bumpScale: 0.015,
      roughnessMap: roughMap,
      roughness: 0.76,
      metalness: 0.02,
      envMapIntensity: 0.85,
    });

    // Darker recessed structural elements
    const concreteDark = new THREE.MeshStandardMaterial({
      color: "#847f76",
      map: boardConcreteTex,
      bumpMap: boardConcreteTex,
      bumpScale: 0.02,
      roughness: 0.84,
      metalness: 0.03,
      envMapIntensity: 0.6,
    });

    // Interior & soffit smooth lime plaster
    const plaster = new THREE.MeshStandardMaterial({
      color: "#f4efe7",
      map: plasterTex,
      bumpMap: plasterTex,
      bumpScale: 0.004,
      roughness: 0.94,
      metalness: 0.01,
      envMapIntensity: 0.4,
    });

    // Smooth architectural ceiling finish
    const ceiling = new THREE.MeshStandardMaterial({
      color: "#faf8f2",
      map: ceilingTex,
      roughness: 0.96,
      metalness: 0.01,
      envMapIntensity: 0.35,
    });

    // Natural architectural teak wood
    const timber = new THREE.MeshStandardMaterial({
      color: "#a4784a",
      map: teakTex,
      bumpMap: teakTex,
      bumpScale: 0.012,
      roughness: 0.52,
      metalness: 0.04,
      envMapIntensity: 0.65,
    });

    // Dark smoked oak for furniture & joinery
    const darkTimber = new THREE.MeshStandardMaterial({
      color: "#4a3c2e",
      map: teakTex,
      bumpMap: teakTex,
      bumpScale: 0.01,
      roughness: 0.48,
      metalness: 0.04,
      envMapIntensity: 0.55,
    });

    // Dark Kota stone floor tile
    const floorKota = new THREE.MeshStandardMaterial({
      color: "#3d423e",
      map: kotaTex,
      bumpMap: kotaTex,
      bumpScale: 0.008,
      roughness: 0.38,
      metalness: 0.04,
      envMapIntensity: 0.9,
    });

    // Honed limestone paving
    const paving = new THREE.MeshStandardMaterial({
      color: "#cdc5b7",
      map: limestoneTex,
      bumpMap: limestoneTex,
      bumpScale: 0.01,
      roughness: 0.68,
      metalness: 0.02,
      envMapIntensity: 0.65,
    });

    // Physically based architectural glass
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#b0c8d8",
      roughness: 0.03,
      metalness: 0.08,
      transmission: 0.9,
      thickness: 0.18,
      ior: 1.52,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 2.2,
      reflectivity: 0.85,
    });

    // Darkened metal for window frames, mullions, brackets & hardware
    const metalDark = new THREE.MeshStandardMaterial({
      color: "#28292b",
      roughness: 0.32,
      metalness: 0.88,
      envMapIntensity: 1.2,
    });

    // Architectural brushed bronze / brass accent
    const bronze = new THREE.MeshStandardMaterial({
      color: "#997343",
      roughness: 0.34,
      metalness: 0.82,
      envMapIntensity: 1.3,
    });

    // Contemporary upholstery fabric
    const fabric = new THREE.MeshStandardMaterial({
      color: "#bcb4a2",
      map: fabricTex,
      bumpMap: fabricTex,
      bumpScale: 0.008,
      roughness: 0.88,
      metalness: 0.01,
      envMapIntensity: 0.2,
    });

    // Dark accent fabric for throw pillows
    const fabricAccent = new THREE.MeshStandardMaterial({
      color: "#54524c",
      roughness: 0.86,
      metalness: 0,
      envMapIntensity: 0.2,
    });

    // Textured wool rug
    const rug = new THREE.MeshStandardMaterial({
      color: "#9e9482",
      map: rugTex,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.25,
    });

    // Warm architectural LED linear strip / cove
    const lightStrip = new THREE.MeshStandardMaterial({
      color: "#fff2df",
      emissive: "#ffdca8",
      emissiveIntensity: 1.4,
      roughness: 0.4,
    });

    // Architectural reflecting pool water
    const water = new THREE.MeshStandardMaterial({
      color: "#3d5a73",
      roughness: 0.02,
      metalness: 0.85,
      envMapIntensity: 2.6,
      transparent: true,
      opacity: 0.88,
    });

    // Landscape gravel
    const gravel = new THREE.MeshStandardMaterial({
      color: "#b0a89a",
      map: gravelTex,
      bumpMap: gravelTex,
      bumpScale: 0.015,
      roughness: 0.95,
      metalness: 0.01,
      envMapIntensity: 0.4,
    });

    // Manicured lawn
    const lawn = new THREE.MeshStandardMaterial({
      color: "#64774e",
      map: lawnTex,
      bumpMap: lawnTex,
      bumpScale: 0.018,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.35,
    });

    // Foliage materials for layered landscaping
    const foliageDark = new THREE.MeshStandardMaterial({
      color: "#3f4d2f",
      roughness: 0.92,
      flatShading: true,
      envMapIntensity: 0.35,
    });
    const foliageMid = new THREE.MeshStandardMaterial({
      color: "#52633d",
      roughness: 0.9,
      flatShading: true,
      envMapIntensity: 0.45,
    });
    const foliageLight = new THREE.MeshStandardMaterial({
      color: "#6b7d52",
      roughness: 0.9,
      flatShading: true,
      envMapIntensity: 0.5,
    });
    const treeTrunk = new THREE.MeshStandardMaterial({
      color: "#463d33",
      roughness: 0.92,
      metalness: 0,
    });

    // Premium American Walnut for executive office desk and conference table
    const walnut = new THREE.MeshStandardMaterial({
      color: "#56412f",
      map: walnutTex,
      bumpMap: walnutTex,
      bumpScale: 0.012,
      roughness: 0.44,
      metalness: 0.04,
      envMapIntensity: 0.65,
    });

    // Acoustic vertical timber slatted wall with dark acoustic backing
    const slattedWood = new THREE.MeshStandardMaterial({
      color: "#b28557",
      map: slattedWoodTex,
      bumpMap: slattedWoodTex,
      bumpScale: 0.024,
      roughness: 0.68,
      metalness: 0.02,
      envMapIntensity: 0.5,
    });

    // Calacatta honed white marble for desk waterfall leg
    const marble = new THREE.MeshStandardMaterial({
      color: "#f6f4f0",
      map: marbleTex,
      roughness: 0.22,
      metalness: 0.05,
      envMapIntensity: 1.25,
    });

    // Architectural CAD/BIM monitor screens
    const monitorScreen = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: monitorScreenTex,
      emissive: "#ffffff",
      emissiveMap: monitorScreenTex,
      emissiveIntensity: 0.9,
      roughness: 0.18,
    });

    // Architectural blueprint floor plans
    const blueprint = new THREE.MeshStandardMaterial({
      color: "#fcfbf7",
      map: blueprintTex,
      roughness: 0.85,
      metalness: 0,
    });

    // Ergonomic office chair breathable mesh
    const chairMesh = new THREE.MeshStandardMaterial({
      color: "#1e2024",
      roughness: 0.72,
      metalness: 0.1,
      envMapIntensity: 0.3,
    });

    // Suspended linear pendant warm luminaire
    const pendantGlow = new THREE.MeshStandardMaterial({
      color: "#fff8ee",
      emissive: "#ffe8c4",
      emissiveIntensity: 2.2,
      roughness: 0.25,
    });

    return {
      concrete,
      concreteDark,
      plaster,
      ceiling,
      timber,
      darkTimber,
      floorKota,
      paving,
      glass,
      metalDark,
      bronze,
      fabric,
      fabricAccent,
      rug,
      lightStrip,
      water,
      gravel,
      lawn,
      foliageDark,
      foliageMid,
      foliageLight,
      treeTrunk,
      walnut,
      slattedWood,
      marble,
      monitorScreen,
      blueprint,
      chairMesh,
      pendantGlow,
    };
  }, []);

  // Vertical facade louvres coordinates
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

    // Gentle camera parallax response
    const targetY = Math.sin(t * 0.05) * 0.045 + px * 0.08;
    const targetX = py * 0.025;

    node.rotation.y += (targetY - node.rotation.y) * 0.035;
    node.rotation.x += (targetX - node.rotation.x) * 0.035;
  });

  return (
    <group ref={group} dispose={null}>
      {/* ================================================================== */}
      {/* 1. GROUND & SITE CONTEXT                                           */}
      {/* ================================================================== */}

      {/* Main lawn ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow={shadow}
        material={materials.lawn}
      >
        <planeGeometry args={[160, 160]} />
      </mesh>

      {/* Gravel margin perimeter around villa */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow={shadow}
        material={materials.gravel}
      >
        <planeGeometry args={[36, 26]} />
      </mesh>

      {/* Main architectural floating podium */}
      <group position={[0, 0.18, 0]}>
        <mesh castShadow={shadow} receiveShadow={shadow} material={materials.paving}>
          <boxGeometry args={[26, 0.36, 16]} />
        </mesh>
        {/* Recessed shadow gap reveal beneath podium edge */}
        <mesh position={[0, -0.16, 0]} material={materials.concreteDark}>
          <boxGeometry args={[25.4, 0.06, 15.4]} />
        </mesh>
      </group>

      {/* ================================================================== */}
      {/* 2. LOWER STOREY: HOLLOW ARCHITECTURAL STRUCTURE                     */}
      {/* ================================================================== */}

      {/* Perimeter walls and structure of lower storey exterior shell */}

      {/* North rear perimeter wall (board concrete outside, plaster inside) */}
      <mesh position={[0, 2.0, -5.88]} castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[20.0, 3.26, 0.32]} />
      </mesh>
      <mesh position={[0, 2.0, -5.7]} material={materials.plaster}>
        <boxGeometry args={[19.4, 3.2, 0.04]} />
      </mesh>

      {/* West side wall (solid board-formed concrete with architectural thickness) */}
      <mesh position={[-9.86, 2.0, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[0.32, 3.26, 12.0]} />
      </mesh>
      <mesh position={[-9.68, 2.0, 0]} material={materials.plaster}>
        <boxGeometry args={[0.04, 3.2, 11.4]} />
      </mesh>

      {/* East side wall with recessed window reveal */}
      <mesh position={[9.86, 2.0, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[0.32, 3.26, 12.0]} />
      </mesh>
      <mesh position={[9.68, 2.0, 0]} material={materials.plaster}>
        <boxGeometry args={[0.04, 3.2, 11.4]} />
      </mesh>



      {/* Structural columns inside and along perimeter */}
      {[-9.5, -4.2, 2.5, 9.5].map((cx) => (
        <group key={`col-ground-${cx}`} position={[cx, 2.0, 5.8]}>
          <mesh castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
            <boxGeometry args={[0.26, 3.26, 0.26]} />
          </mesh>
        </group>
      ))}

      {/* ================================================================== */}
      {/* 3. SOUTH FACADE: CURTAIN WALL & RECESSED ENTRANCE                   */}
      {/* ================================================================== */}

      {/* Recessed entry porch wall & vestibule at x = -1.4 */}
      <mesh position={[-6.05, 1.6, 5.86]} castShadow={shadow} receiveShadow={shadow} material={materials.concreteDark}>
        <boxGeometry args={[7.5, 3.2, 0.32]} />
      </mesh>
      {/* Accent teak vertical timber paneling on entrance feature wall */}
      <mesh position={[-0.45, 1.6, 5.85]} castShadow={shadow} material={materials.timber}>
        <boxGeometry args={[0.7, 3.2, 0.06]} />
      </mesh>

      {/* Entrance porch covered soffit */}
      <mesh position={[-1.4, 3.25, 6.6]} material={materials.timber}>
        <boxGeometry args={[2.8, 0.06, 1.8]} />
      </mesh>
      {/* Porch warm downlight fixture */}
      <mesh position={[-1.4, 3.22, 6.6]} material={materials.lightStrip}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
      </mesh>

      {/* Architectural Opening O1 Doorway at x = -1.4, z = 5.80 (1.80m x 2.40m clear) */}
      {/* Door frame jambs & header */}
      <mesh position={[-2.30, 1.20, 5.80]} material={materials.metalDark}>
        <boxGeometry args={[0.08, 2.40, 0.18]} />
      </mesh>
      <mesh position={[-0.50, 1.20, 5.80]} material={materials.metalDark}>
        <boxGeometry args={[0.08, 2.40, 0.18]} />
      </mesh>
      <mesh position={[-1.4, 2.80, 5.80]} material={materials.metalDark}>
        <boxGeometry args={[1.80, 0.80, 0.18]} />
      </mesh>
      {/* Door threshold */}
      <mesh position={[-1.4, 0.02, 5.80]} material={materials.metalDark}>
        <boxGeometry args={[1.80, 0.04, 0.18]} />
      </mesh>

      {/* Glazed Pivot Door: Held open flush against vestibule wall (clear of camera path) */}
      <group ref={doorGroup} position={[-2.25, 1.20, 5.80]} rotation={[0, 1.5, 0]}>
        <mesh position={[0.88, 0, 0]} castShadow={shadow} material={materials.glass}>
          <boxGeometry args={[1.76, 2.36, 0.04]} />
        </mesh>
        <mesh position={[0.88, 0, 0]} material={materials.metalDark}>
          <boxGeometry args={[1.78, 0.04, 0.06]} />
        </mesh>
        <mesh position={[1.65, 0, 0.05]} material={materials.bronze}>
          <cylinderGeometry args={[0.02, 0.02, 1.4, 12]} />
        </mesh>
      </group>

      {/* Architectural Concrete Planter positioned clear of entrance approach */}
      <group position={[0.2, 0.0, 6.6]}>
        <mesh position={[0, 0.35, 0]} castShadow={shadow} material={materials.concreteDark}>
          <cylinderGeometry args={[0.26, 0.20, 0.70, 20]} />
        </mesh>
        <mesh position={[0, 1.0, 0]} material={materials.treeTrunk}>
          <cylinderGeometry args={[0.03, 0.04, 0.70, 8]} />
        </mesh>
        {[-0.1, 0.1, 0].map((ox, i) => (
          <mesh
            key={`entrance-plant-${i}`}
            position={[ox, 1.2 + i * 0.2, 0]}
            castShadow={shadow}
            material={materials.foliageMid}
          >
            <icosahedronGeometry args={[0.26, 1]} />
          </mesh>
        ))}
      </group>

      {/* Lower Storey Floor-to-Ceiling Glass Curtain Wall (x = -0.4 to 9.6) */}
      <group position={[4.6, 2.0, 5.95]}>
        {/* PBR Glass Pane */}
        <mesh material={materials.glass}>
          <boxGeometry args={[10.2, 3.1, 0.04]} />
        </mesh>
        {/* Metal perimeter frame */}
        <mesh position={[0, -1.52, 0]} material={materials.metalDark}>
          <boxGeometry args={[10.3, 0.08, 0.16]} />
        </mesh>
        <mesh position={[0, 1.52, 0]} material={materials.metalDark}>
          <boxGeometry args={[10.3, 0.08, 0.16]} />
        </mesh>
        <mesh position={[-5.1, 0, 0]} material={materials.metalDark}>
          <boxGeometry args={[0.08, 3.1, 0.16]} />
        </mesh>
        <mesh position={[5.1, 0, 0]} material={materials.metalDark}>
          <boxGeometry args={[0.08, 3.1, 0.16]} />
        </mesh>
        {/* Vertical mullions with depth */}
        {[-2.55, 0, 2.55].map((mx) => (
          <mesh key={`curtain-mullion-${mx}`} position={[mx, 0, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.07, 3.0, 0.18]} />
          </mesh>
        ))}
        {/* Horizontal transom bar */}
        <mesh position={[0, 0.9, 0]} material={materials.metalDark}>
          <boxGeometry args={[10.2, 0.06, 0.14]} />
        </mesh>
      </group>

      {/* ================================================================== */}
      {/* 4. OFFICE INTERIOR (10-Zone Architectural Layout & Fit-Out)         */}
      {/* ================================================================== */}
      <OfficeInterior quality={detail} castShadows={castShadows} />

      {/* ================================================================== */}
      {/* 5. INTERMEDIATE CANTILEVERED SLAB (y = 3.83)                        */}
      {/* ================================================================== */}
      <group position={[0, 3.83, 0]}>
        {/* West slab portion */}
        <mesh position={[-7.4, 0, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[9.6, 0.36, 14.4]} />
        </mesh>
        {/* East slab portion */}
        <mesh position={[7.4, 0, 0]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[9.6, 0.36, 14.4]} />
        </mesh>
        {/* North intermediate strip framing double-height atrium void */}
        <mesh position={[0, 0, -4.3]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[5.2, 0.36, 5.8]} />
        </mesh>
        {/* South intermediate strip framing double-height atrium void */}
        <mesh position={[0, 0, 4.3]} castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[5.2, 0.36, 5.8]} />
        </mesh>
        {/* Perimeter edge drip reveal / fascia detail */}
        <mesh position={[0, -0.17, 0]} material={materials.concreteDark}>
          <boxGeometry args={[24.2, 0.04, 14.2]} />
        </mesh>
      </group>

      {/* ================================================================== */}
      {/* 6. UPPER STOREY (y = 4.01 to 7.49)                                  */}
      {/* ================================================================== */}

      {/* Solid Western End in board-formed concrete */}
      <group position={[-6.6, 5.75, 0]}>
        <mesh castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[7.2, 3.48, 12.0]} />
        </mesh>
        {/* Recessed vertical window slot on solid face */}
        <mesh position={[0, 0, 6.01]} material={materials.glass}>
          <boxGeometry args={[0.6, 2.6, 0.04]} />
        </mesh>
        <mesh position={[0, 0, 6.0]} material={materials.metalDark}>
          <boxGeometry args={[0.68, 2.68, 0.08]} />
        </mesh>
      </group>

      {/* Glazed Eastern Pavilion Volume */}
      <group position={[4.4, 5.75, 0]}>
        {/* Upper floor interior floor finish */}
        <mesh position={[0, -1.72, 0]} material={materials.floorKota}>
          <boxGeometry args={[14.6, 0.04, 11.4]} />
        </mesh>
        {/* Upper floor interior ceiling */}
        <mesh position={[0, 1.72, 0]} material={materials.ceiling}>
          <boxGeometry args={[14.6, 0.04, 11.4]} />
        </mesh>
        {/* Upper gallery minimalist daybed / bench */}
        <group position={[1.5, -1.45, 3.2]}>
          <mesh material={materials.darkTimber}>
            <boxGeometry args={[2.8, 0.18, 0.9]} />
          </mesh>
          <mesh position={[0, 0.14, 0]} material={materials.fabric}>
            <boxGeometry args={[2.7, 0.12, 0.84]} />
          </mesh>
        </group>
        {/* Linear ceiling lighting inside upper pavilion */}
        <mesh position={[0, 1.7, 0]} material={materials.lightStrip}>
          <boxGeometry args={[12.0, 0.02, 0.08]} />
        </mesh>
        {/* Rear North wall of upper level */}
        <mesh position={[0, 0, -5.7]} material={materials.concreteDark}>
          <boxGeometry args={[14.8, 3.48, 0.28]} />
        </mesh>

        {/* South Curtain Wall Glazing */}
        <mesh position={[0, 0, 5.82]} material={materials.glass}>
          <boxGeometry args={[14.6, 3.3, 0.04]} />
        </mesh>
        {/* Metal perimeter frame */}
        <mesh position={[0, -1.64, 5.82]} material={materials.metalDark}>
          <boxGeometry args={[14.7, 0.08, 0.14]} />
        </mesh>
        <mesh position={[0, 1.64, 5.82]} material={materials.metalDark}>
          <boxGeometry args={[14.7, 0.08, 0.14]} />
        </mesh>
        {/* Vertical mullions */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh
            key={`upper-mullion-${i}`}
            position={[-6.2 + i * 1.55, 0, 5.84]}
            material={materials.metalDark}
          >
            <boxGeometry args={[0.07, 3.3, 0.14]} />
          </mesh>
        ))}

        {/* East Gable Full-Height Glazing */}
        <mesh position={[7.32, 0, 0]} material={materials.glass}>
          <boxGeometry args={[0.04, 3.3, 11.4]} />
        </mesh>
        {/* East gable mullions */}
        {[-3.6, 0, 3.6].map((ez) => (
          <mesh key={`east-mullion-${ez}`} position={[7.34, 0, ez]} material={materials.metalDark}>
            <boxGeometry args={[0.12, 3.3, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* ================================================================== */}
      {/* 7. VERTICAL FACADE FINS / LOUVRES WITH STRUCTURAL MOUNTING BRACKETS */}
      {/* ================================================================== */}

      {/* Continuous top and bottom steel mounting rails anchoring fins */}
      {high && (
        <>
          <mesh position={[5.45, 7.42, 7.3]} material={materials.metalDark}>
            <boxGeometry args={[14.4, 0.06, 0.2]} />
          </mesh>
          <mesh position={[5.45, 4.08, 7.3]} material={materials.metalDark}>
            <boxGeometry args={[14.4, 0.06, 0.2]} />
          </mesh>
        </>
      )}

      {/* Vertical natural teak facade fins */}
      {louvres.map((x, i) => (
        <group key={`fin-unit-${i}`} position={[x, 5.75, 7.3]}>
          {/* Main teak blade with realistic architectural depth */}
          <mesh castShadow={shadow} receiveShadow={shadow} material={materials.timber}>
            <boxGeometry args={[0.085, 3.3, 0.36]} />
          </mesh>
          {/* Top blackened steel bracket */}
          <mesh position={[0, 1.63, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.1, 0.06, 0.12]} />
          </mesh>
          {/* Bottom blackened steel bracket */}
          <mesh position={[0, -1.63, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.1, 0.06, 0.12]} />
          </mesh>
        </group>
      ))}

      {/* Slender Structural Columns supporting the Cantilever */}
      {[-11.4, -5.6, 0.6, 6.6, 12].map((x) => (
        <group key={`column-${x}`} position={[x, 5.75, 7.9]}>
          <mesh castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
            <boxGeometry args={[0.26, 3.48, 0.26]} />
          </mesh>
          {/* Column capital shadow reveal */}
          <mesh position={[0, 1.72, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
          </mesh>
          {/* Column base reveal */}
          <mesh position={[0, -1.72, 0]} material={materials.metalDark}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
          </mesh>
        </group>
      ))}

      {/* ================================================================== */}
      {/* 8. EXPANSIVE ROOF CANTILEVER (y = 7.7)                              */}
      {/* ================================================================== */}
      <group position={[0, 7.7, 0]}>
        {/* Main roof slab */}
        <mesh castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
          <boxGeometry args={[27.0, 0.42, 17.0]} />
        </mesh>
        {/* Perimeter edge fascia reveal */}
        <mesh position={[0, -0.2, 0]} material={materials.concreteDark}>
          <boxGeometry args={[26.8, 0.04, 16.8]} />
        </mesh>
        {/* Underside soffit lining with architectural downlights */}
        <mesh position={[0, -0.22, 0]} material={materials.plaster}>
          <boxGeometry args={[26.4, 0.02, 16.4]} />
        </mesh>
        {/* Soffit exterior downlights */}
        {[-10, -5, 0, 5, 10].map((dx) => (
          <mesh key={`roof-light-${dx}`} position={[dx, -0.23, 7.6]} material={materials.lightStrip}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 14]} />
          </mesh>
        ))}
      </group>

      {/* ================================================================== */}
      {/* 9. ENTRANCE APPROACH & WALKWAY                                      */}
      {/* ================================================================== */}

      {/* Entrance stepping stone pavers leading to front door at x = -1.4 */}
      <group position={[-1.4, 0.2, 8.6]}>
        <mesh castShadow={shadow} receiveShadow={shadow} material={materials.paving}>
          <boxGeometry args={[4.4, 0.12, 4.8]} />
        </mesh>
        {/* Inset border detail */}
        <mesh position={[0, 0.065, 0]} material={materials.metalDark}>
          <boxGeometry args={[4.3, 0.01, 4.7]} />
        </mesh>
      </group>

      {/* Floating approach stepping stones */}
      {[-1.4].map((px) => (
        <group key={`stepping-stone-${px}`} position={[px, 0.14, 12.0]}>
          <mesh castShadow={shadow} receiveShadow={shadow} material={materials.paving}>
            <boxGeometry args={[3.2, 0.1, 1.4]} />
          </mesh>
        </group>
      ))}

      {/* ================================================================== */}
      {/* 10. ARCHITECTURAL REFLECTING POOL                                  */}
      {/* ================================================================== */}
      {high && (
        <group position={[2.0, 0, 15.0]}>
          {/* Dark stone pool basin liner */}
          <mesh position={[0, 0.01, 0]} material={materials.floorKota}>
            <boxGeometry args={[22.2, 0.06, 9.2]} />
          </mesh>
          {/* Water surface with realistic reflection & refraction */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.07, 0]}
            material={materials.water}
          >
            <planeGeometry args={[22.0, 9.0]} />
          </mesh>
          {/* Paved coping curb surrounding pool */}
          {/* Front coping */}
          <mesh position={[0, 0.1, 4.6]} receiveShadow={shadow} material={materials.paving}>
            <boxGeometry args={[22.8, 0.18, 0.44]} />
          </mesh>
          {/* Back coping */}
          <mesh position={[0, 0.1, -4.6]} receiveShadow={shadow} material={materials.paving}>
            <boxGeometry args={[22.8, 0.18, 0.44]} />
          </mesh>
          {/* Left coping */}
          <mesh position={[-11.2, 0.1, 0]} receiveShadow={shadow} material={materials.paving}>
            <boxGeometry args={[0.44, 0.18, 9.6]} />
          </mesh>
          {/* Right coping */}
          <mesh position={[11.2, 0.1, 0]} receiveShadow={shadow} material={materials.paving}>
            <boxGeometry args={[0.44, 0.18, 9.6]} />
          </mesh>
        </group>
      )}

      {/* ================================================================== */}
      {/* 11. REFINED MINIMALIST LANDSCAPING                                 */}
      {/* ================================================================== */}

      {/* Low linear concrete planter beds flanking the entrance approach */}
      {high &&
        [-8.8, 8.8].map((bx) => (
          <group key={`planter-bed-${bx}`} position={[bx, 0.35, 10.5]}>
            {/* Concrete planter box */}
            <mesh castShadow={shadow} receiveShadow={shadow} material={materials.concrete}>
              <boxGeometry args={[6.8, 0.45, 2.2]} />
            </mesh>
            {/* Dark soil filling */}
            <mesh position={[0, 0.22, 0]} material={materials.concreteDark}>
              <boxGeometry args={[6.4, 0.04, 1.8]} />
            </mesh>
            {/* Low manicured hedge / shrubs */}
            <mesh position={[0, 0.4, 0]} castShadow={shadow} material={materials.foliageDark}>
              <boxGeometry args={[6.2, 0.36, 1.6]} />
            </mesh>
          </group>
        ))}

      {/* Sculptural trees around the villa perimeter */}
      {high &&
        [
          { pos: [-17, 11], scale: 1.15, rot: 0.2 },
          { pos: [17, 9], scale: 1.05, rot: -0.4 },
          { pos: [-15, -8], scale: 1.25, rot: 0.8 },
          { pos: [20, -5], scale: 1.1, rot: -0.6 },
          { pos: [-21, 2], scale: 0.95, rot: 0.3 },
        ].map(({ pos, scale, rot }, i) => (
          <group key={`sculptural-tree-${i}`} position={[pos[0], 0, pos[1]]} rotation={[0, rot, 0]}>
            {/* Main trunk */}
            <mesh position={[0, 1.6 * scale, 0]} castShadow={shadow} material={materials.treeTrunk}>
              <cylinderGeometry args={[0.11 * scale, 0.18 * scale, 3.2 * scale, 8]} />
            </mesh>
            {/* Branching fork */}
            <mesh position={[0.2 * scale, 3.0 * scale, 0.1 * scale]} rotation={[0.2, 0, 0.3]} castShadow={shadow} material={materials.treeTrunk}>
              <cylinderGeometry args={[0.07 * scale, 0.1 * scale, 1.4 * scale, 6]} />
            </mesh>
            <mesh position={[-0.2 * scale, 2.9 * scale, -0.1 * scale]} rotation={[-0.2, 0, -0.3]} castShadow={shadow} material={materials.treeTrunk}>
              <cylinderGeometry args={[0.07 * scale, 0.1 * scale, 1.2 * scale, 6]} />
            </mesh>
            {/* Layered foliage canopies */}
            <mesh position={[0, 4.0 * scale, 0]} castShadow={shadow} material={materials.foliageMid}>
              <icosahedronGeometry args={[1.65 * scale, 1]} />
            </mesh>
            <mesh position={[0.7 * scale, 3.5 * scale, 0.4 * scale]} castShadow={shadow} material={materials.foliageLight}>
              <icosahedronGeometry args={[1.1 * scale, 1]} />
            </mesh>
            <mesh position={[-0.6 * scale, 3.3 * scale, -0.3 * scale]} castShadow={shadow} material={materials.foliageDark}>
              <icosahedronGeometry args={[1.0 * scale, 1]} />
            </mesh>
          </group>
        ))}
    </group>
  );
}
