import { useCallback, useEffect, useRef, useState } from "react";
import { type Engine } from "../lib/engine";
import { getNano, type NanoHandle } from "../lib/nanoEngine";
import { sampleFrom, softmaxTopK } from "../lib/prob";

interface Step {
  text: string;
  p: number;
  alts: { label: string; p: number; picked: boolean }[];
}

const MAX_TOKENS = 30;

export default function TheLoop(props: { engine: Engine }) {
  const [prompt, setPrompt] = useState("Once upon a time");
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [temperature, setTemperature] = useState(0.8);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const nanoRef = useRef<NanoHandle | null>(null);
  const idsRef = useRef<number[]>([]);
  const stopRef = useRef(false);

  useEffect(() => {
    getNano(setLoadPct).then((h) => {
      nanoRef.current = h;
      setReady(true);
    });
  }, []);

  const reset = useCallback(async () => {
    stopRef.current = true;
    setRunning(false);
    setSteps([]);
    idsRef.current = [];
  }, []);

  const oneStep = useCallback(async (): Promise<boolean> => {
    const nano = nanoRef.current;
    if (!nano) return false;
    if (idsRef.current.length === 0) {
      const pieces = await props.engine.tokenize(prompt.trim() || "Once upon a time");
      idsRef.current = pieces.map((p) => p.id);
    }
    const { logits } = nano.forward(idsRef.current);
    const dist = softmaxTopK(logits, 8, temperature);
    const pick = sampleFrom(dist, Math.random());
    const labels = await Promise.all(dist.map((d) => props.engine.decode([d.id])));
    const text = await props.engine.decode([pick.id]);
    idsRef.current = [...idsRef.current, pick.id];
    setSteps((s) => [
      ...s,
      {
        text,
        p: pick.p,
        alts: dist.map((d, i) => ({ label: labels[i], p: d.p, picked: d.id === pick.id })),
      },
    ]);
    return idsRef.current.length < 2048;
  }, [props.engine, prompt, temperature]);

  const write = useCallback(async () => {
    if (running) {
      stopRef.current = true;
      return;
    }
    stopRef.current = false;
    setRunning(true);
    for (let i = steps.length; i < MAX_TOKENS; i++) {
      if (stopRef.current) break;
      const ok = await oneStep();
      if (!ok) break;
      await new Promise((r) => setTimeout(r, 110));
    }
    setRunning(false);
  }, [running, steps.length, oneStep]);

  const confidence = (p: number) => (p >= 0.5 ? "conf-high" : p >= 0.2 ? "conf-mid" : "conf-low");

  return (
    <div className="widget" id="act-5">
      <div className="widget-head">
        <span className="act-num">Act 5</span>
        <span className="widget-title">The Loop — watch it write, one gamble at a time</span>
      </div>

      {!ready ? (
        <p className="dim">Loading the dissection model (7.5MB, shared)… {loadPct}%</p>
      ) : (
        <>
          <div className="gamble-row">
            <input
              className="text-input"
              value={prompt}
              disabled={steps.length > 0}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="loop-out">
            <span className="loop-prompt">{prompt}</span>
            {steps.map((s, i) => (
              <span
                key={i}
                className={`loop-tok ${confidence(s.p)}`}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {s.text}
                {hoverIdx === i && (
                  <span className="loop-pop">
                    {s.alts.map((a, j) => (
                      <span key={j} className={`pop-row${a.picked ? " picked" : ""}`}>
                        <span className="pop-label">{JSON.stringify(a.label).slice(1, -1)}</span>
                        <span className="pop-track">
                          <span className="pop-fill" style={{ width: `${a.p * 100}%` }} />
                        </span>
                        <span className="pop-p">{(a.p * 100).toFixed(0)}%</span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
            ))}
            {running && <span className="cursor-blink">▋</span>}
          </div>

          <div className="loop-controls">
            <button className="btn" onClick={write}>
              {running ? "⏸ Stop" : steps.length > 0 ? "▶ Continue" : "▶ Write"}
            </button>
            <button className="btn ghost" disabled={running} onClick={oneStep}>
              Step
            </button>
            <button className="btn ghost" disabled={running} onClick={reset}>
              Reset
            </button>
            <div className="temp-row loop-temp">
              <span className="temp-label">🧊</span>
              <input
                type="range"
                min={0.1}
                max={1.6}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
              />
              <span className="temp-label">🔥</span>
              <span className="temp-value">T={temperature.toFixed(2)}</span>
            </div>
          </div>

          <p className="legend">
            <span className="loop-tok conf-high demo">confident bet</span>
            <span className="loop-tok conf-mid demo">split decision</span>
            <span className="loop-tok conf-low demo">long shot</span>
            <span className="dim"> — hover any word to see the dice roll it won.</span>
          </p>
        </>
      )}

      <p className="widget-note">
        This is the same 7.5MB brain you dissected in Acts 2–3, now doing the only thing it knows:
        forward pass, probability list, dice roll, repeat. There is no plan, no sentence sketched
        in advance — each word is chosen before the next is even imaginable. Everything an LLM has
        ever written was written this way.
      </p>
    </div>
  );
}
