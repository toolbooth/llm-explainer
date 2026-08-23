import { useEffect, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../lib/engine";
import type { EssayStrings } from "../content/types";

/**
 * The widget's chrome strings — the same shape as essay #1's `act1` table.
 * The flagship passes `useStrings().act1`; a later essay passes its own
 * section table. (Closes the Chopper half of the "widget chrome lives in
 * essay #1's tables" seam noted in src/series/README.md; WordMap remains.)
 */
export type ChopperStrings = EssayStrings["act1"];

/**
 * Accessible names the Classroom Edition passes (PRODUCT.md §6.3): the
 * piece row becomes a named list whose items read as "piece 2, 'raw', id
 * 1831", the count note becomes a polite live region, and the preset chips
 * expose their pressed state. Absent → no attribute is added, so the
 * flagship's DOM is byte-identical (HASHES.md).
 */
export interface ChopperA11y {
  /** Name of the piece list, e.g. "Pieces the model sees". */
  pieces: string;
  /** One item's name: 1-based index, the piece's text, its id. */
  pieceItem: (n: number, text: string, id: number) => string;
}

const PALETTE = ["c1", "c2", "c3", "c4", "c5"];

/** Preset chips show their leading/inner spaces as ␣ — the space IS the lesson. */
function presetLabel(p: string): string {
  return p.replace(/ /g, "␣");
}

export default function Chopper(props: {
  engine: Engine;
  strings: ChopperStrings;
  /** DOM id for deep links — "act-1" in the flagship, a section id elsewhere. */
  htmlId: string;
  initialText?: string;
  /**
   * Optional preset inputs, rendered as one-click chips above the field (the
   * Gamble's `presets` seam, lifted here by the Classroom Edition's M1).
   * Absent → no chips, no DOM change.
   */
  presets?: string[];
  /** Optional accessible name for the text field (absent → no attribute). */
  inputLabel?: string;
  /** Optional accessibility chrome (classroom pages); absent → DOM unchanged. */
  a11y?: ChopperA11y;
}) {
  const a = props.a11y;
  const t = props.strings;
  const [text, setText] = useState(props.initialText ?? "strawberry smoothie, please");
  const [pieces, setPieces] = useState<TokenPiece[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let stale = false;
    props.engine
      .tokenize(text)
      .then((p) => {
        if (!stale) {
          setPieces(p);
          setStatus("ready");
        }
      })
      .catch(() => setStatus("loading"));
    return () => {
      stale = true;
    };
  }, [text, props.engine]);

  const rCount = (text.match(/r/gi) ?? []).length;
  const showsStrawberry = /strawberry/i.test(text);
  const strawberryWhole =
    showsStrawberry &&
    (pieces ?? []).some((p) => displayPiece(p.text).trim().toLowerCase() === "strawberry");

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>
      {props.presets && props.presets.length > 0 && (
        <div className="preset-row">
          {props.presets.map((p) => (
            <button
              key={p}
              type="button"
              className={`preset-btn${text === p ? " active" : ""}`}
              aria-pressed={a ? text === p : undefined}
              onClick={() => setText(p)}
            >
              {presetLabel(p)}
            </button>
          ))}
        </div>
      )}
      <input
        className="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        maxLength={120}
        aria-label={props.inputLabel}
      />
      <div className="tokens" role={a ? "list" : undefined} aria-label={a?.pieces}>
        {status === "loading" && !pieces ? (
          <p className="dim">{t.loading}</p>
        ) : (
          pieces?.map((p, i) => (
            <span
              className={`tok ${PALETTE[i % PALETTE.length]}`}
              key={i}
              role={a ? "listitem" : undefined}
              aria-label={a ? a.pieceItem(i + 1, displayPiece(p.text), p.id) : undefined}
            >
              <span className="tok-text">{displayPiece(p.text)}</span>
              <span className="tok-id">#{p.id}</span>
            </span>
          ))
        )}
      </div>
      {pieces && (
        <p className="widget-note" aria-live={a ? "polite" : undefined}>
          {t.tokenCount(pieces.length)}
          {showsStrawberry && !strawberryWhole && t.choppedNote(rCount)}
          {strawberryWhole && t.wholeTokenNote()}
        </p>
      )}
    </div>
  );
}
