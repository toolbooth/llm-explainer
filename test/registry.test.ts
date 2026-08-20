import { describe, expect, it } from "vitest";
import { ESSAYS, essayHref, publishedEssays } from "../src/series/registry";

describe("essay registry", () => {
  it("ids and slugs are unique, titles bilingual", () => {
    expect(new Set(ESSAYS.map((e) => e.id)).size).toBe(ESSAYS.length);
    expect(new Set(ESSAYS.map((e) => e.slug)).size).toBe(ESSAYS.length);
    for (const e of ESSAYS) {
      expect(e.title.en.length).toBeGreaterThan(0);
      expect(e.title.zh.length).toBeGreaterThan(0);
    }
  });

  it("essay #1 is the flagship at the root, and the only published essay for now", () => {
    expect(publishedEssays().map((e) => e.id)).toEqual(["inside-the-machine"]);
    expect(ESSAYS[0].slug).toBe("");
    expect(essayHref(ESSAYS[0])).toBe("#/");
  });

  it("later essays route under #/essays/<slug>", () => {
    for (const e of ESSAYS.slice(1)) {
      expect(essayHref(e)).toBe(`#/essays/${e.slug}`);
    }
  });
});
