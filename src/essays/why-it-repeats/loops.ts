/**
 * Pure repeat-detection for essay #5's Parrot widget — no model, no DOM.
 *
 * The widget generates token ids and hands them here; this module finds the
 * exact repeated n-grams in what was ACTUALLY produced (never scripted), so
 * the highlighting can only ever show a loop the model really fell into.
 *
 * Method: collect every n-gram (MIN_N ≤ n ≤ MAX_N) that occurs at least
 * twice without overlapping itself, score each candidate by tokens covered
 * (n × occurrences), then assign greedily — best first, later candidates
 * only where no earlier group already claimed a token. Occurrences of the
 * same n-gram share one group (→ one highlight color); the best-scoring
 * group is the "dominant" repeat the verdict line quotes.
 */

export interface RepeatGroup {
  /** The repeating token ids. */
  unit: number[];
  /** Start indices of the non-overlapping occurrences, ascending. */
  starts: number[];
  /** unit.length, for convenience. */
  length: number;
}

export interface RepeatReport {
  /** Distinct repeated n-grams, dominant first. */
  groups: RepeatGroup[];
  /** Per-token group index into `groups`; -1 = not part of any repeat. */
  tokenGroup: number[];
  /** groups[0] if any repeat was found. */
  dominant: RepeatGroup | null;
}

/** Shortest repeat worth highlighting — "the the" (n < 3) is not a loop. */
export const MIN_N = 3;
export const MAX_N = 20;

interface Candidate {
  n: number;
  starts: number[];
  score: number;
}

/**
 * True when the n-gram carries a period d ≤ n/2 throughout — i.e. it is a
 * window into a smaller unit's chant ("A B A B", but also "A B A B A", two
 * and a half laps). Such candidates are dropped so a chant is always
 * reported as its smallest repeating unit — "«lap» × 5", never
 * "«lap lap la…» × 2".
 */
function hasSmallPeriod(unit: readonly number[]): boolean {
  for (let d = 1; d * 2 <= unit.length; d++) {
    let periodic = true;
    for (let i = d; i < unit.length; i++) {
      if (unit[i] !== unit[i - d]) {
        periodic = false;
        break;
      }
    }
    if (periodic) return true;
  }
  return false;
}

/**
 * Maximal period-1 and period-2 stretches (a single token, or an A-B pair,
 * chanted outright). These fall below MIN_N by construction, so they get
 * their own candidates: unit length 1 (span ≥ 4) or 2 (span ≥ 6).
 */
function runCandidates(ids: readonly number[]): Candidate[] {
  const out: Candidate[] = [];
  for (const p of [1, 2] as const) {
    let i = p;
    while (i < ids.length) {
      let j = i;
      while (j < ids.length && ids[j] === ids[j - p]) j++;
      const span = j - i + p; // tokens covered by the periodic stretch
      // p=2 skips uniform pairs — those are period-1 runs and already counted.
      if (span >= (p === 1 ? 4 : 6) && !(p === 2 && ids[i - 2] === ids[i - 1])) {
        const first = i - p;
        const count = Math.floor(span / p);
        const starts: number[] = [];
        for (let k = 0; k < count; k++) starts.push(first + k * p);
        out.push({ n: p, starts, score: count * p });
      }
      i = j + 1; // a new stretch can begin right after the first mismatch
    }
  }
  return out;
}

/** Longest non-overlapping occurrence lists per n-gram, n in [MIN_N, MAX_N]. */
function candidates(ids: readonly number[]): Candidate[] {
  const out: Candidate[] = runCandidates(ids);
  const maxN = Math.min(MAX_N, Math.floor(ids.length / 2));
  for (let n = MIN_N; n <= maxN; n++) {
    const seen = new Map<string, number[]>();
    for (let i = 0; i + n <= ids.length; i++) {
      const key = ids.slice(i, i + n).join(",");
      const list = seen.get(key);
      if (list) list.push(i);
      else seen.set(key, [i]);
    }
    for (const starts of seen.values()) {
      if (starts.length < 2) continue;
      if (hasSmallPeriod(ids.slice(starts[0], starts[0] + n))) continue;
      // greedy left-to-right non-overlapping selection
      const occ: number[] = [];
      let last = -Infinity;
      for (const s of starts) {
        if (s >= last + n) {
          occ.push(s);
          last = s;
        }
      }
      if (occ.length >= 2) out.push({ n, starts: occ, score: n * occ.length });
    }
  }
  // best first; ties → longer unit first, then earlier occurrence
  return out.sort((a, b) => b.score - a.score || b.n - a.n || a.starts[0] - b.starts[0]);
}

/** Find the exact repeated n-grams in `ids` (the generated tokens). */
export function findRepeats(ids: readonly number[]): RepeatReport {
  const tokenGroup = new Array<number>(ids.length).fill(-1);
  const groups: RepeatGroup[] = [];
  for (const c of candidates(ids)) {
    // claim only occurrences whose tokens are all still free
    const free = c.starts.filter((s) => {
      for (let j = s; j < s + c.n; j++) if (tokenGroup[j] !== -1) return false;
      return true;
    });
    if (free.length < 2) continue;
    const g = groups.length;
    for (const s of free) for (let j = s; j < s + c.n; j++) tokenGroup[j] = g;
    groups.push({ unit: ids.slice(free[0], free[0] + c.n) as number[], starts: free, length: c.n });
  }
  return { groups, tokenGroup, dominant: groups[0] ?? null };
}

/**
 * Seeded PRNG (mulberry32) — the Parrot's dice under `?mockModel=1`, so the
 * mock path is deterministic for tests; the live page rolls Math.random.
 */
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
