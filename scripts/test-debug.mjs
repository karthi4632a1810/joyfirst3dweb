import { chromium } from "playwright-core";

async function main() {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--enable-webgl", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1536, height: 872 } });

  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  const debug = await page.evaluate(async () => {
    const ST = window.ScrollTrigger;
    const allTriggers = ST ? ST.getAll().map((t) => ({
      triggerTag: t.trigger?.tagName,
      triggerClass: t.trigger?.className,
      start: t.start,
      end: t.end,
      progress: t.progress,
    })) : [];

    // Now test scrolling to 1800
    window.__lenis?.scrollTo(1800, { immediate: true });
    window.scrollTo(0, 1800);
    window.dispatchEvent(new Event("scroll"));
    if (ST) ST.update();

    const afterTriggers = ST ? ST.getAll().map((t) => ({
      start: t.start,
      end: t.end,
      progress: t.progress,
    })) : [];

    return {
      allTriggers,
      afterTriggers,
      scrollY: window.scrollY,
    };
  });

  console.log("Debug result:", JSON.stringify(debug, null, 2));
  await browser.close();
}

main().catch(console.error);
