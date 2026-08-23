import { describe, expect, it } from "vitest";
import { CLASSROOM, clampTemperature } from "../src/classroom/config";
import { GAMBLE_TEMP_RANGE } from "../src/acts/Gamble";
import { LOOP_TEMP_RANGE } from "../src/acts/TheLoop";

/**
 * Classroom-mode config (PRODUCT.md §4.1 rule 4, §9): the big model is
 * never shown, and every temperature slider is capped at 1.5. The flagship
 * keeps its own ranges — the cap only travels as an explicit prop.
 */
describe("classroom-mode config", () => {
  it("hides the big model and caps temperature at 1.5", () => {
    expect(CLASSROOM.bigModel).toBe(false);
    expect(CLASSROOM.maxTemperature).toBe(1.5);
    expect(CLASSROOM.model.name).toBe("TinyStories-1M");
    expect(CLASSROOM.minutes).toEqual({ period: 45, block: 90 });
  });

  it("the cap is strictly below both flagship slider ceilings, so it always bites", () => {
    expect(GAMBLE_TEMP_RANGE.max).toBe(2);
    expect(LOOP_TEMP_RANGE.max).toBe(1.6);
    expect(CLASSROOM.maxTemperature).toBeLessThan(GAMBLE_TEMP_RANGE.max);
    expect(CLASSROOM.maxTemperature).toBeLessThan(LOOP_TEMP_RANGE.max);
    // the flagship's slider attributes are unchanged (HASHES.md byte-identity)
    expect(GAMBLE_TEMP_RANGE).toEqual({ min: 0.1, max: 2, step: 0.05 });
    expect(LOOP_TEMP_RANGE).toEqual({ min: 0.1, max: 1.6, step: 0.05 });
  });

  it("clamps into [0.1, cap]", () => {
    expect(clampTemperature(2)).toBe(1.5);
    expect(clampTemperature(1.6)).toBe(1.5);
    expect(clampTemperature(1.5)).toBe(1.5);
    expect(clampTemperature(0.8)).toBe(0.8);
    expect(clampTemperature(0)).toBe(0.1);
    expect(clampTemperature(-3)).toBe(0.1);
    expect(clampTemperature(Number.NaN)).toBe(1);
    // an explicit cap still wins over the default
    expect(clampTemperature(1.9, GAMBLE_TEMP_RANGE.max)).toBe(1.9);
  });
});
