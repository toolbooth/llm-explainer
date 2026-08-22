import type { ReactNode } from "react";
import type { ChopperStrings } from "../../../acts/Chopper";
import type { GambleStrings } from "../../../acts/Gamble";

/**
 * Every piece of essay #4's prose and chrome, per language — the flagship's
 * content-architecture pattern, replicated rather than shared (each essay
 * owns its prose; see src/series/README.md §3). Both locales satisfy this
 * interface, so key parity is a compile error, and test/essay4-content.test.ts
 * re-checks it deeply at runtime.
 *
 * Deliberately NOT in here: the default word/letter and the preset prompts
 * fed to the widgets. Those are live data flowing through English-trained
 * models and stay English in every locale (the zh prose says so in §1).
 */

/** Chrome for the TokenizerXray widget — essay #4's one new component. */
export interface XrayStrings {
  num: string;
  title: string;
  wordLabel: string;
  letterLabel: string;
  loadingTokenizer: string;
  /** Row label: the characters the reader sees. */
  youSee: string;
  /** Row label: the pieces the model receives. */
  modelSees: string;
  /** e.g. "10 letters · 3 × “r”". */
  letterTally: (letters: number, count: number, letter: string) => string;
  /** e.g. "3 pieces". */
  pieceTally: (pieces: number) => string;
  /** The insight line under the two rows. `carriers` = ids of the pieces that carry the letter. */
  insight: (a: { letters: number; count: number; letter: string; pieces: number; carriers: number[] }) => ReactNode;
  // model gate (same shape as the Gamble's)
  gateIntro: string;
  loadError: string;
  tryAgain: string;
  wakeModel: string;
  /** Runs both prompts. */
  run: string;
  running: string;
  straightHeading: string;
  spelledHeading: string;
  /** Caption above the verbatim prompt. */
  promptLabel: string;
  /** Legend under a histogram, e.g. "true count: 3". */
  truthLabel: (truth: number) => string;
  /** Mass on non-digit tokens, e.g. "other tokens: 12%". */
  otherMass: (pct: string) => string;
  verdictHit: (digit: number) => ReactNode;
  verdictMiss: (digit: number, truth: number) => ReactNode;
  /** No digit among the top candidates at all. */
  verdictNone: string;
  /** Caption for the raw top-token line. */
  rawTop: string;
  note: () => ReactNode;
}

export interface Essay4Strings {
  // document chrome
  docTitle: string;
  metaDescription: string;
  htmlLang: string;

  // hero
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
  };

  // prose
  intro: { p1: () => ReactNode; p2: () => ReactNode };
  sec1: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: ChopperStrings };
  sec2: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: XrayStrings };
  sec3: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: GambleStrings };
  sec4: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: GambleStrings };
  outro: { heading: string; p1: () => ReactNode; p2: () => ReactNode; p3: () => ReactNode };

  footer: () => ReactNode;
}
