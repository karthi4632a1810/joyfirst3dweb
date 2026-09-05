import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Calibrated waypoints with threshold alignments adhering strictly to §5.3 and §5.4
export const WAYPOINTS = [
  { s: 0.00, p: [14.0, 7.5, 26.0], t: [0.0, 3.2, 0.0], name: "Exterior Wide" },
  { s: 0.07, p: [6.5, 4.6, 19.0], t: [-0.8, 3.0, 4.0], name: "Approach" },
  { s: 0.13, p: [0.6, 2.6, 13.5], t: [-1.4, 2.2, 6.0], name: "Walkway" },
  { s: 0.19, p: [-1.4, 1.75, 8.6], t: [-1.4, 1.75, 4.5], name: "Porch" },
  { s: 0.215, p: [-1.4, 1.65, 6.70], t: [-1.4, 1.62, 3.2], name: "O1 Align" },
  { s: 0.24, p: [-1.4, 1.62, 5.80], t: [-1.4, 1.62, 3.0], name: "Door O1" }, // Door O1 threshold
  { s: 0.28, p: [-1.4, 1.62, 4.60], t: [-2.6, 1.60, 3.4], name: "Vestibule" },
  { s: 0.31, p: [-1.2, 1.62, 4.18], t: [-4.2, 1.45, 4.3], name: "Reception Desk" },
  { s: 0.34, p: [-0.5, 1.62, 4.15], t: [1.6, 1.90, 2.2], name: "Reception Pivot" },
  { s: 0.36, p: [0.2, 1.62, 4.10], t: [2.5, 1.75, 2.8], name: "O2 Approach" },
  { s: 0.37, p: [0.60, 1.62, 4.40], t: [3.4, 1.70, 3.0], name: "O2 Pre-threshold" },
  { s: 0.38, p: [0.60, 1.62, 3.60], t: [3.4, 1.70, 3.0], name: "Portal O2" }, // Portal O2
  { s: 0.395, p: [0.60, 1.62, 2.70], t: [3.4, 1.70, 2.7], name: "O2 Square-off" },
  { s: 0.41, p: [3.6, 1.62, 2.70], t: [5.6, 1.60, 2.4], name: "Corridor SE" },
  { s: 0.43, p: [4.1, 1.62, 2.00], t: [6.4, 1.58, 1.6], name: "O3 Align" },
  { s: 0.45, p: [4.80, 1.62, 2.00], t: [7.0, 1.55, 1.2], name: "Portal O3" }, // Portal O3
  { s: 0.49, p: [6.4, 1.62, 1.20], t: [8.2, 1.40, -0.4], name: "Workspace" },
  { s: 0.53, p: [7.1, 1.62, -0.60], t: [7.4, 1.95, -3.2], name: "Workspace Deep" },
  { s: 0.57, p: [7.2, 1.62, -2.40], t: [6.2, 1.85, -4.6], name: "Into Collab" },
  { s: 0.61, p: [6.6, 1.62, -4.00], t: [5.0, 1.30, -5.0], name: "Collab Table" },
  { s: 0.63, p: [5.6, 1.62, -2.60], t: [4.2, 1.58, -3.4], name: "O5 Align" },
  { s: 0.65, p: [4.80, 1.62, -2.60], t: [3.4, 1.60, -4.4], name: "Portal O5" }, // Portal O5
  { s: 0.68, p: [4.0, 1.62, -3.00], t: [2.8, 1.55, -4.8], name: "Corridor N Glass" },
  { s: 0.695, p: [3.60, 1.62, -2.85], t: [3.0, 1.52, -4.8], name: "O6 Align" },
  { s: 0.71, p: [3.60, 1.62, -3.60], t: [2.4, 1.50, -4.9], name: "Door O6" }, // Door O6
  { s: 0.725, p: [3.20, 1.62, -4.30], t: [1.8, 1.40, -4.9], name: "Meeting Entry" },
  { s: 0.74, p: [2.6, 1.62, -4.50], t: [1.2, 1.30, -4.9], name: "Meeting Table" },
  { s: 0.755, p: [1.20, 1.62, -4.35], t: [0.4, 1.50, -3.8], name: "O7 Align" },
  { s: 0.77, p: [1.20, 1.62, -3.60], t: [-0.6, 1.60, -3.2], name: "Door O7" }, // Door O7
  { s: 0.78, p: [0.6, 1.62, -3.00], t: [-1.0, 1.60, -3.8], name: "Corridor N Mid" },
  { s: 0.79, p: [0.0, 1.62, -3.00], t: [-1.2, 1.60, -4.3], name: "Corridor N" },
  { s: 0.80, p: [-1.00, 1.62, -2.85], t: [-1.8, 1.50, -4.6], name: "O8 Align" },
  { s: 0.81, p: [-1.00, 1.62, -3.60], t: [-2.4, 1.45, -4.9], name: "Door O8" }, // Door O8
  { s: 0.83, p: [-1.9, 1.62, -4.40], t: [-3.4, 1.35, -5.0], name: "Executive Desk" },
  { s: 0.84, p: [-3.60, 1.62, -4.35], t: [-4.2, 1.50, -3.6], name: "O9 Align" },
  { s: 0.85, p: [-3.60, 1.62, -3.60], t: [-4.6, 1.60, -3.2], name: "Door O9" }, // Door O9
  { s: 0.86, p: [-4.2, 1.62, -3.00], t: [-5.6, 1.55, -3.4], name: "Corridor NW Corner" },
  { s: 0.87, p: [-4.80, 1.62, -3.00], t: [-6.6, 1.50, -4.2], name: "Portal O10" }, // Portal O10
  { s: 0.89, p: [-6.4, 1.62, -3.20], t: [-8.4, 1.35, -4.4], name: "Design Studio" },
  { s: 0.91, p: [-7.2, 1.62, -1.60], t: [-8.4, 1.25, 0.2], name: "Studio Pantry" },
  { s: 0.93, p: [-7.4, 1.62, 0.20], t: [-8.6, 1.20, 1.6], name: "Pantry Island" },
  { s: 0.95, p: [-7.2, 1.62, 2.20], t: [-8.4, 1.00, 4.0], name: "Lounge" },
  { s: 0.96, p: [-6.4, 1.62, 3.40], t: [-5.0, 1.70, 2.2], name: "Lounge Turn" },
  { s: 0.965, p: [-5.4, 1.62, 2.60], t: [-4.2, 1.75, 2.2], name: "O13 Align" },
  { s: 0.97, p: [-4.80, 1.62, 2.60], t: [-3.2, 2.20, 1.2], name: "Portal O13" }, // Portal O13
  { s: 0.975, p: [-3.40, 1.62, 0.60], t: [-1.4, 2.60, 0.0], name: "O14 Align" },
  { s: 0.98, p: [-2.60, 1.62, 0.60], t: [-0.6, 3.20, -0.2], name: "Portal O14" }, // Portal O14
  { s: 1.00, p: [-0.7, 1.65, 0.90], t: [1.9, 3.90, -1.1], name: "Atrium Finale" }, // Atrium Finale
];

