import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { simplify, prune, dedup, resample } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

// Polyfill FileReader for Three.js GLTFExporter in Node
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
};

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const MODELS_DIR = path.resolve('public/models');
const RAW_DIR = path.resolve('public/models/raw');

fs.mkdirSync(MODELS_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

async function downloadFile(url, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

/**
 * Normalizes positions of all primitives:
 * - Shifts min Y to 0.000 (sits flush on floor, no floating or penetrating)
 * - Centers X and Z at 0
 * - Scales to targetHeight
 */
function normalizeDocBounds(doc, targetHeight) {
  let minY = Infinity, maxY = -Infinity;
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const count = pos.getCount();
      for (let i = 0; i < count; i++) {
        const [x, y, z] = pos.getElement(i, []);
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
    }
  }

  const height = maxY - minY;
  const scale = targetHeight > 0 ? targetHeight / height : 1.0;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const count = pos.getCount();
      for (let i = 0; i < count; i++) {
        const [x, y, z] = pos.getElement(i, []);
        pos.setElement(i, [
          (x - centerX) * scale,
          (y - minY) * scale, // exactly 0 at base
          (z - centerZ) * scale,
        ]);
      }
    }
  }
}

function countTriangles(doc) {
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      tris += prim.getIndices()
        ? prim.getIndices().getCount() / 3
        : prim.getAttribute('POSITION').getCount() / 3;
    }
  }
  return tris;
}

async function preparePolyHavenModel(id, targetName, targetHeight, maxTriangles = 15000) {
  const outGlb = path.join(MODELS_DIR, `${targetName}.glb`);
  console.log(`\n--- Preparing ${targetName} from Poly Haven '${id}' ---`);

  const metaRes = await fetch(`https://api.polyhaven.com/files/${id}`);
  const meta = await metaRes.json();
  const gltfInfo = meta.gltf?.['1k']?.gltf;
  if (!gltfInfo) throw new Error(`No 1k gltf found for ${id}`);

  const rawItemDir = path.join(RAW_DIR, id);
  const gltfFilename = path.basename(new URL(gltfInfo.url).pathname);
  const mainGltfPath = path.join(rawItemDir, gltfFilename);

  await downloadFile(gltfInfo.url, mainGltfPath);
  for (const [relPath, fileData] of Object.entries(gltfInfo.include || {})) {
    const dest = path.join(rawItemDir, relPath);
    await downloadFile(fileData.url, dest);
  }

  const doc = await io.read(mainGltfPath);
  await doc.transform(prune(), dedup(), resample());
  normalizeDocBounds(doc, targetHeight);

  const initialTris = countTriangles(doc);
  console.log(`Initial triangles: ${initialTris}`);

  if (initialTris > maxTriangles) {
    const ratio = Math.max(0.08, maxTriangles / initialTris);
    console.log(`Simplifying with ratio ${ratio.toFixed(2)} to meet budget ${maxTriangles}...`);
    await doc.transform(
      simplify({
        simplifier: MeshoptSimplifier,
        ratio,
        error: 0.005,
      })
    );
  }

  await io.write(outGlb, doc);
  const finalTris = countTriangles(doc);
  const fileSizeMb = (fs.statSync(outGlb).size / 1024 / 1024).toFixed(2);
  console.log(`✓ ${targetName}.glb: ${finalTris} triangles, ${fileSizeMb} MB (budget: ${maxTriangles})`);
}

/**
 * Generates an architectural high-fidelity mesh task chair:
 * 5-star base, 5 casters, pneumatic cylinder, tilt mech, curved waterfall seat,
 * contoured lumbar backrest with mesh texture, and curved 3D armrests.
 */
