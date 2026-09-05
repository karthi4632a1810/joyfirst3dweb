import * as THREE from "three";

/**
 * Procedural texture and normal map generator.
 * Creates 512x512 tileable textures in memory at boot.
 */
function createNoiseCanvas(
  scale = 4,
  contrast = 0.35,
  isWood = false,
  isFabric = false,
): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Simple pseudo-random hash
  function hash(x: number, y: number) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return n - Math.floor(n);
  }

  function smoothNoise(x: number, y: number) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    // Cubic hermite spline
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);

    const s00 = hash(ix % 256, iy % 256);
    const s10 = hash((ix + 1) % 256, iy % 256);
    const s01 = hash(ix % 256, (iy + 1) % 256);
    const s11 = hash((ix + 1) % 256, (iy + 1) % 256);

    const nx0 = s00 * (1 - ux) + s10 * ux;
    const nx1 = s01 * (1 - ux) + s11 * ux;
    return nx0 * (1 - uy) + nx1 * uy;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let val = 0.5;

      if (isWood) {
        // Highly anisotropic along U with longitudinal grain variation
        const uCoord = (x / size) * 2;
        const vCoord = (y / size) * 80;
        const n1 = smoothNoise(uCoord, vCoord * 0.1);
        const rings = Math.sin(vCoord + n1 * 8);
        val = 0.5 + rings * 0.25 + (hash(x, y) - 0.5) * 0.1;
      } else if (isFabric) {
        // Cross-weave pattern
        const wx = (x % 4 < 2) ? 1 : -1;
        const wy = (y % 4 < 2) ? 1 : -1;
        const weave = wx * wy * 0.25;
        val = 0.5 + weave + (hash(x, y) - 0.5) * 0.15;
      } else {
        // Multi-octave value noise
        let f = scale;
        let amp = 1;
        let sum = 0;
        let maxAmp = 0;
        for (let oct = 0; oct < 3; oct++) {
          sum += smoothNoise((x / size) * f, (y / size) * f) * amp;
          maxAmp += amp;
          amp *= 0.5;
          f *= 2;
        }
        val = sum / maxAmp;
      }

      val = 0.5 + (val - 0.5) * contrast;
      val = Math.max(0, Math.min(1, val));
      const byte = Math.round(val * 255);
      const idx = (y * size + x) * 4;
      data[idx] = byte;
      data[idx + 1] = byte;
      data[idx + 2] = byte;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Derives a normal map from a grayscale canvas using a 3x3 Sobel filter.
 */
