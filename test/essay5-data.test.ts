import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GPT2Tokenizer } from "@huggingface/transformers";
import { createModel, TINYSTORIES_1M_META, softmax, softmaxTopK, argmax } from "nano-lm";
import { SHARED_TOKENIZER_FILES, SHARED_TOKENIZER_PATH } from "../src/lib/engine";
import { findRepeats } from "../src/essays/why-it-repeats/loops";

/**
 * Essay #5's numbers are measured, not remembered: this file re-runs the
 * real 7.5MB model (public/weights/) on the vendored tokenizer with the
 * essay's own detection code and fails if any loop, count or probability
 * quoted in the prose drifts from what the model says today. The greedy
 * generations dominate the cost (~25 s) — this is the price of the
 * claims-care rule that every empirical sentence is checked in CI.
 * Full measurement tables: REVIEW-05.md.
 */
const ROOT = join(__dirname, "..");

function load() {
  const dir = join(ROOT, "public", SHARED_TOKENIZER_PATH);
  const [json, config] = SHARED_TOKENIZER_FILES.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
  const tok = new GPT2Tokenizer(json, config);
  const buf = readFileSync(join(ROOT, "public/weights/tinystories-1m.safetensors"));
  const model = createModel(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, TINYSTORIES_1M_META);
  const ids = (s: string) => Array.from(tok(s, { add_special_tokens: false }).input_ids.data as BigInt64Array).map(Number);
  const decode = (a: number[]) => tok.decode(a);
  return { ids, decode, model };
}

const { ids, decode, model } = load();

function greedy(prompt: string, steps: number): number[] {
  const seq = [...ids(prompt)];
  const promptLen = seq.length;
  for (let i = 0; i < steps; i++) {
    const next = argmax(model.forward(seq).logits);
    seq.push(next);
    if (next === 50256) break; // <|endoftext|> — the story closed itself
  }
  return seq.slice(promptLen);
}

function occurrences(hay: number[], unit: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i + unit.length <= hay.length; i++) {
    if (unit.every((u, j) => hay[i + j] === u)) out.push(i);
  }
  return out;
}

