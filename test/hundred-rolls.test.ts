import { describe, expect, it } from "vitest";
import {
  DICE_CELLS,
  ROLLS_PER_PRESS,
  TOP_K,
  addCounts,
  diceCells,
  diceFor,
  diceGrid,
  distributionAt,
  mulberry32,
  rollMany,
  tally,
} from "../src/classroom/m2/rolls";
import { CLASSROOM } from "../src/classroom/config";
import { softmaxTopK } from "../src/lib/prob";

/**
 * Hundred Rolls' pure logic (PRODUCT.md §4.2 M2). No model, no DOM: a
 * fixed distribution and a seeded generator, so every number is pinned.
 */
const dist = [
  { id: 1, p: 0.5 },
  { id: 2, p: 0.3 },
  { id: 3, p: 0.2 },
];

function logits(values: Record<number, number>, size = 64): Float32Array {
  const arr = new Float32Array(size).fill(-100);
  for (const [i, v] of Object.entries(values)) arr[Number(i)] = v;
  return arr;
}

describe("constants", () => {
  it("one press is 100 rolls over the top-10, like the Gamble's bars; two dice address 36 cells", () => {
    expect(ROLLS_PER_PRESS).toBe(100);
    expect(TOP_K).toBe(10);
    expect(DICE_CELLS).toBe(36);
  });
});

describe("mulberry32", () => {
  it("is deterministic, in [0, 1), and not constant", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const xs = Array.from({ length: 1000 }, () => a());
    const ys = Array.from({ length: 1000 }, () => b());
    expect(xs).toEqual(ys);
    for (const x of xs) expect(x >= 0 && x < 1).toBe(true);
    expect(new Set(xs).size).toBeGreaterThan(990);
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
    expect(mean).toBeGreaterThan(0.45);
    expect(mean).toBeLessThan(0.55);
  });
});

describe("rollMany", () => {
  it("counts sum to n and follow the distribution exactly for an evenly spaced generator", () => {
    // rand walks 0.005, 0.015, … 0.995: 50 land under 0.5, 30 in [0.5, 0.8), 20 above.
    let i = 0;
    const grid = () => (i++ + 0.5) / 100;
    expect(rollMany(dist, 100, grid)).toEqual([50, 30, 20]);
  });

  it("is reproducible with a seed and sums to n", () => {
    const a = rollMany(dist, ROLLS_PER_PRESS, mulberry32(2026));
    const b = rollMany(dist, ROLLS_PER_PRESS, mulberry32(2026));
    expect(a).toEqual(b);
    expect(a.reduce((s, x) => s + x, 0)).toBe(100);
    expect(a).toHaveLength(3);
  });

  it("converges: the empirical share approaches p as n grows (law of large numbers, seeded)", () => {
    const share = (n: number) => rollMany(dist, n, mulberry32(7))[0] / n;
    const e100 = Math.abs(share(100) - 0.5);
    const e10000 = Math.abs(share(10000) - 0.5);
    expect(e10000).toBeLessThan(e100);
    expect(e10000).toBeLessThan(0.02);
  });

  it("handles an empty distribution and a rand that rounds past the mass", () => {
    expect(rollMany([], 10)).toEqual([]);
    expect(rollMany(dist, 3, () => 0.999999999)).toEqual([0, 0, 3]);
  });
});

