/**
 * Renders the placeholder architectural imagery as real 3D.
 *
 *   npm run assets
 *
 * Launches headless Chromium, builds the villa scene in Three.js (see
 * `scripts/lib/villa-scene.js`), and renders one still per camera setup. The
 * result is graded and written as JPEG under `public/images/`.
 *
 * Why a browser: Three.js needs a WebGL context, and Chromium's SwiftShader
 * gives a real one without a GPU or any native module to compile. It is slower
 * than hardware but this runs once, offline, at build time.
 *
 * Output is deterministic — same seed, same image. Real photography replaces
 * these file-for-file; keep the paths and no code changes.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outRoot = join(root, "public", "images");

/* -------------------------------------------------------------------------- */
/* Camera setups                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Each shot is a real camera position in metres, aimed at a point on the villa.
 * These are the same coordinate space the live hero's camera path uses.
 */
const SHOTS = {
  approachWide: { position: [34, 11, 40], target: [0, 4, 0], fov: 34 },
  approachLow: { position: [26, 3.2, 34], target: [0, 4.5, 0], fov: 38 },
  frontal: { position: [2, 5.5, 40], target: [0, 4.6, 0], fov: 32 },
  threeQuarter: { position: [-30, 9, 30], target: [0, 4.2, 0], fov: 36 },
  aerial: { position: [24, 28, 30], target: [0, 3, 0], fov: 38 },
  poolside: { position: [4, 2.2, 30], target: [1, 5, 0], fov: 44 },
  entrance: { position: [-3.4, 2.1, 16], target: [-2.2, 2.4, 5], fov: 50 },
  colonnade: { position: [-13, 2.2, 9.2], target: [13, 2.6, 8.2], fov: 46 },
  louvres: { position: [7.5, 5.6, 12.5], target: [4, 5.6, 7.3], fov: 34 },
  livingOut: { position: [3, 6.1, -2.5], target: [6, 5.4, 12], fov: 58 },
  lowerOut: { position: [-1, 2.2, -1.5], target: [1, 2, 12], fov: 60 },
  cornerDetail: { position: [15.5, 6.4, 11], target: [11, 6, 3], fov: 32 },
  slabEdge: { position: [17, 4.4, 15], target: [6, 4.2, 6], fov: 30 },
  gardenSide: { position: [-18, 4.5, -22], target: [0, 4, 0], fov: 40 },

  // `plate` schemes are a single interior floor. There is no exterior to
  // photograph, so every camera lives inside the room and shoots toward the
  // glazing. Coordinates stay within the smallest plate (20 x 14) so one set
  // of setups works for all three interior projects.
  plateWide: { position: [-7, 2.0, -4.5], target: [5, 1.8, 6.5], fov: 62 },
  plateAxis: { position: [-8, 1.9, 1.5], target: [9, 1.7, 3.5], fov: 56 },
  plateCorner: { position: [-5.5, 2.1, 5.0], target: [8, 1.9, -3], fov: 50 },
  plateStair: { position: [6.2, 2.6, 5.4], target: [-1.2, 2.6, -1.0], fov: 52 },
  plateDetail: { position: [1.5, 1.7, 4.0], target: [-4, 1.6, -1.5], fov: 40 },
  plateOutlook: { position: [-6, 1.9, -3], target: [2, 1.6, 7], fov: 60 },

  // The coastal pavilion sits on columns and is smaller than the houses, so it
  // needs to be approached closer and from lower down.
  raisedApproach: { position: [21, 6.5, 25], target: [0, 4.2, 0], fov: 38 },
  raisedUnder: { position: [11, 1.3, 15], target: [-2, 3.4, 0], fov: 50 },
  raisedDeck: { position: [7, 4.6, 13], target: [-3, 4.2, 1], fov: 46 },

  // Inside the courtyard house, looking across the planted court.
  // Standing in the court itself. Shooting it from inside a wing meant looking
  // through two layers of tinted glass, which drained all the colour out of it.
  courtView: { position: [0, 2.3, 4.4], target: [0.3, 1.7, -4.6], fov: 56 },
  courtCorner: { position: [-5, 2.4, 5.0], target: [5, 2.0, -4], fov: 50 },
  // Glancing along the row of teak columns.
  colonnadeDetail: { position: [-7.0, 1.8, 4.5], target: [6.6, 2.1, 5.3], fov: 42 },
  // The living wing seen from the court it opens onto.
  courtWing: { position: [-3.5, 2.0, -2.0], target: [1.5, 2.0, 5.2], fov: 48 },
  // Raking light on plaster. Every face of the court is glazed across the
  // full storey band, so a plaster detail has to be taken on an outer wall.
  plasterDetail: { position: [-19.5, 1.8, 3.4], target: [-15.2, 2.8, -1.2], fov: 32 },

  // Inside the coastal pavilion. Its floor is lifted 2.6m, so the standard
  // interior cameras at eye height 2.2 sit under the deck, and `livingOut` at
  // 6.1 sits up inside the roof — both render as a blank band.
  raisedInside: { position: [-4.0, 4.2, -2.2], target: [4.0, 4.0, 6.0], fov: 58 },
  groveWalk: { position: [9, 1.7, 22], target: [-1, 3.4, 4], fov: 50 },

  // The sleeping end of the apartment plate.
  plateBedroom: { position: [8.8, 1.8, 3.0], target: [5.8, 1.05, -3.6], fov: 55 },
};

