import { useCallback, useState, useSyncExternalStore } from "react";
import type { Engine } from "../../lib/engine";
import { sampleFrom, softmaxTopK } from "../../lib/prob";
import { agreementGrid, agreeClass, meanAgreement } from "./agreement";
import type { ReRollStrings } from "./content/types";

/**
 * ReRoll — essay #2's single new widget (§3, "The Re-Roll Test").
 *
 * Samples the same prompt k times at one fixed temperature through the
 * existing engine (k× lastLogits + sampleFrom loops — no new model surface),
 * then aligns the k continuations token-by-position and colors each token by
 * how many rolls agree on it. Stable spans read like memory; scatter reads
 * like dice. The essay copy carries the caveat: a probe, not a proof.
 */

const K = 5;
const MAX_NEW_TOKENS = 12;
const TEMPERATURE = 0.8;
const TOP_K = 10;

export default function ReRoll(props: {
  engine: Engine;
  strings: ReRollStrings;
  /** DOM id for deep links (e.g. "sec-3"). */
  htmlId: string;
  initialText: string;
  /** Optional preset prompts, rendered as one-click chips above the input. */
  presets?: string[];
}) {
  const t = props.strings;
  const [text, setText] = useState(props.initialText);
  const [promptUsed, setPromptUsed] = useState(props.initialText);
  const [samples, setSamples] = useState<string[][]>([]);
  const [done, setDone] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [loadPct, setLoadPct] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);

  const ready = useSyncExternalStore(props.engine.subscribe, props.engine.modelReady);

  const rollAll = useCallback(
    async (prompt: string) => {
      setRolling(true);
      setDone(false);
      setPromptUsed(prompt);
      setSamples([]);
      try {
        const acc: string[][] = [];
        for (let s = 0; s < K; s++) {
          acc.push([]);
          let cur = prompt;
          for (let i = 0; i < MAX_NEW_TOKENS; i++) {
            const { logits } = await props.engine.lastLogits(cur);
            const dist = softmaxTopK(logits, TOP_K, TEMPERATURE);
            const pick = sampleFrom(dist, Math.random());
            const piece = await props.engine.decodeModel([pick.id]);
            if (!piece || piece.includes("\n")) break;
            acc[s].push(piece);
            cur += piece;
            setSamples(acc.map((row) => [...row]));
          }
        }
        setDone(true);
      } finally {
        setRolling(false);
      }
    },
    [props.engine]
  );

  const loadModel = useCallback(async () => {
    setLoadError(false);
    setLoadPct(0);
    try {
      await props.engine.loadModel(setLoadPct);
      await rollAll(text);
    } catch {
      setLoadError(true);
    } finally {
      setLoadPct(null);
    }
  }, [props.engine, text, rollAll]);

  const grid = agreementGrid(samples);

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>

      {!ready ? (
        <div className="model-gate">
          <p className="dim">{t.gateIntro}</p>
          {loadError && <p className="load-error">{t.loadError}</p>}
          {loadPct === null ? (
            <button className="btn" onClick={loadModel}>
              {loadError ? t.tryAgain : t.wakeModel}
            </button>
          ) : (
            <div className="progress">
              <div className="progress-fill" style={{ width: `${loadPct}%` }} />
              <span className="progress-label">{loadPct}%</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {props.presets && props.presets.length > 0 && (
            <div className="preset-row">
              {props.presets.map((p) => (
                <button
                  key={p}
                  className={`preset-btn${text === p ? " active" : ""}`}
                  disabled={rolling}
                  onClick={() => {
                    setText(p);
                    rollAll(p);
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="gamble-row">
            <input
              className="text-input"
              value={text}
              disabled={rolling}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
            />
            <button className="btn" disabled={rolling} onClick={() => rollAll(text)}>
              {rolling ? "…" : t.roll}
            </button>
          </div>
          <p className="dim rr-temp">{t.tempNote}</p>

          {grid.length > 0 && (
            <div className="rr-samples">
              {grid.map((row, r) => (
                <div className="rr-row" key={r}>
                  <span className="rr-k">{r + 1}</span>
                  <span className="rr-prompt">{promptUsed}</span>
                  {row.map((tok, i) => (
                    <span key={i} className={`rr-tok ${agreeClass(tok.agree)}`}>
                      {tok.text}
                    </span>
                  ))}
                  {rolling && r === grid.length - 1 && <span className="cursor-blink">▋</span>}
                </div>
              ))}
            </div>
          )}

          {rolling && <p className="dim rr-status">{t.rolling(samples.length, K)}</p>}
          {done && grid.length === K && (
            <p className="rr-verdict">{t.agreement(Math.round(meanAgreement(grid) * 100))}</p>
          )}

          <p className="legend">
            <span className="rr-tok agree-high demo">{t.legendStable}</span>
            <span className="rr-tok agree-mid demo">{t.legendMixed}</span>
            <span className="rr-tok agree-low demo">{t.legendScatter}</span>
            <span className="dim">{t.legendHint}</span>
          </p>
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
