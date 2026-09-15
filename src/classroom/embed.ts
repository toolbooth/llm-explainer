/**
 * The embed kit (PRODUCT.md §6.4, §10.1 item 6), as pure functions: a
 * clean URL per page and per step for Google Classroom, an `<iframe>`
 * snippet with a fixed height and a fallback link for Canvas / Schoology,
 * and the list of widget surfaces an educator can frame on their own
 * (`#/classroom/embed/<widget>` — the M1 Chopper and the M2 Gamble /
 * Hundred Rolls, each rendered with the classroom configuration and a
 * visible attribution backlink). Rendered by EmbedPage.tsx /
 * EmbedWidgetPage.tsx and by §14 of each teacher guide; pinned by
 * test/embed.test.ts. The origin comes from CLASSROOM_ORIGIN (config.ts):
 * the live site, or a labelled placeholder if it is ever unset.
 */
import type { Lang } from "../content/i18n";
import { CLASSROOM_ORIGIN, embedOrigin } from "./config";
import { availableModules, moduleById, type ModuleMeta } from "./registry";
import { classroomHref, EMBED_WIDGET_IDS, type ClassroomPage, type EmbedWidgetId } from "./route";

/** One embeddable thing: a page or a step of a module. */
export interface EmbedTarget {
  id: string;
  module: ModuleMeta;
  page: ClassroomPage;
  /** iframe height in CSS px — generous, so a lesson page does not scroll twice inside Canvas. */
  height: number;
}

/** Steps per module page (PRODUCT.md §4.3: three guided-exploration prompts). */
export const STEPS_PER_MODULE = 3;

/** Heights by page kind: the lesson page is long; a step lands mid-page, so the frame only needs the widget. */
export const EMBED_HEIGHTS = { module: 900, step: 760, guide: 1200, unplugged: 1100, slides: 900 } as const;

/**
 * Fixed iframe heights for the single-widget surfaces (the docs' promise:
 * “固定高度的 iframe，附一个备用链接” — a fixed-height iframe plus a
 * fallback link). Sized to the widget plus its attribution footer at
 * 100 % width on a desktop LMS page, with headroom for a wrapped preset
 * row; the fallback link under the frame catches anything narrower.
 */
export const WIDGET_HEIGHTS: Record<EmbedWidgetId, number> = {
  chopper: 620,
  gamble: 840,
  "hundred-rolls": 900,
};

/** Which module each widget surface belongs to (its strings and presets come from that module's tables). */
export const WIDGET_MODULE: Record<EmbedWidgetId, "m1" | "m2"> = {
  chopper: "m1",
  gamble: "m2",
  "hundred-rolls": "m2",
};

export interface EmbedWidgetMeta {
  id: EmbedWidgetId;
  module: ModuleMeta;
  page: ClassroomPage;
  height: number;
}

/** The three widget surfaces, in module order (PRODUCT.md's spec: Chopper; Gamble; Hundred Rolls). */
export function embedWidgets(): EmbedWidgetMeta[] {
  return EMBED_WIDGET_IDS.map((id) => ({
    id,
    module: moduleById(WIDGET_MODULE[id])!,
    page: { kind: "embed", widget: id },
    height: WIDGET_HEIGHTS[id],
  }));
}

/** Every module's lesson page, its three steps, its guide, its printable and (M2) its slides. */
export function embedTargets(): EmbedTarget[] {
  const out: EmbedTarget[] = [];
  for (const m of availableModules()) {
    out.push({ id: `${m.id}`, module: m, page: { kind: "module", id: m.id, step: null }, height: EMBED_HEIGHTS.module });
    for (let s = 1; s <= STEPS_PER_MODULE; s++) out.push({ id: `${m.id}-step-${s}`, module: m, page: { kind: "module", id: m.id, step: s }, height: EMBED_HEIGHTS.step });
    out.push({ id: `${m.id}-guide`, module: m, page: { kind: "guide", id: m.id }, height: EMBED_HEIGHTS.guide });
    out.push({ id: `${m.id}-unplugged`, module: m, page: { kind: "unplugged", id: m.id }, height: EMBED_HEIGHTS.unplugged });
    if (m.slides) out.push({ id: `${m.id}-slides`, module: m, page: { kind: "slides", id: m.id }, height: EMBED_HEIGHTS.slides });
  }
  return out;
}

/**
 * The URL a teacher pastes into Google Classroom: origin + the language
 * (so a 中文 class lands in 中文 whatever the device remembers) + the hash
 * route. With no origin configured, the placeholder origin.
 */
export function cleanUrl(page: ClassroomPage, lang: Lang, origin: string = CLASSROOM_ORIGIN): string {
  return `${embedOrigin(origin).origin}/?lang=${lang}${classroomHref(page)}`;
}

/**
 * A same-origin URL for the live previews on the embed-kit page itself:
 * root-relative, so the preview works in dev, on `vite preview` and on the
 * live site alike, and it carries `mockModel=1` through when the outer
 * page runs under it (so `?mockModel=1` renders deterministically — the
 * audit and any snapshotting see the same DOM every time).
 */
export function previewUrl(page: ClassroomPage, lang: Lang, mock: boolean): string {
  return `/?${mock ? "mockModel=1&" : ""}lang=${lang}${classroomHref(page)}`;
}

/** Escape the four characters that matter inside an HTML attribute / text node. */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The Canvas / Schoology snippet: one iframe with a fixed height, no
 * border, fullscreen allowed, a title for assistive technology, and a
 * fallback link underneath (Canvas does not render iframes in its editor;
 * students see the frame in the published page, and the link is what a
 * filtered or framing-blocked device falls back to).
 */
export function embedSnippet(opts: { page: ClassroomPage; lang: Lang; title: string; openLabel: string; height: number; origin?: string }): string {
  const url = cleanUrl(opts.page, opts.lang, opts.origin);
  return `<iframe src="${escapeHtml(url)}" width="100%" height="${opts.height}" style="border:0" title="${escapeHtml(opts.title)}" allow="fullscreen" loading="lazy"></iframe>\n<p><a href="${escapeHtml(url)}">${escapeHtml(opts.openLabel)}</a></p>`;
}
