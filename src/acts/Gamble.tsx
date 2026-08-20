import { useCallback, useState } from "react";
import type { Engine } from "../lib/engine";
import { sampleFrom, softmaxTopK, type TokenProb } from "../lib/prob";
import type { EssayStrings } from "../content/types";

/**
 * The widget's chrome strings — the same shape as essay #1's `act4` table.
 * The flagship passes `useStrings().act4`; a later essay passes its own
 * section table. (This closes the "widget chrome lives in essay #1's tables"
 * seam noted in src/series/README.md.)
 */
export type GambleStrings = EssayStrings["act4"];

interface Bar extends TokenProb {
  label: string;
}

export default function Gamble(props: {
  engine: Engine;
  strings: GambleStrings;
  /** DOM id for deep links — "act-4" in the flagship, a section id elsewhere. */
  htmlId: string;
  initialText?: string;
  /** Optional preset prompts, rendered as one-click chips above the input. */
  presets?: string[];
}) {
  const t = props.strings;
  const [text, setText] = useState(props.initialText ?? "The cat sat on the");
  const [temperature, setTemperature] = useState(1.0);
  const [logits, setLogits] = useState<Float32Array | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loadPct, setLoadPct] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const ready = props.engine.modelReady();

  const refreshBars = useCallback(
    async (lg: Float32Array, temp: number) => {
      const dist = softmaxTopK(lg, 10, temp);
      const labels = await Promise.all(dist.map((d) => props.engine.decode([d.id])));
      setBars(dist.map((d, i) => ({ ...d, label: labels[i] })));
    },
    [props.engine]
  );

  const think = useCallback(
    async (t: string) => {
      setThinking(true);
      try {
        const { logits: lg } = await props.engine.lastLogits(t);
        setLogits(lg);
        await refreshBars(lg, temperature);
      } finally {
        setThinking(false);
      }
    },
    [props.engine, refreshBars, temperature]
  );

  const loadModel = useCallback(async () => {
    setLoadError(false);
    setLoadPct(0);
    try {
      await props.engine.loadModel(setLoadPct);
      await think(text);
    } catch {
      setLoadError(true);
    } finally {
      setLoadPct(null);
    }
  }, [props.engine, text, think]);

  const onTemp = useCallback(
    async (t: number) => {
      setTemperature(t);
      if (logits) await refreshBars(logits, t); // no model re-run — softmax only
    },
    [logits, refreshBars]
  );

  const roll = useCallback(async () => {
    if (!logits) return;
    const dist = softmaxTopK(logits, 10, temperature);
    const pick = sampleFrom(dist, Math.random());
    const picked = await props.engine.decode([pick.id]);
    setLastPick(picked);
    const next = text + picked;
    setText(next);
    await think(next);
  }, [logits, temperature, text, props.engine, think]);

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
                  disabled={thinking}
                  onClick={() => {
                    setText(p);
                    think(p);
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
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
            />
            <button className="btn ghost" disabled={thinking} onClick={() => think(text)}>
              {thinking ? "…" : t.think}
            </button>
          </div>

          {bars.length > 0 && (
            <>
              <div className="bars">
                {bars.map((b) => (
                  <div className="bar-row" key={b.id}>
                    <span className="bar-label">{JSON.stringify(b.label).slice(1, -1)}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.max(1, b.p * 100)}%` }} />
                    </div>
                    <span className="bar-pct">{(b.p * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="temp-row">
                <span className="temp-label">{t.tempCareful}</span>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => onTemp(Number(e.target.value))}
                />
                <span className="temp-label">{t.tempChaotic}</span>
                <span className="temp-value">T = {temperature.toFixed(2)}</span>
              </div>

              <div className="roll-row">
                <button className="btn" disabled={thinking} onClick={roll}>
                  {t.roll}
                </button>
                {lastPick && (
                  <span className="dim">
                    {t.picked(JSON.stringify(lastPick).slice(1, -1))}
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