/** Aspect presets, in output pixels. */
const SIZES = {
  wide: [2400, 1500],
  cinema: [2400, 1350],
  portrait: [1600, 2000],
  landscape: [2000, 1500],
  og: [1200, 630],
};

const roleSizes = ["wide", "cinema", "portrait", "portrait", "landscape", "cinema"];
const roleNames = ["cover", "01", "02", "03", "04", "05"];

/**
 * Render scale before the downsample to output size. 1.5 costs a little over
 * twice the pixels and is what keeps mullions, louvre fins and foliage from
 * aliasing — SwiftShader's MSAA alone is not enough on geometry that thin.
 */
const SUPERSAMPLE = 1.5;

/**
 * Shot plan per project — [shot, sky] in the order
 * [cover, 01, 02, 03, 04, 05], chosen to match each image's alt text in
 * `src/data/projects.ts`.
 */
const projectPlans = {
  "modern-residence": [
    ["approachWide", "clear"],
    ["frontal", "clear"],
    ["entrance", "clear"],
    ["livingOut", "clear"],
    ["louvres", "high"],
    ["aerial", "clear"],
  ],
  "contemporary-villa": [
    ["threeQuarter", "clear"],
    ["approachLow", "clear"],
    ["colonnade", "high"],
    ["livingOut", "clear"],
    ["poolside", "clear"],
    ["gardenSide", "clear"],
  ],
  "urban-residence": [
    ["frontal", "high"],
    ["approachLow", "high"],
    ["entrance", "soft"],
    ["lowerOut", "clear"],
    ["threeQuarter", "soft"],
    ["aerial", "high"],
  ],
  // Interior-led: an apartment fit-out, so all six cameras are inside it.
  "luxury-interior": [
    ["plateAxis", "clear"],
    ["plateWide", "clear"],
    ["plateCorner", "high"],
    ["plateOutlook", "high"],
    ["plateBedroom", "clear"],
    ["plateDetail", "soft"],
  ],
  "courtyard-house": [
    ["courtCorner", "clear"],
    ["courtView", "clear"],
    ["colonnadeDetail", "high"],
    ["courtWing", "clear"],
    ["plasterDetail", "clear"],
    ["courtView", "soft"],
  ],
  "corporate-workplace": [
    ["plateWide", "soft"],
    ["plateAxis", "soft"],
    ["plateCorner", "soft"],
    ["plateOutlook", "high"],
    ["plateDetail", "soft"],
    ["plateWide", "high"],
  ],
  "coastal-retreat": [
    ["raisedApproach", "clear"],
    ["raisedUnder", "clear"],
    ["raisedDeck", "clear"],
    ["raisedInside", "clear"],
    ["groveWalk", "soft"],
    ["raisedApproach", "high"],
  ],
  // The stair is the project, so it leads and recurs.
  "penthouse-interiors": [
    ["plateStair", "clear"],
    ["plateAxis", "clear"],
    ["plateWide", "clear"],
    ["plateOutlook", "high"],
    ["plateStair", "soft"],
    ["plateCorner", "clear"],
  ],
};

/**
 * Standalone images used outside project pages. Each names the scheme it is
 * built from, so the site's general imagery is drawn from across the portfolio
 * rather than all showing the same house.
 */
