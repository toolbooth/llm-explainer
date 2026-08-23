#!/usr/bin/env node
/**
 * npm run audit:a11y — run axe-core over every Classroom Edition route
 * (src/classroom/audit.ts lists them) in EN and 中文, as loaded and — on the
 * lesson pages — after driving the widgets (hints, roll, step, tables), and
 * write dist-a11y/report.json (gitignored) plus a summary. Exit code 1 when
 * any serious or critical WCAG 2.1 A/AA violation is found.
 *
 * Same machinery as scripts/build-pdf.mjs: a throwaway Vite dev server, the
 * machine's Google Chrome through playwright-core (no browser download;
 * exits 0 with a message if none is found), ?mockModel=1 so every widget
 * renders its full state deterministically without the 7.5 MB weights.
 * axe-core is a devDependency; its script is injected into each page.
 *
 * Usage: node scripts/audit-a11y.mjs [--out dist-a11y] [--only m2-lesson,about-privacy] [--lang en] [--width 1280]
 *        [--tags wcag2a,wcag2aa,wcag21a,wcag21aa,best-practice]   (default: the four WCAG tags the gate is scored on)
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const OUT = resolve(ROOT, opt("out", "dist-a11y"));
const ONLY = opt("only", "").split(",").filter(Boolean);
const LANG_FILTER = opt("lang", "").split(",").filter(Boolean);
const WIDTH = Number(opt("width", "1280"));
const EXTRA_TAGS = opt("tags", "").split(",").filter(Boolean);
const HEIGHT = Number(opt("height", "800"));

function skip(msg) {
  console.log(`audit:a11y skipped — ${msg}`);
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  skip("playwright-core is not installed (npm install -D playwright-core).");
}
let axeSource;
try {
  axeSource = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
} catch {
  skip("axe-core is not installed (npm install -D axe-core).");
}
const axeVersion = JSON.parse(readFileSync(join(ROOT, "node_modules/axe-core/package.json"), "utf8")).version;

const { createServer } = await import("vite");
const server = await createServer({ root: ROOT, logLevel: "silent", server: { port: 0, host: "127.0.0.1", strictPort: false } });
await server.listen();
const port = server.httpServer.address().port;
const origin = `http://127.0.0.1:${port}`;

const audit = await server.ssrLoadModule("/src/classroom/audit.ts");
const TAGS = EXTRA_TAGS.length ? EXTRA_TAGS : [...audit.AUDIT_TAGS];
const targets = audit.auditTargets().filter((t) => ONLY.length === 0 || ONLY.includes(t.id));
const langs = audit.AUDIT_LANGS.filter((l) => LANG_FILTER.length === 0 || LANG_FILTER.includes(l));

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

mkdirSync(OUT, { recursive: true });
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });

/** Run axe on the page and reduce the result to the report's shape. */
async function runAxe(page) {
  const result = await page.evaluate(async (tags) => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags } });
    return {
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
      })),
      passes: r.passes.length,
      incomplete: r.incomplete.length,
    };
  }, TAGS);
  return result;
}

/**
 * Drive the lesson widgets into the states a student reaches: every hint
 * revealed, every preset chip pressed once, Gamble rolled, Hundred Rolls
 * pressed, TheLoop stepped, every <details> opened, every slider nudged.
 * Best effort — a control that is missing is skipped, not failed.
 */
async function exercise(page) {
  const clickAll = async (selector, times = 1) => {
    const n = await page.locator(selector).count();
    for (let i = 0; i < n; i++)
      for (let k = 0; k < times; k++) {
        const el = page.locator(selector).nth(i);
        if (await el.isEnabled().catch(() => false)) await el.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(60);
      }
  };
  await clickAll(".cl-hint-btn", 3);
  await clickAll(".preset-row .preset-btn");
  await page.waitForTimeout(200);
  await clickAll(".roll-row .btn");
  await clickAll(".hr-controls .btn:not(.ghost)");
  await clickAll(".loop-controls .btn.ghost:first-of-type", 2); // TheLoop "Step" twice
  await page.waitForTimeout(300);
  const details = page.locator("details:not([open]) > summary");
  const nd = await details.count();
  for (let i = 0; i < nd; i++) await page.locator("details:not([open]) > summary").first().click({ timeout: 2000 }).catch(() => {});
  const ranges = page.locator('input[type="range"]');
  const nr = await ranges.count();
  for (let i = 0; i < nr; i++) {
    await ranges.nth(i).focus().catch(() => {});
    await page.keyboard.press("ArrowRight").catch(() => {});
  }
  // the first token of TheLoop, if any, gets keyboard focus + Enter (the popover path)
  const tok = page.locator(".loop-out .loop-tok").first();
  if ((await tok.count()) > 0) {
    await tok.focus().catch(() => {});
    await page.keyboard.press("Enter").catch(() => {});
  }
  await page.waitForTimeout(900); // the hundred rolls land over 0.7 s
}

const pages = [];
const t0 = Date.now();
for (const target of targets) {
  for (const lang of langs) {
    const page = await context.newPage();
    const url = `${origin}/?mockModel=1&lang=${lang}${target.route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector("article.classroom", { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.addScriptTag({ content: axeSource });
    const initial = await runAxe(page);
    pages.push({ id: target.id, route: target.route, lang, state: "initial", ...initial });
    const line = (state, r) => {
      const gated = r.violations.filter((v) => audit.isGated(v.impact));
      const rest = r.violations.length - gated.length;
      console.log(
        `${`${target.id}.${lang}`.padEnd(28)} ${state.padEnd(9)} ${gated.length ? `${gated.length} GATED` : "ok".padEnd(7)}${rest ? ` +${rest} minor/moderate` : ""}  ${r.passes} passes` +
          (gated.length ? `\n    ${gated.map((v) => `${v.impact} ${v.id} ×${v.nodes}: ${v.targets[0]}`).join("\n    ")}` : "")
      );
    };
    line("initial", initial);
    if (target.exercise) {
      await exercise(page);
      const exercised = await runAxe(page);
      pages.push({ id: target.id, route: target.route, lang, state: "exercised", ...exercised });
      line("exercised", exercised);
    }
    await page.close();
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  axeVersion,
  renderer,
  commit,
  viewport: { width: WIDTH, height: HEIGHT },
  tags: TAGS,
  pages,
};
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
await browser.close();
await server.close();

const totals = audit.violationTotals(report);
const problems = ONLY.length === 0 && LANG_FILTER.length === 0 ? audit.validateAuditReport(report) : pages.flatMap((p) => p.violations.filter((v) => audit.isGated(v.impact)).map((v) => `${p.id}.${p.lang}.${p.state}: ${v.impact} ${v.id}`));
console.log(
  `\n${pages.length} page states audited (axe-core ${axeVersion}, ${renderer}${commit ? `, commit ${commit}` : ""}, ${WIDTH}×${HEIGHT}), ${((Date.now() - t0) / 1000).toFixed(1)} s → ${OUT}/report.json` +
    `\nviolations: critical ${totals.critical}, serious ${totals.serious}, moderate ${totals.moderate}, minor ${totals.minor} (${totals.nodes} nodes)`
);
if (problems.length) {
  console.error(`\nGATE FAILED:\n  ${problems.join("\n  ")}`);
  process.exitCode = 1;
} else console.log("gate: zero serious/critical violations on every page in both languages");
