import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/essays/why-it-repeats/content/i18n";

/**
 * Essay #5's replica of the flagship's content parity test (the per-essay
 * pattern from src/series/README.md §3): walk both locale tables and compare
 * every leaf path tagged with its runtime type, catching drift beyond what
 * the shared Essay5Strings interface enforces at compile time.
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

describe("essay #5 content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = STRINGS.zh;
    expect(zh.hero.title).toBe("为什么它复读");
    expect(zh.docTitle).toBe("为什么它复读 — 看穿语言模型系列·第五篇");
    expect([zh.sec1.widget.num, zh.sec2.widget.num, zh.sec3.widget.num]).toEqual([
      "第一幕",
      "第二幕",
      "第三幕",
    ]);
    expect(zh.sec1.heading).toBe("第一幕·跳针");
    expect(zh.sec2.heading).toBe("第二幕·槽越磨越深");
    expect(zh.sec3.heading).toBe("第三幕·晃一晃唱针");
    expect(zh.sec4.heading).toBe("第四幕·药房");
    // the flagship act-5 chrome is reused verbatim in both Parrot instances
    for (const w of [zh.sec1.widget, zh.sec3.widget]) {
      expect(w.write).toBe("▶ 开写");
      expect(w.stop).toBe("⏸ 停下");
      expect(w.cont).toBe("▶ 继续");
      expect(w.reset).toBe("重来");
      expect(w.loading(42)).toBe("正在加载童话小模型（7.5MB，与第一篇共用）… 42%");
    }
    // and the flagship act-4 canonical labels in the nano Gamble
    expect(zh.sec2.widget.think).toBe("想一想");
    expect(zh.sec2.widget.roll).toBe("🎲 掷骰子");
    expect(zh.sec2.widget.tempCareful).toBe("🧊 谨慎");
    expect(zh.sec2.widget.tempChaotic).toBe("🔥 狂野");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(STRINGS.en.sec1.widget.loading(7)).toContain("7%");
    expect(STRINGS.zh.sec2.widget.loading!(99)).toContain("99%");
    for (const lang of ["en", "zh"] as const) {
      for (const w of [STRINGS[lang].sec1.widget, STRINGS[lang].sec3.widget]) {
        expect(w.verdict("It was red and blue.", 5)).toBeTruthy();
        expect(w.noRepeat.length).toBeGreaterThan(0);
      }
      expect(STRINGS[lang].sec2.widget.picked("The")).toBeTruthy();
    }
  });

  it("preset prompts are not in the tables (they stay English live data)", () => {
    // The Parrot presets and the encore presets live in WhyItRepeats.tsx,
    // per the flagship's types.ts doctrine. (The hero subtitle may quote the
    // cat-mat meme — the essay's subject — but never the widget presets.)
    const leaves = JSON.stringify(STRINGS.en) + JSON.stringify(STRINGS.zh);
    expect(leaves).not.toContain("Tom and Lily went to the park.");
    expect(leaves).not.toContain("The bird flew up.");
    expect(leaves).not.toContain("The man said");
  });
});
