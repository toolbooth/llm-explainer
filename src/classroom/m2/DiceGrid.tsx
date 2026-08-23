import { diceCells, diceFor, diceGrid } from "./rolls";
import type { MeasuredPrompt } from "./data";

/** A decoded piece as it should print in a dice cell: trimmed, with the two invisible ones made visible. */
export function cellWord(label: string): string {
  if (label === "\n") return "⏎";
  const t = label.trim();
  return t === "" ? "␣" : t;
}

/**
 * The 6 × 6 dice table for one position: rows are the first die, columns
 * the second, and each of the 36 squares names the word that roll
 * produces. Cells are allocated from the measured T = 1 probabilities by
 * largest remainder (rolls.ts); the favourite's block is bold.
 * Used by the printable, the guide's answer key and slide 5.
 */
export default function DiceGrid(props: {
  table: MeasuredPrompt;
  caption: string;
  firstDie: string;
  secondDie: string;
  /** Decoded word the next table assumes (the favourite), named under the grid with `assumedLabel`. */
  assumed?: string | null;
  assumedLabel?: string;
  compact?: boolean;
}) {
  const probs = props.table.t10.map((c) => c.p);
  const { alloc, other } = diceCells(probs);
  const grid = diceGrid(alloc, other);
  const side = 6;
  return (
    <div className={`cl-dice-wrap${props.compact ? " compact" : ""}`}>
      <table className="cl-dice">
        <caption className="cl-dice-cap">{props.caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="corner" aria-label={`${props.firstDie} / ${props.secondDie}`}>
              ⚀
            </th>
            {Array.from({ length: side }, (_, c) => (
              <th scope="col" key={c}>
                {c + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: side }, (_, r) => (
            <tr key={r}>
              <th scope="row">{r + 1}</th>
              {Array.from({ length: side }, (_, c) => {
                const cell = r * side + c;
                const idx = grid[cell];
                const { first, second } = diceFor(cell);
                const cand = idx >= 0 ? props.table.t10[idx] : null;
                const text = cand ? cellWord(cand.label) : "…";
                const fav = idx === 0;
                return (
                  <td key={c} className={`${fav ? "fav" : ""}${idx < 0 ? " other" : ""}`} title={`${first}+${second}`}>
                    {text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!props.compact && (
        <p className="cl-dice-axes">
          {props.firstDie} · {props.secondDie}
          {props.assumed && props.assumedLabel && (
            <>
              {" "}
              · {props.assumedLabel}: <strong>{cellWord(props.assumed)}</strong>
            </>
          )}
        </p>
      )}
    </div>
  );
}
