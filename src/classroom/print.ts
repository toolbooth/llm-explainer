/**
 * The printable set of the Classroom Edition (PRODUCT.md §5: guide, front
 * matter and printables "as HTML and printable PDF", §6.4 "Printable PDF of
 * every module for the LMS file drop"), as data: which routes, in which
 * languages, and the shape of the manifest `npm run build:pdf` writes next
 * to the PDFs in dist-pdf/. scripts/build-pdf.mjs loads this module through
 * Vite (ssrLoadModule) so the script and the tests share one list; the
 * lesson pages themselves are deliberately not in it (they are interactive,
 * and the guide carries everything a teacher prints).
 */
import type { Lang } from "../content/i18n";
import { ABOUT_DOCS } from "./about/registry";
import { ABOUT_SLUGS } from "./about/slugs";
import { availableModules } from "./registry";
import { classroomHref } from "./route";

export const PRINT_LANGS: readonly Lang[] = ["en", "zh"];

export interface PrintTarget {
  /** Stable file stem, e.g. "m2-guide", "about-standards". */
  id: string;
  /** The hash route (#/classroom/…). */
  route: string;
  /** Print landscape (the eleven-column crosswalk). */
  landscape: boolean;
}

/** Every guide, printable and slides page of every available module, then the seven front-matter pages. */
export function printTargets(): PrintTarget[] {
  const out: PrintTarget[] = [];
  for (const m of availableModules()) {
    out.push({ id: `${m.id}-guide`, route: classroomHref({ kind: "guide", id: m.id }), landscape: false });
    out.push({ id: `${m.id}-unplugged`, route: classroomHref({ kind: "unplugged", id: m.id }), landscape: false });
    if (m.slides) out.push({ id: `${m.id}-slides`, route: classroomHref({ kind: "slides", id: m.id }), landscape: false });
  }
  for (const slug of ABOUT_SLUGS) {
    out.push({ id: `about-${slug}`, route: classroomHref({ kind: "about", slug }), landscape: ABOUT_DOCS[slug].landscape === true });
  }
  return out;
}

export function pdfFileName(id: string, lang: Lang): string {
  return `${id}.${lang}.pdf`;
}

export interface PdfManifestEntry {
  id: string;
  route: string;
  lang: Lang;
  file: string;
  bytes: number;
  pages: number;
  /** document.title at render time. */
  title: string;
  landscape: boolean;
}

export interface PdfManifest {
  generatedAt: string;
  /** e.g. "chrome 140.0.7339.0 via playwright-core 1.62.1" */
  renderer: string;
  /** The hash of the commit the PDFs were rendered from, if known. */
  commit: string | null;
  pageSize: string;
  entries: PdfManifestEntry[];
}

/**
 * Shape check for a manifest (the script's output, and whatever a later
 * tool reads): every expected target × language present exactly once, file
 * names canonical, every entry with a positive byte and page count.
 * Returns the list of problems; empty means valid.
 */
export function validateManifest(m: unknown, expected: PrintTarget[] = printTargets()): string[] {
  const errs: string[] = [];
  if (typeof m !== "object" || m === null) return ["manifest is not an object"];
  const man = m as Partial<PdfManifest>;
  if (typeof man.generatedAt !== "string" || Number.isNaN(Date.parse(man.generatedAt))) errs.push("generatedAt is not an ISO date");
  if (typeof man.renderer !== "string" || !man.renderer) errs.push("renderer missing");
  if (!(man.commit === null || typeof man.commit === "string")) errs.push("commit must be a string or null");
  if (typeof man.pageSize !== "string") errs.push("pageSize missing");
  if (!Array.isArray(man.entries)) return [...errs, "entries is not an array"];
  const seen = new Set<string>();
  for (const e of man.entries as Partial<PdfManifestEntry>[]) {
    const key = `${e.id}.${e.lang}`;
    if (seen.has(key)) errs.push(`duplicate entry ${key}`);
    seen.add(key);
    const target = expected.find((t) => t.id === e.id);
    if (!target) errs.push(`unknown target ${e.id}`);
    else {
      if (e.route !== target.route) errs.push(`${key}: route ${e.route} ≠ ${target.route}`);
      if (e.landscape !== target.landscape) errs.push(`${key}: landscape flag drifted`);
    }
    if (!PRINT_LANGS.includes(e.lang as Lang)) errs.push(`${key}: bad lang`);
    else if (e.file !== pdfFileName(String(e.id), e.lang as Lang)) errs.push(`${key}: file name ${e.file} not canonical`);
    if (!(typeof e.bytes === "number" && e.bytes > 0)) errs.push(`${key}: bytes`);
    if (!(typeof e.pages === "number" && Number.isInteger(e.pages) && e.pages > 0)) errs.push(`${key}: pages`);
    if (typeof e.title !== "string" || !e.title) errs.push(`${key}: title`);
  }
  for (const t of expected) for (const lang of PRINT_LANGS) if (!seen.has(`${t.id}.${lang}`)) errs.push(`missing ${t.id}.${lang}`);
  return errs;
}

/** Page count of a PDF from its bytes: the number of /Type /Page objects (Chromium writes them uncompressed). */
export function countPdfPages(bytes: Uint8Array): number {
  let text = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) text += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  const m = text.match(/\/Type\s*\/Page(?![s\w])/g);
  return m ? m.length : 0;
}
