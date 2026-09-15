import { describe, expect, it } from "vitest";
import { ADOPTERS, validateAdopters, type Adopter } from "../src/classroom/adopters";
import { CLASSROOM_REPO_URL, TAUGHT_DISCUSSION_CATEGORY } from "../src/classroom/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The adoption-evidence data file (PRODUCT.md §8): entries mirror the
 * letter kit's §A report fields and are listed publicly on
 * #/classroom/taught only with recorded consent. The schema is enforced
 * here so an entry landed by commit cannot be malformed — and so the
 * shape itself keeps the §8.1 promise: there is no field for any
 * student-level data.
 */
describe("adopters data file", () => {
  it("every checked-in entry is valid", () => {
    expect(validateAdopters(ADOPTERS)).toEqual([]);
  });

  it("the validator rejects what the §8 rules forbid", () => {
    const good: Adopter = {
      name: "anonymous HS teacher, Ohio",
      course: "Intro to CS",
      term: "Fall 2026",
      modules: ["m1", "m2"],
      source: { kind: "email" },
      consent: { public: true, recorded: "2026-09-15" },
    };
    expect(validateAdopters([good])).toEqual([]);
    expect(
      validateAdopters([
        {
          ...good,
          institution: "Franklin High School",
          note: "The dice table landed; most could explain temperature afterward.",
          source: { kind: "discussion", url: `${CLASSROOM_REPO_URL}/discussions/12` },
        },
      ])
    ).toEqual([]);
    // no consent, no listing
    expect(validateAdopters([{ ...good, consent: { public: false as unknown as true, recorded: "2026-09-15" } }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, consent: { public: true, recorded: "someday" } }])).toHaveLength(1);
    // the report must say who (or an anonymous label), what and when
    expect(validateAdopters([{ ...good, name: "  " }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, course: "" }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, term: "last fall" }])).toHaveLength(1);
    // modules: known ids, registry order, no repeats
    expect(validateAdopters([{ ...good, modules: [] }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, modules: ["m9" as "m1"] }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, modules: ["m2", "m1"] }])).toHaveLength(1);
    expect(validateAdopters([{ ...good, modules: ["m1", "m1"] }])).toHaveLength(1);
    // a discussion source must live on the project's own board
    expect(validateAdopters([{ ...good, source: { kind: "discussion", url: "https://github.com/other/repo/discussions/1" } }])).toHaveLength(1);
  });

  it("the schema has no field for student-level data — the §8.1 rule is structural", () => {
    const fields = [
      "name",
      "institution",
      "course",
      "term",
      "modules",
      "note",
      "source",
      "consent",
    ];
    const src = readFileSync(join(__dirname, "..", "src", "classroom", "adopters.ts"), "utf8");
    for (const f of fields) expect(src).toContain(`${f}`);
    for (const forbidden of ["student", "Student"]) {
      // the word appears only in prose explaining the rule, never as a field
      const iface = src.slice(src.indexOf("export interface Adopter"), src.indexOf("export const ADOPTERS"));
      expect(iface.match(new RegExp(`^\\s*${forbidden}\\w*\\??:`, "m"))).toBeNull();
    }
  });

  it("the Discussion template exists under the category slug the config names", () => {
    const file = join(__dirname, "..", ".github", "DISCUSSION_TEMPLATE", `${TAUGHT_DISCUSSION_CATEGORY}.yml`);
    expect(existsSync(file)).toBe(true);
    const yml = readFileSync(file, "utf8");
    // the §A fields, teacher-level only, with the site-listing consent question
    for (const id of ["name", "institution", "course", "grade-band", "term", "modules", "class-size", "devices", "worked", "didnt", "public-listing"]) {
      expect(yml).toContain(`id: ${id}`);
    }
    expect(yml).toContain("required: true");
    expect(yml).toContain("anonymous");
  });
});
