import type { ReactNode } from "react";
import type { GambleStrings } from "../../../acts/Gamble";
import type { LoopStrings } from "../../../acts/TheLoop";
import type { HundredRollsStrings } from "../HundredRolls";

/**
 * Every piece of Module 2's prose, per language — the lesson page, the
 * teacher guide, the unplugged dice sheet and the Slides companion in one
 * table, so the guide and the slides render the page's prompts, hints and
 * questions from the same source (PRODUCT.md §5: "all three are generated
 * from the same source text"). Both locales satisfy this interface;
 * test/classroom-content.test.ts re-checks it deeply, including array
 * lengths (3 steps × 3 hints, 3 exit questions × 3 sample levels, 8–12
 * slides…).
 *
 * Deliberately NOT in here: the prompts fed to the model, the preset chips,
 * and every measured probability or roll count. Those are live data for an
 * English-only model and live in ../data.ts; prose that quotes a number
 * takes it as an argument so the number has one source.
 */

export interface StepStrings {
  title: string;
  prompt: () => ReactNode;
  /** The one line students copy onto their paper after the step. */
  writeDown: string;
  /** Progressive hints, shown one at a time. */
  hints: string[];
}

/** The numbers the prose quotes about the hook prompt — all from data.ts. */
export interface HookFacts {
  /** Decoded favourite, e.g. " grass" (shown trimmed). */
  favourite: string;
  /** Its probability at T = 1, 0.5 and 1.5. */
  p10: number;
  p05: number;
  p15: number;
  /** Favourite's count in the seeded 100-roll run at T = 1, 0.5, 1.5. */
  run10: number;
  run05: number;
  run15: number;
  /** Who won the seeded T = 1.5 run (decoded) and with how many rolls. */
  winner15: string;
  winner15Count: number;
  /** Spread of the favourite's count over ten 100-roll runs. */
  tenMin: number;
  tenMax: number;
  /** 1,000 rolls: favourite's count. */
  thousand: number;
  /** The confident chip "Tom and Lily went to the": " park"'s probability at T = 1 and its count in the seeded run. */
  parkP: number;
  parkRun: number;
  /** "One day, a boy named" → " Tim" at T = 1. */
  timP: number;
  /** The dice spine: " and" after "…the grass", " watched" after "…the grass and" (T = 1). */
  andP: number;
  watchedP: number;
  /** "Once upon a time" → "," and " there" at T = 1 (Step 3's first roll). */
  commaP: number;
  thereP: number;
}

export interface M2GuideStrings {
  docTitle: string;
  title: string;
  subtitle: string;
  /** The §5 per-module outline, items 1–14, as section headings (numbered by the page). */
  sections: {
    glance: string;
    objectives: string;
    standards: string;
    background: string;
    plan: string;
    unplugged: string;
    prompts: string;
    discussion: string;
    misconceptions: string;
    assessment: string;
    extension: string;
    differentiation: string;
    accessibility: string;
    embed: string;
  };
  glance: { label: string; value: string }[];
  objectives: string[];
  standards: { verified: string; rows: { framework: string; id: string; note: string }[]; churn: () => ReactNode };
  background: { paras: ((f: HookFacts) => ReactNode)[]; deeper: () => ReactNode };
  plan: { columns: string[]; rows: { time: string; beat: string; what: string }[] };
  unplugged: {
    prose: () => ReactNode;
    /** Teacher script, one entry per round. */
    script: string[];
    answerKeyHeading: string;
    answerKeyNote: (verifiedOn: string) => ReactNode;
    /** Column headings of the per-table key: word · probability · cells of 36. */
    keyColumns: string[];
    /** "Table 1 — after “The cat sat on the”" */
    tableCaption: (n: number, prompt: string) => string;
    /** How the spine continues: "…then “ grass” was taken as rolled". */
    spineNote: (picked: string) => string;
    /** The row a word with less than half a cell gets. */
    zeroCells: string;
  };
  prompts: { intro: () => ReactNode; deepLinkLabel: string; hintsLabel: string; writeDownLabel: string };
  discussion: { items: string[]; debateTag: string };
  misconceptions: { columns: string[]; rows: { belief: string; shows: string }[] };
  assessment: {
    evalHeading: string;
    evalIntro: () => ReactNode;
    rubricHeading: string;
    levels: string[];
    exitHeading: string;
    /** The three exit questions (the page's, verbatim) with three-level samples; numbers come in from data.ts. */
    items: { q: string; samples: ((f: HookFacts) => string)[] }[];
    /** "What our runs measured" — the paragraph that anchors the samples in data. */
    measured: (f: HookFacts) => ReactNode;
  };
  extension: { prose: (twoPlusTwoFavourite: string, twoPlusTwoP: number, fourP: number) => ReactNode; debateIntro: string };
  differentiation: {
    ell: { heading: string; intro: string; columns: string[]; glossary: { term: string; zh: string; plain: string }[] };
    nonStem: { heading: string; prompts: string[] };
    advanced: { heading: string; prose: () => ReactNode };
  };
  accessibility: string[];
  embed: { slides: () => ReactNode; canvasIntro: string; canvasNote: string };
}

