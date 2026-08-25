/**
 * The villa, built imperatively in plain Three.js.
 *
 * This file runs inside headless Chromium (see `scripts/render-3d.mjs`) and is
 * the build-time twin of `src/components/three/ArchitectureModel.tsx` and
 * `Lighting.tsx`. Keep the two in step: the site's live hero and its still
 * imagery are supposed to be recognisably the same building.
 *
 * Not shipped to the browser at runtime and not part of the app bundle.
 */

import * as THREE from "/three/three.module.js";

/* -------------------------------------------------------------------------- */
/* Materials                                                                   */
/* -------------------------------------------------------------------------- */

export function createMaterials() {
  return {
    concrete: new THREE.MeshStandardMaterial({
      color: 0xe6e2da,
      roughness: 0.72,
      metalness: 0.02,
      envMapIntensity: 0.9,
    }),
    concreteDark: new THREE.MeshStandardMaterial({
      color: 0x8d887e,
      roughness: 0.86,
      metalness: 0.02,
      envMapIntensity: 0.6,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xa8bccd,
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.72,
      thickness: 0.4,
      ior: 1.45,
      envMapIntensity: 2.2,
      transparent: true,
    }),
    timber: new THREE.MeshStandardMaterial({
      color: 0xa57c4f,
      roughness: 0.58,
      metalness: 0.03,
      envMapIntensity: 0.7,
    }),
    interior: new THREE.MeshStandardMaterial({
      color: 0xd8cebd,
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: 0.4,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: 0xc9c1b2,
      roughness: 0.5,
      metalness: 0.02,
      envMapIntensity: 0.8,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0xb4ad9f,
      roughness: 0.95,
      metalness: 0.02,
      envMapIntensity: 0.5,
    }),
    lawn: new THREE.MeshStandardMaterial({
      color: 0x6d7f57,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.4,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x6f8dba,
      roughness: 0.02,
      metalness: 1,
      envMapIntensity: 2.6,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x51603f,
      roughness: 0.92,
      metalness: 0,
      envMapIntensity: 0.5,
    }),
    trunk: new THREE.MeshStandardMaterial({
      color: 0x4a4136,
      roughness: 0.95,
      metalness: 0,
    }),
    furniture: new THREE.MeshStandardMaterial({
      color: 0x6b6459,
      roughness: 0.7,
      metalness: 0.03,
      envMapIntensity: 0.4,
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

function add(parent, geometry, material, x, y, z, shadows = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadows;
  mesh.receiveShadow = shadows;
  parent.add(mesh);
  return mesh;
}

function makeRng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i += 1) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* Building                                                                    */
/* -------------------------------------------------------------------------- */

export function buildVilla(materials, rng) {
  const villa = new THREE.Group();

  // Podium
  add(villa, box(26, 0.36, 16), materials.concrete, 0, 0.18, 0);

  // Lower storey, recessed
  add(villa, box(20, 3.3, 12), materials.concreteDark, 0, 2, 0);
  // Interior wall behind the lower glazing, so the glass has something to show
  add(villa, box(19, 3, 0.2), materials.interior, 0, 2, -1.2);
  add(villa, box(19.2, 2.7, 0.1), materials.glass, 0, 2, 6.05, false);

  // Intermediate slab, cantilevered
  add(villa, box(24.4, 0.36, 14.4), materials.concrete, 0, 3.83, 0);

  // Upper storey: solid western end, glazed eastern run
  add(villa, box(7.2, 3.5, 12), materials.concrete, -6.6, 5.75, 0);
  add(villa, box(14.8, 3.5, 11.6), materials.concreteDark, 4.4, 5.75, 0);
  add(villa, box(14, 3.2, 0.2), materials.interior, 4.4, 5.75, -1);
  add(villa, box(14.6, 3.2, 0.1), materials.glass, 4.4, 5.75, 5.85, false);
  add(villa, box(0.1, 3.2, 11.4), materials.glass, 11.75, 5.75, 0, false);

  // Mullions
  for (let i = 0; i < 9; i += 1) {
    add(villa, box(0.1, 3.3, 0.16), materials.concrete, -2.6 + i * 1.75, 5.75, 5.95);
  }

  // Roof slab
  add(villa, box(27, 0.42, 17), materials.concrete, 0, 7.7, 0);

  // Columns carrying the overhang
  for (const x of [-11.4, -5.6, 0.6, 6.6, 12]) {
    add(villa, box(0.26, 3.5, 0.26), materials.concrete, x, 5.75, 7.9);
  }

  // Timber louvre screen
  for (let x = -1.5; x <= 12.4; x += 0.62) {
    add(villa, box(0.08, 3.4, 0.34), materials.timber, x, 5.75, 7.3);
  }

  // Entrance
  add(villa, box(2.4, 2.7, 0.14), materials.timber, -2.2, 1.5, 6.3);
  add(villa, box(4.4, 0.12, 4.8), materials.concrete, -2.2, 0.2, 8.6);

  // A few interior masses, visible through the glazing
  add(villa, box(3.2, 0.7, 1.4), materials.furniture, 1, 0.9, 3.4);
  add(villa, box(1.4, 0.45, 1.4), materials.furniture, 5, 0.75, 3.2);
  add(villa, box(2.8, 0.75, 1.2), materials.furniture, 5.5, 4.6, 2.6);
  add(villa, box(18, 0.08, 11), materials.floor, 0, 0.4, 0);
  add(villa, box(14, 0.08, 11), materials.floor, 4.4, 4.12, 0);

  // Slight settle so the villa is not perfectly axis-aligned to the camera.
  villa.rotation.y = (rng() - 0.5) * 0.06;
  return villa;
}

export function buildLandscape(materials, rng) {
  const landscape = new THREE.Group();

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), materials.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  landscape.add(ground);

  // Lawn behind the house
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), materials.lawn);
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(0, 0.02, -60);
  lawn.receiveShadow = true;
  landscape.add(lawn);

  // Reflecting pool
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), materials.water);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(2, 0.06, 15);
  landscape.add(pool);
  add(landscape, box(22.8, 0.24, 0.5), materials.concrete, 2, 0.12, 19.7);
  add(landscape, box(22.8, 0.24, 0.5), materials.concrete, 2, 0.12, 10.3);

  // Clipped hedges flanking the approach
  add(landscape, box(7, 0.9, 2.4), materials.foliage, -9, 0.45, 10.5);
  add(landscape, box(7, 0.9, 2.4), materials.foliage, 9, 0.45, 10.5);

  // Trees. Low-poly icosahedra read as canopy at this distance.
  const positions = [
    [-19, 12], [17, 10], [-15, -9], [21, -5], [-23, 2],
    [26, 14], [-27, -14], [13, -18], [-9, -22], [30, -20],
  ];
  for (const [x, z] of positions) {
    const scale = 0.75 + rng() * 0.6;
    const group = new THREE.Group();
    group.position.set(x + (rng() - 0.5) * 3, 0, z + (rng() - 0.5) * 3);

    add(group, new THREE.CylinderGeometry(0.1, 0.18, 3.4 * scale, 6), materials.trunk, 0, 1.7 * scale, 0);
    for (let b = 0; b < 3; b += 1) {
      const r = (1.1 + rng() * 0.7) * scale;
      add(
        group,
        new THREE.IcosahedronGeometry(r, 1),
        materials.foliage,
        (rng() - 0.5) * 1.6 * scale,
        (3.2 + rng() * 1.4) * scale,
        (rng() - 0.5) * 1.6 * scale,
      );
    }
    landscape.add(group);
  }

  return landscape;
}

