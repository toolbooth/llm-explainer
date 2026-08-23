import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GPT2Tokenizer } from "@huggingface/transformers";
import { createModel, TINYSTORIES_1M_META } from "nano-lm";
import { SHARED_TOKENIZER_FILES, SHARED_TOKENIZER_PATH } from "../src/classroom/../lib/engine";
import { HOOK_RUNS, MEASURED, PARK_RUN, ROLL_SEED, TEN_RUNS_FAVOURITE, TEN_RUNS_TVD, THOUSAND_ROLLS } from "../src/classroom/m2/data";
import { ROLLS_PER_PRESS, distributionAt, mulberry32, rollMany, tally } from "../src/classroom/m2/rolls";

/**
 * Module 2's answer key is measured, not remembered: this file re-runs the
 * real classroom model (public/weights/) on the vendored tokenizer
 * (public/tokenizers/gpt2/) with the widget's own sampling code and fails
 * if any probability, id or seeded roll count in data.ts drifts from what
 * the model says today. ~1 s.
 */
const ROOT = join(__dirname, "..");

function load() {
  const dir = join(ROOT, "public", SHARED_TOKENIZER_PATH);
  const [json, config] = SHARED_TOKENIZER_FILES.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
  const tok = new GPT2Tokenizer(json, config);
  const buf = readFileSync(join(ROOT, "public/weights/tinystories-1m.safetensors"));
  const model = createModel(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, TINYSTORIES_1M_META);
  const ids = (s: string) => Array.from(tok(s, { add_special_tokens: false }).input_ids.data as BigInt64Array).map(Number);
  const decode = (id: number) => tok.decode([id]);
  return { ids, decode, model };
}

describe("module 2 measured data vs the live model", () => {
  const { ids, decode, model } = load();

  it("every measured prompt's ids, top-10 labels and probabilities at T = 0.5 / 1.0 / 1.5 match the model", () => {
    for (const m of Object.values(MEASURED)) {
      expect(ids(m.text)).toEqual(m.ids);
      const { logits } = model.forward(m.ids);
      for (const [temp, cands] of [
        [0.5, m.t05],
        [1.0, m.t10],
        [1.5, m.t15],
      ] as const) {
        const live = distributionAt(logits, temp);
        expect(live.map((d) => d.id)).toEqual(cands.map((c) => c.id));
        expect(cands.map((c) => c.label)).toEqual(live.map((d) => decode(d.id)));
        live.forEach((d, i) => expect(Math.abs(d.p - cands[i].p)).toBeLessThan(6e-5));
      }
    }
  });

  it("the seeded 100-roll runs quoted in the guide reproduce exactly", () => {
    const { logits } = model.forward(MEASURED.hook.ids);
    for (const [temp, counts] of [
      [0.5, HOOK_RUNS.t05],
      [1.0, HOOK_RUNS.t10],
      [1.5, HOOK_RUNS.t15],
    ] as const) {
      const d = distributionAt(logits, temp);
      expect(rollMany(d, ROLLS_PER_PRESS, mulberry32(ROLL_SEED))).toEqual([...counts]);
      expect(counts.reduce((a, b) => a + b, 0)).toBe(100);
    }
    const d1 = distributionAt(logits, 1.0);
    expect(Array.from({ length: 10 }, (_, i) => rollMany(d1, 100, mulberry32(1000 + i))[0])).toEqual([...TEN_RUNS_FAVOURITE]);
    expect(Array.from({ length: 10 }, (_, i) => Number(tally(d1, rollMany(d1, 100, mulberry32(1000 + i))).tvd.toFixed(3)))).toEqual([...TEN_RUNS_TVD]);
    const thousand = rollMany(d1, 1000, mulberry32(THOUSAND_ROLLS.seed));
    expect(thousand[0]).toBe(THOUSAND_ROLLS.favourite);
    expect(Number(tally(d1, thousand).tvd.toFixed(3))).toBe(THOUSAND_ROLLS.tvd);
    const park = distributionAt(model.forward(MEASURED.park.ids).logits, 1.0);
    expect(rollMany(park, 100, mulberry32(ROLL_SEED))).toEqual([...PARK_RUN]);
  });

  it("the lesson's claims hold on the live model: a flat hook, a confident park, a sure 'and', arithmetic that the dice get wrong", () => {
    const top = (text: string) => distributionAt(model.forward(ids(text)).logits, 1.0);
    const hook = top("The cat sat on the");
    expect(decode(hook[0].id)).toBe(" grass");
    expect(hook[0].p).toBeLessThan(0.25); // "four rolls in five, something else wins"
    expect(hook[0].p).toBeGreaterThan(0.18);
    const park = top("Tom and Lily went to the");
    expect(decode(park[0].id)).toBe(" park");
    expect(park[0].p).toBeGreaterThan(0.7);
    const and = top("The cat sat on the grass");
    expect(decode(and[0].id)).toBe(" and");
    expect(and[0].p).toBeGreaterThan(0.75);
    const two = top("Two plus two is");
    const four = two.find((d) => decode(d.id) === " four");
    expect(four).toBeDefined();
    expect(four!.p).toBeLessThan(0.1);
    expect(decode(two[0].id)).not.toBe(" four");
  });
});
