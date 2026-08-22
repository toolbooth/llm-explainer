/**
 * The essay registry for the "Inside the Machine" series.
 *
 * One entry per essay, in publication order. Only `status: "published"`
 * entries are ever reader-visible (series index, "More in this series");
 * drafts exist so upcoming essays can be planned and wired without leaking
 * into the UI. Flip a draft to "published" and it appears everywhere at once.
 */

export type EssayStatus = "published" | "draft";

export interface EssayMeta {
  /** Stable internal id — never changes once assigned. */
  id: string;
  /** URL slug. "" is reserved for the flagship, which lives at the root URL. */
  slug: string;
  /** Reader-facing title per locale. */
  title: { en: string; zh: string };
  status: EssayStatus;
}

export const ESSAYS: readonly EssayMeta[] = [
  {
    id: "inside-the-machine",
    slug: "",
    title: { en: "Inside the Machine", zh: "ChatGPT 到底在想什么" },
    status: "published",
  },
  {
    id: "why-it-lies",
    slug: "why-it-lies",
    title: { en: "Why It Lies", zh: "它为什么说谎" },
    status: "draft",
  },
  {
    id: "attention-heads",
    slug: "attention-heads",
    title: { en: "The Attention-Head Field Guide", zh: "野生 attention head 图鉴" },
    status: "draft",
  },
  {
    id: "why-it-cant-count",
    slug: "why-it-cant-count",
    title: { en: "Why It Can't Count", zh: "为什么 AI 数不出 strawberry 有几个 r" },
    status: "draft",
  },
];

/** The reader-visible slice of the registry, in publication order. */
export function publishedEssays(): EssayMeta[] {
  return ESSAYS.filter((e) => e.status === "published");
}

/**
 * In-app href for an essay. The flagship's "#/" clears the route hash without
 * a page reload (and without dropping ?lang=/?mockModel= query params);
 * later essays live behind "#/essays/<slug>".
 */
export function essayHref(essay: EssayMeta): string {
  return essay.slug === "" ? "#/" : `#/essays/${essay.slug}`;
}
