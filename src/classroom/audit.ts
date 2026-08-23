/**
 * The accessibility audit of the Classroom Edition (PRODUCT.md §6.3, §10.1
 * item 5), as data: which routes are audited, in which languages, and the
 * shape of the report `npm run audit:a11y` (scripts/audit-a11y.mjs) writes
 * to dist-a11y/report.json. The script drives axe-core in the machine's
 * Chrome over every target below; the gate is **zero serious or critical
 * WCAG 2.1 A/AA violations on every page in both languages**, and
 * test/a11y-audit.test.ts validates a report on disk against that gate the
 * way the print manifest is validated — a stale or failing report fails,
 * a missing one is skipped (the audit needs a browser; `npm test` does not).
 *
 * What the audit is and is not: axe-core checks what can be checked by
 * machine (names, roles, contrast, structure, keyboard-reachable scroll
 * regions, live-region plumbing). It does not test with a screen reader,
 * and it does not know whether a widget is *usable* from the keyboard —
 * those walks are recorded by hand in REVIEW-CLASSROOM-4.md, and the
 * accessibility statement says which is which.
 */
import type { Lang } from "../content/i18n";
import { ABOUT_SLUGS } from "./about/slugs";
import { availableModules } from "./registry";
import { classroomHref, resolveClassroomHash } from "./route";

export const AUDIT_LANGS: readonly Lang[] = ["en", "zh"];

/** The axe-core tags the gate is scored on: WCAG 2.0 and 2.1, levels A and AA. */
export const AUDIT_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

/** Violations at these impact levels fail the gate; moderate and minor are reported, not gated. */
export const GATED_IMPACTS = ["critical", "serious"] as const;

export interface AuditTarget {
  /** Stable id, e.g. "m2-lesson", "m2-step-2", "about-standards". */
  id: string;
  /** The hash route (#/classroom/…). */
  route: string;
  /**
   * Whether the script should also exercise the page's widgets (reveal
   * hints, roll, step, open tables) before the second axe pass, so the
   * states a student reaches are audited too — lesson pages only.
   */
  exercise: boolean;
}

/** Every classroom route kind, for every available module, plus the shared pages — the audit list. */
export function auditTargets(): AuditTarget[] {
  const out: AuditTarget[] = [{ id: "index", route: classroomHref({ kind: "index" }), exercise: false }];
  for (const m of availableModules()) {
    out.push({ id: `${m.id}-lesson`, route: classroomHref({ kind: "module", id: m.id, step: null }), exercise: true });
    // one deep link per module: the step route is the same page, scrolled — it must audit identically
    out.push({ id: `${m.id}-step-2`, route: classroomHref({ kind: "module", id: m.id, step: 2 }), exercise: false });
    out.push({ id: `${m.id}-guide`, route: classroomHref({ kind: "guide", id: m.id }), exercise: false });
    out.push({ id: `${m.id}-unplugged`, route: classroomHref({ kind: "unplugged", id: m.id }), exercise: false });
    if (m.slides) out.push({ id: `${m.id}-slides`, route: classroomHref({ kind: "slides", id: m.id }), exercise: false });
  }
  for (const slug of ABOUT_SLUGS) out.push({ id: `about-${slug}`, route: classroomHref({ kind: "about", slug }), exercise: false });
  return out;
}

export interface AuditViolation {
  /** axe rule id, e.g. "color-contrast". */
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  help: string;
  helpUrl: string;
  /** How many nodes the rule matched. */
  nodes: number;
  /** The first few CSS selectors, for the review sheet. */
  targets: string[];
}

export interface AuditPage {
  id: string;
  route: string;
  lang: Lang;
  /** "initial" — as loaded; "exercised" — after the script drove the widgets. */
  state: "initial" | "exercised";
  violations: AuditViolation[];
  passes: number;
  incomplete: number;
}

export interface AuditReport {
  generatedAt: string;
  axeVersion: string;
  renderer: string;
  commit: string | null;
  viewport: { width: number; height: number };
  tags: string[];
  pages: AuditPage[];
}