/* -------------------------------------------------------------------------- */
/* Lighting and sky                                                            */
/* -------------------------------------------------------------------------- */

/** Vertical sky gradient as a canvas texture. */
function skyTexture(top, mid, low) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.62, mid);
  gradient.addColorStop(1, low);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 8, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Environment map built from emissive cards — the same approach as the
 * Lightformers in the live scene, so reflections match.
 */
function buildEnvScene(sky) {
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(sky.mid);

  const card = (color, intensity, position, rotation, scale) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.scale.set(...scale);
    envScene.add(mesh);
  };

  card(sky.top, 3.2, [0, 16, 0], [Math.PI / 2, 0, 0], [42, 42, 1]);   // sky dome
  card(0xfff4e2, 4.0, [16, 10, 10], [0, -Math.PI / 3.2, 0], [14, 10, 1]); // sun
  card(0xc3d7ea, 1.6, [-16, 7, -8], [0, Math.PI / 2.6, 0], [20, 10, 1]);  // sky fill
  card(0xc7b79c, 0.8, [0, -8, 0], [-Math.PI / 2, 0, 0], [40, 40, 1]);     // ground

  return envScene;
}

export const SKIES = {
  clear: { top: 0x5f93c2, mid: 0xa8c8e0, low: 0xdfe9f0 },
  high: { top: 0x7fa9cd, mid: 0xc2d9e9, low: 0xeaf0f4 },
  soft: { top: 0xa9b6c0, mid: 0xd3d8dc, low: 0xe8e9e8 },
};

export function setupLighting(scene, renderer, skyName = "clear", sunAngle = 0) {
  const sky = SKIES[skyName] ?? SKIES.clear;

  scene.background = skyTexture(
    `#${sky.top.toString(16).padStart(6, "0")}`,
    `#${sky.mid.toString(16).padStart(6, "0")}`,
    `#${sky.low.toString(16).padStart(6, "0")}`,
  );
  scene.fog = new THREE.Fog(sky.low, 90, 260);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(buildEnvScene(sky), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xe8eef4, 1.05));
  scene.add(new THREE.HemisphereLight(0xcfe0ef, 0xb9ac96, 1.5));

  // Key: high sun with crisp shadows.
  const key = new THREE.DirectionalLight(0xfff6e6, 3.1);
  const radius = 26;
  key.position.set(
    Math.cos(sunAngle) * radius,
    22,
    Math.sin(sunAngle) * radius * 0.6 + 8,
  );
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 120;
  key.shadow.camera.left = -40;
  key.shadow.camera.right = 40;
  key.shadow.camera.top = 40;
  key.shadow.camera.bottom = -40;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.03;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xcfe2f2, 0.9);
  fill.position.set(-14, 10, -12);
  scene.add(fill);

  const bounce = new THREE.DirectionalLight(0xd8cbb4, 0.4);
  bounce.position.set(0, -6, 8);
  scene.add(bounce);

  return sky;
}

/* -------------------------------------------------------------------------- */
/* Scene assembly                                                              */
/* -------------------------------------------------------------------------- */

export function buildScene(renderer, options) {
  const { seed = "default", sky = "clear", sunAngle = 0.6 } = options;
  const rng = makeRng(seed);

  const scene = new THREE.Scene();
  setupLighting(scene, renderer, sky, sunAngle);

  const materials = createMaterials();
  scene.add(buildVilla(materials, rng));
  scene.add(buildLandscape(materials, rng));

  return scene;
}
