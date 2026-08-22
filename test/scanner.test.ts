import { describe, expect, it } from "vitest";
import {
  LIFT_MIN,
  MIN_SEQ,
  SPECIES_ORDER,
  WASH_MIN,
  countBySpecies,
  groupBySpecies,
  rowEvenness,
  scanHeads,
  scoreHead,
} from "../src/essays/attention-heads/scanner";
import { mockNano } from "../src/lib/nanoEngine";

/** Build a causal [seq, seq] matrix from a per-row rule: row q → weights over k ≤ q (normalized). */
function matrix(seq: number, rule: (q: number, k: number) => number): Float32Array {
  const a = new Float32Array(seq * seq);
  for (let q = 0; q < seq; q++) {
    let sum = 0;
    for (let k = 0; k <= q; k++) {
      a[q * seq + k] = rule(q, k);
      sum += a[q * seq + k];
    }
    for (let k = 0; k <= q; k++) a[q * seq + k] /= sum;
  }
  return a;
}

const uniform = (seq: number) => matrix(seq, () => 1);

describe("scoreHead — the four templates and the evenness test", () => {
  it("a perfect previous-word head is labeled prev, with lift well above an even spread", () => {
    const seq = 6;
    const a = matrix(seq, (q, k) => (q === 0 ? 1 : k === q - 1 ? 1 : 0));
    const r = scoreHead(a, seq, 2, 8);
    expect(r.species).toBe("prev");
    expect(r.layer).toBe(2);
    expect(r.head).toBe(8);
    expect(r.scores.prev.share).toBeCloseTo(1, 6);
    // rows q=2..5 all on the previous token; an even spread would give mean(1/(q+1))
    const base = (1 / 3 + 1 / 4 + 1 / 5 + 1 / 6) / 4;
    expect(r.scores.prev.lift).toBeCloseTo(1 / base, 5);
    expect(r.evidence).toBe(r.scores.prev.lift);
    expect(r.evidence).toBeGreaterThan(LIFT_MIN);
  });

  it("a perfect anchor head is labeled anchor, not prev, even though they coincide at q=1", () => {
    const seq = 6;
    const a = matrix(seq, (_q, k) => (k === 0 ? 1 : 0));
    const r = scoreHead(a, seq, 1, 4);
    expect(r.species).toBe("anchor");
    expect(r.scores.anchor.share).toBeCloseTo(1, 6);
    expect(r.scores.prev.share).toBeCloseTo(0, 6); // prev is measured from q=2, where it differs from first
  });

  it("a perfect self (diagonal) head is labeled self", () => {
    const seq = 5;
    const a = matrix(seq, (q, k) => (k === q ? 1 : 0));
    const r = scoreHead(a, seq, 0, 0);
    expect(r.species).toBe("self");
    expect(r.scores.self.share).toBeCloseTo(1, 6);
  });

  it("a perfect two-back head is labeled prev2, not anchor, even though they coincide at q=2", () => {
    const seq = 7;
    const a = matrix(seq, (q, k) => (q < 2 ? 1 : k === q - 2 ? 1 : 0));
    const r = scoreHead(a, seq, 7, 3);
    expect(r.species).toBe("prev2");
    expect(r.scores.prev2.share).toBeCloseTo(1, 6);
  });

  it("a uniform head is a wash: every lift is 1, evenness is 1", () => {
    const seq = 8;
    const r = scoreHead(uniform(seq), seq, 3, 3);
    expect(r.species).toBe("wash");
    expect(r.entropy).toBeCloseTo(1, 6);
    for (const tpl of ["self", "prev", "prev2", "anchor"] as const) {
      expect(r.scores[tpl].lift).toBeCloseTo(1, 6);
    }
    expect(r.evidence).toBeCloseTo(1, 6);
    expect(r.evidence).toBeGreaterThanOrEqual(WASH_MIN);
  });

  it("a structured head that matches no template is honestly unlabeled, with its nearest miss reported", () => {
    // Offset −3: every row q ≥ 3 puts all its weight three tokens back — not one of the four templates.
    const seq = 8;
    const a = matrix(seq, (q, k) => (q < 3 ? 1 : k === q - 3 ? 1 : 0));
    const r = scoreHead(a, seq, 5, 5);
    expect(r.species).toBe("unlabeled");
    expect(r.entropy).toBeLessThan(WASH_MIN); // far from even
    expect(r.scores[r.closest].lift).toBeLessThan(LIFT_MIN);
    expect(r.evidence).toBe(r.scores[r.closest].lift);
    // q=3's "three back" is token 0, so anchor is the nearest miss
    expect(r.closest).toBe("anchor");
  });

  it("a mild lean below the threshold stays unlabeled rather than being over-labeled", () => {
    // 40% on the previous token, the rest even — a lean a reader could imagine into a stripe.
    const seq = 10;
    const a = matrix(seq, (q, k) => (q === 0 ? 1 : k === q - 1 ? 0.4 : 0.6 / q));
    const r = scoreHead(a, seq, 0, 1);
    expect(r.closest).toBe("prev");
    expect(r.scores.prev.lift).toBeLessThan(LIFT_MIN + 1); // present but modest
    expect(["unlabeled", "wash", "prev"]).toContain(r.species);
    // whatever the verdict, the evidence reported is exactly the number the verdict rests on
    if (r.species === "prev") expect(r.evidence).toBe(r.scores.prev.lift);
    if (r.species === "wash") expect(r.evidence).toBe(r.entropy);
    if (r.species === "unlabeled") expect(r.evidence).toBe(r.scores.prev.lift);
  });
});

