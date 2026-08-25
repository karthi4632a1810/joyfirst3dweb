/**
 * Procedural architectural scene generator.
 *
 * Produces SVG source for moody, monochrome-warm architectural compositions
 * that stand in for real project photography. These are PLACEHOLDERS: drop real
 * photographs into `public/images/**` with the same filenames and delete the
 * `npm run assets` step from your workflow.
 *
 * Everything is deterministic — the same seed always yields the same image — so
 * regenerating assets never silently changes the design.
 */

/* -------------------------------------------------------------------------- */
/* Deterministic randomness                                                    */
/* -------------------------------------------------------------------------- */

export function makeRng(seedText) {
  // xmur3 seed hash → mulberry32 PRNG
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i += 1) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;

  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = (rng, min, max) => min + rng() * (max - min);
const randInt = (rng, min, max) => Math.floor(rand(rng, min, max + 1));
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

/* -------------------------------------------------------------------------- */
/* Palettes                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Each palette is a light condition, not a colour scheme.
 *
 * All five are daylight. Architectural photography is shot in open light, and
 * a bright site wants imagery lit the same way — white concrete reading as
 * white, shadows open rather than crushed, glazing reflecting sky instead of
 * glowing from within.
 *
 * `silhouette` is deliberately a mid-dark tone rather than near-black: in
 * daylight nothing is actually black, and pure black foreground shapes are the
 * fastest way to make a render look synthetic.
 */
export const palettes = {
  /** Clear mid-morning. The default for exteriors. */
  daylight: {
    skyTop: "#6f9fc9",
    skyMid: "#a8c8e0",
    skyLow: "#dfe9f0",
    horizon: "#eef2f4",
    sun: "#fff6e4",
    concreteLit: "#f2efe9",
    concreteMid: "#c8c3b8",
    concreteDark: "#8f8a80",
    glass: "#9db6cb",
    glassLit: "#dbe8f2",
    ground: "#b9b3a5",
    silhouette: "#55584d",
    haze: "#dce6ee",
    foliage: "#6d7f57",
    foliageDark: "#44523a",
  },

  /** High sun, high key. Bleached facades and short, hard shadows. */
  noon: {
    skyTop: "#8fb4d4",
    skyMid: "#c2d9e9",
    skyLow: "#eaf0f4",
    horizon: "#f4f6f7",
    sun: "#fffaf0",
    concreteLit: "#f6f4ef",
    concreteMid: "#d5d0c5",
    concreteDark: "#a09a8e",
    glass: "#aec5d6",
    glassLit: "#e6eff6",
    ground: "#c9c3b5",
    silhouette: "#615f57",
    haze: "#e8eef3",
    foliage: "#7d8c5f",
    foliageDark: "#4e5a3f",
  },

  /** Bright overcast — even, shadowless light that shows material. */
  softLight: {
    skyTop: "#b9c2c9",
    skyMid: "#d3d8dc",
    skyLow: "#e8e9e8",
    horizon: "#f0f0ee",
    sun: "#f7f5f0",
    concreteLit: "#ece8e0",
    concreteMid: "#c4bfb4",
    concreteDark: "#918c82",
    glass: "#b3bcc4",
    glassLit: "#dde2e6",
    ground: "#c0bab0",
    silhouette: "#5f5d56",
    haze: "#e4e6e5",
    foliage: "#6b7860",
    foliageDark: "#454f3e",
  },

  /** White interior with large glazing — cool, gallery-like. */
  interiorBright: {
    skyTop: "#f2f4f6",
    skyMid: "#e8ebee",
    skyLow: "#dde1e5",
    horizon: "#fbfcfd",
    sun: "#fffdf7",
    concreteLit: "#f4f2ee",
    concreteMid: "#d6d1c8",
    concreteDark: "#a49e94",
    glass: "#eef3f7",
    glassLit: "#fcfdfe",
    ground: "#cdc7bb",
    silhouette: "#565048",
    haze: "#eef1f4",
    foliage: "#6f7d5c",
    foliageDark: "#47523d",
  },

  /** Oak, travertine and warm daylight. The residential interior. */
  interiorWarm: {
    skyTop: "#f6f1e8",
    skyMid: "#efe8dc",
    skyLow: "#e4dbcb",
    horizon: "#fdfaf4",
    sun: "#fff8ea",
    concreteLit: "#f0ebe1",
    concreteMid: "#d3c9b8",
    concreteDark: "#a3907a",
    glass: "#f4efe5",
    glassLit: "#fffdf6",
    ground: "#c3b49c",
    silhouette: "#5b5044",
    haze: "#f2ece1",
    foliage: "#75805a",
    foliageDark: "#4b533b",
  },
};

