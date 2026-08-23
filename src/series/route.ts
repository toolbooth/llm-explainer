/**
 * Hash routing with zero dependencies, in the spirit of the i18n store: a
 * useSyncExternalStore over `hashchange`. Four route shapes —
 *
 *   #/essays/<slug>[/<anchor>] → that essay's page, if the slug is registered
 *   #/essays…                  → the series index (unknown slugs fall back
 *                                here rather than to a broken page)
 *   #/classroom…               → the Classroom Edition (its own sub-router in
 *                                src/classroom/route.ts decides the page)
 *   everything else            → essay #1, untouched at the root URL
 *
 * Reachability is by slug EXISTENCE, not by published status: a draft essay
 * is reviewable live at its direct URL before publication. Drafts stay
 * invisible everywhere else because the listings (SeriesIndex, MoreInSeries)
 * render publishedEssays() only — the two rules meet in test/route.test.ts.
 * The classroom family is likewise never an ESSAYS entry, so it cannot leak
 * into an essay's "More in this series" (test/classroom-route.test.ts).
 */
import { useSyncExternalStore } from "react";
import { ESSAYS } from "./registry";

export type Route = "flagship" | "index" | "classroom" | `essay:${string}`;

/** Pure hash → route resolution, exported for tests. */
export function resolveHash(hash: string): Route {
  const m = /^#\/essays\/([^/?#]+)/.exec(hash);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    if (ESSAYS.some((e) => e.slug === slug)) return `essay:${slug}`;
    return "index";
  }
  if (/^#\/essays(\/|$)/.test(hash)) return "index";
  if (/^#\/classroom(\/|$)/.test(hash)) return "classroom";
  return "flagship";
}

function subscribe(fn: () => void): () => void {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
}

function getSnapshot(): Route {
  return resolveHash(location.hash);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
