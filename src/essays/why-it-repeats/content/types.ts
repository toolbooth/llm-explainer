import type { ReactNode } from "react";
import type { GambleStrings } from "../../../acts/Gamble";

/**
 * Every piece of essay #5's prose and chrome, per language — the flagship's
 * content-architecture pattern, replicated rather than shared (each essay
 * owns its prose; see src/series/README.md §3). Both locales satisfy this
 * interface, so key parity is a compile error, and test/essay5-content.test.ts
 * re-checks it deeply at runtime.
 *
 * Deliberately NOT in here: the preset prompts fed to the widgets. Those are
 * live data flowing through an English-trained model and stay English in
 * every locale (the zh intro says so); they live in WhyItRepeats.tsx.
 */

/** Chrome for the Parrot widget — essay #5's one new component. */
export interface ParrotStrings {
  num: string;
  title: string;
  loading: (pct: number) => string;
  // run controls (canonical chrome from the flagship's act5 where they overlap)
  write: string;
  stop: string;
  cont: string;
  reset: string;
  /** The greedy toggle's label. */
  greedy: string;
  /**
   * Verdict under the output once a run stops: the dominant repeated span
   * (verbatim, escaped) and how many times it occurred — detected from the
   * actual output, never scripted.
   */
  verdict: (unit: string, count: number) => ReactNode;
  /** Shown after a finished run in which no repeat was detected. */
  noRepeat: string;
  /** Legend chip naming the highlight. */
  legendRepeat: string;
  legendHint: string;
  note: () => ReactNode;
}

export interface Essay5Strings {
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
  sec1: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: ParrotStrings };
  sec2: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: GambleStrings };
  sec3: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: ParrotStrings };
  /** Act 4 is prose-only (the flagship's act-6/act-7 precedent). */
  sec4: { heading: string; p1: () => ReactNode; p2: () => ReactNode };
  outro: { heading: string; p1: () => ReactNode; p2: () => ReactNode; p3: () => ReactNode };

  footer: () => ReactNode;
}
