import { describe, expect, it } from "vitest";
import { classroomHref, resolveClassroomHash } from "../src/classroom/route";
import { ABOUT_SLUGS, isAboutSlug } from "../src/classroom/about/slugs";
import { ABOUT_DOCS } from "../src/classroom/about/registry";
import { inlineText, outline, parseMarkdown } from "../src/classroom/about/md";
import { STRINGS as CLASSROOM } from "../src/classroom/content/i18n";
import { DENSE_COLUMNS } from "../src/classroom/about/Markdown";

/**
 * The shared front matter (PRODUCT.md §5 items 2–8, §10.1 item 2): seven
 * pages under #/classroom/about/, each a Markdown document per language
 * rendered by the in-tree parser. Parity here is structural — the 中文
 * documents are peers of the English ones, so they must have the same
 * outline (headings, tables with the same column counts and row counts,
 * lists with the same lengths) — and the corrections made on integration
 * are pinned so a re-copy of the drafts cannot silently undo them.
 */
describe("about route family", () => {
  it("every slug resolves to its page and round-trips through the href builder", () => {
    for (const slug of ABOUT_SLUGS) {
      const href = classroomHref({ kind: "about", slug });
      expect(href).toBe(`#/classroom/about/${slug}`);
      expect(resolveClassroomHash(href)).toEqual({ kind: "about", slug });
      expect(resolveClassroomHash(`${href}/`)).toEqual({ kind: "about", slug });
    }
    expect(ABOUT_SLUGS).toEqual(["model-card", "privacy", "tech-check", "standards", "policy", "accessibility", "letter-kit"]);
    expect(isAboutSlug("privacy")).toBe(true);
    expect(isAboutSlug("m1")).toBe(false);
  });

  it("unknown about slugs, and a bare #/classroom/about, fall back to the index — never a broken page", () => {
    expect(resolveClassroomHash("#/classroom/about")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/about/")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/about/nope")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/about/m1")).toEqual({ kind: "index" });
    // "about" is not a module id and modules are not about slugs
    expect(resolveClassroomHash("#/classroom/m1/about")).toEqual({ kind: "module", id: "m1", step: null });
  });

  it("the index list, the about chrome and the registry agree on the slug set", () => {
    for (const lang of ["en", "zh"] as const) {
      expect(CLASSROOM[lang].frontMatter.items.map((i) => i.slug)).toEqual([...ABOUT_SLUGS]);
      expect(Object.keys(CLASSROOM[lang].about.descriptions).sort()).toEqual([...ABOUT_SLUGS].sort());
      for (const it of CLASSROOM[lang].frontMatter.items) {
        expect(it.label.length).toBeGreaterThan(3);
        expect(it.blurb.length).toBeGreaterThan(20);
      }
    }
    expect(Object.keys(ABOUT_DOCS).sort()).toEqual([...ABOUT_SLUGS].sort());
  });
});