describe("essay #5 measured claims vs the live model", () => {
  it("Act 1: 'Tom and Lily…' greedy chants 'It was red and blue.' — 6-token cycle, five laps, fraying into 'It was not'", () => {
    const gen = greedy("Tom and Lily went to the park.", 80);
    // "They slid down the slide." twice, the second complete by token 32
    const slide = ids(" They slid down the slide.");
    const slideOcc = occurrences(gen, slide);
    expect(slideOcc.length).toBe(2);
    expect(slideOcc[1] + slide.length).toBeLessThanOrEqual(32);
    // "It was red and blue." — unit length 6, five full occurrences
    const redblue = ids(" It was red and blue.");
    expect(redblue.length).toBe(6);
    expect(occurrences(gen, redblue).length).toBe(5);
    // the sixth lap frays: " It was not"
    expect(decode(gen.slice(77, 80))).toBe(" It was not");
    // the essay's own detector agrees: dominant = the 6-token cycle × 5
    const dom = findRepeats(gen).dominant!;
    expect(dom.length).toBe(6);
    expect(dom.starts.length).toBe(5);
    expect(decode(dom.unit)).toContain("was red and blue");
  });

  // "The man said" walked greedily for 80 tokens, keeping the logits at every
  // position — shared by the two Act-3 tests below (the walk is the cost).
  const manSaid = (() => {
    const seq = [...ids("The man said")];
    const gen: number[] = [];
    const logitsByPos: Float32Array[] = [];
    for (let i = 0; i < 80; i++) {
      const { logits } = model.forward(seq);
      logitsByPos.push(logits);
      const next = argmax(logits);
      gen.push(next);
      seq.push(next);
    }
    return { gen, logitsByPos };
  })();

  it("Act 3: 'The man said' greedy locks into 'You have to be careful and respectful.' — 8-token lap, three laps by token 80, still chanting", () => {
    const gen = manSaid.gen;
    const lap = ids(" You have to be careful and respectful.");
    expect(lap.length).toBe(8);
    expect(occurrences(gen, lap)).toEqual([55, 63, 71]);
    expect(gen[79]).toBe(lap[0]); // token 80 starts lap four
    // the widget's verdict quotes the ×5 stem that spans both chant variants
    // ("…listen to me." ×2, then "…respectful." ×3) — see REVIEW-05.md
    const dom = findRepeats(gen).dominant!;
    expect(decode(dom.unit)).toBe(". You have to be careful and");
    expect(dom.starts.length).toBe(5);
  });

  it("Act 1: 'The bird flew up.' quasi-chants four laps, then ends the story on its own", () => {
    const gen = greedy("The bird flew up.", 80);
    expect(occurrences(gen, ids(" The bird flew away, but the bird was")).length).toBe(4);
    expect(gen[gen.length - 1]).toBe(50256); // it reached <|endoftext|> by itself
    expect(gen.length).toBeLessThan(70);
  });

  it("Act 2: each encore of 'The cat sat on the mat.' raises the next one — the bars and the 400× climb", () => {
    const phrase = "The cat sat on the mat.";
    const theId = ids(" The")[0];
    // the widget's own bars: top-10 at T = 1 (renormalized, as Gamble shows them)
    const barP = (ctx: string) => {
      const dist = softmaxTopK(model.forward(ids(ctx)).logits, 10, 1);
      return dist.find((d) => d.id === theId)!.p;
    };
    const p1 = barP(phrase);
    const p2 = barP(`${phrase} ${phrase}`);
    const p3 = barP(`${phrase} ${phrase} ${phrase}`);
    expect(p1).toBeGreaterThan(0.25);
    expect(p1).toBeLessThan(0.28); // prose: 26%, runner-up to " She"
    expect(p2).toBeGreaterThan(0.49);
    expect(p2).toBeLessThan(0.53); // prose: 51%
    expect(p3).toBeGreaterThan(0.57);
    expect(p3).toBeLessThan(0.61); // prose: 59%
    // whole-sentence probability (full softmax, chained): ~1/500k → ~1/1,200
    const unit = ids(" " + phrase);
    expect(unit.length).toBe(7);
    const copyP = (k: number) => {
      const seq = [...ids(Array(k).fill(phrase).join(" "))];
      let lp = 0;
      for (const id of unit) {
        lp += Math.log(softmax(model.forward(seq).logits, 1)[id]);
        seq.push(id);
      }
      return Math.exp(lp);
    };
    const c1 = copyP(1);
    const c4 = copyP(4);
    expect(c1).toBeLessThan(3e-6); // about one in half a million
    expect(c4).toBeGreaterThan(6e-4);
    expect(c4).toBeLessThan(1e-3); // about one in twelve hundred
    expect(c4 / c1).toBeGreaterThan(300); // "four hundred times" (measured 404×)
  });

  it("Act 3: survival of one more lap under the widget's sampler — ~55% at T=0.3, ~1% at T=1, rising lap over lap at T=0.3", () => {
    const lap = ids(" You have to be careful and respectful.");
    // logitsByPos[i] is the distribution the model held before writing gen[i]
    const stay = (lapStartGenIdx: number, T: number) => {
      let p = 1;
      for (let j = 0; j < lap.length; j++) {
        const dist = softmaxTopK(manSaid.logitsByPos[lapStartGenIdx + j], 8, T);
        const hit = dist.find((d) => d.id === lap[j]);
        p *= hit ? hit.p : 0;
      }
      return p;
    };
    const lap3At03 = stay(71, 0.3);
    expect(lap3At03).toBeGreaterThan(0.5);
    expect(lap3At03).toBeLessThan(0.6); // prose: ~55%
    expect(stay(71, 1.0)).toBeLessThan(0.015); // prose: ~1%
    // self-reinforcement inside the loop: 28% → 43% → 55% at T = 0.3
    const climb = [stay(55, 0.3), stay(63, 0.3), stay(71, 0.3)];
    expect(climb[0]).toBeGreaterThan(0.25);
    expect(climb[0]).toBeLessThan(0.32);
    expect(climb[1]).toBeGreaterThan(climb[0]);
    expect(climb[2]).toBeGreaterThan(climb[1]);
  });
});
