import { Fragment, type ReactNode } from "react";
import TableWrap from "../TableWrap";
import { inlineText, type Block, type Inline } from "./md";

/**
 * Renders the block tree from markdown.ts as plain elements under the
 * classroom's `.prose` styles. Tables are real <table>s with a <thead> of
 * scoped column headers, wrapped in `.cl-table-wrap` so a wide crosswalk
 * scrolls inside its own box instead of the page; tables with many columns
 * get `dense` (smaller type, a minimum width) so eleven columns stay
 * readable on a phone and print on one landscape sheet.
 *
 * Language: a 中文 page quotes its primary sources in English (policy
 * citations, standards IDs, the letter kit's body). WCAG 3.1.2 asks each
 * passage in another language to say so, so on a `zh` page every block —
 * paragraph, list item, quote, table cell — whose text carries no CJK
 * character and at least a few Latin letters is marked `lang="en"`; an EN
 * page gets the mirror rule for blocks that are entirely CJK. Pure
 * heuristic (`blockLang`), pinned in test/markdown.test.ts.
 */

/** Columns at or above this count render dense. */
export const DENSE_COLUMNS = 6;

const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/;
const LATIN = /[A-Za-z]/g;

/**
 * The `lang` attribute a block needs, or undefined when it is in the
 * page's own language. `pageLang` is the language of the surrounding
 * page ("en" | "zh"); `text` is the block's plain text.
 */
export function blockLang(text: string, pageLang: string): "en" | "zh" | undefined {
  const cjk = CJK.test(text);
  const latin = (text.match(LATIN) ?? []).length;
  if (pageLang === "zh") return !cjk && latin >= 3 ? "en" : undefined;
  if (pageLang === "en") return cjk && latin === 0 ? "zh" : undefined;
  return undefined;
}

export function renderInline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text":
        return <Fragment key={i}>{n.s}</Fragment>;
      case "strong":
        return <strong key={i}>{renderInline(n.c)}</strong>;
      case "em":
        return <em key={i}>{renderInline(n.c)}</em>;
      case "code":
        return <code key={i}>{n.s}</code>;
      case "link":
        return (
          <a key={i} href={n.href}>
            {renderInline(n.c)}
          </a>
        );
      case "br":
        return <br key={i} />;
    }
  });
}

function Heading({ b }: { b: Extract<Block, { t: "heading" }> }) {
  const inner = renderInline(b.c);
  switch (b.level) {
    case 1:
      return <h1 id={b.id}>{inner}</h1>;
    case 2:
      return <h2 id={b.id}>{inner}</h2>;
    case 3:
      return <h3 id={b.id}>{inner}</h3>;
    default:
      return <h4 id={b.id}>{inner}</h4>;
  }
}

function ListBlock({ b, lang }: { b: Extract<Block, { t: "list" }>; lang: string }) {
  const items = b.items.map((it, i) => (
    <li key={i} lang={blockLang(inlineText(it.c), lang)}>
      {renderInline(it.c)}
      {it.sub && <ListBlock b={it.sub as Extract<Block, { t: "list" }>} lang={lang} />}
    </li>
  ));
  return b.ordered ? (
    <ol className="cl-questions" start={b.start === 1 ? undefined : b.start}>
      {items}
    </ol>
  ) : (
    <ul className="cl-list">{items}</ul>
  );
}

function Table({ b, lang, regionLabel }: { b: Extract<Block, { t: "table" }>; lang: string; regionLabel: string }) {
  const dense = b.head.length >= DENSE_COLUMNS;
  return (
    <TableWrap label={regionLabel}>
      <table className={`cl-table cl-md-table${dense ? " dense" : ""}`}>
        <thead>
          <tr>
            {b.head.map((cell, i) => (
              <th scope="col" key={i} lang={blockLang(inlineText(cell), lang)}>
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} lang={blockLang(inlineText(cell), lang)}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

/** Plain text of a block tree, for the language heuristic on quotes. */
function blocksText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.t) {
        case "heading":
        case "para":
          return inlineText(b.c);
        case "list":
          return b.items.map((it) => inlineText(it.c)).join(" ");
        case "quote":
          return blocksText(b.c);
        case "table":
          return [...b.head, ...b.rows.flat()].map(inlineText).join(" ");
        case "hr":
          return "";
      }
    })
    .join(" ");
}

export default function Markdown({
  blocks,
  lang = "en",
  regionLabel = "Table",
}: {
  blocks: Block[];
  /** The surrounding page's language, for the per-block `lang` heuristic. */
  lang?: string;
  /** Accessible name of the scrolling box around each table. */
  regionLabel?: string;
}) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "heading":
            return <Heading key={i} b={b} />;
          case "para":
            return (
              <p key={i} lang={blockLang(inlineText(b.c), lang)}>
                {renderInline(b.c)}
              </p>
            );
          case "list":
            return <ListBlock key={i} b={b} lang={lang} />;
          case "quote": {
            // a quote in the other language is marked as a whole; otherwise its blocks decide one by one
            const ql = blockLang(blocksText(b.c), lang);
            return (
              <blockquote key={i} lang={ql}>
                <Markdown blocks={b.c} lang={ql ?? lang} regionLabel={regionLabel} />
              </blockquote>
            );
          }
          case "table":
            return <Table key={i} b={b} lang={lang} regionLabel={regionLabel} />;
          case "hr":
            return <hr key={i} />;
        }
      })}
    </>
  );
}
