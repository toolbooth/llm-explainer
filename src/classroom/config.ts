/**
 * Classroom-mode configuration — PRODUCT.md §4.1 rule 4 and §6.1/§9.
 *
 * One object, imported by every classroom page and by the widgets that take
 * a cap. The flagship and the essays never import this file, so their
 * defaults (and their DOM) are untouched: widgets receive the cap only as an
 * explicit prop from a classroom page.
 */

export const CLASSROOM = {
  /**
   * The 136 MB Act-4 model path is never linked from, or rendered in, a
   * classroom page. Widgets that have a model gate (Gamble, TheLoop's big
   * cousin, the X-ray's counting test) are mounted with their gate off.
   */
  bigModel: false,
  /** Sampling temperature ceiling for every classroom slider (§9: "temperature ≤ 1.5 in classroom mode"). */
  maxTemperature: 1.5,
  /** The live model of the whole series (§4.1 rule 4): TinyStories-1M via nano-lm. */
  model: { name: "TinyStories-1M", params: "1M", weightsMB: 7.5 },
  /**
   * Everything a classroom page may fetch after the page itself, all from
   * this origin (§6.1 page-weight budget ≤ 10 MB incl. weights; §6.2 "no
   * third-party endpoints at all"). Byte counts are the files on disk —
   * test/tokenizer-locality.test.ts fails if they drift.
   */
  assets: {
    tokenizer: {
      path: "/tokenizers/gpt2",
      files: { "tokenizer.json": 2107653, "tokenizer_config.json": 234 },
    },
    weights: { path: "/weights", files: { "tinystories-1m.safetensors": 7502858, "meta.json": 249 } },
    budgetMB: 10,
  },
  /** Designed-for grade band; no student data is collected at any age (§9). */
  gradeBand: "9–14",
  /** Carnegie period and the marked block extension (§4.1 rule 1). */
  minutes: { period: 45, block: 90 },
} as const;

/** Clamp a temperature into the classroom range (slider floor is 0.1 everywhere). */
export function clampTemperature(t: number, max: number = CLASSROOM.maxTemperature): number {
  if (!Number.isFinite(t)) return 1;
  return Math.min(max, Math.max(0.1, t));
}
