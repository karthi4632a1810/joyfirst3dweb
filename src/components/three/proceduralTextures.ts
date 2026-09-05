"use client";

import * as THREE from "three";

/**
 * Deterministic PRNG (xmur3 + mulberry32) for reproducible procedural textures.
 */
function createPrng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
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

const rng = createPrng("joyfirst-architectural-textures");

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

function createCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/** Per-pixel monochrome grain */
function addGrain(ctx: CanvasRenderingContext2D, size: number, amp: number) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * amp;
    d[i] = clamp255(d[i] + n);
    d[i + 1] = clamp255(d[i + 1] + n);
    d[i + 2] = clamp255(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}

/** Low-frequency organic blotches */
function addBlotches(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  colors: string[],
  alpha: number,
  minR: number,
  maxR: number,
) {
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const x = rng() * size;
    const y = rng() * size;
    const r = size * (minR + rng() * (maxR - minR));
    const color = colors[Math.floor(rng() * colors.length)];
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function wrapTexture(canvas: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Fallback empty texture for SSR / non-browser environments
function createFallbackTexture(): THREE.Texture {
  return new THREE.Texture();
}

/** Board-formed in-situ concrete with subtle shutter seams, grain & tie holes */
export function createBoardConcreteTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e5e1d8";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 40, ["#dad5cb", "#eeebe4", "#ded9cf"], 0.22, 0.08, 0.3);

  // Horizontal shutter boards with fine shadow seams
  const boards = 8;
  for (let i = 1; i < boards; i += 1) {
    const y = (i / boards) * size;
    ctx.fillStyle = "rgba(100, 95, 88, 0.28)";
    ctx.fillRect(0, y, size, 1.5);
    ctx.fillStyle = "rgba(255, 255, 252, 0.4)";
    ctx.fillRect(0, y + 1.5, size, 1);

    // Form tie holes along the shutter joint
    if (i % 2 === 0) {
      for (let t = 0; t < 4; t += 1) {
        const x = (t + 0.5) * (size / 4) + (rng() - 0.5) * 10;
        ctx.fillStyle = "rgba(90, 84, 76, 0.35)";
        ctx.beginPath();
        ctx.arc(x, y + 0.7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(60, 56, 50, 0.45)";
        ctx.beginPath();
        ctx.arc(x, y + 0.7, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Subtle wood grain imprint from formwork timber
  for (let y = 0; y < size; y += 3) {
    if (rng() > 0.4) {
      ctx.fillStyle = `rgba(130, 122, 110, ${0.03 + rng() * 0.04})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  addGrain(ctx, size, 12);
  return wrapTexture(canvas);
}

/** Rich architectural teak wood with vertical grain lines and natural warmth */
export function createTeakTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#a87f54";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 25, ["#946e45", "#bc9264", "#b08759"], 0.25, 0.05, 0.25);

  // Vertical wood fibers and grain
  for (let x = 0; x < size; x += 1) {
    const v = rng();
    if (v < 0.32) {
      ctx.fillStyle = `rgba(110, 75, 42, ${0.08 + rng() * 0.16})`;
      ctx.fillRect(x, 0, 1 + Math.floor(rng() * 2), size);
    } else if (v > 0.86) {
      ctx.fillStyle = `rgba(215, 185, 145, ${0.07 + rng() * 0.14})`;
      ctx.fillRect(x, 0, 1, size);
    }
  }

  // Slender wood rays
  for (let i = 0; i < 30; i += 1) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 40 + rng() * 120;
    ctx.fillStyle = `rgba(88, 56, 30, ${0.1 + rng() * 0.12})`;
    ctx.fillRect(x, y, 1.5, len);
  }

  addGrain(ctx, size, 10);
  return wrapTexture(canvas);
}

/** Smooth interior ceiling: matte warm-white architectural finish with micro-grain */
export function createCeilingTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f8f6f0";
  ctx.fillRect(0, 0, size, size);

  // Very subtle high-frequency diffuse tone variation
  addBlotches(ctx, size, 16, ["#f4f1ea", "#fbfaf6"], 0.12, 0.1, 0.3);
  addGrain(ctx, size, 5);
  return wrapTexture(canvas);
}

/** Smooth interior lime plaster: soft trowel sweeps and fine matte texture */
export function createPlasterTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f4f0e8";
  ctx.fillRect(0, 0, size, size);

  // Very soft, diffuse tonal variation without harsh circular blotches
  addBlotches(ctx, size, 20, ["#eee8de", "#faf7f2", "#ede7dc"], 0.14, 0.1, 0.4);

  // Delicate trowel movement lines
  ctx.strokeStyle = "rgba(215, 207, 195, 0.15)";
  for (let i = 0; i < 24; i += 1) {
    ctx.lineWidth = 3 + rng() * 6;
    ctx.beginPath();
    let x = rng() * size;
    let y = rng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 3; s += 1) {
      x += (rng() - 0.5) * 120;
      y += (rng() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  addGrain(ctx, size, 6);
  return wrapTexture(canvas);
}

/** Dark Kota stone tile with subtle natural variations and neat grout lines */
export function createKotaStoneTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#484d49";
  ctx.fillRect(0, 0, size, size);

  const tiles = 2;
  const step = size / tiles;
  for (let ix = 0; ix < tiles; ix += 1) {
    for (let iy = 0; iy < tiles; iy += 1) {
      const shift = Math.floor((rng() - 0.5) * 16);
      ctx.fillStyle = `rgb(${72 + shift}, ${77 + shift}, ${73 + shift})`;
      ctx.fillRect(ix * step, iy * step, step, step);
    }
  }

  addBlotches(ctx, size, 40, ["#3d423e", "#565c57", "#444a45"], 0.32, 0.06, 0.28);

  // Faint mineral veining
  ctx.strokeStyle = "rgba(110, 118, 112, 0.22)";
  for (let i = 0; i < 18; i += 1) {
    ctx.lineWidth = 0.8 + rng() * 1.2;
    ctx.beginPath();
    let x = rng() * size;
    let y = rng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s += 1) {
      x += (rng() - 0.5) * 110;
      y += (rng() - 0.5) * 50;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Recessed grout lines
  ctx.fillStyle = "rgba(22, 26, 23, 0.65)";
  for (let i = 0; i <= tiles; i += 1) {
    ctx.fillRect(i * step - 1.5, 0, 3, size);
    ctx.fillRect(0, i * step - 1.5, size, 3);
  }

  addGrain(ctx, size, 11);
  return wrapTexture(canvas);
}

/** Limestone paving with large format slabs and fine aggregate */
export function createLimestonePavingTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#cfc8bb";
  ctx.fillRect(0, 0, size, size);

  const tiles = 2;
  const step = size / tiles;
  for (let ix = 0; ix < tiles; ix += 1) {
    for (let iy = 0; iy < tiles; iy += 1) {
      const shift = Math.floor((rng() - 0.5) * 12);
      ctx.fillStyle = `rgb(${207 + shift}, ${200 + shift}, ${187 + shift})`;
      ctx.fillRect(ix * step, iy * step, step, step);
    }
  }

  addBlotches(ctx, size, 30, ["#c2baa9", "#dfd9cd"], 0.25, 0.08, 0.3);

  // Grout seams
  ctx.fillStyle = "rgba(135, 128, 116, 0.45)";
  for (let i = 0; i <= tiles; i += 1) {
    ctx.fillRect(i * step - 1, 0, 2, size);
    ctx.fillRect(0, i * step - 1, size, 2);
  }

  addGrain(ctx, size, 10);
  return wrapTexture(canvas);
}

/** High-end woven upholstery fabric with tactile weave */
export function createFabricTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 256;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#c2baa8";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 15, ["#b5ac9a", "#cdc6b6"], 0.2, 0.1, 0.3);

  ctx.strokeStyle = "rgba(130, 122, 110, 0.32)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(220, 214, 202, 0.3)";
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  addGrain(ctx, size, 12);
  return wrapTexture(canvas);
}

/** Fine wool area rug with ribbed texture */
export function createRugTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 256;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#a39988";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 20, ["#948a78", "#b5ab99"], 0.35, 0.08, 0.35);

  ctx.fillStyle = "rgba(70, 64, 55, 0.22)";
  for (let y = 0; y < size; y += 4) {
    ctx.fillRect(0, y, size, 1.5);
  }

  addGrain(ctx, size, 16);
  return wrapTexture(canvas);
}

/** Grayscale roughness variation map to break up specular reflections */
export function createRoughnessMap(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 256;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#888888";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 35, ["#b5b5b5", "#5a5a5a", "#959595"], 0.45, 0.06, 0.35);
  addGrain(ctx, size, 36);
  return wrapTexture(canvas, false);
}

/** Compacted gravel ground texture */
export function createGravelTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#b4ad9f";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 30, ["#a59e90", "#c6bfb1"], 0.3, 0.05, 0.22);
  for (let i = 0; i < 20000; i += 1) {
    const tone = 125 + Math.floor(rng() * 95);
    ctx.fillStyle = `rgba(${tone}, ${tone - 4}, ${tone - 14}, ${0.3 + rng() * 0.4})`;
    ctx.fillRect(rng() * size, rng() * size, 1 + rng() * 1.5, 1 + rng() * 1.5);
  }

  addGrain(ctx, size, 14);
  return wrapTexture(canvas);
}

/** Manicured lawn grass texture with tonal variation */
export function createLawnTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#6d7d56";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 30, ["#5f6f48", "#7a8a61", "#667650"], 0.4, 0.08, 0.3);
  for (let i = 0; i < 18000; i += 1) {
    const g = 110 + Math.floor(rng() * 55);
    ctx.fillStyle = `rgba(${g - 26}, ${g}, ${g - 44}, ${0.25 + rng() * 0.35})`;
    ctx.fillRect(rng() * size, rng() * size, 1, 1 + rng() * 2.5);
  }

  addGrain(ctx, size, 16);
  return wrapTexture(canvas);
}

/** Rich architectural American walnut wood with dark straight grain */
export function createWalnutTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#5c4431";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 30, ["#4a3524", "#6e523d", "#533e2c"], 0.28, 0.05, 0.25);

  // Fine straight vertical wood grain
  for (let x = 0; x < size; x += 1) {
    const v = rng();
    if (v < 0.35) {
      ctx.fillStyle = `rgba(45, 30, 18, ${0.12 + rng() * 0.18})`;
      ctx.fillRect(x, 0, 1 + Math.floor(rng() * 2), size);
    } else if (v > 0.82) {
      ctx.fillStyle = `rgba(135, 102, 75, ${0.08 + rng() * 0.14})`;
      ctx.fillRect(x, 0, 1, size);
    }
  }

  // Medullary wood rays
  for (let i = 0; i < 25; i += 1) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 50 + rng() * 100;
    ctx.fillStyle = `rgba(35, 22, 12, ${0.15 + rng() * 0.15})`;
    ctx.fillRect(x, y, 1.5, len);
  }

  addGrain(ctx, size, 8);
  return wrapTexture(canvas);
}

/** Acoustic timber slatted wall texture with dark acoustic felt backing */
export function createSlattedWoodTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  // Dark charcoal acoustic felt backing
  ctx.fillStyle = "#1e1e20";
  ctx.fillRect(0, 0, size, size);

  const slatCount = 16;
  const step = size / slatCount;
  const slatWidth = step * 0.72;

  for (let i = 0; i < slatCount; i += 1) {
    const x = i * step;
    // Slat base warm walnut
    ctx.fillStyle = "#a27950";
    ctx.fillRect(x, 0, slatWidth, size);

    // Slat highlight and shadow edge
    ctx.fillStyle = "rgba(255, 230, 190, 0.18)";
    ctx.fillRect(x, 0, 2, size);
    ctx.fillStyle = "rgba(20, 15, 10, 0.4)";
    ctx.fillRect(x + slatWidth - 2, 0, 2, size);

    // Fine wood grain lines inside each slat
    for (let gx = x + 3; gx < x + slatWidth - 3; gx += 3) {
      if (rng() > 0.4) {
        ctx.fillStyle = `rgba(70, 48, 28, ${0.1 + rng() * 0.15})`;
        ctx.fillRect(gx, 0, 1, size);
      }
    }
  }

  addGrain(ctx, size, 7);
  return wrapTexture(canvas);
}

/** White Calacatta marble with subtle warm grey veining */
export function createMarbleTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f5f3ef";
  ctx.fillRect(0, 0, size, size);

  addBlotches(ctx, size, 20, ["#eeeae0", "#f9f8f4", "#e8e4da"], 0.3, 0.1, 0.4);

  // Soft organic marble veining
  ctx.save();
  for (let v = 0; v < 6; v += 1) {
    ctx.strokeStyle = "rgba(130, 125, 115, 0.16)";
    ctx.lineWidth = 1.5 + rng() * 3.5;
    ctx.beginPath();
    let x = rng() * size;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < size) {
      y += 15 + rng() * 30;
      x += (rng() - 0.48) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  addGrain(ctx, size, 5);
  return wrapTexture(canvas);
}

/** Architectural monitor display screen featuring the official JOY FIRST INTERIORS gold logo */
export function createMonitorScreenTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const width = 1024;
  const height = 576; // 16:9 high resolution
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  function drawBackground() {
    // Premium dark architectural interface background
    const bg = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.65);
    bg.addColorStop(0, "#191b21");
    bg.addColorStop(1, "#0d0e11");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Fine architectural coordinate grid
    ctx.strokeStyle = "rgba(197, 160, 89, 0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Top status / menu bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    ctx.fillRect(0, 0, width, 40);
    ctx.fillStyle = "#c5a059";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("JOY FIRST INTERIORS", 32, 25);
    ctx.fillStyle = "#8a909d";
    ctx.font = "12px monospace";
    ctx.fillText("ARCHITECTURE & INTERIOR DESIGN STUDIO  |  CHENNAI", 210, 25);

    // Right status indicator
    ctx.fillStyle = "#2ecc71";
    ctx.beginPath();
    ctx.arc(width - 160, 21, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ba3b0";
    ctx.font = "11px sans-serif";
    ctx.fillText("BIM MODEL ACTIVE", width - 148, 25);

    // Bottom subtle info bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    ctx.fillRect(0, height - 32, width, 32);
    ctx.fillStyle = "#a88548";
    ctx.font = "11px monospace";
    ctx.fillText("TURNKEY FITOUTS  •  PMC  •  CIVIL CONSTRUCTION", 32, height - 12);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("SCALE 1:50  |  RESIDENCE 01", width - 200, height - 12);
  }

  drawBackground();

  // Temporary typography before image loads
  ctx.fillStyle = "#c5a059";
  ctx.font = "bold 28px serif";
  ctx.textAlign = "center";
  ctx.fillText("JOY FIRST INTERIORS", width / 2, height / 2 - 10);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#9ba3b0";
  ctx.fillText("TURNKEY FITOUTS | PMC | CIVIL CONSTRUCTION", width / 2, height / 2 + 25);
  ctx.textAlign = "start";

  const texture = wrapTexture(canvas);

  // Load the user's high-res official logo
  const logoImg = new Image();
  logoImg.crossOrigin = "anonymous";
  logoImg.src = "/brand/joyfirst-interiors-logo.png";
  logoImg.onload = () => {
    ctx.clearRect(0, 0, width, height);
    drawBackground();

    // Scale and center the gold logo
    const maxW = width * 0.54;
    const maxH = height * 0.62;
    const imgAspect = logoImg.naturalWidth / logoImg.naturalHeight;
    let drawW = maxW;
    let drawH = drawW / imgAspect;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * imgAspect;
    }
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2 + 6;

    // Soft warm golden ambient glow behind the crest
    const glow = ctx.createRadialGradient(
      width / 2,
      height / 2 + 6,
      20,
      width / 2,
      height / 2 + 6,
      drawW * 0.55,
    );
    glow.addColorStop(0, "rgba(218, 175, 95, 0.22)");
    glow.addColorStop(0.5, "rgba(180, 140, 70, 0.08)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(drawX - 50, drawY - 50, drawW + 100, drawH + 100);

    // Draw the crisp gold logo
    ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
    texture.needsUpdate = true;
  };

  return texture;
}

/** Architectural blueprint & floor plan drawing sheet */
export function createBlueprintTexture(): THREE.CanvasTexture | THREE.Texture {
  if (typeof window === "undefined") return createFallbackTexture();
  const size = 512;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fcfbf7";
  ctx.fillRect(0, 0, size, size);

  // Fine architectural grid
  ctx.strokeStyle = "rgba(180, 200, 220, 0.25)";
  ctx.lineWidth = 0.5;
  for (let p = 0; p <= size; p += 20) {
    ctx.beginPath();
    ctx.moveTo(p, 0); ctx.lineTo(p, size);
    ctx.moveTo(0, p); ctx.lineTo(size, p);
    ctx.stroke();
  }

  // Floor plan wall outlines in crisp architectural drafting lines
  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(60, 60, 390, 380);
  ctx.strokeRect(180, 60, 150, 220);
  ctx.strokeRect(60, 240, 180, 200);

  // Door swing arcs
  ctx.strokeStyle = "#5a738e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(180, 240, 40, 0, Math.PI / 2);
  ctx.stroke();

  // Title block
  ctx.fillStyle = "#34495e";
  ctx.fillRect(320, 380, 120, 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px sans-serif";
  ctx.fillText("JOYFIRST ARCHITECTURE", 326, 400);
  ctx.font = "7px sans-serif";
  ctx.fillText("GROUND FLOOR PLAN - 1:100", 326, 416);

  addGrain(ctx, size, 6);
  return wrapTexture(canvas);
}

