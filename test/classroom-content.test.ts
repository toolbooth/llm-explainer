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
