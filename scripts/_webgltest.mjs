import { chromium } from "playwright-core";

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-lcd-text",
  ],
});

const page = await browser.newPage({ viewport: { width: 640, height: 400 } });

const info = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return { ok: false };
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    ok: true,
    version: gl.getParameter(gl.VERSION),
    renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "n/a",
    maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE),
  };
});

console.log(info);
await browser.close();
