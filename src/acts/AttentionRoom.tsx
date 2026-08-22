import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../lib/engine";
import { getNano, type ForwardResult, type NanoHandle } from "../lib/nanoEngine";
import { diagnoseHeads } from "nano-lm";
import type { EssayStrings } from "../content/types";

/**
 * The widget's chrome strings — the same shape as essay #1's `act3` table.
 * The flagship passes `useStrings().act3`; a later essay passes its own
 * section table. (Lifted for essay #3, which mounts three Rooms on one
 * page — the seam src/series/README.md §2 scheduled for "the first time a
 * second essay needs one".)
 */
export type AttentionRoomStrings = EssayStrings["act3"];

const DEFAULT_TEXT = "Once upon a time there was a little girl";

export default function AttentionRoom(props: {
  engine: Engine;
  strings: AttentionRoomStrings;
  /** DOM id for deep links — "act-3" in the flagship, a section id elsewhere. */
  htmlId: string;
  initialText?: string;
  /** Layer the Room opens on (default 0). */
  initialLayer?: number;
}) {
  const t = props.strings;
  const [text, setText] = useState(props.initialText ?? DEFAULT_TEXT);
  const [pieces, setPieces] = useState<TokenPiece[]>([]);
  const [result, setResult] = useState<ForwardResult | null>(null);
  const [layer, setLayer] = useState(props.initialLayer ?? 0);
  const [head, setHead] = useState(0);
  const [queryIdx, setQueryIdx] = useState<number | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [nanoReady, setNanoReady] = useState(false);
  const nanoRef = useRef<NanoHandle | null>(null);

  // the nano model is tiny (7.5MB) — load automatically, shared across acts
  useEffect(() => {
    getNano(setLoadPct).then((h) => {
      nanoRef.current = h;
      setNanoReady(true);
    });
  }, []);

  const think = useCallback(
    async (t: string) => {
      if (!nanoRef.current) return;
      const p = await props.engine.tokenize(t);
      if (p.length === 0) return;
      setPieces(p);
      setResult(nanoRef.current.forward(p.map((x) => x.id)));
      setQueryIdx(null);
    },
    [props.engine]
  );

  useEffect(() => {
    if (!nanoReady) return;
    const id = setTimeout(() => think(text), 300);
    return () => clearTimeout(id);
  }, [text, nanoReady, think]);

  const diag = useMemo(
    () => (result ? diagnoseHeads(result.attentions, result.seq) : null),
    [result]
  );

  const attn = result?.attentions[layer]?.[head] ?? null;
  const seq = result?.seq ?? 0;

  const cellColor = (v: number) => `rgba(124, 140, 248, ${Math.min(1, v * 1.15)})`;

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>

      {!nanoReady ? (
        <p className="dim">{t.loading(loadPct)}</p>
      ) : (
        <>
          <input
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={140}
          />

          {attn && seq > 0 && (
            <>
              <div className="lens">
                {pieces.map((p, i) => {
                  const w = queryIdx !== null && i <= queryIdx ? attn[queryIdx * seq + i] : 0;
                  return (
                    <button
                      key={i}
                      className={`lens-tok${queryIdx === i ? " q" : ""}`}
                      style={
                        queryIdx !== null && i !== queryIdx
                          ? { background: cellColor(w) }
                          : undefined
                      }
                      onClick={() => setQueryIdx(queryIdx === i ? null : i)}
                      title={
                        queryIdx !== null && i <= queryIdx && i !== queryIdx
                          ? `${(w * 100).toFixed(1)}%`
                          : undefined
                      }
                    >
                      {displayPiece(p.text)}
                    </button>
                  );
                })}
              </div>
              <p className="dim lens-hint">
                {queryIdx === null
                  ? t.lensHintIdle
                  : t.lensHintReading(displayPiece(pieces[queryIdx].text).trim())}
              </p>

              <div className="matrix-wrap">
                <div
                  className="matrix"
                  style={{ gridTemplateColumns: `70px repeat(${seq}, 1fr)` }}
                >
                  <div />
                  {pieces.map((p, k) => (
                    <div key={`c${k}`} className="mx-label mx-col">
                      {displayPiece(p.text).trim() || "␣"}
                    </div>
                  ))}
                  {pieces.map((p, q) => (
                    <MatrixRow
                      key={`r${q}`}
                      q={q}
                      seq={seq}
                      label={displayPiece(p.text).trim() || "␣"}
                      attn={attn}
                      selected={queryIdx === q}
                      cellColor={cellColor}
                      futureMasked={t.futureMasked}
                      onSelect={() => setQueryIdx(queryIdx === q ? null : q)}
                    />
                  ))}
                </div>
              </div>

              <div className="head-controls">
                <label>
                  {t.layerLabel}
                  <input
                    type="range"
                    min={0}
                    max={(result?.attentions.length ?? 1) - 1}
                    value={layer}
                    onChange={(e) => setLayer(Number(e.target.value))}
                  />
                  <span className="temp-value">{layer}</span>
                </label>
                <div className="head-strip">
                  {result?.attentions[layer]?.map((_, h) => (
                    <button
                      key={h}
                      className={`head-btn${head === h ? " active" : ""}`}
                      onClick={() => setHead(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {diag && (
                <div className="diag">
                  <span className="dim">{t.diagIntro}</span>
                  <button
                    className="diag-btn"
                    onClick={() => {
                      setLayer(diag.prevToken.layer);
                      setHead(diag.prevToken.head);
                    }}
                  >
                    {t.diagPrev(
                      diag.prevToken.layer,
                      diag.prevToken.head,
                      (diag.prevToken.score * 100).toFixed(0)
                    )}
                  </button>
                  <button
                    className="diag-btn"
                    onClick={() => {
                      setLayer(diag.firstToken.layer);
                      setHead(diag.firstToken.head);
                    }}
                  >
                    {t.diagAnchor(
                      diag.firstToken.layer,
                      diag.firstToken.head,
                      (diag.firstToken.score * 100).toFixed(0)
                    )}
                  </button>
                  <button
                    className="diag-btn"
                    onClick={() => {
                      setLayer(diag.diffuse.layer);
                      setHead(diag.diffuse.head);
                    }}
                  >
                    {t.diagDiffuse(diag.diffuse.layer, diag.diffuse.head)}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}

function MatrixRow(props: {
  q: number;
  seq: number;
  label: string;
  attn: Float32Array;
  selected: boolean;
  cellColor: (v: number) => string;
  futureMasked: string;
  onSelect: () => void;
}) {
  const { q, seq, attn } = props;
  const cells = [];
  for (let k = 0; k < seq; k++) {
    const v = k <= q ? attn[q * seq + k] : 0;
    cells.push(
      <div
        key={k}
        className={`mx-cell${k > q ? " future" : ""}`}
        style={k <= q ? { background: props.cellColor(v) } : undefined}
        title={k <= q ? `${(v * 100).toFixed(1)}%` : props.futureMasked}
      />
    );
  }
  return (
    <>
      <button className={`mx-label mx-row${props.selected ? " sel" : ""}`} onClick={props.onSelect}>
        {props.label}
      </button>
      {cells}
    </>
  );
}
