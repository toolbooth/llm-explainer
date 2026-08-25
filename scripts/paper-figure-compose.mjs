import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
const b64 = f => readFileSync(`paper/latex/figures/${f}`).toString("base64");
const html = `<!doctype html><meta charset="utf8"><body style="margin:0;background:#fff">
<div id="strip" style="display:inline-block;background:#fff;padding:10px">
  <img src="data:image/png;base64,${b64("panel-act1.png")}" style="width:1332px;display:block;border-radius:8px">
  <div style="display:flex;gap:20px;margin-top:20px;align-items:stretch">
    <img src="data:image/png;base64,${b64("panel-act3.png")}" style="height:780px;border-radius:8px">
    <img src="data:image/png;base64,${b64("panel-act4.png")}" style="height:780px;border-radius:8px">
  </div>
</div>`;
writeFileSync("/tmp/compose.html", html);
let browser; for (const go of [() => chromium.launch({ channel: "chrome" }), () => chromium.launch()]) { try { browser = await go(); break; } catch {} }
const page = await (await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1600, height: 1500 } })).newPage();
await page.goto("file:///tmp/compose.html");
await page.waitForTimeout(400);
await page.locator("#strip").screenshot({ path: "paper/latex/figures/interface.png" });
await browser.close();
