/**
 * Pure logic for the TokenizerXray widget — essay #4's only new algorithmic
 * code, unit-tested without any model or tokenizer dependency.
 *
 * Three jobs: (1) describe a word the way the reader sees it (characters,
 * with the target letter tallied) and the way the model sees it (pieces,
 * each carrying some of those characters); (2) build the counting prompts
 * the model is asked, in one single-line shape so the X-ray's prompt pastes
 * into the Gamble bars unchanged; (3) fold a next-token distribution into a
 * readout over the digits 0–9, which is the honest unit of a "count": the
 * model emits one token, and in the Act-4 vocabulary a number is one digit
 * per token.
 */

/** Longest word the X-ray accepts — keeps the letters row readable and the prompts short. */
export const MAX_WORD = 40;

/** Characters as the reader sees them: code points, so an emoji or a 中文 character is one cell. */
export function chars(word: string): string[] {
  return Array.from(word);
}

/** `strawberry` → `s-t-r-a-w-b-e-r-r-y`: every character becomes its own token in either vocabulary. */
export function spellOut(word: string, sep = "-"): string {
  return chars(word).join(sep);
}

export interface LetterTally {
  count: number;
  /** Indices (in code points) where the letter occurs. */
  positions: number[];
}

/** Case-insensitive tally of one character in a word. An empty letter tallies nothing. */
export function letterTally(word: string, letter: string): LetterTally {
  const target = chars(letter)[0]?.toLowerCase();
  const positions: number[] = [];
  if (target === undefined) return { count: 0, positions };
  chars(word).forEach((c, i) => {
    if (c.toLowerCase() === target) positions.push(i);
  });
  return { count: positions.length, positions };
}

export interface PieceLetters {
  /** Display text of the piece (space markers already made visible by the caller). */
  text: string;
  id: number;
  /** The piece's characters, in order. */
  letters: string[];
  /** Per character: is it the target letter? */
  hits: boolean[];
  /** How many of the target letter this piece carries. */
  count: number;
}

/** Map each piece to the characters it carries and which of them are the target letter. */
export function pieceLetters(pieces: { text: string; id: number }[], letter: string): PieceLetters[] {
  const target = chars(letter)[0]?.toLowerCase();
  return pieces.map((p) => {
    const letters = chars(p.text);
    const hits = letters.map((c) => target !== undefined && c.toLowerCase() === target);
    return { text: p.text, id: p.id, letters, hits, count: hits.filter(Boolean).length };
  });
}

export interface CountingPrompts {
  /** The question as a person would ask it; the word arrives as its usual pieces. */
  straight: string;
  /** The same question with the word spelled out — one token per character. */
  spelled: string;
  /** Spelled out AND tallied in the text, so the final step is copying a count, not computing one. */
  tallied: string;
}

/**
 * Single-line prompts ending in a bare space: in the Act-4 vocabulary a
 * number is preceded by its own space token, so a trailing space puts the
 * very next token on a digit (2026-08-22 census: prompts ending in
 * "Answer:" put half their mass on "\n"/" " instead). Single-line because
 * the Gamble reuse feeds them through an <input>, which strips newlines.
 */
export function countingPrompts(word: string, letter: string): CountingPrompts {
  const { count } = letterTally(word, letter);
  const occurrences = count > 0 ? Array(count).fill(letter).join(", ") : "none";
  return {
    straight: `Q: How many "${letter}" are in "${word}"? A: There are `,
    spelled: `Q: How many "${letter}" are in ${spellOut(word)}? A: There are `,
    tallied: `Q: How many "${letter}" are in "${word}"? A: Spelled out: ${spellOut(word)}. The ${letter}'s: ${occurrences}. So there are `,
  };
}

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

/** A decoded next-token candidate with its probability. */
export interface LabeledProb {
  label: string;
  p: number;
}

export interface DigitReadout {
  /** Probability mass on each digit 0–9 (a bare digit token, or a number word one–nine). */
  digits: number[];
  /** Mass on everything else among the candidates given (newlines, words, punctuation…). */
  other: number;
  /** The digit with the most mass, or null if no candidate was a digit. */
  top: number | null;
  topP: number;
  /** The true count. */
  truth: number;
  /** The digit the true count starts with — what a first-token readout can show when truth ≥ 10. */
  truthDigit: number;
  /** top === truthDigit; null when no digit carried mass. */
  correct: boolean | null;
}

/**
 * Fold a top-k next-token distribution into a digit histogram. Reads the
 * FIRST token only: a "1" may be the start of "10". The mass not among the
 * candidates given is not represented at all — callers pass a generous k.
 */
export function digitReadout(bars: LabeledProb[], truth: number): DigitReadout {
  const digits = new Array<number>(10).fill(0);
  let other = 0;
  for (const b of bars) {
    const key = b.label.trim().toLowerCase();
    if (/^\d$/.test(key)) digits[Number(key)] += b.p;
    else if (key in NUMBER_WORDS) digits[NUMBER_WORDS[key]] += b.p;
    else other += b.p;
  }
  let top: number | null = null;
  let topP = 0;
  digits.forEach((p, d) => {
    if (p > topP) {
      topP = p;
      top = d;
    }
  });
  const truthDigit = Number(String(Math.max(0, Math.floor(truth)))[0]);
  return {
    digits,
    other,
    top,
    topP,
    truth,
    truthDigit,
    correct: top === null ? null : top === truthDigit,
  };
}
