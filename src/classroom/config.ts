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
   * this origin (§6.2 "no third-party endpoints at all"). Byte counts are
   * the files on disk — test/tokenizer-locality.test.ts fails if they
   * drift. budgetMB caps weights + tokenizer at 10 MB, the narrow line
   * kept by the §6.1 r3 re-baseline (2026-09-15: whole first visit
   * ≤ 11 MB on disk with the measured 1.38 MB bundle) so the model can
   * never eat the bundle's headroom.
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

/**
 * The classroom site's public origin, no trailing slash. The classroom
 * edition lives on the flagship's own domain under `#/classroom` (not a
 * `classroom.` subdomain): the site went live at insidethemachine.org on
 * 2026-09 via Cloudflare Pages, which satisfies PRODUCT.md §6.2 (a stable
 * domain owned by the author; not `*.github.io` / `*.netlify.app` /
 * `*.vercel.app`). Every embed snippet and clean URL prints from this one
 * constant; if it is ever emptied (a domain move), the embed page falls
 * back to a labelled placeholder instead of inventing a domain
 * (`embedOrigin` below), the same rule the flagship uses for PROMO_URL.
 * Keep in sync with CITE_URL in src/content/citation.ts.
 */
export const CLASSROOM_ORIGIN = "https://insidethemachine.org";

/** What stands in for CLASSROOM_ORIGIN if it is ever unset. */
export const ORIGIN_PLACEHOLDER = "https://classroom.YOUR-DOMAIN";

/**
 * The public repository that hosts the "I taught with this" Discussion
 * board and the issue tracker (PRODUCT.md §8.2) — the same repository as
 * the flagship ("keep the classroom edition in the same repository family
 * so one approval covers it", §9), public since the 2026-09 launch. If it
 * is ever emptied, the evidence page shows the email channel only and
 * says the board is not open yet (`hasRepo` below).
 */
export const CLASSROOM_REPO_URL = "https://github.com/toolbooth/llm-explainer";

/** The author's contact for use reports and accessibility feedback — the CITATION.cff address the front matter already prints. */
export const CLASSROOM_CONTACT_EMAIL = "shenshangyan2001@gmail.com";

/** The Discussion category the template under .github/DISCUSSION_TEMPLATE/ creates. */
export const TAUGHT_DISCUSSION_CATEGORY = "i-taught-with-this";

/** `true` once CLASSROOM_ORIGIN names a real origin. */
export function hasOrigin(origin: string = CLASSROOM_ORIGIN): boolean {
  return /^https:\/\/[^/\s]+$/.test(origin);
}

/** The origin to print: the real one, or the placeholder (with `placeholder: true` so the page can say so). */
export function embedOrigin(origin: string = CLASSROOM_ORIGIN): { origin: string; placeholder: boolean } {
  return hasOrigin(origin) ? { origin, placeholder: false } : { origin: ORIGIN_PLACEHOLDER, placeholder: true };
}

/** `true` once CLASSROOM_REPO_URL names a repository. */
export function hasRepo(url: string = CLASSROOM_REPO_URL): boolean {
  return /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+$/.test(url);
}

/** The Discussions board (one of the two contact surfaces, PRODUCT.md §7.3), or null while the repo is unset. */
export function discussionsUrl(repo: string = CLASSROOM_REPO_URL): string | null {
  return hasRepo(repo) ? `${repo}/discussions` : null;
}

/** Clamp a temperature into the classroom range (slider floor is 0.1 everywhere). */
export function clampTemperature(t: number, max: number = CLASSROOM.maxTemperature): number {
  if (!Number.isFinite(t)) return 1;
  return Math.min(max, Math.max(0.1, t));
}
