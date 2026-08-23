import { useState } from "react";
import { hideAll, hintButtonKind, initialHintState, revealNext, visibleHints } from "./hints";

/** Chrome strings for the hint control; come from the classroom strings table. */
export interface HintStrings {
  /** Button label while hints remain, e.g. "Show hint 2 of 3". */
  reveal: (next: number, total: number) => string;
  /** Button label once every hint is open. */
  hide: string;
  /** Label in front of each revealed hint, e.g. "Hint 2". */
  label: (n: number) => string;
}

/**
 * Progressive hints for one guided-exploration prompt. Hidden by default;
 * one native <button> reveals the next hint on click, Enter or Space (no
 * custom key handling needed), carries aria-expanded/aria-controls, and the
 * list is a polite live region so a screen reader hears each new hint.
 */
export default function HintPanel(props: { id: string; hints: readonly string[]; strings: HintStrings }) {
  const t = props.strings;
  const [state, setState] = useState(() => initialHintState(props.hints.length));
  const kind = hintButtonKind(state);
  const shown = visibleHints(props.hints, state);
  const listId = `${props.id}-hints`;

  if (kind === "none") return null;

  return (
    <div className="cl-hints">
      <div className="cl-hint-list" id={listId} aria-live="polite">
        {shown.map((h, i) => (
          <p className="cl-hint" key={i}>
            <strong className="cl-hint-k">{t.label(i + 1)}</strong> {h}
          </p>
        ))}
      </div>
      <button
        type="button"
        className="btn ghost cl-hint-btn"
        aria-expanded={state.revealed > 0}
        aria-controls={listId}
        onClick={() => setState(kind === "reveal" ? revealNext(state) : hideAll(state))}
      >
        {kind === "reveal" ? t.reveal(state.revealed + 1, state.total) : t.hide}
      </button>
    </div>
  );
}
