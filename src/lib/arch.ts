import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { paintedWall } from "./materials";

export interface WallOpening {
  /** Distance from wall start point along the wall axis (metres) */
  offset: number;
  width: number;
  height: number;
  sillHeight?: number;
}

export interface BuildWallOptions {
  height?: number;
  thickness?: number;
  openings?: WallOpening[];
  skirting?: boolean;
  name?: string;
  isCollider?: boolean;
}

/**
 * Builds a parametric architectural wall with real geometric voids and reveals.
 * Composes the wall from solid blocks (left/right jamb segments, below sill, above head),
 * adds jamb reveal returns, and includes skirting broken at openings.
 */
export function buildWallGeometry(
  a: [number, number],
  b: [number, number],
  opts: BuildWallOptions = {}
): THREE.BufferGeometry {
  const height = opts.height ?? 3.0;
  const thickness = opts.thickness ?? 0.12;
  const skirting = opts.skirting ?? true;
  const openings = (opts.openings ?? []).slice().sort((x, y) => x.offset - y.offset);

  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const wallLength = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const geoms: THREE.BufferGeometry[] = [];

  // Helper to create a box aligned with wall coordinate space (origin at a, rotated by angle)
  // localX: 0..wallLength, localY: 0..height, localZ: -thickness/2..+thickness/2
  function addBox(
    localX: number,
    localY: number,
    localZ: number,
    boxW: number,
    boxH: number,
    boxD: number
  ) {
    if (boxW <= 0.001 || boxH <= 0.001 || boxD <= 0.001) return;
    const geom = new THREE.BoxGeometry(boxW, boxH, boxD);
    geom.translate(boxW / 2, boxH / 2, 0); // origin at box minX, minY, centerZ
    geom.translate(localX, localY, localZ);
    geoms.push(geom);
  }

  // Segment wall along length
  let currentX = 0;

  for (const op of openings) {
    const opStart = Math.max(0, op.offset);
    const opWidth = Math.min(op.width, wallLength - opStart);
    const opEnd = opStart + opWidth;
    const sill = op.sillHeight ?? 0;
    const opHeight = op.height;
    const headY = sill + opHeight;

    // 1. Solid segment before opening
    if (opStart > currentX + 0.001) {
      addBox(currentX, 0, 0, opStart - currentX, height, thickness);
      if (skirting) {
        // Skirting on both faces (0.10m high, 0.012m proud)
        const skirtW = opStart - currentX;
        addBox(currentX, 0, thickness / 2 + 0.006, skirtW, 0.10, 0.012);
        addBox(currentX, 0, -thickness / 2 - 0.006, skirtW, 0.10, 0.012);
      }
    }

    // 2. Below sill block
    if (sill > 0.001) {
      addBox(opStart, 0, 0, opWidth, sill, thickness);
      if (skirting) {
        addBox(opStart, 0, thickness / 2 + 0.006, opWidth, 0.10, 0.012);
        addBox(opStart, 0, -thickness / 2 - 0.006, opWidth, 0.10, 0.012);
      }
    }

    // 3. Above head block
    if (height > headY + 0.001) {
      addBox(opStart, headY, 0, opWidth, height - headY, thickness);
    }

    // 4. 0.025m jamb reveal returns on both faces of the opening
    const revealThick = 0.025;
    // Left jamb reveal
    addBox(opStart, sill, 0, revealThick, opHeight, thickness);
    // Right jamb reveal
    addBox(opEnd - revealThick, sill, 0, revealThick, opHeight, thickness);
    // Head reveal underside
    addBox(opStart, headY - revealThick, 0, opWidth, revealThick, thickness);

    currentX = opEnd;
  }

  // Remaining solid segment after last opening
  if (wallLength > currentX + 0.001) {
    const remW = wallLength - currentX;
    addBox(currentX, 0, 0, remW, height, thickness);
    if (skirting) {
      addBox(currentX, 0, thickness / 2 + 0.006, remW, 0.10, 0.012);
      addBox(currentX, 0, -thickness / 2 - 0.006, remW, 0.10, 0.012);
    }
  }

  if (geoms.length === 0) {
    return new THREE.BufferGeometry();
  }

  const merged = BufferGeometryUtils.mergeGeometries(geoms, false);

  // Transform merged geometry from local 2D wall axis to world coordinates
  merged.rotateY(-angle);
  merged.translate(a[0], 0, a[1]);

  return merged;
}

/**
 * Creates a merged wall mesh tagged with colliders on layer 2.
 */
export function createWallMesh(
  walls: { a: [number, number]; b: [number, number]; opts?: BuildWallOptions }[],
  name = "room_walls",
  material = paintedWall
): THREE.Mesh {
  const geometries = walls.map((w) => buildWallGeometry(w.a, w.b, { ...w.opts, name }));
  const validGeoms = geometries.filter((g) => g && g.attributes.position);
  const merged = validGeoms.length > 0
    ? BufferGeometryUtils.mergeGeometries(validGeoms, false)
    : new THREE.BufferGeometry();

  const mesh = new THREE.Mesh(merged, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Collider metadata and Layer 2 assignment for path collision validator (§8)
  mesh.userData.collider = true;
  mesh.layers.enable(0);
  mesh.layers.enable(2);

  return mesh;
}