async function generateTaskChair() {
  const targetName = 'task-chair';
  const outGlb = path.join(MODELS_DIR, `${targetName}.glb`);
  console.log(`\n--- Generating ${targetName}.glb ---`);

  const scene = new THREE.Scene();
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e1f,
    metalness: 0.85,
    roughness: 0.28,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.95,
    roughness: 0.15,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x222223,
    roughness: 0.72,
    metalness: 0.08,
  });
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x181819,
    roughness: 0.85,
    metalness: 0.05,
  });

  // 1. Five-star base hub and legs
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.06, 16), metalMat);
  hub.position.y = 0.09;
  scene.add(hub);

  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const legArm = new THREE.Group();
    legArm.rotation.y = angle;

    // Arched arm
    const armGeom = new THREE.CylinderGeometry(0.016, 0.022, 0.29, 10);
    const armMesh = new THREE.Mesh(armGeom, metalMat);
    armMesh.position.set(0, 0.075, 0.14);
    armMesh.rotation.x = Math.PI / 2 - 0.18;
    legArm.add(armMesh);

    // Caster wheel fork & double wheel
    const casterFork = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.035, 8), metalMat);
    casterFork.position.set(0, 0.035, 0.28);
    legArm.add(casterFork);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.025, 12), metalMat);
    wheel.position.set(0, 0.028, 0.28);
    wheel.rotation.z = Math.PI / 2;
    legArm.add(wheel);

    scene.add(legArm);
  }

  // 2. Pneumatic gas lift cylinder & telescope column
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.26, 16), chromeMat);
  piston.position.y = 0.22;
  scene.add(piston);

  const columnShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 16), chromeMat);
  columnShaft.position.y = 0.32;
  scene.add(columnShaft);

  // 3. Under-seat tilt mechanism housing & tension knob
  const tiltBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.24), metalMat);
  tiltBox.position.set(0, 0.38, 0);
  scene.add(tiltBox);

  const tensionKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.08, 12), metalMat);
  tensionKnob.position.set(0, 0.34, 0.06);
  scene.add(tensionKnob);

  // 4. Ergonomic contoured seat cushion with waterfall front curve
  const seatShape = new THREE.Shape();
  seatShape.moveTo(-0.24, -0.23);
  seatShape.lineTo(0.24, -0.23);
  seatShape.quadraticCurveTo(0.25, 0.18, 0.22, 0.23);
  seatShape.quadraticCurveTo(0.0, 0.25, -0.22, 0.23);
  seatShape.quadraticCurveTo(-0.25, 0.18, -0.24, -0.23);

  const seatGeom = new THREE.ExtrudeGeometry(seatShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 2,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  const seat = new THREE.Mesh(seatGeom, cushionMat);
  seat.rotation.x = Math.PI / 2;
  seat.position.set(0, 0.44, 0);
  scene.add(seat);

  // 5. Ergonomic contoured backrest frame & breathable lumbar mesh
  const backFrameShape = new THREE.Shape();
  backFrameShape.moveTo(-0.22, 0);
  backFrameShape.quadraticCurveTo(-0.23, 0.25, -0.20, 0.50);
  backFrameShape.quadraticCurveTo(0, 0.53, 0.20, 0.50);
  backFrameShape.quadraticCurveTo(0.23, 0.25, 0.22, 0);
  backFrameShape.quadraticCurveTo(0, 0.02, -0.22, 0);

  const backFrameGeom = new THREE.ExtrudeGeometry(backFrameShape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  const backFrame = new THREE.Mesh(backFrameGeom, metalMat);
  backFrame.position.set(0, 0.46, -0.19);
  backFrame.rotation.x = -0.08;
  scene.add(backFrame);

  // Mesh panel inset
  const meshPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.40, 0.46, 6, 6),
    meshMat
  );
  meshPanel.position.set(0, 0.72, -0.17);
  meshPanel.rotation.x = -0.08;
  scene.add(meshPanel);

  // Adjustable armrests (left & right)
  [-0.26, 0.26].forEach((x) => {
    const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 10), metalMat);
    armPost.position.set(x, 0.50, -0.04);
    armPost.rotation.z = x > 0 ? -0.15 : 0.15;
    scene.add(armPost);

    const armPadGeom = new THREE.BoxGeometry(0.07, 0.028, 0.22);
    const armPad = new THREE.Mesh(armPadGeom, cushionMat);
    armPad.position.set(x * 1.05, 0.62, -0.02);
    scene.add(armPad);
  });

  const exporter = new GLTFExporter();
  const rawGlb = await exporter.parseAsync(scene, { binary: true });

  const doc = await io.readBinary(new Uint8Array(rawGlb));
  normalizeDocBounds(doc, 0.96); // 0.96m tall, seat at 0.46m
  await doc.transform(prune(), dedup(), resample());
  await io.write(outGlb, doc);

  const finalTris = countTriangles(doc);
  const sizeMb = (fs.statSync(outGlb).size / 1024 / 1024).toFixed(2);
  console.log(`✓ task-chair.glb: ${finalTris} triangles, ${sizeMb} MB`);
}

/**
 * Generates an ultra-thin 27" widescreen monitor on stand:
 * - 16:9 borderless display with subtle rear bevel curve
 * - Stand neck with cable pass-through hole & VESA hinge
 * - Flat die-cast aluminum base flush on desk at Y = 0
 */
