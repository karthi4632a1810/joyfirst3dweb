/**
 * The project scenes, built imperatively in plain Three.js.
 *
 * This file runs inside headless Chromium (see `scripts/render-3d.mjs`).
 * Not shipped to the browser at runtime and not part of the app bundle.
 *
 * Each project in `src/data/projects.ts` gets its own SCHEME below — its own
 * massing, material palette, screen, site and interior. They are not one villa
 * shot from eight angles: a portfolio where every commission is visibly the
 * same building is worse than no imagery at all. The schemes follow what the
 * project copy actually claims, so the picture and the description agree.
 *
 * Storeys are hollow shells, not solid masses — interior cameras sit inside
 * them and shoot back out through the glazing, so rooms are lined, lit and
 * furnished. Every surface carries a procedural texture; an untextured render
 * reads as a massing study rather than a photograph.
 */

import * as THREE from "/three/three.module.js";

/* -------------------------------------------------------------------------- */
/* Deterministic randomness                                                    */
/* -------------------------------------------------------------------------- */

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
/* Procedural textures                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Textures are drawn once per render into 2D canvases and shared by clone.
 * They use their own fixed seed so the material set never shifts between
 * images — only the building and planting respond to the per-image seed.
 */
const texRng = makeRng("joyfirst-materials");

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function surface(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/** Per-pixel monochrome noise — the fine tooth every real material has. */
function grain(ctx, size, amp) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (texRng() - 0.5) * amp;
    d[i] = clamp255(d[i] + n);
    d[i + 1] = clamp255(d[i + 1] + n);
    d[i + 2] = clamp255(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}

/** Low-frequency tonal drift — patchiness at the scale of a hand, not a pixel. */
function blotches(ctx, size, count, colors, alpha, minR, maxR) {
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const x = texRng() * size;
    const y = texRng() * size;
    const r = size * (minR + texRng() * (maxR - minR));
    const color = colors[Math.floor(texRng() * colors.length)];
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

function toTexture(canvas, { srgb = true } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A clone at its own tiling rate. BoxGeometry UVs run 0–1 per face, so the
 * repeat is what sets apparent grain size on a given element.
 */
function tiled(texture, rx, ry) {
  const t = texture.clone();
  t.needsUpdate = true;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  return t;
}

/** Board-formed in-situ concrete: tonal drift, shutter joints, tie holes. */
function boardConcreteCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e7e3db";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 46, ["#dfdad1", "#eeebe5", "#e2ddd3"], 0.17, 0.06, 0.26);

  // Shutter boards, drawn as paired light/dark hairlines so the joint reads as
  // a seam rather than a drawn line.
  const boards = 7;
  for (let i = 1; i < boards; i += 1) {
    const y = (i / boards) * size;
    ctx.fillStyle = "rgba(120,112,100,0.20)";
    ctx.fillRect(0, y, size, 1.2);
    ctx.fillStyle = "rgba(255,253,248,0.35)";
    ctx.fillRect(0, y + 1.2, size, 1);
    if (i % 2 === 0) {
      for (let t = 0; t < 4; t += 1) {
        const x = (t + 0.5) * (size / 4) + (texRng() - 0.5) * 12;
        ctx.fillStyle = "rgba(110,102,92,0.30)";
        ctx.beginPath();
        ctx.arc(x, y + 0.5, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  grain(ctx, size, 11);
  return canvas;
}

/** Hand-applied lime plaster — soft, cloudy, faintly troweled. */
function limeRenderCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#efeade";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 60, ["#e2dbcb", "#f8f4ea", "#e8e1d2"], 0.3, 0.08, 0.34);
  // Trowel sweeps.
  ctx.strokeStyle = "rgba(215,206,190,0.35)";
  for (let i = 0; i < 40; i += 1) {
    ctx.lineWidth = 3 + texRng() * 9;
    ctx.beginPath();
    let x = texRng() * size;
    let y = texRng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 3; s += 1) {
      x += (texRng() - 0.5) * 150;
      y += (texRng() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grain(ctx, size, 10);
  return canvas;
}

/** Wire-cut brick in stretcher bond. */
function brickCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#9a8878";
  ctx.fillRect(0, 0, size, size);

  const courses = 16;
  const h = size / courses;
  const brickW = size / 4;
  for (let row = 0; row < courses; row += 1) {
    const offset = row % 2 ? brickW / 2 : 0;
    for (let col = -1; col < 5; col += 1) {
      const x = col * brickW + offset;
      const y = row * h;
      // Each brick fires differently; that variation is the whole character.
      const r = 150 + Math.floor(texRng() * 46);
      const g = 88 + Math.floor(texRng() * 34);
      const b = 70 + Math.floor(texRng() * 28);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 1.5, y + 1.5, brickW - 3, h - 3);
    }
  }
  grain(ctx, size, 16);
  return canvas;
}

/** Laterite block — the coarse, iron-red stone of the Kerala coast. */
function lateriteCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#a9694a";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 50, ["#8f5539", "#c08363", "#9c6046"], 0.4, 0.05, 0.22);

  // Coursed blocks.
  const courses = 8;
  const h = size / courses;
  ctx.strokeStyle = "rgba(96,60,42,0.4)";
  ctx.lineWidth = 2;
  for (let row = 0; row <= courses; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, row * h);
    ctx.lineTo(size, row * h);
    ctx.stroke();
    const offset = row % 2 ? size / 6 : 0;
    for (let col = 0; col < 3; col += 1) {
      const x = col * (size / 3) + offset;
      ctx.beginPath();
      ctx.moveTo(x, row * h);
      ctx.lineTo(x, row * h + h);
      ctx.stroke();
    }
  }
  // The pitting that gives laterite its name.
  for (let i = 0; i < 2600; i += 1) {
    ctx.fillStyle = `rgba(92,54,38,${0.1 + texRng() * 0.35})`;
    ctx.beginPath();
    ctx.arc(texRng() * size, texRng() * size, 0.6 + texRng() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  grain(ctx, size, 18);
  return canvas;
}

/** Smooth interior plaster — almost flat, but never perfectly flat. */
function plasterCanvas() {
  const size = 256;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f1eb";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 20, ["#eae6de", "#fbf9f5"], 0.22, 0.1, 0.4);
  grain(ctx, size, 6);
  return canvas;
}

/** Large-format honed limestone with grout joints and faint veining. */
function stoneCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#cdc5b6";
  ctx.fillRect(0, 0, size, size);

  const cells = 2;
  const step = size / cells;
  for (let ix = 0; ix < cells; ix += 1) {
    for (let iy = 0; iy < cells; iy += 1) {
      const shift = Math.floor((texRng() - 0.5) * 14);
      ctx.fillStyle = `rgb(${205 + shift},${197 + shift},${182 + shift})`;
      ctx.fillRect(ix * step, iy * step, step, step);
    }
  }

  ctx.strokeStyle = "rgba(150,143,130,0.16)";
  for (let i = 0; i < 26; i += 1) {
    ctx.lineWidth = 0.6 + texRng() * 1.4;
    ctx.beginPath();
    let x = texRng() * size;
    let y = texRng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s += 1) {
      x += (texRng() - 0.5) * 120;
      y += (texRng() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(126,119,107,0.42)";
  for (let i = 0; i <= cells; i += 1) {
    ctx.fillRect(i * step - 1, 0, 2, size);
    ctx.fillRect(0, i * step - 1, size, 2);
  }
  grain(ctx, size, 8);
  return canvas;
}

/** Travertine — the banded, vugged stone of the luxury interior brief. */
function travertineCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d8cdba";
  ctx.fillRect(0, 0, size, size);
  // Bedding planes.
  for (let i = 0; i < 60; i += 1) {
    const y = texRng() * size;
    ctx.fillStyle = `rgba(${182 + texRng() * 26},${168 + texRng() * 24},${146 + texRng() * 22},${0.25 + texRng() * 0.3})`;
    ctx.fillRect(0, y, size, 1 + texRng() * 5);
  }
  // Vugs, elongated along the bed.
  for (let i = 0; i < 420; i += 1) {
    ctx.fillStyle = `rgba(158,144,124,${0.2 + texRng() * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(texRng() * size, texRng() * size, 1 + texRng() * 5, 0.6 + texRng() * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  grain(ctx, size, 9);
  return canvas;
}

/** Dark Kota stone — the near-black floor of the Chennai house. */
function kotaCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#4e534e";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 40, ["#434843", "#5d635c"], 0.35, 0.06, 0.28);
  ctx.fillStyle = "rgba(30,34,30,0.45)";
  for (let i = 0; i <= 2; i += 1) {
    ctx.fillRect((i * size) / 2 - 1, 0, 2, size);
    ctx.fillRect(0, (i * size) / 2 - 1, size, 2);
  }
  grain(ctx, size, 10);
  return canvas;
}

/** Oiled oak — vertical grain with occasional darker rays. */
function timberCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#a68a63";
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 1) {
    const v = texRng();
    if (v < 0.34) {
      ctx.fillStyle = `rgba(122,98,68,${0.05 + texRng() * 0.13})`;
      ctx.fillRect(x, 0, 1 + Math.floor(texRng() * 2), size);
    } else if (v > 0.88) {
      ctx.fillStyle = `rgba(206,186,155,${0.06 + texRng() * 0.12})`;
      ctx.fillRect(x, 0, 1, size);
    }
  }
  grain(ctx, size, 9);
  return canvas;
}

/** Full-height oak joinery — grain plus the shadow gaps between panels. */
function oakPanelCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#b08d5f";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    const v = texRng();
    if (v < 0.3) {
      ctx.fillStyle = `rgba(128,100,64,${0.05 + texRng() * 0.12})`;
      ctx.fillRect(0, y, size, 1 + Math.floor(texRng() * 2));
    }
  }
  // Panel joints every quarter.
  ctx.fillStyle = "rgba(72,54,34,0.55)";
  for (let i = 1; i < 4; i += 1) ctx.fillRect((i * size) / 4 - 1, 0, 2.5, size);
  grain(ctx, size, 8);
  return canvas;
}

/** Compacted gravel — approaches and terrace surrounds. */
function gravelCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#b5aea0";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 34, ["#a49d90", "#c6bfb1"], 0.3, 0.05, 0.2);
  for (let i = 0; i < 26000; i += 1) {
    const tone = 130 + Math.floor(texRng() * 90);
    ctx.fillStyle = `rgba(${tone},${tone - 5},${tone - 16},${0.25 + texRng() * 0.4})`;
    ctx.fillRect(texRng() * size, texRng() * size, 1 + texRng(), 1 + texRng());
  }
  grain(ctx, size, 12);
  return canvas;
}

/** Coastal sand. */
function sandCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#cdbb9c";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 30, ["#c0ad8d", "#dccdb1"], 0.35, 0.08, 0.3);
  for (let i = 0; i < 22000; i += 1) {
    const tone = 175 + Math.floor(texRng() * 60);
    ctx.fillStyle = `rgba(${tone},${tone - 16},${tone - 44},${0.2 + texRng() * 0.35})`;
    ctx.fillRect(texRng() * size, texRng() * size, 1, 1);
  }
  grain(ctx, size, 12);
  return canvas;
}

/** Mown lawn — tonal banding plus blade-scale speckle. */
function lawnCanvas() {
  const size = 512;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#6d8055";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 26, ["#5e7049", "#7d9063", "#66784f"], 0.4, 0.08, 0.3);
  for (let i = 0; i < 20000; i += 1) {
    const g = 105 + Math.floor(texRng() * 60);
    ctx.fillStyle = `rgba(${g - 26},${g},${g - 46},${0.2 + texRng() * 0.4})`;
    ctx.fillRect(texRng() * size, texRng() * size, 1, 1 + texRng() * 2);
  }
  grain(ctx, size, 14);
  return canvas;
}

/** Upholstery weave. */
function fabricCanvas() {
  const size = 256;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#9a9284";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(120,113,102,0.30)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(196,189,177,0.26)";
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  grain(ctx, size, 10);
  return canvas;
}

/** Contract carpet tile, for the workplace floors. */
function carpetCanvas() {
  const size = 256;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#6b6a67";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 30000; i += 1) {
    const t = 88 + Math.floor(texRng() * 44);
    ctx.fillStyle = `rgba(${t},${t},${t - 4},${0.2 + texRng() * 0.4})`;
    ctx.fillRect(texRng() * size, texRng() * size, 1, 1);
  }
  ctx.fillStyle = "rgba(52,52,50,0.28)";
  ctx.fillRect(size / 2 - 1, 0, 2, size);
  ctx.fillRect(0, size / 2 - 1, size, 2);
  grain(ctx, size, 8);
  return canvas;
}

/** Grey-scale roughness break-up, shared by the hard surfaces. */
function roughCanvas() {
  const size = 256;
  const canvas = surface(size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#7d7d7d";
  ctx.fillRect(0, 0, size, size);
  blotches(ctx, size, 30, ["#a8a8a8", "#5c5c5c"], 0.42, 0.06, 0.3);
  grain(ctx, size, 34);
  return canvas;
}

function createTextures() {
  return {
    boardConcrete: toTexture(boardConcreteCanvas()),
    limeRender: toTexture(limeRenderCanvas()),
    brick: toTexture(brickCanvas()),
    laterite: toTexture(lateriteCanvas()),
    plaster: toTexture(plasterCanvas()),
    stone: toTexture(stoneCanvas()),
    travertine: toTexture(travertineCanvas()),
    kota: toTexture(kotaCanvas()),
    timber: toTexture(timberCanvas()),
    oakPanel: toTexture(oakPanelCanvas()),
    gravel: toTexture(gravelCanvas()),
    sand: toTexture(sandCanvas()),
    lawn: toTexture(lawnCanvas()),
    fabric: toTexture(fabricCanvas()),
    carpet: toTexture(carpetCanvas()),
    rough: toTexture(roughCanvas(), { srgb: false }),
  };
}

/* -------------------------------------------------------------------------- */
/* Schemes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One entry per project slug. `massing.kind` selects which builder runs:
 *
 *   block    stacked rectangular storeys, optionally hollowed by a central court
 *   pavilion one low storey under a single long cantilevered roof
 *   wings    single storey wrapped around an open courtyard, with a colonnade
 *   raised   pitched-roof pavilion lifted clear of the ground on columns
 *   plate    a single interior floor plate — no exterior massing to speak of
 *
 * `wall`/`floorFinish` name textures above; `interior` names a fit-out.
 */
export const SCHEMES = {
  // "board-formed concrete, teak, lime plaster and Kota stone"; narrow plot,
  // double-height central court, folded screen to the west.
  "modern-residence": {
    wall: "boardConcrete",
    wallColor: 0xdedad2,
    wallDark: 0x938e84,
    accentColor: 0x8a6a44,
    floorFinish: "kota",
    glassTint: 0xb6c9d6,
    mullionColor: 0x4a4844,
    massing: { kind: "block", width: 18, depth: 15, storeys: 2, court: true, overhang: 1.0 },
    screen: { kind: "fins", step: 0.5, depth: 0.42 },
    site: { ground: "gravel", boundary: true, water: "none", planting: "broadleaf", density: 0.45 },
    interior: "residential",
  },

  // "long, low villa ... a single cantilevered roof runs the full length";
  // glass, thin steel, lime-washed masonry, pool on the low side.
  "contemporary-villa": {
    wall: "limeRender",
    wallColor: 0xece7db,
    wallDark: 0xa9a294,
    accentColor: 0x6f6a62,
    floorFinish: "stone",
    glassTint: 0xc2d4de,
    mullionColor: 0x3f3e3b,
    massing: { kind: "pavilion", width: 34, depth: 13, overhang: 3.4 },
    screen: { kind: "none" },
    site: { ground: "lawn", boundary: false, water: "pool", planting: "broadleaf", density: 1 },
    interior: "residential",
  },

  // "a perforated brick screen"; compact, turns its back on the road, rear
  // garden, terraces cut into the upper volume.
  "urban-residence": {
    wall: "brick",
    wallColor: 0xb59a86,
    wallDark: 0x7d6353,
    accentColor: 0x5b5751,
    floorFinish: "stone",
    glassTint: 0xb2c4d2,
    mullionColor: 0x33322f,
    massing: { kind: "block", width: 14, depth: 13, storeys: 3, court: false, overhang: 0.5, notch: true },
    screen: { kind: "perforated", step: 0.62, depth: 0.3 },
    site: { ground: "gravel", boundary: true, water: "none", planting: "street", density: 0.5, city: true },
    interior: "residential",
  },

  // "oak, travertine and brushed bronze" in a sea-facing apartment shell.
  "luxury-interior": {
    wall: "limeRender",
    wallColor: 0xe8e2d6,
    wallDark: 0xa49c8e,
    accentColor: 0x9c7038,
    floorFinish: "travertine",
    glassTint: 0xc6d6de,
    mullionColor: 0x6d5836,
    massing: { kind: "plate", width: 20, depth: 14, height: 3.4, outlook: "sea" },
    screen: { kind: "none" },
    site: { ground: "lawn", boundary: false, water: "sea", planting: "none", density: 0 },
    interior: "oakApartment",
  },

  // "four wings enclose a planted court"; lime plaster and reclaimed teak.
  "courtyard-house": {
    wall: "limeRender",
    wallColor: 0xeee9dc,
    wallDark: 0xada593,
    accentColor: 0x7d5a35,
    floorFinish: "stone",
    glassTint: 0xbccfd8,
    mullionColor: 0x4d4740,
    massing: { kind: "wings", width: 30, depth: 26, court: { w: 14, d: 11 }, overhang: 2.2 },
    screen: { kind: "colonnade", step: 2.2 },
    site: { ground: "gravel", boundary: true, water: "court", planting: "olive", density: 0.7 },
    interior: "residential",
  },

  // "open plan ... acoustic rafts over the quiet zones, exposed services over
  // the collaborative ones" — a fit-out, not a building.
  "corporate-workplace": {
    wall: "limeRender",
    wallColor: 0xe6e6e4,
    wallDark: 0x9d9d9b,
    accentColor: 0x5c5f63,
    floorFinish: "carpet",
    glassTint: 0xccdae2,
    mullionColor: 0x3a3c3f,
    massing: { kind: "plate", width: 26, depth: 16, height: 3.2, outlook: "city" },
    screen: { kind: "none" },
    site: { ground: "gravel", boundary: false, water: "none", planting: "none", density: 0, city: true },
    interior: "office",
  },

  // "lifted clear on slender columns ... laterite and timber ... pitched".
  "coastal-retreat": {
    wall: "laterite",
    wallColor: 0xb1735a,
    wallDark: 0x7f4d3a,
    accentColor: 0x8d6a41,
    floorFinish: "stone",
    glassTint: 0xbdd2d6,
    mullionColor: 0x4c443c,
    massing: { kind: "raised", width: 15, depth: 11, lift: 2.6, ridge: 3.2, overhang: 1.5 },
    screen: { kind: "louvred", step: 0.34, depth: 0.2 },
    site: { ground: "sand", boundary: false, water: "sea", planting: "palm", density: 1.2 },
    interior: "residential",
  },

  // "a folded plate in blackened steel with solid oak treads, lit from a
  // rooflight" — the stair is the project.
  "penthouse-interiors": {
    wall: "limeRender",
    wallColor: 0xe4e0d8,
    wallDark: 0x9b968c,
    accentColor: 0x2e2d2c,
    floorFinish: "stone",
    glassTint: 0xc4d3dc,
    mullionColor: 0x2b2a29,
    massing: { kind: "plate", width: 20, depth: 15, height: 5.8, outlook: "city", rooflight: true },
    screen: { kind: "none" },
    site: { ground: "gravel", boundary: false, water: "none", planting: "none", density: 0, city: true },
    interior: "duplex",
  },
};

export const DEFAULT_SCHEME = "modern-residence";

/* -------------------------------------------------------------------------- */
/* Materials                                                                   */
/* -------------------------------------------------------------------------- */

export function createMaterials(scheme) {
  const tex = createTextures();
  const wallTex = tex[scheme.wall] ?? tex.limeRender;
  const floorTex = tex[scheme.floorFinish] ?? tex.stone;

  // Brick and laterite are coursed, so they want a much tighter tiling than a
  // poured or plastered surface, or the courses read as furniture-sized.
  const coursed = scheme.wall === "brick" || scheme.wall === "laterite";
  const wallRepeat = coursed ? [4, 2.2] : [2, 1];

  return {
    wall: new THREE.MeshStandardMaterial({
      color: scheme.wallColor,
      map: tiled(wallTex, wallRepeat[0], wallRepeat[1]),
      bumpMap: tiled(wallTex, wallRepeat[0], wallRepeat[1]),
      bumpScale: coursed ? 0.04 : 0.02,
      roughnessMap: tiled(tex.rough, 2, 2),
      roughness: coursed ? 0.9 : 0.78,
      metalness: 0.02,
      envMapIntensity: 0.7,
    }),
    /** The same material on horizontal slabs, tiled wider so it reads at scale. */
    slab: new THREE.MeshStandardMaterial({
      color: scheme.wallColor,
      map: tiled(wallTex, wallRepeat[0] * 3, wallRepeat[1] * 3),
      bumpMap: tiled(wallTex, wallRepeat[0] * 3, wallRepeat[1] * 3),
      bumpScale: 0.015,
      roughnessMap: tiled(tex.rough, 4, 4),
      roughness: 0.8,
      metalness: 0.02,
      envMapIntensity: 0.65,
    }),
    /** Recessed and shaded parts of the envelope — the same mix, cast darker. */
    wallDark: new THREE.MeshStandardMaterial({
      color: scheme.wallDark,
      map: tiled(wallTex, wallRepeat[0] * 1.5, wallRepeat[1] * 1.4),
      bumpMap: tiled(wallTex, wallRepeat[0] * 1.5, wallRepeat[1] * 1.4),
      bumpScale: coursed ? 0.04 : 0.02,
      roughness: 0.85,
      metalness: 0.02,
      envMapIntensity: 0.5,
    }),
    plaster: new THREE.MeshStandardMaterial({
      color: 0xefece6,
      map: tiled(tex.plaster, 3, 2),
      bumpMap: tiled(tex.plaster, 3, 2),
      bumpScale: 0.006,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.35,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: scheme.glassTint,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.82,
      thickness: 0.3,
      ior: 1.45,
      envMapIntensity: 1.5,
      transparent: true,
    }),
    /** Screens, columns and joinery — the scheme's one warm or dark note. */
    accent: new THREE.MeshStandardMaterial({
      color: scheme.accentColor,
      map: tiled(tex.timber, 1, 2),
      bumpMap: tiled(tex.timber, 1, 2),
      bumpScale: 0.01,
      roughness: 0.55,
      metalness: 0.03,
      envMapIntensity: 0.5,
    }),
    oak: new THREE.MeshStandardMaterial({
      color: 0xb08d5f,
      map: tiled(tex.oakPanel, 2, 1),
      bumpMap: tiled(tex.oakPanel, 2, 1),
      bumpScale: 0.01,
      roughness: 0.5,
      metalness: 0.03,
      envMapIntensity: 0.45,
    }),
    darkTimber: new THREE.MeshStandardMaterial({
      color: 0x5d4a37,
      map: tiled(tex.timber, 2, 2),
      roughness: 0.48,
      metalness: 0.03,
      envMapIntensity: 0.5,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: scheme.floorFinish === "carpet" ? 0x7a7975 : 0xd2cabb,
      map: tiled(floorTex, 4, 3),
      bumpMap: tiled(floorTex, 4, 3),
      bumpScale: 0.006,
      roughnessMap: tiled(tex.rough, 3, 3),
      roughness: scheme.floorFinish === "carpet" ? 0.95 : 0.42,
      metalness: 0.02,
      envMapIntensity: scheme.floorFinish === "carpet" ? 0.2 : 0.8,
    }),
    paving: new THREE.MeshStandardMaterial({
      color: 0xcdc5b6,
      map: tiled(tex.stone, 10, 8),
      bumpMap: tiled(tex.stone, 10, 8),
      bumpScale: 0.01,
      roughness: 0.62,
      metalness: 0.02,
      envMapIntensity: 0.6,
    }),
    ground: new THREE.MeshStandardMaterial({
      color: 0xb6a992,
      map: tiled(tex.gravel, 60, 60),
      bumpMap: tiled(tex.gravel, 60, 60),
      bumpScale: 0.02,
      roughness: 0.97,
      metalness: 0.02,
      envMapIntensity: 0.4,
    }),
    sand: new THREE.MeshStandardMaterial({
      color: 0xd3c1a2,
      map: tiled(tex.sand, 70, 70),
      bumpMap: tiled(tex.sand, 70, 70),
      bumpScale: 0.02,
      roughness: 0.98,
      metalness: 0.02,
      envMapIntensity: 0.4,
    }),
    lawn: new THREE.MeshStandardMaterial({
      color: 0x6b7d53,
      map: tiled(tex.lawn, 26, 16),
      bumpMap: tiled(tex.lawn, 26, 16),
      bumpScale: 0.02,
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.35,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x47617f,
      roughness: 0.06,
      metalness: 0.82,
      envMapIntensity: 1.9,
    }),
    foliageDark: new THREE.MeshStandardMaterial({
      color: 0x414d30, roughness: 0.94, metalness: 0, flatShading: true, envMapIntensity: 0.35,
    }),
    foliage: new THREE.MeshStandardMaterial({
      color: 0x53613f, roughness: 0.93, metalness: 0, flatShading: true, envMapIntensity: 0.45,
    }),
    foliageLight: new THREE.MeshStandardMaterial({
      color: 0x6d7c4e, roughness: 0.93, metalness: 0, flatShading: true, envMapIntensity: 0.5,
    }),
    hedge: new THREE.MeshStandardMaterial({
      color: 0x66754f,
      map: tiled(tex.lawn, 6, 2),
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.4,
    }),
    trunk: new THREE.MeshStandardMaterial({
      color: 0x4a4136,
      map: tiled(tex.timber, 1, 3),
      roughness: 0.95,
      metalness: 0,
    }),
    fabric: new THREE.MeshStandardMaterial({
      color: 0x8d8272,
      map: tiled(tex.fabric, 2, 1),
      bumpMap: tiled(tex.fabric, 2, 1),
      bumpScale: 0.008,
      roughness: 0.88,
      metalness: 0,
      // Kept low: upholstery picking up the sky env is what made the seating
      // read as cold grey plastic rather than a warm woven fabric.
      envMapIntensity: 0.18,
    }),
    rug: new THREE.MeshStandardMaterial({
      color: 0xa9977f,
      map: tiled(tex.fabric, 6, 4),
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.3,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: scheme.mullionColor,
      roughness: 0.34,
      metalness: 0.88,
      envMapIntensity: 1.1,
    }),
    /** Blackened steel — the penthouse stair, and dark ironmongery elsewhere. */
    blackSteel: new THREE.MeshStandardMaterial({
      color: 0x24242a, roughness: 0.42, metalness: 0.85, envMapIntensity: 0.9,
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0x9c7038, roughness: 0.3, metalness: 0.92, envMapIntensity: 1.3,
    }),
    /** Ceiling slots and cove lighting — what stops interiors going dead. */
    lightStrip: new THREE.MeshStandardMaterial({
      color: 0xfff4e2, emissive: 0xffeed6, emissiveIntensity: 0.7, roughness: 0.5,
    }),
    /** Acoustic raft soffits in the workplace. */
    raft: new THREE.MeshStandardMaterial({
      color: 0xdedcd6, roughness: 0.96, metalness: 0, envMapIntensity: 0.25,
    }),
    /** Distant city and context blocks — deliberately plain, they sit in haze. */
    context: new THREE.MeshStandardMaterial({
      color: 0xa9a49c, roughness: 0.9, metalness: 0.05, envMapIntensity: 0.5,
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

/** Even run of mullions across a glazed opening. */
function mullionRun(parent, mats, { count, from, to, y, height, fixed, axis }) {
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const p = from + (to - from) * t;
    if (axis === "x") add(parent, box(0.09, height, 0.16), mats.metal, p, y, fixed);
    else add(parent, box(0.16, height, 0.09), mats.metal, fixed, y, p);
  }
}

/**
 * The scheme's screen, hung in front of an elevation. Each kind is a different
 * architectural device and they read completely differently in silhouette,
 * which is most of what separates one project from another at cover size.
 */
function screen(parent, mats, scheme, { from, to, y, height, z }) {
  const s = scheme.screen;
  if (!s || s.kind === "none") return;

  if (s.kind === "fins") {
    for (let x = from; x <= to; x += s.step) {
      add(parent, box(0.09, height, s.depth), mats.accent, x, y, z);
    }
    return;
  }

  if (s.kind === "louvred") {
    // Horizontal louvres rather than vertical fins.
    for (let h = -height / 2 + 0.2; h <= height / 2 - 0.2; h += s.step) {
      const blade = add(parent, box(to - from, 0.06, s.depth), mats.accent, (from + to) / 2, y + h, z);
      blade.rotation.x = -0.35;
    }
    return;
  }

  if (s.kind === "perforated") {
    // A brick screen: blocks with gaps, so it blocks sightlines but passes
    // light. The gaps are the point — a solid wall here would be a wall.
    for (let x = from; x <= to; x += s.step) {
      for (let h = -height / 2; h <= height / 2 - 0.2; h += 0.42) {
        const skip = Math.abs(Math.sin(x * 2.3 + h * 5.1)) < 0.24;
        if (skip) continue;
        add(parent, box(s.step * 0.62, 0.28, s.depth), mats.wall, x, y + h, z);
      }
    }
    return;
  }

  if (s.kind === "colonnade") {
    for (let x = from; x <= to; x += s.step) {
      add(parent, new THREE.CylinderGeometry(0.17, 0.19, height, 10), mats.accent, x, y, z);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Furniture                                                                   */
/* -------------------------------------------------------------------------- */

function sofa(parent, mats, x, y, z, { width = 3.2, depth = 1.55, turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;

  add(g, box(width - 0.24, 0.2, depth - 0.2), mats.darkTimber, 0, 0.12, 0);
  add(g, box(width, 0.32, depth), mats.fabric, 0, 0.38, 0);
  add(g, box(width, 0.72, 0.26), mats.fabric, 0, 0.76, -depth / 2 + 0.13);
  add(g, box(0.24, 0.46, depth), mats.fabric, -width / 2 + 0.12, 0.63, 0);
  add(g, box(0.24, 0.46, depth), mats.fabric, width / 2 - 0.12, 0.63, 0);

  const cushions = Math.max(2, Math.round(width / 1.1));
  for (let i = 0; i < cushions; i += 1) {
    const cw = (width - 0.4) / cushions;
    add(g, box(cw - 0.06, 0.5, 0.2), mats.fabric, -width / 2 + 0.2 + cw * (i + 0.5), 0.72, -depth / 2 + 0.3);
  }
  parent.add(g);
  return g;
}

function armchair(parent, mats, x, y, z, turn = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;
  add(g, box(0.86, 0.16, 0.82), mats.darkTimber, 0, 0.1, 0);
  add(g, box(0.94, 0.28, 0.9), mats.fabric, 0, 0.32, 0);
  add(g, box(0.94, 0.62, 0.2), mats.fabric, 0, 0.62, -0.35);
  add(g, box(0.16, 0.34, 0.9), mats.fabric, -0.39, 0.5, 0);
  add(g, box(0.16, 0.34, 0.9), mats.fabric, 0.39, 0.5, 0);
  parent.add(g);
  return g;
}

function lowTable(parent, mats, x, y, z, { w = 1.5, d = 0.85, h = 0.36 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  add(g, box(w, 0.07, d), mats.darkTimber, 0, h, 0);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      add(g, box(0.06, h, 0.06), mats.metal, sx * (w / 2 - 0.12), h / 2, sz * (d / 2 - 0.1));
    }
  }
  add(g, box(0.3, 0.045, 0.22), mats.rug, -0.2, h + 0.06, 0.04);
  add(g, box(0.26, 0.035, 0.2), mats.fabric, -0.19, h + 0.1, 0.02);
  parent.add(g);
  return g;
}

function diningSet(parent, mats, x, y, z, { seats = 6, turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;

  const w = 2.6;
  const d = 1.05;
  const h = 0.75;
  add(g, box(w, 0.08, d), mats.darkTimber, 0, h, 0);
  add(g, box(0.1, h, 0.1), mats.metal, -w / 2 + 0.3, h / 2, 0);
  add(g, box(0.1, h, 0.1), mats.metal, w / 2 - 0.3, h / 2, 0);
  add(g, box(w - 0.5, 0.07, 0.1), mats.metal, 0, 0.06, 0);

  const perSide = Math.floor(seats / 2);
  for (let i = 0; i < perSide; i += 1) {
    const cx = -w / 2 + (w / perSide) * (i + 0.5);
    for (const side of [-1, 1]) {
      const chair = new THREE.Group();
      chair.position.set(cx, 0, side * (d / 2 + 0.34));
      chair.rotation.y = side > 0 ? Math.PI : 0;
      add(chair, box(0.44, 0.05, 0.44), mats.accent, 0, 0.45, 0);
      add(chair, box(0.44, 0.5, 0.05), mats.accent, 0, 0.72, -0.2);
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          add(chair, box(0.04, 0.45, 0.04), mats.metal, sx * 0.18, 0.225, sz * 0.18);
        }
      }
      g.add(chair);
    }
  }
  parent.add(g);
  return g;
}

function sideboard(parent, mats, x, y, z, { w = 2.4, turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;
  add(g, box(w, 0.62, 0.46), mats.darkTimber, 0, 0.45, 0);
  add(g, box(w + 0.06, 0.04, 0.5), mats.floor, 0, 0.78, 0);
  add(g, box(w - 0.3, 0.1, 0.4), mats.metal, 0, 0.09, 0);
  add(g, new THREE.CylinderGeometry(0.16, 0.1, 0.12, 16), mats.bronze, -w / 4, 0.86, 0);
  add(g, box(0.26, 0.06, 0.2), mats.rug, w / 4, 0.83, 0.02);
  parent.add(g);
  return g;
}

function rug(parent, mats, x, y, z, w, d) {
  add(parent, box(w, 0.02, d), mats.rug, x, y + 0.012, z, false);
}

function floorLamp(parent, mats, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  add(g, new THREE.CylinderGeometry(0.16, 0.18, 0.03, 20), mats.metal, 0, 0.015, 0);
  add(g, new THREE.CylinderGeometry(0.022, 0.022, 1.5, 12), mats.metal, 0, 0.75, 0);
  add(g, new THREE.CylinderGeometry(0.14, 0.1, 0.2, 20), mats.lightStrip, 0, 1.58, 0, false);
  parent.add(g);
  return g;
}

function plant(parent, mats, x, y, z, rng, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  add(g, new THREE.CylinderGeometry(0.24 * scale, 0.19 * scale, 0.42 * scale, 18), mats.paving, 0, 0.21 * scale, 0);
  add(g, new THREE.CylinderGeometry(0.06, 0.05, 0.7 * scale, 8), mats.trunk, 0, 0.72 * scale, 0);
  for (let i = 0; i < 5; i += 1) {
    add(
      g,
      new THREE.IcosahedronGeometry((0.24 + rng() * 0.16) * scale, 0),
      i % 2 ? mats.foliage : mats.foliageLight,
      (rng() - 0.5) * 0.5 * scale,
      (1.05 + rng() * 0.5) * scale,
      (rng() - 0.5) * 0.5 * scale,
    );
  }
  parent.add(g);
  return g;
}

function bed(parent, mats, x, y, z, { turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;

  add(g, box(2.0, 0.28, 2.15), mats.darkTimber, 0, 0.2, 0);
  add(g, box(1.9, 0.3, 2.05), mats.fabric, 0, 0.49, 0.02);
  // Headboard, upholstered and taller than the mattress.
  add(g, box(2.15, 1.05, 0.14), mats.fabric, 0, 0.75, -1.12);
  // Turned-back linen and pillows.
  add(g, box(1.86, 0.07, 1.15), mats.plaster, 0, 0.66, 0.45);
  for (const sx of [-0.46, 0.46]) {
    add(g, box(0.72, 0.16, 0.4), mats.plaster, sx, 0.7, -0.72);
  }
  // Bedside tables and lamps.
  for (const sx of [-1.42, 1.42]) {
    add(g, box(0.52, 0.42, 0.46), mats.oak, sx, 0.28, -0.9);
    add(g, new THREE.CylinderGeometry(0.11, 0.13, 0.2, 14), mats.lightStrip, sx, 0.62, -0.9, false);
  }
  parent.add(g);
  return g;
}

function artwork(parent, mats, x, y, z, { w = 1.3, h = 1.7, turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;
  add(g, box(w, h, 0.05), mats.darkTimber, 0, 0, 0, false);
  add(g, box(w - 0.14, h - 0.14, 0.02), mats.plaster, 0, 0, 0.03, false);
  parent.add(g);
  return g;
}

/** Recessed ceiling slots. Emissive geometry, not lights — cheap and readable. */
function ceilingSlots(parent, mats, { from, to, z, y, count, length, axis = "x" }) {
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const p = from + (to - from) * t;
    if (axis === "x") add(parent, box(0.06, 0.02, length), mats.lightStrip, p, y, z, false);
    else add(parent, box(length, 0.02, 0.06), mats.lightStrip, z, y, p, false);
  }
}

/** A bank of workstations, screens and task chairs. */
function workstations(parent, mats, x, y, z, { rows = 2, cols = 3, turn = 0 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = turn;

  for (let r = 0; r < rows; r += 1) {
    const rz = (r - (rows - 1) / 2) * 3.0;
    add(g, box(cols * 1.6, 0.06, 1.5), mats.oak, 0, 0.74, rz);
    add(g, box(cols * 1.6, 0.4, 0.05), mats.fabric, 0, 0.98, rz);
    for (let c = 0; c <= cols; c += 1) {
      add(g, box(0.06, 0.72, 1.4), mats.metal, -((cols * 1.6) / 2) + c * 1.6, 0.37, rz);
    }
    for (let c = 0; c < cols; c += 1) {
      const cx = -((cols * 1.6) / 2) + (c + 0.5) * 1.6;
      for (const side of [-1, 1]) {
        // Monitor
        add(g, box(0.5, 0.32, 0.03), mats.blackSteel, cx, 0.98, rz + side * 0.5);
        add(g, box(0.1, 0.14, 0.1), mats.blackSteel, cx, 0.82, rz + side * 0.5);
        // Task chair
        const chair = new THREE.Group();
        chair.position.set(cx, 0, rz + side * 1.35);
        add(chair, new THREE.CylinderGeometry(0.28, 0.3, 0.05, 14), mats.blackSteel, 0, 0.05, 0);
        add(chair, new THREE.CylinderGeometry(0.04, 0.04, 0.38, 10), mats.metal, 0, 0.26, 0);
        add(chair, box(0.48, 0.08, 0.46), mats.fabric, 0, 0.47, 0);
        add(chair, box(0.46, 0.52, 0.07), mats.fabric, 0, 0.76, -side * 0.2);
        g.add(chair);
      }
    }
  }
  parent.add(g);
  return g;
}

/** Suspended acoustic rafts — the workplace's ceiling strategy, made visible. */
function acousticRafts(parent, mats, { x0, x1, z0, z1, y, count = 5 }) {
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const z = z0 + (z1 - z0) * t;
    add(parent, box(x1 - x0, 0.12, 1.5), mats.raft, (x0 + x1) / 2, y, z);
    add(parent, box(x1 - x0 - 0.6, 0.03, 0.1), mats.lightStrip, (x0 + x1) / 2, y - 0.07, z + 0.85, false);
    for (const hx of [x0 + 1, x1 - 1]) {
      add(parent, box(0.03, 0.4, 0.03), mats.metal, hx, y + 0.26, z);
    }
  }
}

/**
 * The penthouse stair: a folded plate in blackened steel carrying solid oak
 * treads. It is the one piece of this whole set that is genuinely a hero
 * object, so it gets real treads and a real balustrade rather than a ramp.
 */
function foldedStair(parent, mats, x, y, z, { steps = 16, rise = 0.19, going = 0.28, width = 1.3 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);

  for (let i = 0; i < steps; i += 1) {
    add(g, box(width, 0.05, going + 0.02), mats.blackSteel, 0, i * rise, i * going);
    add(g, box(width - 0.06, 0.07, going - 0.02), mats.oak, 0, i * rise + 0.055, i * going);
    add(g, box(width, rise, 0.04), mats.blackSteel, 0, i * rise - rise / 2, i * going - going / 2);
  }
  // Folded stringer and a minimal balustrade.
  for (const side of [-1, 1]) {
    const stringer = add(
      g, box(0.05, 0.34, Math.hypot(steps * going, steps * rise)),
      mats.blackSteel, side * (width / 2 + 0.03), (steps * rise) / 2 - 0.2, (steps * going) / 2,
    );
    stringer.rotation.x = -Math.atan2(steps * rise, steps * going);
  }
  const rail = add(
    g, box(0.04, 0.04, Math.hypot(steps * going, steps * rise)),
    mats.blackSteel, width / 2 + 0.05, (steps * rise) / 2 + 0.95, (steps * going) / 2,
  );
  rail.rotation.x = -Math.atan2(steps * rise, steps * going);
  for (let i = 0; i < steps; i += 3) {
    add(g, box(0.02, 1.0, 0.02), mats.blackSteel, width / 2 + 0.05, i * rise + 0.5, i * going);
  }
  parent.add(g);
  return g;
}

/* -------------------------------------------------------------------------- */
/* Interiors                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fit-outs, laid out inside a room box `{x0,x1,z0,z1,floor,ceil}`. Which one
 * runs comes from the scheme, so an office never gets a sofa and an apartment
 * never gets a desk bank.
 */
function fitOut(kind, villa, mats, rng, room) {
  const { x0, x1, z0, z1, floor, ceil } = room;
  const midX = (x0 + x1) / 2;
  const midZ = (z0 + z1) / 2;
  const w = x1 - x0;
  const d = z1 - z0;

  if (kind === "office") {
    acousticRafts(villa, mats, { x0: x0 + 1.4, x1: x1 - 1.4, z0: z0 + 2, z1: midZ - 0.5, y: ceil - 0.5, count: 4 });
    workstations(villa, mats, midX - w * 0.16, floor, midZ + d * 0.12, { rows: 2, cols: 3 });
    workstations(villa, mats, midX + w * 0.28, floor, midZ + d * 0.12, { rows: 2, cols: 2 });

    // Meeting room along the blind wall, glazed to the floor.
    add(villa, box(5.4, ceil - floor - 0.1, 0.08), mats.glass, x0 + 4.2, (floor + ceil) / 2, z0 + 4.2, false);
    add(villa, box(0.08, ceil - floor - 0.1, 4.2), mats.glass, x0 + 1.5, (floor + ceil) / 2, z0 + 2.1, false);
    diningSet(villa, mats, x0 + 3.4, floor, z0 + 2.2, { seats: 6 });

    // Reception counter and a soft waiting corner.
    add(villa, box(3.2, 1.1, 0.7), mats.oak, x1 - 3.2, floor + 0.55, z0 + 1.6);
    add(villa, box(3.4, 0.06, 0.86), mats.floor, x1 - 3.2, floor + 1.13, z0 + 1.6);
    sofa(villa, mats, x1 - 3.0, floor, z0 + 4.4, { width: 2.4, turn: Math.PI });
    lowTable(villa, mats, x1 - 3.0, floor, z0 + 5.8, { w: 1.0, d: 0.6 });
    plant(villa, mats, x1 - 1.2, floor, z0 + 3.0, rng, 1.1);
    plant(villa, mats, x0 + 1.0, floor, midZ + 2.0, rng, 1.0);
    return;
  }

  if (kind === "oakApartment") {
    // Full-height oak joinery doing the work the walls would otherwise do.
    add(villa, box(w - 0.4, ceil - floor - 0.1, 0.55), mats.oak, midX, (floor + ceil) / 2, z0 + 0.3);
    for (let i = 1; i < 5; i += 1) {
      add(villa, box(0.03, ceil - floor - 0.3, 0.02), mats.bronze, x0 + (w / 5) * i, (floor + ceil) / 2, z0 + 0.59, false);
    }
    ceilingSlots(villa, mats, { from: x0 + 2, to: x1 - 2, z: midZ, y: ceil - 0.02, count: 5, length: d - 3 });

    rug(villa, mats, midX, floor, midZ + 0.6, w * 0.5, d * 0.42);
    sofa(villa, mats, midX, floor, midZ + 2.1, { width: 3.6, turn: Math.PI });
    armchair(villa, mats, midX - 2.9, floor, midZ - 0.4, 1.0);
    armchair(villa, mats, midX + 2.9, floor, midZ - 0.4, -1.0);
    lowTable(villa, mats, midX, floor, midZ + 0.5, { w: 1.9, d: 1.0 });
    sideboard(villa, mats, midX + w * 0.3, floor, z0 + 1.2, { w: 2.6 });
    diningSet(villa, mats, midX - w * 0.28, floor, z0 + 2.4, { seats: 6 });
    floorLamp(villa, mats, midX + 3.6, floor, midZ + 2.4);
    plant(villa, mats, x0 + 1.2, floor, z1 - 1.6, rng, 1.3);
    artwork(villa, mats, midX + w * 0.3, floor + 1.9, z0 + 0.62, { w: 1.5, h: 1.1 });

    // The sleeping end, screened off the main axis by a low joinery wall —
    // the gallery calls for a principal bedroom and the plan has to hold one.
    const bx = x1 - 3.6;
    const bz = z0 + 3.2;
    add(villa, box(0.35, ceil - floor - 0.1, 5.4), mats.oak, bx - 2.9, (floor + ceil) / 2, bz + 0.6);
    bed(villa, mats, bx, floor, bz, { turn: -Math.PI / 2 });
    rug(villa, mats, bx - 0.4, floor, bz, 4.2, 3.4);
    return;
  }

  if (kind === "duplex") {
    // The stair is the project; everything else stays quiet around it.
    foldedStair(villa, mats, midX - 1.4, floor, midZ - 2.6, { steps: 16, width: 1.4 });
    // The upper level the stair arrives at. It needs to read as a floor with a
    // soffit over the lower room, not a shelf — a stair climbing to nothing is
    // what made this look like it was floating in a void.
    const mezW = w * 0.52;
    const mezX = x0 + mezW / 2;
    add(villa, box(mezW, 0.18, d - 1.2), mats.floor, mezX, floor + 3.1, midZ - 0.2);
    add(villa, box(mezW, 0.14, d - 1.2), mats.plaster, mezX, floor + 2.98, midZ - 0.2);
    add(villa, box(0.28, 0.5, d - 1.2), mats.plaster, mezX + mezW / 2, floor + 3.0, midZ - 0.2);
    // Balustrade along the open edge.
    add(villa, box(0.05, 1.02, d - 1.2), mats.blackSteel, mezX + mezW / 2, floor + 3.7, midZ - 0.2, false);
    for (let z = -d / 2 + 1; z < d / 2 - 1; z += 1.1) {
      add(villa, box(0.03, 1.0, 0.03), mats.blackSteel, mezX + mezW / 2, floor + 3.69, midZ + z, false);
    }

    rug(villa, mats, midX + 2.2, floor, midZ + 2.6, 5.2, 3.6);
    sofa(villa, mats, midX + 2.2, floor, midZ + 4.0, { width: 3.2, turn: Math.PI });
    armchair(villa, mats, midX + 4.6, floor, midZ + 1.6, -1.2);
    lowTable(villa, mats, midX + 2.2, floor, midZ + 2.6, { w: 1.6, d: 0.9 });
    sideboard(villa, mats, x1 - 0.6, floor, midZ - 1.0, { w: 2.8, turn: -Math.PI / 2 });
    plant(villa, mats, x1 - 1.4, floor, z1 - 1.8, rng, 1.2);
    floorLamp(villa, mats, midX + 5.0, floor, midZ + 4.2);
    return;
  }

  // residential. Everything is laid out relative to the blind wall and the
  // glazed side, so the same fit-out works whichever way the room faces.
  const blindZ = room.blindZ ?? z0;
  const openZ = room.openZ ?? z1;
  const inward = Math.sign(openZ - blindZ) || 1;
  const facing = inward > 0 ? Math.PI : 0;

  ceilingSlots(villa, mats, { from: x0 + 2, to: x1 - 2, z: midZ, y: ceil - 0.02, count: 5, length: Math.max(1.5, d - 3) });
  rug(villa, mats, midX, floor, midZ + 0.4 * inward, Math.min(7, w * 0.55), Math.min(4.4, d * 0.5));
  sofa(villa, mats, midX, floor, midZ + 1.9 * inward, { width: Math.min(3.6, w * 0.28), turn: facing });
  armchair(villa, mats, midX - w * 0.2, floor, midZ - 0.7 * inward, 0.95);
  armchair(villa, mats, midX + w * 0.2, floor, midZ - 0.7 * inward, -0.85);
  lowTable(villa, mats, midX, floor, midZ + 0.3 * inward, { w: 1.7, d: 0.9 });
  floorLamp(villa, mats, midX - w * 0.3, floor, midZ + 1.9 * inward);
  plant(villa, mats, midX + w * 0.32, floor, midZ + 2.2 * inward, rng, 1.15);
  diningSet(villa, mats, midX - w * 0.24, floor, blindZ + 1.8 * inward, { seats: 6 });
  sideboard(villa, mats, midX + w * 0.28, floor, blindZ + 0.9 * inward, { w: 2.4, turn: facing });
  artwork(villa, mats, midX - w * 0.05, floor + 1.9, blindZ + 0.12 * inward, { w: 2.0, h: 1.3, turn: facing });
}

/* -------------------------------------------------------------------------- */
/* Massing builders                                                            */
/* -------------------------------------------------------------------------- */

/**
 * A lined room shell: structure outside, plaster inside, glazing to the south
 * (and optionally east). Returns the room box so the fit-out can lay out in it.
 */
function roomShell(villa, mats, scheme, { x0, x1, z0, z1, floor, height, glazeEast = false, glazeNorth = false, dark = false }) {
  const w = x1 - x0;
  const d = z1 - z0;
  const ceil = floor + height;
  const midY = floor + height / 2;
  const midX = (x0 + x1) / 2;
  const outer = dark ? mats.wallDark : mats.wall;

  add(villa, box(w, 0.12, d), mats.floor, midX, floor - 0.06, 0 + (z0 + z1) / 2);
  add(villa, box(w, 0.12, d), mats.plaster, midX, ceil + 0.06, (z0 + z1) / 2);

  // North wall — glazed instead when the room's outlook is that way, which is
  // what a courtyard wing needs: it must open onto the court, not turn its
  // back on it.
  if (glazeNorth) {
    add(villa, box(w - 0.2, height - 0.3, 0.06), mats.glass, midX, midY, z0, false);
    mullionRun(villa, mats, { count: 7, from: x0 + 0.8, to: x1 - 0.8, y: midY, height: height - 0.3, fixed: z0 - 0.05, axis: "x" });
    add(villa, box(w - 0.2, 0.12, 0.16), mats.metal, midX, floor + 0.06, z0 - 0.02);
    add(villa, box(w - 0.2, 0.12, 0.16), mats.metal, midX, ceil - 0.12, z0 - 0.02);
  } else {
    add(villa, box(w + 0.6, height, 0.32), outer, midX, midY, z0 - 0.16);
    add(villa, box(w - 0.1, height - 0.08, 0.06), mats.plaster, midX, midY, z0 + 0.03, false);
  }

  // End walls — the east one becomes glazing when asked for.
  add(villa, box(0.32, height, d + 0.32), outer, x0 - 0.16, midY, (z0 + z1) / 2);
  add(villa, box(0.06, height - 0.08, d - 0.1), mats.plaster, x0 + 0.03, midY, (z0 + z1) / 2, false);
  if (glazeEast) {
    add(villa, box(0.06, height - 0.24, d - 0.2), mats.glass, x1, midY, (z0 + z1) / 2, false);
    mullionRun(villa, mats, { count: 6, from: z0 + 0.9, to: z1 - 0.9, y: midY, height: height - 0.24, fixed: x1 + 0.05, axis: "z" });
  } else {
    add(villa, box(0.32, height, d + 0.32), outer, x1 + 0.16, midY, (z0 + z1) / 2);
    add(villa, box(0.06, height - 0.08, d - 0.1), mats.plaster, x1 - 0.03, midY, (z0 + z1) / 2, false);
  }

  // South glazing.
  add(villa, box(w - 0.2, height - 0.3, 0.06), mats.glass, midX, midY, z1, false);
  mullionRun(villa, mats, { count: 8, from: x0 + 1.0, to: x1 - 1.0, y: midY, height: height - 0.3, fixed: z1 + 0.05, axis: "x" });
  add(villa, box(w - 0.2, 0.12, 0.16), mats.metal, midX, floor + 0.06, z1 + 0.02);
  add(villa, box(w - 0.2, 0.12, 0.16), mats.metal, midX, ceil - 0.12, z1 + 0.02);

  // `blindZ` is the solid wall the fit-out can stand furniture and art against;
  // `openZ` is the glazed side it should face. Without this the courtyard
  // wing hangs its artwork in mid-air on the glass.
  return {
    x0, x1, z0, z1, floor, ceil,
    blindZ: glazeNorth ? z1 : z0,
    openZ: glazeNorth ? z0 : z1,
  };
}

/** Stacked rectangular storeys, optionally hollowed by a full-height court. */
function buildBlock(villa, mats, scheme, rng) {
  const m = scheme.massing;
  const halfW = m.width / 2;
  const halfD = m.depth / 2;
  const storeyH = 3.3;

  add(villa, box(m.width + 6, 0.36, m.depth + 4), mats.slab, 0, 0.18, 0);

  for (let s = 0; s < m.storeys; s += 1) {
    const floor = 0.36 + s * (storeyH + 0.36);
    // The top storey of the notched scheme is cut back, which is what gives
    // the street elevation the terraces the brief describes.
    const inset = m.notch && s === m.storeys - 1 ? 2.6 : 0;

    if (m.court && s < 2) {
      // Two wings either side of a full-height court rather than one room.
      const courtW = 5.0;
      for (const side of [-1, 1]) {
        const x0 = side < 0 ? -halfW : courtW / 2;
        const x1 = side < 0 ? -courtW / 2 : halfW;
        const room = roomShell(villa, mats, scheme, {
          x0, x1, z0: -halfD, z1: halfD - inset, floor, height: storeyH, dark: s === 0,
        });
        if (s === 1 || m.storeys === 1) fitOut(scheme.interior, villa, mats, rng, room);
      }
      // The court itself: glazed to both wings, open to the sky.
      for (const side of [-1, 1]) {
        add(villa, box(0.06, storeyH - 0.3, m.depth - 1), mats.glass, (side * courtW) / 2, floor + storeyH / 2, 0, false);
      }
      add(villa, box(courtW, 0.1, m.depth), mats.paving, 0, floor - 0.05, 0);
    } else {
      const room = roomShell(villa, mats, scheme, {
        x0: -halfW, x1: halfW, z0: -halfD, z1: halfD - inset, floor, height: storeyH,
        glazeEast: s === m.storeys - 1, dark: s === 0,
      });
      if (s === m.storeys - 1) fitOut(scheme.interior, villa, mats, rng, room);
    }

    // Floor slab expressed past the wall line.
    add(villa, box(m.width + m.overhang * 2, 0.34, m.depth + m.overhang * 2 - inset), mats.slab,
      0, floor + storeyH + 0.17, -inset / 2);
  }

  const top = 0.36 + m.storeys * (storeyH + 0.36);
  add(villa, box(m.width + m.overhang * 2 + 1, 0.42, m.depth + m.overhang * 2 + 1), mats.slab, 0, top + 0.21, 0);

  // The scheme's screen, hung on the western half of the south elevation.
  screen(villa, mats, scheme, {
    from: -halfW + 0.6, to: 0.2, y: top - storeyH / 2 - 0.2, height: storeyH * 0.94, z: halfD + 1.1,
  });

  // Entrance.
  add(villa, box(2.2, 2.6, 0.14), mats.accent, -halfW + 3.2, 1.66, halfD + 0.12);
  add(villa, box(4.2, 0.12, 3.4), mats.paving, -halfW + 3.2, 0.3, halfD + 1.9);
}

/** One low storey under a single long cantilevered roof plane. */
function buildPavilion(villa, mats, scheme, rng) {
  const m = scheme.massing;
  const halfW = m.width / 2;
  const halfD = m.depth / 2;
  const storeyH = 3.5;
  const floor = 0.4;

  add(villa, box(m.width + 8, 0.4, m.depth + 8), mats.slab, 0, 0.2, 0);

  // The living spine, glazed the whole way along the south.
  const room = roomShell(villa, mats, scheme, {
    x0: -halfW + 4, x1: halfW - 1, z0: -halfD, z1: halfD, floor, height: storeyH, glazeEast: true,
  });
  fitOut(scheme.interior, villa, mats, rng, room);

  // A closed wing at the western end — the part that can be shut off.
  add(villa, box(4.6, storeyH, m.depth), mats.wall, -halfW + 1.4, floor + storeyH / 2, 0);

  // The roof: one plane, deep enough to shade the glazing, on thin steel.
  const roofY = floor + storeyH + 0.3;
  add(villa, box(m.width + 3, 0.34, m.depth + m.overhang * 2), mats.slab, 0, roofY, m.overhang * 0.35);
  for (let x = -halfW + 1; x <= halfW; x += 4.6) {
    add(villa, new THREE.CylinderGeometry(0.09, 0.09, storeyH + 0.3, 10), mats.metal, x, floor + storeyH / 2, halfD + m.overhang - 0.5);
  }
  // Verandah deck under the overhang.
  add(villa, box(m.width + 2, 0.12, m.overhang * 1.6), mats.paving, 0, floor - 0.06, halfD + m.overhang * 0.7);
}

/** Four single-storey wings around an open, planted courtyard. */
function buildWings(villa, mats, scheme, rng) {
  const m = scheme.massing;
  const halfW = m.width / 2;
  const halfD = m.depth / 2;
  const cw = m.court.w / 2;
  const cd = m.court.d / 2;
  const storeyH = 3.4;
  const floor = 0.4;

  add(villa, box(m.width + 3, 0.4, m.depth + 3), mats.slab, 0, 0.2, 0);

  // South wing is the living wing and gets the fit-out; the others are mass.
  // It is glazed on its north face so it opens onto the court — the whole
  // point of the type is that every room touches the court.
  const room = roomShell(villa, mats, scheme, {
    x0: -cw, x1: cw, z0: cd, z1: halfD, floor, height: storeyH, glazeNorth: true,
  });
  fitOut(scheme.interior, villa, mats, rng, room);

  // North wing.
  add(villa, box(m.court.w + 4, storeyH, halfD - cd), mats.wall, 0, floor + storeyH / 2, -(cd + halfD) / 2);
  add(villa, box(m.court.w, storeyH - 0.4, 0.06), mats.glass, 0, floor + storeyH / 2, -cd, false);
  // East and west wings.
  for (const side of [-1, 1]) {
    add(villa, box(halfW - cw, storeyH, m.depth), mats.wall, side * (cw + halfW) / 2, floor + storeyH / 2, 0);
    add(villa, box(0.06, storeyH - 0.4, m.court.d), mats.glass, side * cw, floor + storeyH / 2, 0, false);
  }

  // The roof is a ring of four strips, not a slab: the court has to be open to
  // the sky or it is just a room. Each strip oversails into the court by
  // `overhang`, which is what shades the verandah below it.
  const roofY = floor + storeyH + 0.18;
  const outerW = m.width + 1;
  const outerD = m.depth + 1;
  const holeW = m.court.w - m.overhang * 2;
  const holeD = m.court.d - m.overhang * 2;

  for (const side of [-1, 1]) {
    // North and south strips, running the full width.
    const stripD = outerD / 2 - holeD / 2;
    add(villa, box(outerW, 0.36, stripD), mats.slab, 0, roofY, side * (outerD / 2 + holeD / 2) / 2);
    // East and west strips, filling only the depth of the opening.
    const stripW = outerW / 2 - holeW / 2;
    add(villa, box(stripW, 0.36, holeD), mats.slab, side * (outerW / 2 + holeW / 2) / 2, roofY, 0);
  }

  add(villa, box(m.court.w, 0.12, m.court.d), mats.paving, 0, floor - 0.06, 0);

  // The teak colonnade around the court — the oldest thing on site.
  for (const side of [-1, 1]) {
    screen(villa, mats, scheme, {
      from: -cw + 0.6, to: cw - 0.6, y: floor + storeyH / 2, height: storeyH, z: side * (cd - 0.4),
    });
  }

  // A planted court with a shallow water table at its centre. The table is
  // deliberately small — filling the court with water made it read as flooded
  // rather than planted, which is the opposite of the point.
  add(villa, box(3.8, 0.1, 2.6), mats.water, 0, floor - 0.03, -0.6, false);
  add(villa, box(4.3, 0.18, 3.1), mats.paving, 0, floor - 0.11, -0.6);

  // Planted into the ground, not stood in pots — potted trees read as a hotel
  // atrium. Kept to the far half of the court so the camera standing under the
  // near verandah looks across the planting rather than out of the middle of it.
  const spots = [[-4.6, -3.6], [-2.0, -4.1], [1.4, -3.7], [4.4, -3.3], [-5.2, -1.4], [5.0, -1.0]];
  for (const [px, pz] of spots) {
    olive(villa, mats, rng, px + (rng() - 0.5) * 0.5, pz + (rng() - 0.5) * 0.4, 0.72 + rng() * 0.2, floor - 0.06);
  }
}

/** A pitched pavilion lifted clear of the ground on slender columns. */
function buildRaised(villa, mats, scheme, rng) {
  const m = scheme.massing;
  const halfW = m.width / 2;
  const halfD = m.depth / 2;
  const storeyH = 3.2;
  const floor = m.lift;

  // Columns, and the deck they carry.
  for (let x = -halfW + 0.8; x <= halfW; x += 3.4) {
    for (const z of [-halfD + 0.8, 0, halfD - 0.8]) {
      add(villa, new THREE.CylinderGeometry(0.16, 0.2, m.lift, 10), mats.wallDark, x, m.lift / 2, z);
    }
  }
  add(villa, box(m.width + 2.4, 0.34, m.depth + 3.4), mats.slab, 0, floor - 0.17, 0.4);

  const room = roomShell(villa, mats, scheme, {
    x0: -halfW, x1: halfW, z0: -halfD, z1: halfD, floor, height: storeyH, glazeEast: true,
  });
  fitOut(scheme.interior, villa, mats, rng, room);

  // Gable: two pitched planes meeting at a ridge.
  const slope = Math.atan2(m.ridge, halfD + m.overhang);
  const len = Math.hypot(m.ridge, halfD + m.overhang);
  for (const side of [-1, 1]) {
    const plane = add(villa, box(m.width + m.overhang * 2, 0.22, len), mats.accent,
      0, floor + storeyH + m.ridge / 2, (side * (halfD + m.overhang)) / 2);
    plane.rotation.x = side * slope;
  }
  add(villa, box(m.width + m.overhang * 2 + 0.3, 0.16, 0.3), mats.accent, 0, floor + storeyH + m.ridge, 0);
  // Gable ends, filling the triangle under the ridge.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i += 1) {
      const t = i / 7;
      const hh = m.ridge * (1 - t);
      if (hh < 0.1) continue;
      add(villa, box(m.width * (1 - t) * 0.14 + 0.4, hh, 0.14), mats.wall,
        0, floor + storeyH + hh / 2, side * (halfD * t));
    }
  }

  // Timber stair up to the deck.
  for (let i = 0; i < 9; i += 1) {
    add(villa, box(1.8, 0.08, 0.3), mats.accent, halfW - 2, 0.25 + i * (m.lift - 0.3) / 8, halfD + 1.4 + i * 0.3);
  }

  screen(villa, mats, scheme, {
    from: -halfW + 0.5, to: halfW - 0.5, y: floor + storeyH / 2, height: storeyH * 0.9, z: halfD + 0.35,
  });
}

/**
 * A single interior floor plate. There is no exterior to speak of: the camera
 * lives inside, so this builds a room, its perimeter glazing, and whatever the
 * scheme says is outside the window.
 */
function buildPlate(villa, mats, scheme, rng) {
  const m = scheme.massing;
  const halfW = m.width / 2;
  const halfD = m.depth / 2;
  const floor = 0.4;
  const height = m.height;
  const ceil = floor + height;

  add(villa, box(m.width + 1.2, 0.3, m.depth + 1.2), mats.floor, 0, floor - 0.15, 0);
  add(villa, box(m.width + 1.2, 0.24, m.depth + 1.2), mats.plaster, 0, ceil + 0.12, 0);

  // Blind north wall and the service core.
  add(villa, box(m.width, height, 0.3), mats.plaster, 0, floor + height / 2, -halfD - 0.15);
  add(villa, box(4.4, height, 3.0), mats.plaster, -halfW + 3.2, floor + height / 2, -halfD + 1.6);
  add(villa, box(0.3, height, m.depth), mats.plaster, -halfW - 0.15, floor + height / 2, 0);

  // Glazing on the two outward faces.
  add(villa, box(m.width - 0.2, height - 0.2, 0.06), mats.glass, 0, floor + height / 2, halfD, false);
  add(villa, box(0.06, height - 0.2, m.depth - 0.2), mats.glass, halfW, floor + height / 2, 0, false);
  mullionRun(villa, mats, { count: 9, from: -halfW + 1, to: halfW - 1, y: floor + height / 2, height: height - 0.2, fixed: halfD + 0.05, axis: "x" });
  mullionRun(villa, mats, { count: 6, from: -halfD + 1, to: halfD - 1, y: floor + height / 2, height: height - 0.2, fixed: halfW + 0.05, axis: "z" });
  add(villa, box(m.width - 0.2, 0.14, 0.18), mats.metal, 0, floor + 0.07, halfD + 0.02);
  add(villa, box(m.width - 0.2, 0.14, 0.18), mats.metal, 0, ceil - 0.12, halfD + 0.02);

  // A rooflight over the stair, where the scheme asks for one.
  if (m.rooflight) {
    add(villa, box(4.0, 0.06, 3.0), mats.lightStrip, -1.4, ceil + 0.1, -0.4, false);
  }

  // The terrace immediately outside, so the glazing has a foreground.
  add(villa, box(m.width + 8, 0.2, 5), mats.paving, 0, floor - 0.1, halfD + 2.6);
  add(villa, box(m.width + 8, 0.9, 0.12), mats.glass, 0, floor + 0.45, halfD + 5, false);

  fitOut(scheme.interior, villa, mats, rng, {
    x0: -halfW, x1: halfW, z0: -halfD, z1: halfD, floor, ceil,
  });
}

export function buildVilla(materials, rng, scheme) {
  const villa = new THREE.Group();
  const kind = scheme.massing.kind;

  if (kind === "pavilion") buildPavilion(villa, materials, scheme, rng);
  else if (kind === "wings") buildWings(villa, materials, scheme, rng);
  else if (kind === "raised") buildRaised(villa, materials, scheme, rng);
  else if (kind === "plate") buildPlate(villa, materials, scheme, rng);
  else buildBlock(villa, materials, scheme, rng);

  // Slight settle so the building is not perfectly axis-aligned to the camera.
  villa.rotation.y = (rng() - 0.5) * 0.05;
  return villa;
}

/* -------------------------------------------------------------------------- */
/* Landscape                                                                   */
/* -------------------------------------------------------------------------- */

function broadleaf(parent, mats, rng, x, z, scale) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rng() * Math.PI * 2;

  const greens = [mats.foliageDark, mats.foliage, mats.foliageLight];
  add(g, new THREE.CylinderGeometry(0.09, 0.2, 3.8 * scale, 7), mats.trunk, 0, 1.9 * scale, 0);

  const blobs = 7 + Math.floor(rng() * 4);
  for (let b = 0; b < blobs; b += 1) {
    const r = (0.62 + rng() * 0.62) * scale;
    const theta = rng() * Math.PI * 2;
    const spread = (0.4 + rng() * 0.6) * 1.9 * scale;
    const mesh = add(g, new THREE.IcosahedronGeometry(r, 1), greens[Math.floor(rng() * 3)],
      Math.cos(theta) * spread, (3.2 + rng() * 1.9) * scale, Math.sin(theta) * spread);
    mesh.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    mesh.scale.set(0.9 + rng() * 0.5, 0.7 + rng() * 0.4, 0.9 + rng() * 0.5);
  }
  parent.add(g);
}

/** Coconut palm — a tall bare trunk and a crown of long fronds. */
function palm(parent, mats, rng, x, z, scale) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rng() * Math.PI * 2;

  // Kept vertical on purpose: leaning the trunk moved its top away from the
  // origin the crown is built around, and the fronds ended up hanging in the
  // air beside the tree instead of on top of it.
  const h = (6 + rng() * 2.4) * scale;
  add(g, new THREE.CylinderGeometry(0.11, 0.2, h, 9), mats.trunk, 0, h / 2, 0);

  const crownY = h;
  const crownX = 0;
  // Each frond is a short chain of tapering segments that droops as it goes
  // out. A single long box reads as a stick nailed to the trunk; the droop and
  // the taper are what make it a palm.
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2 + rng() * 0.3;
    const frond = new THREE.Group();
    frond.position.set(crownX, crownY - 0.15, 0);
    frond.rotation.y = -a;

    // Two lengths per frond, the outer one drooping harder — enough to give a
    // curve at this distance. Chains of short segments read as planks nailed
    // end to end, which is worse than a single clean taper.
    const inner = (1.5 + rng() * 0.4) * scale;
    const outer = (1.4 + rng() * 0.4) * scale;
    const d1 = 0.22 + rng() * 0.12;
    const d2 = d1 + 0.5 + rng() * 0.2;

    const s1 = add(frond, box(0.17 * scale, 0.045, inner), mats.foliage,
      0, -Math.sin(d1) * inner / 2, Math.cos(d1) * inner / 2);
    s1.rotation.x = d1;

    const jointY = -Math.sin(d1) * inner;
    const jointZ = Math.cos(d1) * inner;
    const s2 = add(frond, box(0.12 * scale, 0.04, outer), mats.foliageDark,
      0, jointY - Math.sin(d2) * outer / 2, jointZ + Math.cos(d2) * outer / 2);
    s2.rotation.x = d2;

    g.add(frond);
  }
  // A few coconuts clustered at the crown.
  for (let i = 0; i < 4; i += 1) {
    add(g, new THREE.IcosahedronGeometry(0.16 * scale, 0), mats.trunk,
      crownX + (rng() - 0.5) * 0.5, crownY - 0.45, (rng() - 0.5) * 0.5);
  }
  parent.add(g);
}

/** Clipped olive — small, silvery, on a short gnarled trunk. */
function olive(parent, mats, rng, x, z, scale, groundY = 0) {
  const g = new THREE.Group();
  g.position.set(x, groundY, z);
  // Trunk height and canopy height have to agree: at the old 1.5 the canopy
  // centre sat above the top of the trunk, so the tree came apart into a black
  // cone with a bush hovering over it.
  const trunkH = 2.4 * scale;
  add(g, new THREE.CylinderGeometry(0.09 * scale, 0.15 * scale, trunkH, 9), mats.darkTimber, 0, trunkH / 2, 0);
  // A couple of raised limbs, so it is not a pole.
  for (const side of [-1, 1]) {
    const limb = add(g, new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 0.9 * scale, 7),
      mats.darkTimber, side * 0.22 * scale, trunkH * 0.82, 0);
    limb.rotation.z = side * 0.5;
  }
  for (let b = 0; b < 7; b += 1) {
    const mesh = add(g, new THREE.IcosahedronGeometry((0.5 + rng() * 0.34) * scale, 1),
      b % 2 ? mats.foliageLight : mats.foliage,
      (rng() - 0.5) * 1.3 * scale, trunkH + (rng() - 0.3) * 0.7 * scale, (rng() - 0.5) * 1.3 * scale);
    mesh.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    mesh.scale.set(1, 0.72, 1);
  }
  parent.add(g);
}

/** Columnar street tree, pruned up for a footpath. */
function streetTree(parent, mats, rng, x, z, scale) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  add(g, new THREE.CylinderGeometry(0.1, 0.18, 4.4 * scale, 8), mats.trunk, 0, 2.2 * scale, 0);
  for (let b = 0; b < 6; b += 1) {
    const mesh = add(g, new THREE.IcosahedronGeometry((0.7 + rng() * 0.4) * scale, 1),
      b % 2 ? mats.foliage : mats.foliageDark,
      (rng() - 0.5) * 1.1 * scale, (4.6 + rng() * 1.8) * scale, (rng() - 0.5) * 1.1 * scale);
    mesh.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    mesh.scale.set(0.85, 1.25, 0.85);
  }
  parent.add(g);
}

export function buildLandscape(materials, rng, scheme) {
  const landscape = new THREE.Group();
  const site = scheme.site;
  const groundMat = site.ground === "sand" ? materials.sand
    : site.ground === "lawn" ? materials.lawn
      : materials.ground;

  // Comfortably past the fog's far plane, so the edge of the plane is never
  // the thing that draws the horizon.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  landscape.add(ground);

  if (site.ground !== "lawn" && site.ground !== "sand") {
    for (const [x, z, w, d] of [[0, -62, 170, 92], [-46, 16, 44, 60], [46, 14, 44, 64]]) {
      const lawn = new THREE.Mesh(new THREE.PlaneGeometry(w, d), materials.lawn);
      lawn.rotation.x = -Math.PI / 2;
      lawn.position.set(x, 0.02, z);
      lawn.receiveShadow = true;
      landscape.add(lawn);
    }
  }

  // Paved terrace on the approach side.
  const terrace = new THREE.Mesh(new THREE.PlaneGeometry(34, 15), materials.paving);
  terrace.rotation.x = -Math.PI / 2;
  terrace.position.set(1, 0.04, 15.5);
  terrace.receiveShadow = true;
  landscape.add(terrace);

  if (site.water === "pool") {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), materials.water);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(2, 0.07, 17);
    landscape.add(pool);
    add(landscape, box(23.2, 0.3, 0.6), materials.paving, 2, 0.15, 21.8);
    add(landscape, box(23.2, 0.3, 0.6), materials.paving, 2, 0.15, 12.2);
    add(landscape, box(0.6, 0.3, 9.6), materials.paving, -9.3, 0.15, 17);
    add(landscape, box(0.6, 0.3, 9.6), materials.paving, 13.3, 0.15, 17);
  }

  if (site.water === "sea") {
    // A wide plane starting well out, so it reads as open water to the horizon.
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), materials.water);
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, 0.12, 400);
    landscape.add(sea);
    add(landscape, box(900, 0.5, 2), materials.sand, 0, 0.2, 50);
  }

  // Boundary walls on the tight urban plots.
  if (site.boundary) {
    for (const [x, z, w, d] of [[0, -26, 46, 0.5], [-23, 0, 0.5, 52], [23, 0, 0.5, 52]]) {
      add(landscape, box(w, 3.0, d), materials.wallDark, x, 1.5, z);
    }
  }

  // Neighbouring blocks — what makes an urban site read as urban.
  if (site.city) {
    for (let i = 0; i < 22; i += 1) {
      const a = rng() * Math.PI * 2;
      const r = 46 + rng() * 120;
      const h = 12 + rng() * 46;
      add(landscape, box(10 + rng() * 16, h, 10 + rng() * 16), materials.context,
        Math.cos(a) * r, h / 2, Math.sin(a) * r, false);
    }
  }

  // Hedging and grasses, scaled by how planted the scheme is.
  if (site.density > 0) {
    add(landscape, box(7, 0.95, 2.4), materials.hedge, -9, 0.48, 12.5);
    add(landscape, box(7, 0.95, 2.4), materials.hedge, 9, 0.48, 12.5);
    for (let i = 0; i < Math.round(26 * site.density); i += 1) {
      const mesh = add(landscape, new THREE.IcosahedronGeometry(0.3 + rng() * 0.26, 0),
        rng() > 0.5 ? materials.foliage : materials.foliageLight,
        -13 + rng() * 27, 0.3, 10.6 + rng() * 1.6);
      mesh.scale.set(1, 1.5 + rng(), 1);
    }
  }

  const positions = [
    [-19, 14], [17, 12], [-15, -9], [21, -5], [-23, 2],
    [26, 16], [-27, -14], [13, -18], [-9, -22], [30, -20],
    [-34, 8], [36, 2], [-31, -28], [24, -30], [-40, -6],
  ];
  const count = Math.round(positions.length * Math.min(1.4, site.density));
  for (let i = 0; i < count; i += 1) {
    const [x, z] = positions[i % positions.length];
    const px = x + (rng() - 0.5) * 4;
    const pz = z + (rng() - 0.5) * 4;
    const scale = 0.8 + rng() * 0.7;
    if (site.planting === "palm") palm(landscape, materials, rng, px, pz, scale * 0.9);
    else if (site.planting === "olive") olive(landscape, materials, rng, px, pz, scale * 1.1);
    else if (site.planting === "street") streetTree(landscape, materials, rng, px, pz, scale);
    else if (site.planting !== "none") broadleaf(landscape, materials, rng, px, pz, scale);
  }

  // A distant treeline, deep in the fog, so the horizon is not a hard edge.
  // Many small canopies rather than a few large ones — at this range the
  // silhouette is all that survives, and big blobs read as cut paper.
  if (site.water !== "sea") {
    for (let i = 0; i < 130; i += 1) {
      const angle = rng() * Math.PI * 2;
      const radius = 90 + rng() * 80;
      const mesh = add(landscape, new THREE.IcosahedronGeometry(2.6 + rng() * 3.4, 1),
        rng() > 0.5 ? materials.foliage : materials.foliageLight,
        Math.cos(angle) * radius, 1.6 + rng() * 2.4, Math.sin(angle) * radius, false);
      mesh.rotation.set(rng() * 3, rng() * 3, rng() * 3);
      mesh.scale.set(1.3 + rng() * 0.7, 0.7 + rng() * 0.4, 1.3 + rng() * 0.7);
    }
  }

  return landscape;
}

/* -------------------------------------------------------------------------- */
/* Lighting and sky                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Vertical sky gradient as a canvas texture.
 *
 * The map is equirectangular, so v runs zenith (0) to nadir (1) and the horizon
 * sits at exactly 0.5. `low` is also the fog colour, and it is held to a narrow
 * band right at the horizon: ground receding into fog then meets a sky of the
 * same tone, with no hard white seam — but the wide cameras look down and only
 * ever see a few degrees of sky, so ramping any earlier than this returns every
 * exterior shot overcast grey with no sky colour left in it at all.
 */
function skyTexture(top, mid, low) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.35, mid);
  gradient.addColorStop(0.485, mid);
  gradient.addColorStop(0.497, low);
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

  card(sky.top, 2.4, [0, 16, 0], [Math.PI / 2, 0, 0], [42, 42, 1]);
  card(0xfff4e2, 3.2, [16, 10, 10], [0, -Math.PI / 3.2, 0], [14, 10, 1]);
  card(0xc3d7ea, 1.2, [-16, 7, -8], [0, Math.PI / 2.6, 0], [20, 10, 1]);
  card(0xc7b79c, 0.55, [0, -8, 0], [-Math.PI / 2, 0, 0], [40, 40, 1]);

  return envScene;
}

export const SKIES = {
  clear: { top: 0x4d82b6, mid: 0x93b9d8, low: 0xd3e0ea },
  high: { top: 0x6d9cc4, mid: 0xb2cee3, low: 0xe1e9ef },
  soft: { top: 0x9aa9b5, mid: 0xc4cbd1, low: 0xdedfdd },
};

export function setupLighting(scene, renderer, skyName = "clear", sunAngle = 0, scheme = null) {
  const sky = SKIES[skyName] ?? SKIES.clear;
  const hex = (v) => `#${v.toString(16).padStart(6, "0")}`;

  scene.background = skyTexture(hex(sky.top), hex(sky.mid), hex(sky.low));
  scene.fog = new THREE.Fog(sky.low, 110, 400);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(buildEnvScene(sky), 0.04).texture;

  // Deliberately restrained. The previous set summed to well over full
  // exposure, which is what flattened every surface to white — the textures
  // only show up if the ambient terms leave the shadows somewhere to go.
  scene.add(new THREE.AmbientLight(0xe8eef4, 0.22));
  scene.add(new THREE.HemisphereLight(0xcfe0ef, 0xa89c86, 0.55));

  const key = new THREE.DirectionalLight(0xfff4e0, 2.5);
  const radius = 26;
  key.position.set(Math.cos(sunAngle) * radius, 22, Math.sin(sunAngle) * radius * 0.6 + 8);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 140;
  key.shadow.camera.left = -46;
  key.shadow.camera.right = 46;
  key.shadow.camera.top = 46;
  key.shadow.camera.bottom = -46;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.025;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xcfe2f2, 0.3);
  fill.position.set(-14, 10, -12);
  scene.add(fill);

  const bounce = new THREE.DirectionalLight(0xd8cbb4, 0.16);
  bounce.position.set(0, -6, 8);
  scene.add(bounce);

  // Interior fill. The rooms are deep and north-lined; without these the
  // furniture silhouettes against the glazing and loses all its material.
  // A `plate` scheme is all interior, so it needs a wider, cooler spread than
  // a house where the lamps are only topping up one room.
  const isPlate = scheme && scheme.massing.kind === "plate";
  const lamps = isPlate
    ? [[-6, 2.6, -2], [0, 2.6, 2], [6, 2.6, -2], [8, 2.6, 3], [-8, 2.6, 3]]
    : [[0, 2.4, 1], [6.5, 2.4, -2], [4.4, 6.2, 1], [9, 6.2, -3]];
  // Five lamps at the old 5.5 blew the plaster out to flat white and took the
  // wall texture with it. A plate is lit mostly by its own glazing; these are
  // only filling the back of the room.
  for (const [x, y, z] of lamps) {
    const lamp = new THREE.PointLight(0xffe8cc, isPlate ? 3.0 : 4.8, isPlate ? 18 : 16, 2);
    lamp.position.set(x, y, z);
    scene.add(lamp);
  }

  return sky;
}

/* -------------------------------------------------------------------------- */
/* Scene assembly                                                              */
/* -------------------------------------------------------------------------- */

export function buildScene(renderer, options) {
  const { seed = "default", sky = "clear", sunAngle = 0.6, scheme: schemeName } = options;
  const rng = makeRng(seed);
  const scheme = SCHEMES[schemeName] ?? SCHEMES[DEFAULT_SCHEME];

  const scene = new THREE.Scene();
  setupLighting(scene, renderer, sky, sunAngle, scheme);

  const materials = createMaterials(scheme);
  scene.add(buildVilla(materials, rng, scheme));
  scene.add(buildLandscape(materials, rng, scheme));

  return scene;
}
