import { describe, expect, it } from "vitest";
import { STRINGS as CLASSROOM } from "../src/classroom/content/i18n";
import { ABOUT_SLUGS } from "../src/classroom/about/slugs";

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
    // the index's front-matter list is the about route family, in order (PRODUCT.md §5 items 2–8)
    expect(CLASSROOM.en.frontMatter.items.map((i) => i.slug)).toEqual([...ABOUT_SLUGS]);
    expect(CLASSROOM.zh.frontMatter.items.map((i) => i.slug)).toEqual(
      CLASSROOM.en.frontMatter.items.map((i) => i.slug)
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
    expect(zh.question).toBe("我打一句话进去，模型到底看见了什么？");
    expect([zh.hook.widget.num, zh.explore.step1Widget.num, zh.explore.step2Widget.num, zh.explore.step3Widget.num, zh.extension.widget.num]).toEqual([
      "导入",
      "第 1 步",
      "第 2 步",
      "第 3 步",
      "延伸",
    ]);
    // the flagship Chopper's canonical loading line is reused verbatim
    expect(zh.hook.widget.loading).toBe("正在加载切词器（约 2MB，只下载一次）…");
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

// ── Module 2 ───────────────────────────────────────────────────────────────
import { STRINGS as M2 } from "../src/classroom/m2/content/i18n";
import { DICE_TABLES, EXTENSION_PRESETS as M2_EXTENSION_PRESETS, HOOK_RUNS, HOOK_TEXT, MEASURED, STEP_PRESETS } from "../src/classroom/m2/data";
import { hookFacts, twoPlusTwoFacts } from "../src/classroom/m2/facts";
import { diceCells } from "../src/classroom/m2/rolls";

describe("module 2 content tables (page + guide + printable + slides)", () => {
  const facts = hookFacts();
  const ext = twoPlusTwoFacts();

  it("en and zh have identical key sets, deeply — including every array length", () => {
    expect(typedPaths(M2.zh)).toEqual(typedPaths(M2.en));
  });

  it("follows the §4.3 skeleton: 3 steps × 3 hints, 3 evaluation questions, 3 exit questions", () => {
    for (const lang of ["en", "zh"] as const) {
      const t = M2[lang];
      expect(t.explore.steps).toHaveLength(3);
      for (const s of t.explore.steps) expect(s.hints).toHaveLength(3);
      expect(t.evaluate.questions).toHaveLength(3);
      expect(t.exit.questions).toHaveLength(3);
    }
  });

  it("the guide follows §5: 3 objectives, 14 sections, 5 discussion prompts, 3-level rubric with samples for every exit question", () => {
    for (const lang of ["en", "zh"] as const) {
      const g = M2[lang].guide;
      expect(g.objectives).toHaveLength(3);
      expect(Object.keys(g.sections)).toHaveLength(14);
      expect(Object.keys(g.sections)).toEqual(Object.keys(M1[lang].guide.sections));
      expect(g.discussion.items).toHaveLength(5);
      expect(g.assessment.levels).toHaveLength(3);
      expect(g.assessment.items).toHaveLength(3);
      for (const item of g.assessment.items) expect(item.samples).toHaveLength(3);
      expect(g.assessment.items.map((i) => i.q)).toEqual(M2[lang].exit.questions);
      expect(g.plan.rows).toHaveLength(6);
      expect(g.plan.rows.map((r) => r.time)).toEqual(["0–3", "3–13", "13–33", "33–40", "40–45", "+45"]);
      expect(g.unplugged.script).toHaveLength(4);
      expect(g.misconceptions.rows).toHaveLength(5);
      expect(g.misconceptions.rows.some((r) => /Hundred Rolls|掷一百次/.test(r.shows))).toBe(true);
      expect(g.differentiation.nonStem.prompts).toHaveLength(3);
      expect(g.differentiation.ell.glossary).toHaveLength(6);
      expect(g.accessibility).toHaveLength(4);
      expect(g.standards.rows.map((r) => r.id)).toContain("HS-ALG-PS-04");
      expect(g.standards.rows.map((r) => r.id)).toContain("AAP-3 3.15 Random Values");
      expect(g.standards.rows.map((r) => r.id)).toContain("AAP-3 3.16 Simulations");
      // the hook prompt's deep link and the slides route are named from the guide
      expect(JSON.stringify(g.embed.slides())).toContain("#/classroom/m2/slides");
    }
  });

  it("the Slides companion has 8–12 slides, the first a title slide, every visual a known key, every note a function of the facts", () => {
    for (const lang of ["en", "zh"] as const) {
      const sl = M2[lang].slides;
      expect(sl.slides.length).toBeGreaterThanOrEqual(8);
      expect(sl.slides.length).toBeLessThanOrEqual(12);
      expect(sl.slides[0].title).toBe(M2[lang].title);
      const visuals = sl.slides.map((s) => s.visual).filter(Boolean);
      expect(visuals).toEqual(["hook-bars", "dice", "temp-bars", "steps"]);
      for (const s of sl.slides) {
        expect(s.lines.length).toBeGreaterThanOrEqual(2);
        expect(s.lines.length).toBeLessThanOrEqual(3);
        expect(typeof s.note(facts)).toBe("string");
        expect(s.note(facts).length).toBeGreaterThan(20);
      }
      expect(sl.counter(3, 10)).toContain("3");
      expect(sl.counter(3, 10)).toContain("10");
    }
    expect(M2.en.slides.counter(3, 10)).toBe("Slide 3 of 10");
    expect(M2.zh.slides.counter(3, 10)).toBe("第 3 张，共 10 张");
  });

  it("keeps the canonical zh copy exact", () => {
    const zh = M2.zh;
    expect(zh.title).toBe("下一个词的赌局");
    expect(zh.docTitle).toBe("模块 2 · 下一个词的赌局 — 机器内部·课堂版");
    expect(zh.question).toBe("模型是在选，还是在掷骰子？");
    expect([zh.hook.widget.num, zh.explore.step1Widget.num, zh.explore.step2Widget.num, zh.explore.step3Widget.num, zh.extension.widget.num]).toEqual([
      "导入",
      "第 1 步",
      "第 2 步",
      "第 3 步",
      "延伸",
    ]);
    // the flagship's canonical Act-4/5 chrome is reused verbatim
    expect(zh.hook.widget.think).toBe("想一想");
    expect(zh.hook.widget.roll).toBe("🎲 掷骰子");
    expect([zh.explore.step3Widget.legendHigh, zh.explore.step3Widget.legendMid, zh.explore.step3Widget.legendLow]).toEqual(["十拿九稳", "五五开", "爆冷"]);
    expect(zh.explore.step2Widget.title).toMatch(/^掷一百次/);
    expect(zh.explore.step2Widget.tableToggle).toBe("改看表格");
    expect(zh.guide.sections.unplugged).toBe("不插电活动——骰子与表");
    expect(zh.sheet.title).toBe("下一个词的赌局——不插电");
    expect(zh.slides.title).toBe("下一个词的赌局——幻灯片");
    expect(M2.en.title).toBe("The Next-Word Gamble");
    expect(M2.en.explore.step2Widget.title).toMatch(/^Hundred Rolls/);
  });

  it("interpolating functions format correctly in both locales", () => {
    expect(M2.en.explore.step2Widget.roll(100)).toBe("🎲 Roll 100 times");
    expect(M2.zh.explore.step2Widget.roll(100)).toBe("🎲 掷 100 次");
    expect(M2.en.explore.step2Widget.rollMore(100)).toBe("🎲 Roll 100 more");
    expect(M2.zh.explore.step2Widget.rollMore(100)).toBe("🎲 再掷 100 次");
    expect(M2.en.explore.step2Widget.loading(42)).toContain("42%");
    expect(M2.zh.explore.step2Widget.loading(42)).toContain("42%");
    expect(M2.en.hook.widget.loading?.(7)).toContain("7%");
    for (const lang of ["en", "zh"] as const) {
      const w = M2[lang].explore.step2Widget;
      const s = w.summary({ n: 100, winner: " grass", winnerCount: 22, winnerP: 0.2173, favourite: " grass", favouriteCount: 22, favouriteP: 0.2173, distinct: 10 });
      expect(s).toContain("100");
      expect(s).toContain("grass");
      expect(s).toContain("22%");
      expect(M2[lang].guide.unplugged.tableCaption(2, "The cat sat on the grass")).toContain("2");
      expect(M2[lang].guide.unplugged.spineNote(" grass")).toContain("grass");
      expect(M2[lang].sheet.tables.caption(1, HOOK_TEXT)).toContain(HOOK_TEXT);
      expect(M2[lang].slides.tempLabel(0.5)).toBe("T = 0.5");
      expect(M2[lang].slides.barsCaption(HOOK_TEXT)).toContain(HOOK_TEXT);
      // prose that quotes numbers takes them from the facts
      expect(JSON.stringify(M2[lang].hook.prose(facts))).toContain("22%");
      expect(JSON.stringify(M2[lang].extension.prose(ext.favourite, ext.favouriteP, ext.fourP))).toContain("6%");
      for (const p of M2[lang].guide.background.paras) expect(p(facts)).toBeTruthy();
      for (const item of M2[lang].guide.assessment.items) for (const sample of item.samples) expect(sample(facts).length).toBeGreaterThan(3);
      expect(JSON.stringify(M2[lang].guide.assessment.measured(facts))).toContain("198");
    }
  });

  it("measured numbers stay in data.ts: no percentage or roll count is typed into a table", () => {
    for (const lang of ["en", "zh"] as const) {
      // JSON.stringify drops the functions, i.e. every string that takes facts as an argument
      const leaves = JSON.stringify(M2[lang]);
      // the hook favourite's measured probability / counts, in every form the prose could quote them
      for (const measured of ["21.7", "22%", "36%", "17%", "0.2173", "198", "73.8", "74%", "79.7", "80%"]) {
        expect(leaves, measured).not.toContain(measured);
      }
      // …and the big model is never mentioned by any classroom string
      expect(leaves).not.toContain("136MB");
      expect(leaves).not.toContain("唤醒模型");
      expect(leaves).not.toContain("Wake the model");
    }
  });

  it("the dice tables are self-consistent: three positions along the favourite spine, 36 cells each", () => {
    expect(DICE_TABLES).toHaveLength(3);
    expect(DICE_TABLES[0].prompt.text).toBe(HOOK_TEXT);
    for (let i = 0; i < DICE_TABLES.length; i++) {
      const { prompt, picked } = DICE_TABLES[i];
      expect(prompt.t10).toHaveLength(10);
      expect(prompt.t10.reduce((a, c) => a + c.p, 0)).toBeCloseTo(1, 2);
      // the favourite is first at every temperature, and the spine follows it
      expect(prompt.t10[0].p).toBeGreaterThanOrEqual(prompt.t10[1].p);
      if (picked) {
        expect(picked).toBe(prompt.t10[0].label);
        expect(DICE_TABLES[i + 1].prompt.text).toBe(prompt.text + picked);
      }
      const { alloc, other } = diceCells(prompt.t10.map((c) => c.p));
      expect(alloc.reduce((a, b) => a + b, 0) + other).toBe(36);
      expect(other).toBe(0);
      expect(alloc[0]).toBeGreaterThan(0);
    }
    // table 2 is the "sure thing" (one word owns most of it); tables 1 and 3 are flat
    expect(diceCells(DICE_TABLES[1].prompt.t10.map((c) => c.p)).alloc[0]).toBeGreaterThanOrEqual(25);
    expect(diceCells(DICE_TABLES[0].prompt.t10.map((c) => c.p)).alloc[0]).toBeLessThanOrEqual(10);
    expect(diceCells(DICE_TABLES[2].prompt.t10.map((c) => c.p)).alloc[0]).toBeLessThanOrEqual(10);
  });

  it("the facts the prose quotes are derived from the measured arrays", () => {
    expect(facts.favourite).toBe(MEASURED.hook.t10[0].label);
    expect(facts.run10).toBe(HOOK_RUNS.t10[0]);
    expect(facts.run10 + HOOK_RUNS.t10.slice(1).reduce((a, b) => a + b, 0)).toBe(100);
    expect(facts.tenMin).toBeLessThanOrEqual(facts.run10);
    expect(facts.tenMax).toBeGreaterThanOrEqual(facts.run10);
    expect(Math.abs(facts.thousand / 1000 - facts.p10)).toBeLessThan(0.03);
    expect(facts.p05).toBeGreaterThan(facts.p10);
    expect(facts.p10).toBeGreaterThan(facts.p15);
    expect(ext.fourP).toBeGreaterThan(0);
    expect(ext.fourP).toBeLessThan(ext.favouriteP);
    expect(STEP_PRESETS[0]).toBe(HOOK_TEXT);
    expect(M2_EXTENSION_PRESETS).toContain("Two plus two is");
  });
});
