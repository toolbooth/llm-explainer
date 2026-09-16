import { useEffect, useState } from "react";
import { displayPiece, type Engine, type TokenPiece } from "../../lib/engine";
import { WINDOW, type Pair } from "./corpus";
import type { MeterStrings } from "./content/types";

/**
 * The Bilingual Meter (双语计价器) — essay #7's single new widget. Two
 * Chopper-style pans over the SAME shared GPT-2 tokenizer (engine.tokenize;
 * no model is ever loaded), weighing an English/中文 pair at once: pieces,
 * counts, each side's share of a WINDOW-token context, and the exchange
 * rate zh ÷ en. Presets come from the measured corpus (corpus.ts — the CI
 * data test re-tokenizes the very same pairs); both inputs stay free so the
 * reader can weigh anything. Deterministic under ?mockModel=1 by
 * construction: the mock tokenizer is a pure function and the Meter rolls
 * no dice.
 */

const PALETTE = ["c1", "c2", "c3", "c4", "c5"];
/** Preset chips are labeled by the pair's zh member (the substance, not chrome), ellipsized. */
function chipLabel(p: Pair): string {
  const s = [...p.zh];
  return s.length <= 12 ? p.zh : s.slice(0, 11).join("") + "…";
}

function Pan(props: {
  engine: Engine;
  label: string;
  text: string;
  onText: (v: string) => void;
  pieces: TokenPiece[] | null;
  t: MeterStrings;
}) {
  const { t, pieces } = props;
  const n = pieces?.length ?? 0;
  const pct = ((n / WINDOW) * 100).toFixed(1);
  return (
    <div className="meter-pan">
      <span className="meter-pan-label">{props.label}</span>
      <input
        className="text-input"
        value={props.text}
        onChange={(e) => props.onText(e.target.value)}
        maxLength={400}
      />
      {pieces === null ? (
        <p className="dim">{t.loading}</p>
      ) : (
        <>
          <div className="tokens meter-tokens">
            {pieces.map((p, i) => (
              <span className={`tok ${PALETTE[i % PALETTE.length]}`} key={i}>
                <span className="tok-text">{displayPiece(p.text)}</span>
                <span className="tok-id">#{p.id}</span>
              </span>
            ))}
          </div>
          <p className="meter-readout">
            <strong>{t.count(n)}</strong>
            <span className="meter-share dim">{t.share(pct)}</span>
          </p>
          <div className="bar-track meter-window">
            <div className="bar-fill" style={{ width: `${Math.min(100, (n / WINDOW) * 100)}%` }} />
          </div>
        </>
      )}
    </div>
  );
}

export default function Meter(props: {
  engine: Engine;
  strings: MeterStrings;
  /** DOM id for deep links (e.g. "sec-1"). */
  htmlId: string;
  initialPair: Pair;
  /** Preset pairs, rendered as one-click chips (labeled by their zh side). */
  presets?: readonly Pair[];
}) {
  const t = props.strings;
  const [enText, setEnText] = useState(props.initialPair.en);
  const [zhText, setZhText] = useState(props.initialPair.zh);
  const [enPieces, setEnPieces] = useState<TokenPiece[] | null>(null);
  const [zhPieces, setZhPieces] = useState<TokenPiece[] | null>(null);

  // One debounced tokenize per pan (the X-ray's pattern); a still-loading
  // tokenizer keeps the last pieces rather than flashing.
  useEffect(() => {
    let stale = false;
    const id = setTimeout(() => {
      props.engine
        .tokenize(enText)
        .then((p) => {
          if (!stale) setEnPieces(p);
        })
        .catch(() => {});
    }, 150);
    return () => {
      stale = true;
      clearTimeout(id);
    };
  }, [enText, props.engine]);
  useEffect(() => {
    let stale = false;
    const id = setTimeout(() => {
      props.engine
        .tokenize(zhText)
        .then((p) => {
          if (!stale) setZhPieces(p);
        })
        .catch(() => {});
    }, 150);
    return () => {
      stale = true;
      clearTimeout(id);
    };
  }, [zhText, props.engine]);

  const enN = enPieces?.length ?? 0;
  const zhN = zhPieces?.length ?? 0;
  const ready = enPieces !== null && zhPieces !== null;

  return (
    <div className="widget" id={props.htmlId}>
      <div className="widget-head">
        <span className="act-num">{t.num}</span>
        <span className="widget-title">{t.title}</span>
      </div>

      {props.presets && props.presets.length > 0 && (
        <div className="preset-row">
          {props.presets.map((p) => (
            <button
              key={p.zh}
              type="button"
              className={`preset-btn${enText === p.en && zhText === p.zh ? " active" : ""}`}
              onClick={() => {
                setEnText(p.en);
                setZhText(p.zh);
              }}
            >
              {chipLabel(p)}
            </button>
          ))}
        </div>
      )}

      <div className="meter-grid">
        <Pan engine={props.engine} label={t.sideEn} text={enText} onText={setEnText} pieces={enPieces} t={t} />
        <Pan engine={props.engine} label={t.sideZh} text={zhText} onText={setZhText} pieces={zhPieces} t={t} />
      </div>

      {ready && (
        <p className="meter-ratio">
          <span className="meter-ratio-x">{enN > 0 && zhN > 0 ? `×${(zhN / enN).toFixed(2)}` : "—"}</span>
          <span className="meter-ratio-cap dim">{t.ratioCaption(zhN, enN)}</span>
        </p>
      )}

      <p className="widget-note">{t.note()}</p>
    </div>
  );
}
