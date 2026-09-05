"use client";

import { useMemo } from "react";
import {
  paintedWall,
  concreteSoffit,
  screedFloor,
  oak,
  walnut,
  darkStone,
  travertine,
  charcoalMetal,
  bronze,
  linen,
  woolRug,
  architecturalGlass,
  glassLite,
  downlightEmissive,
  pendantEmissive,
  coveEmissive,
  acousticFelt,
  terracotta,
  mutedOlive,
  displayScreen,
} from "@/lib/materials";
import { createWallMesh } from "@/lib/arch";
import { Furniture } from "./Furniture";

interface OfficeInteriorProps {
  quality?: "high" | "low";
  castShadows?: boolean;
}

/**
 * JOYFIRST Office Interior Architecture.
 * Ring corridor circulation wrapping double-height central atrium.
 * Incorporates 10 distinct zones (A through J) and 15 precision voids (O1 - O15).
 * Merged colliders are registered on Layer 2 for zero-clipping path validation.
 */
export function OfficeInterior({
  quality: _quality = "high",
  castShadows = true,
}: OfficeInteriorProps) {
  const shadow = castShadows;

  // Build the complete floor plan walls with openings O1 through O15
  const wallMeshes = useMemo(() => {
    // 1. Zone C (Reception) & Corridor South Leg dividing wall (z = 3.60)
    // Wall from x = -4.8 to 2.0 (length 6.8m)
    // Opening O2 at x = 0.60, width 2.40m x 2.40m
    const wallCorridorSouth = createWallMesh(
      [
        {
          a: [-4.8, 3.60],
          b: [2.0, 3.60],
          opts: {
            height: 3.0,
            thickness: 0.12,
            openings: [
              {
                offset: 0.60 - (-4.8) - 1.20, // 4.20m
                width: 2.40,
                height: 2.40,
              },
            ],
          },
        },
      ],
      "wall_corridor_south"
    );

    // 2. Zone D (Workspace) & Corridor East Leg dividing wall (x = 4.80)
    // Wall from z = 3.60 to -3.60 (length 7.2m)
    // Opening O3 at z = 2.0 (width 3.60m x 2.40m)
    // Opening O5 at z = -2.60 (width 2.40m x 2.40m)
    const wallCorridorEast = createWallMesh(
      [
        {
          a: [4.80, 3.60],
          b: [4.80, -3.60],
          opts: {
            height: 3.0,
            thickness: 0.12,
            openings: [
              // O3: center at z = 2.0 -> offset = 3.60 - 2.0 - 1.80 = -0.20 -> clamped to 0..3.4m
              {
                offset: 3.60 - 2.0 - 1.80 + 1.80, // centered at z = 2.0
                width: 3.60,
                height: 2.40,
              },
              // O5: center at z = -2.60 -> offset = 3.60 - (-2.60) - 1.20 = 5.0m
              {
                offset: 5.00,
                width: 2.40,
                height: 2.40,
              },
            ],
          },
        },
      ],
      "wall_corridor_east"
    );

    // 3. Zone F (Meeting Room) & Zone G (Executive) North Corridor Wall (z = -3.60)
    // Meeting room F south wall: x = 0.40 to 4.80 with Door O6 (x = 3.60) and Door O7 (x = 1.20)
    // Executive office G south wall: x = -4.40 to 0.40 with Door O8 (x = -1.00) and Exit O9 (x = -3.60)
    const wallCorridorNorth = createWallMesh(
      [
        {
          a: [0.40, -3.60],
          b: [4.80, -3.60],
          opts: {
            height: 3.0,
            thickness: 0.12,
            openings: [
              // O7: center at x = 1.20 -> offset = 1.20 - 0.40 - 0.475 = 0.325m
              { offset: 0.325, width: 0.95, height: 2.10 },
              // O6: center at x = 3.60 -> offset = 3.60 - 0.40 - 0.475 = 2.725m
              { offset: 2.725, width: 0.95, height: 2.10 },
            ],
          },
        },
        {
          a: [-4.40, -3.60],
          b: [0.40, -3.60],
          opts: {
            height: 3.0,
            thickness: 0.12,
            openings: [
              // O9: center at x = -3.60 -> offset = -3.60 - (-4.40) - 0.475 = 0.325m
              { offset: 0.325, width: 0.95, height: 2.10 },
              // O8: center at x = -1.00 -> offset = -1.00 - (-4.40) - 0.475 = 2.925m
              { offset: 2.925, width: 0.95, height: 2.10 },
            ],
          },
        },
      ],
      "wall_corridor_north"
    );

    // 4. Zone B (West Corridor Leg) Outer Wall (x = -4.80)
    // Dividing West Corridor from H (Design Studio), I (Pantry), J (Lounge)
    // O10 at z = -3.0 (width 2.40 x 2.40)
    // O11/O12 open pantry zone between z = -1.2 and 1.4
    // O13 at z = 2.60 (width 2.40 x 2.40)
    const wallCorridorWest = createWallMesh(
      [
        {
          a: [-4.80, -3.60],
          b: [-4.80, 3.60],
          opts: {
            height: 3.0,
            thickness: 0.12,
            openings: [
              // O10 at z = -3.0
              { offset: -3.0 - (-3.60) - 0.8, width: 2.40, height: 2.40 },
              // O11/O12 Pantry opening (z = -1.2 to 1.4)
              { offset: -1.2 - (-3.60), width: 2.60, height: 2.60 },
              // O13 at z = 2.60
              { offset: 2.60 - (-3.60) - 1.20, width: 2.40, height: 2.40 },
            ],
          },
        },
      ],
      "wall_corridor_west"
    );

    // 5. Zone A (Central Atrium) Inner Enclosure Walls
    // Atrium core: x in [-2.6, 2.6], z in [-1.4, 1.4]
    // West wall (x = -2.60): O14 at z = 0.0 (3.20m wide x 3.00m high)
    // South wall (z = 1.40): O15 at x = 0.0 (3.20m wide x 3.00m high)
    const wallAtriumCore = createWallMesh(
      [
        // West face
        {
          a: [-2.60, -1.40],
          b: [-2.60, 1.40],
          opts: {
            height: 6.4,
            thickness: 0.12,
            openings: [
              // O14 at z = 0.0, width 3.20 -> full opening
              { offset: 0, width: 2.80, height: 3.00 },
            ],
          },
        },
        // South face
        {
          a: [-2.60, 1.40],
          b: [2.60, 1.40],
          opts: {
            height: 6.4,
            thickness: 0.12,
            openings: [
              // O15 at x = 0.0, width 3.20
              { offset: 2.60 - 1.60, width: 3.20, height: 3.00 },
            ],
          },
        },
        // North face
        {
          a: [-2.60, -1.40],
          b: [2.60, -1.40],
          opts: { height: 6.4, thickness: 0.12, openings: [] },
        },
        // East face (glazed void)
        {
          a: [2.60, -1.40],
          b: [2.60, 1.40],
          opts: {
            height: 6.4,
            thickness: 0.12,
            openings: [{ offset: 0.2, width: 2.40, height: 3.00 }],
          },
        },
      ],
      "wall_atrium_core"
    );

    // 6. Partition dividing Meeting Room F and Executive G (x = 0.40, z = -5.6 to -3.60)
    const wallMeetingExec = createWallMesh(
      [
        {
          a: [0.40, -5.60],
          b: [0.40, -3.60],
          opts: { height: 3.0, thickness: 0.12, openings: [] },
        },
      ],
      "wall_meeting_exec"
    );

    // 7. Partition dividing Executive G and Design Studio H (x = -4.40, z = -5.6 to -3.60)
    const wallExecStudio = createWallMesh(
      [
        {
          a: [-4.40, -5.60],
          b: [-4.40, -3.60],
          opts: { height: 3.0, thickness: 0.12, openings: [] },
        },
      ],
      "wall_exec_studio"
    );

    // 8. Solid Partition dividing Reception C and Lounge J (x = -4.80, z = 3.60 to 5.80)
    const wallReceptionLounge = createWallMesh(
      [
        {
          a: [-4.80, 3.60],
          b: [-4.80, 5.80],
          opts: { height: 3.0, thickness: 0.12, openings: [] },
        },
      ],
      "wall_reception_lounge"
    );

    return [
      wallCorridorSouth,
      wallCorridorEast,
      wallCorridorNorth,
      wallCorridorWest,
      wallAtriumCore,
      wallMeetingExec,
      wallExecStudio,
      wallReceptionLounge,
    ];
  }, []);

  return (
    <group name="joyfirst_office_interior" position={[0, 0, 0]}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. FLOOR PLAN BASE SLAB (Micro-cement / Screed Finish)              */}
      {/* ------------------------------------------------------------------ */}
      <mesh
        position={[0, -0.005, 0]}
        receiveShadow={shadow}
        material={screedFloor}
      >
        <boxGeometry args={[19.6, 0.01, 11.6]} />
      </mesh>

      {/* Travertine Floor Plate inside Atrium Core (Zone A) */}
      <mesh position={[0, 0.002, 0]} receiveShadow={shadow} material={travertine}>
        <boxGeometry args={[5.2, 0.005, 2.8]} />
      </mesh>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MERGED ARCHITECTURAL WALL MESHES (Layer 2 Colliders)             */}
      {/* ------------------------------------------------------------------ */}
      {wallMeshes.map((mesh, i) => (
        <primitive key={`wall-group-${i}`} object={mesh} />
      ))}

      {/* ------------------------------------------------------------------ */}
      {/* 3. CEILING SYSTEMS PER ZONE (§4.3)                                 */}
      {/* ------------------------------------------------------------------ */}

      {/* Zone B: Corridor continuous 2.70m soffit with recessed slot */}
      <group position={[0, 2.70, 0]}>
        {/* South corridor leg ceiling */}
        <mesh position={[0, 0.02, 2.5]} material={paintedWall}>
          <boxGeometry args={[9.6, 0.04, 2.2]} />
        </mesh>
        {/* Recessed continuous linear light slot in corridor ceiling */}
        <mesh position={[0, -0.001, 2.5]} material={coveEmissive}>
          <boxGeometry args={[9.4, 0.002, 0.06]} />
        </mesh>
        {/* North corridor leg ceiling */}
        <mesh position={[0, 0.02, -2.5]} material={paintedWall}>
          <boxGeometry args={[9.6, 0.04, 2.2]} />
        </mesh>
        <mesh position={[0, -0.001, -2.5]} material={coveEmissive}>
          <boxGeometry args={[9.4, 0.002, 0.06]} />
        </mesh>
        {/* West corridor leg ceiling */}
        <mesh position={[-3.7, 0.02, 0]} material={paintedWall}>
          <boxGeometry args={[2.2, 0.04, 2.8]} />
        </mesh>
        {/* East corridor leg ceiling */}
        <mesh position={[3.7, 0.02, 0]} material={paintedWall}>
          <boxGeometry args={[2.2, 0.04, 2.8]} />
        </mesh>
      </group>

      {/* Zone C: Reception plasterboard raft with 0.15m drop & perimeter cove */}
      <group position={[-1.4, 2.85, 4.7]}>
        <mesh material={paintedWall} receiveShadow={shadow}>
          <boxGeometry args={[6.4, 0.12, 1.9]} />
        </mesh>
        {/* Perimeter cove uplight strips */}
        <mesh position={[0, 0.06, 0.98]} material={coveEmissive}>
          <boxGeometry args={[6.3, 0.015, 0.03]} />
        </mesh>
        <mesh position={[0, 0.06, -0.98]} material={coveEmissive}>
          <boxGeometry args={[6.3, 0.015, 0.03]} />
        </mesh>
      </group>

      {/* Zone D: Workspace exposed concrete slab at y = 3.00 with downstand beams */}
      <group position={[7.2, 3.00, 2.3]}>
        <mesh material={concreteSoffit} receiveShadow={shadow}>
          <boxGeometry args={[4.8, 0.06, 6.6]} />
        </mesh>
        {/* 40mm downstand structural concrete beams on 3.2m grid */}
        {[-1.6, 1.6].map((bx) => (
          <mesh key={`beam-ws-${bx}`} position={[bx, -0.04, 0]} material={concreteSoffit}>
            <boxGeometry args={[0.22, 0.08, 6.6]} />
          </mesh>
        ))}
      </group>

      {/* Zone E: Collaboration suspended oak slat raft (3.2m x 2.4m) */}
      <group position={[7.2, 2.82, -3.3]}>
        {Array.from({ length: 26 }).map((_, i) => (
          <mesh
            key={`collab-slat-${i}`}
            position={[-1.5 + i * 0.12, 0, 0]}
            material={oak}
          >
            <boxGeometry args={[0.04, 0.10, 2.4]} />
          </mesh>
        ))}
      </group>

      {/* Zone F: Meeting Room flush plaster ceiling with downlights */}
      <group position={[2.6, 3.00, -4.6]}>
        <mesh material={paintedWall}>
          <boxGeometry args={[4.4, 0.04, 2.0]} />
        </mesh>
        {/* 4 recessed downlight discs */}
        {[
          [-1.2, -0.5],
          [1.2, -0.5],
          [-1.2, 0.5],
          [1.2, 0.5],
        ].map(([dx, dz], i) => (
          <mesh key={`meet-dl-${i}`} position={[dx, -0.021, dz]} material={downlightEmissive}>
            <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
          </mesh>
        ))}
      </group>

      {/* Zone G: Executive perimeter cove ceiling */}
      <group position={[-2.0, 2.92, -4.6]}>
        <mesh material={paintedWall}>
          <boxGeometry args={[4.6, 0.08, 2.0]} />
        </mesh>
        {/* Perimeter warm cove light */}
        <mesh position={[0, 0.04, 0.95]} material={coveEmissive}>
          <boxGeometry args={[4.5, 0.01, 0.02]} />
        </mesh>
        <mesh position={[0, 0.04, -0.95]} material={coveEmissive}>
          <boxGeometry args={[4.5, 0.01, 0.02]} />
        </mesh>
      </group>

      {/* Zone H: Design Studio exposed slab ceiling */}
      <group position={[-7.2, 3.00, -3.4]}>
        <mesh material={concreteSoffit}>
          <boxGeometry args={[4.8, 0.06, 4.4]} />
        </mesh>
        {/* Surface-mounted metal track */}
        <mesh position={[0, -0.04, 0]} material={charcoalMetal}>
          <boxGeometry args={[4.2, 0.03, 0.04]} />
        </mesh>
      </group>

      {/* Zone I: Pantry ceiling */}
      <group position={[-7.2, 3.00, 0.1]}>
        <mesh material={paintedWall}>
          <boxGeometry args={[4.8, 0.04, 2.6]} />
        </mesh>
      </group>

      {/* Zone J: Lounge plaster ceiling (no downlights) */}
      <group position={[-7.2, 3.00, 3.5]}>
        <mesh material={paintedWall}>
          <boxGeometry args={[4.8, 0.04, 4.2]} />
        </mesh>
      </group>

      {/* Zone A: Atrium roof light (4.0m x 2.4m at y = 6.40 with deep 0.6m reveal) */}
      <group position={[0, 6.40, 0]}>
        {/* Roof ceiling slab */}
        <mesh position={[0, 0.1, 0]} material={paintedWall}>
          <boxGeometry args={[5.6, 0.2, 3.6]} />
        </mesh>
        {/* 0.6m deep rooflight reveal */}
        <mesh position={[0, -0.3, 1.25]} material={paintedWall}>
          <boxGeometry args={[4.2, 0.6, 0.1]} />
        </mesh>
        <mesh position={[0, -0.3, -1.25]} material={paintedWall}>
          <boxGeometry args={[4.2, 0.6, 0.1]} />
        </mesh>
        <mesh position={[2.05, -0.3, 0]} material={paintedWall}>
          <boxGeometry args={[0.1, 0.6, 2.4]} />
        </mesh>
        <mesh position={[-2.05, -0.3, 0]} material={paintedWall}>
          <boxGeometry args={[0.1, 0.6, 2.4]} />
        </mesh>
        {/* Architectural rooflight glass */}
        <mesh position={[0, 0.05, 0]} material={architecturalGlass}>
          <boxGeometry args={[4.0, 0.02, 2.4]} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------ */}
      {/* 4. ROOM FIT-OUTS & BESPOKE ELEMENTS (§9)                           */}
      {/* ------------------------------------------------------------------ */}

      {/* ZONE C: RECEPTION */}
      <group position={[-1.4, 0, 4.5]}>
        {/* Curved 4.2m monolithic counter: honed dark stone top & fluted oak front */}
        <group position={[-0.6, 0, -0.4]}>
          <mesh position={[0, 0.55, 0]} castShadow={shadow} receiveShadow={shadow} material={darkStone}>
            <boxGeometry args={[4.2, 1.10, 0.85]} />
          </mesh>
          {/* Fluted oak vertical ribs on counter front */}
          {Array.from({ length: 36 }).map((_, i) => (
            <mesh key={`counter-flute-${i}`} position={[-1.95 + i * 0.11, 0.52, 0.44]} material={oak}>
              <boxGeometry args={[0.045, 1.04, 0.02]} />
            </mesh>
          ))}
        </group>

        {/* Backdrop: full-height oak slat wall with JOYFIRST bronze crest */}
        <group position={[-3.35, 1.5, 0]}>
          <mesh material={walnut}>
            <boxGeometry args={[0.06, 3.0, 2.4]} />
          </mesh>
          {Array.from({ length: 18 }).map((_, i) => (
            <mesh key={`rec-slat-${i}`} position={[0.05, 0, -1.0 + i * 0.12]} material={oak}>
              <boxGeometry args={[0.04, 2.96, 0.06]} />
            </mesh>
          ))}
          {/* Brushed bronze JOYFIRST logo plaque */}
          <mesh position={[0.08, 0.3, 0]} rotation={[0, Math.PI / 2, 0]} material={bronze}>
            <boxGeometry args={[1.2, 0.55, 0.02]} />
          </mesh>
        </group>

        {/* 2.4 x 1.6m wool rug */}
        <mesh position={[1.4, 0.005, -0.2]} receiveShadow={shadow} material={woolRug}>
          <boxGeometry args={[2.4, 0.008, 1.6]} />
        </mesh>
      </group>

      {/* ZONE D: OPEN WORKSPACE */}
      <group position={[7.2, 0, 2.3]}>
        {/* Three benches of 6 desks (2x3 facing), oak tops with white steel frames */}
        {[-1.8, 0, 1.8].map((bz) => (
          <group key={`desk-bench-${bz}`} position={[0, 0, bz]}>
            {/* 3.2m x 1.4m desk surface */}
            <mesh position={[0, 0.74, 0]} castShadow={shadow} receiveShadow={shadow} material={oak}>
              <boxGeometry args={[3.2, 0.035, 1.4]} />
            </mesh>
            {/* White steel trestle legs */}
            {[-1.5, 1.5].map((lx) => (
              <mesh key={`desk-leg-${lx}`} position={[lx, 0.36, 0]} material={paintedWall}>
                <boxGeometry args={[0.06, 0.72, 1.36]} />
              </mesh>
            ))}
            {/* Suspended 1.8m linear pendant above each desk bench */}
            <group position={[0, 2.35, 0]}>
              <mesh material={charcoalMetal}>
                <boxGeometry args={[1.8, 0.05, 0.06]} />
              </mesh>
              <mesh position={[0, -0.026, 0]} material={pendantEmissive}>
                <boxGeometry args={[1.76, 0.01, 0.05]} />
              </mesh>
            </group>

            {/* Architectural divider plinth box at bench end */}
            <group position={[1.75, 0, 0]}>
              <mesh position={[0, 0.40, 0]} castShadow={shadow} material={charcoalMetal}>
                <boxGeometry args={[0.30, 0.80, 1.4]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* ZONE E: COLLABORATION */}
      <group position={[7.2, 0, -3.3]}>
        {/* 3.6m x 1.1m solid oak communal table */}
        <mesh position={[0, 0.74, 0]} castShadow={shadow} receiveShadow={shadow} material={oak}>
          <boxGeometry args={[3.6, 0.05, 1.1]} />
        </mesh>
        {[-1.6, 1.6].map((tx) => (
          <mesh key={`collab-leg-${tx}`} position={[tx, 0.36, 0]} material={oak}>
            <boxGeometry args={[0.10, 0.72, 0.95]} />
          </mesh>
        ))}

        {/* Pinned drawing wall on North perimeter with 6 A1 sheets */}
        <group position={[0, 1.65, -2.25]}>
          <mesh material={paintedWall}>
            <boxGeometry args={[4.2, 2.2, 0.02]} />
          </mesh>
          {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((dx, i) => (
            <mesh
              key={`drawing-pin-${i}`}
              position={[dx, i % 2 ? 0.1 : -0.1, 0.015]}
              rotation={[0, 0, (i - 2.5) * 0.03]}
              material={paintedWall}
            >
              <planeGeometry args={[0.55, 0.78]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ZONE F: GLASS MEETING ROOM */}
      <group position={[2.6, 0, -4.6]}>
        {/* Glazed south wall with charcoal mullions and transom onto corridor */}
        <group position={[0, 1.5, 1.0]}>
          {/* Glass panels */}
          <mesh material={architecturalGlass}>
            <boxGeometry args={[4.4, 3.0, 0.012]} />
          </mesh>
          {/* Charcoal perimeter frames */}
          <mesh position={[0, 1.48, 0]} material={charcoalMetal}>
            <boxGeometry args={[4.44, 0.04, 0.06]} />
          </mesh>
          <mesh position={[0, -1.48, 0]} material={charcoalMetal}>
            <boxGeometry args={[4.44, 0.04, 0.06]} />
          </mesh>
          {/* Mullions at 1.2m centres */}
          {[-1.8, -0.6, 0.6, 1.8].map((mx) => (
            <mesh key={`meet-mullion-${mx}`} position={[mx, 0, 0]} material={charcoalMetal}>
              <boxGeometry args={[0.04, 3.0, 0.06]} />
            </mesh>
          ))}
          {/* Transom bar at 1.05m */}
          <mesh position={[0, -0.45, 0]} material={charcoalMetal}>
            <boxGeometry args={[4.4, 0.025, 0.05]} />
          </mesh>
        </group>

        {/* 3.6m conference table */}
        <mesh position={[0, 0.74, 0]} castShadow={shadow} receiveShadow={shadow} material={darkStone}>
          <boxGeometry args={[3.6, 0.04, 1.2]} />
        </mesh>
        {[-1.4, 1.4].map((tx) => (
          <mesh key={`conf-leg-${tx}`} position={[tx, 0.36, 0]} material={bronze}>
            <cylinderGeometry args={[0.08, 0.12, 0.72, 16]} />
          </mesh>
        ))}

        {/* 3.0m Linear pendant over conference table */}
        <group position={[0, 2.4, 0]}>
          <mesh material={charcoalMetal}>
            <boxGeometry args={[3.0, 0.05, 0.06]} />
          </mesh>
          <mesh position={[0, -0.026, 0]} material={pendantEmissive}>
            <boxGeometry args={[2.96, 0.01, 0.05]} />
          </mesh>
        </group>

        {/* 75" Display Screen on Acoustic Felt Wall Panel */}
        <group position={[-2.15, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={acousticFelt}>
            <boxGeometry args={[1.9, 2.2, 0.03]} />
          </mesh>
          {/* 75" display */}
          <mesh position={[0, 0.1, 0.02]} material={displayScreen}>
            <boxGeometry args={[1.65, 0.95, 0.02]} />
          </mesh>
        </group>
      </group>

      {/* ZONE G: EXECUTIVE OFFICE */}
      <group position={[-2.0, 0, -4.6]}>
        {/* Full-height dark walnut wall panelling with 6mm shadow gaps */}
        <group position={[0, 1.5, -0.96]}>
          <mesh material={walnut}>
            <boxGeometry args={[4.6, 3.0, 0.04]} />
          </mesh>
          {/* 6mm shadow gaps every 0.6m */}
          {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((gx) => (
            <mesh key={`exec-gap-${gx}`} position={[gx, 0, 0.022]} material={charcoalMetal}>
              <boxGeometry args={[0.006, 3.0, 0.005]} />
            </mesh>
          ))}
        </group>

        {/* 2.0m x 0.9m Executive desk in dark walnut with leather blotter */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.74, 0]} castShadow={shadow} receiveShadow={shadow} material={walnut}>
            <boxGeometry args={[2.0, 0.05, 0.9]} />
          </mesh>
          {[-0.9, 0.9].map((dx) => (
            <mesh key={`exec-desk-leg-${dx}`} position={[dx, 0.36, 0]} material={walnut}>
              <boxGeometry args={[0.06, 0.72, 0.84]} />
            </mesh>
          ))}
          {/* Leather desk blotter */}
          <mesh position={[0, 0.766, 0]} material={charcoalMetal}>
            <boxGeometry args={[0.8, 0.005, 0.5]} />
          </mesh>
        </group>

        {/* Walnut bookshelf with varied depth books */}
        <group position={[2.15, 1.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh material={walnut}>
            <boxGeometry args={[1.6, 2.4, 0.32]} />
          </mesh>
          {/* Varied books */}
          {[-0.5, 0, 0.5].map((sy) => (
            <group key={`shelf-${sy}`} position={[0, sy, 0.1]}>
              <mesh position={[-0.4, 0.1, 0]} material={terracotta}>
                <boxGeometry args={[0.18, 0.22, 0.22]} />
              </mesh>
              <mesh position={[-0.1, 0.12, 0.02]} material={linen}>
                <boxGeometry args={[0.24, 0.26, 0.24]} />
              </mesh>
              <mesh position={[0.3, 0.09, -0.01]} material={mutedOlive}>
                <boxGeometry args={[0.22, 0.20, 0.20]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ZONE H: DESIGN STUDIO */}
      <group position={[-7.2, 0, -3.4]}>
        {/* Two 2.4m x 1.2m worktables */}
        {[-1.1, 1.1].map((wy) => (
          <group key={`studio-table-${wy}`} position={[0, 0, wy]}>
            <mesh position={[0, 0.74, 0]} castShadow={shadow} material={oak}>
              <boxGeometry args={[2.4, 0.04, 1.0]} />
            </mesh>
            {[-1.0, 1.0].map((lx) => (
              <mesh key={`st-leg-${lx}`} position={[lx, 0.36, 0]} material={charcoalMetal}>
                <boxGeometry args={[0.05, 0.72, 0.9]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* 6x8 Material Sample Wall on West Perimeter */}
        <group position={[-2.35, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={paintedWall}>
            <boxGeometry args={[3.2, 2.4, 0.02]} />
          </mesh>
          {/* Instanced 0.2m x 0.2m material tiles */}
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => {
              const materialsCycle = [
                darkStone,
                oak,
                walnut,
                terracotta,
                mutedOlive,
                travertine,
                charcoalMetal,
                bronze,
              ];
              const mat = materialsCycle[(row * 8 + col) % materialsCycle.length];
              return (
                <mesh
                  key={`tile-${row}-${col}`}
                  position={[-1.4 + col * 0.4, -0.9 + row * 0.36, 0.02]}
                  material={mat}
                >
                  <boxGeometry args={[0.22, 0.22, 0.015]} />
                </mesh>
              );
            })
          )}
        </group>

        {/* Architectural massing models under clear acrylic display */}
        <group position={[1.5, 0.75, 0]}>
          <mesh position={[0, 0.08, 0]} material={oak}>
            <boxGeometry args={[0.35, 0.16, 0.35]} />
          </mesh>
          <mesh position={[0, 0.15, 0]} material={glassLite}>
            <boxGeometry args={[0.42, 0.30, 0.42]} />
          </mesh>
        </group>
      </group>

      {/* ZONE I: PANTRY / COFFEE BAR */}
      <group position={[-7.2, 0, 0.1]}>
        {/* 2.2m x 0.9m Waterfall stone island with oak base */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.90, 0]} castShadow={shadow} receiveShadow={shadow} material={darkStone}>
            <boxGeometry args={[2.2, 0.06, 0.9]} />
          </mesh>
          {/* Waterfall stone leg */}
          <mesh position={[-1.07, 0.45, 0]} material={darkStone}>
            <boxGeometry args={[0.06, 0.90, 0.9]} />
          </mesh>
          {/* Oak cabinetry base */}
          <mesh position={[0.1, 0.42, 0]} material={oak}>
            <boxGeometry args={[2.0, 0.84, 0.84]} />
          </mesh>
          {/* 3 pendants over island */}
          {[-0.6, 0, 0.6].map((px) => (
            <group key={`pantry-pendant-${px}`} position={[px, 2.3, 0]}>
              <mesh material={bronze}>
                <cylinderGeometry args={[0.08, 0.12, 0.18, 16]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={pendantEmissive}>
                <sphereGeometry args={[0.04, 12, 12]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ZONE J: RESIDENTIAL LOUNGE */}
      <group position={[-7.2, 0, 3.5]}>
        {/* 3.0m x 2.0m Textured wool rug */}
        <mesh position={[0, 0.006, 0]} receiveShadow={shadow} material={woolRug}>
          <boxGeometry args={[3.0, 0.008, 2.0]} />
        </mesh>
        {/* Travertine coffee table */}
        <mesh position={[0, 0.18, -0.1]} castShadow={shadow} material={travertine}>
          <boxGeometry args={[1.2, 0.34, 0.65]} />
        </mesh>
      </group>

      {/* ZONE A: ATRIUM (FINALE) */}
      <group position={[0, 0, 0]}>
        {/* Cantilevered oak floating stair treads on west wall */}
        <group position={[-2.55, 0, 0]}>
          {Array.from({ length: 12 }).map((_, i) => {
            const yPos = 0.18 * (i + 1);
            const zPos = -1.0 + i * 0.20;
            return (
              <group key={`stair-tread-${i}`}>
                {/* 0.28m x 1.1m x 0.05m oak tread */}
                <mesh position={[0.55, yPos, zPos]} castShadow={shadow} material={oak}>
                  <boxGeometry args={[1.1, 0.05, 0.28]} />
                </mesh>
                {/* 12mm glass balustrade */}
                <mesh position={[1.10, yPos + 0.45, zPos]} material={architecturalGlass}>
                  <boxGeometry args={[0.012, 0.90, 0.28]} />
                </mesh>
              </group>
            );
          })}
          {/* 50mm oak continuous handrail */}
          <mesh position={[1.10, 1.7, 0.1]} rotation={[0.55, 0, 0]} material={oak}>
            <cylinderGeometry args={[0.025, 0.025, 3.2, 12]} />
          </mesh>
        </group>
      </group>

      {/* 5. REAL 3D FURNITURE FIT-OUT (Addendum A) */}
      <Furniture castShadow={shadow} receiveShadow={shadow} />
    </group>
  );
}
