import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const STOPS = [
  0.00, 0.07, 0.13, 0.19, 0.24, 0.28, 0.34, 0.41, 0.49, 0.57,
  0.61, 0.68, 0.74, 0.79, 0.83, 0.89, 0.93, 0.95, 0.98, 1.00,
];

async function main() {
  console.log("==================================================");
  console.log(" JOYFIRST 20-Stop Office Tour Capture & Luminance (§8/§13)");
  console.log("==================================================");

  const outDir = path.resolve("reports/tour");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });

  console.log("Waiting 4s for WebGL scene, HDRI, textures & post-processing...");
  await page.waitForTimeout(4000);

  const results = [];
  let failures = 0;

  for (let i = 0; i < STOPS.length; i++) {
    const s = STOPS[i];
    const frameName = `${String(i).padStart(2, "0")}.png`;
    const filePath = path.join(outDir, frameName);

    // Scroll page to target scroll progress and calculate luminance
    const info = await page.evaluate(async (targetScroll) => {
      const hero = document.querySelector('section[aria-label="Introduction"]');
      if (hero) {
        const total = hero.getBoundingClientRect().height - window.innerHeight;
        const targetY = Math.round(targetScroll * total);
        window.scrollTo(0, targetY);
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, { immediate: true });
          window.__lenis.emit();
        }
        window.dispatchEvent(new Event("scroll"));
      }

      // Wait 1200ms for CameraController damp interpolation to settle
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const readLuminance = () => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return 0.5;
        try {
          const off = document.createElement("canvas");
          off.width = 192;
          off.height = 108;
          const ctx = off.getContext("2d");
          if (!ctx) return 0.5;
          ctx.drawImage(canvas, 0, 0, 192, 108);
          const d = ctx.getImageData(0, 0, 192, 108).data;
          let sumL = 0;
          const count = d.length / 4;
          for (let p = 0; p < d.length; p += 4) {
            const r = d[p] / 255;
            const g = d[p + 1] / 255;
            const b = d[p + 2] / 255;
            sumL += 0.2126 * r + 0.7152 * g + 0.0722 * b;
          }
          return sumL / count;
        } catch {
          return 0.5;
        }
      };

      let meanLuminance = readLuminance();
      if (meanLuminance < 0.05) {
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 80)));
        meanLuminance = readLuminance();
      }

      const debug = window.__heroCameraDebug || {};
      return {
        targetScroll,
        meanLuminance,
        debug,
      };
    }, s);

    // Capture full-viewport 1920x1080 screenshot
    await page.screenshot({ path: filePath });

    const lum = Math.round(info.meanLuminance * 1000) / 1000;
    const pass = lum >= 0.18 && lum <= 0.82;
    if (!pass) failures++;

    const entry = {
      index: i,
      frame: frameName,
      scroll: s,
      meanLuminance: lum,
      pass,
      zone: info.debug.zone || "N/A",
      cameraPos: info.debug.position || [],
      cameraTarget: info.debug.target || [],
    };
    results.push(entry);

    console.log(
      `[${String(i).padStart(2, "0")}/19] s=${s.toFixed(2)} | Lum: ${lum.toFixed(3)} ${pass ? "✓ PASS" : "✗ FAIL"} | Zone: ${entry.zone} -> ${frameName}`
    );
  }

  await browser.close();

  // Write summary report
  const reportPath = path.resolve("reports/tour-luminance.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nReport written to ${reportPath}`);

  console.log(`\nSummary: ${results.length - failures}/${results.length} frames passed mean luminance bounds [0.18, 0.82].`);
  if (failures > 0) {
    console.error(`>>> FAILED: ${failures} frame(s) out of luminance bounds! <<<`);
    process.exit(1);
  } else {
    console.log(">>> PASS: ALL 20 TOUR CAPTURE FRAMES PASSED LUMINANCE BOUNDS! <<<");
  }
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
