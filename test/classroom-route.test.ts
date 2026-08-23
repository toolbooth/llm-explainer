import { describe, expect, it } from "vitest";
import { resolveHash } from "../src/series/route";
import { ESSAYS, publishedEssays } from "../src/series/registry";
import { classroomHref, resolveClassroomHash } from "../src/classroom/route";
import { MODULES, availableModules, moduleById } from "../src/classroom/registry";

/**
 * The classroom visibility contract: every classroom page is reachable at
 * its direct URL; the classroom family is never an ESSAYS entry, so it
 * cannot appear in the series index's essay list or in any essay's "More
 * in this series" (both render publishedEssays() only). The only way in is
 * the small link on the series index and the URL itself.
 */
describe("classroom route family", () => {
  it("#/classroom… is its own top-level route, nothing else changes", () => {
    expect(resolveHash("#/classroom")).toBe("classroom");
    expect(resolveHash("#/classroom/")).toBe("classroom");
    expect(resolveHash("#/classroom/m1")).toBe("classroom");
    expect(resolveHash("#/classroom/m1/step-2")).toBe("classroom");
    expect(resolveHash("#/classroom/m1/guide")).toBe("classroom");
    expect(resolveHash("#/classroom/m2/slides")).toBe("classroom");
    // not a prefix match
    expect(resolveHash("#/classrooms")).toBe("flagship");
    expect(resolveHash("#/classroom-x")).toBe("flagship");
    // the essay routes are untouched
    expect(resolveHash("")).toBe("flagship");
    expect(resolveHash("#/")).toBe("flagship");
    expect(resolveHash("#/essays")).toBe("index");
    expect(resolveHash("#/essays/why-it-cant-count/sec-2")).toBe("essay:why-it-cant-count");
  });

  it("resolves index, module, step, guide and unplugged pages", () => {
    expect(resolveClassroomHash("#/classroom")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/m1")).toEqual({ kind: "module", id: "m1", step: null });
    expect(resolveClassroomHash("#/classroom/m1/")).toEqual({ kind: "module", id: "m1", step: null });
    expect(resolveClassroomHash("#/classroom/m1/step-1")).toEqual({ kind: "module", id: "m1", step: 1 });
    expect(resolveClassroomHash("#/classroom/m1/step-3")).toEqual({ kind: "module", id: "m1", step: 3 });
    expect(resolveClassroomHash("#/classroom/m1/guide")).toEqual({ kind: "guide", id: "m1" });
    expect(resolveClassroomHash("#/classroom/m1/unplugged")).toEqual({ kind: "unplugged", id: "m1" });
  });

  it("resolves M2's pages including its Slides companion; M1 has no slides page", () => {
    expect(resolveClassroomHash("#/classroom/m2")).toEqual({ kind: "module", id: "m2", step: null });
    expect(resolveClassroomHash("#/classroom/m2/step-2")).toEqual({ kind: "module", id: "m2", step: 2 });
    expect(resolveClassroomHash("#/classroom/m2/guide")).toEqual({ kind: "guide", id: "m2" });
    expect(resolveClassroomHash("#/classroom/m2/unplugged")).toEqual({ kind: "unplugged", id: "m2" });
    expect(resolveClassroomHash("#/classroom/m2/slides")).toEqual({ kind: "slides", id: "m2" });
    // only modules flagged `slides` route there (PRODUCT.md §10.1: Slides companion for M2 only)
    expect(moduleById("m1")?.slides).toBeFalsy();
    expect(moduleById("m2")?.slides).toBe(true);
    expect(resolveClassroomHash("#/classroom/m1/slides")).toEqual({ kind: "module", id: "m1", step: null });
  });

  it("unknown modules, planned modules and unknown sub-pages fall back safely", () => {
    expect(resolveClassroomHash("#/classroom/m9")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/nope/guide")).toEqual({ kind: "index" });
    // M3 exists in the plan but has no page yet → index, not a broken page
    expect(moduleById("m3")?.status).toBe("planned");
    expect(resolveClassroomHash("#/classroom/m3")).toEqual({ kind: "index" });
    expect(resolveClassroomHash("#/classroom/m3/slides")).toEqual({ kind: "index" });
    // an unknown sub-page of a real module lands on the module, top
    expect(resolveClassroomHash("#/classroom/m1/whatever")).toEqual({ kind: "module", id: "m1", step: null });
    expect(resolveClassroomHash("#/classroom/m1/step-x")).toEqual({ kind: "module", id: "m1", step: null });
  });

  it("hrefs round-trip through the resolver", () => {
    const pages = [
      { kind: "index" as const },
      { kind: "module" as const, id: "m1" as const, step: null },
      { kind: "module" as const, id: "m1" as const, step: 2 },
      { kind: "guide" as const, id: "m1" as const },
      { kind: "unplugged" as const, id: "m1" as const },
      { kind: "module" as const, id: "m2" as const, step: 3 },
      { kind: "guide" as const, id: "m2" as const },
      { kind: "unplugged" as const, id: "m2" as const },
      { kind: "slides" as const, id: "m2" as const },
    ];
    for (const p of pages) expect(resolveClassroomHash(classroomHref(p))).toEqual(p);
    expect(classroomHref({ kind: "module", id: "m1", step: 2 })).toBe("#/classroom/m1/step-2");
    expect(classroomHref({ kind: "slides", id: "m2" })).toBe("#/classroom/m2/slides");
  });

  it("never leaks into the essay listings", () => {
    expect(ESSAYS.some((e) => e.slug.startsWith("classroom"))).toBe(false);
    expect(ESSAYS.some((e) => e.id.startsWith("classroom"))).toBe(false);
    expect(publishedEssays().map((e) => e.id)).toEqual(["inside-the-machine"]);
  });
});

describe("module registry", () => {
  it("lists the six planned modules in order with bilingual titles and questions", () => {
    expect(MODULES.map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4", "m5", "m6"]);
    expect(MODULES.map((m) => m.num)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const m of MODULES) {
      expect(m.title.en.length).toBeGreaterThan(0);
      expect(m.title.zh.length).toBeGreaterThan(0);
      expect(m.question.en.length).toBeGreaterThan(0);
      expect(m.question.zh.length).toBeGreaterThan(0);
    }
  });

  it("M1 and M2 are available after phase 2; M3–M6 stay planned", () => {
    expect(availableModules().map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(moduleById("m1")?.title).toEqual({ en: "The Word Chopper", zh: "切词机" });
    expect(moduleById("m2")?.title).toEqual({ en: "The Next-Word Gamble", zh: "下一个词的赌局" });
    expect(MODULES.filter((m) => m.slides).map((m) => m.id)).toEqual(["m2"]);
  });
});