const standalone = [
  { path: "hero-fallback.jpg", shot: "approachWide", sky: "clear", size: "wide", scheme: "contemporary-villa" },
  { path: "architecture.jpg", shot: "frontal", sky: "clear", size: "portrait", scheme: "modern-residence" },
  { path: "interiors.jpg", shot: "plateAxis", sky: "clear", size: "portrait", scheme: "luxury-interior" },
  { path: "about.jpg", shot: "courtView", sky: "clear", size: "landscape", scheme: "courtyard-house" },
  { path: "contact.jpg", shot: "poolside", sky: "clear", size: "cinema", scheme: "contemporary-villa" },
  { path: "experience.jpg", shot: "raisedApproach", sky: "clear", size: "wide", scheme: "coastal-retreat" },
  { path: "og.jpg", shot: "approachWide", sky: "clear", size: "og", scheme: "contemporary-villa" },
  { path: "services/architecture.jpg", shot: "approachLow", sky: "clear", size: "portrait", scheme: "modern-residence" },
  { path: "services/interior-design.jpg", shot: "plateWide", sky: "clear", size: "portrait", scheme: "luxury-interior" },
  { path: "services/visualisation.jpg", shot: "aerial", sky: "soft", size: "portrait", scheme: "contemporary-villa" },
  { path: "services/project-management.jpg", shot: "plateCorner", sky: "soft", size: "portrait", scheme: "corporate-workplace" },
];

/* -------------------------------------------------------------------------- */
/* Browser harness                                                             */
/* -------------------------------------------------------------------------- */

const PAGE_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; background:#000; overflow:hidden; }
  canvas { display:block; }