describe("addCounts", () => {
  it("accumulates presses element-wise and tolerates an empty first tally", () => {
    expect(addCounts([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(addCounts([1, 2, 3], [10, 0, 5])).toEqual([11, 2, 8]);
  });
});

describe("tally", () => {
  it("pairs every entry with its expected count, share and the winner", () => {
    const t = tally(dist, [45, 35, 20]);
    expect(t.n).toBe(100);
    expect(t.rows.map((r) => r.expected)).toEqual([50, 30, 20]);
    expect(t.rows.map((r) => r.freq)).toEqual([0.45, 0.35, 0.2]);
    expect(t.winner).toBe(0);
    expect(t.favouriteWon).toBe(true);
    expect(t.distinct).toBe(3);
    // TVD = (|0.45-0.5| + |0.35-0.3| + 0) / 2
    expect(t.tvd).toBeCloseTo(0.05, 10);
  });

  it("reports when the favourite loses, and ties go to the likelier entry", () => {
    const lost = tally(dist, [20, 60, 20]);
    expect(lost.winner).toBe(1);
    expect(lost.favouriteWon).toBe(false);
    const tie = tally(dist, [40, 40, 20]);
    expect(tie.winner).toBe(0);
  });

  it("before any roll: n = 0, no winner, distance 1", () => {
    const t = tally(dist, []);
    expect(t.n).toBe(0);
    expect(t.winner).toBeNull();
    expect(t.favouriteWon).toBe(false);
    expect(t.tvd).toBe(1);
    expect(t.rows.map((r) => r.count)).toEqual([0, 0, 0]);
  });
});

describe("distributionAt", () => {
  it("is the Gamble's top-10 temperature softmax, clamped to the classroom cap", () => {
    const lg = logits({ 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 0.5, 7: 0.4, 8: 0.3, 9: 0.2, 10: 0.1, 11: 0.05, 12: 0 });
    const d = distributionAt(lg, 1.0);
    expect(d).toHaveLength(TOP_K);
    expect(d.map((x) => x.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(d.reduce((s, x) => s + x.p, 0)).toBeCloseTo(1, 6);
    expect(d).toEqual(softmaxTopK(lg, 10, 1.0));
    // asking for T = 2 (the flagship's max) gives the T = 1.5 distribution in classroom mode
    expect(distributionAt(lg, 2)).toEqual(softmaxTopK(lg, 10, CLASSROOM.maxTemperature));
    expect(distributionAt(lg, 2)[0].p).toBeGreaterThan(softmaxTopK(lg, 10, 2)[0].p);
    // and an explicit cap is honoured
    expect(distributionAt(lg, 2, 2)).toEqual(softmaxTopK(lg, 10, 2));
    // colder sharpens
    expect(distributionAt(lg, 0.5)[0].p).toBeGreaterThan(distributionAt(lg, 1.5)[0].p);
  });
});

describe("dice tables", () => {
  it("allocates 36 cells by largest remainder; full mass leaves no 'other' cell", () => {
    const { alloc, other } = diceCells([0.5, 0.3, 0.2]);
    expect(alloc).toEqual([18, 11, 7]);
    expect(other).toBe(0);
    expect(alloc.reduce((a, b) => a + b, 0) + other).toBe(36);
  });

  it("the measured hook prompt's table: the favourite owns 8 cells of 36, and the table is full", () => {
    // "The cat sat on the" at T = 1 (data.ts, measured 2026-08-22)
    const p = [0.2173, 0.1524, 0.1328, 0.1166, 0.1158, 0.0652, 0.0529, 0.0512, 0.0482, 0.0475];
    const { alloc, other } = diceCells(p);
    expect(alloc).toEqual([8, 5, 5, 4, 4, 2, 2, 2, 2, 2]);
    expect(other).toBe(0);
  });

  it("partial mass leaves 'anything else' cells; a sub-half-cell entry may get 0", () => {
    const { alloc, other } = diceCells([0.5, 0.25, 0.01]);
    expect(alloc).toEqual([18, 9, 0]);
    expect(other).toBe(9);
    expect(alloc.reduce((a, b) => a + b, 0) + other).toBe(36);
  });

  it("lays the grid out favourite-first in reading order and maps cells to two dice", () => {
    const { alloc, other } = diceCells([0.5, 0.25, 0.01]);
    const grid = diceGrid(alloc, other);
    expect(grid).toHaveLength(36);
    expect(grid.slice(0, 18).every((g) => g === 0)).toBe(true);
    expect(grid.slice(18, 27).every((g) => g === 1)).toBe(true);
    expect(grid.slice(27).every((g) => g === -1)).toBe(true);
    expect(diceFor(0)).toEqual({ first: 1, second: 1 });
    expect(diceFor(5)).toEqual({ first: 1, second: 6 });
    expect(diceFor(6)).toEqual({ first: 2, second: 1 });
    expect(diceFor(35)).toEqual({ first: 6, second: 6 });
    expect(() => diceGrid([1, 2], 0)).toThrow(/36/);
  });
});

// ── time-based animation step (REVIEW-CLASSROOM-2 open question 1) ─────────
import { ROLL_ANIMATION_MS, rollsDue } from "../src/classroom/m2/rolls";

describe("rollsDue — the time-based step behind the animated press", () => {
  it("lands everything at once when there is no animation (reduced motion, hidden tab)", () => {
    expect(rollsDue(0, 0)).toBe(ROLLS_PER_PRESS);
    expect(rollsDue(5, -1)).toBe(ROLLS_PER_PRESS);
    expect(rollsDue(0, NaN)).toBe(ROLLS_PER_PRESS);
  });

  it("is proportional to elapsed time, floors, and never exceeds the total", () => {
    expect(rollsDue(0, ROLL_ANIMATION_MS)).toBe(0);
    expect(rollsDue(-10, ROLL_ANIMATION_MS)).toBe(0);
    expect(rollsDue(ROLL_ANIMATION_MS / 2, ROLL_ANIMATION_MS)).toBe(50);
    expect(rollsDue(ROLL_ANIMATION_MS / 4 + 1, ROLL_ANIMATION_MS)).toBe(25);
    expect(rollsDue(ROLL_ANIMATION_MS, ROLL_ANIMATION_MS)).toBe(ROLLS_PER_PRESS);
    // a throttled background timer that fires a second (or a minute) late finds everything due
    expect(rollsDue(1000, ROLL_ANIMATION_MS)).toBe(ROLLS_PER_PRESS);
    expect(rollsDue(60_000, ROLL_ANIMATION_MS)).toBe(ROLLS_PER_PRESS);
    expect(rollsDue(350, 700, 36)).toBe(18);
  });

  it("is monotone, so a sequence of ticks only ever adds rolls", () => {
    let prev = 0;
    for (let t = 0; t <= 2 * ROLL_ANIMATION_MS; t += 13) {
      const due = rollsDue(t, ROLL_ANIMATION_MS);
      expect(due).toBeGreaterThanOrEqual(prev);
      expect(due).toBeLessThanOrEqual(ROLLS_PER_PRESS);
      prev = due;
    }
    expect(prev).toBe(ROLLS_PER_PRESS);
  });
});
