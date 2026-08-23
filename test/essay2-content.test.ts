import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/essays/why-it-lies/content/i18n";

/**
 * Essay #2's replica of the flagship's content parity test (the per-essay
 * pattern from src/series/README.md Act 3): walk both locale tables and compare
 * every leaf path tagged with its runtime type, catching drift beyond what
 * the shared Essay2Strings interface enforces at compile time.
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

describe("essay #2 content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = STRINGS.zh;
    expect(zh.hero.title).toBe("它为什么说谎");
    expect(zh.docTitle).toBe("它为什么说谎 — 看穿语言模型系列·第二篇");
    expect([zh.sec1.widget.num, zh.sec2.widget.num, zh.sec3.widget.num, zh.sec4.widget.num]).toEqual([
      "第一幕",
      "第二幕",
      "第三幕",
      "第四幕",
    ]);
    expect(zh.sec1.heading).toBe("第一幕·拒绝不了的赌局");
    expect(zh.sec2.heading).toBe("第二幕·文献形状的骰子");
    expect(zh.sec3.heading).toBe("第三幕·重掷测试");
    expect(zh.sec4.heading).toBe("第四幕·尖与平");
    // the flagship's canonical wake-button line is reused verbatim
    expect(zh.sec1.widget.wakeModel).toBe("唤醒模型（约 136MB，只此一次，之后永久缓存）");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(STRINGS.en.sec3.widget.rolling(3, 5)).toBe("rolling 3/5…");
    expect(STRINGS.zh.sec3.widget.rolling(3, 5)).toBe("正在重掷 3/5…");
    expect(STRINGS.en.sec2.widget.loading(45)).toContain("45%");
    expect(STRINGS.zh.sec2.widget.loading(45)).toContain("45%");
  });

  it("preset prompts and model inputs are not in the tables (they stay English live data)", () => {
    // No leaf of either table should carry the preset prompts — they live in
    // WhyItLies.tsx as live data, per the flagship's types.ts doctrine.
    const leaves = JSON.stringify(STRINGS.en) + JSON.stringify(STRINGS.zh);
    expect(leaves).not.toContain("capital of Atlantis");
    expect(leaves).not.toContain("References: [1]");
  });
});
