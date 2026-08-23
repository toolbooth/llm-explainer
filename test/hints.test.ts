import { describe, expect, it } from "vitest";
import {
  hideAll,
  hintButtonKind,
  initialHintState,
  revealNext,
  visibleHints,
} from "../src/classroom/hints";

/**
 * Progressive hints: hidden by default, revealed one at a time, foldable
 * without losing anything else on the page (the community-college ask:
 * "retry without restarting the module").
 */
describe("progressive hints", () => {
  const hints = ["one", "two", "three"];

  it("starts hidden and offers hint 1", () => {
    const s = initialHintState(hints.length);
    expect(s).toEqual({ revealed: 0, total: 3 });
    expect(visibleHints(hints, s)).toEqual([]);
    expect(hintButtonKind(s)).toBe("reveal");
  });

  it("reveals one hint per click, in order, and saturates", () => {
    let s = initialHintState(3);
    s = revealNext(s);
    expect(visibleHints(hints, s)).toEqual(["one"]);
    expect(hintButtonKind(s)).toBe("reveal");
    s = revealNext(s);
    expect(visibleHints(hints, s)).toEqual(["one", "two"]);
    s = revealNext(s);
    expect(visibleHints(hints, s)).toEqual(["one", "two", "three"]);
    expect(hintButtonKind(s)).toBe("hide");
    // a fourth click cannot overrun the list
    expect(revealNext(s).revealed).toBe(3);
  });

  it("folds every hint away and can start over", () => {
    const open = revealNext(revealNext(revealNext(initialHintState(3))));
    const closed = hideAll(open);
    expect(closed).toEqual({ revealed: 0, total: 3 });
    expect(hintButtonKind(closed)).toBe("reveal");
    expect(visibleHints(hints, revealNext(closed))).toEqual(["one"]);
  });

  it("a prompt with no hints renders no control", () => {
    const s = initialHintState(0);
    expect(hintButtonKind(s)).toBe("none");
    expect(visibleHints([], s)).toEqual([]);
  });

  it("is defensive against a stale state", () => {
    expect(visibleHints(hints, { revealed: 7, total: 3 })).toEqual(hints);
    expect(visibleHints(hints, { revealed: -1, total: 3 })).toEqual([]);
    expect(initialHintState(2.7).total).toBe(2);
  });
});