</style></head><body></body></html>`;

/**
 * Serves the page and the three.js build from node_modules over a fake origin,
 * so the browser resolves the module graph itself rather than us inlining it.
 */
async function installRoutes(page) {
  const threeDir = join(root, "node_modules", "three", "build");

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return route.fulfill({ contentType: "text/html", body: PAGE_HTML });
    }

    if (url.pathname.startsWith("/three/")) {
      const file = join(threeDir, url.pathname.replace("/three/", ""));
      return route.fulfill({
        contentType: "text/javascript",
        body: await readFile(file, "utf8"),
      });
    }

    if (url.pathname.startsWith("/scene/")) {
      const file = join(here, "lib", url.pathname.replace("/scene/", ""));
      return route.fulfill({
        contentType: "text/javascript",
        body: await readFile(file, "utf8"),
      });
    }

    return route.abort();
  });
}

/**
 * Renders one still and returns it as a PNG buffer.
 *
 * The renderer, scene and camera are rebuilt per image. Reusing a context
 * across 59 renders leaks GPU memory under SwiftShader and eventually loses
 * the context; rebuilding costs a second and never fails.
 */
async function renderShot(page, { width, height, shot, sky, seed, sunAngle, scheme }) {
  // Supersample, then let the resize down to target do the anti-aliasing.
  // MSAA alone leaves the mullions, louvre fins and foliage edges crawling,
  // and those thin elements are most of what says "render" rather than "photo".
  const scale = SUPERSAMPLE;
  const dataUrl = await page.evaluate(
    async ({ width, height, shot, sky, seed, sunAngle, scheme }) => {
      const THREE = await import("/three/three.module.js");
      const { buildScene } = await import("/scene/villa-scene.js");

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      document.body.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = buildScene(renderer, { seed, sky, sunAngle, scheme });

      const camera = new THREE.PerspectiveCamera(shot.fov, width / height, 0.1, 600);
      camera.position.set(...shot.position);
      camera.lookAt(...shot.target);

      renderer.render(scene, camera);
      const url = canvas.toDataURL("image/png");

      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      return url;
    },
    {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      shot,
      sky,
      seed,
      sunAngle,
      scheme,
    },
  );

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/** Corner falloff. Every real lens has some; a render has none at all. */
function vignette(width, height) {
  return Buffer.from(
    `<svg width="${width}" height="${height}">` +
      `<defs><radialGradient id="v" cx="50%" cy="46%" r="75%">` +
      `<stop offset="52%" stop-color="#000" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="#000" stop-opacity="0.34"/>` +
      `</radialGradient></defs>` +
      `<rect width="${width}" height="${height}" fill="url(#v)"/></svg>`,
  );
}

/**
 * Sensor noise, as a mid-grey overlay. Deterministic per image so a rebuild
 * does not silently churn every file.
 */
function grainLayer(width, height, seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const data = Buffer.allocUnsafe(width * height * 3);
  for (let i = 0; i < width * height; i += 1) {
    // Box-Muller would be more correct, but the average of two uniforms is
    // close enough to Gaussian at this amplitude and much cheaper.
    const v = 128 + ((next() + next()) / 2 - 0.5) * 26;
    const b = v < 0 ? 0 : v > 255 ? 255 : v;
    data[i * 3] = b;
    data[i * 3 + 1] = b;
    data[i * 3 + 2] = b;
  }
  return sharp(data, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

/**
 * Photographic finish. The render leaves the frame clean, evenly lit and
 * corner-to-corner sharp — which is exactly what reads as synthetic. This puts
 * back the things a camera adds: an S-curve, a warm/cool split between
 * highlight and shadow, corner falloff and a little grain.
 */
async function grade(png, width, height, outPath, seed) {
  const base = await sharp(png)
    .resize(width, height, { fit: "cover", kernel: "lanczos3" })
    // Contrast and a warm/cool split in one per-channel curve: red gains a
    // little, blue is lifted at the toe and held back at the top, so highlights
    // run warm and shadows keep the sky in them. Note `.tint()` would not do
    // this — it discards chroma and returns a single-hue image.
    .linear([1.15, 1.12, 1.06], [-14, -13, -7])
    .gamma(1.05)
    // Pull saturation back toward the site's stone palette.
    .modulate({ saturation: 0.86 })
    .toColourspace("srgb")
    .toBuffer();

  const buffer = await sharp(base)
    .composite([
      { input: vignette(width, height), blend: "over" },
      { input: await grainLayer(width, height, seed), blend: "overlay" },
    ])
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 2.2 })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
  return buffer.length;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

function hash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic sun angle per image, so the set is not uniformly lit. */
function sunAngleFor(seed) {
  return 0.25 + ((hash(seed) % 1000) / 1000) * 1.1;
}

async function main() {
  const started = Date.now();

  const browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--disable-lcd-text",
      "--force-color-profile=srgb",
    ],
  });

  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await installRoutes(page);
  await page.goto("http://render.local/index.html");

  const jobs = [];

  for (const [slug, plan] of Object.entries(projectPlans)) {
    plan.forEach(([shotName, sky], i) => {
      jobs.push({
        seed: `${slug}-${roleNames[i]}`,
        shot: SHOTS[shotName],
        shotName,
        sky,
        size: SIZES[roleSizes[i]],
        out: join(outRoot, "projects", slug, `${roleNames[i]}.jpg`),
        label: `${slug}/${roleNames[i]}`,
        // Scheme keys match project slugs, so each project builds its own design.
        scheme: slug,
      });
    });
  }

  for (const item of standalone) {
    jobs.push({
      seed: item.path,
      shot: SHOTS[item.shot],
      shotName: item.shot,
      sky: item.sky,
      size: SIZES[item.size],
      out: join(outRoot, item.path),
      label: item.path,
      scheme: item.scheme,
    });
  }

  // Optional substring filters: `npm run assets -- coastal penthouse` renders
  // only the matching images. Rendering all of them takes twenty minutes on
  // SwiftShader, which is too slow a loop when you are iterating on one scheme.
  const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (filters.length) {
    // Only touch `jobs` when actually filtering. Assigning the unfiltered list
    // back to itself and then clearing it empties both — they are one array.
    const selected = jobs.filter((j) => filters.some((f) => j.label.includes(f)));
    process.stdout.write(`  filtered to ${selected.length}/${jobs.length} images\n`);
    jobs.length = 0;
    jobs.push(...selected);
  }

  let bytes = 0;
  for (let i = 0; i < jobs.length; i += 1) {
    const job = jobs[i];
    const [width, height] = job.size;

    const png = await renderShot(page, {
      width,
      height,
      shot: job.shot,
      sky: job.sky,
      seed: job.seed,
      sunAngle: sunAngleFor(job.seed),
      scheme: job.scheme,
    });

    bytes += await grade(png, width, height, job.out, hash(job.seed));
    process.stdout.write(
      `  [${String(i + 1).padStart(2)}/${jobs.length}] ${job.label} (${job.shotName})\n`,
    );
  }

  await browser.close();

  process.stdout.write(
    `\n${jobs.length} images rendered — ${(bytes / 1024 / 1024).toFixed(1)} MB, ` +
      `${((Date.now() - started) / 1000).toFixed(0)}s\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
