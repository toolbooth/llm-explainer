#!/usr/bin/env node
/**
 * npm run build:pdf — render every printable classroom page (guides,
 * unplugged sheets, slides, the seven front-matter pages; EN and 中文) to
 * PDF with a headless browser, into dist-pdf/ (gitignored) with a manifest.
 *
 * Zero runtime dependencies: the only addition is the devDependency
 * playwright-core, which ships no browser. It drives the Google Chrome /
 * Chromium already on the machine (channel "chrome", then "msedge", then
 * whatever `chromium.executablePath()` resolves to). If none is found the
 * script says so and exits 0 — a PDF set is a release artefact, not a build
 * gate. Pages are served by a throwaway Vite dev server on a free port and
 * opened under ?mockModel=1 (no 7.5 MB weights; widgets are hidden in
 * print anyway) so a run takes seconds and is deterministic.
 *
 * Usage: node scripts/build-pdf.mjs [--out dist-pdf] [--only m2-guide,about-privacy] [--lang en]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const OUT = resolve(ROOT, opt("out", "dist-pdf"));
const ONLY = opt("only", "").split(",").filter(Boolean);
const LANG_FILTER = opt("lang", "").split(",").filter(Boolean);

function skip(msg) {
  console.log(`build:pdf skipped — ${msg}`);
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  skip("playwright-core is not installed (npm install -D playwright-core).");
}

const { createServer } = await import("vite");
const server = await createServer({ root: ROOT, logLevel: "silent", server: { port: 0, host: "127.0.0.1", strictPort: false } });
await server.listen();
const port = server.httpServer.address().port;
const origin = `http://127.0.0.1:${port}`;

// The target list and the manifest helpers are the app's own TypeScript; Vite loads them for us.
const print = await server.ssrLoadModule("/src/classroom/print.ts");
const targets = print.printTargets().filter((t) => ONLY.length === 0 || ONLY.includes(t.id));
const langs = print.PRINT_LANGS.filter((l) => LANG_FILTER.length === 0 || LANG_FILTER.includes(l));

async function launch() {
  const attempts = [
    ["Google Chrome (channel chrome)", () => chromium.launch({ channel: "chrome" })],
    ["Microsoft Edge (channel msedge)", () => chromium.launch({ channel: "msedge" })],
    ["Playwright's own Chromium, if installed", () => chromium.launch()],
  ];
  const reasons = [];
  for (const [label, go] of attempts) {
    try {
      const browser = await go();
      return { browser, label };
    } catch (e) {
      reasons.push(`${label}: ${String(e.message ?? e).split("\n")[0]}`);
    }
  }
  await server.close();
  skip(`no Chrome/Chromium binary found.\n  ${reasons.join("\n  ")}\n  Install Google Chrome, or run \`npx playwright install chromium\`.`);
}

const { browser, label } = await launch();
const renderer = `${label} ${browser.version()} via playwright-core ${JSON.parse(readFileSync(join(ROOT, "node_modules/playwright-core/package.json"), "utf8")).version}`;
let commit = null;
try {
  commit = execSync("git rev-parse --short HEAD", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
} catch {
  /* not a git checkout */
}

if (ONLY.length === 0 && LANG_FILTER.length === 0) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const entries = [];
const t0 = Date.now();
for (const target of targets) {
  for (const lang of langs) {
    const page = await context.newPage();
    const url = `${origin}/?mockModel=1&lang=${lang}${target.route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("article.classroom", { timeout: 15000 });
    // fonts (the zh faces are system fonts on macOS) and any trailing layout
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const title = await page.title();
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "Letter",
      landscape: target.landscape,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    await page.close();
    const file = print.pdfFileName(target.id, lang);
    writeFileSync(join(OUT, file), pdf);
    const pages = print.countPdfPages(new Uint8Array(pdf));
    entries.push({ id: target.id, route: target.route, lang, file, bytes: pdf.byteLength, pages, title, landscape: target.landscape });
    console.log(`${file.padEnd(32)} ${String(pages).padStart(3)} pages ${String(Math.round(pdf.byteLength / 1024)).padStart(6)} KB  ${title}`);
  }
}

const manifest = { generatedAt: new Date().toISOString(), renderer, commit, pageSize: "Letter (CSS @page margins; crosswalk landscape)", entries };
if (ONLY.length === 0 && LANG_FILTER.length === 0) {
  const problems = print.validateManifest(manifest);
  if (problems.length) {
    console.error("manifest problems:\n  " + problems.join("\n  "));
    process.exitCode = 1;
  }
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
await browser.close();
await server.close();
const total = entries.reduce((n, e) => n + e.pages, 0);
console.log(`\n${entries.length} PDFs, ${total} pages, ${((Date.now() - t0) / 1000).toFixed(1)} s → ${OUT}/ (manifest.json; ${renderer}${commit ? `; commit ${commit}` : ""})`);
if (!existsSync(join(OUT, "manifest.json"))) process.exitCode = 1;
