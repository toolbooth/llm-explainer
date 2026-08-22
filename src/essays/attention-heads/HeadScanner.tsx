import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../../lib/engine";
import { getNano, type ForwardResult, type NanoHandle } from "../../lib/nanoEngine";
import {
  FOCUSED,
  SPECIES_ORDER,
  countBySpecies,
  groupBySpecies,
  scanHeads,
  type HeadReport,
} from "./scanner";
import type { HeadScannerStrings } from "./content/types";

/**
 * HeadScanner — essay #3's single new widget (§2, "The Census").
 *
 * One forward pass of the nano model over the reader's sentence, then
 * scanner.ts scores all layers × heads against four positional templates
 * plus an evenness test. The population is laid out as a grouped gallery of
 * thumbnails (one tiny canvas per head), each with its evidence score; a
 * click shows the five numbers behind a head's label. No new model surface,
 * no new dependency — the essay copy carries the caveat that these are
 * field marks from attention statistics, not claims about function.
 */

export default function HeadScanner(props: {
  engine: Engine;
  strings: HeadScannerStrings;
  /** DOM id for deep links (e.g. "sec-2"). */
  htmlId: string;
  initialText: string;
}) {
  const t = props.strings;
  const [text, setText] = useState(props.initialText);
  const [pieces, setPieces] = useState<TokenPiece[]>([]);
  const [result, setResult] = useState<ForwardResult | null>(null);
  const [selected, setSelected] = useState<{ layer: number; head: number } | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [nanoReady, setNanoReady] = useState(false);
  const nanoRef = useRef<NanoHandle | null>(null);

  // the nano model is tiny (7.5MB) — load automatically, shared across sections
  useEffect(() => {
    getNano(setLoadPct).then((h) => {
      nanoRef.current = h;
      setNanoReady(true);
    });
  }, []);

  const think = useCallback(
    async (s: string) => {
      if (!nanoRef.current) return;
      const p = await props.engine.tokenize(s);
      if (p.length === 0) return;
      setPieces(p);
      setResult(nanoRef.current.forward(p.map((x) => x.id)));
      setSelected(null);
    },
    [props.engine]
  );

  useEffect(() => {
    if (!nanoReady) return;
    const id = setTimeout(() => think(text), 300);
    return () => clearTimeout(id);
  }, [text, nanoReady, think]);

  const reports = useMemo(() => (result ? scanHeads(result.attentions, result.seq) : null), [result]);
  const groups = useMemo(() => (reports ? groupBySpecies(reports) : null), [reports]);
  const counts = useMemo(() => (reports ? countBySpecies(reports) : null), [reports]);
  const seq = result?.seq ?? 0;

  const sel =
    selected && reports
      ? reports.find((r) => r.layer === selected.layer && r.head === selected.head) ?? null
      : null;

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

          {result && !reports && <p className="dim hs-short">{t.tooShort}</p>}

          {result && reports && groups && counts && (
            <>
              <div className="hs-tokens">
                {pieces.map((p, i) => (
                  <span key={i} className="hs-tok">
                    {displayPiece(p.text).trim() || "␣"}
                  </span>
                ))}
              </div>
              <p className="hs-summary">{t.summary(counts, reports.length)}</p>

              {SPECIES_ORDER.map((s) => (
                <div className="hs-group" key={s}>
                  <div className="hs-group-head">
                    <span className="hs-species">{t.species[s].name}</span>
                    <span className="hs-count">{t.count(groups[s].length)}</span>
                    <span className="hs-blurb">{t.species[s].blurb}</span>
                  </div>
                  {groups[s].length === 0 ? (
                    <p className="hs-empty">{t.none}</p>
                  ) : (
                    <div className="hs-gallery">
                      {groups[s].map((r) => (
                        <button
                          key={`${r.layer}-${r.head}`}
                          className={`hs-head${
                            sel && sel.layer === r.layer && sel.head === r.head ? " active" : ""
                          }`}
                          onClick={() =>
                            setSelected(
                              sel && sel.layer === r.layer && sel.head === r.head
                                ? null
                                : { layer: r.layer, head: r.head }
                            )
                          }
                          title={evidenceText(t, r)}
                        >
                          <HeadThumb attn={result.attentions[r.layer][r.head]} seq={seq} className="hs-thumb" />
                          <span>
                            L{r.layer}H{r.head}
                          </span>
                          <span className="hs-ev">{evidenceText(t, r)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {sel && (
                <div className="hs-detail">
                  <HeadThumb
                    attn={result.attentions[sel.layer][sel.head]}
                    seq={seq}
                    className="hs-detail-thumb"
                  />
                  <div>
                    <h4>{t.detailHeading(sel.layer, sel.head, t.species[sel.species].name)}</h4>
                    {FOCUSED.map((tpl) => (
                      <div className={`hs-score${sel.species === tpl ? " win" : ""}`} key={tpl}>
                        <span>{t.species[tpl].name}</span>
                        <span className="hs-score-track">
                          <span
                            className="hs-score-fill"
                            style={{ width: `${Math.min(100, (sel.scores[tpl].lift / 4) * 100)}%` }}
                          />
                        </span>
                        <span className="hs-score-val">
                          {t.scoreValue(
                            sel.scores[tpl].lift.toFixed(2),
                            (sel.scores[tpl].share * 100).toFixed(0)
                          )}
                        </span>
                      </div>
                    ))}
                    <div className={`hs-score${sel.species === "wash" ? " win" : ""}`}>
                      <span>{t.entropyLabel}</span>
                      <span className="hs-score-track">
                        <span className="hs-score-fill" style={{ width: `${sel.entropy * 100}%` }} />
                      </span>
                      <span className="hs-score-val">{t.entropyValue((sel.entropy * 100).toFixed(0))}</span>
                    </div>
                    <p className="dim hs-threshold">{t.thresholdNote}</p>
                  </div>
                </div>
              )}

              <p className="legend">
                <span className="dim">{t.thumbHint}</span>
              </p>
            </>
          )}
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}

function evidenceText(t: HeadScannerStrings, r: HeadReport): string {
  if (r.species === "wash") return t.evidenceWash((r.entropy * 100).toFixed(0));
  if (r.species === "unlabeled") return t.closest(t.species[r.closest].name, r.evidence.toFixed(1));
  return t.evidenceLift(r.evidence.toFixed(1));
}

/**
 * One head's matrix as a seq×seq canvas scaled up by CSS (pixelated). Cells
 * are shaded by LIFT over an even spread — attn × (q+1), full intensity at
 * 3× — so a wash reads as a flat tint and a stripe reads as a stripe, which
 * the absolute shading of the Attention Room can't show at this model's
 * low per-cell weights. Future (masked) cells stay background-dark.
 */
function HeadThumb(props: { attn: Float32Array; seq: number; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { attn, seq } = props;
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const img = ctx.createImageData(seq, seq);
    const d = img.data;
    for (let q = 0; q < seq; q++) {
      for (let k = 0; k < seq; k++) {
        const i = (q * seq + k) * 4;
        const a = k > q ? 0 : Math.min(1, (attn[q * seq + k] * (q + 1)) / 3);
        d[i] = Math.round(12 + (124 - 12) * a);
        d[i + 1] = Math.round(15 + (140 - 15) * a);
        d[i + 2] = Math.round(24 + (248 - 24) * a);
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [attn, seq]);
  return <canvas ref={ref} width={seq} height={seq} className={props.className} />;
}
