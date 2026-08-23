import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * 中文 typography guard (2026-08-23, after a reader's note): every 中文
 * content table used to write 。 full-width but ，：；？ and （） half-width.
 * Any ASCII , : ; ? ! ( ) that touches a CJK character (or full-width
 * punctuation) is flagged. Code (object keys, ternaries,
 * calls) never puts ASCII punctuation directly against 中文 text, so the
 * rule has no exceptions. Comment lines (`*`) are skipped.
 */
// Ideographs and full-width punctuation; curly quotes are excluded on purpose so an
// English quotation ending in `)”` (e.g. “…(research release)”) is not flagged.
const CJK = /[一-鿿　-〿＀-￯]/;
const ROOT = join(__dirname, "..", "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/(^|\.)zh(\.|-)?.*\.(tsx?|md)$/.test(name) || /^zh\.tsx$/.test(name)) out.push(p);
  }
  return out;
}

const FILES = [...walk(ROOT), join(ROOT, "series", "SeriesIndex.tsx"), join(ROOT, "classroom", "registry.ts")];

describe("中文 content uses full-width punctuation", () => {
  it("covers the essay tables, classroom tables and classroom docs", () => {
    const rel = FILES.map((f) => f.slice(ROOT.length + 1));
    expect(rel).toContain("content/zh.tsx");
    expect(rel.filter((f) => f.startsWith("essays/")).length).toBeGreaterThanOrEqual(3);
    expect(rel.filter((f) => f.startsWith("classroom/")).length).toBeGreaterThanOrEqual(3);
  });

  for (const file of FILES) {
    it(file.slice(ROOT.length + 1), () => {
      const offenders: string[] = [];
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (line.trimStart().startsWith("*")) return;
          for (const m of line.matchAll(/[,:;?!()]/g)) {
            const j = m.index!;
            const prev = line[j - 1] ?? " ";
            const next = line[j + 1] ?? " ";
            if (CJK.test(prev) || CJK.test(next)) offenders.push(`${i + 1}: …${line.slice(Math.max(0, j - 12), j + 8)}…`);
          }
        });
      expect(offenders, offenders.join("\n")).toEqual([]);
    });
  }
});
