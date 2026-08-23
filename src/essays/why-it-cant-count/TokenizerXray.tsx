import { useCallback, useEffect, useMemo, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../../lib/engine";
import { softmaxTopK } from "../../lib/prob";
import {
  MAX_WORD,
  chars,
  countingPrompts,
  digitReadout,
  letterTally,
  pieceLetters,
  type DigitReadout,
  type LabeledProb,
} from "./xray";
import type { XrayStrings } from "./content/types";

/**
 * TokenizerXray — essay #4's single new widget (§2, "The X-ray").
 *
 * Top half needs only the Act-4 model's tokenizer: the word as characters
 * (target letter marked), the word as the pieces the model receives (each
 * piece's characters shown faintly, hits marked), and the ids. Bottom half
 * wakes the model on explicit request, like Act 4, and runs two prompts —
 * the question straight, and the question with the word spelled out — each
 * read as a histogram over the digits 0–9 (first next token, T = 1). No new
 * model surface beyond Engine.tokenizeModel; the digit fold-in is xray.ts.
 */

/** How many next-token candidates to decode — the digits always sit inside this in the census. */
const TOP_K = 40;

interface Attempt {
  prompt: string;
  bars: LabeledProb[];
  readout: DigitReadout;
}

/**
 * The chrome a tokenizer-only X-ray needs (the top half: letters, pieces,
 * insight, note). The Classroom Edition mounts the widget with
 * `modelGate: false` and passes just these — no "wake the model" copy ever
 * enters a classroom strings table (PRODUCT.md §4.1 rule 4).
 */
export type XrayTokenizerStrings = Pick<
  XrayStrings,
  "num" | "title" | "wordLabel" | "letterLabel" | "loadingTokenizer" | "youSee" | "modelSees" | "letterTally" | "pieceTally" | "insight" | "note"
>;

/**
 * Accessibility chrome the Classroom Edition passes (PRODUCT.md §6.3): the
 * "you see" row — which a screen reader would otherwise read letter by
 * letter — becomes one named image ("strawberry: 10 letters, r at 3, 8,
 * 9"), the "model sees" row becomes a named list whose items read as
 * "piece 2, 'raw', id 1831, carries 1 r", and the insight line is a polite
 * live region. Absent → DOM byte-identical to essay #4 (HASHES.md).
 */
export interface XrayA11y {
  /** Name of the letters row: the word, its length, the target letter and its 1-based positions. */
  letters: (word: string, n: number, letter: string, positions: number[]) => string;
  /** Name of the piece list. */
  pieces: string;
  /** One piece's name: 1-based index, text, id, how many of the target letter it carries. */
  pieceItem: (n: number, text: string, id: number, carries: number) => string;
}

type XrayProps = {
  engine: Engine;
  /** DOM id for deep links (e.g. "sec-2"). */
  htmlId: string;
  initialWord: string;
  initialLetter: string;
  /**
   * Which vocabulary cuts the word: the Act-4 model's own ("model", the
   * essay's default — it is about to take the test) or the shared GPT-2 BPE
   * the Chopper and the nano model use ("shared" — the classroom's single
   * vocabulary, so M1's three widgets agree).
   */
  tokenizer?: "model" | "shared";
  /** Optional accessibility chrome (classroom pages); absent → DOM unchanged. */
  a11y?: XrayA11y;
} & (
  | { modelGate?: true; strings: XrayStrings }
  | { modelGate: false; strings: XrayTokenizerStrings }
);

export default function TokenizerXray(props: XrayProps) {
  const gate = props.modelGate !== false;
  // With the gate off, the model-side strings are never read (see the JSX),
  // so the wider type is only a convenience for the one `t` binding.
  const t = props.strings as XrayStrings;
  const a = props.a11y;
  const [word, setWord] = useState(props.initialWord);
  const [letter, setLetter] = useState(props.initialLetter);
  const [pieces, setPieces] = useState<TokenPiece[] | null>(null);
  const [loadPct, setLoadPct] = useState<number | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [attempts, setAttempts] = useState<{ straight: Attempt; spelled: Attempt } | null>(null);

  const ready = props.engine.modelReady();

  // the pieces as the counting model receives them — tokenizer only, no model download
  const shared = props.tokenizer === "shared";
  useEffect(() => {
    let stale = false;
    const id = setTimeout(() => {
      (shared ? props.engine.tokenize(word) : props.engine.tokenizeModel(word))
        .then((p) => {
          if (!stale) setPieces(p);
        })
        .catch(() => {
          /* tokenizer still loading — keep the last pieces */
        });
    }, 150);
    return () => {
      stale = true;
      clearTimeout(id);
    };
  }, [word, props.engine, shared]);

  // a new word or letter invalidates the last attempt
  useEffect(() => {
    setAttempts(null);
  }, [word, letter]);

  const letters = useMemo(() => chars(word), [word]);
  const tally = useMemo(() => letterTally(word, letter), [word, letter]);
  const hit = useMemo(() => new Set(tally.positions), [tally]);
  const mapped = useMemo(
    () => (pieces ? pieceLetters(pieces.map((p) => ({ text: displayPiece(p.text), id: p.id })), letter) : null),
    [pieces, letter]
  );
  const prompts = useMemo(() => countingPrompts(word, letter), [word, letter]);

  const attempt = useCallback(
    async (prompt: string): Promise<Attempt> => {
      const { logits } = await props.engine.lastLogits(prompt);
      const dist = softmaxTopK(logits, TOP_K, 1);
      const labels = await Promise.all(dist.map((d) => props.engine.decodeModel([d.id])));
      const bars = dist.map((d, i) => ({ label: labels[i], p: d.p }));
      return { prompt, bars, readout: digitReadout(bars, tally.count) };
    },
    [props.engine, tally.count]
  );

  const run = useCallback(async () => {
    setThinking(true);
    try {
      const straight = await attempt(prompts.straight);
      const spelled = await attempt(prompts.spelled);
      setAttempts({ straight, spelled });
    } finally {
      setThinking(false);
    }
  }, [attempt, prompts]);

  const loadModel = useCallback(async () => {
    setLoadError(false);
    setLoadPct(0);
    try {
      await props.engine.loadModel(setLoadPct);
      await run();
    } catch {
      setLoadError(true);
    } finally {
      setLoadPct(null);
    }
  }, [props.engine, run]);

  const canRun = word.length > 0 && letter.length > 0;

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>

      <div className="xr-inputs">
        <label className="xr-field xr-field-word">
          <span className="xr-label">{t.wordLabel}</span>
          <input
            className="text-input"
            value={word}
            onChange={(e) => setWord(e.target.value.slice(0, MAX_WORD))}
            maxLength={MAX_WORD}
          />
        </label>
        <label className="xr-field xr-field-letter">
          <span className="xr-label">{t.letterLabel}</span>
          <input
            className="text-input"
            value={letter}
            onChange={(e) => setLetter(chars(e.target.value).slice(-1).join(""))}
          />
        </label>
      </div>

      <div className="xr-row">
        <span className="xr-row-label">{t.youSee}</span>
        <div
          className="xr-cells"
          role={a ? "img" : undefined}
          aria-label={a ? a.letters(word, letters.length, letter, tally.positions.map((p) => p + 1)) : undefined}
        >
          {letters.map((c, i) => (
            <span className={`xr-ch${hit.has(i) ? " hit" : ""}`} key={i}>
              {c === " " ? "␣" : c}
            </span>
          ))}
        </div>
        <span className="xr-tally">{t.letterTally(letters.length, tally.count, letter)}</span>
      </div>

      <div className="xr-row">
        <span className="xr-row-label">{t.modelSees}</span>
        {mapped === null ? (
          <span className="dim">{t.loadingTokenizer}</span>
        ) : (
          <>
            <div className="xr-cells" role={a ? "list" : undefined} aria-label={a?.pieces}>
              {mapped.map((p, i) => (
                <span
                  className={`xr-piece${p.count > 0 ? " carries" : ""}`}
                  key={i}
                  role={a ? "listitem" : undefined}
                  aria-label={a ? a.pieceItem(i + 1, p.letters.join(""), p.id, p.count) : undefined}
                >
                  <span className="xr-piece-letters">
                    {p.letters.map((c, j) => (
                      <span className={p.hits[j] ? "hit" : ""} key={j}>
                        {c === " " ? "␣" : c}
                      </span>
                    ))}
                  </span>
                  <span className="xr-piece-id">#{p.id}</span>
                </span>
              ))}
            </div>
            <span className="xr-tally">{t.pieceTally(mapped.length)}</span>
          </>
        )}
      </div>

      {mapped && (
        <p className="xr-insight" aria-live={a ? "polite" : undefined}>
          {t.insight({
            letters: letters.length,
            count: tally.count,
            letter,
            pieces: mapped.length,
            carriers: mapped.filter((p) => p.count > 0).map((p) => p.id),
          })}
        </p>
      )}

      {!gate ? null : !ready ? (
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
          <div className="xr-run-row">
            <button className="btn" disabled={thinking || !canRun} onClick={run}>
              {thinking ? t.running : t.run}
            </button>
          </div>
          {attempts && (
            <div className="xr-panels">
              <AttemptPanel t={t} heading={t.straightHeading} attempt={attempts.straight} />
              <AttemptPanel t={t} heading={t.spelledHeading} attempt={attempts.spelled} />
            </div>
          )}
        </>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}

function AttemptPanel(props: { t: XrayStrings; heading: string; attempt: Attempt }) {
  const { t, attempt } = props;
  const r = attempt.readout;
  const peak = Math.max(...r.digits, 1e-9);
  return (
    <div className="xr-panel">
      <h4>{props.heading}</h4>
      <p className="xr-prompt-label dim">{t.promptLabel}</p>
      <code className="xr-prompt">{attempt.prompt}</code>
      <div className="xr-hist" role="img" aria-label={t.truthLabel(r.truth)}>
        {r.digits.map((p, d) => (
          <div
            className={`xr-bin${d === r.truthDigit ? " truth" : ""}${d === r.top ? " top" : ""}`}
            key={d}
            title={`${d}: ${(p * 100).toFixed(1)}%`}
          >
            <span className="xr-bin-pct">{(p * 100).toFixed(0)}%</span>
            <span className="xr-bin-track">
              <span className="xr-bin-fill" style={{ height: `${(p / peak) * 100}%` }} />
            </span>
            <span className="xr-bin-label">{d}</span>
          </div>
        ))}
      </div>
      <p className="xr-legend dim">
        {t.truthLabel(r.truth)} · {t.otherMass((r.other * 100).toFixed(0))}
      </p>
      <p className="xr-verdict">
        {r.top === null
          ? t.verdictNone
          : r.correct
            ? t.verdictHit(r.top)
            : t.verdictMiss(r.top, r.truth)}
      </p>
      <p className="xr-raw dim">
        {t.rawTop}{" "}
        {attempt.bars.slice(0, 5).map((b, i) => (
          <span key={i}>
            {i > 0 && " · "}
            <code>{JSON.stringify(b.label).slice(1, -1)}</code> {(b.p * 100).toFixed(1)}%
          </span>
        ))}
      </p>
    </div>
  );
}
