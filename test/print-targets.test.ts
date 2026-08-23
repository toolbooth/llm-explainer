import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ABOUT_SLUGS } from "../src/classroom/about/slugs";
import { PRINT_LANGS, countPdfPages, pdfFileName, printTargets, validateManifest, type PdfManifest } from "../src/classroom/print";
import { availableModules } from "../src/classroom/registry";
import { resolveClassroomHash } from "../src/classroom/route";

/**
 * `npm run build:pdf` (scripts/build-pdf.mjs) renders the list below to
 * dist-pdf/ with a manifest. The list, the file names and the manifest
 * shape are the app's own TypeScript, so they are pinned here; when a
 * manifest from a real run is on disk (dist-pdf/ is gitignored), it is
 * validated too — a stale or partial run fails, a missing one is skipped.
 */
describe("print targets", () => {
  const targets = printTargets();

  it("covers every available module's guide, printable and (if any) slides, then the seven front-matter pages", () => {
    const mods = availableModules();
    const expected: string[] = [];
    for (const m of mods) {
      expected.push(`${m.id}-guide`, `${m.id}-unplugged`);
      if (m.slides) expected.push(`${m.id}-slides`);
    }
    for (const slug of ABOUT_SLUGS) expected.push(`about-${slug}`);
    expect(targets.map((t) => t.id)).toEqual(expected);
    expect(targets).toHaveLength(12); // M1 guide+sheet, M2 guide+sheet+slides, 7 about pages
    expect(new Set(targets.map((t) => t.id)).size).toBe(targets.length);
    expect(PRINT_LANGS).toEqual(["en", "zh"]);
  });

  it("every route resolves to a real non-index, non-lesson classroom page", () => {
    for (const t of targets) {
      const page = resolveClassroomHash(t.route);
      expect(page.kind, t.id).not.toBe("index");
      expect(page.kind, t.id).not.toBe("module");
      if (t.id.startsWith("about-")) expect(page).toEqual({ kind: "about", slug: t.id.slice("about-".length) });
      else expect(page).toMatchObject({ kind: t.id.split("-")[1], id: t.id.split("-")[0] });
    }
    expect(targets.filter((t) => t.landscape).map((t) => t.id)).toEqual(["about-standards"]);
  });

  it("file names are <id>.<lang>.pdf", () => {
    expect(pdfFileName("m2-guide", "zh")).toBe("m2-guide.zh.pdf");
    expect(pdfFileName("about-privacy", "en")).toBe("about-privacy.en.pdf");
  });

  it("counts pages from a PDF's /Type /Page objects (not the /Pages tree node)", () => {
    const fake = new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Type /Pages /Count 2 /Kids [2 0 R 3 0 R] >> endobj\n2 0 obj << /Type /Page /Parent 1 0 R >> endobj\n3 0 obj <</Type/Page/Parent 1 0 R>> endobj\n");
    expect(countPdfPages(fake)).toBe(2);
    expect(countPdfPages(new Uint8Array(0))).toBe(0);
  });

  it("validates a manifest: complete set, canonical names, positive counts; flags drift", () => {
    const good: PdfManifest = {
      generatedAt: "2026-08-23T00:00:00.000Z",
      renderer: "test",
      commit: null,
      pageSize: "Letter",
      entries: targets.flatMap((t) =>
        PRINT_LANGS.map((lang) => ({ id: t.id, route: t.route, lang, file: pdfFileName(t.id, lang), bytes: 1, pages: 1, title: "t", landscape: t.landscape }))
      ),
    };
    expect(validateManifest(good)).toEqual([]);
    const missing = { ...good, entries: good.entries.slice(1) };
    expect(validateManifest(missing)).toEqual([`missing ${targets[0].id}.en`]);
    const bad = { ...good, entries: [{ ...good.entries[0], file: "x.pdf", pages: 0, route: "#/nope" }, ...good.entries.slice(1)] };
    const errs = validateManifest(bad);
    expect(errs.some((e) => e.includes("not canonical"))).toBe(true);
    expect(errs.some((e) => e.endsWith("pages"))).toBe(true);
    expect(errs.some((e) => e.includes("route"))).toBe(true);
    expect(validateManifest(null)).toEqual(["manifest is not an object"]);
    expect(validateManifest({ entries: "no" })).toContain("entries is not an array");
  });

  it("a manifest from a real run, when present, is valid and every file it names exists with the recorded size", () => {
    const dir = join(__dirname, "..", "dist-pdf");
    const path = join(dir, "manifest.json");
    if (!existsSync(path)) return; // no run on this machine — the script is opt-in
    const m = JSON.parse(readFileSync(path, "utf8")) as PdfManifest;
    expect(validateManifest(m)).toEqual([]);
    for (const e of m.entries) {
      const f = join(dir, e.file);
      expect(existsSync(f), e.file).toBe(true);
      const bytes = readFileSync(f);
      expect(bytes.length).toBe(e.bytes);
      expect(countPdfPages(new Uint8Array(bytes))).toBe(e.pages);
      expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    }
  });
});
