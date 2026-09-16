import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { STRINGS } from "../src/essays/why-chinese-costs-more/content/i18n";
import { PAIRS, STORY } from "../src/essays/why-chinese-costs-more/corpus";

/**
 * Essay #7's replica of the flagship's content parity test (the per-essay
 * pattern from src/series/README.md §3): walk both locale tables and compare
 * every leaf path tagged with its runtime type, catching drift beyond what
 * the shared Essay7Strings interface enforces at compile time.
 *
 * This essay's inversion (zh is the primary text) changes nothing here —
 * parity is symmetric. What IS specific to #7: the prose quotes sentences
 * from the measured corpus, so instead of banning corpus text from the
 * tables (essay #5's rule for its presets), this file pins that every
 * quoted sentence matches corpus.ts verbatim — the prose and the CI-measured
 * data can never drift apart.
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

const text = (node: unknown) => renderToStaticMarkup(node as ReactElement);

describe("essay #7 content tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(STRINGS.zh)).toEqual(typedPaths(STRINGS.en));
  });

  it("keeps the canonical zh copy exact (the primary text)", () => {
    const zh = STRINGS.zh;
    expect(zh.hero.title).toBe("中文为什么更贵");
    expect(zh.docTitle).toBe("中文为什么更贵 — 看穿语言模型系列·第七篇");
    expect([zh.sec1.widget.num, zh.sec2.widget.num, zh.sec3.widget.num]).toEqual([
      "第一幕",
      "第二幕",
      "第三幕",
    ]);
    expect(zh.sec1.heading).toBe("第一幕·先过秤");
    expect(zh.sec2.heading).toBe("第二幕·拆到字节");
    expect(zh.sec3.heading).toBe("第三幕·挤窗口");
    expect(zh.sec4.heading).toBe("第四幕·汇率在变");
    expect(zh.outro.heading).toBe("散场，合上账本");
    expect(zh.htmlLang).toBe("zh");
    expect(STRINGS.en.htmlLang).toBe("en");
    // the EN companion keeps SERIES.md's canonical companion title
    expect(STRINGS.en.hero.title).toBe("Why Chinese Costs More Tokens");
  });

  it("both intros open on the measured pair #1, verbatim (the reader can re-weigh the sentence they just read)", () => {
    expect(text(STRINGS.zh.intro.p1())).toContain(PAIRS[0].zh);
    expect(text(STRINGS.en.intro.p1())).toContain(PAIRS[0].en);
  });

  it("every corpus sentence the prose quotes matches corpus.ts verbatim", () => {
    // Act 1's honesty paragraph quotes the cheapest and dearest pairs.
    const zhSec1 = text(STRINGS.zh.sec1.p2());
    expect(zhSec1).toContain(PAIRS[1].zh); // 你好，世界。
    expect(zhSec1).toContain(PAIRS[8].zh); // 从前有一座山…（×1.56，最便宜）
    expect(zhSec1).toContain(PAIRS[2].zh); // 我喜欢吃草莓。（×3.40，最贵）
    const enSec1 = text(STRINGS.en.sec1.p2());
    expect(enSec1).toContain("你好，世界。");
    expect(enSec1).toContain(PAIRS[2].zh);
    // Act 2 quotes the X-ray sentence in both locales.
    expect(text(STRINGS.zh.sec2.p2())).toContain(PAIRS[2].zh);
    expect(text(STRINGS.en.sec2.p2())).toContain(PAIRS[2].zh);
  });

  it("the story pair stays live data — its full text never enters the tables", () => {
    const leaves = JSON.stringify(STRINGS.en) + JSON.stringify(STRINGS.zh);
    expect(leaves).not.toContain(STORY.en);
    expect(leaves).not.toContain(STORY.zh);
  });

  it("interpolating functions format correctly in both locales", () => {
    for (const lang of ["en", "zh"] as const) {
      const t = STRINGS[lang];
      for (const w of [t.sec1.widget, t.sec3.widget]) {
        expect(w.count(43)).toContain("43");
        expect(w.share("2.1")).toContain("2.1");
        expect(w.ratioCaption(43, 14)).toContain("43");
        expect(w.ratioCaption(43, 14)).toContain("14");
      }
      const x = t.sec2.widget;
      expect(x.letterTally(7, 1, "草")).toContain("7");
      expect(x.pieceTally(17)).toContain("17");
      // all three insight branches render
      expect(text(x.insight({ letters: 7, count: 0, letter: "草", pieces: 17, carriers: [] }))).toBeTruthy();
      const none = text(x.insight({ letters: 7, count: 1, letter: "草", pieces: 17, carriers: [] }));
      expect(none).toContain("草");
      const some = text(x.insight({ letters: 1, count: 1, letter: "的", pieces: 1, carriers: [23626] }));
      expect(some).toContain("#23626");
    }
  });
});