export interface M2SheetStrings {
  docTitle: string;
  title: string;
  subtitle: string;
  nameLine: string;
  materials: { heading: string; items: string[] };
  rounds: { heading: string; items: string[] };
  tables: {
    heading: string;
    /** "Table 1 — after: The cat sat on the" */
    caption: (n: number, prompt: string) => string;
    firstDie: string;
    secondDie: string;
    /** What to do when your roll did not give the bold word the next table assumes. */
    branchNote: string;
    /** Label under the word the next table assumes. */
    assumed: string;
  };
  sentenceLine: string;
  questions: { heading: string; items: string[] };
  teacherNote: () => ReactNode;
}

/** One slide of the print-oriented companion: 8–12 of them. */
export interface SlideStrings {
  title: string;
  /** Bullet lines; the slide renders them large. */
  lines: string[];
  /** Speaker note, printed under the slide; numbers arrive from data.ts. */
  note: (f: HookFacts) => string;
  /** Optional data visual keyed by the page: the hook's bars, the three temperatures, dice table 1, the step deep links. */
  visual?: "hook-bars" | "temp-bars" | "dice" | "steps";
}

export interface M2SlidesStrings {
  docTitle: string;
  title: string;
  subtitle: string;
  /** "Slide 3 of 10" */
  counter: (n: number, total: number) => string;
  notesLabel: string;
  slides: SlideStrings[];
  /** Legend for the temperature slide: "T = 0.5 / 1.0 / 1.5". */
  tempLabel: (t: number) => string;
  /** Legend for the hook bars: "model's list for “The cat sat on the”". */
  barsCaption: (prompt: string) => string;
}

export interface M2Strings {
  docTitle: string;
  metaDescription: string;
  title: string;
  /** The module's core question (rendered under the title). */
  question: string;
  /** Module-specific addendum to the shared model-card line. */
  modelNote: () => ReactNode;

  hook: { teacherLine: () => ReactNode; prose: (f: HookFacts) => ReactNode; widget: GambleStrings };
  unplugged: { prose: () => ReactNode; link: string };
  explore: {
    intro: () => ReactNode;
    steps: StepStrings[];
    step1Widget: GambleStrings;
    step2Widget: HundredRollsStrings;
    step3Widget: LoopStrings;
  };
  evaluate: { prose: () => ReactNode; questions: string[]; paperNote: string };
  exit: { prose: () => ReactNode; questions: string[] };
  extension: { prose: (twoPlusTwoFavourite: string, twoPlusTwoP: number, fourP: number) => ReactNode; widget: GambleStrings; debate: () => ReactNode };
  goDeeper: () => ReactNode;

  guide: M2GuideStrings;
  sheet: M2SheetStrings;
  slides: M2SlidesStrings;
}
