import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/essays/why-it-cant-count/content/i18n";

/**
 * Essay #4's replica of the flagship's content parity test (the per-essay
 * pattern from src/series/README.md Act 3): walk both locale tables and compare
 * every leaf path tagged with its runtime type, catching drift beyond what
 * the shared Essay4Strings interface enforces at compile time.
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

describe("essay #4 content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = STRINGS.zh;
    expect(zh.hero.title).toBe("为什么 AI 数不出 strawberry 有几个 r");
    expect(zh.docTitle).toBe("为什么 AI 数不出 strawberry 有几个 r — 看穿语言模型系列·第四篇");
    expect([zh.sec1.widget.num, zh.sec2.widget.num, zh.sec3.widget.num, zh.sec4.widget.num]).toEqual([
      "第一幕",
      "第二幕",
      "第三幕",
      "第四幕",
    ]);
    expect(zh.sec1.heading).toBe("第一幕·模型的感官是 token");
    expect(zh.sec2.heading).toBe("第二幕·切词 X 光");
    expect(zh.sec3.heading).toBe("第三幕·数字也是 token");
    expect(zh.sec4.heading).toBe("第四幕·解法跟着机制走");
    // the flagship's canonical wake-button line is reused verbatim in all three model widgets
    for (const w of [zh.sec2.widget, zh.sec3.widget, zh.sec4.widget]) {
      expect(w.wakeModel).toBe("唤醒模型(约 136MB,只此一次,之后永久缓存)");
    }
    // and the Chopper's flagship chrome (loading line) in Act 1
    expect(zh.sec1.widget.loading).toBe("正在加载切词器(约 2MB,只下载一次)…");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(STRINGS.en.sec1.widget.tokenCount(1)).toBe("1 token.");
    expect(STRINGS.en.sec1.widget.tokenCount(3)).toBe("3 tokens.");
    expect(STRINGS.zh.sec1.widget.tokenCount(3)).toBe("共 3 个 token。");
    expect(STRINGS.en.sec2.widget.letterTally(10, 3, "r")).toBe("10 letters · 3 × “r”");
    expect(STRINGS.zh.sec2.widget.letterTally(10, 3, "r")).toBe("10 个字母 · 3 个 “r”");
    expect(STRINGS.en.sec2.widget.pieceTally(1)).toBe("1 piece");
    expect(STRINGS.en.sec2.widget.pieceTally(3)).toBe("3 pieces");
    expect(STRINGS.zh.sec2.widget.pieceTally(3)).toBe("3 块碎片");
    expect(STRINGS.en.sec2.widget.truthLabel(3)).toBe("true count: 3");
    expect(STRINGS.zh.sec2.widget.truthLabel(3)).toBe("正确答案:3");
    expect(STRINGS.en.sec2.widget.otherMass("12")).toBe("non-digit tokens: 12%");
    expect(STRINGS.zh.sec2.widget.otherMass("12")).toBe("非数字 token:12%");
  });

  it("the insight line handles all three cases in both locales", () => {
    for (const lang of ["en", "zh"] as const) {
      const insight = STRINGS[lang].sec2.widget.insight;
      expect(insight({ letters: 10, count: 3, letter: "r", pieces: 3, carriers: [1653, 8931] })).toBeTruthy();
      expect(insight({ letters: 10, count: 0, letter: "z", pieces: 3, carriers: [] })).toBeTruthy();
      expect(insight({ letters: 3, count: 1, letter: "a", pieces: 3, carriers: [7] })).toBeTruthy();
    }
  });

  it("default word, letter and presets are not in the tables (they stay English live data)", () => {
    // No leaf of either table should carry the widgets' live inputs — they
    // live in WhyItCantCount.tsx, per the flagship's types.ts doctrine. The
    // prose may mention strawberry (it is the essay's subject); the prompts
    // and arithmetic presets may not appear.
    const leaves = JSON.stringify(STRINGS.en) + JSON.stringify(STRINGS.zh);
    expect(leaves).not.toContain("A: There are");
    expect(leaves).not.toContain("1234 + 5678 = ");
    expect(leaves).not.toContain("47 * 23 = 10");
  });
});
