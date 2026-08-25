import { chromium } from "playwright-core";
import { createServer } from "vite";
const server = await createServer({ root: process.cwd(), logLevel: "silent", server: { port: 0, host: "127.0.0.1" } });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
let browser;
for (const go of [() => chromium.launch({ channel: "chrome" }), () => chromium.launch()]) { try { browser = await go(); break; } catch {} }
const ctx = await browser.newContext({ viewport: { width: 700, height: 1400 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(`${origin}/?lang=en`, { waitUntil: "load" });
await page.waitForTimeout(6000); // tokenizer + nano weights
await page.addStyleTag({ content: ".widget-note{display:none!important}" });
const shot = async (sel, file) => { const el = page.locator(sel); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await el.screenshot({ path: file }); console.log("shot", file); };
await shot("#act-1", "paper/latex/figures/panel-act1.png");
await shot("#act-3", "paper/latex/figures/panel-act3.png");
// Act 4: wake the big model for real
const gate = page.locator("#act-4 button", { hasText: /Wake/i });
if (await gate.count()) {
  await gate.first().click();
  console.log("downloading big model…");
  await page.locator("#act-4 .bars").waitFor({ timeout: 600000 });
  await page.waitForTimeout(1500);
}
await shot("#act-4", "paper/latex/figures/panel-act4.png");
await browser.close(); await server.close();
