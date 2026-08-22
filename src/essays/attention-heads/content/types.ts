import type { ReactNode } from "react";
import type { AttentionRoomStrings } from "../../../acts/AttentionRoom";
import type { Species } from "../scanner";

/**
 * Every piece of essay #3's prose and chrome, per language — the flagship's
 * content-architecture pattern, replicated rather than shared (each essay
 * owns its prose; see src/series/README.md §3). Both locales satisfy this
 * interface, so key parity is a compile error, and test/essay3-content.test.ts
 * re-checks it deeply at runtime.
 *
 * Deliberately NOT in here: the default sentences fed to the widgets. Those
 * are live data flowing through an English-trained model and stay English
 * in every locale (the zh prose says so in §1).
 */

/** Chrome for the HeadScanner widget — essay #3's one new component. */
export interface HeadScannerStrings {
  num: string;
  title: string;
  loading: (pct: number) => string;
  /** Shown when the sentence is too short for the templates (seq < MIN_SEQ). */
  tooShort: string;
  /** The census line: per-species counts out of `total` heads. */
  summary: (counts: Record<Species, number>, total: number) => ReactNode;
  /** Field-guide entry per species: display name (used on chips and bars) and a one-line field mark. */
  species: Record<Species, { name: string; blurb: string }>;
  /** Count badge on a group header, e.g. "9 heads". */
  count: (n: number) => string;
  /** Placeholder for an empty group. */
  none: string;
  /** Chip evidence for a focused label — lift over an even spread, e.g. "2.3× even". */
  evidenceLift: (lift: string) => string;
  /** Chip evidence for a wash — evenness as a percentage. */
  evidenceWash: (pct: string) => string;
  /** Chip evidence for an unlabeled head — the nearest template and its lift. */
  closest: (speciesName: string, lift: string) => string;
  detailHeading: (layer: number, head: number, speciesName: string) => ReactNode;
  /** Detail bar readout for one template: lift and share. */
  scoreValue: (lift: string, sharePct: string) => string;
  entropyLabel: string;
  entropyValue: (pct: string) => string;
  /** States the two thresholds, and that they are ours. */
  thresholdNote: string;
  /** How the thumbnails are shaded. */
  thumbHint: string;
  note: () => ReactNode;
}

export interface Essay3Strings {
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
  sec1: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: AttentionRoomStrings };
  sec2: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: HeadScannerStrings };
  sec3: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: AttentionRoomStrings };
  sec4: { heading: string; p1: () => ReactNode; p2: () => ReactNode; widget: AttentionRoomStrings };
  outro: { heading: string; p1: () => ReactNode; p2: () => ReactNode; p3: () => ReactNode };

  footer: () => ReactNode;
}
