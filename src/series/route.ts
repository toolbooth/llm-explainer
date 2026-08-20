/**
 * Hash routing with zero dependencies, in the spirit of the i18n store: a
 * useSyncExternalStore over `hashchange`. Exactly two routes today —
 *
 *   #/essays…        → the series index
 *   everything else  → essay #1, untouched at the root URL
 *
 * When essay #2 ships, this file learns to resolve `#/essays/<slug>` against
 * the registry's published entries; until then unknown slugs fall back to
 * the index rather than a broken page.
 */
import { useSyncExternalStore } from "react";

export type Route = "essay" | "index";

function subscribe(fn: () => void): () => void {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
}

function getSnapshot(): Route {
  return /^#\/essays(\/|$)/.test(location.hash) ? "index" : "essay";
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
