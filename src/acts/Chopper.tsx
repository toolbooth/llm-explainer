import { useEffect, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../lib/engine";

const PALETTE = ["c1", "c2", "c3", "c4", "c5"];

export default function Chopper(props: { engine: Engine }) {
  const [text, setText] = useState("strawberry smoothie, please");
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
    <div className="widget" id="act-1">
      <div className="widget-head">
        <span className="act-num">Act 1</span>
        <span className="widget-title">The Chopper — try your own words</span>
      </div>
      <input
        className="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type anything…"
        maxLength={120}
      />
      <div className="tokens">
        {status === "loading" && !pieces ? (
          <p className="dim">Loading the tokenizer (~2MB, once)…</p>
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
          {pieces.length} token{pieces.length === 1 ? "" : "s"}.
          {showsStrawberry && !strawberryWhole && (
            <>
              {" "}
              Notice: <em>strawberry</em> got chopped — the model never sees the word, only the
              chunks. Your text has {rCount} “r”s, but the model can't count letters it never
              sees. That's why LLMs famously fail that question.
            </>
          )}
          {strawberryWhole && (
            <>
              {" "}
              Fun fact: here <em>“ strawberry”</em> (with its leading space) is common enough to
              earn a single token of its own. Now delete everything before it so it starts the
              text — same word, and watch it shatter into <code>st · raw · berry</code>.
              Tokenization even depends on <em>where</em> a word sits.
            </>
          )}
        </p>
      )}
    </div>
  );
}
