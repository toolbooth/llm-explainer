import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Engine } from "../../lib/engine";
import { getNano, type NanoHandle } from "../../lib/nanoEngine";
import { sampleFrom, softmaxTopK } from "../../lib/prob";
import { findRepeats, mulberry32 } from "./loops";
import type { ParrotStrings } from "./content/types";

/**
 * The Parrot — essay #5's single new widget. TheLoop's autoregressive
 * machinery (shared nano brain via getNano, no big-model gate), with three
 * changes for this essay's question:
 *
 *  - a greedy toggle: on = always the top logit (no dice at all, temperature
 *    ignored), off = the same top-k=8 temperature sampling TheLoop uses;
 *  - repeat highlighting: after every step the ACTUAL generated ids go
 *    through loops.ts's findRepeats; occurrences of the same repeated
 *    n-gram share one color, and the verdict line quotes the dominant one.
 *    Nothing is scripted — a highlight can only show a loop the model
 *    really produced;
 *  - longer runs (40 tokens per press, Continue extends) so a chant has
 *    room to establish itself.
 *
 * Under ?mockModel=1 the dice are a fixed-seed mulberry32, so the mock path
 * is deterministic end to end (the initial DOM already is: no steps).
 */

interface Step {
  text: string;
  /** Top-8 alternatives at the temperature the step was taken at (T = 1 for greedy). */
  alts: { label: string; p: number; picked: boolean }[];
}

const TOKENS_PER_PRESS = 40;
const MAX_TOKENS = 160;
const TEMP_RANGE = { min: 0.1, max: 1.6, step: 0.05 } as const;
const MOCK_SEED = 11;

