import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STRINGS } from "../src/content/i18n";
import {
  CITE_AUTHOR,
  CITE_TITLE,
  CITE_URL,
  CITE_YEAR,
  FLAGSHIP_BIBTEX,
} from "../src/content/citation";

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
      "一个真实的语言模型，活在这个标签页里，被一幕一幕地解剖"
    );
    expect(zh.act4.wakeModel).toBe("唤醒模型（约 136MB，只此一次，之后永久缓存）");
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
    expect(zh.cite.heading).toBe("引用本文");
    expect(zh.cite.copy).toBe("复制");
    expect(zh.cite.note).toContain("arXiv 预印本即将发布，届时请优先引用预印本");
    expect(STRINGS.en.cite.heading).toBe("Cite this");
    expect(STRINGS.en.cite.note).toBe(
      "An arXiv preprint is forthcoming; please cite that once available."
    );
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

describe("citation infrastructure", () => {
  it("BibTeX is a well-formed @misc entry over the shared constants", () => {
    const lines = FLAGSHIP_BIBTEX.split("\n");
    expect(lines[0]).toMatch(/^@misc\{[a-z0-9]+,$/);
    expect(lines[lines.length - 1]).toBe("}");
    expect(FLAGSHIP_BIBTEX).toContain(`author       = {${CITE_AUTHOR}}`);
    expect(FLAGSHIP_BIBTEX).toContain(`year         = {${CITE_YEAR}}`);
    expect(FLAGSHIP_BIBTEX).toContain(`howpublished = {\\url{${CITE_URL}}}`);
    expect(FLAGSHIP_BIBTEX).toContain("note         = {Interactive essay}");
    // title carried over intact, with only the acronym brace-protected
    expect(FLAGSHIP_BIBTEX).toContain(`title        = {${CITE_TITLE.replace("LLMs", "{LLMs}")}}`);
    // every field line is "  name = {...}," — no stray unbalanced braces
    for (const line of lines.slice(1, -1)) {
      const opens = (line.match(/\{/g) ?? []).length;
      const closes = (line.match(/\}/g) ?? []).length;
      expect(opens).toBe(closes);
    }
  });

  it("index.html's Google Scholar meta tags match the citation constants", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    // strip HTML comments so the commented-out arXiv pair doesn't count as live
    const live = html.replace(/<!--[\s\S]*?-->/g, "");
    const meta = (name: string): string | undefined =>
      new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`).exec(live)?.[1];
    expect(meta("citation_title")).toBe(CITE_TITLE);
    expect(meta("citation_author")).toBe(CITE_AUTHOR);
    expect(meta("citation_publication_date")).toBe(CITE_YEAR);
    expect(meta("citation_language")).toBe("en");
    expect(meta("citation_public_url")).toBe(CITE_URL);
    // the arXiv pair stays commented out until the preprint exists
    expect(meta("citation_pdf_url")).toBeUndefined();
    expect(meta("citation_arxiv_id")).toBeUndefined();
    expect(html).toContain("citation_arxiv_id");
    // existing chrome untouched
    expect(meta("description")).toContain("An interactive essay.");
    expect(meta("theme-color")).toBe("#0f1117");
  });
});
