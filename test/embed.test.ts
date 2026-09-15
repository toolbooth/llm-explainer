import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CLASSROOM_ORIGIN,
  CLASSROOM_REPO_URL,
  ORIGIN_PLACEHOLDER,
  discussionsUrl,
  embedOrigin,
  hasOrigin,
  hasRepo,
} from "../src/classroom/config";
import {
  EMBED_HEIGHTS,
  STEPS_PER_MODULE,
  WIDGET_HEIGHTS,
  WIDGET_MODULE,
  cleanUrl,
  embedSnippet,
  embedTargets,
  embedWidgets,
  escapeHtml,
  previewUrl,
} from "../src/classroom/embed";
import { EMBED_WIDGET_IDS, classroomHref, resolveClassroomHash } from "../src/classroom/route";
import { CITE_URL } from "../src/content/citation";

/**
 * The embed kit (PRODUCT.md §6.4, §10.1 item 6): clean per-page URLs for
 * Google Classroom, fixed-height iframe snippets with a fallback link for
 * Canvas / Schoology, and three single-widget surfaces. The origin and the
 * repository are real since the 2026-09 launch (insidethemachine.org via
 * Cloudflare Pages; github.com/toolbooth/llm-explainer) — pinned here
 * against the flagship's own citation constants so they cannot drift apart.
 */
describe("classroom origin and repository constants", () => {
  it("the classroom origin is the live site and matches the citation URL", () => {
    expect(CLASSROOM_ORIGIN).toBe("https://insidethemachine.org");
    expect(CLASSROOM_ORIGIN).toBe(CITE_URL);
    expect(hasOrigin()).toBe(true);
    expect(embedOrigin()).toEqual({ origin: CLASSROOM_ORIGIN, placeholder: false });
  });

  it("the repository constant matches CITATION.cff's repository-code", () => {
    expect(CLASSROOM_REPO_URL).toBe("https://github.com/toolbooth/llm-explainer");
    const cff = readFileSync(join(__dirname, "..", "CITATION.cff"), "utf8");
    expect(cff).toContain(`repository-code: "${CLASSROOM_REPO_URL}"`);
    expect(hasRepo()).toBe(true);
    expect(discussionsUrl()).toBe("https://github.com/toolbooth/llm-explainer/discussions");
  });

  it("falls back to a labelled placeholder if the origin is ever unset — never an invented domain", () => {
    expect(hasOrigin("")).toBe(false);
    expect(hasOrigin("https://insidethemachine.org/")).toBe(false); // trailing slash is not an origin
    expect(hasOrigin("https://insidethemachine.org/#/classroom")).toBe(false);
    expect(hasOrigin("http://insidethemachine.org")).toBe(false); // https only
    expect(embedOrigin("")).toEqual({ origin: ORIGIN_PLACEHOLDER, placeholder: true });
    expect(ORIGIN_PLACEHOLDER).toContain("YOUR-DOMAIN");
    expect(hasRepo("")).toBe(false);
    expect(hasRepo("https://gitlab.com/x/y")).toBe(false);
    expect(discussionsUrl("")).toBeNull();
  });
});

describe("embeddable widget surfaces", () => {
  it("exactly the three PRODUCT-spec widgets, in module order: the Chopper, the Gamble, Hundred Rolls", () => {
    expect([...EMBED_WIDGET_IDS]).toEqual(["chopper", "gamble", "hundred-rolls"]);
    const w = embedWidgets();
    expect(w.map((x) => x.id)).toEqual([...EMBED_WIDGET_IDS]);
    expect(w.map((x) => x.module.id)).toEqual(["m1", "m2", "m2"]);
    expect(WIDGET_MODULE).toEqual({ chopper: "m1", gamble: "m2", "hundred-rolls": "m2" });
  });

  it("every widget surface has a fixed pixel height and a route of its own", () => {
    for (const w of embedWidgets()) {
      expect(w.height).toBe(WIDGET_HEIGHTS[w.id]);
      expect(Number.isInteger(w.height) && w.height >= 400 && w.height <= 1200).toBe(true);
      expect(classroomHref(w.page)).toBe(`#/classroom/embed/${w.id}`);
      expect(resolveClassroomHash(classroomHref(w.page))).toEqual({ kind: "embed", widget: w.id });
    }
  });
});

