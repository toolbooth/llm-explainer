import type { ReactNode } from "react";
import type { ChopperStrings } from "../../../acts/Chopper";
import type { XrayTokenizerStrings } from "../../../essays/why-it-cant-count/TokenizerXray";

/**
 * Every piece of Module 1's prose, per language — the lesson page, the
 * teacher guide, and the unplugged sheet in one table, so the guide renders
 * the page's prompts and hints from the same source (PRODUCT.md §5: "all
 * generated from the same source text"). Both locales satisfy this
 * interface; test/classroom-content.test.ts re-checks it deeply, including
 * array lengths (3 steps × 3 hints, 3 exit questions × 3 sample levels…).
 *
 * Deliberately NOT in here: the hook/step default sentences, the preset
 * chips, the unplugged strips and their verified cuts. Those are live data
 * for an English-trained tokenizer and live in ../data.ts (the zh page says
 * so; the model card line says so on every page).
 */

export interface StepStrings {
  title: string;
  prompt: () => ReactNode;
  /** The one line students copy onto their paper after the step. */
  writeDown: string;
  /** Progressive hints, shown one at a time. */
  hints: string[];
}

export interface M1GuideStrings {
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
  background: { paras: (() => ReactNode)[]; deeper: () => ReactNode };
  plan: { columns: string[]; rows: { time: string; beat: string; what: string }[] };
  unplugged: {
    prose: () => ReactNode;
    /** Teacher script, one entry per round. */
    script: string[];
    answerKeyHeading: string;
    answerKeyNote: () => ReactNode;
    /** e.g. "6 words → 9 pieces" */
    tally: (words: number, pieces: number) => string;
    extensionTally: (chars: number, pieces: number) => string;
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
    items: { q: string; samples: string[] }[];
  };
  extension: { prose: () => ReactNode; debateIntro: string };
  differentiation: {
    ell: { heading: string; intro: string; columns: string[]; glossary: { term: string; zh: string; plain: string }[] };
    nonStem: { heading: string; prompts: string[] };
    advanced: { heading: string; prose: () => ReactNode };
  };
  accessibility: string[];
  embed: { slides: string; canvasIntro: string; canvasNote: string };
}

export interface M1SheetStrings {
  docTitle: string;
  title: string;
  subtitle: string;
  nameLine: string;
  materials: { heading: string; items: string[] };
  rounds: { heading: string; items: string[] };
  strips: { heading: string; cutLabel: string; extensionLabel: string };
  questions: { heading: string; items: string[] };
  teacherNote: () => ReactNode;
}

export interface M1Strings {
  docTitle: string;
  metaDescription: string;
  title: string;
  /** The module's core question (rendered under the title). */
  question: string;
  /** Module-specific addendum to the shared model-card line. */
  modelNote: () => ReactNode;

  hook: { teacherLine: () => ReactNode; prose: () => ReactNode; widget: ChopperStrings };
  unplugged: { prose: () => ReactNode; link: string };
  explore: {
    intro: () => ReactNode;
    steps: StepStrings[];
    step1Widget: ChopperStrings;
    step2Widget: ChopperStrings;
    step3Widget: XrayTokenizerStrings;
  };
  evaluate: { prose: () => ReactNode; questions: string[]; paperNote: string };
  exit: { prose: () => ReactNode; questions: string[] };
  extension: { prose: () => ReactNode; widget: ChopperStrings; debate: () => ReactNode };
  goDeeper: () => ReactNode;

  guide: M1GuideStrings;
  sheet: M1SheetStrings;
}
