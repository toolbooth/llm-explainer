import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/content/i18n";

/**
 * Walk a strings table and return every leaf path tagged with its runtime
 * type, e.g. "act6.scale[1].params:string". Comparing the full lists between
 * locales catches key drift anywhere in the (nested) table: added, removed,
 * or re-typed entries — beyond what the shared TS interface already enforces
 * at compile time.
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

describe("essay content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = STRINGS.zh;
    expect(zh.docTitle).toBe("ChatGPT 到底在想什么 — 看穿语言模型的七幕互动长文");
    expect(zh.hero.title).toBe("ChatGPT 到底在想什么");
    expect(zh.hero.kicker).toContain("一篇让你亲手解剖语言模型的互动长文");
    expect(zh.hero.subtitle).toContain(
      "一个真实的语言模型,活在这个标签页里,被一幕一幕地解剖"
    );
    expect(zh.act4.wakeModel).toBe("唤醒模型(约 226MB,只此一次,之后永久缓存)");
    // canonical act titles: 第N幕·<title>
    expect([zh.act1.num, zh.act2.num, zh.act3.num, zh.act4.num, zh.act5.num]).toEqual([
      "第一幕",
      "第二幕",
      "第三幕",
      "第四幕",
      "第五幕",
    ]);
    expect(zh.act1.title).toMatch(/^切词机/);
    expect(zh.act2.title).toMatch(/^意义地图/);
    expect(zh.act3.title).toMatch(/^注意力之屋/);
    expect(zh.act4.title).toMatch(/^赌局/);
    expect(zh.act5.title).toMatch(/^循环/);
    expect(zh.act6.heading).toBe("第六幕·拉远看");
    expect(zh.act7.heading).toBe("第七幕·它为什么说谎");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(STRINGS.en.act1.tokenCount(1)).toBe("1 token.");
    expect(STRINGS.en.act1.tokenCount(3)).toBe("3 tokens.");
    expect(STRINGS.zh.act1.tokenCount(3)).toBe("共 3 个 token。");
    expect(STRINGS.en.act3.diagPrev(2, 7, "98")).toBe("👀 previous-word head · L2H7 (98%)");
    expect(STRINGS.zh.act3.diagPrev(2, 7, "98")).toBe("👀 盯前一个词的头 · L2H7(98%)");
    expect(STRINGS.en.act2.loading(45)).toContain("45%");
    expect(STRINGS.zh.act2.loading(45)).toContain("45%");
    expect(STRINGS.zh.act3.lensHintReading("upon")).toContain("“upon”");
  });
});
