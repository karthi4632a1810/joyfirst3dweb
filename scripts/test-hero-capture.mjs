import { chromium } from "playwright-core";
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
    console.log(`Scrolling to ${scrollY}px...`);
    await page.evaluate((y) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
      window.dispatchEvent(new Event("scroll"));
    }, scrollY);
    // Give camera damping 1.6s to smoothly interpolate to the keyframe position
    await page.waitForTimeout(1600);

    const filePath = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${name}.png`);
  }

  await captureScroll("walkthrough_1_wide", 0);
  await captureScroll("walkthrough_2_approach", 550);
  await captureScroll("walkthrough_3_doorway", 1100);
  await captureScroll("walkthrough_4_interior", 1650);

  await browser.close();
  console.log("Completed all 4 walkthrough captures!");
}

main().catch(console.error);
