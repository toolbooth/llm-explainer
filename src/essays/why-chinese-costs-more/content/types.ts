import type { ReactNode } from "react";
import type { XrayTokenizerStrings } from "../../why-it-cant-count/TokenizerXray";

/**
 * Every piece of essay #7's prose and chrome, per language — the flagship's
 * content-architecture pattern, replicated rather than shared (each essay
 * owns its prose; see src/series/README.md §3). Both locales satisfy this
 * interface, so key parity is a compile error, and test/essay7-content.test.ts
 * re-checks it deeply at runtime.
 *
 * THIS essay's inverted convention (essays/07-why-chinese-costs-more/
 * OUTLINE.md): the 中文 table is the PRIMARY text — written first, at full
 * rhetorical strength — and en.tsx is the companion rewrite. The
 * architecture is unchanged; only the writing order and where the strongest
 * prose lives.
 *
 * Deliberately NOT in here: the bilingual pairs the widgets weigh. They are
 * live data flowing through the tokenizer, identical in both locales, and
 * live in corpus.ts (imported by the page AND by the CI data test).
 */

/** Chrome for the Meter widget — essay #7's one new component. */
export interface MeterStrings {
  num: string;
  title: string;
  /** Shown until the shared tokenizer resolves (no model is ever loaded). */
  loading: string;
  /** Label over the English pan of the scale. */
  sideEn: string;
  /** Label over the 中文 pan. */
  sideZh: string;
  /** e.g. "43 tokens". */
  count: (n: number) => string;
  /** e.g. "2.1% of a 2048-token window" — pct pre-formatted to one decimal. */
  share: (pct: string) => string;
  /** Caption under the big ×N.N ratio, e.g. "中文 43 ÷ 英文 14". */
  ratioCaption: (zh: number, en: number) => string;
  note: () => ReactNode;
}

export interface Essay7Strings {
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
  sec1: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: MeterStrings };
  sec2: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: XrayTokenizerStrings };
  sec3: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: MeterStrings };
  /** Act 4 is prose-only (the flagship's act-6/act-7 precedent). */
  sec4: { heading: string; p1: () => ReactNode; p2: () => ReactNode };
  outro: { heading: string; p1: () => ReactNode; p2: () => ReactNode; p3: () => ReactNode };

  footer: () => ReactNode;
}