export function isGated(impact: string): boolean {
  return (GATED_IMPACTS as readonly string[]).includes(impact);
}

/** Totals a report's violations by impact, for the summary line and the review sheet. */
export function violationTotals(report: Pick<AuditReport, "pages">): Record<AuditViolation["impact"], number> & { nodes: number } {
  const out = { critical: 0, serious: 0, moderate: 0, minor: 0, nodes: 0 };
  for (const p of report.pages)
    for (const v of p.violations) {
      out[v.impact] += 1;
      out.nodes += v.nodes;
    }
  return out;
}

/**
 * Shape-and-gate check for a report: every target × language present
 * (initial state; exercised state for the targets that ask for it), the
 * WCAG tag set, and **no gated violation anywhere**. Returns the list of
 * problems; empty means the gate is met.
 */
export function validateAuditReport(r: unknown, expected: AuditTarget[] = auditTargets()): string[] {
  const errs: string[] = [];
  if (typeof r !== "object" || r === null) return ["report is not an object"];
  const rep = r as Partial<AuditReport>;
  if (typeof rep.generatedAt !== "string" || Number.isNaN(Date.parse(rep.generatedAt))) errs.push("generatedAt is not an ISO date");
  if (typeof rep.axeVersion !== "string" || !rep.axeVersion) errs.push("axeVersion missing");
  if (typeof rep.renderer !== "string" || !rep.renderer) errs.push("renderer missing");
  if (!(rep.commit === null || typeof rep.commit === "string")) errs.push("commit must be a string or null");
  if (!Array.isArray(rep.tags) || [...AUDIT_TAGS].some((t) => !rep.tags!.includes(t))) errs.push("tags do not cover WCAG 2.0/2.1 A+AA");
  if (!Array.isArray(rep.pages)) return [...errs, "pages is not an array"];
  const seen = new Set<string>();
  for (const p of rep.pages as Partial<AuditPage>[]) {
    const key = `${p.id}.${p.lang}.${p.state}`;
    if (seen.has(key)) errs.push(`duplicate page ${key}`);
    seen.add(key);
    const target = expected.find((t) => t.id === p.id);
    if (!target) errs.push(`unknown target ${p.id}`);
    else if (p.route !== target.route) errs.push(`${key}: route ${p.route} ≠ ${target.route}`);
    if (!AUDIT_LANGS.includes(p.lang as Lang)) errs.push(`${key}: bad lang`);
    if (p.state !== "initial" && p.state !== "exercised") errs.push(`${key}: bad state`);
    if (!Array.isArray(p.violations)) {
      errs.push(`${key}: violations missing`);
      continue;
    }
    for (const v of p.violations as Partial<AuditViolation>[]) {
      if (typeof v.id !== "string" || typeof v.impact !== "string") errs.push(`${key}: malformed violation`);
      else if (isGated(v.impact)) errs.push(`${key}: ${v.impact} violation ${v.id} (${v.nodes ?? "?"} nodes)`);
    }
  }
  for (const t of expected)
    for (const lang of AUDIT_LANGS) {
      if (!seen.has(`${t.id}.${lang}.initial`)) errs.push(`missing ${t.id}.${lang}.initial`);
      if (t.exercise && !seen.has(`${t.id}.${lang}.exercised`)) errs.push(`missing ${t.id}.${lang}.exercised`);
    }
  return errs;
}

/** Sanity: every audited route resolves to the page its id names (the list and the router cannot drift apart). */
export function auditRoutesResolve(targets: AuditTarget[] = auditTargets()): string[] {
  const errs: string[] = [];
  for (const t of targets) {
    const page = resolveClassroomHash(t.route);
    const kind = t.id === "index" ? "index" : t.id.startsWith("about-") ? "about" : t.id.includes("-step-") ? "module" : t.id.split("-")[1] === "lesson" ? "module" : t.id.split("-")[1];
    if (page.kind !== kind) errs.push(`${t.id}: ${t.route} resolves to ${page.kind}, expected ${kind}`);
  }
  return errs;
}
