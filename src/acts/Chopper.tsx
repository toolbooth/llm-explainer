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

const PALETTE = ["c1", "c2", "c3", "c4", "c5"];

export default function Chopper(props: {
  engine: Engine;
  strings: ChopperStrings;
  /** DOM id for deep links — "act-1" in the flagship, a section id elsewhere. */
  htmlId: string;
  initialText?: string;
}) {
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
      <input
        className="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        maxLength={120}
      />
      <div className="tokens">
        {status === "loading" && !pieces ? (
          <p className="dim">{t.loading}</p>
        ) : (
          pieces?.map((p, i) => (
            <span className={`tok ${PALETTE[i % PALETTE.length]}`} key={i}>
              <span className="tok-text">{displayPiece(p.text)}</span>
              <span className="tok-id">#{p.id}</span>
            </span>
          ))
        )}
      </div>
      {pieces && (
        <p className="widget-note">
          {t.tokenCount(pieces.length)}
          {showsStrawberry && !strawberryWhole && t.choppedNote(rCount)}
          {strawberryWhole && t.wholeTokenNote()}
        </p>
      )}
    </div>
  );
}