describe("whole-page embed targets", () => {
  const targets = embedTargets();

  it("covers every available module's lesson page, three steps, guide, printable and (M2) slides", () => {
    expect(STEPS_PER_MODULE).toBe(3);
    expect(targets.map((t) => t.id)).toEqual([
      "m1",
      "m1-step-1",
      "m1-step-2",
      "m1-step-3",
      "m1-guide",
      "m1-unplugged",
      "m2",
      "m2-step-1",
      "m2-step-2",
      "m2-step-3",
      "m2-guide",
      "m2-unplugged",
      "m2-slides",
    ]);
  });

  it("every target's page round-trips through the router and its height is the fixed one for its kind", () => {
    for (const t of targets) {
      expect(resolveClassroomHash(classroomHref(t.page))).toEqual(t.page);
      const kind = t.page.kind === "module" && t.page.step !== null ? "step" : t.page.kind;
      expect(t.height).toBe(EMBED_HEIGHTS[kind as keyof typeof EMBED_HEIGHTS]);
    }
  });
});

describe("clean URLs and iframe snippets", () => {
  it("the clean URL is origin + language + hash route — what a teacher pastes into Google Classroom", () => {
    expect(cleanUrl({ kind: "module", id: "m2", step: 3 }, "en")).toBe("https://insidethemachine.org/?lang=en#/classroom/m2/step-3");
    expect(cleanUrl({ kind: "embed", widget: "chopper" }, "zh")).toBe("https://insidethemachine.org/?lang=zh#/classroom/embed/chopper");
    expect(cleanUrl({ kind: "guide", id: "m1" }, "en", "")).toBe(`${ORIGIN_PLACEHOLDER}/?lang=en#/classroom/m1/guide`);
  });

  it("the live-preview URL is root-relative and carries mockModel through, so previews are deterministic under ?mockModel=1", () => {
    expect(previewUrl({ kind: "embed", widget: "gamble" }, "en", false)).toBe("/?lang=en#/classroom/embed/gamble");
    expect(previewUrl({ kind: "embed", widget: "gamble" }, "zh", true)).toBe("/?mockModel=1&lang=zh#/classroom/embed/gamble");
  });

  it("escapes the four HTML-significant characters", () => {
    expect(escapeHtml(`a & <b> "c"`)).toBe("a &amp; &lt;b&gt; &quot;c&quot;");
  });

  it("the snippet is one fixed-height iframe plus a fallback link (the docs' promise), titled for assistive technology", () => {
    const s = embedSnippet({
      page: { kind: "embed", widget: "hundred-rolls" },
      lang: "en",
      title: 'Hundred Rolls — "same position" histogram',
      openLabel: "Open Hundred Rolls (Inside the Machine: Classroom Edition)",
      height: WIDGET_HEIGHTS["hundred-rolls"],
    });
    const url = "https://insidethemachine.org/?lang=en#/classroom/embed/hundred-rolls";
    expect(s).toContain(`<iframe src="${url}"`);
    expect(s).toContain(`height="${WIDGET_HEIGHTS["hundred-rolls"]}"`);
    expect(s).toContain('width="100%"');
    expect(s).toContain('style="border:0"');
    expect(s).toContain('allow="fullscreen"');
    expect(s).toContain('loading="lazy"');
    // the title's double quotes cannot break out of the attribute
    expect(s).toContain('title="Hundred Rolls — &quot;same position&quot; histogram"');
    // the fallback link under the frame
    expect(s).toContain(`<p><a href="${url}">Open Hundred Rolls (Inside the Machine: Classroom Edition)</a></p>`);
    expect(s.match(/<iframe/g)).toHaveLength(1);
    expect(s.match(/<a /g)).toHaveLength(1);
    // no third-party host anywhere in what a teacher pastes
    expect(s).not.toMatch(/https?:\/\/(?!insidethemachine\.org)/);
  });
});
