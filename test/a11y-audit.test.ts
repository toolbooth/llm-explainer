import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ABOUT_SLUGS } from "../src/classroom/about/slugs";
import { blockLang } from "../src/classroom/about/Markdown";
import {
  AUDIT_LANGS,
  AUDIT_TAGS,
  auditRoutesResolve,
  auditTargets,
  isGated,
  validateAuditReport,
  violationTotals,
  type AuditReport,
} from "../src/classroom/audit";
import { en } from "../src/classroom/content/en";
import { zh } from "../src/classroom/content/zh";
import { availableModules } from "../src/classroom/registry";

/**
 * `npm run audit:a11y` (scripts/audit-a11y.mjs) runs axe-core over the
 * target list below in both languages and writes dist-a11y/report.json;
 * the gate is zero serious/critical WCAG 2.1 A/AA violations. The list,
 * the report shape and the gate are the app's own TypeScript, pinned here;
 * a report from a real run on disk (gitignored) is validated too — a
 * failing or partial one fails, a missing one is skipped (the audit needs
 * a browser, `npm test` does not).
 */
describe("accessibility audit targets", () => {
  const targets = auditTargets();

  it("covers every classroom route kind for every available module, one step deep link each, and the seven front-matter pages", () => {
    const expected = ["index"];
    for (const m of availableModules()) {
      expected.push(`${m.id}-lesson`, `${m.id}-step-2`, `${m.id}-guide`, `${m.id}-unplugged`);
      if (m.slides) expected.push(`${m.id}-slides`);
    }
    for (const slug of ABOUT_SLUGS) expected.push(`about-${slug}`);
    expect(targets.map((t) => t.id)).toEqual(expected);
    expect(new Set(targets.map((t) => t.route)).size).toBe(targets.length);
    expect(AUDIT_LANGS).toEqual(["en", "zh"]);
    expect(AUDIT_TAGS).toEqual(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  });

  it("only the lesson pages are exercised (widgets driven into their student-reachable states)", () => {
    expect(targets.filter((t) => t.exercise).map((t) => t.id)).toEqual(["m1-lesson", "m2-lesson"]);
  });

  it("every audited route resolves to the page its id names", () => {
    expect(auditRoutesResolve(targets)).toEqual([]);
  });

  it("gates serious and critical only", () => {
    expect(isGated("critical")).toBe(true);
    expect(isGated("serious")).toBe(true);
    expect(isGated("moderate")).toBe(false);
    expect(isGated("minor")).toBe(false);
  });
});

describe("accessibility audit report", () => {
  const good = (): AuditReport => ({
    generatedAt: "2026-08-23T00:00:00.000Z",
    axeVersion: "4.13.0",
    renderer: "test",
    commit: null,
    viewport: { width: 1280, height: 800 },
    tags: [...AUDIT_TAGS],
    pages: auditTargets().flatMap((t) =>
      AUDIT_LANGS.flatMap((lang) =>
        (t.exercise ? (["initial", "exercised"] as const) : (["initial"] as const)).map((state) => ({
          id: t.id,
          route: t.route,
          lang,
          state,
          violations: [],
          passes: 20,
          incomplete: 0,
        }))
      )
    ),
  });

  it("accepts a complete report with no gated violation", () => {
    expect(validateAuditReport(good())).toEqual([]);
  });

  it("fails on a serious violation, tolerates a minor one, and reports the page and rule", () => {
    const r = good();
    r.pages[3].violations.push({ id: "color-contrast", impact: "serious", help: "", helpUrl: "", nodes: 7, targets: [".act-num"] });
    const errs = validateAuditReport(r);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toContain(`${r.pages[3].id}.${r.pages[3].lang}.${r.pages[3].state}`);
    expect(errs[0]).toContain("color-contrast");
    expect(errs[0]).toContain("7 nodes");
    const r2 = good();
    r2.pages[0].violations.push({ id: "region", impact: "moderate", help: "", helpUrl: "", nodes: 40, targets: [] });
    expect(validateAuditReport(r2)).toEqual([]);
    expect(violationTotals(r2)).toEqual({ critical: 0, serious: 0, moderate: 1, minor: 0, nodes: 40 });
  });

  it("fails on a missing language, a missing exercised state, a drifted route, or a narrower tag set", () => {
    const r = good();
    r.pages = r.pages.filter((p) => !(p.id === "about-policy" && p.lang === "zh"));
    expect(validateAuditReport(r)).toEqual(["missing about-policy.zh.initial"]);
    const r2 = good();
    r2.pages = r2.pages.filter((p) => !(p.id === "m1-lesson" && p.state === "exercised"));
    expect(validateAuditReport(r2)).toContain("missing m1-lesson.en.exercised");
    const r3 = good();
    r3.pages[1].route = "#/classroom/m9";
    expect(validateAuditReport(r3).some((e) => e.includes("route"))).toBe(true);
    const r4 = good();
    r4.tags = ["wcag2a"];
    expect(validateAuditReport(r4)).toContain("tags do not cover WCAG 2.0/2.1 A+AA");
    expect(validateAuditReport(null)).toEqual(["report is not an object"]);
  });

  it("the real report, when a run has produced one, meets the gate", () => {
    const file = join(__dirname, "..", "dist-a11y", "report.json");
    if (!existsSync(file)) return;
    const report = JSON.parse(readFileSync(file, "utf8"));
    expect(validateAuditReport(report)).toEqual([]);
    expect(violationTotals(report).critical + violationTotals(report).serious).toBe(0);
  });
});

describe("accessibility strings", () => {
  it("name the X-ray letters row for none, one and several hits, in both languages", () => {
    expect(en.a11y.letters("strawberry", 10, "r", [3, 8, 9])).toBe("strawberry: 10 letters, r at positions 3, 8, 9");
    expect(en.a11y.letters("banana", 6, "n", [3])).toBe("banana: 6 letters, n at position 3");
    expect(en.a11y.letters("cat", 3, "z", [])).toBe("cat: 3 letters, no z");
    expect(zh.a11y.letters("strawberry", 10, "r", [3, 8, 9])).toBe("strawberry：10 个字母，r 在第 3、8、9 位");
    expect(zh.a11y.letters("cat", 3, "z", [])).toBe("cat：3 个字母，没有 z");
  });

  it("carry the number a sighted reader sees: the slider value, the bar percentage, the token probability", () => {
    for (const t of [en, zh]) {
      expect(t.a11y.temperatureValue("1.05")).toBe("T = 1.05");
      expect(t.a11y.probabilityItem("the", "41.2%")).toContain("41.2%");
      expect(t.a11y.tokenName(" sat", "61%")).toContain("61%");
      expect(t.a11y.status(12, " sat", "61%")).toContain("12");
      expect(t.a11y.pieceItem(2, "raw", 1831)).toContain("1831");
      expect(t.a11y.xrayPieceItem(2, "raw", 1831, 1)).toContain("1831");
      expect(t.a11y.skipLink.length).toBeGreaterThan(3);
    }
    expect(en.a11y.status(1, " a", "9%")).toBe("1 word written; last “ a” at 9%");
  });
});

describe("per-block language marking on the front-matter pages (WCAG 3.1.2)", () => {
  it("marks Latin-only blocks on a 中文 page as English, and CJK-only blocks on an English page as 中文", () => {
    expect(blockLang("Support the integration of AI literacy skills", "zh")).toBe("en");
    expect(blockLang("HS-ALG-PS-04", "zh")).toBe("en");
    expect(blockLang("本资源如何对应。", "zh")).toBeUndefined();
    expect(blockLang("对应 CSTA HS-ALG-PS-04 的格子", "zh")).toBeUndefined(); // mixed: stays in the page language
    expect(blockLang("—", "zh")).toBeUndefined();
    expect(blockLang("2026-08-22", "zh")).toBeUndefined();
    expect(blockLang("切词机", "en")).toBe("zh");
    expect(blockLang("The Word Chopper / 切词机", "en")).toBeUndefined();
    expect(blockLang("plain English", "en")).toBeUndefined();
  });
});
