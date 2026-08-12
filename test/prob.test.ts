import { describe, expect, it } from "vitest";
import { sampleFrom, softmaxTopK } from "../src/lib/prob";

function logits(values: Record<number, number>, size = 100): Float32Array {
  const arr = new Float32Array(size).fill(-100);
  for (const [i, v] of Object.entries(values)) arr[Number(i)] = v;
  return arr;
}

describe("softmaxTopK", () => {
  it("returns top-k sorted with probabilities summing to 1", () => {
    const dist = softmaxTopK(logits({ 1: 5, 2: 4, 3: 3, 4: 2 }), 3, 1);
    expect(dist.map((d) => d.id)).toEqual([1, 2, 3]);
    expect(dist.reduce((a, d) => a + d.p, 0)).toBeCloseTo(1, 5);
    expect(dist[0].p).toBeGreaterThan(dist[1].p);
  });

  it("low temperature sharpens, high temperature flattens", () => {
    const l = logits({ 1: 5, 2: 4 });
    const cold = softmaxTopK(l, 2, 0.2);
    const hot = softmaxTopK(l, 2, 2.0);
    expect(cold[0].p).toBeGreaterThan(hot[0].p);
    expect(hot[0].p).toBeGreaterThan(0.5); // still the favourite
    expect(cold[0].p).toBeGreaterThan(0.98); // near-deterministic when cold
  });
});

describe("sampleFrom", () => {
  it("respects the distribution boundaries", () => {
    const dist = [
      { id: 7, p: 0.7 },
      { id: 8, p: 0.3 },
    ];
    expect(sampleFrom(dist, 0.0).id).toBe(7);
    expect(sampleFrom(dist, 0.69).id).toBe(7);
    expect(sampleFrom(dist, 0.71).id).toBe(8);
    expect(sampleFrom(dist, 0.999).id).toBe(8);
  });
});
