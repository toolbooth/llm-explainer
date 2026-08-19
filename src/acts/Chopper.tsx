import { useEffect, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../lib/engine";
import { useStrings } from "../content/i18n";

const PALETTE = ["c1", "c2", "c3", "c4", "c5"];

export default function Chopper(props: { engine: Engine }) {
  const t = useStrings();
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
        <span className="act-num">{t.act1.num}</span>
        <span className="widget-title">{t.act1.title}</span>
      </div>
      <input
        className="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.act1.placeholder}
        maxLength={120}
      />
      <div className="tokens">
        {status === "loading" && !pieces ? (
          <p className="dim">{t.act1.loading}</p>
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
          {t.act1.tokenCount(pieces.length)}
          {showsStrawberry && !strawberryWhole && t.act1.choppedNote(rCount)}
          {strawberryWhole && t.act1.wholeTokenNote()}
        </p>
      )}
    </div>
  );
}