// Guard against typos in the table above breaking a fill silently.
for (const [name, palette] of Object.entries(palettes)) {
  for (const [key, value] of Object.entries(palette)) {
    if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) {
      palette[key] = "#7d7a72";
      if (process.env.ASSET_DEBUG) {
        console.warn(`palette ${name}.${key} was invalid ("${value}") — patched`);
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Shared SVG fragments                                                        */
/* -------------------------------------------------------------------------- */

function defs(p, rng, w, h) {
  const sunX = rand(rng, 0.15, 0.85) * w;
  const sunY = rand(rng, 0.22, 0.55) * h;

  return {
    sunX,
    sunY,
    markup: `
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="0.55" stop-color="${p.skyMid}"/>
      <stop offset="1" stop-color="${p.skyLow}"/>
    </linearGradient>

    <radialGradient id="sunGlow" cx="${(sunX / w).toFixed(3)}" cy="${(sunY / h).toFixed(3)}" r="0.62">
      <stop offset="0" stop-color="${p.sun}" stop-opacity="0.55"/>
      <stop offset="0.35" stop-color="${p.sun}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="wallLit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.concreteLit}"/>
      <stop offset="1" stop-color="${p.concreteMid}"/>
    </linearGradient>

    <linearGradient id="wallSide" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0" stop-color="${p.concreteMid}"/>
      <stop offset="1" stop-color="${p.concreteDark}"/>
    </linearGradient>

    <linearGradient id="wallDark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.concreteDark}"/>
      <stop offset="1" stop-color="${p.silhouette}"/>
    </linearGradient>

    <linearGradient id="glassG" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="${p.glass}"/>
      <stop offset="0.45" stop-color="${p.glassLit}" stop-opacity="0.35"/>
      <stop offset="0.55" stop-color="${p.glass}"/>
      <stop offset="1" stop-color="${p.glassLit}" stop-opacity="0.18"/>
    </linearGradient>

    <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.ground}"/>
      <stop offset="1" stop-color="${p.silhouette}"/>
    </linearGradient>

    <linearGradient id="hazeG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.haze}" stop-opacity="0"/>
      <stop offset="1" stop-color="${p.haze}" stop-opacity="0.32"/>
    </linearGradient>

    <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.82">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
    </radialGradient>

    <filter id="soft" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="${(w * 0.012).toFixed(1)}"/>
    </filter>
    <filter id="softer" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${(w * 0.035).toFixed(1)}"/>
    </filter>
    <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${(w * 0.006).toFixed(1)}"/>
    </filter>

    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="${randInt(rng, 1, 9999)}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>

    <filter id="concreteTex">
      <feTurbulence type="fractalNoise" baseFrequency="0.014 0.05" numOctaves="4" seed="${randInt(rng, 1, 9999)}" result="n"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.13"/></feComponentTransfer>
    </filter>`,
  };
}

/**
 * Grain, a light vignette and an atmospheric lift, applied to every scene.
 *
 * The lift matters most on a bright palette: a flat wash of sky tone across the
 * frame is what separates near from far and stops the image reading as flat
 * vector shapes.
 */
function finish(p, w, h) {
  return `
    <rect width="${w}" height="${h}" fill="${p.haze}" opacity="0.1"/>
    <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.055" style="mix-blend-mode:overlay"/>
    <rect width="${w}" height="${h}" fill="${p.sun}" opacity="0.07" style="mix-blend-mode:soft-light"/>`;
}

/**
 * A row of glazing panels with uneven interior light.
 *
 * Each pane is graded — darker at the head, brighter toward the sill where the
 * room behind is actually lit — and a proportion of panes carry a silhouetted
 * object. Flat panes of uniform colour are the single biggest giveaway that an
 * elevation was drawn rather than photographed.
 */
function windowBand(rng, p, x, y, bandW, bandH, count, opts = {}) {
  const { lit = 0.6, mullion = Math.max(2, bandW * 0.004) } = opts;
  const cell = bandW / count;
  let out = `<rect x="${x}" y="${y}" width="${bandW}" height="${bandH}" fill="${p.glass}"/>`;

  for (let i = 0; i < count; i += 1) {
    const px = x + i * cell + mullion / 2;
    const pw = cell - mullion;
    const py = y + mullion / 2;
    const ph = bandH - mullion;
    const isLit = rng() < lit;
    const alpha = isLit ? rand(rng, 0.3, 0.68) : rand(rng, 0.03, 0.1);

    out += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}" fill="${p.glassLit}" opacity="${alpha.toFixed(2)}"/>`;

    if (isLit) {
      // Ceiling of the room behind falls into shadow.
      out += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${(ph * rand(rng, 0.3, 0.5)).toFixed(1)}" fill="${p.silhouette}" opacity="${rand(rng, 0.28, 0.5).toFixed(2)}"/>`;

      // Something in the room: furniture, a partition, a person-height mass.
      if (rng() < 0.55) {
        const objW = pw * rand(rng, 0.2, 0.6);
        const objH = ph * rand(rng, 0.16, 0.4);
        out += `<rect x="${(px + rand(rng, 0.05, 0.4) * pw).toFixed(1)}" y="${(py + ph - objH).toFixed(1)}" width="${objW.toFixed(1)}" height="${objH.toFixed(1)}" fill="${p.silhouette}" opacity="${rand(rng, 0.4, 0.75).toFixed(2)}"/>`;
      }

      // Reflected sky streak across the outer face of the glass.
      if (rng() < 0.5) {
        out += `<polygon points="${px.toFixed(1)},${(py + ph * rand(rng, 0.1, 0.4)).toFixed(1)} ${(px + pw).toFixed(1)},${py.toFixed(1)} ${(px + pw).toFixed(1)},${(py + ph * 0.18).toFixed(1)} ${px.toFixed(1)},${(py + ph * rand(rng, 0.45, 0.65)).toFixed(1)}" fill="${p.haze}" opacity="${rand(rng, 0.08, 0.2).toFixed(2)}"/>`;
      }
    }

    // Mullion shadow down the left reveal of every pane.
    out += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${Math.max(1, pw * 0.035).toFixed(1)}" height="${ph.toFixed(1)}" fill="#000" opacity="0.28"/>`;
  }

  // Head reveal shadow across the whole band.
  out += `<rect x="${x}" y="${y}" width="${bandW}" height="${Math.max(2, bandH * 0.05).toFixed(1)}" fill="#000" opacity="0.4"/>`;
  return out;
}

/**
 * An out-of-focus foreground mass along the bottom edge — planting or a low
 * wall, thrown well out of the plane of focus. It is the cheapest way to give a
 * flat elevation real depth, and it never draws attention to itself.
 */
function foregroundMass(rng, p, w, h, heightFrac = 0.14) {
  const base = h * (1 - heightFrac);
  const steps = randInt(rng, 7, 12);
  let points = `0,${h} 0,${(base + rand(rng, -h * 0.02, h * 0.03)).toFixed(0)}`;

  for (let i = 1; i <= steps; i += 1) {
    const x = (i / steps) * w;
    const y = base + rand(rng, -h * 0.05, h * 0.045);
    points += ` ${x.toFixed(0)},${y.toFixed(0)}`;
  }
  points += ` ${w},${h}`;

  return `<polygon points="${points}" fill="${p.foliageDark}" opacity="0.9" filter="url(#softer)"/>`;
}

/** Soft contact shadow beneath a mass, so volumes sit on the ground. */
function contactShadow(x, y, width, height, opacity = 0.5) {
  return `<ellipse cx="${(x + width / 2).toFixed(1)}" cy="${y.toFixed(1)}" rx="${(width * 0.62).toFixed(1)}" ry="${height.toFixed(1)}" fill="#000" opacity="${opacity}" filter="url(#soft)"/>`;
}

/**
 * Irregular planting silhouettes along a baseline.
 *
 * Canopies are built from many small overlapping ellipses rather than three
 * large ones — a handful of big blobs reads as clip-art, a cluster of small
 * ones reads as foliage.
 */
function planting(rng, p, baseY, w, count, scale = 1) {
  // Trunks read darker than canopy, and canopy is green rather than a flat
  // silhouette — in daylight a black tree is the giveaway of a flat render.
  const trunk = p.foliageDark;
  const canopyLight = p.foliage;
  const canopyDark = p.foliageDark;
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const cx = rand(rng, -0.05, 1.05) * w;
    const trunkH = rand(rng, 0.07, 0.18) * w * scale;
    const canopy = rand(rng, 0.028, 0.06) * w * scale;
    const lean = rand(rng, -0.12, 0.12) * canopy;

    // Tapered trunk, slightly off vertical.
    out += `<polygon points="${(cx - canopy * 0.035).toFixed(1)},${baseY.toFixed(1)} ${(cx + canopy * 0.035).toFixed(1)},${baseY.toFixed(1)} ${(cx + lean + canopy * 0.015).toFixed(1)},${(baseY - trunkH).toFixed(1)} ${(cx + lean - canopy * 0.015).toFixed(1)},${(baseY - trunkH).toFixed(1)}" fill="${trunk}" opacity="0.92"/>`;

    // A few limbs.
    for (let b = 0; b < 3; b += 1) {
      const bx = cx + lean;
      const by = baseY - trunkH * rand(rng, 0.55, 0.95);
      out += `<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${(bx + rand(rng, -canopy, canopy)).toFixed(1)}" y2="${(by - rand(rng, canopy * 0.2, canopy * 0.7)).toFixed(1)}" stroke="${trunk}" stroke-width="${Math.max(1, canopy * 0.045).toFixed(1)}" opacity="0.85"/>`;
    }

    // Canopy mass. Blob count scales with canopy size so a large foreground
    // tree does not end up as a handful of oversized circles.
    const cy = baseY - trunkH - canopy * 0.25;
    const blobs = Math.round(randInt(rng, 16, 24) * Math.max(1, scale));
    for (let b = 0; b < blobs; b += 1) {
      const angle = rng() * Math.PI * 2;
      const dist = Math.pow(rng(), 0.6);
      const bx = cx + lean + Math.cos(angle) * dist * canopy * 1.05;
      const by = cy + Math.sin(angle) * dist * canopy * 0.68;
      const tone = by < cy ? canopyLight : canopyDark;
      out += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${(canopy * rand(rng, 0.11, 0.24)).toFixed(1)}" ry="${(canopy * rand(rng, 0.08, 0.17)).toFixed(1)}" fill="${tone}" opacity="${rand(rng, 0.7, 0.95).toFixed(2)}"/>`;
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Scene archetypes                                                            */
/* -------------------------------------------------------------------------- */

/** Wide exterior at dusk: horizontal massing, cantilever, water, glowing glass. */
function exteriorWide(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const horizon = h * rand(rng, 0.58, 0.66);
  const baseY = horizon;

  const bw = w * rand(rng, 0.72, 0.88);
  const bx = (w - bw) / 2 + rand(rng, -w * 0.05, w * 0.05);
  const upperH = h * rand(rng, 0.15, 0.2);
  const lowerH = h * rand(rng, 0.11, 0.15);
  const upperY = baseY - lowerH - upperH;

  const overhang = bw * rand(rng, 0.06, 0.12);
  const slabT = h * 0.016;

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)"/>`;

  // Distant treeline, hazed back but still holding its own value.
  s += `<g filter="url(#softer)" opacity="0.82">${planting(rng, p, horizon + h * 0.006, w, 11, 0.85)}</g>`;
  s += `<rect x="0" y="${(horizon - h * 0.16).toFixed(0)}" width="${w}" height="${(h * 0.16).toFixed(0)}" fill="${p.haze}" opacity="0.45"/>`;

  // Ground plane
  s += `<rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="url(#groundG)"/>`;

  // Paving joints, converging slightly toward the camera.
  for (let i = 1; i <= 7; i += 1) {
    const t = Math.pow(i / 8, 1.7);
    const y = horizon + t * (h - horizon);
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="1" fill="${p.concreteDark}" opacity="${(0.14 * (1 - t * 0.6)).toFixed(3)}"/>`;
  }

  // Lawn band between the treeline and the building.
  s += `<rect x="0" y="${horizon.toFixed(0)}" width="${w}" height="${(h * 0.035).toFixed(0)}" fill="${p.foliage}" opacity="0.55"/>`;

  // ---- Building --------------------------------------------------------
  // Lower storey, recessed and dark so the upper mass reads as floating
  const lowerInset = bw * 0.06;
  s += `<rect x="${bx + lowerInset}" y="${baseY - lowerH}" width="${bw - lowerInset * 2}" height="${lowerH}" fill="url(#wallDark)"/>`;
  s += windowBand(rng, p, bx + lowerInset, baseY - lowerH * 0.92, bw - lowerInset * 2, lowerH * 0.78, randInt(rng, 5, 8), { lit: 0.75 });

  // Cantilevered slab
  s += `<rect x="${bx - overhang}" y="${baseY - lowerH - slabT}" width="${bw + overhang * 2}" height="${slabT}" fill="${p.concreteLit}"/>`;
  s += `<rect x="${bx - overhang}" y="${baseY - lowerH}" width="${bw + overhang * 2}" height="${slabT * 0.6}" fill="#000" opacity="0.35" filter="url(#shadowBlur)"/>`;

  // Upper mass: solid end + long glazed run
  const solidW = bw * rand(rng, 0.22, 0.34);
  const solidLeft = rng() < 0.5;
  const solidX = solidLeft ? bx : bx + bw - solidW;
  const glassX = solidLeft ? bx + solidW : bx;
  const glassW = bw - solidW;

  s += `<rect x="${glassX}" y="${upperY}" width="${glassW}" height="${upperH}" fill="url(#glassG)"/>`;
  s += windowBand(rng, p, glassX, upperY, glassW, upperH, randInt(rng, 6, 10), { lit: 0.55 });
  s += `<rect x="${solidX}" y="${upperY}" width="${solidW}" height="${upperH}" fill="url(#wallLit)"/>`;
  s += `<rect x="${solidX}" y="${upperY}" width="${solidW}" height="${upperH}" filter="url(#concreteTex)" opacity="0.5"/>`;

  // Roof slab with deep shadow beneath
  s += `<rect x="${bx - overhang}" y="${upperY - slabT}" width="${bw + overhang * 2}" height="${slabT}" fill="${p.concreteLit}"/>`;
  s += `<rect x="${bx - overhang}" y="${upperY}" width="${bw + overhang * 2}" height="${h * 0.03}" fill="#000" opacity="0.4" filter="url(#shadowBlur)"/>`;

  // Cast shadow raking away from the sun, then the contact shadow on top.
  const shadowLean = w * rand(rng, 0.08, 0.16) * (rng() < 0.5 ? -1 : 1);
  s += `<polygon points="${bx.toFixed(0)},${baseY.toFixed(0)} ${(bx + bw).toFixed(0)},${baseY.toFixed(0)} ${(bx + bw + shadowLean).toFixed(0)},${(baseY + h * 0.1).toFixed(0)} ${(bx + shadowLean).toFixed(0)},${(baseY + h * 0.1).toFixed(0)}" fill="${p.concreteDark}" opacity="0.3" filter="url(#soft)"/>`;
  s += contactShadow(bx, baseY + h * 0.004, bw, h * 0.009, 0.4);

  // Clipped hedges flanking the approach, to give the mid-ground a scale cue.
  for (const side of [-1, 1]) {
    const hw = bw * rand(rng, 0.1, 0.17);
    const hx = bx + bw / 2 + side * bw * rand(rng, 0.28, 0.42) - hw / 2;
    const hh = h * rand(rng, 0.022, 0.036);
    s += `<rect x="${hx.toFixed(0)}" y="${(baseY + h * 0.012).toFixed(0)}" width="${hw.toFixed(0)}" height="${hh.toFixed(0)}" fill="${p.foliage}"/>`;
    s += `<rect x="${hx.toFixed(0)}" y="${(baseY + h * 0.012).toFixed(0)}" width="${hw.toFixed(0)}" height="${(hh * 0.35).toFixed(0)}" fill="${p.sun}" opacity="0.2"/>`;
    s += `<rect x="${hx.toFixed(0)}" y="${(baseY + h * 0.012 + hh).toFixed(0)}" width="${hw.toFixed(0)}" height="${(hh * 0.22).toFixed(0)}" fill="${p.foliageDark}" opacity="0.5" filter="url(#shadowBlur)"/>`;
  }

  // ---- Water / reflection ---------------------------------------------
  const waterY = baseY + (h - baseY) * rand(rng, 0.22, 0.4);
  s += `<rect x="0" y="${waterY}" width="${w}" height="${h - waterY}" fill="${p.skyMid}" opacity="0.85"/>`;
  s += `<rect x="0" y="${waterY}" width="${w}" height="${(h * 0.006).toFixed(0)}" fill="${p.concreteDark}" opacity="0.25"/>`;
  s += `<g transform="translate(0 ${(waterY * 2).toFixed(1)}) scale(1 -1)" opacity="0.28" filter="url(#soft)">
      <rect x="${glassX}" y="${upperY}" width="${glassW}" height="${upperH}" fill="${p.glassLit}" opacity="0.5"/>
      <rect x="${solidX}" y="${upperY}" width="${solidW}" height="${upperH}" fill="${p.concreteMid}"/>
    </g>`;
  for (let i = 0; i < 26; i += 1) {
    const ry = rand(rng, waterY, h);
    s += `<rect x="${rand(rng, 0, w).toFixed(0)}" y="${ry.toFixed(0)}" width="${rand(rng, w * 0.03, w * 0.16).toFixed(0)}" height="${Math.max(1, h * 0.0016).toFixed(1)}" fill="${p.sun}" opacity="${rand(rng, 0.03, 0.13).toFixed(2)}"/>`;
  }

  s += foregroundMass(rng, p, w, h, rand(rng, 0.07, 0.13));

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Frontal elevation dominated by a screen: louvres, perforated brick, fins. */
function facade(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const baseY = h * rand(rng, 0.9, 0.95);

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)"/>`;

  const bw = w * rand(rng, 0.82, 0.96);
  const bx = (w - bw) / 2;
  const bh = baseY - h * rand(rng, 0.06, 0.14);
  const by = baseY - bh;

  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#wallLit)"/>`;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" filter="url(#concreteTex)" opacity="0.6"/>`;

  const mode = pick(rng, ["louvre", "perforated", "fins"]);

  if (mode === "louvre") {
    const rows = randInt(rng, 22, 38);
    const gap = bh / rows;
    for (let i = 0; i < rows; i += 1) {
      const y = by + i * gap;
      s += `<rect x="${bx}" y="${y.toFixed(1)}" width="${bw}" height="${(gap * 0.44).toFixed(1)}" fill="${p.concreteDark}" opacity="${rand(rng, 0.55, 0.85).toFixed(2)}"/>`;
      s += `<rect x="${bx}" y="${(y + gap * 0.44).toFixed(1)}" width="${bw}" height="${(gap * 0.1).toFixed(1)}" fill="${p.concreteLit}" opacity="0.5"/>`;
    }
  } else if (mode === "perforated") {
    const cols = randInt(rng, 16, 26);
    const cell = bw / cols;
    const rows = Math.max(6, Math.floor(bh / cell));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if ((r + c) % 2 === 0 && rng() < 0.82) {
          const px = bx + c * cell + cell * 0.22;
          const py = by + r * cell + cell * 0.22;
          const size = cell * 0.56;
          s += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="${p.glass}" opacity="${rand(rng, 0.5, 0.95).toFixed(2)}"/>`;
          if (rng() < 0.3) {
            s += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="${p.glassLit}" opacity="${rand(rng, 0.1, 0.4).toFixed(2)}"/>`;
          }
        }
      }
    }
  } else {
    const cols = randInt(rng, 14, 24);
    const cell = bw / cols;
    for (let c = 0; c < cols; c += 1) {
      const x = bx + c * cell;
      s += `<rect x="${x.toFixed(1)}" y="${by}" width="${(cell * 0.34).toFixed(1)}" height="${bh}" fill="${p.concreteLit}" opacity="0.9"/>`;
      s += `<rect x="${(x + cell * 0.34).toFixed(1)}" y="${by}" width="${(cell * 0.2).toFixed(1)}" height="${bh}" fill="#000" opacity="0.45"/>`;
      s += `<rect x="${(x + cell * 0.54).toFixed(1)}" y="${by}" width="${(cell * 0.46).toFixed(1)}" height="${bh}" fill="${p.glass}" opacity="0.8"/>`;
    }
  }

  // A deep recessed opening gives the elevation a focal point.
  const openW = bw * rand(rng, 0.16, 0.26);
  const openH = bh * rand(rng, 0.3, 0.45);
  const openX = bx + rand(rng, 0.12, 0.66) * (bw - openW);
  const openY = baseY - openH;
  s += `<rect x="${openX.toFixed(1)}" y="${openY.toFixed(1)}" width="${openW.toFixed(1)}" height="${openH.toFixed(1)}" fill="${p.silhouette}"/>`;
  s += `<rect x="${(openX + openW * 0.1).toFixed(1)}" y="${(openY + openH * 0.12).toFixed(1)}" width="${(openW * 0.8).toFixed(1)}" height="${(openH * 0.8).toFixed(1)}" fill="${p.glassLit}" opacity="${rand(rng, 0.25, 0.6).toFixed(2)}" filter="url(#soft)"/>`;

  // Ground and cast shadow
  s += `<rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="url(#groundG)"/>`;
  s += contactShadow(bx, baseY + h * 0.004, bw, h * 0.01, 0.55);

  // Raking light across the facade
  const lightX = rand(rng, 0.1, 0.9) * w;
  s += `<polygon points="${lightX},${by} ${(lightX + w * 0.22).toFixed(0)},${by} ${(lightX + w * 0.08).toFixed(0)},${baseY} ${(lightX - w * 0.14).toFixed(0)},${baseY}" fill="${p.sun}" opacity="0.09" filter="url(#softer)"/>`;

  s += foregroundMass(rng, p, w, h, rand(rng, 0.06, 0.11));

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Enclosed courtyard: walls on three sides, a slot of sky, planting below. */
function courtyard(rng, p, w, h) {
  const d = defs(p, rng, w, h);

  let s = `<rect width="${w}" height="${h}" fill="${p.concreteDark}"/>`;

  // Sky slot overhead
  const slotY = h * rand(rng, 0.06, 0.14);
  const slotInset = w * rand(rng, 0.16, 0.26);
  s += `<rect x="${slotInset}" y="0" width="${w - slotInset * 2}" height="${slotY}" fill="url(#sky)"/>`;
  s += `<rect x="${slotInset}" y="0" width="${w - slotInset * 2}" height="${slotY}" fill="url(#sunGlow)" opacity="0.8"/>`;

  // Rear wall, lit
  const rearX = w * 0.14;
  const rearW = w * 0.72;
  const floorY = h * rand(rng, 0.74, 0.82);
  s += `<rect x="${rearX}" y="${slotY}" width="${rearW}" height="${floorY - slotY}" fill="url(#wallLit)"/>`;
  s += `<rect x="${rearX}" y="${slotY}" width="${rearW}" height="${floorY - slotY}" filter="url(#concreteTex)" opacity="0.55"/>`;

  // Glazed opening into the interior
  const gW = rearW * rand(rng, 0.42, 0.62);
  const gX = rearX + rand(rng, 0.1, 0.5) * (rearW - gW);
  const gH = (floorY - slotY) * rand(rng, 0.45, 0.62);
  s += windowBand(rng, p, gX, floorY - gH, gW, gH, randInt(rng, 3, 6), { lit: 0.8 });

  // Side walls in perspective, dark
  s += `<polygon points="0,0 ${rearX},${slotY} ${rearX},${floorY} 0,${h}" fill="url(#wallSide)"/>`;
  s += `<polygon points="${w},0 ${rearX + rearW},${slotY} ${rearX + rearW},${floorY} ${w},${h}" fill="url(#wallSide)"/>`;
  s += `<polygon points="${w},0 ${rearX + rearW},${slotY} ${rearX + rearW},${floorY} ${w},${h}" fill="#000" opacity="0.3"/>`;

  // Floor
  s += `<polygon points="${rearX},${floorY} ${rearX + rearW},${floorY} ${w},${h} 0,${h}" fill="url(#groundG)"/>`;

  // Pool of daylight on the floor, thrown from the slot above
  const poolX = w * rand(rng, 0.3, 0.6);
  s += `<polygon points="${(poolX - w * 0.14).toFixed(0)},${floorY} ${(poolX + w * 0.14).toFixed(0)},${floorY} ${(poolX + w * 0.26).toFixed(0)},${h} ${(poolX - w * 0.3).toFixed(0)},${h}" fill="${p.sun}" opacity="0.16" filter="url(#soft)"/>`;

  // A single tree in the court
  s += planting(rng, p, floorY + h * 0.04, w * 0.8, 1, 1.9);

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/**
 * One-point-perspective interior.
 *
 * Built up the way the room would be: shell, then joinery and floor jointing on
 * the perspective grid, then the window wall, then furniture, then light. The
 * jointing is what sells the depth — an unarticulated box reads as a diagram.
 */
function interior(rng, p, w, h) {
  const d = defs(p, rng, w, h);

  const vpX = w * rand(rng, 0.42, 0.58);
  const vpY = h * rand(rng, 0.46, 0.54);
  const backW = w * rand(rng, 0.44, 0.56);
  const backH = h * rand(rng, 0.42, 0.52);
  const bx = vpX - backW / 2;
  const by = vpY - backH / 2;
  const bx2 = bx + backW;
  const by2 = by + backH;

  /** Interpolates a point from the frame edge toward the back-wall corner. */
  const lerp = (ax, ay, bxx, byy, t) => [ax + (bxx - ax) * t, ay + (byy - ay) * t];

  let s = `<rect width="${w}" height="${h}" fill="${p.concreteDark}"/>`;

  // ---- Shell ------------------------------------------------------------
  s += `<polygon points="0,0 ${bx},${by} ${bx},${by2} 0,${h}" fill="url(#wallSide)"/>`;
  s += `<polygon points="${w},0 ${bx2},${by} ${bx2},${by2} ${w},${h}" fill="url(#wallSide)"/>`;
  // The right wall faces away from the window, so it sits in shadow.
  s += `<polygon points="${w},0 ${bx2},${by} ${bx2},${by2} ${w},${h}" fill="#000" opacity="0.26"/>`;
  s += `<polygon points="0,0 ${w},0 ${bx2},${by} ${bx},${by}" fill="${p.concreteDark}"/>`;
  s += `<polygon points="0,${h} ${w},${h} ${bx2},${by2} ${bx},${by2}" fill="url(#groundG)"/>`;

  // ---- Floor jointing, converging to the vanishing point ----------------
  const planks = randInt(rng, 7, 11);
  for (let i = 1; i < planks; i += 1) {
    const t = i / planks;
    const frontX = t * w;
    const backXi = bx + t * backW;
    s += `<line x1="${frontX.toFixed(0)}" y1="${h}" x2="${backXi.toFixed(0)}" y2="${by2.toFixed(0)}" stroke="${p.silhouette}" stroke-width="${Math.max(1, w * 0.0011).toFixed(1)}" opacity="0.2"/>`;
  }
  // Cross joints, spaced by perspective so they crowd toward the back.
  for (let i = 1; i <= 6; i += 1) {
    const t = Math.pow(i / 7, 0.55);
    const [lx, ly] = lerp(0, h, bx, by2, t);
    const [rx, ry] = lerp(w, h, bx2, by2, t);
    s += `<line x1="${lx.toFixed(0)}" y1="${ly.toFixed(0)}" x2="${rx.toFixed(0)}" y2="${ry.toFixed(0)}" stroke="${p.silhouette}" stroke-width="${Math.max(1, w * 0.0009).toFixed(1)}" opacity="0.14"/>`;
  }

  // ---- Joinery on the left wall ----------------------------------------
  const bays = randInt(rng, 4, 7);
  for (let i = 1; i < bays; i += 1) {
    const t = i / bays;
    const [tx, ty] = lerp(0, 0, bx, by, t);
    const [bxp, byp] = lerp(0, h, bx, by2, t);
    s += `<line x1="${tx.toFixed(0)}" y1="${ty.toFixed(0)}" x2="${bxp.toFixed(0)}" y2="${byp.toFixed(0)}" stroke="${p.silhouette}" stroke-width="${Math.max(1, w * 0.0013).toFixed(1)}" opacity="0.26"/>`;
    s += `<line x1="${(tx + w * 0.002).toFixed(0)}" y1="${ty.toFixed(0)}" x2="${(bxp + w * 0.002).toFixed(0)}" y2="${byp.toFixed(0)}" stroke="${p.concreteLit}" stroke-width="${Math.max(1, w * 0.0007).toFixed(1)}" opacity="0.16"/>`;
  }
  // Skirting / shadow gap where the wall meets the floor.
  s += `<line x1="0" y1="${h}" x2="${bx}" y2="${by2}" stroke="${p.silhouette}" stroke-width="${Math.max(2, w * 0.0022).toFixed(1)}" opacity="0.45"/>`;
  s += `<line x1="${w}" y1="${h}" x2="${bx2}" y2="${by2}" stroke="${p.silhouette}" stroke-width="${Math.max(2, w * 0.0022).toFixed(1)}" opacity="0.45"/>`;

  // ---- Ceiling: recessed slot plus a few rafts --------------------------
  s += `<polygon points="${(w * 0.42).toFixed(0)},0 ${(w * 0.58).toFixed(0)},0 ${(bx + backW * 0.56).toFixed(0)},${by.toFixed(0)} ${(bx + backW * 0.44).toFixed(0)},${by.toFixed(0)}" fill="${p.sun}" opacity="0.1"/>`;
  const rafts = randInt(rng, 3, 5);
  for (let i = 1; i <= rafts; i += 1) {
    const t = Math.pow(i / (rafts + 1), 0.7);
    const [lx, ly] = lerp(0, 0, bx, by, t);
    const [rx, ry] = lerp(w, 0, bx2, by, t);
    s += `<line x1="${lx.toFixed(0)}" y1="${ly.toFixed(0)}" x2="${rx.toFixed(0)}" y2="${ry.toFixed(0)}" stroke="${p.concreteLit}" stroke-width="${Math.max(2, h * 0.0045).toFixed(1)}" opacity="${(0.08 + t * 0.12).toFixed(2)}"/>`;
    s += `<line x1="${lx.toFixed(0)}" y1="${(ly + h * 0.006).toFixed(0)}" x2="${rx.toFixed(0)}" y2="${(ry + h * 0.006).toFixed(0)}" stroke="#000" stroke-width="${Math.max(1, h * 0.003).toFixed(1)}" opacity="0.2"/>`;
  }

  // ---- Window wall ------------------------------------------------------
  // Graded rather than blown out, with a horizon and a hint of what is beyond.
  s += `<rect x="${bx}" y="${by}" width="${backW}" height="${backH}" fill="${p.glassLit}" opacity="0.9"/>`;
  const horizon = by + backH * rand(rng, 0.52, 0.66);
  s += `<rect x="${bx}" y="${by}" width="${backW}" height="${(horizon - by).toFixed(1)}" fill="${p.haze}" opacity="0.22"/>`;
  s += `<rect x="${bx}" y="${horizon.toFixed(1)}" width="${backW}" height="${(by2 - horizon).toFixed(1)}" fill="${p.concreteMid}" opacity="0.3"/>`;
  // Distant massing beyond the glass.
  for (let i = 0; i < randInt(rng, 3, 6); i += 1) {
    const mw = backW * rand(rng, 0.08, 0.2);
    const mh = backH * rand(rng, 0.06, 0.18);
    s += `<rect x="${(bx + rand(rng, 0, 1) * (backW - mw)).toFixed(1)}" y="${(horizon - mh).toFixed(1)}" width="${mw.toFixed(1)}" height="${mh.toFixed(1)}" fill="${p.concreteMid}" opacity="${rand(rng, 0.18, 0.4).toFixed(2)}"/>`;
  }
  s += `<g opacity="0.5">${planting(rng, p, horizon + backH * 0.02, backW, 3, 0.28)}</g>`;
  s += `<rect x="${bx}" y="${by}" width="${backW}" height="${backH}" fill="url(#hazeG)" opacity="0.5"/>`;

  // Mullions and the reveal around the opening.
  const panels = randInt(rng, 3, 5);
  const pw = backW / panels;
  for (let i = 1; i < panels; i += 1) {
    s += `<rect x="${(bx + i * pw - backW * 0.004).toFixed(1)}" y="${by.toFixed(1)}" width="${(backW * 0.008).toFixed(1)}" height="${backH.toFixed(1)}" fill="${p.silhouette}" opacity="0.55"/>`;
  }
  s += `<rect x="${bx}" y="${by}" width="${backW}" height="${(backH * 0.035).toFixed(1)}" fill="${p.silhouette}" opacity="0.6"/>`;
  s += `<rect x="${bx}" y="${(by2 - backH * 0.025).toFixed(1)}" width="${backW}" height="${(backH * 0.025).toFixed(1)}" fill="${p.silhouette}" opacity="0.5"/>`;

  // ---- Light thrown into the room --------------------------------------
  s += `<polygon points="${bx},${by2} ${bx2},${by2} ${(bx + backW * 1.75).toFixed(0)},${h} ${(bx - backW * 0.75).toFixed(0)},${h}" fill="${p.sun}" opacity="0.16" filter="url(#soft)"/>`;

  // ---- Furniture --------------------------------------------------------
  const groundAt = (t) => by2 + (h - by2) * t; // depth 0 = back wall, 1 = camera
  const widthAt = (t) => backW + (w - backW) * t;
  const centreAt = (t) => bx + backW / 2 + (w / 2 - (bx + backW / 2)) * t;

  // Rug
  const rugT0 = 0.18;
  const rugT1 = 0.62;
  const rug = [
    [centreAt(rugT0) - widthAt(rugT0) * 0.3, groundAt(rugT0)],
    [centreAt(rugT0) + widthAt(rugT0) * 0.3, groundAt(rugT0)],
    [centreAt(rugT1) + widthAt(rugT1) * 0.34, groundAt(rugT1)],
    [centreAt(rugT1) - widthAt(rugT1) * 0.34, groundAt(rugT1)],
  ];
  s += `<polygon points="${rug.map(([px, py]) => `${px.toFixed(0)},${py.toFixed(0)}`).join(" ")}" fill="${p.concreteMid}" opacity="0.3"/>`;

  // Sofa: back, seat, arms — three masses, not one block.
  const sofaT = 0.34;
  const sofaY = groundAt(sofaT);
  const sofaW = widthAt(sofaT) * rand(rng, 0.4, 0.52);
  const sofaX = centreAt(sofaT) - sofaW / 2;
  const sofaH = (h - by2) * 0.16;
  s += contactShadow(sofaX, sofaY + sofaH * 0.1, sofaW, h * 0.01, 0.5);
  s += `<rect x="${sofaX.toFixed(0)}" y="${(sofaY - sofaH * 1.5).toFixed(0)}" width="${sofaW.toFixed(0)}" height="${(sofaH * 0.95).toFixed(0)}" fill="${p.silhouette}" opacity="0.82"/>`;
  s += `<rect x="${sofaX.toFixed(0)}" y="${(sofaY - sofaH * 0.62).toFixed(0)}" width="${sofaW.toFixed(0)}" height="${(sofaH * 0.62).toFixed(0)}" fill="${p.silhouette}" opacity="0.93"/>`;
  s += `<rect x="${sofaX.toFixed(0)}" y="${(sofaY - sofaH * 1.45).toFixed(0)}" width="${(sofaW * 0.09).toFixed(0)}" height="${(sofaH * 1.45).toFixed(0)}" fill="${p.silhouette}" opacity="0.96"/>`;
  s += `<rect x="${(sofaX + sofaW * 0.91).toFixed(0)}" y="${(sofaY - sofaH * 1.45).toFixed(0)}" width="${(sofaW * 0.09).toFixed(0)}" height="${(sofaH * 1.45).toFixed(0)}" fill="${p.silhouette}" opacity="0.96"/>`;

  // Coffee table
  const tblT = 0.5;
  const tblY = groundAt(tblT);
  const tblW = widthAt(tblT) * 0.26;
  const tblX = centreAt(tblT) - tblW / 2;
  s += contactShadow(tblX, tblY, tblW, h * 0.006, 0.4);
  s += `<rect x="${tblX.toFixed(0)}" y="${(tblY - (h - by2) * 0.062).toFixed(0)}" width="${tblW.toFixed(0)}" height="${((h - by2) * 0.022).toFixed(0)}" fill="${p.silhouette}" opacity="0.9"/>`;
  s += `<rect x="${(tblX + tblW * 0.08).toFixed(0)}" y="${(tblY - (h - by2) * 0.04).toFixed(0)}" width="${(tblW * 0.05).toFixed(0)}" height="${((h - by2) * 0.04).toFixed(0)}" fill="${p.silhouette}" opacity="0.8"/>`;
  s += `<rect x="${(tblX + tblW * 0.87).toFixed(0)}" y="${(tblY - (h - by2) * 0.04).toFixed(0)}" width="${(tblW * 0.05).toFixed(0)}" height="${((h - by2) * 0.04).toFixed(0)}" fill="${p.silhouette}" opacity="0.8"/>`;

  // Floor lamp, silhouetted against the glazing
  const lampT = 0.22;
  const lampX = centreAt(lampT) + widthAt(lampT) * rand(rng, 0.3, 0.42) * (rng() < 0.5 ? -1 : 1);
  const lampY = groundAt(lampT);
  const lampH = (h - by2) * 0.42;
  s += `<rect x="${lampX.toFixed(0)}" y="${(lampY - lampH).toFixed(0)}" width="${Math.max(2, w * 0.0035).toFixed(1)}" height="${lampH.toFixed(0)}" fill="${p.silhouette}" opacity="0.85"/>`;
  s += `<ellipse cx="${(lampX + w * 0.002).toFixed(0)}" cy="${(lampY - lampH).toFixed(0)}" rx="${(w * 0.022).toFixed(0)}" ry="${(h * 0.016).toFixed(0)}" fill="${p.sun}" opacity="0.5"/>`;
  s += `<ellipse cx="${(lampX + w * 0.002).toFixed(0)}" cy="${(lampY - lampH).toFixed(0)}" rx="${(w * 0.05).toFixed(0)}" ry="${(h * 0.045).toFixed(0)}" fill="${p.sun}" opacity="0.14" filter="url(#soft)"/>`;

  // Artwork on the shadowed wall
  const artT = rand(rng, 0.3, 0.5);
  const [ax1, ay1] = lerp(w, 0, bx2, by, artT);
  const [ax2, ay2] = lerp(w, h, bx2, by2, artT);
  const artTop = ay1 + (ay2 - ay1) * 0.3;
  const artBottom = ay1 + (ay2 - ay1) * 0.62;
  const artW = (w - bx2) * 0.12;
  s += `<polygon points="${ax1.toFixed(0)},${artTop.toFixed(0)} ${(ax1 - artW).toFixed(0)},${(artTop + (ay2 - ay1) * 0.03).toFixed(0)} ${(ax2 - artW).toFixed(0)},${(artBottom + (ay2 - ay1) * 0.03).toFixed(0)} ${ax2.toFixed(0)},${artBottom.toFixed(0)}" fill="${p.concreteLit}" opacity="0.14"/>`;

  // A low bench against the shadowed wall, to stop that side reading as blank.
  const benchT = rand(rng, 0.24, 0.4);
  const [bex1, bey1] = lerp(w, h, bx2, by2, benchT);
  const [bex2, bey2] = lerp(w, h, bx2, by2, benchT + 0.16);
  s += `<polygon points="${bex1.toFixed(0)},${bey1.toFixed(0)} ${bex2.toFixed(0)},${bey2.toFixed(0)} ${bex2.toFixed(0)},${(bey2 - (h - by2) * 0.07).toFixed(0)} ${bex1.toFixed(0)},${(bey1 - (h - by2) * 0.09).toFixed(0)}" fill="${p.silhouette}" opacity="0.7"/>`;

  // ---- Foreground framing ----------------------------------------------
  if (rng() < 0.55) {
    const colW = w * rand(rng, 0.055, 0.1);
    const colX = rng() < 0.5 ? 0 : w - colW;
    s += `<rect x="${colX}" y="0" width="${colW}" height="${h}" fill="${p.silhouette}" opacity="0.96"/>`;
    s += `<rect x="${colX === 0 ? colW : colX - w * 0.008}" y="0" width="${(w * 0.008).toFixed(1)}" height="${h}" fill="#000" opacity="0.35" filter="url(#shadowBlur)"/>`;
  }

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Receding colonnade — verandah, light between columns. */
function colonnade(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const vpX = w * rand(rng, 0.62, 0.82);
  const floorY = h * rand(rng, 0.78, 0.86);
  const ceilY = h * rand(rng, 0.1, 0.18);

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)" opacity="0.9"/>`;

  // Ground beyond
  s += `<rect x="0" y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#groundG)"/>`;

  // Ceiling and floor of the verandah, converging
  s += `<polygon points="0,0 ${w},0 ${vpX},${ceilY} 0,${ceilY * 0.4}" fill="${p.concreteDark}"/>`;
  s += `<polygon points="0,${h} ${w},${h} ${vpX},${floorY} 0,${floorY * 1.05}" fill="url(#groundG)"/>`;

  // Columns, spacing and width shrinking toward the vanishing point
  const count = randInt(rng, 5, 8);
  for (let i = 0; i < count; i += 1) {
    const t = Math.pow(i / count, 1.55);
    const x = t * vpX;
    const colW = w * 0.075 * (1 - t * 0.82);
    const top = ceilY * 0.4 + (ceilY - ceilY * 0.4) * t;
    const bottom = floorY * 1.05 - (floorY * 1.05 - floorY) * t;

    // Cast shadow on the floor first, so columns overlap it
    s += `<polygon points="${x.toFixed(0)},${bottom.toFixed(0)} ${(x + colW).toFixed(0)},${bottom.toFixed(0)} ${(x + colW * 3.4).toFixed(0)},${h} ${(x + colW * 1.6).toFixed(0)},${h}" fill="#000" opacity="${(0.34 - t * 0.2).toFixed(2)}"/>`;

    s += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${colW.toFixed(1)}" height="${(bottom - top).toFixed(1)}" fill="url(#wallLit)"/>`;
    s += `<rect x="${(x + colW * 0.62).toFixed(1)}" y="${top.toFixed(1)}" width="${(colW * 0.38).toFixed(1)}" height="${(bottom - top).toFixed(1)}" fill="#000" opacity="0.42"/>`;
  }

  // Wall behind the colonnade
  s += `<rect x="${vpX}" y="${ceilY}" width="${w - vpX}" height="${floorY - ceilY}" fill="url(#wallSide)"/>`;
  s += windowBand(rng, p, vpX + (w - vpX) * 0.12, ceilY + (floorY - ceilY) * 0.2, (w - vpX) * 0.7, (floorY - ceilY) * 0.6, 2, { lit: 0.9 });

  s += `<rect x="0" y="${floorY - h * 0.1}" width="${w}" height="${h * 0.1}" fill="url(#hazeG)" opacity="0.35"/>`;

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Close material study: raking light across a textured plane. */
function detail(rng, p, w, h) {
  const d = defs(p, rng, w, h);

  let s = `<rect width="${w}" height="${h}" fill="url(#wallLit)"/>`;
  s += `<rect width="${w}" height="${h}" filter="url(#concreteTex)" opacity="0.9"/>`;

  // Board-form or shuttering lines
  const boards = randInt(rng, 8, 16);
  const gap = h / boards;
  for (let i = 0; i <= boards; i += 1) {
    const y = i * gap;
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="${Math.max(1.5, h * 0.0022).toFixed(1)}" fill="#000" opacity="${rand(rng, 0.14, 0.3).toFixed(2)}"/>`;
    s += `<rect x="0" y="${(y + h * 0.0022).toFixed(1)}" width="${w}" height="${Math.max(1, h * 0.0014).toFixed(1)}" fill="${p.concreteLit}" opacity="0.35"/>`;
  }

  // Tie holes
  const cols = randInt(rng, 3, 5);
  for (let r = 1; r < boards; r += 3) {
    for (let c = 1; c <= cols; c += 1) {
      const cx = (c / (cols + 1)) * w;
      const cy = r * gap;
      s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${(w * 0.006).toFixed(1)}" fill="#000" opacity="0.32"/>`;
      s += `<circle cx="${cx.toFixed(0)}" cy="${(cy - w * 0.003).toFixed(0)}" r="${(w * 0.006).toFixed(1)}" fill="${p.concreteLit}" opacity="0.22"/>`;
    }
  }

  // A hard-edged shadow raking across the plane
  const angle = rand(rng, 0.18, 0.45);
  const edge = rand(rng, 0.25, 0.6) * w;
  s += `<polygon points="${edge.toFixed(0)},0 ${w},0 ${w},${h} ${(edge + h * angle).toFixed(0)},${h}" fill="#000" opacity="0.42"/>`;
  s += `<polygon points="${edge.toFixed(0)},0 ${(edge + w * 0.02).toFixed(0)},0 ${(edge + h * angle + w * 0.02).toFixed(0)},${h} ${(edge + h * angle).toFixed(0)},${h}" fill="${p.sun}" opacity="0.12" filter="url(#soft)"/>`;

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Abstract massing study — used for the visualisation service. */
function massing(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const baseY = h * 0.78;

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)" opacity="0.7"/>`;

  // Ground grid, in perspective
  s += `<rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="url(#groundG)"/>`;
  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14;
    const y = baseY + Math.pow(t, 1.9) * (h - baseY);
    s += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="1" fill="${p.concreteLit}" opacity="${(0.16 * (1 - t)).toFixed(3)}"/>`;
  }

  // Stacked, offset volumes
  const count = randInt(rng, 4, 7);
  let cursorX = w * 0.1;
  for (let i = 0; i < count; i += 1) {
    const bw = w * rand(rng, 0.09, 0.18);
    const bh = h * rand(rng, 0.14, 0.42);
    const depth = bw * 0.34;
    const y = baseY - bh;

    s += contactShadow(cursorX, baseY + h * 0.004, bw + depth, h * 0.008, 0.5);
    // Front face
    s += `<rect x="${cursorX.toFixed(0)}" y="${y.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="url(#wallLit)"/>`;
    // Side face
    s += `<polygon points="${(cursorX + bw).toFixed(0)},${y.toFixed(0)} ${(cursorX + bw + depth).toFixed(0)},${(y - depth * 0.5).toFixed(0)} ${(cursorX + bw + depth).toFixed(0)},${(baseY - depth * 0.5).toFixed(0)} ${(cursorX + bw).toFixed(0)},${baseY.toFixed(0)}" fill="url(#wallSide)"/>`;
    // Top face
    s += `<polygon points="${cursorX.toFixed(0)},${y.toFixed(0)} ${(cursorX + depth).toFixed(0)},${(y - depth * 0.5).toFixed(0)} ${(cursorX + bw + depth).toFixed(0)},${(y - depth * 0.5).toFixed(0)} ${(cursorX + bw).toFixed(0)},${y.toFixed(0)}" fill="${p.concreteLit}" opacity="0.75"/>`;

    if (rng() < 0.6) {
      s += windowBand(rng, p, cursorX + bw * 0.12, y + bh * 0.2, bw * 0.76, bh * 0.5, randInt(rng, 2, 4), { lit: 0.5 });
    }

    cursorX += bw * rand(rng, 0.85, 1.25);
    if (cursorX > w * 0.92) break;
  }

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Structural frame under construction — used for project management. */
function frame(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const baseY = h * 0.88;

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)" opacity="0.6"/>`;
  s += `<rect x="0" y="${baseY}" width="${w}" height="${h - baseY}" fill="url(#groundG)"/>`;

  const bays = randInt(rng, 5, 8);
  const floors = randInt(rng, 4, 6);
  const fw = w * 0.9;
  const fx = w * 0.05;
  const fh = baseY - h * 0.08;
  const fy = baseY - fh;
  const colW = Math.max(3, w * 0.009);
  const slabH = Math.max(4, h * 0.012);

  // Slabs
  for (let i = 0; i <= floors; i += 1) {
    const y = fy + (fh / floors) * i;
    s += `<rect x="${fx}" y="${y.toFixed(1)}" width="${fw}" height="${slabH}" fill="${p.concreteLit}" opacity="0.92"/>`;
    s += `<rect x="${fx}" y="${(y + slabH).toFixed(1)}" width="${fw}" height="${(slabH * 0.8).toFixed(1)}" fill="#000" opacity="0.3"/>`;
  }
  // Columns
  for (let i = 0; i <= bays; i += 1) {
    const x = fx + (fw / bays) * i;
    s += `<rect x="${x.toFixed(1)}" y="${fy}" width="${colW.toFixed(1)}" height="${fh.toFixed(1)}" fill="${p.concreteMid}"/>`;
    s += `<rect x="${(x + colW * 0.6).toFixed(1)}" y="${fy}" width="${(colW * 0.4).toFixed(1)}" height="${fh.toFixed(1)}" fill="#000" opacity="0.4"/>`;
  }

  // Scaffold diagonals on a couple of bays
  for (let b = 0; b < bays; b += 1) {
    if (rng() > 0.35) continue;
    const x0 = fx + (fw / bays) * b;
    const x1 = x0 + fw / bays;
    for (let f = 0; f < floors; f += 1) {
      const y0 = fy + (fh / floors) * f;
      const y1 = y0 + fh / floors;
      s += `<line x1="${x0.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x1.toFixed(0)}" y2="${y0.toFixed(0)}" stroke="${p.concreteMid}" stroke-width="${(colW * 0.5).toFixed(1)}" opacity="0.55"/>`;
    }
  }

  s += contactShadow(fx, baseY + h * 0.006, fw, h * 0.012, 0.5);
  s += `<rect x="0" y="${baseY - h * 0.14}" width="${w}" height="${h * 0.14}" fill="url(#hazeG)" opacity="0.4"/>`;

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Sculptural stair lit from a rooflight above. */
function stair(rng, p, w, h) {
  const d = defs(p, rng, w, h);

  let s = `<rect width="${w}" height="${h}" fill="url(#wallSide)"/>`;
  s += `<rect width="${w}" height="${h}" filter="url(#concreteTex)" opacity="0.45"/>`;

  // Rooflight and the shaft of light it throws
  const lightX = w * rand(rng, 0.38, 0.62);
  const lightW = w * rand(rng, 0.2, 0.32);
  s += `<rect x="${(lightX - lightW / 2).toFixed(0)}" y="0" width="${lightW.toFixed(0)}" height="${(h * 0.05).toFixed(0)}" fill="${p.sun}" opacity="0.85"/>`;
  s += `<polygon points="${(lightX - lightW / 2).toFixed(0)},${(h * 0.05).toFixed(0)} ${(lightX + lightW / 2).toFixed(0)},${(h * 0.05).toFixed(0)} ${(lightX + lightW * 1.5).toFixed(0)},${h} ${(lightX - lightW * 1.5).toFixed(0)},${h}" fill="${p.sun}" opacity="0.15" filter="url(#soft)"/>`;

  // Flight of treads, stepping down and across
  const steps = randInt(rng, 11, 16);
  const startX = w * rand(rng, 0.16, 0.28);
  const startY = h * 0.24;
  const runX = (w * 0.52) / steps;
  const rise = (h * 0.56) / steps;
  const treadD = w * 0.11;

  for (let i = 0; i < steps; i += 1) {
    const x = startX + i * runX;
    const y = startY + i * rise;
    // Riser in shadow, tread catching the light
    s += `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${(x + treadD).toFixed(1)},${(y - rise * 0.45).toFixed(1)} ${(x + treadD).toFixed(1)},${(y - rise * 0.45 + rise * 0.4).toFixed(1)} ${x.toFixed(1)},${(y + rise * 0.4).toFixed(1)}" fill="${p.concreteLit}" opacity="${rand(rng, 0.72, 0.95).toFixed(2)}"/>`;
    s += `<polygon points="${x.toFixed(1)},${(y + rise * 0.4).toFixed(1)} ${(x + treadD).toFixed(1)},${(y - rise * 0.05).toFixed(1)} ${(x + treadD).toFixed(1)},${(y + rise * 0.6).toFixed(1)} ${x.toFixed(1)},${(y + rise).toFixed(1)}" fill="${p.silhouette}" opacity="0.85"/>`;
  }

  // Folded-plate stringer
  s += `<polygon points="${startX.toFixed(0)},${(startY + h * 0.05).toFixed(0)} ${(startX + steps * runX).toFixed(0)},${(startY + steps * rise + h * 0.05).toFixed(0)} ${(startX + steps * runX).toFixed(0)},${(startY + steps * rise + h * 0.13).toFixed(0)} ${startX.toFixed(0)},${(startY + h * 0.13).toFixed(0)}" fill="${p.silhouette}" opacity="0.95"/>`;

  // Floor and its reflection of the light shaft
  const floorY = h * 0.88;
  s += `<rect x="0" y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#groundG)"/>`;
  s += `<ellipse cx="${lightX.toFixed(0)}" cy="${(floorY + h * 0.06).toFixed(0)}" rx="${(lightW * 1.3).toFixed(0)}" ry="${(h * 0.05).toFixed(0)}" fill="${p.sun}" opacity="0.13" filter="url(#soft)"/>`;

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/** Raised pavilions among trees. */
function pavilion(rng, p, w, h) {
  const d = defs(p, rng, w, h);
  const groundY = h * rand(rng, 0.76, 0.84);

  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#sunGlow)"/>`;

  s += `<g filter="url(#softer)" opacity="0.45">${planting(rng, p, groundY, w, 10, 0.9)}</g>`;
  s += `<rect x="0" y="${groundY}" width="${w}" height="${h - groundY}" fill="url(#groundG)"/>`;

  // Two pavilions at different depths
  const build = (cx, scale, opacity) => {
    const bw = w * 0.34 * scale;
    const bh = h * 0.22 * scale;
    const stiltH = h * 0.12 * scale;
    const y = groundY - stiltH - bh;
    let g = "";

    // Stilts
    for (let i = 0; i <= 4; i += 1) {
      const x = cx - bw / 2 + (bw / 4) * i;
      g += `<rect x="${x.toFixed(1)}" y="${(y + bh).toFixed(1)}" width="${(w * 0.008 * scale).toFixed(1)}" height="${stiltH.toFixed(1)}" fill="${p.silhouette}" opacity="0.9"/>`;
    }
    // Body + glazing
    g += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="url(#wallLit)"/>`;
    g += windowBand(rng, p, cx - bw / 2 + bw * 0.08, y + bh * 0.18, bw * 0.84, bh * 0.6, randInt(rng, 3, 5), { lit: 0.75 });
    // Pitched roof
    g += `<polygon points="${(cx - bw * 0.58).toFixed(1)},${y.toFixed(1)} ${cx.toFixed(1)},${(y - bh * 0.42).toFixed(1)} ${(cx + bw * 0.58).toFixed(1)},${y.toFixed(1)}" fill="${p.concreteDark}"/>`;
    g += `<polygon points="${(cx - bw * 0.58).toFixed(1)},${y.toFixed(1)} ${cx.toFixed(1)},${(y - bh * 0.42).toFixed(1)} ${cx.toFixed(1)},${(y - bh * 0.36).toFixed(1)} ${(cx - bw * 0.58).toFixed(1)},${(y + bh * 0.03).toFixed(1)}" fill="${p.concreteLit}" opacity="0.5"/>`;

    return `<g opacity="${opacity}">${g}</g>`;
  };

  s += build(w * rand(rng, 0.66, 0.8), 0.62, 0.55);
  s += build(w * rand(rng, 0.3, 0.44), 1, 1);

  s += foregroundMass(rng, p, w, h, rand(rng, 0.1, 0.16));
  s += `<rect x="0" y="${groundY - h * 0.12}" width="${w}" height="${h * 0.12}" fill="url(#hazeG)" opacity="0.45"/>`;

  return { defs: d.markup, body: s + finish(p, w, h) };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export const scenes = {
  exteriorWide,
  facade,
  courtyard,
  interior,
  colonnade,
  detail,
  massing,
  frame,
  stair,
  pavilion,
};

/**
 * Builds a complete SVG document for one image.
 *
 * @param {keyof typeof scenes} sceneName
 * @param {keyof typeof palettes} paletteName
 * @param {string} seed
 * @param {number} width
 * @param {number} height
 */
export function buildSvg(sceneName, paletteName, seed, width, height) {
  const scene = scenes[sceneName];
  if (!scene) throw new Error(`Unknown scene "${sceneName}"`);

  const palette = palettes[paletteName];
  if (!palette) throw new Error(`Unknown palette "${paletteName}"`);

  const rng = makeRng(`${sceneName}:${paletteName}:${seed}`);
  const { defs: defsMarkup, body } = scene(rng, palette, width, height);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>${defsMarkup}</defs>
  ${body}
</svg>`;
}
