import { useCallback, useState } from "react";
import type { Engine } from "../lib/engine";
import { sampleFrom, softmaxTopK, type TokenProb } from "../lib/prob";
import { useStrings } from "../content/i18n";

interface Bar extends TokenProb {
  label: string;
}

export default function Gamble(props: { engine: Engine }) {
  const t = useStrings();
  const [text, setText] = useState("The cat sat on the");
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
    <div className="widget" id="act-4">
      <div className="widget-head">
        <span className="act-num">{t.act4.num}</span>
        <span className="widget-title">{t.act4.title}</span>
      </div>

      {!ready ? (
        <div className="model-gate">
          <p className="dim">{t.act4.gateIntro}</p>
          {loadError && <p className="load-error">{t.act4.loadError}</p>}
          {loadPct === null ? (
            <button className="btn" onClick={loadModel}>
              {loadError ? t.act4.tryAgain : t.act4.wakeModel}
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
          <div className="gamble-row">
            <input
              className="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
            />
            <button className="btn ghost" disabled={thinking} onClick={() => think(text)}>
              {thinking ? "…" : t.act4.think}
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
                <span className="temp-label">{t.act4.tempCareful}</span>
                <input
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => onTemp(Number(e.target.value))}
                />
                <span className="temp-label">{t.act4.tempChaotic}</span>
                <span className="temp-value">T = {temperature.toFixed(2)}</span>
              </div>

              <div className="roll-row">
                <button className="btn" disabled={thinking} onClick={roll}>
                  {t.act4.roll}
                </button>
                {lastPick && (
                  <span className="dim">
                    {t.act4.picked(JSON.stringify(lastPick).slice(1, -1))}
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
      <p className="widget-note">{t.act4.note()}</p>
    </div>
  );
}
