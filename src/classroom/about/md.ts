/**
 * A small Markdown parser for the shared front matter — no runtime
 * dependency, no HTML pass-through, no surprises. The seven documents under
 * ./content are the source text (PRODUCT.md §5: "all three formats are
 * generated from the same source text"); this module turns them into a
 * plain block tree that Markdown.tsx renders as real elements (headings,
 * paragraphs, lists, blockquotes, horizontal rules, and <table>s with a
 * <thead>).
 *
 * Supported, because the drafts use it: `#`–`####` headings; paragraphs
 * (a single newline inside a paragraph is a line break — the letter
 * skeleton and the unblock template rely on it); `-`/`*` bullets and `1.`
 * numbered items with one level of indented nesting; `>` blockquotes
 * (recursively parsed); pipe tables with a `|---|` separator row; `---`
 * rules; inline `**strong**`, `*em*`, `` `code` `` and `[text](url)`.
 * Anything else is text. test/markdown.test.ts pins the behaviour.
 */

export type Inline =
  | { t: "text"; s: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; s: string }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "br" };

export interface ListItem {
  c: Inline[];
  /** A nested list, when the item is followed by indented items. */
  sub?: Block;
}

export type Block =
  | { t: "heading"; level: 1 | 2 | 3 | 4; c: Inline[]; id: string }
  | { t: "para"; c: Inline[] }
  | { t: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { t: "quote"; c: Block[] }
  | { t: "table"; head: Inline[][]; rows: Inline[][][] }
  | { t: "hr" };

// ── Inline ──────────────────────────────────────────────────────────────────

const LINK_RE = /^\[([^\]\n]+)\]\(([^)\s]+)\)/;

/** Index of the closing `mark` at or after `from`, skipping code spans; -1 if none. */
function findClose(s: string, mark: string, from: number): number {
  let i = from;
  while (i < s.length) {
    if (s[i] === "`") {
      const j = s.indexOf("`", i + 1);
      if (j < 0) return -1;
      i = j + 1;
      continue;
    }
    if (mark === "*" && s.startsWith("**", i)) {
      // a strong span inside an emphasis span: skip over it whole
      const j = findClose(s, "**", i + 2);
      if (j < 0) return -1;
      i = j + 2;
      continue;
    }
    if (s.startsWith(mark, i)) return i;
    i++;
  }
  return -1;
}

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) out.push({ t: "text", s: buf });
    buf = "";
  };
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "`") {
      const j = s.indexOf("`", i + 1);
      if (j > i + 1) {
        flush();
        out.push({ t: "code", s: s.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    } else if (s.startsWith("**", i)) {
      const j = findClose(s, "**", i + 2);
      if (j > i + 2) {
        flush();
        out.push({ t: "strong", c: parseInline(s.slice(i + 2, j)) });
        i = j + 2;
        continue;
      }
    } else if (ch === "*") {
      const j = findClose(s, "*", i + 1);
      // an emphasis span must be non-empty and must not open onto a space ("a * b * c")
      if (j > i + 1 && s[i + 1] !== " " && s[j - 1] !== " ") {
        flush();
        out.push({ t: "em", c: parseInline(s.slice(i + 1, j)) });
        i = j + 1;
        continue;
      }
    } else if (ch === "[") {
      const m = LINK_RE.exec(s.slice(i));
      if (m) {
        flush();
        out.push({ t: "link", href: m[2], c: parseInline(m[1]) });
        i += m[0].length;
        continue;
      }
    } else if (ch === "\n") {
      flush();
      out.push({ t: "br" });
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** The plain text of an inline run (for heading ids, titles and tests). */
export function inlineText(c: Inline[]): string {
  return c
    .map((n) => {
      switch (n.t) {
        case "text":
        case "code":
          return n.s;
        case "br":
          return "\n";
        default:
          return inlineText(n.c);
      }
    })
    .join("");
}

// ── Blocks ──────────────────────────────────────────────────────────────────

const HEADING_RE = /^(#{1,4})\s+(.+?)\s*#*\s*$/;
const HR_RE = /^(?:-{3,}|\*{3,})\s*$/;
const LIST_RE = /^(\s*)(?:([-*])|(\d+)\.)\s+(.*)$/;
const TABLE_SEP_RE = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  let inCode = false;
  for (const ch of s) {
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function slugify(text: string, n: number): string {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii ? ascii : `sec-${n}`;
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let headings = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = HEADING_RE.exec(line))) {
      const c = parseInline(m[2]);
      blocks.push({ t: "heading", level: m[1].length as 1 | 2 | 3 | 4, c, id: slugify(inlineText(c), ++headings) });
      i++;
      continue;
    }
    if (HR_RE.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const head = splitRow(line).map(parseInline);
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const cells = splitRow(lines[i]).map(parseInline);
        while (cells.length < head.length) cells.push([]);
        rows.push(cells.slice(0, head.length));
        i++;
      }
      blocks.push({ t: "table", head, rows });
      continue;
    }
    if (line.startsWith(">")) {
      const inner: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        inner.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ t: "quote", c: parseMarkdown(inner.join("\n")) });
      continue;
    }
    if ((m = LIST_RE.exec(line)) && m[1].length === 0) {
      const ordered = m[3] !== undefined;
      const start = ordered ? Number(m[3]) : 1;
      const items: ListItem[] = [];
      while (i < lines.length) {
        const lm = LIST_RE.exec(lines[i]);
        if (!lm) break;
        const indent = lm[1].length;
        if (indent === 0) {
          const isOrdered = lm[3] !== undefined;
          if (isOrdered !== ordered) break;
          items.push({ c: parseInline(lm[4]) });
          i++;
        } else {
          // indented items nest under the previous top-level item
          const parent = items[items.length - 1];
          if (!parent) break;
          const subItems: ListItem[] = [];
          const subOrdered = lm[3] !== undefined;
          const subStart = subOrdered ? Number(lm[3]) : 1;
          while (i < lines.length) {
            const sm = LIST_RE.exec(lines[i]);
            if (!sm || sm[1].length === 0) break;
            subItems.push({ c: parseInline(sm[4]) });
            i++;
          }
          parent.sub = { t: "list", ordered: subOrdered, start: subStart, items: subItems };
        }
      }
      blocks.push({ t: "list", ordered, start, items });
      continue;
    }
    // paragraph: consecutive plain lines
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (
        l.trim() === "" ||
        HEADING_RE.test(l) ||
        HR_RE.test(l) ||
        l.startsWith(">") ||
        (LIST_RE.exec(l)?.[1].length === 0 && LIST_RE.test(l)) ||
        (l.trimStart().startsWith("|") && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1]))
      )
        break;
      para.push(l);
      i++;
    }
    if (para.length === 0) {
      // a line the rules above recognise but the loop did not consume (defensive)
      para.push(line);
      i++;
    }
    blocks.push({ t: "para", c: parseInline(para.join("\n")) });
  }
  return blocks;
}

/** Structural outline of a document, for parity checks between locales. */
export function outline(blocks: Block[]): string[] {
  return blocks.map((b) => {
    switch (b.t) {
      case "heading":
        return `h${b.level}`;
      case "table":
        return `table(${b.head.length}x${b.rows.length})`;
      case "list":
        return `${b.ordered ? "ol" : "ul"}(${b.items.length}${b.items.some((it) => it.sub) ? "+" : ""})`;
      case "quote":
        return `quote(${outline(b.c).join(",")})`;
      default:
        return b.t;
    }
  });
}
