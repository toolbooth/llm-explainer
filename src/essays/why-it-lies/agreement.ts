/**
 * Pure agreement logic for the ReRoll widget — the essay's only new
 * algorithmic code, unit-tested without any model dependency.
 *
 * The alignment is deliberately naive: token-by-position across the k
 * sampled continuations. A shared answer that shifts by one token therefore
 * reads as scatter — the tool errs toward suspicion, which the essay's §3
 * copy discloses. (A fancier alignment would claim more than a heuristic
 * probe should.)
 */

export interface TokenAgreement {
  text: string;
  /** Fraction of samples (self included) with this exact token at this position — (0, 1]. */
  agree: number;
}

/**
 * For every token of every sample: how many of the k samples put the same
 * token at the same position? Rows may be ragged; positions past a shorter
 * sample's end simply can't match it.
 */
export function agreementGrid(samples: string[][]): TokenAgreement[][] {
  const k = samples.length;
  if (k === 0) return [];
  return samples.map((row) =>
    row.map((tok, i) => ({
      text: tok,
      agree: samples.filter((other) => other[i] === tok).length / k,
    }))
  );
}

/** Bucket an agreement fraction for display. With k=5: 4–5 rolls high, 3 mid, 1–2 low. */
export function agreeClass(agree: number): "agree-high" | "agree-mid" | "agree-low" {
  return agree >= 0.8 ? "agree-high" : agree >= 0.5 ? "agree-mid" : "agree-low";
}

/** Mean agreement over every token of every sample — 0 for an empty grid. */
export function meanAgreement(grid: TokenAgreement[][]): number {
  const toks = grid.flat();
  if (toks.length === 0) return 0;
  return toks.reduce((sum, t) => sum + t.agree, 0) / toks.length;
}
