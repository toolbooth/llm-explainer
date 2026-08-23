import type { ReactNode } from "react";

/**
 * Every piece of essay prose and app chrome, per language. Entries are plain
 * strings, param-taking functions, or JSX-returning functions (for prose with
 * inline <em>/<strong>/<code> markup). Both locales must satisfy this
 * interface, so key parity is enforced at compile time — and again, deeply,
 * at runtime by test/content.test.ts.
 *
 * Deliberately NOT in here: user-typed input, model output, and the default
 * example sentences fed to the widgets. Those are live data flowing through
 * an English-trained model and stay English in every locale.
 */
export interface EssayStrings {
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

  // prose between the widgets
  intro: { p1: () => ReactNode; p2: () => ReactNode };
  afterChopper: { p1: () => ReactNode; p2: () => ReactNode };
  beforeAttention: () => ReactNode;
  beforeGamble: () => ReactNode;
  beforeLoop: () => ReactNode;

  // Act 1 — the Chopper
  act1: {
    num: string;
    title: string;
    placeholder: string;
    loading: string;
    /** "{n} tokens." tally at the head of the widget note. */
    tokenCount: (n: number) => ReactNode;
    /** Shown when "strawberry" appears but got chopped (includes leading separator). */
    choppedNote: (rCount: number) => ReactNode;
    /** Shown when " strawberry" survived as a single token (includes leading separator). */
    wholeTokenNote: () => ReactNode;
  };

  // Act 2 — the Map of Meaning
  act2: {
    num: string;
    title: string;
    loading: (pct: number) => string;
    placeholder: string;
    note: () => ReactNode;
  };

  // Act 3 — the Attention Room
  act3: {
    num: string;
    title: string;
    loading: (pct: number) => string;
    lensHintIdle: string;
    lensHintReading: (word: string) => string;
    layerLabel: string;
    /** Optional caption before the 0–15 head buttons (flagship only). */
    headLabel?: string;
    futureMasked: string;
    diagIntro: string;
    diagPrev: (layer: number, head: number, pct: string) => string;
    diagAnchor: (layer: number, head: number, pct: string) => string;
    diagDiffuse: (layer: number, head: number) => string;
    note: () => ReactNode;
  };

  // Act 4 — the Gamble
  act4: {
    num: string;
    title: string;
    gateIntro: string;
    loadError: string;
    tryAgain: string;
    wakeModel: string;
    think: string;
    tempCareful: string;
    tempChaotic: string;
    roll: string;
    picked: (word: string) => ReactNode;
    note: () => ReactNode;
  };

  // Act 5 — the Loop
  act5: {
    num: string;
    title: string;
    loading: (pct: number) => string;
    stop: string;
    cont: string;
    write: string;
    step: string;
    reset: string;
    legendHigh: string;
    legendMid: string;
    legendLow: string;
    legendHint: string;
    note: () => ReactNode;
  };

  // Act 6 — the Zoom-Out (prose-only act)
  act6: {
    heading: string;
    p1: () => ReactNode;
    scale: { label: string; params: string }[];
    scaleNote: string;
    p2: () => ReactNode;
  };

  // Act 7 — Why It Lies (prose-only act)
  act7: {
    heading: string;
    p1: () => ReactNode;
    p2: () => ReactNode;
    p3: () => ReactNode;
    p4: () => ReactNode;
  };

  /** "Cite this" block at the end of the essay (BibTeX + copy button). */
  cite: CiteStrings;

  footer: () => ReactNode;
}

/** Locale strings for the "Cite this" block; the BibTeX itself is locale-free. */
export interface CiteStrings {
  heading: string;
  /** Copy-to-clipboard button label, and its label right after a successful copy. */
  copy: string;
  copied: string;
  /** The one-line pointer to the forthcoming arXiv preprint. */
  note: string;
}
