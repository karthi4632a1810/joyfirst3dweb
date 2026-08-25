/**
 * Generates every placeholder architectural image under `public/images`.
 *
 *   npm run assets
 *
 * Output is deterministic. Real photography replaces these file-for-file — keep
 * the paths and nothing else has to change.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { buildSvg } from "./lib/scene.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(root, "public", "images");

/** Aspect presets, in output pixels. */
const SIZES = {
  wide: [2400, 1500], // 16:10 — covers, hero
  cinema: [2400, 1350], // 16:9 — full-bleed gallery
  portrait: [1600, 2000], // 4:5 — half-width gallery, services
  landscape: [2000, 1500], // 4:3 — offset gallery
  og: [1200, 630],
};

/**
 * Scene plan per project. Each entry is [scene, palette] and the order matches
 * [cover, 01, 02, 03, 04, 05] — chosen to match each image's alt text in
 * `src/data/projects.ts`.
 */
const projectPlans = {
  "modern-residence": [
    ["exteriorWide", "daylight"],
    ["facade", "noon"],
    ["courtyard", "noon"],
    ["interior", "interiorWarm"],
    ["stair", "interiorBright"],
    ["exteriorWide", "daylight"],
  ],
  "contemporary-villa": [
    ["exteriorWide", "daylight"],
    ["exteriorWide", "noon"],
    ["colonnade", "noon"],
    ["interior", "interiorWarm"],
    ["exteriorWide", "daylight"],
    ["courtyard", "noon"],
  ],
  "urban-residence": [
    ["facade", "daylight"],
    ["facade", "noon"],
    ["stair", "interiorBright"],
    ["interior", "interiorWarm"],
    ["exteriorWide", "softLight"],
    ["courtyard", "noon"],
  ],
  "luxury-interior": [
    ["interior", "interiorWarm"],
    ["interior", "interiorWarm"],
    ["detail", "interiorBright"],
    ["interior", "interiorBright"],
    ["interior", "interiorWarm"],
    ["detail", "interiorWarm"],
  ],
  "courtyard-house": [
    ["courtyard", "noon"],
    ["courtyard", "noon"],
    ["colonnade", "noon"],
    ["interior", "interiorWarm"],
    ["detail", "noon"],
    ["courtyard", "daylight"],
  ],
  "corporate-workplace": [
    ["interior", "interiorBright"],
    ["interior", "interiorBright"],
    ["interior", "interiorWarm"],
    ["interior", "interiorWarm"],
    ["detail", "interiorBright"],
    ["frame", "softLight"],
  ],
  "coastal-retreat": [
    ["pavilion", "daylight"],
    ["pavilion", "noon"],
    ["colonnade", "noon"],
    ["interior", "interiorWarm"],
    ["pavilion", "softLight"],
    ["pavilion", "daylight"],
  ],
  "penthouse-interiors": [
    ["stair", "interiorBright"],
    ["stair", "interiorWarm"],
    ["interior", "interiorWarm"],
    ["interior", "interiorBright"],
    ["detail", "interiorWarm"],
    ["interior", "interiorWarm"],
  ],
};

const roleSizes = ["wide", "cinema", "portrait", "portrait", "landscape", "cinema"];
const roleNames = ["cover", "01", "02", "03", "04", "05"];

/** Standalone images used outside project pages. */
const standalone = [
  { path: "hero-fallback.jpg", scene: "exteriorWide", palette: "daylight", size: "wide" },
  { path: "architecture.jpg", scene: "facade", palette: "noon", size: "portrait" },
  { path: "interiors.jpg", scene: "interior", palette: "interiorWarm", size: "portrait" },
  { path: "about.jpg", scene: "courtyard", palette: "noon", size: "landscape" },
  { path: "contact.jpg", scene: "exteriorWide", palette: "daylight", size: "cinema" },
  { path: "experience.jpg", scene: "colonnade", palette: "noon", size: "wide" },
  { path: "og.jpg", scene: "exteriorWide", palette: "daylight", size: "og" },
  { path: "services/architecture.jpg", scene: "facade", palette: "noon", size: "portrait" },
  { path: "services/interior-design.jpg", scene: "interior", palette: "interiorWarm", size: "portrait" },
  { path: "services/visualisation.jpg", scene: "massing", palette: "softLight", size: "portrait" },
  { path: "services/project-management.jpg", scene: "frame", palette: "softLight", size: "portrait" },
];

/**
 * Rasterises the SVG and applies a light photographic finish: a slight blur to
 * kill vector-crisp edges, a gentle S-curve, and mild sharpening — the same
 * moves that make a render read as a photograph.
 */
async function render(svg, width, height, outPath) {
  const buffer = await sharp(Buffer.from(svg), { density: 96 })
    .resize(width, height, { fit: "fill" })
    .blur(0.4)
    // Lift rather than crush: a slight gain with a positive offset keeps the
    // whites open, which is the whole point of a daylight set.
    .modulate({ brightness: 1.05, saturation: 0.92 })
    .linear(1.03, 6)
    .sharpen({ sigma: 0.7 })
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, buffer);
  return buffer.length;
}

async function main() {
  let count = 0;
  let bytes = 0;

  for (const [slug, plan] of Object.entries(projectPlans)) {
    for (let i = 0; i < plan.length; i += 1) {
      const [scene, palette] = plan[i];
      const [w, h] = SIZES[roleSizes[i]];
      const svg = buildSvg(scene, palette, `${slug}-${roleNames[i]}`, w, h);
      const outPath = join(outRoot, "projects", slug, `${roleNames[i]}.jpg`);
      bytes += await render(svg, w, h, outPath);
      count += 1;
    }
    process.stdout.write(`  ${slug}\n`);
  }

  for (const item of standalone) {
    const [w, h] = SIZES[item.size];
    const svg = buildSvg(item.scene, item.palette, item.path, w, h);
    bytes += await render(svg, w, h, join(outRoot, item.path));
    count += 1;
  }
  process.stdout.write(`  standalone (${standalone.length})\n`);

  process.stdout.write(
    `\n${count} images written — ${(bytes / 1024 / 1024).toFixed(1)} MB total\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
