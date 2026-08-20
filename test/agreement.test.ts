import { describe, expect, it } from "vitest";
import { agreeClass, agreementGrid, meanAgreement } from "../src/essays/why-it-lies/agreement";

describe("agreementGrid", () => {
  it("identical samples agree everywhere", () => {
    const grid = agreementGrid([
      [" Paris", ",", " of", " course"],
      [" Paris", ",", " of", " course"],
      [" Paris", ",", " of", " course"],
    ]);
    expect(grid).toHaveLength(3);
    for (const row of grid) for (const tok of row) expect(tok.agree).toBe(1);
    expect(meanAgreement(grid)).toBe(1);
  });

  it("fully scattered samples agree only with themselves (1/k)", () => {
    const grid = agreementGrid([
      [" red"],
      [" blue"],
      [" green"],
      [" gold"],
      [" grey"],
    ]);
    for (const row of grid) expect(row[0].agree).toBeCloseTo(1 / 5, 10);
    expect(meanAgreement(grid)).toBeCloseTo(1 / 5, 10);
  });

  it("majority agreement is fractional per token, position-wise", () => {
    // pos 0: A,A,A,B,C — the three As score 3/5, B and C score 1/5 each.
    const grid = agreementGrid([["A"], ["A"], ["A"], ["B"], ["C"]]);
    expect(grid[0][0].agree).toBeCloseTo(0.6, 10);
    expect(grid[1][0].agree).toBeCloseTo(0.6, 10);
    expect(grid[2][0].agree).toBeCloseTo(0.6, 10);
    expect(grid[3][0].agree).toBeCloseTo(0.2, 10);
    expect(grid[4][0].agree).toBeCloseTo(0.2, 10);
  });

  it("a one-token shift reads as scatter — the documented naive-alignment bias", () => {
    // Same continuation, but sample 2 inserted a token: positions misalign.
    const grid = agreementGrid([
      [" Paris", "."],
      [" in", " Paris", "."],
    ]);
    expect(grid[0][0].agree).toBe(0.5); // " Paris" matches only itself…
    expect(grid[1][1].agree).toBe(0.5); // …and the shifted twin scores the same.
    expect(grid[0][0].agree).toBeLessThan(1);
  });

  it("handles ragged lengths: tail positions past a short row can't match it", () => {
    const grid = agreementGrid([
      [" a", " b", " c"],
      [" a", " b"],
      [" a"],
    ]);
    expect(grid[0][0].agree).toBe(1); // all three rows have " a" at 0
    expect(grid[0][1].agree).toBeCloseTo(2 / 3, 10); // two rows reach position 1
    expect(grid[0][2].agree).toBeCloseTo(1 / 3, 10); // only itself at position 2
  });

  it("empty input yields an empty grid and zero mean", () => {
    expect(agreementGrid([])).toEqual([]);
    expect(meanAgreement([])).toBe(0);
    expect(meanAgreement(agreementGrid([[], [], []]))).toBe(0);
  });
});

describe("agreeClass", () => {
  it("buckets k=5 fractions as the legend describes: 4–5 high, 3 mid, 1–2 low", () => {
    expect(agreeClass(1)).toBe("agree-high");
    expect(agreeClass(0.8)).toBe("agree-high");
    expect(agreeClass(0.6)).toBe("agree-mid");
    expect(agreeClass(0.4)).toBe("agree-low");
    expect(agreeClass(0.2)).toBe("agree-low");
  });
});

describe("meanAgreement", () => {
  it("averages over every token of every row", () => {
    const grid = agreementGrid([
      ["x", "y"],
      ["x", "z"],
    ]);
    // "x" tokens: 1.0 each; "y"/"z": 0.5 each → mean 0.75
    expect(meanAgreement(grid)).toBeCloseTo(0.75, 10);
  });
});