export default function Parrot(props: {
  engine: Engine;
  strings: ParrotStrings;
  /** DOM id for deep links (e.g. "sec-1"). */
  htmlId: string;
  initialPrompt: string;
  /** Optional preset prompts, rendered as one-click chips above the input. */
  presets?: string[];
  initialGreedy?: boolean;
  initialTemperature?: number;
}) {
  const t = props.strings;
  const [prompt, setPrompt] = useState(props.initialPrompt);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [greedy, setGreedy] = useState(props.initialGreedy ?? false);
  const [temperature, setTemperature] = useState(props.initialTemperature ?? 0.8);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const nanoRef = useRef<NanoHandle | null>(null);
  /** Generated ids only (the prompt's ids are kept separately). */
  const genIdsRef = useRef<number[]>([]);
  const promptIdsRef = useRef<number[]>([]);
  const stopRef = useRef(false);
  const randRef = useRef<() => number>(Math.random);

  const isMock = typeof location !== "undefined" && new URLSearchParams(location.search).has("mockModel");

  useEffect(() => {
    getNano(setLoadPct).then((h) => {
      nanoRef.current = h;
      setReady(true);
    });
  }, []);

  const reset = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
    setFinished(false);
    setSteps([]);
    genIdsRef.current = [];
    promptIdsRef.current = [];
  }, []);

  const oneStep = useCallback(async (): Promise<boolean> => {
    const nano = nanoRef.current;
    if (!nano) return false;
    if (promptIdsRef.current.length === 0) {
      const pieces = await props.engine.tokenize(prompt.trim() || "Tom and Lily went to the park.");
      promptIdsRef.current = pieces.map((p) => p.id);
      randRef.current = isMock ? mulberry32(MOCK_SEED) : Math.random;
    }
    const ids = [...promptIdsRef.current, ...genIdsRef.current];
    const { logits } = nano.forward(ids);
    // Greedy reads the same bet-sheet and takes the top row; the popover then
    // shows the T = 1 odds it ignored. Sampling rolls at the current slider.
    const dist = softmaxTopK(logits, 8, greedy ? 1 : temperature);
    const pick = greedy ? dist[0] : sampleFrom(dist, randRef.current());
    const labels = await Promise.all(dist.map((d) => props.engine.decode([d.id])));
    const text = await props.engine.decode([pick.id]);
    genIdsRef.current = [...genIdsRef.current, pick.id];
    setSteps((s) => [
      ...s,
      { text, alts: dist.map((d, i) => ({ label: labels[i], p: d.p, picked: d.id === pick.id })) },
    ]);
    // <|endoftext|> ends the story — the prose promises the bird preset stops here.
    if (pick.id === 50256) return false;
    return promptIdsRef.current.length + genIdsRef.current.length < 2048;
  }, [props.engine, prompt, greedy, temperature, isMock]);

  const write = useCallback(async () => {
    if (running) {
      stopRef.current = true;
      return;
    }
    stopRef.current = false;
    setRunning(true);
    setFinished(false);
    const target = Math.min(steps.length + TOKENS_PER_PRESS, MAX_TOKENS);
    for (let i = steps.length; i < target; i++) {
      if (stopRef.current) break;
      const ok = await oneStep();
      if (!ok) break;
      await new Promise((r) => setTimeout(r, 90));
    }
    setRunning(false);
    setFinished(true);
  }, [running, steps.length, oneStep]);

  // Repeats are recomputed from the ids the model actually produced.
  const report = useMemo(() => findRepeats(genIdsRef.current), [steps]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = (p: number) => `${(p * 100).toFixed(0)}%`;
  const show = (s: string) => JSON.stringify(s).slice(1, -1);

  const popover = (s: Step) => (
    <span className="loop-pop">
      {s.alts.map((alt, j) => (
        <span key={j} className={`pop-row${alt.picked ? " picked" : ""}`}>
          <span className="pop-label">{show(alt.label)}</span>
          <span className="pop-track">
            <span className="pop-fill" style={{ width: `${alt.p * 100}%` }} />
          </span>
          <span className="pop-p">{pct(alt.p)}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>

      {!ready ? (
        <p className="dim">{t.loading(loadPct)}</p>
      ) : (
        <>
          {props.presets && props.presets.length > 0 && (
            <div className="preset-row">
              {props.presets.map((p) => (
                <button
                  key={p}
                  className={`preset-btn${prompt === p ? " active" : ""}`}
                  disabled={running}
                  onClick={() => {
                    reset();
                    setPrompt(p);
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
              value={prompt}
              disabled={steps.length > 0}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="loop-out">
            <span className="loop-prompt">{prompt}</span>
            {steps.map((s, i) => {
              const g = report.tokenGroup[i] ?? -1;
              return (
                <span
                  key={i}
                  className={`loop-tok${g >= 0 ? ` pr-${g % 6}` : ""}`}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  {s.text}
                  {hoverIdx === i && popover(s)}
                </span>
              );
            })}
            {running && <span className="cursor-blink">▋</span>}
          </div>

          {finished && steps.length > 0 && (
            <p className="parrot-verdict">
              {report.dominant
                ? t.verdict(show(steps
                    .slice(report.dominant.starts[0], report.dominant.starts[0] + report.dominant.length)
                    .map((s) => s.text)
                    .join("")), report.dominant.starts.length)
                : t.noRepeat}
            </p>
          )}

          <div className="loop-controls">
            <button className="btn" onClick={write}>
              {running ? t.stop : steps.length > 0 ? t.cont : t.write}
            </button>
            <button className="btn ghost" disabled={running} onClick={reset}>
              {t.reset}
            </button>
            <label className={`parrot-greedy${greedy ? " on" : ""}`}>
              <input
                type="checkbox"
                checked={greedy}
                disabled={running}
                onChange={(e) => setGreedy(e.target.checked)}
              />
              {t.greedy}
            </label>
            <div className={`temp-row loop-temp${greedy ? " temp-off" : ""}`}>
              <span className="temp-label">🧊</span>
              <input
                type="range"
                min={TEMP_RANGE.min}
                max={TEMP_RANGE.max}
                step={TEMP_RANGE.step}
                value={temperature}
                disabled={greedy}
                onChange={(e) => setTemperature(Number(e.target.value))}
              />
              <span className="temp-label">🔥</span>
              <span className="temp-value">{greedy ? "T = 0" : `T = ${temperature.toFixed(2)}`}</span>
            </div>
          </div>

          <p className="legend">
            <span className="loop-tok pr-0 demo">{t.legendRepeat}</span>
            <span className="dim">{t.legendHint}</span>
          </p>
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
