import { Fragment, type ReactNode } from "react";
import type { Block, Inline } from "./md";

/**
 * Renders the block tree from markdown.ts as plain elements under the
 * classroom's `.prose` styles. Tables are real <table>s with a <thead> of
 * scoped column headers, wrapped in `.cl-table-wrap` so a wide crosswalk
 * scrolls inside its own box instead of the page; tables with many columns
 * get `dense` (smaller type, a minimum width) so eleven columns stay
 * readable on a phone and print on one landscape sheet.
 */

/** Columns at or above this count render dense. */
export const DENSE_COLUMNS = 6;

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

function ListBlock({ b }: { b: Extract<Block, { t: "list" }> }) {
  const items = b.items.map((it, i) => (
    <li key={i}>
      {renderInline(it.c)}
      {it.sub && <ListBlock b={it.sub as Extract<Block, { t: "list" }>} />}
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

function Table({ b }: { b: Extract<Block, { t: "table" }> }) {
  const dense = b.head.length >= DENSE_COLUMNS;
  return (
    <div className="cl-table-wrap">
      <table className={`cl-table cl-md-table${dense ? " dense" : ""}`}>
        <thead>
          <tr>
            {b.head.map((cell, i) => (
              <th scope="col" key={i}>
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Markdown({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "heading":
            return <Heading key={i} b={b} />;
          case "para":
            return <p key={i}>{renderInline(b.c)}</p>;
          case "list":
            return <ListBlock key={i} b={b} />;
          case "quote":
            return (
              <blockquote key={i}>
                <Markdown blocks={b.c} />
              </blockquote>
            );
          case "table":
            return <Table key={i} b={b} />;
          case "hr":
            return <hr key={i} />;
        }
      })}
    </>
  );
}
