import { useCallback, useEffect, useRef, useState } from "react";
import { type Engine } from "../lib/engine";
import { getNano, type NanoHandle } from "../lib/nanoEngine";
import { sampleFrom, softmaxTopK } from "../lib/prob";
import type { EssayStrings } from "../content/types";

/**
 * The widget's chrome strings — the same shape as essay #1's `act5` table.
 * The flagship passes `useStrings().act5`; a later essay passes its own
 * section table. (This closes the "widget chrome lives in essay #1's tables"
 * seam noted in src/series/README.md.)
 */
export type LoopStrings = EssayStrings["act5"];

/**
 * Accessibility chrome the Classroom Edition passes (PRODUCT.md §6.3 —
 * "the autoregressive animation gets a step log"; "TheLoop animation
 * becomes step mode" under reduced motion). With it: the prompt field and
 * the temperature slider get names (the slider announces "T = 0.80"); every
 * written token is a real <button> named "' sat', 61%" whose popover opens
 * on click, Enter or Space as well as on hover (Escape closes it), so the
 * alternatives have a keyboard path; a polite live region reports the run;
 * a <details> step log lists every token with its probability and the
 * alternatives the model weighed; and when the reader prefers reduced
 * motion a run lands its tokens without the per-token pacing or the
 * blinking cursor — Step still writes one token per press. Absent → DOM
 * byte-identical to the flagship (HASHES.md).
 */
export interface LoopA11y {
  inputLabel: string;
  temperature: string;
  temperatureValue: (t: string) => string;
  /** Accessible name of one written token: its text and its probability as a percentage. */
  tokenName: (text: string, pct: string) => string;
  /** Name of the popover list of alternatives. */
  alternatives: string;
  /** Live status: how many tokens are written, the last one and its probability. */
  status: (n: number, text: string, pct: string) => string;
  statusRunning: string;
  /** The <details> label and the step log's column headers. */
  stepLog: string;
  stepLogHeaders: { n: string; token: string; p: string; alts: string };
}

interface Step {
  text: string;
  p: number;
  alts: { label: string; p: number; picked: boolean }[];
}

const MAX_TOKENS = 30;

/** The flagship's slider range — the default when no `maxTemperature` prop is passed. */
export const LOOP_TEMP_RANGE = { min: 0.1, max: 1.6, step: 0.05 } as const;