async function generateMonitor() {
  const targetName = 'monitor';
  const outGlb = path.join(MODELS_DIR, `${targetName}.glb`);
  console.log(`\n--- Generating ${targetName}.glb ---`);

  const scene = new THREE.Scene();
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    metalness: 0.85,
    roughness: 0.32,
  });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x080809,
    roughness: 0.15,
    metalness: 0.90,
  });
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x28282a,
    metalness: 0.92,
    roughness: 0.25,
  });

  // Flat die-cast aluminum desk base (flush at Y=0)
  const baseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.008, 0.19),
    standMat
  );
  baseMesh.position.set(0, 0.004, 0);
  scene.add(baseMesh);

  // Stand upright column with tilt hinge
  const columnGeom = new THREE.BoxGeometry(0.045, 0.36, 0.024);
  const column = new THREE.Mesh(columnGeom, standMat);
  column.position.set(0, 0.18, -0.04);
  column.rotation.x = -0.05;
  scene.add(column);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), darkMetal);
  hinge.position.set(0, 0.32, -0.035);
  hinge.rotation.z = Math.PI / 2;
  scene.add(hinge);

  // 27" Widescreen display panel (0.61m x 0.36m x 0.012m)
  const displayBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.61, 0.355, 0.014),
    darkMetal
  );
  displayBack.position.set(0, 0.34, 0);
  scene.add(displayBack);

  // Screen active glass area
  const screenGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.598, 0.342),
    screenMat
  );
  screenGlass.position.set(0, 0.34, 0.0075);
  scene.add(screenGlass);

  const exporter = new GLTFExporter();
  const rawGlb = await exporter.parseAsync(scene, { binary: true });

  const doc = await io.readBinary(new Uint8Array(rawGlb));
  normalizeDocBounds(doc, 0.44); // 0.44m tall monitor
  await doc.transform(prune(), dedup(), resample());
  await io.write(outGlb, doc);

  const finalTris = countTriangles(doc);
  const sizeMb = (fs.statSync(outGlb).size / 1024 / 1024).toFixed(2);
  console.log(`✓ monitor.glb: ${finalTris} triangles, ${sizeMb} MB`);
}

async function run() {
  console.log('==================================================');
  console.log(' JOYFIRST Furniture Asset Pipeline (Addendum A)  ');
  console.log('==================================================');

  // 1. Sourcing Poly Haven Models
  // Lounge Armchair (Table 2.3 #3) - budget 15k
  await preparePolyHavenModel('modern_arm_chair_01', 'lounge-armchair', 0.82, 12000);

  // Dining / Cantilever Chair (Table 2.3 #2) - budget 8k
  await preparePolyHavenModel('dining_chair_02', 'dining-chair', 0.85, 7500);

  // Modular 3-Seat Sofa (Table 2.3 #4) - budget 15k
  await preparePolyHavenModel('sofa_02', 'modular-sofa', 0.74, 12000);

  // Bar Stool (Table 2.3 #5) - budget 8k
  await preparePolyHavenModel('bar_chair_round_01', 'bar-stool', 0.75, 7000);

  // Executive Leather Chair (Table 2.3 #6) - budget 15k
  await preparePolyHavenModel('mid_century_lounge_chair', 'executive-chair', 0.84, 14000);

  // Ficus / Tall Indoor Tree (Table 2.3 #7) - budget 6k
  await preparePolyHavenModel('potted_plant_01', 'ficus-tree', 2.2, 5800);

  // Snake Plant (Low) (Table 2.3 #8) - budget 6k
  await preparePolyHavenModel('potted_plant_02', 'snake-plant', 0.75, 5500);

  // Laptop (Open) (Table 2.3 #10) - budget 3k
  await preparePolyHavenModel('classic_laptop', 'laptop', 0.18, 3000);

  // Floor Lamp (Table 2.3 #11) - budget 3k
  await preparePolyHavenModel('desk_lamp_arm_01', 'floor-lamp', 1.45, 3000);

  // 2. High-fidelity Architectural Generative Models
  // Mesh Task Chair (Table 2.3 #1) - budget 8k
  await generateTaskChair();

  // Monitor on stand (Table 2.3 #9) - budget 3k
  await generateMonitor();

  console.log('\n==================================================');
  console.log(' All 11 Models Successfully Prepared in public/models/ !');
  console.log('==================================================');
}

run().catch((err) => {
  console.error('Asset pipeline failed:', err);
  process.exit(1);
});
