import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/essays/attention-heads/content/i18n";
import { SPECIES_ORDER } from "../src/essays/attention-heads/scanner";

/**
 * Essay #3's replica of the flagship's content parity test (the per-essay
 * pattern from src/series/README.md §3): walk both locale tables and compare
 * every leaf path tagged with its runtime type, catching drift beyond what
 * the shared Essay3Strings interface enforces at compile time.
 */
function typedPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => typedPaths(v, `${prefix}[${i}]`));
  }
  if (typeof value === "object" && value !== null) {
    return Object.keys(value)
      .sort()
      .flatMap((k) =>
        typedPaths((value as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k)
      );
  }
  return [`${prefix}:${typeof value}`];
}

describe("essay #3 content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = STRINGS.zh;
    expect(zh.hero.title).toBe("野生 attention head 图鉴");
    expect(zh.docTitle).toBe("野生 attention head 图鉴 — 看穿语言模型系列·第三篇");
    expect([zh.sec1.widget.num, zh.sec2.widget.num, zh.sec3.widget.num, zh.sec4.widget.num]).toEqual([
      "第一节",
      "第二节",
      "第三节",
      "第四节",
    ]);
    expect(zh.sec1.heading).toBe("第一节·十六道目光");
    expect(zh.sec2.heading).toBe("第二节·人口普查");
    expect(zh.sec3.heading).toBe("第三节·三种常见物种,凑近看");
    expect(zh.sec4.heading).toBe("第四节·无名的大多数");
    // the flagship's three canonical head names are reused verbatim in the Room chrome…
    expect(zh.sec1.widget.diagPrev(2, 8, "31")).toBe("👀 盯前一个词的头 · L2H8(31%)");
    expect(zh.sec3.widget.diagAnchor(1, 4, "51")).toBe("⚓ 锚在句首的头 · L1H4(51%)");
    expect(zh.sec4.widget.diagDiffuse(7, 1)).toBe("🌫 目光最散的头 · L7H1");
    // …and in the census's field-guide entries
    expect(zh.sec2.widget.species.prev.name).toContain("盯前一个词的头");
    expect(zh.sec2.widget.species.anchor.name).toContain("锚在句首的头");
    expect(zh.sec2.widget.species.unlabeled.name).toContain("无名氏");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
  });

  it("has a field-guide entry for every species the scanner can emit, in both locales", () => {
    for (const lang of ["en", "zh"] as const) {
      for (const s of SPECIES_ORDER) {
        expect(STRINGS[lang].sec2.widget.species[s].name.length).toBeGreaterThan(0);
        expect(STRINGS[lang].sec2.widget.species[s].blurb.length).toBeGreaterThan(0);
      }
    }
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(STRINGS.en.sec2.widget.loading(45)).toContain("45%");
    expect(STRINGS.zh.sec2.widget.loading(45)).toContain("45%");
    expect(STRINGS.en.sec2.widget.evidenceLift("2.3")).toBe("2.3× even");
    expect(STRINGS.zh.sec2.widget.evidenceLift("2.3")).toBe("2.3 倍于均匀");
    expect(STRINGS.en.sec2.widget.evidenceWash("93")).toBe("93% even");
    expect(STRINGS.zh.sec2.widget.evidenceWash("93")).toBe("93% 均匀");
    expect(STRINGS.en.sec2.widget.closest("👀 previous-word", "1.4")).toBe("closest: 👀 previous-word 1.4×");
    expect(STRINGS.zh.sec2.widget.closest("👀 盯前一个词的头", "1.4")).toBe("最接近:👀 盯前一个词的头 1.4 倍");
    expect(STRINGS.en.sec2.widget.count(1)).toBe("1 head");
    expect(STRINGS.en.sec2.widget.count(9)).toBe("9 heads");
    expect(STRINGS.zh.sec2.widget.count(9)).toBe("9 个头");
    expect(STRINGS.en.sec2.widget.scoreValue("2.34", "31")).toBe("2.34× · 31% of the weight");
    expect(STRINGS.zh.sec2.widget.scoreValue("2.34", "31")).toBe("2.34 倍 · 31% 的注意力");
  });

  it("default sentences and model inputs are not in the tables (they stay English live data)", () => {
    // No leaf of either table should carry the default sentences — they live
    // in AttentionHeads.tsx as live data, per the flagship's types.ts doctrine.
    const leaves = JSON.stringify(STRINGS.en) + JSON.stringify(STRINGS.zh);
    expect(leaves).not.toContain("loved her red ball");
    expect(leaves).not.toContain("new kite");
    expect(leaves).not.toContain("small cat in the garden");
  });
});
