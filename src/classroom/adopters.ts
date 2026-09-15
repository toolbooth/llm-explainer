/**
 * The public adopter list for #/classroom/taught (PRODUCT.md §8) — a
 * checked-in data file, because the product has no backend: a teacher
 * posts an "I taught with this" report on the Discussion board or emails
 * it, explicitly consents to public listing, and the author lands the
 * entry here as an ordinary commit (which is itself the audit trail).
 * Fields mirror the letter kit's §A report: name or a self-chosen
 * anonymous label, institution optional, course, term, modules. Rules
 * (§8.1): teacher-level only — the shape has no field for student data,
 * on purpose; voluntary and revocable — any entry is removed on request;
 * nothing is listed without recorded consent. test/adopters.test.ts
 * validates every entry against validateAdopters below.
 */
import { CLASSROOM_REPO_URL } from "./config";
import { moduleById, type ModuleId } from "./registry";

export interface Adopter {
  /** Real name, or a self-chosen anonymous label ("anonymous HS teacher, Ohio"). */
  name: string;
  /** Optional; anonymous entries usually omit it. */
  institution?: string;
  /** The course as the teacher stated it ("AP CSP", "Intro to CS", "AI-literacy week"). */
  course: string;
  /** The term as the teacher stated it — must name a year ("Fall 2026"). */
  term: string;
  /** Which modules, in registry order, no repeats. */
  modules: ModuleId[];
  /** Optional one-liner quoted from the report ("one thing that worked"), with permission. */
  note?: string;
  /** Where the report lives: the public Discussion thread, or email (no address is ever published). */
  source: { kind: "discussion"; url: string } | { kind: "email" };
  /** Public-listing consent — explicit, with the date it was recorded (§8.1 rules 3 and 5). */
  consent: { public: true; recorded: string };
}

export const ADOPTERS: readonly Adopter[] = [
  // No entries yet (the site went live 2026-09). The first entry lands
  // here as a commit once a teacher reports use AND consents to public
  // listing — the page at #/classroom/taught says exactly how.
];

/** Schema check for the checked-in data — returns problems; empty means valid. */
export function validateAdopters(list: readonly Adopter[] = ADOPTERS): string[] {
  const errs: string[] = [];
  list.forEach((a, i) => {
    const who = `adopters[${i}]`;
    if (!a.name.trim()) errs.push(`${who}: empty name`);
    if (a.institution !== undefined && !a.institution.trim()) errs.push(`${who}: institution present but empty — omit it instead`);
    if (!a.course.trim()) errs.push(`${who}: empty course`);
    if (!/\d{4}/.test(a.term)) errs.push(`${who}: term "${a.term}" names no year (e.g. "Fall 2026")`);
    if (a.modules.length === 0) errs.push(`${who}: no modules`);
    const nums = a.modules.map((m) => moduleById(m)?.num);
    nums.forEach((n, j) => {
      if (n === undefined) errs.push(`${who}: unknown module "${a.modules[j]}"`);
      else if (j > 0 && nums[j - 1] !== undefined && n <= nums[j - 1]!) errs.push(`${who}: modules out of order or repeated`);
    });
    if (a.source.kind === "discussion" && !a.source.url.startsWith(`${CLASSROOM_REPO_URL}/discussions/`))
      errs.push(`${who}: discussion url must be a thread under ${CLASSROOM_REPO_URL}/discussions/`);
    if (a.consent.public !== true) errs.push(`${who}: no recorded public consent`);
    if (Number.isNaN(Date.parse(a.consent.recorded))) errs.push(`${who}: consent date "${a.consent.recorded}" is not a date`);
    if (a.note !== undefined && !a.note.trim()) errs.push(`${who}: note present but empty — omit it instead`);
  });
  return errs;
}