function createSobelNormalCanvas(sourceCanvas: HTMLCanvasElement, strength = 1.0): HTMLCanvasElement {
  const size = sourceCanvas.width;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const srcCtx = sourceCanvas.getContext("2d")!;
  const srcData = srcCtx.getImageData(0, 0, size, size).data;
  const outData = ctx.createImageData(size, size);
  const out = outData.data;

  const getL = (x: number, y: number) => {
    const px = (x + size) % size;
    const py = (y + size) % size;
    return srcData[(py * size + px) * 4] / 255;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sobel kernel for dX
      const dx =
        -1 * getL(x - 1, y - 1) + 1 * getL(x + 1, y - 1) +
        -2 * getL(x - 1, y)     + 2 * getL(x + 1, y) +
        -1 * getL(x - 1, y + 1) + 1 * getL(x + 1, y + 1);

      // Sobel kernel for dY
      const dy =
        -1 * getL(x - 1, y - 1) - 2 * getL(x, y - 1) - 1 * getL(x + 1, y - 1) +
         1 * getL(x - 1, y + 1) + 2 * getL(x, y + 1) + 1 * getL(x + 1, y + 1);

      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

      const r = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      const g = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      const b = Math.round(((nz / len) * 0.5 + 0.5) * 255);

      const idx = (y * size + x) * 4;
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = 255;
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas;
}

function createTexturePair(scale = 4, contrast = 0.35, isWood = false, isFabric = false, normalStrength = 1.5) {
  if (typeof document === "undefined") {
    // SSR dummy fallback
    const dummy = new THREE.Texture();
    return { rough: dummy, normal: dummy };
  }

  const heightCanvas = createNoiseCanvas(scale, contrast, isWood, isFabric);
  const normalCanvas = createSobelNormalCanvas(heightCanvas, normalStrength);

  const rough = new THREE.CanvasTexture(heightCanvas);
  rough.wrapS = THREE.RepeatWrapping;
  rough.wrapT = THREE.RepeatWrapping;

  const normal = new THREE.CanvasTexture(normalCanvas);
  normal.wrapS = THREE.RepeatWrapping;
  normal.wrapT = THREE.RepeatWrapping;

  return { rough, normal };
}

// 6 Shared tileable procedural textures generated once
const T = {
  concrete: createTexturePair(6, 0.30, false, false, 2.0),
  plaster: createTexturePair(9, 0.14, false, false, 1.2),
  woodGrain: createTexturePair(0.004, 0.22, true, false, 2.2),
  stone: createTexturePair(3, 0.26, false, false, 1.8),
  fabric: createTexturePair(14, 0.10, false, true, 1.4),
  screed: createTexturePair(5, 0.22, false, false, 1.5),
};

export const proceduralTextures = T;

/* ========================================================================== */
/* Singleton PBR Materials Library with strict albedo discipline              */
/* ========================================================================== */

// 1. Painted Wall (warm white #E4E0D8, roughness 0.92)
export const paintedWall = new THREE.MeshStandardMaterial({
  color: "#E4E0D8",
  roughness: 0.92,
  metalness: 0,
  roughnessMap: T.plaster.rough,
  normalMap: T.plaster.normal,
  normalScale: new THREE.Vector2(0.12, 0.12),
  envMapIntensity: 0.5,
});

// 2. Exposed Concrete Soffit (#B8B3AA, roughness 0.88)
export const concreteSoffit = new THREE.MeshStandardMaterial({
  color: "#B8B3AA",
  roughness: 0.88,
  metalness: 0,
  roughnessMap: T.concrete.rough,
  normalMap: T.concrete.normal,
  normalScale: new THREE.Vector2(0.25, 0.25),
  envMapIntensity: 0.5,
});

// 3. Micro-cement / Screed Floor (#B0A79B, roughness 0.55)
export const screedFloor = new THREE.MeshStandardMaterial({
  color: "#B0A79B",
  roughness: 0.55,
  metalness: 0,
  roughnessMap: T.screed.rough,
  normalMap: T.screed.normal,
  normalScale: new THREE.Vector2(0.18, 0.18),
  envMapIntensity: 1.4,
});

// 4. Oak / Teak Joinery (#8A5F38, roughness 0.48)
export const oak = new THREE.MeshStandardMaterial({
  color: "#8A5F38",
  roughness: 0.48,
  metalness: 0,
  roughnessMap: T.woodGrain.rough,
  normalMap: T.woodGrain.normal,
  normalScale: new THREE.Vector2(0.22, 0.22),
  envMapIntensity: 0.9,
});

// 5. Dark Walnut (#3E2A1C, roughness 0.42)
export const walnut = new THREE.MeshStandardMaterial({
  color: "#3E2A1C",
  roughness: 0.42,
  metalness: 0,
  roughnessMap: T.woodGrain.rough,
  normalMap: T.woodGrain.normal,
  normalScale: new THREE.Vector2(0.20, 0.20),
  envMapIntensity: 0.9,
});

// 6. Honed Dark Stone (#3A3936, roughness 0.35)
export const darkStone = new THREE.MeshStandardMaterial({
  color: "#3A3936",
  roughness: 0.35,
  metalness: 0.05,
  roughnessMap: T.stone.rough,
  normalMap: T.stone.normal,
  normalScale: new THREE.Vector2(0.22, 0.22),
  envMapIntensity: 1.4,
});

// 7. Travertine / Limestone (#B5AEA2, roughness 0.45)
export const travertine = new THREE.MeshStandardMaterial({
  color: "#B5AEA2",
  roughness: 0.45,
  metalness: 0.02,
  roughnessMap: T.stone.rough,
  normalMap: T.stone.normal,
  normalScale: new THREE.Vector2(0.18, 0.18),
  envMapIntensity: 1.1,
});

// 8. Charcoal Metal Frames (#1E1E1F, roughness 0.38, metalness 0.85)
export const charcoalMetal = new THREE.MeshStandardMaterial({
  color: "#1E1E1F",
  roughness: 0.38,
  metalness: 0.85,
  envMapIntensity: 1.4,
});

// 9. Bronze Hardware (#6E5439, roughness 0.28, metalness 1.0)
export const bronze = new THREE.MeshStandardMaterial({
  color: "#6E5439",
  roughness: 0.28,
  metalness: 1.0,
  envMapIntensity: 1.4,
});

// 10. Linen Upholstery (#B9AFA0, roughness 0.95)
export const linen = new THREE.MeshStandardMaterial({
  color: "#B9AFA0",
  roughness: 0.95,
  metalness: 0,
  roughnessMap: T.fabric.rough,
  normalMap: T.fabric.normal,
  normalScale: new THREE.Vector2(0.15, 0.15),
  envMapIntensity: 0.5,
});

// 11. Wool Rug (#8E8577, roughness 1.0)
export const woolRug = new THREE.MeshStandardMaterial({
  color: "#8E8577",
  roughness: 1.0,
  metalness: 0,
  roughnessMap: T.fabric.rough,
  normalMap: T.fabric.normal,
  normalScale: new THREE.Vector2(0.30, 0.30),
  envMapIntensity: 0.5,
});

// 12. Foliage (#3F5B34, roughness 0.75)
export const foliage = new THREE.MeshStandardMaterial({
  color: "#3F5B34",
  roughness: 0.75,
  metalness: 0,
  envMapIntensity: 0.5,
  side: THREE.DoubleSide,
});

// 13. High-Fidelity Architectural Glass (meeting room & entrance)
export const architecturalGlass = new THREE.MeshPhysicalMaterial({
  color: "#EDF1EF",
  transmission: 1.0,
  thickness: 0.012,
  ior: 1.52,
  roughness: 0.035,
  metalness: 0,
  transparent: true,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  envMapIntensity: 1.4,
  side: THREE.DoubleSide,
});

// 14. Lightweight Glass Stand-in (secondary glazing)
export const glassLite = new THREE.MeshPhysicalMaterial({
  color: "#DCE4E2",
  transparent: true,
  opacity: 0.14,
  roughness: 0.05,
  metalness: 0,
  envMapIntensity: 1.6,
  clearcoat: 1,
  depthWrite: false,
});

// 15. Emissive Luminaire Materials
export const downlightEmissive = new THREE.MeshStandardMaterial({
  color: "#FFE8CC",
  emissive: "#FFE8CC",
  emissiveIntensity: 4.0,
  roughness: 0.2,
});

export const pendantEmissive = new THREE.MeshStandardMaterial({
  color: "#FFD9A8",
  emissive: "#FFD9A8",
  emissiveIntensity: 3.0,
  roughness: 0.2,
});

export const coveEmissive = new THREE.MeshStandardMaterial({
  color: "#FFD9A8",
  emissive: "#FFD9A8",
  emissiveIntensity: 2.2,
  roughness: 0.3,
});

export const lampEmissive = new THREE.MeshStandardMaterial({
  color: "#FFD496",
  emissive: "#FFD496",
  emissiveIntensity: 5.0,
  roughness: 0.2,
});

// 16. Acoustic Felt Wall Panel (#5A5348, roughness 0.95)
export const acousticFelt = new THREE.MeshStandardMaterial({
  color: "#5A5348",
  roughness: 0.95,
  metalness: 0,
  roughnessMap: T.fabric.rough,
  normalMap: T.fabric.normal,
  normalScale: new THREE.Vector2(0.15, 0.15),
  envMapIntensity: 0.4,
});

// 17. Terracotta Accent (#9C5A3C)
export const terracotta = new THREE.MeshStandardMaterial({
  color: "#9C5A3C",
  roughness: 0.72,
  metalness: 0,
  envMapIntensity: 0.6,
});

// 18. Muted Olive Accent (#6B6F4A)
export const mutedOlive = new THREE.MeshStandardMaterial({
  color: "#6B6F4A",
  roughness: 0.70,
  metalness: 0,
  envMapIntensity: 0.6,
});

// 19. Architectural Display / Monitor Screen
export const displayScreen = new THREE.MeshStandardMaterial({
  color: "#202226",
  emissive: "#2E3640",
  emissiveIntensity: 0.8,
  roughness: 0.2,
});
