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
  "luxury-interior": [
    ["livingOut", "clear"],
    ["lowerOut", "clear"],
    ["cornerDetail", "high"],
    ["livingOut", "high"],
    ["colonnade", "clear"],
    ["louvres", "clear"],
  ],
  "courtyard-house": [
    ["colonnade", "clear"],
    ["entrance", "clear"],
    ["colonnade", "high"],
    ["lowerOut", "clear"],
    ["louvres", "high"],
    ["gardenSide", "clear"],
  ],
  "corporate-workplace": [
    ["lowerOut", "soft"],
    ["livingOut", "soft"],
    ["colonnade", "soft"],
    ["livingOut", "high"],
    ["cornerDetail", "soft"],
    ["frontal", "soft"],
  ],
  "coastal-retreat": [
    ["poolside", "clear"],
    ["approachLow", "clear"],
    ["colonnade", "clear"],
    ["livingOut", "clear"],
    ["gardenSide", "soft"],
    ["approachWide", "clear"],
  ],
  "penthouse-interiors": [
    ["cornerDetail", "clear"],
    ["slabEdge", "clear"],
    ["livingOut", "clear"],
    ["lowerOut", "high"],
    ["louvres", "clear"],
    ["colonnade", "clear"],
  ],
};

/** Standalone images used outside project pages. */
const standalone = [
  { path: "hero-fallback.jpg", shot: "approachWide", sky: "clear", size: "wide" },
  { path: "architecture.jpg", shot: "frontal", sky: "clear", size: "portrait" },
  { path: "interiors.jpg", shot: "livingOut", sky: "clear", size: "portrait" },
  { path: "about.jpg", shot: "colonnade", sky: "clear", size: "landscape" },
  { path: "contact.jpg", shot: "poolside", sky: "clear", size: "cinema" },
  { path: "experience.jpg", shot: "threeQuarter", sky: "clear", size: "wide" },
  { path: "og.jpg", shot: "approachWide", sky: "clear", size: "og" },
  { path: "services/architecture.jpg", shot: "approachLow", sky: "clear", size: "portrait" },
  { path: "services/interior-design.jpg", shot: "lowerOut", sky: "clear", size: "portrait" },
  { path: "services/visualisation.jpg", shot: "aerial", sky: "soft", size: "portrait" },
  { path: "services/project-management.jpg", shot: "slabEdge", sky: "soft", size: "portrait" },
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
async function renderShot(page, { width, height, shot, sky, seed, sunAngle }) {
  const dataUrl = await page.evaluate(
    async ({ width, height, shot, sky, seed, sunAngle }) => {
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
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = buildScene(renderer, { seed, sky, sunAngle });

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
    { width, height, shot, sky, seed, sunAngle },
  );

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/**
 * Photographic finish: a gentle lift, slight desaturation toward the site's
 * stone palette, and mild sharpening. Rendered output is clean to the point of
 * looking synthetic; this is what pulls it back toward a photograph.
 */
async function grade(png, width, height, outPath) {
  const buffer = await sharp(png)
    .resize(width, height, { fit: "cover" })
    .modulate({ brightness: 1.03, saturation: 0.9 })
    .linear(1.04, 2)
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
  return buffer.length;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

/** Deterministic sun angle per image, so the set is not uniformly lit. */
function sunAngleFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 0.25 + (h % 1000) / 1000 * 1.1;
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
    });
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
    });

    bytes += await grade(png, width, height, job.out);
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
