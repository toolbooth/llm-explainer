/**
 * Pure state logic for progressive hints (PRODUCT.md §4.3 beat 3, the
 * community-college ask: "retry without restarting the module"). A prompt
 * carries N hints; the student reveals them one at a time, and can fold them
 * away again without losing anything else on the page. Unit-tested in
 * test/hints.test.ts without a DOM; HintPanel.tsx is the thin view over it.
 */

export interface HintState {
  /** How many hints are currently visible, 0..total. */
  revealed: number;
  total: number;
}

export function initialHintState(total: number): HintState {
  return { revealed: 0, total: Math.max(0, Math.floor(total)) };
}

/** Reveal one more hint; saturates at `total`. */
export function revealNext(s: HintState): HintState {
  return { ...s, revealed: Math.min(s.total, s.revealed + 1) };
}

/** Fold every hint away (the student keeps the page state; nothing restarts). */
export function hideAll(s: HintState): HintState {
  return { ...s, revealed: 0 };
}

/** What the single control button does next. */
export function hintButtonKind(s: HintState): "reveal" | "hide" | "none" {
  if (s.total === 0) return "none";
  return s.revealed < s.total ? "reveal" : "hide";
}

/** The slice of hints to show for a state (defensive against a stale state). */
export function visibleHints<T>(hints: readonly T[], s: HintState): T[] {
  return hints.slice(0, Math.max(0, Math.min(s.revealed, hints.length)));
}