describe("rowEvenness", () => {
  it("is 1 for an even row, 0 for a one-hot row, and 1 by convention for row 0", () => {
    const seq = 5;
    expect(rowEvenness(uniform(seq), seq, 4)).toBeCloseTo(1, 6);
    const oneHot = matrix(seq, (q, k) => (k === q ? 1 : 0));
    expect(rowEvenness(oneHot, seq, 4)).toBeCloseTo(0, 6);
    expect(rowEvenness(oneHot, seq, 0)).toBe(1);
  });
});

describe("scanHeads — the census", () => {
  it("returns null for sequences too short for the templates", () => {
    const seq = MIN_SEQ - 1;
    expect(scanHeads([[uniform(seq)]], seq)).toBeNull();
  });

  it("reports every head of every layer in layer-major order", () => {
    const seq = 5;
    const layers = [
      [uniform(seq), matrix(seq, (q, k) => (q === 0 ? 1 : k === q - 1 ? 1 : 0))],
      [matrix(seq, (_q, k) => (k === 0 ? 1 : 0)), uniform(seq)],
    ];
    const reports = scanHeads(layers, seq)!;
    expect(reports.map((r) => [r.layer, r.head])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
    expect(reports.map((r) => r.species)).toEqual(["wash", "prev", "anchor", "wash"]);
  });

  it("covers the full mock model population (8 layers × 16 heads) with a species for every head", () => {
    const ids = Array.from({ length: 12 }, (_, i) => i + 100);
    const { attentions, seq } = mockNano().forward(ids);
    const reports = scanHeads(attentions, seq)!;
    expect(reports).toHaveLength(8 * 16);
    for (const r of reports) {
      expect(SPECIES_ORDER).toContain(r.species);
      expect(Number.isFinite(r.evidence)).toBe(true);
    }
    const counts = countBySpecies(reports);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(128);
  });
});

describe("groupBySpecies / countBySpecies", () => {
  it("buckets by species with every key present, strongest evidence first", () => {
    const seq = 6;
    const strongPrev = matrix(seq, (q, k) => (q === 0 ? 1 : k === q - 1 ? 1 : 0));
    const weakerPrev = matrix(seq, (q, k) => (q === 0 ? 1 : k === q - 1 ? 0.8 : 0.2 / q));
    const reports = scanHeads([[weakerPrev, strongPrev, uniform(seq)]], seq)!;
    const groups = groupBySpecies(reports);
    expect(Object.keys(groups).sort()).toEqual([...SPECIES_ORDER].sort());
    expect(groups.prev.map((r) => r.head)).toEqual([1, 0]); // strongest first
    expect(groups.wash.map((r) => r.head)).toEqual([2]);
    expect(groups.prev2).toEqual([]);
    expect(countBySpecies(reports)).toEqual({ prev: 2, anchor: 0, self: 0, prev2: 0, wash: 1, unlabeled: 0 });
  });
});
