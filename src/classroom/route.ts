/**
 * The Classroom Edition's own sub-router. The series router
 * (src/series/route.ts) hands every `#/classroom…` hash here; this module
 * decides the page and builds the hrefs, so the route shapes live in one
 * place:
 *
 *   #/classroom                      → module index
 *   #/classroom/<id>                 → the module's lesson page
 *   #/classroom/<id>/step-<n>        → the lesson page, scrolled to step n
 *   #/classroom/<id>/guide           → the module's teacher guide
 *   #/classroom/<id>/unplugged       → the module's unplugged printable
 *   #/classroom/<id>/slides          → the module's Slides companion (if it has one)
 *   #/classroom/about/<slug>         → a shared front-matter page (src/classroom/about/)
 *   anything else under #/classroom  → module index (never a broken page)
 *
 * Deep links per step are PRODUCT.md §4.1 rule 7: a teacher pastes the
 * step URL into Classroom/Canvas and students land on the right prompt.
 */
import { useSyncExternalStore } from "react";
import { moduleById, type ModuleId } from "./registry";
import { isAboutSlug, type AboutSlug } from "./about/slugs";

export type ClassroomPage =
  | { kind: "index" }
  | { kind: "module"; id: ModuleId; step: number | null }
  | { kind: "guide"; id: ModuleId }
  | { kind: "unplugged"; id: ModuleId }
  | { kind: "slides"; id: ModuleId }
  | { kind: "about"; slug: AboutSlug };

/** Pure hash → classroom page resolution, exported for tests. */
export function resolveClassroomHash(hash: string): ClassroomPage {
  const m = /^#\/classroom(?:\/([^/?#]*))?(?:\/([^/?#]*))?/.exec(hash);
  if (!m || !m[1]) return { kind: "index" };
  const head = decodeURIComponent(m[1]);
  if (head === "about") {
    const slug = m[2] ? decodeURIComponent(m[2]) : "";
    return isAboutSlug(slug) ? { kind: "about", slug } : { kind: "index" };
  }
  const mod = moduleById(head);
  if (!mod || mod.status !== "available") return { kind: "index" };
  const sub = m[2] ? decodeURIComponent(m[2]) : "";
  if (sub === "guide") return { kind: "guide", id: mod.id };
  if (sub === "unplugged") return { kind: "unplugged", id: mod.id };
  if (sub === "slides" && mod.slides) return { kind: "slides", id: mod.id };
  const step = /^step-(\d+)$/.exec(sub);
  return { kind: "module", id: mod.id, step: step ? Number(step[1]) : null };
}

export function classroomHref(page: ClassroomPage): string {
  switch (page.kind) {
    case "index":
      return "#/classroom";
    case "module":
      return page.step === null ? `#/classroom/${page.id}` : `#/classroom/${page.id}/step-${page.step}`;
    case "guide":
      return `#/classroom/${page.id}/guide`;
    case "unplugged":
      return `#/classroom/${page.id}/unplugged`;
    case "slides":
      return `#/classroom/${page.id}/slides`;
    case "about":
      return `#/classroom/about/${page.slug}`;
  }
}

function subscribe(fn: () => void): () => void {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
}

function getHash(): string {
  return location.hash;
}

/** The current classroom page; re-renders on hashchange (e.g. step links). */
export function useClassroomRoute(): ClassroomPage {
  const hash = useSyncExternalStore(subscribe, getHash, getHash);
  return resolveClassroomHash(hash);
}