export function sampleTourPosition(scroll) {
  const s = Math.max(0, Math.min(1, scroll));
  let idx = 0;
  while (idx < WAYPOINTS.length - 2 && WAYPOINTS[idx + 1].s <= s) {
    idx++;
  }
  const w0 = WAYPOINTS[Math.max(0, idx - 1)];
  const w1 = WAYPOINTS[idx];
  const w2 = WAYPOINTS[Math.min(WAYPOINTS.length - 1, idx + 1)];
  const w3 = WAYPOINTS[Math.min(WAYPOINTS.length - 1, idx + 2)];

  const span = w2.s - w1.s || 1e-5;
  const localT = Math.max(0, Math.min(1, (s - w1.s) / span));

  function catmullRom1D(p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  return new THREE.Vector3(
    catmullRom1D(w0.p[0], w1.p[0], w2.p[0], w3.p[0], localT),
    catmullRom1D(w0.p[1], w1.p[1], w2.p[1], w3.p[1], localT),
    catmullRom1D(w0.p[2], w1.p[2], w2.p[2], w3.p[2], localT)
  );
}

export function sampleTourTarget(scroll) {
  const s = Math.max(0, Math.min(1, scroll));
  let idx = 0;
  while (idx < WAYPOINTS.length - 2 && WAYPOINTS[idx + 1].s <= s) {
    idx++;
  }
  const w0 = WAYPOINTS[Math.max(0, idx - 1)];
  const w1 = WAYPOINTS[idx];
  const w2 = WAYPOINTS[Math.min(WAYPOINTS.length - 1, idx + 1)];
  const w3 = WAYPOINTS[Math.min(WAYPOINTS.length - 1, idx + 2)];

  const span = w2.s - w1.s || 1e-5;
  const localT = Math.max(0, Math.min(1, (s - w1.s) / span));

  function catmullRom1D(p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }

  return new THREE.Vector3(
    catmullRom1D(w0.t[0], w1.t[0], w2.t[0], w3.t[0], localT),
    catmullRom1D(w0.t[1], w1.t[1], w2.t[1], w3.t[1], localT),
    catmullRom1D(w0.t[2], w1.t[2], w2.t[2], w3.t[2], localT)
  );
}

function buildWallGeometry(a, b, opts = {}) {
  const height = opts.height ?? 3.0;
  const thickness = opts.thickness ?? 0.12;
  const openings = (opts.openings ?? []).slice().sort((x, y) => x.offset - y.offset);

  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const wallLength = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const geoms = [];

  function addBox(localX, localY, localZ, boxW, boxH, boxD) {
    if (boxW <= 0.001 || boxH <= 0.001 || boxD <= 0.001) return;
    const geom = new THREE.BoxGeometry(boxW, boxH, boxD);
    geom.translate(boxW / 2, boxH / 2, 0);
    geom.translate(localX, localY, localZ);
    geoms.push(geom);
  }

  let currentX = 0;
  for (const op of openings) {
    const opStart = Math.max(0, op.offset);
    const opWidth = Math.min(op.width, wallLength - opStart);
    const opEnd = opStart + opWidth;
    const sill = op.sillHeight ?? 0;
    const headY = sill + op.height;

    if (opStart > currentX + 0.001) {
      addBox(currentX, 0, 0, opStart - currentX, height, thickness);
    }
    if (sill > 0.001) {
      addBox(opStart, 0, 0, opWidth, sill, thickness);
    }
    if (height > headY + 0.001) {
      addBox(opStart, headY, 0, opWidth, height - headY, thickness);
    }

    currentX = opEnd;
  }

  if (wallLength > currentX + 0.001) {
    addBox(currentX, 0, 0, wallLength - currentX, height, thickness);
  }

  if (geoms.length === 0) return new THREE.BufferGeometry();
  const merged = BufferGeometryUtils.mergeGeometries(geoms, false);
  merged.rotateY(-angle);
  merged.translate(a[0], 0, a[1]);
  return merged;
}

function createColliders() {
  const colliders = [];

  const wallDefs = [
    // South corridor wall: O2 portal
    { a: [-4.8, 3.60], b: [2.0, 3.60], opts: { height: 3.0, thickness: 0.12, openings: [{ offset: 0.60 - (-4.8) - 1.20, width: 2.40, height: 2.40 }] } },
    // East corridor wall: O3 and O5 portals
    { a: [4.80, 3.60], b: [4.80, -3.60], opts: { height: 3.0, thickness: 0.12, openings: [{ offset: 3.6 - 2.0 - 1.8, width: 3.60, height: 2.40 }, { offset: 3.6 - (-2.6) - 1.2, width: 2.40, height: 2.40 }] } },
    // North meeting room: O7 and O6 doors
    { a: [0.40, -3.60], b: [4.80, -3.60], opts: { height: 3.0, thickness: 0.12, openings: [{ offset: 1.20 - 0.40 - 0.475, width: 0.95, height: 2.10 }, { offset: 3.60 - 0.40 - 0.475, width: 0.95, height: 2.10 }] } },
    // North exec: O9 and O8 doors
    { a: [-4.40, -3.60], b: [0.40, -3.60], opts: { height: 3.0, thickness: 0.12, openings: [{ offset: -3.60 - (-4.40) - 0.475, width: 0.95, height: 2.10 }, { offset: -1.00 - (-4.40) - 0.475, width: 0.95, height: 2.10 }] } },
    // West wall: O10, O11/O12, O13
    { a: [-4.80, -3.60], b: [-4.80, 3.60], opts: { height: 3.0, thickness: 0.12, openings: [{ offset: -3.0 - (-3.60) - 1.2, width: 2.40, height: 2.40 }, { offset: -1.2 - (-3.60), width: 2.60, height: 2.60 }, { offset: 2.60 - (-3.60) - 1.20, width: 2.40, height: 2.40 }] } },
    // Atrium west: O14
    { a: [-2.60, -1.40], b: [-2.60, 1.40], opts: { height: 6.4, thickness: 0.12, openings: [{ offset: 0, width: 2.80, height: 3.00 }] } },
    // Atrium south: O15
    { a: [-2.60, 1.40], b: [2.60, 1.40], opts: { height: 6.4, thickness: 0.12, openings: [{ offset: 1.0, width: 3.20, height: 3.00 }] } },
    // Atrium north
    { a: [-2.60, -1.40], b: [2.60, -1.40], opts: { height: 6.4, thickness: 0.12, openings: [] } },
    // Partitions
    { a: [0.40, -5.60], b: [0.40, -3.60], opts: { height: 3.0, thickness: 0.12, openings: [] } },
    { a: [-4.40, -5.60], b: [-4.40, -3.60], opts: { height: 3.0, thickness: 0.12, openings: [] } },
    { a: [-4.80, 3.60], b: [-4.80, 5.80], opts: { height: 3.0, thickness: 0.12, openings: [] } },
    // Exterior entrance facade with O1
    { a: [-4.80, 5.80], b: [2.0, 5.80], opts: { height: 3.2, thickness: 0.30, openings: [{ offset: -1.4 - (-4.8) - 0.9, width: 1.80, height: 2.40 }] } },
  ];

  for (let idx = 0; idx < wallDefs.length; idx++) {
    const def = wallDefs[idx];
    const geom = buildWallGeometry(def.a, def.b, def.opts);
    if (geom && geom.attributes.position) {
      const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
      mesh.name = `wall_${idx}`;
      mesh.layers.set(2);
      colliders.push(mesh);
    }
  }

  return colliders;
}

async function validateCameraPath() {
  console.log("==================================================");
  console.log(" JOYFIRST Camera Path Collision Validation (§8)");
  console.log("==================================================");

  const colliders = createColliders();
  console.log(`Initialized ${colliders.length} architectural wall collider meshes on Layer 2.`);

  const R = 0.35; // camera collision radius, metres

  // 16 radial directions + vertical
  const DIRS = [];
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    DIRS.push(new THREE.Vector3(Math.cos(th), 0, Math.sin(th)).normalize());
  }
  DIRS.push(new THREE.Vector3(0, 1, 0));
  DIRS.push(new THREE.Vector3(0, -1, 0));

  const ray = new THREE.Raycaster();
  ray.layers.set(2);

  const failures = [];
  const SAMPLES = 4000;

  let minIndoorY = Infinity;
  let maxIndoorY = -Infinity;

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const p = sampleTourPosition(t);

    if (t >= 0.24) {
      if (p.y < minIndoorY) minIndoorY = p.y;
      if (p.y > maxIndoorY) maxIndoorY = p.y;

      if (p.y < 1.60 || p.y > 1.66) {
        failures.push({
          t,
          kind: "height_bounds",
          detail: `Camera height y=${p.y.toFixed(3)} outside [1.60, 1.66]`,
        });
      }
    }

    // 1. Proximity check - spherecast against colliders
    for (const d of DIRS) {
      ray.set(p, d);
      const hits = ray.intersectObjects(colliders, false);
      if (hits.length > 0 && hits[0].distance < R) {
        failures.push({
          t,
          kind: "proximity",
          obj: hits[0].object.name,
          dist: Number(hits[0].distance.toFixed(3)),
          point: [Number(p.x.toFixed(2)), Number(p.y.toFixed(2)), Number(p.z.toFixed(2))],
        });
        break;
      }
    }

    // 2. Tunneling check - segment to next sample
    if (i < SAMPLES) {
      const q = sampleTourPosition((i + 1) / SAMPLES);
      const seg = q.clone().sub(p);
      const len = seg.length();
      if (len > 1e-5) {
        ray.set(p, seg.clone().normalize());
        const hits = ray.intersectObjects(colliders, false);
        if (hits.length > 0 && hits[0].distance < len) {
          failures.push({
            t,
            kind: "tunnel",
            obj: hits[0].object.name,
            segLen: Number(len.toFixed(4)),
            hitDist: Number(hits[0].distance.toFixed(4)),
          });
        }
      }
    }
  }

  const proximityFailures = failures.filter((f) => f.kind === "proximity");
  const tunnelFailures = failures.filter((f) => f.kind === "tunnel");
  const heightFailures = failures.filter((f) => f.kind === "height_bounds");

  console.log(`\nValidation Results (${SAMPLES + 1} samples):`);
  console.log(`  Proximity Failures (dist < 0.35m): ${proximityFailures.length}`);
  console.log(`  Tunneling Failures:               ${tunnelFailures.length}`);
  console.log(`  Indoor Camera Height Range:       y in [${minIndoorY.toFixed(3)}, ${maxIndoorY.toFixed(3)}]m`);
  console.log(`  Camera Height Bounds Failures:    ${heightFailures.length}`);

  const reportsDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    samples: SAMPLES + 1,
    passed: proximityFailures.length === 0 && tunnelFailures.length === 0 && heightFailures.length === 0,
    proximityFailuresCount: proximityFailures.length,
    tunnelFailuresCount: tunnelFailures.length,
    heightFailuresCount: heightFailures.length,
    indoorHeightRange: [minIndoorY, maxIndoorY],
    failures,
  };

  fs.writeFileSync(path.join(reportsDir, "clipping.json"), JSON.stringify(report, null, 2));
  console.log(`Report written to reports/clipping.json`);

  if (report.passed) {
    console.log("\n>>> PASS: 0 PROXIMITY AND 0 TUNNEL FAILURES! <<<");
    process.exit(0);
  } else {
    console.error(`\n>>> FAIL: Detected ${failures.length} issues! <<<`);
    console.table(failures.slice(0, 10));
    process.exit(1);
  }
}

validateCameraPath().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
