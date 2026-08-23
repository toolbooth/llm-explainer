#!/usr/bin/env node
/**
 * npm run check:hashes — recompute the eight DOM baselines in HASHES.md
 * (sha256 of `#root`'s innerHTML for every essay page, EN and 中文, under
 * ?mockModel=1 at 1280×800, hashed 2.5 s after load) and compare them with
 * the table in HASHES.md. Exit code 1 on any mismatch. Same machinery as
 * scripts/build-pdf.mjs (throwaway Vite dev server, the machine's Chrome
 * via playwright-core; exits 0 with a message if no browser is found).
 *
 * This is the browser recipe in HASHES.md, automated; it reproduces the
 * recorded hashes exactly (verified 2026-08-23), so a page that is meant to
 * be untouched by a change can be proven untouched in one command.
 *
 * Usage: node scripts/check-hashes.mjs [--hashes HASHES.md] [--print]
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const HASHES = resolve(ROOT, opt("hashes", "HASHES.md"));

function skip(msg) {
  console.log(`check:hashes skipped — ${msg}`);
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  skip("playwright-core is not installed (npm install -D playwright-core).");
}

// The "Current baseline" table: | page | route | lang | `sha` | chars |
const md = readFileSync(HASHES, "utf8");
const current = md.split("## Superseded")[0];
const rows = [...current.matchAll(/^\|\s*(.+?)\s*\|\s*`([^`]*)`\s*\|\s*(en|zh)\s*\|\s*`([0-9a-f]{64})`\s*\|\s*(\d+)\s*\|/gm)].map((m) => ({
  page: m[1],
  route: m[2] === "/" ? "" : m[2],
  lang: m[3],
  sha: m[4],
  chars: Number(m[5]),
}));
if (rows.length !== 8) {
  console.error(`expected 8 baseline rows in ${HASHES}, found ${rows.length}`);
  process.exit(1);
}

const { createServer } = await import("vite");
const server = await createServer({ root: ROOT, logLevel: "silent", server: { port: 0, host: "127.0.0.1", strictPort: false } });
await server.listen();
const port = server.httpServer.address().port;
const origin = `http://127.0.0.1:${port}`;

async function launch() {
  for (const go of [() => chromium.launch({ channel: "chrome" }), () => chromium.launch({ channel: "msedge" }), () => chromium.launch()]) {
    try {
      return await go();
    } catch {
      /* next */
    }
  }
  await server.close();
  skip("no Chrome/Chromium binary found.");
}
const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });

let failed = 0;
const out = [];
for (const row of rows) {
  const page = await context.newPage();
  await page.goto(`${origin}/?mockModel=1&lang=${row.lang}${row.route}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const { sha, chars } = await page.evaluate(async () => {
    const html = document.getElementById("root").innerHTML;
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(html));
    return { sha: [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join(""), chars: html.length };
  });
  await page.close();
  const ok = sha === row.sha && chars === row.chars;
  if (!ok) failed++;
  out.push({ page: row.page, lang: row.lang, ok, sha, chars, expected: row.sha, expectedChars: row.chars });
  console.log(`${ok ? "ok  " : "DIFF"} ${row.page.padEnd(36)} ${row.lang}  ${sha.slice(0, 8)}…/${chars}${ok ? "" : `  (baseline ${row.sha.slice(0, 8)}…/${row.chars})`}`);
}
await browser.close();
await server.close();
if (args.includes("--print")) console.log(JSON.stringify(out, null, 2));
if (failed) {
  console.error(`\n${failed} of ${rows.length} baselines differ from ${HASHES}`);
  process.exit(1);
}
console.log(`\nall ${rows.length} baselines in ${HASHES} reproduced`);
