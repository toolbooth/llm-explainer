import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Engine } from "../../lib/engine";
import { getNano, type NanoHandle } from "../../lib/nanoEngine";
import type { TokenProb } from "../../lib/prob";
import { CLASSROOM } from "../config";
import { GAMBLE_TEMP_RANGE } from "../../acts/Gamble";
import { ROLLS_PER_PRESS, ROLL_ANIMATION_MS, addCounts, distributionAt, rollMany, rollsDue, tally, type RollTally } from "./rolls";

/** Chrome strings for the widget; Module 2's content tables supply them per language. */
export interface HundredRollsStrings {
  num: string;
  title: string;
  loading: (pct: number) => string;
  placeholder: string;
  think: string;
  /** "🎲 Roll 100 times" — before the first press. */
  roll: (n: number) => string;
  /** "Roll 100 more" — after rolls have accumulated. */
  rollMore: (n: number) => string;
  rolling: string;
  reset: string;
  tempCareful: string;
  tempChaotic: string;
  /** Legend labels for the two bars. */
  modelBar: string;
  rollsBar: string;
  /** Shown in the summary slot before the first press. */
  noRolls: string;
  /** The live summary after rolls; words arrive decoded (leading space included). */
  summary: (s: {
    n: number;
    winner: string;
    winnerCount: number;
    winnerP: number;
    favourite: string;
    favouriteCount: number;
    favouriteP: number;
    distinct: number;
  }) => string;
  /** Native <details> label for the table alternative. */
  tableToggle: string;
  tableHeaders: { word: string; model: string; expected: string; count: string; share: string };
  note: () => ReactNode;
}

interface Row extends TokenProb {
  label: string;
}

/**
 * One animation tick: ~70 ms, or sooner if the tab's visibility changes
 * (a throttled background timer still fires eventually; coming back to
 * the tab resolves at once, and rollsDue then lands everything overdue).
 */
function nextTick(): Promise<void> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const done = () => {
      if (timer !== null) clearTimeout(timer);
      document.removeEventListener("visibilitychange", done);
      resolve();
    };
    timer = setTimeout(done, 70);
    document.addEventListener("visibilitychange", done);
  });
}

/**
 * Hundred Rolls — the Classroom Edition's one new widget (PRODUCT.md §4.2
 * M2). Same input, same model, same temperature as the Gamble above it —
 * but one press samples the position 100 times and draws, for each of the
 * ten candidate words, the model's probability next to the share of rolls
 * that actually landed there. Presses accumulate (200, 300…) so the two
 * bars visibly converge; changing the text or the temperature changes the
 * distribution, so the tally resets.
 *
 * Accessibility: native controls only (input, buttons, range, <details>);
 * the chart is decorative and aria-hidden; the numbers live in a polite
 * live-region summary and a real <table> behind "Show as a table".
 * `prefers-reduced-motion` (or a hidden tab) makes the 100 rolls land at
 * once; otherwise they land over ROLL_ANIMATION_MS on a time-based step,
 * so a tab that is backgrounded mid-press — where Chrome throttles timers
 * to once a second, then once a minute — finds every outstanding roll
 * landed the moment it is looked at again (REVIEW-CLASSROOM-2, open
 * question 1).
 */
