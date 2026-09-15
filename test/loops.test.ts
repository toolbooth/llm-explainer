import { describe, expect, it } from "vitest";
import { findRepeats, mulberry32, MIN_N } from "../src/essays/why-it-repeats/loops";

/**
 * Essay #5's pure repeat-detection (loops.ts) — the machinery behind the
 * Parrot's highlighting and verdict. No model: synthetic id sequences shaped
 * like the measured greedy outputs (test/essay5-data.test.ts checks the same
 * detector against the real model's continuations).
 */

describe("findRepeats", () => {
  it("finds nothing in text without repeats", () => {
    const r = findRepeats([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(r.groups).toEqual([]);
    expect(r.dominant).toBeNull();
    expect(r.tokenGroup).toEqual(new Array(8).fill(-1));
  });

  it("reports a chant as its smallest unit — «lap» × 3, never «lap lap» × 2", () => {
    // three full 8-token laps + the start of a fourth (the man-said shape)
    const lap = [921, 423, 284, 307, 8161, 290, 25923, 13];
    const ids = [...lap, ...lap, ...lap, 921];
    const r = findRepeats(ids);
    expect(r.dominant).not.toBeNull();
    expect(r.dominant!.unit).toEqual(lap);
    expect(r.dominant!.starts).toEqual([0, 8, 16]);
  });

  it("a 6-token cycle repeated five times dominates its own doubled version", () => {
    const unit = [632, 373, 2266, 290, 4171, 13];
    const ids = [7, 8, 9, ...unit, ...unit, ...unit, ...unit, ...unit, 632, 373, 407];
    const r = findRepeats(ids);
    expect(r.dominant!.length).toBe(6);
    expect(r.dominant!.starts.length).toBe(5);
    // the frayed sixth lap (632, 373, 407) stays unhighlighted
    expect(r.tokenGroup.slice(-1)[0]).toBe(-1);
  });

  it("ties between equal-coverage candidates go to the longer unit, and leftovers form their own group", () => {
    // "They slid down the slide." ×2 (6-gram, covers 12) vs " the slide." ×4 (3-gram, covers 12):
    // the 6-gram wins the tie, the two 3-gram occurrences outside it still group.
    const six = [1119, 27803, 866, 262, 10649, 13];
    const three = [262, 10649, 13];
    const ids = [50, ...three, 51, ...three, 52, ...six, ...six, 53];
    const r = findRepeats(ids);
    expect(r.dominant!.unit).toEqual(six);
    expect(r.dominant!.starts.length).toBe(2);
    const threeGroup = r.groups.find((g) => g.length === 3);
    expect(threeGroup!.unit).toEqual(three);
    expect(threeGroup!.starts).toEqual([1, 5]);
  });

  it("bigram echoes are below MIN_N and stay unflagged", () => {
    expect(MIN_N).toBe(3);
    const r = findRepeats([1, 2, 9, 1, 2, 8, 1, 2, 7]);
    expect(r.groups).toEqual([]);
  });

  it("catches outright period-1 and period-2 chants (the mock engine's greedy output)", () => {
    const ones = findRepeats([5, 5, 5, 5, 5]);
    expect(ones.dominant!.unit).toEqual([5]);
    expect(ones.dominant!.starts.length).toBe(5);
    const pairs = findRepeats([9, 4, 7, 4, 7, 4, 7]);
    expect(pairs.dominant!.unit).toEqual([4, 7]);
    expect(pairs.dominant!.starts.length).toBe(3);
    expect(pairs.tokenGroup[0]).toBe(-1);
  });

  it("short alternations and pairs below the run thresholds stay unflagged", () => {
    expect(findRepeats([5, 5, 5]).groups).toEqual([]); // ×3 of one token: span 3 < 4
    expect(findRepeats([4, 7, 4, 7]).groups).toEqual([]); // A-B ×2: span 4 < 6
  });
});

describe("mulberry32", () => {
  it("is deterministic per seed and stays in [0, 1)", () => {
    const a = mulberry32(11);
    const b = mulberry32(11);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
    for (const x of seqA) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(mulberry32(12)()).not.toBe(seqA[0]);
  });
});
