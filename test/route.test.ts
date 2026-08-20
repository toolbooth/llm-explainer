import { describe, expect, it } from "vitest";
import { resolveHash } from "../src/series/route";
import { ESSAYS, publishedEssays } from "../src/series/registry";

/**
 * The draft-visibility contract: a draft essay is reachable at its direct
 * slug URL (so the author can review it live) while staying invisible in
 * every reader-facing listing (SeriesIndex and MoreInSeries render
 * publishedEssays() only).
 */
describe("draft visibility", () => {
  it("the why-it-lies draft is reachable by direct slug URL", () => {
    expect(ESSAYS.find((e) => e.slug === "why-it-lies")?.status).toBe("draft");
    expect(resolveHash("#/essays/why-it-lies")).toBe("essay:why-it-lies");
  });

  it("…but stays out of the published listings", () => {
    expect(publishedEssays().map((e) => e.id)).not.toContain("why-it-lies");
  });

  it("section deep links under a slug still route to the essay", () => {
    expect(resolveHash("#/essays/why-it-lies/sec-3")).toBe("essay:why-it-lies");
  });
});

describe("hash routing", () => {
  it("unknown slugs fall back to the index, not a broken page", () => {
    expect(resolveHash("#/essays/no-such-essay")).toBe("index");
  });

  it("the bare essays prefix renders the index", () => {
    expect(resolveHash("#/essays")).toBe("index");
    expect(resolveHash("#/essays/")).toBe("index");
  });

  it("everything else stays essay #1 at the root URL", () => {
    expect(resolveHash("")).toBe("flagship");
    expect(resolveHash("#/")).toBe("flagship");
    expect(resolveHash("#act-4")).toBe("flagship");
    expect(resolveHash("#/something-else")).toBe("flagship");
  });

  it("the flagship's empty slug never matches the essay route", () => {
    // "#/essays/" must not resolve as essay:"" even though "" is a registry slug.
    expect(resolveHash("#/essays/")).toBe("index");
  });
});