describe("about documents — EN/zh parity and content", () => {
  const docs = ABOUT_SLUGS.map((slug) => ABOUT_DOCS[slug]);

  it("every part starts with a single h1 and parses to a non-trivial block tree", () => {
    for (const d of docs) {
      for (const lang of ["en", "zh"] as const) {
        expect(d.parts[lang].length).toBeGreaterThan(0);
        const first = parseMarkdown(d.parts[lang][0].md);
        expect(first[0], `${d.slug}.${lang}`).toMatchObject({ t: "heading", level: 1 });
        expect(first.filter((b) => b.t === "heading" && b.level === 1)).toHaveLength(1);
        expect(first.length).toBeGreaterThan(5);
      }
    }
  });

  it("the six bilingual documents have identical skeletons in EN and zh (headings, tables, lists, quotes, rules)", () => {
    // Paragraph counts may differ: the zh crosswalk and policy page carry a
    // deliberate 术语/语言说明 note the EN page has no need of. Everything
    // structural — every heading level, every table's column and row count,
    // every list's length and nesting, every quote and rule — must match.
    const skeleton = (md: string) => outline(parseMarkdown(md)).filter((x) => x !== "para");
    for (const d of docs) {
      if (d.slug === "letter-kit") continue;
      expect(skeleton(d.parts.zh[0].md), d.slug).toEqual(skeleton(d.parts.en[0].md));
    }
  });

  it("the letter kit is English-only by design: the zh page is a zh preface followed by the English kit, each in its own lang", () => {
    const lk = ABOUT_DOCS["letter-kit"];
    expect(lk.parts.en.map((p) => p.lang)).toEqual(["en"]);
    expect(lk.parts.zh.map((p) => p.lang)).toEqual(["zh", "en"]);
    expect(lk.parts.zh[1].md).toBe(lk.parts.en[0].md);
    const h = parseMarkdown(lk.parts.zh[0].md)[0];
    expect(h.t === "heading" ? inlineText(h.c) : "").toContain("来信包");
  });

  it("every table is a real table with a header row, and the crosswalk is the only dense-and-landscape one", () => {
    for (const d of docs) {
      for (const lang of ["en", "zh"] as const) {
        for (const part of d.parts[lang]) {
          for (const b of parseMarkdown(part.md)) {
            if (b.t !== "table") continue;
            expect(b.head.length, `${d.slug}.${lang}`).toBeGreaterThanOrEqual(2);
            for (const h of b.head) expect(inlineText(h).length).toBeGreaterThan(0);
            for (const r of b.rows) expect(r).toHaveLength(b.head.length);
            if (b.head.length >= DENSE_COLUMNS) expect(d.slug).toBe("standards");
          }
        }
      }
    }
    expect(ABOUT_DOCS.standards.landscape).toBe(true);
    expect(ABOUT_SLUGS.filter((s) => ABOUT_DOCS[s].landscape)).toEqual(["standards"]);
    const cw = parseMarkdown(ABOUT_DOCS.standards.parts.en[0].md).find((b) => b.t === "table");
    expect(cw && cw.t === "table" ? cw.head.length : 0).toBe(11);
    expect(cw && cw.t === "table" ? cw.rows.map((r) => inlineText(r[0])) : []).toEqual(["M1", "M2", "M3", "M4", "M5", "M6"]);
  });

  it("keeps the drafts' source-label vocabulary (verified / target / planned / secondary) — nothing paraphrased away", () => {
    const en = (slug: (typeof ABOUT_SLUGS)[number]) => ABOUT_DOCS[slug].parts.en[0].md;
    const zh = (slug: (typeof ABOUT_SLUGS)[number]) => ABOUT_DOCS[slug].parts.zh[0].md;
    expect(en("tech-check")).toContain("**Target**");
    expect(en("tech-check")).toContain("**Verified by construction**");
    expect(zh("tech-check")).toContain("**目标**");
    expect(zh("tech-check")).toContain("**由构造保证**");
    expect(en("policy")).toContain("*Secondary*");
    expect(en("policy")).toContain("Re-verified 2026-08-22");
    expect(zh("policy")).toContain("*二手来源*");
    expect(en("model-card")).toContain("no license field");
    expect(en("model-card")).toContain("CDLA-Sharing-1.0");
    expect(en("accessibility")).toContain("not yet tested with assistive technology");
    expect(zh("accessibility")).toContain("尚未用辅助技术实测");
    expect(en("standards")).toContain("author's extension");
    expect(en("standards")).toContain("Verified against");
    expect(en("letter-kit")).toContain("immigration records");
  });

  it("says what the built code does: tokenizer self-hosted, classroom sampling cap built, real step routes (REVIEW-CLASSROOM-3 corrections)", () => {
    for (const lang of ["en", "zh"] as const) {
      const privacy = ABOUT_DOCS.privacy.parts[lang][0].md;
      const tech = ABOUT_DOCS["tech-check"].parts[lang][0].md;
      const card = ABOUT_DOCS["model-card"].parts[lang][0].md;
      const a11y = ABOUT_DOCS.accessibility.parts[lang][0].md;
      // the only hub mention left is the model card's license citation
      expect(privacy).not.toContain("huggingface.co");
      expect(tech).not.toContain("huggingface.co");
      expect(a11y).not.toContain("huggingface.co");
      expect(privacy).toContain("/tokenizers/gpt2/");
      expect(tech).toContain("/tokenizers/gpt2/");
      // deep links are the real routes, not the design doc's sketch
      expect(tech).not.toContain("#m2-step");
      expect(tech).toContain("#/classroom/m2/step-1");
      expect(tech).toContain("#/classroom/about/privacy");
      // the classroom-mode configuration is built, not planned
      expect(card).not.toMatch(/planned configuration|规划中的配置/);
      expect(card).toContain("src/classroom/config.ts");
      expect(privacy).toContain("src/classroom/config.ts");
      // bundle measured
      expect(tech).toMatch(/1\.13 MB/);
      // the accessibility statement labels unbuilt items as targets, reports the audit and lists the known gaps
      expect(a11y).toMatch(/Target, not yet built|目标、尚未构建/);
      expect(a11y).toContain("axe-core 4.13.0");
      expect(a11y).toMatch(/ChromeVox, VoiceOver or NVDA|ChromeVox、VoiceOver 或 NVDA/);
      expect(a11y).toMatch(/4\.1\.2/);
      expect(a11y).toMatch(/1\.4\.10/);
    }
  });
});
