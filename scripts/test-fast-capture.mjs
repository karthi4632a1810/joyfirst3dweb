import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1536, height: 872 } });

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

  console.log("Waiting 5s for 3D villa to load...");
  await page.waitForTimeout(5000);

  const outDir = "C:\\Users\\jioka\\.gemini\\antigravity-ide\\brain\\19f99a50-f5d7-4ac4-a4a0-b9fde37be75b";

  async function captureScroll(name, scrollY) {
    const info = await page.evaluate(async (y) => {
      window.scrollTo(0, y);
      if (window.__lenis) {
        window.__lenis.scrollTo(y, { immediate: true });
        window.__lenis.emit();
      }
      window.dispatchEvent(new Event("scroll"));

      // Wait 2500ms for CameraController damp interpolation to fully settle
      await new Promise((r) => setTimeout(r, 2500));

      const canvas = document.querySelector("canvas");
      return {
        scrollY: window.scrollY,
        lenisScroll: window.__lenis?.scroll,
        debug: window.__heroCameraDebug || window.__cameraDebug,
        canvasData: canvas ? canvas.toDataURL("image/png") : null,
      };
    }, scrollY);

    console.log(`Scroll result for ${name}: scrollY=${info.scrollY}, lenisScroll=${info.lenisScroll}, debug=${JSON.stringify(info.debug)}`);

    if (info.canvasData && info.canvasData.length > 5000) {
      const base64Data = info.canvasData.replace(/^data:image\/png;base64,/, "");
      const filePath = path.join(outDir, `${name}.png`);
      fs.writeFileSync(filePath, base64Data, "base64");
      console.log(`Saved ${name}.png (${base64Data.length} bytes)`);
    }
  }

  await captureScroll("walkthrough_01_wide_exterior", 0);
  await captureScroll("walkthrough_02_residence_approach", 390);
  await captureScroll("walkthrough_03_entrance_approach", 780);
  await captureScroll("walkthrough_04_doorway_porch", 1170);
  await captureScroll("walkthrough_05_doorway_threshold", 1560);
  await captureScroll("walkthrough_06_reception_foyer", 1950);
  await captureScroll("walkthrough_07_open_workspace", 2340);
  await captureScroll("walkthrough_08_collaboration_area", 2730);
  await captureScroll("walkthrough_09_glass_meeting_room", 3120);
  await captureScroll("walkthrough_10_executive_office", 3510);
  await captureScroll("walkthrough_11_creative_design_studio", 3900);
  await captureScroll("walkthrough_12_residential_lounge", 4290);
  await captureScroll("walkthrough_13_social_pantry", 4670);
  await captureScroll("walkthrough_14_hero_atrium", 5050);

  // Full page UI screenshots with text overlay
  console.log("Capturing full page UI at 0px...");
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) { window.__lenis.scrollTo(0, { immediate: true }); window.__lenis.emit(); }
    window.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "final_hero_ui_exterior.png") });

  console.log("Capturing full page UI at 1950px (reception)...");
  await page.evaluate(() => {
    window.scrollTo(0, 1950);
    if (window.__lenis) { window.__lenis.scrollTo(1950, { immediate: true }); window.__lenis.emit(); }
    window.dispatchEvent(new Event("scroll"));
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "final_hero_ui_reception.png") });

  await browser.close();
  console.log("Finished all captures!");
}

main().catch(console.error);