export default function HundredRolls(props: {
  engine: Engine;
  strings: HundredRollsStrings;
  htmlId: string;
  initialText: string;
  presets?: string[];
  /** Slider ceiling — classroom pages pass CLASSROOM.maxTemperature. */
  maxTemperature?: number;
  /** Localized slider name and announced value (the shared classroom a11y table); absent → English defaults. */
  a11y?: { temperature: string; temperatureValue: (t: string) => string };
}) {
  const t = props.strings;
  const tempName = props.a11y?.temperature ?? "temperature";
  const tempValue = props.a11y?.temperatureValue ?? ((x: string) => `T = ${x}`);
  const tempMax = props.maxTemperature ?? CLASSROOM.maxTemperature;
  const [text, setText] = useState(props.initialText);
  const [temperature, setTemperature] = useState(1.0);
  const [logits, setLogits] = useState<Float32Array | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<number[]>([]);
  const [thinking, setThinking] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const nanoRef = useRef<NanoHandle | null>(null);
  const cancelRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getNano(setLoadPct).then((h) => {
      if (cancelled) return;
      nanoRef.current = h;
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** The distribution the rolls sample from (top-10 at the current temperature, clamped to the cap). */
  const dist = useMemo(() => (logits ? distributionAt(logits, temperature, tempMax) : []), [logits, temperature, tempMax]);

  const labelRows = useCallback(
    async (d: TokenProb[]) => {
      const labels = await Promise.all(d.map((x) => props.engine.decode([x.id])));
      setRows(d.map((x, i) => ({ ...x, label: labels[i] })));
    },
    [props.engine]
  );

  const think = useCallback(
    async (input: string) => {
      const nano = nanoRef.current;
      if (!nano) return;
      setThinking(true);
      cancelRef.current++;
      try {
        const ids = (await props.engine.tokenize(input)).map((p) => p.id);
        if (ids.length === 0) {
          setLogits(null);
          setRows([]);
          setCounts([]);
          return;
        }
        const lg = nano.forward(ids).logits;
        setLogits(lg);
        setCounts([]);
        await labelRows(distributionAt(lg, temperature, tempMax));
      } finally {
        setThinking(false);
      }
    },
    [props.engine, labelRows, temperature, tempMax]
  );

  // First think once the brain is up.
  const thoughtOnce = useRef(false);
  useEffect(() => {
    if (!ready || thoughtOnce.current) return;
    thoughtOnce.current = true;
    void think(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onTemp = useCallback(
    async (value: number) => {
      cancelRef.current++;
      setRolling(false);
      setTemperature(value);
      setCounts([]);
      if (logits) await labelRows(distributionAt(logits, value, tempMax));
    },
    [logits, labelRows, tempMax]
  );

  const roll = useCallback(async () => {
    if (dist.length === 0 || rolling) return;
    const token = ++cancelRef.current;
    setRolling(true);
    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hidden = typeof document !== "undefined" && document.hidden;
    const duration = reduced || hidden ? 0 : ROLL_ANIMATION_MS;
    const start = performance.now();
    let landed = 0;
    try {
      while (landed < ROLLS_PER_PRESS) {
        if (cancelRef.current !== token) return;
        const due = rollsDue(performance.now() - start, duration);
        if (due > landed) {
          const add = rollMany(dist, due - landed, Math.random);
          setCounts((c) => addCounts(c.length ? c : new Array(dist.length).fill(0), add));
          landed = due;
        }
        if (landed < ROLLS_PER_PRESS) await nextTick();
      }
    } finally {
      if (cancelRef.current === token) setRolling(false);
    }
  }, [dist, rolling]);

  const resetRolls = useCallback(() => {
    cancelRef.current++;
    setRolling(false);
    setCounts([]);
  }, []);

  const tl: RollTally = useMemo(() => tally(dist, counts), [dist, counts]);
  const show = (s: string) => JSON.stringify(s).slice(1, -1);
  const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;
  const summary =
    tl.n === 0 || tl.winner === null
      ? t.noRolls
      : t.summary({
          n: tl.n,
          winner: rows[tl.winner]?.label ?? "",
          winnerCount: tl.rows[tl.winner].count,
          winnerP: tl.rows[tl.winner].p,
          favourite: rows[0]?.label ?? "",
          favouriteCount: tl.rows[0].count,
          favouriteP: tl.rows[0].p,
          distinct: tl.distinct,
        });

  return (
    <div className="widget hr" id={props.htmlId}>
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
                  type="button"
                  className={`preset-btn${text === p ? " active" : ""}`}
                  disabled={thinking}
                  aria-pressed={text === p}
                  onClick={() => {
                    setText(p);
                    void think(p);
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
              placeholder={t.placeholder}
              aria-label={t.title}
              onChange={(e) => setText(e.target.value)}
              maxLength={200}
            />
            <button type="button" className="btn ghost" disabled={thinking} onClick={() => void think(text)} aria-label={thinking ? t.think : undefined}>
              {thinking ? "…" : t.think}
            </button>
          </div>

          {rows.length > 0 && (
            <>
              <div className="temp-row">
                <span className="temp-label">{t.tempCareful}</span>
                <input
                  type="range"
                  min={GAMBLE_TEMP_RANGE.min}
                  max={tempMax}
                  step={GAMBLE_TEMP_RANGE.step}
                  value={temperature}
                  aria-label={tempName}
                  aria-valuetext={tempValue(temperature.toFixed(2))}
                  onChange={(e) => void onTemp(Number(e.target.value))}
                />
                <span className="temp-label">{t.tempChaotic}</span>
                <span className="temp-value">T = {temperature.toFixed(2)}</span>
              </div>

              <div className="hr-controls">
                <button type="button" className="btn" disabled={rolling || thinking} onClick={() => void roll()}>
                  {rolling ? t.rolling : tl.n === 0 ? t.roll(ROLLS_PER_PRESS) : t.rollMore(ROLLS_PER_PRESS)}
                </button>
                <button type="button" className="btn ghost" disabled={tl.n === 0 && !rolling} onClick={resetRolls}>
                  {t.reset}
                </button>
                <span className="hr-legend" aria-hidden="true">
                  <span className="hr-swatch model" /> {t.modelBar}
                  <span className="hr-swatch rolls" /> {t.rollsBar}
                </span>
              </div>

              <div className="hr-rows" aria-hidden="true">
                {tl.rows.map((r, i) => (
                  <div className={`hr-row${tl.winner === i ? " win" : ""}`} key={r.id}>
                    <span className="hr-label">{show(rows[i]?.label ?? "")}</span>
                    <span className="hr-bars">
                      <span className="hr-track">
                        <span className="hr-fill model" style={{ width: `${Math.max(0.5, r.p * 100)}%` }} />
                      </span>
                      <span className="hr-track">
                        <span className="hr-fill rolls" style={{ width: `${r.freq * 100}%` }} />
                      </span>
                    </span>
                    <span className="hr-num">
                      {fmtPct(r.p)} · {r.count}/{tl.n}
                    </span>
                  </div>
                ))}
              </div>

              <p className="hr-summary" aria-live="polite">
                {summary}
              </p>

              <details className="hr-details">
                <summary>{t.tableToggle}</summary>
                <table className="cl-table hr-table">
                  <thead>
                    <tr>
                      <th scope="col">{t.tableHeaders.word}</th>
                      <th scope="col">{t.tableHeaders.model}</th>
                      <th scope="col">{t.tableHeaders.expected}</th>
                      <th scope="col">{t.tableHeaders.count}</th>
                      <th scope="col">{t.tableHeaders.share}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tl.rows.map((r, i) => (
                      <tr key={r.id}>
                        <th scope="row">
                          <code>{show(rows[i]?.label ?? "")}</code>
                        </th>
                        <td>{fmtPct(r.p)}</td>
                        <td>{r.expected.toFixed(1)}</td>
                        <td>{r.count}</td>
                        <td>{tl.n === 0 ? "—" : fmtPct(r.freq)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </>
      )}
      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
