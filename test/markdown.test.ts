import { describe, expect, it } from "vitest";
import { inlineText, outline, parseInline, parseMarkdown } from "../src/classroom/about/md";

/**
 * The front-matter Markdown parser: every construct the seven drafts use,
 * and the few they don't that could bite (a lone asterisk, a pipe inside
 * a code span, an empty table cell).
 */
describe("markdown parser — inline", () => {
  it("strong, em, code, links and text", () => {
    expect(parseInline("a **b** *c* `d` [e](#/x) f")).toEqual([
      { t: "text", s: "a " },
      { t: "strong", c: [{ t: "text", s: "b" }] },
      { t: "text", s: " " },
      { t: "em", c: [{ t: "text", s: "c" }] },
      { t: "text", s: " " },
      { t: "code", s: "d" },
      { t: "text", s: " " },
      { t: "link", href: "#/x", c: [{ t: "text", s: "e" }] },
      { t: "text", s: " f" },
    ]);
  });

  it("nests strong inside em and keeps code spans opaque", () => {
    expect(parseInline("*(Brief, **Aug** 2026)*")).toEqual([
      { t: "em", c: [{ t: "text", s: "(Brief, " }, { t: "strong", c: [{ t: "text", s: "Aug" }] }, { t: "text", s: " 2026)" }] },
    ]);
    expect(parseInline("`*.github.io`, `*.netlify.app`")).toEqual([
      { t: "code", s: "*.github.io" },
      { t: "text", s: ", " },
      { t: "code", s: "*.netlify.app" },
    ]);
    // an emphasis span never opens onto a space, so arithmetic stays text
    expect(parseInline("30 * 10 * 3")).toEqual([{ t: "text", s: "30 * 10 * 3" }]);
    // unterminated markers are text
    expect(parseInline("a ** b `c")).toEqual([{ t: "text", s: "a ** b `c" }]);
    // square brackets without a URL are text (the drafts' "[secondary]" labels)
    expect(inlineText(parseInline("x [secondary] y"))).toBe("x [secondary] y");
  });

  it("a newline inside a paragraph is a line break", () => {
    expect(parseInline("Sincerely,\n`[Name]`")).toEqual([{ t: "text", s: "Sincerely," }, { t: "br" }, { t: "code", s: "[Name]" }]);
  });
});

describe("markdown parser — blocks", () => {
  it("headings carry ids, rules and paragraphs parse, blank lines separate", () => {
    const b = parseMarkdown("# Title here\n\n## Sub *two*\n\n---\n\npara one\nline two\n\npara two");
    expect(outline(b)).toEqual(["h1", "h2", "hr", "para", "para"]);
    expect(b[0]).toMatchObject({ t: "heading", level: 1, id: "title-here" });
    expect(b[1]).toMatchObject({ t: "heading", level: 2, id: "sub-two" });
    expect((b[3] as { c: unknown[] }).c).toEqual([{ t: "text", s: "para one" }, { t: "br" }, { t: "text", s: "line two" }]);
    // non-ASCII headings get a stable counter id
    expect(parseMarkdown("## 一段话说清")[0]).toMatchObject({ id: "sec-1" });
  });

  it("tables: header row, separator, body; pipes inside code stay in the cell; short rows pad", () => {
    const [tbl] = parseMarkdown("| A | B | C |\n|---|---|---|\n| `x|y` | **b** | |\n| 1 | 2 |");
    expect(tbl.t).toBe("table");
    if (tbl.t !== "table") return;
    expect(tbl.head.map(inlineText)).toEqual(["A", "B", "C"]);
    expect(tbl.rows).toHaveLength(2);
    expect(tbl.rows[0].map(inlineText)).toEqual(["x|y", "b", ""]);
    expect(tbl.rows[1].map(inlineText)).toEqual(["1", "2", ""]);
    // a pipe-leading line without a separator is a paragraph, not a table
    expect(outline(parseMarkdown("| not | a table |\nplain"))).toEqual(["para"]);
  });

  it("lists: bullets, numbers with a start, one level of indented nesting, and a change of kind ends the list", () => {
    const b = parseMarkdown("1. one\n2. two\n   - sub a\n   - sub b\n3. three\n- bullet\n- bullet 2\n\n5. five");
    expect(outline(b)).toEqual(["ol(3+)", "ul(2)", "ol(1)"]);
    const ol = b[0];
    if (ol.t !== "list") return;
    expect(ol.start).toBe(1);
    expect(ol.items[1].sub).toMatchObject({ t: "list", ordered: false });
    expect(ol.items[1].sub && ol.items[1].sub.t === "list" ? ol.items[1].sub.items.map((i) => inlineText(i.c)) : []).toEqual(["sub a", "sub b"]);
    expect((b[2] as { start: number }).start).toBe(5);
  });

  it("blockquotes parse recursively, including blank '>' lines and nested lists", () => {
    const b = parseMarkdown("> Subject: x\n>\n> Hello `[name]`,\n>\n> - one\n> - two\n>\n> Thanks,\n> `[me]`");
    expect(outline(b)).toEqual(["quote(para,para,ul(2),para)"]);
    const q = b[0];
    if (q.t !== "quote") return;
    const last = q.c[3];
    expect(last.t === "para" ? inlineText(last.c) : "").toBe("Thanks,\n[me]");
  });

  it("a heading, list, table or quote directly after a paragraph line ends the paragraph", () => {
    expect(outline(parseMarkdown("text\n## h\ntext\n- a\ntext\n> q\ntext\n| a |\n|---|\n| 1 |"))).toEqual([
      "para",
      "h2",
      "para",
      "ul(1)",
      "para",
      "quote(para)",
      "para",
      "table(1x1)",
    ]);
  });
});
