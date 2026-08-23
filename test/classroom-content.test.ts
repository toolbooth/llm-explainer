import { describe, expect, it } from "vitest";
import { STRINGS as CLASSROOM } from "../src/classroom/content/i18n";

/**
 * The Classroom Edition's replica of the series' content parity test: walk
 * both locale tables and compare every leaf path tagged with its runtime
 * type, catching drift beyond what the shared interface enforces at compile
 * time. Arrays are walked by index, so a hint, question or rubric level
 * missing in one locale is a failure here.
 */
export function typedPaths(value: unknown, prefix = ""): string[] {
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

describe("classroom shared chrome tables", () => {
  it("en and zh have identical key sets, deeply", () => {
    expect(typedPaths(CLASSROOM.zh)).toEqual(typedPaths(CLASSROOM.en));
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = CLASSROOM.zh;
    expect(zh.index.title).toBe("机器内部·课堂版");
    expect(zh.docTitle).toBe("机器内部·课堂版 — Inside the Machine");
    expect(zh.nav.guide).toBe("教师指南");
    expect(zh.beats.unplugged.label).toBe("不插电");
    expect(zh.beats.exit.label).toBe("出门条");
    expect(zh.beats.extension.label).toBe("大课延伸");
    expect(zh.htmlLang).toBe("zh");
    expect(CLASSROOM.en.htmlLang).toBe("en");
    expect(CLASSROOM.en.index.title).toBe("Classroom Edition");
  });

  it("hint and module labels interpolate in both locales", () => {
    expect(CLASSROOM.en.hints.reveal(1, 3)).toBe("Show hint 1 of 3");
    expect(CLASSROOM.zh.hints.reveal(1, 3)).toBe("看提示 1/3");
    expect(CLASSROOM.en.hints.label(2)).toBe("Hint 2");
    expect(CLASSROOM.zh.hints.label(2)).toBe("提示 2");
    expect(CLASSROOM.en.index.moduleLabel(1)).toBe("Module 1");
    expect(CLASSROOM.zh.index.moduleLabel(1)).toBe("模块 1");
  });

  it("the site's own text says lesson/teacher/standards and never presents as a chat product (§6.2)", () => {
    for (const lang of ["en", "zh"] as const) {
      const t = CLASSROOM[lang];
      const leaves = JSON.stringify(t);
      // the chat words only ever appear inside the "not a chatbot" disclaimer
      expect(leaves.toLowerCase()).not.toContain("chat with");
      expect(leaves).not.toContain("聊天框");
    }
    expect(CLASSROOM.en.frontMatter.items.map((i) => i.key)).toEqual([
      "model-card",
      "privacy",
      "tech-check",
      "crosswalk",
      "policy",
      "accessibility",
      "cite",
    ]);
    expect(CLASSROOM.zh.frontMatter.items.map((i) => i.key)).toEqual(
      CLASSROOM.en.frontMatter.items.map((i) => i.key)
    );
  });
});

// ── Module 1 ───────────────────────────────────────────────────────────────
import { STRINGS as M1 } from "../src/classroom/m1/content/i18n";
import {
  EXTENSION_PRESETS,
  EXTENSION_STRIP,
  STEP2_PRESETS,
  UNPLUGGED_STRIPS,
  joinPieces,
} from "../src/classroom/m1/data";

describe("module 1 content tables (page + guide + printable)", () => {
  it("en and zh have identical key sets, deeply — including every array length", () => {
    expect(typedPaths(M1.zh)).toEqual(typedPaths(M1.en));
  });

  it("follows the §4.3 skeleton: 3 steps × 3 hints, 3 evaluation questions, 3 exit questions", () => {
    for (const lang of ["en", "zh"] as const) {
      const t = M1[lang];
      expect(t.explore.steps).toHaveLength(3);
      for (const s of t.explore.steps) expect(s.hints).toHaveLength(3);
      expect(t.evaluate.questions).toHaveLength(3);
      expect(t.exit.questions).toHaveLength(3);
    }
  });

  it("the guide follows §5: 3 objectives, 14 sections, 5 discussion prompts, 3-level rubric with samples for every exit question", () => {
    for (const lang of ["en", "zh"] as const) {
      const g = M1[lang].guide;
      expect(g.objectives).toHaveLength(3);
      expect(Object.keys(g.sections)).toHaveLength(14);
      expect(g.discussion.items).toHaveLength(5);
      expect(g.assessment.levels).toHaveLength(3);
      expect(g.assessment.items).toHaveLength(3);
      for (const item of g.assessment.items) expect(item.samples).toHaveLength(3);
      // the exit questions in the guide are the page's exit questions
      expect(g.assessment.items.map((i) => i.q)).toEqual(M1[lang].exit.questions);
      expect(g.plan.rows).toHaveLength(6);
      expect(g.plan.rows.map((r) => r.time)).toEqual(["0–3", "3–13", "13–33", "33–40", "40–45", "+45"]);
      expect(g.differentiation.nonStem.prompts).toHaveLength(3);
      expect(g.differentiation.ell.glossary.length).toBeGreaterThanOrEqual(5);
      expect(g.standards.rows.map((r) => r.id)).toContain("HS-SOC-ET-40");
      expect(g.standards.rows.map((r) => r.id)).toContain("DAT-2");
    }
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = M1.zh;
    expect(zh.title).toBe("切词机");
    expect(zh.docTitle).toBe("模块 1 · 切词机 — 机器内部·课堂版");
    expect(zh.question).toBe("我打一句话进去,模型到底看见了什么?");
    expect([zh.hook.widget.num, zh.explore.step1Widget.num, zh.explore.step2Widget.num, zh.explore.step3Widget.num, zh.extension.widget.num]).toEqual([
      "导入",
      "第 1 步",
      "第 2 步",
      "第 3 步",
      "延伸",
    ]);
    // the flagship Chopper's canonical loading line is reused verbatim
    expect(zh.hook.widget.loading).toBe("正在加载切词器(约 2MB,只下载一次)…");
    expect(zh.guide.sections.plan).toBe("逐分钟教案");
    expect(zh.sheet.title).toBe("切词机——不插电");
    expect(M1.en.title).toBe("The Word Chopper");
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(M1.en.hook.widget.tokenCount(1)).toBe("1 piece.");
    expect(M1.en.hook.widget.tokenCount(9)).toBe("9 pieces.");
    expect(M1.zh.hook.widget.tokenCount(9)).toBe("共 9 块碎片。");
    expect(M1.en.explore.step3Widget.letterTally(10, 3, "r")).toBe("10 letters · 3 × “r”");
    expect(M1.zh.explore.step3Widget.letterTally(10, 3, "r")).toBe("10 个字母 · 3 个 “r”");
    expect(M1.en.guide.unplugged.tally(6, 9)).toBe("6 words → 9 pieces");
    expect(M1.zh.guide.unplugged.tally(6, 9)).toBe("6 个词 → 9 块碎片");
    expect(M1.en.guide.unplugged.extensionTally(7, 17)).toBe("7 characters → 17 byte-pieces");
    for (const lang of ["en", "zh"] as const) {
      const insight = M1[lang].explore.step3Widget.insight;
      expect(insight({ letters: 10, count: 3, letter: "r", pieces: 3, carriers: [1831, 8396] })).toBeTruthy();
      expect(insight({ letters: 10, count: 0, letter: "z", pieces: 3, carriers: [] })).toBeTruthy();
      expect(insight({ letters: 3, count: 1, letter: "a", pieces: 3, carriers: [7] })).toBeTruthy();
    }
  });

  it("live inputs stay in data.ts, not in the tables (English live data, every locale)", () => {
    const leaves = JSON.stringify(M1.en) + JSON.stringify(M1.zh);
    expect(leaves).not.toContain("My Chromebook restarted");
    expect(leaves).not.toContain("summer vacation");
    expect(leaves).not.toContain("Our basketball team");
    expect(leaves).not.toContain("skateboarder");
    // …and the big model is never mentioned by any classroom string
    expect(leaves).not.toContain("136MB");
    expect(leaves).not.toContain("Wake the model");
    expect(leaves).not.toContain("唤醒模型");
  });

  it("the unplugged answer key is self-consistent: pieces re-join to the strip, one id per piece", () => {
    expect(UNPLUGGED_STRIPS).toHaveLength(3);
    for (const s of UNPLUGGED_STRIPS) {
      expect(joinPieces(s.pieces)).toBe(s.text);
      expect(s.ids).toHaveLength(s.pieces.length);
      expect(s.words).toBe(s.text.split(/\s+/).length);
      // every strip surprises: more pieces than words
      expect(s.pieces.length).toBeGreaterThan(s.words);
      for (const id of s.ids) expect(Number.isInteger(id) && id >= 0 && id < 50257).toBe(true);
    }
    expect(EXTENSION_STRIP.pieces).toBeGreaterThan(EXTENSION_STRIP.chars);
    expect(STEP2_PRESETS).toContain(" strawberry");
    expect(EXTENSION_PRESETS[0]).toBe(EXTENSION_STRIP.text);
  });
});
