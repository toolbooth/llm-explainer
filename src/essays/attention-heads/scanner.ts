/**
 * Pure scoring logic for the HeadScanner widget — essay #3's only new
 * algorithmic code, unit-tested without any model dependency.
 *
 * Every head of every layer is held against four cheap positional templates
 * (where does its attention land: on the word itself, the previous word,
 * two words back, or the first token?) plus an evenness test. The evidence
 * score is a LIFT: how many times more weight lands on the template's target
 * than an even spread over the visible tokens would put there. On the
 * 1M-parameter toy no head ever puts half its weight on any single target
 * (head dim is 4), so a raw share would label nothing; lift is the honest
 * relative measure. The thresholds below are design choices, and the essay
 * copy says so.
 *
 * These are heuristic labels from attention statistics — field marks, not
 * claims about what a head computes.
 */

export type FocusedSpecies = "self" | "prev" | "prev2" | "anchor";
export type Species = FocusedSpecies | "wash" | "unlabeled";

export const FOCUSED: readonly FocusedSpecies[] = ["self", "prev", "prev2", "anchor"];
/** Display order for the census: the recognisable species first, the honest piles last. */
export const SPECIES_ORDER: readonly Species[] = ["prev", "anchor", "self", "prev2", "wash", "unlabeled"];

/** A focused label needs this much lift over an even spread. */
export const LIFT_MIN = 1.75;
/** A "wash" needs at least this mean normalized row entropy (1 = perfectly even). */
export const WASH_MIN = 0.9;
/** Shortest sequence the templates can read (prev2 needs a row q ≥ 3). */
export const MIN_SEQ = 4;

export interface TemplateScore {
  /** Mean attention on the template's target over the rows it applies to — (0, 1]. */
  share: number;
  /** share ÷ what an even spread over the visible tokens would give the same target. */
  lift: number;
}

export interface HeadReport {
  layer: number;
  head: number;
  scores: Record<FocusedSpecies, TemplateScore>;
  /** Mean normalized row entropy H/ln(q+1) over rows q ≥ 2 — 1 means perfectly even. */
  entropy: number;
  species: Species;
  /** The focused template with the highest lift (the label, or for unlabeled heads the nearest miss). */
  closest: FocusedSpecies;
  /** Lift of the winning template for focused labels; entropy for a wash; closest lift when unlabeled. */
  evidence: number;
}

/**
 * Row floors keep templates from coinciding on rows where they'd be
 * identical: at q=1 "previous" IS "first", at q=2 "two back" IS "first".
 */
const TEMPLATES: Record<FocusedSpecies, { target: (q: number) => number; qMin: number }> = {
  self: { target: (q) => q, qMin: 1 },
  prev: { target: (q) => q - 1, qMin: 2 },
  prev2: { target: (q) => q - 2, qMin: 3 },
  anchor: { target: () => 0, qMin: 2 },
};

function templateScore(attn: Float32Array, seq: number, tpl: FocusedSpecies): TemplateScore {
  const { target, qMin } = TEMPLATES[tpl];
  let share = 0;
  let base = 0;
  let n = 0;
  for (let q = qMin; q < seq; q++) {
    share += attn[q * seq + target(q)];
    base += 1 / (q + 1);
    n++;
  }
  return { share: share / n, lift: share / base };
}

/** Normalized entropy of one causal row: H(p) / ln(q+1), so a uniform row scores 1. */
export function rowEvenness(attn: Float32Array, seq: number, q: number): number {
  if (q === 0) return 1;
  let h = 0;
  for (let k = 0; k <= q; k++) {
    const p = attn[q * seq + k];
    if (p > 1e-9) h -= p * Math.log(p);
  }
  return h / Math.log(q + 1);
}

/** Score one head's [seq, seq] attention matrix. Assumes seq ≥ MIN_SEQ. */
export function scoreHead(attn: Float32Array, seq: number, layer: number, head: number): HeadReport {
  const scores = {} as Record<FocusedSpecies, TemplateScore>;
  for (const tpl of FOCUSED) scores[tpl] = templateScore(attn, seq, tpl);

  let entropy = 0;
  for (let q = 2; q < seq; q++) entropy += rowEvenness(attn, seq, q);
  entropy /= seq - 2;

  let closest: FocusedSpecies = FOCUSED[0];
  for (const tpl of FOCUSED) if (scores[tpl].lift > scores[closest].lift) closest = tpl;

  let species: Species;
  let evidence: number;
  if (scores[closest].lift >= LIFT_MIN) {
    species = closest;
    evidence = scores[closest].lift;
  } else if (entropy >= WASH_MIN) {
    species = "wash";
    evidence = entropy;
  } else {
    species = "unlabeled";
    evidence = scores[closest].lift;
  }
  return { layer, head, scores, entropy, species, closest, evidence };
}

/**
 * The census: one report per head of every layer, in layer-major order.
 * `null` for sequences too short for the templates to read.
 */
export function scanHeads(attentions: Float32Array[][], seq: number): HeadReport[] | null {
  if (seq < MIN_SEQ) return null;
  const out: HeadReport[] = [];
  for (let l = 0; l < attentions.length; l++) {
    for (let h = 0; h < attentions[l].length; h++) out.push(scoreHead(attentions[l][h], seq, l, h));
  }
  return out;
}

/** Reports bucketed by species (every species key present), strongest evidence first. */
export function groupBySpecies(reports: HeadReport[]): Record<Species, HeadReport[]> {
  const groups = {} as Record<Species, HeadReport[]>;
  for (const s of SPECIES_ORDER) groups[s] = [];
  for (const r of reports) groups[r.species].push(r);
  for (const s of SPECIES_ORDER) groups[s].sort((a, b) => b.evidence - a.evidence);
  return groups;
}

/** Head counts per species, for the census summary line. */
export function countBySpecies(reports: HeadReport[]): Record<Species, number> {
  const counts = {} as Record<Species, number>;
  for (const s of SPECIES_ORDER) counts[s] = 0;
  for (const r of reports) counts[r.species]++;
  return counts;
}
