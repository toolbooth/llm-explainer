import type { ReactNode } from "react";
import type { GambleStrings } from "../../../acts/Gamble";
import type { LoopStrings } from "../../../acts/TheLoop";

/**
 * Every piece of essay #2's prose and chrome, per language — the flagship's
 * content-architecture pattern, replicated rather than shared (each essay
 * owns its prose; see src/series/README.md §3). Both locales satisfy this
 * interface, so key parity is a compile error, and test/essay2-content.test.ts
 * re-checks it deeply at runtime.
 *
 * Deliberately NOT in here: the preset prompts fed to the widgets. Those are
 * live data flowing through English-trained models and stay English in every
 * locale (the zh prose says so in §1).
 */

/** Chrome for the ReRoll widget — essay #2's one new component. */
export interface ReRollStrings {
  num: string;
  title: string;
  gateIntro: string;
  loadError: string;
  tryAgain: string;
  wakeModel: string;
  /** The roll button — fires k samples of the same prompt. */
  roll: string;
  /** Progress line while sampling, e.g. "rolling 3/5…". */
  rolling: (done: number, k: number) => string;
  /** Static reminder that temperature is fixed across the k samples. */
  tempNote: string;
  legendStable: string;
  legendMixed: string;
  legendScatter: string;
  legendHint: string;
  /** One-line readout under the finished grid; pct is 0–100 mean agreement. */
  agreement: (pct: number) => ReactNode;
  note: () => ReactNode;
}

export interface Essay2Strings {
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
  sec1: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: GambleStrings };
  sec2: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: LoopStrings };
  sec3: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: ReRollStrings };
  sec4: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: GambleStrings };
  outro: { heading: string; p1: () => ReactNode; p2: () => ReactNode; p3: () => ReactNode };

  footer: () => ReactNode;
}
