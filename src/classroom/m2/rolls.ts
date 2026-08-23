/**
 * Pure logic for "Hundred Rolls" — the Classroom Edition's one new widget
 * (PRODUCT.md §4.2 M2, §10.1): press once, sample the same position N=100
 * times from the nano model's next-token distribution, and watch the
 * empirical frequencies converge on the model's probabilities. Also the
 * dice-table allocation the unplugged printable is built from.
 *
 * Nothing here touches the DOM or the model: callers pass logits (or a
 * distribution) and a random source, so test/hundred-rolls.test.ts can pin
 * every number with a seeded generator. HundredRolls.tsx is the view (the file is named rolls.ts so it cannot collide with the component on a case-insensitive disk).
 */
import { sampleFrom, softmaxTopK, type TokenProb } from "../../lib/prob";
import { CLASSROOM, clampTemperature } from "../config";

/** One press of the button. */
export const ROLLS_PER_PRESS = 100;
/** The bars shown (and sampled from) — same top-k as the flagship's Gamble. */
export const TOP_K = 10;
/** Two six-sided dice: 36 equally likely cells on the printed table. */
export const DICE_CELLS = 36;

/**
 * The distribution a roll samples from: temperature softmax over the top-k
 * logits, with the temperature clamped into the classroom range (§9:
 * ≤ 1.5). The cap is a parameter so the widget passes the same value it
 * shows on its slider.
 */
export function distributionAt(
  logits: Float32Array,
  temperature: number,
  maxTemperature: number = CLASSROOM.maxTemperature,
  k: number = TOP_K
): TokenProb[] {
  return softmaxTopK(logits, k, clampTemperature(temperature, maxTemperature));
}

/** Small, fast, seedable PRNG (32-bit state) — for tests and the answer key's reproducible runs. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Roll `n` times against `dist`; returns how many rolls landed on each
 * entry (same order as `dist`). `rand` must return uniforms in [0, 1).
 */
export function rollMany(dist: readonly TokenProb[], n: number, rand: () => number = Math.random): number[] {
  const counts = new Array<number>(dist.length).fill(0);
  if (dist.length === 0) return counts;
  const idx = new Map<number, number>(dist.map((d, i) => [d.id, i]));
  for (let r = 0; r < n; r++) {
    const pick = sampleFrom(dist as TokenProb[], rand());
    counts[idx.get(pick.id) ?? dist.length - 1]++;
  }
  return counts;
}

/** Element-wise sum, so a second press accumulates onto the first. */
export function addCounts(a: readonly number[], b: readonly number[]): number[] {
  const out = new Array<number>(Math.max(a.length, b.length)).fill(0);
  for (let i = 0; i < out.length; i++) out[i] = (a[i] ?? 0) + (b[i] ?? 0);
  return out;
}

export interface RollRow {
  id: number;
  /** The model's probability (light bar). */
  p: number;
  /** Rolls that landed here (dark bar = count / n). */
  count: number;
  freq: number;
  /** p × n — what the model "predicted" for this many rolls. */
  expected: number;
}

export interface RollTally {
  n: number;
  rows: RollRow[];
  /** Total variation distance between the empirical and model distributions, 0 (identical) … 1. */
  tvd: number;
  /** Index (into rows) of the entry with the most rolls; null before any roll. Ties → the likelier entry. */
  winner: number | null;
  /** Did the model's favourite (rows[0]) also win the rolls? */
  favouriteWon: boolean;
  /** How many different entries came up at least once. */
  distinct: number;
}

/** Turn counts into the side-by-side table the widget and the answer key show. */
export function tally(dist: readonly TokenProb[], counts: readonly number[]): RollTally {
  const n = counts.reduce((a, b) => a + b, 0);
  const rows: RollRow[] = dist.map((d, i) => {
    const count = counts[i] ?? 0;
    return { id: d.id, p: d.p, count, freq: n > 0 ? count / n : 0, expected: d.p * n };
  });
  let winner: number | null = null;
  if (n > 0) {
    winner = 0;
    for (let i = 1; i < rows.length; i++) if (rows[i].count > rows[winner].count) winner = i;
  }
  return {
    n,
    rows,
    tvd: n > 0 ? rows.reduce((acc, r) => acc + Math.abs(r.freq - r.p), 0) / 2 : 1,
    winner,
    favouriteWon: winner === 0,
    distinct: rows.filter((r) => r.count > 0).length,
  };
}

/**
 * Largest-remainder allocation of `cells` dice outcomes to the listed
 * probabilities. The top-k mass gets round(cells × Σp) cells; whatever is
 * left is the printed "anything else" cell(s) — the long tail students can
 * see but not list. An entry below half a cell may get 0 cells: the answer
 * key says so rather than pretending it is impossible.
 */
export function diceCells(probs: readonly number[], cells: number = DICE_CELLS): { alloc: number[]; other: number } {
  const mass = probs.reduce((a, b) => a + b, 0);
  const target = Math.min(cells, Math.round(cells * mass));
  const raw = probs.map((p) => p * cells);
  const alloc = raw.map(Math.floor);
  let left = target - alloc.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    alloc[i]++;
    left--;
  }
  return { alloc, other: cells - target };
}

/**
 * Lay an allocation out as a 6×6 grid in reading order: cell c ↦ first die
 * = floor(c/6)+1, second die = c%6+1. Entries are indices into `alloc`, or
 * -1 for an "anything else" cell. Contiguous blocks, favourite first, so a
 * student can see at a glance how much of the table each word owns.
 */
export function diceGrid(alloc: readonly number[], other: number, cells: number = DICE_CELLS): number[] {
  const grid: number[] = [];
  alloc.forEach((n, i) => {
    for (let k = 0; k < n; k++) grid.push(i);
  });
  for (let k = 0; k < other; k++) grid.push(-1);
  if (grid.length !== cells) throw new Error(`dice grid has ${grid.length} cells, expected ${cells}`);
  return grid;
}

/** The two dice that address cell `c` (both 1–6). */
export function diceFor(c: number, side: number = 6): { first: number; second: number } {
  return { first: Math.floor(c / side) + 1, second: (c % side) + 1 };
}
