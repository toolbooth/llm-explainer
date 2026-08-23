/**
 * The shared front matter's route slugs (PRODUCT.md §5 "Front matter
 * (shared)" items 2–8), in the order teachers meet them on the index:
 * `#/classroom/about/<slug>`. Kept free of content imports so the print
 * target list (src/classroom/print.ts) and the router can use it without
 * pulling every document into their module graph.
 */
export const ABOUT_SLUGS = [
  "model-card",
  "privacy",
  "tech-check",
  "standards",
  "policy",
  "accessibility",
  "letter-kit",
] as const;

export type AboutSlug = (typeof ABOUT_SLUGS)[number];

export function isAboutSlug(s: string): s is AboutSlug {
  return (ABOUT_SLUGS as readonly string[]).includes(s);
}
