import { describe, expect, it } from "vitest";
import {
  MAX_WORD,
  chars,
  countingPrompts,
  digitReadout,
  letterTally,
  pieceLetters,
  spellOut,
} from "../src/essays/why-it-cant-count/xray";

describe("chars / spellOut — the word as the reader sees it", () => {
  it("splits by code point, so an emoji or a 中文 character is one cell", () => {
    expect(chars("strawberry")).toHaveLength(10);
    expect(chars("🍓ab")).toEqual(["🍓", "a", "b"]);
    expect(chars("草莓")).toEqual(["草", "莓"]);
  });

  it("spells a word out one character per token-to-be", () => {
    expect(spellOut("strawberry")).toBe("s-t-r-a-w-b-e-r-r-y");
    expect(spellOut("hi", " ")).toBe("h i");
    expect(spellOut("")).toBe("");
  });
});

describe("letterTally — the count the model is asked for", () => {
  it("counts case-insensitively and reports positions", () => {
    expect(letterTally("strawberry", "r")).toEqual({ count: 3, positions: [2, 7, 8] });
    expect(letterTally("Strawberry", "s").count).toBe(1);
    expect(letterTally("bookkeeper", "E").count).toBe(3);
  });

  it("tallies nothing for an empty or absent letter", () => {
    expect(letterTally("strawberry", "")).toEqual({ count: 0, positions: [] });
    expect(letterTally("strawberry", "z")).toEqual({ count: 0, positions: [] });
  });

  it("uses only the first character of the letter field, by code point", () => {
    expect(letterTally("🍓🍓x", "🍓").count).toBe(2);
    expect(letterTally("strawberry", "rr").count).toBe(3);
  });
});

describe("pieceLetters — the word as the model sees it", () => {
  it("maps each piece to its characters and marks the hits", () => {
    const pieces = [
      { text: "st", id: 301 },
      { text: "raw", id: 1653 },
      { text: "berry", id: 8931 },
    ];
    const out = pieceLetters(pieces, "r");
    expect(out.map((p) => p.count)).toEqual([0, 1, 2]);
    expect(out[1].letters).toEqual(["r", "a", "w"]);
    expect(out[1].hits).toEqual([true, false, false]);
    expect(out[2].hits).toEqual([false, false, true, true, false]);
    expect(out.map((p) => p.id)).toEqual([301, 1653, 8931]);
  });

  it("is case-insensitive and tolerates an empty letter", () => {
    expect(pieceLetters([{ text: "St", id: 1 }], "s")[0].count).toBe(1);
    expect(pieceLetters([{ text: "St", id: 1 }], "")[0].hits).toEqual([false, false]);
  });
});

describe("countingPrompts — one single-line shape, trailing space", () => {
  it("builds the straight, spelled and tallied prompts verbatim", () => {
    const p = countingPrompts("strawberry", "r");
    expect(p.straight).toBe('Q: How many "r" are in "strawberry"? A: There are ');
    expect(p.spelled).toBe('Q: How many "r" are in s-t-r-a-w-b-e-r-r-y? A: There are ');
    expect(p.tallied).toBe(
      'Q: How many "r" are in "strawberry"? A: Spelled out: s-t-r-a-w-b-e-r-r-y. The r\'s: r, r, r. So there are '
    );
  });

  it("never contains a newline (the Gamble feeds them through an <input>) and always ends in a space", () => {
    for (const word of ["strawberry", "banana", "a b", "1234"]) {
      const p = countingPrompts(word, "a");
      for (const s of [p.straight, p.spelled, p.tallied]) {
        expect(s).not.toMatch(/\n/);
        expect(s.endsWith(" ")).toBe(true);
      }
    }
  });

  it("writes 'none' into the tally when the letter is absent", () => {
    expect(countingPrompts("strawberry", "z").tallied).toContain("The z's: none. So there are ");
  });
});

describe("digitReadout — folding a next-token distribution into 0–9", () => {
  it("pools digit tokens and number words, and leaves the rest as other", () => {
    const r = digitReadout(
      [
        { label: "1", p: 0.3 },
        { label: "3", p: 0.25 },
        { label: " three", p: 0.05 },
        { label: "\n", p: 0.2 },
        { label: " The", p: 0.1 },
        { label: "2", p: 0.1 },
      ],
      3
    );
    expect(r.digits[1]).toBeCloseTo(0.3, 9);
    expect(r.digits[3]).toBeCloseTo(0.3, 9); // "3" + " three"
    expect(r.digits[2]).toBeCloseTo(0.1, 9);
    expect(r.other).toBeCloseTo(0.3, 9);
    expect(r.digits.reduce((a, b) => a + b, 0) + r.other).toBeCloseTo(1, 9);
  });

  it("reports the top digit and whether it matches the true count", () => {
    const miss = digitReadout(
      [
        { label: "1", p: 0.4 },
        { label: "3", p: 0.3 },
      ],
      3
    );
    expect(miss.top).toBe(1);
    expect(miss.topP).toBeCloseTo(0.4, 9);
    expect(miss.correct).toBe(false);
    const hit = digitReadout(
      [
        { label: "3", p: 0.4 },
        { label: "1", p: 0.3 },
      ],
      3
    );
    expect(hit.top).toBe(3);
    expect(hit.correct).toBe(true);
  });

  it("has no verdict when nothing in the distribution is a digit", () => {
    const r = digitReadout(
      [
        { label: "\n", p: 0.6 },
        { label: " The", p: 0.4 },
      ],
      3
    );
    expect(r.top).toBeNull();
    expect(r.correct).toBeNull();
    expect(r.other).toBeCloseTo(1, 9);
  });

  it("reads the first digit only: a true count of 12 is judged on its leading 1", () => {
    const r = digitReadout([{ label: "1", p: 0.5 }], 12);
    expect(r.truth).toBe(12);
    expect(r.truthDigit).toBe(1);
    expect(r.correct).toBe(true);
  });

  it("treats a 10-or-more digit token as other — this vocabulary never emits one, and a bare '0' is the digit zero", () => {
    const r = digitReadout(
      [
        { label: "10", p: 0.5 },
        { label: "0", p: 0.5 },
      ],
      0
    );
    expect(r.other).toBeCloseTo(0.5, 9);
    expect(r.digits[0]).toBeCloseTo(0.5, 9);
    expect(r.correct).toBe(true);
  });
});

describe("MAX_WORD", () => {
  it("keeps the spelled-out prompt inside the Gamble's 200-character input", () => {
    const longest = "a".repeat(MAX_WORD);
    expect(countingPrompts(longest, "a").spelled.length).toBeLessThanOrEqual(200);
  });
});