export default function TheLoop(props: {
  engine: Engine;
  strings: LoopStrings;
  /** DOM id for deep links — "act-5" in the flagship, a section id elsewhere. */
  htmlId: string;
  initialPrompt?: string;
  /** Slider ceiling; classroom pages pass CLASSROOM.maxTemperature (1.5). */
  maxTemperature?: number;
  /** Optional accessibility chrome (classroom pages); absent → DOM unchanged. */
  a11y?: LoopA11y;
}) {
  const t = props.strings;
  const a = props.a11y;
  const tempMax = props.maxTemperature ?? LOOP_TEMP_RANGE.max;
  const [prompt, setPrompt] = useState(props.initialPrompt ?? "Once upon a time");
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [temperature, setTemperature] = useState(0.8);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  /** A popover pinned open from the keyboard (a11y mode only). */
  const [pinIdx, setPinIdx] = useState<number | null>(null);
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
    setPinIdx(null);
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
    // a11y mode respects prefers-reduced-motion: the run lands without the per-token pacing
    const paced = !(a && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    for (let i = steps.length; i < MAX_TOKENS; i++) {
      if (stopRef.current) break;
      const ok = await oneStep();
      if (!ok) break;
      if (paced) await new Promise((r) => setTimeout(r, 110));
    }
    setRunning(false);
  }, [running, steps.length, oneStep, a]);

  const confidence = (p: number) => (p >= 0.5 ? "conf-high" : p >= 0.2 ? "conf-mid" : "conf-low");
  const pct = (p: number) => `${(p * 100).toFixed(0)}%`;
  const show = (s: string) => JSON.stringify(s).slice(1, -1);
  const last = steps[steps.length - 1];
  const reducedMotion = a && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** The popover's rows — shared by the hover/keyboard popover. */
  const popover = (s: Step) => (
    <span className="loop-pop" role={a ? "list" : undefined} aria-label={a?.alternatives}>
      {s.alts.map((alt, j) => (
        <span key={j} className={`pop-row${alt.picked ? " picked" : ""}`} role={a ? "listitem" : undefined}>
          <span className="pop-label">{show(alt.label)}</span>
          <span className="pop-track" aria-hidden={a ? true : undefined}>
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
          <div className="gamble-row">
            <input
              className="text-input"
              value={prompt}
              disabled={steps.length > 0}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={120}
              aria-label={a?.inputLabel}
            />
          </div>

          <div className="loop-out">
            <span className="loop-prompt">{prompt}</span>
            {steps.map((s, i) =>
              a ? (
                <button
                  key={i}
                  type="button"
                  className={`loop-tok ${confidence(s.p)}`}
                  aria-label={a.tokenName(show(s.text), pct(s.p))}
                  aria-expanded={pinIdx === i}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => setPinIdx(pinIdx === i ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && pinIdx === i) setPinIdx(null);
                  }}
                  onBlur={() => setPinIdx((p) => (p === i ? null : p))}
                >
                  {s.text}
                  {(hoverIdx === i || pinIdx === i) && popover(s)}
                </button>
              ) : (
                <span
                  key={i}
                  className={`loop-tok ${confidence(s.p)}`}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  {s.text}
                  {hoverIdx === i && popover(s)}
                </span>
              )
            )}
            {running && !reducedMotion && <span className="cursor-blink">▋</span>}
          </div>
          {a && (
            <p className="cl-sr-only" aria-live="polite">
              {running ? a.statusRunning : last ? a.status(steps.length, show(last.text), pct(last.p)) : ""}
            </p>
          )}

          <div className="loop-controls">
            <button className="btn" onClick={write}>
              {running ? t.stop : steps.length > 0 ? t.cont : t.write}
            </button>
            <button className="btn ghost" disabled={running} onClick={oneStep}>
              {t.step}
            </button>
            <button className="btn ghost" disabled={running} onClick={reset}>
              {t.reset}
            </button>
            <div className="temp-row loop-temp">
              <span className="temp-label">🧊</span>
              <input
                type="range"
                min={LOOP_TEMP_RANGE.min}
                max={tempMax}
                step={LOOP_TEMP_RANGE.step}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                aria-label={a?.temperature}
                aria-valuetext={a ? a.temperatureValue(temperature.toFixed(2)) : undefined}
              />
              <span className="temp-label">🔥</span>
              <span className="temp-value">T={temperature.toFixed(2)}</span>
            </div>
          </div>

          <p className="legend">
            <span className="loop-tok conf-high demo">{t.legendHigh}</span>
            <span className="loop-tok conf-mid demo">{t.legendMid}</span>
            <span className="loop-tok conf-low demo">{t.legendLow}</span>
            <span className="dim">{t.legendHint}</span>
          </p>
          {a && steps.length > 0 && (
            <details className="loop-log">
              <summary>{a.stepLog}</summary>
              <table className="cl-table loop-log-table">
                <thead>
                  <tr>
                    <th scope="col">{a.stepLogHeaders.n}</th>
                    <th scope="col">{a.stepLogHeaders.token}</th>
                    <th scope="col">{a.stepLogHeaders.p}</th>
                    <th scope="col">{a.stepLogHeaders.alts}</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s, i) => (
                    <tr key={i}>
                      <th scope="row">{i + 1}</th>
                      <td>
                        <code>{show(s.text)}</code>
                      </td>
                      <td>{pct(s.p)}</td>
                      <td>
                        {s.alts
                          .filter((alt) => !alt.picked)
                          .map((alt) => `${show(alt.label)} ${pct(alt.p)}`)
                          .join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
