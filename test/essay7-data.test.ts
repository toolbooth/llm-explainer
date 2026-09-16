import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GPT2Tokenizer } from "@huggingface/transformers";
import { SHARED_TOKENIZER_FILES, SHARED_TOKENIZER_PATH } from "../src/lib/engine";
import { PAIRS, STORY, WINDOW, METER_PRESETS, STORY_PRESETS, XRAY_CHAR, XRAY_SENTENCE } from "../src/essays/why-chinese-costs-more/corpus";

/**
 * Essay #7's numbers are measured, not remembered: this file re-tokenizes
 * the ENTIRE shipped corpus (corpus.ts — the same module the page renders
 * as presets) against the vendored GPT-2 files and fails if any count,
 * ratio, share or byte-anatomy fact quoted in the prose drifts from what
 * the tokenizer says today. No forward passes — the whole file runs in
 * well under a second. GPT-2-scale claims only: the Act-4 modern-vocabulary
 * figures (cl100k/o200k/Qwen) were measured 2026-09-15 against hub files
 * and are deliberately NOT pinned here (CI verifies only against files
 * vendored in this repo); REVIEW-07.md records that run and its method.
 */
const ROOT = join(__dirname, "..");

function load() {
  const dir = join(ROOT, "public", SHARED_TOKENIZER_PATH);
  const [json, config] = SHARED_TOKENIZER_FILES.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
  const tok = new GPT2Tokenizer(json, config);
  const count = (s: string) => tok.tokenize(s).length;
  const pieces = (s: string): string[] => tok.tokenize(s);
  const ids = (s: string) => Array.from(tok(s, { add_special_tokens: false }).input_ids.data as BigInt64Array).map(Number);
  const decode = (a: number[]) => tok.decode(a);
  return { count, pieces, ids, decode };
}

const { count, pieces, ids, decode } = load();

describe("essay #7 measured claims vs the vendored tokenizer", () => {
  // Every pair's counts, pinned exactly — measured 2026-09-15 against the
  // vendored tokenizer. Order matches corpus.ts.
  const PINNED: [number, number][] = [
    [14, 43], // the opening line — the intro's "14 / 43, three times the bill"
    [4, 12], // 你好，世界。
    [5, 17], // 我喜欢吃草莓。 — the corpus maximum, ×3.40
    [7, 11], // 今天天气真好。
    [7, 14], // 猫坐在垫子上。
    [5, 14], // 请把窗户关上。
    [8, 15], // 我不明白你的意思。
    [4, 13], // 时间就是金钱。
    [18, 28], // 从前有一座山… — the corpus minimum, ×1.56
    [7, 22], // 语言模型按 token 收费。
    [8, 16], // 明天早上八点开会。
    [6, 16], // 谢谢你的帮助！
    [8, 18], // 上下文窗口不是记忆。
    [7, 13], // 一分钱一分货。
  ];

  it("Act 1: every corpus pair weighs what the prose says it weighs", () => {
    expect(PAIRS.length).toBe(14);
    expect(PAIRS.map((p) => [count(p.en), count(p.zh)])).toEqual(PINNED);
  });

  it("Act 1: corpus totals 108 / 252, basket rate ×2.33, spread ×1.56–×3.40, median ×2.46", () => {
    const en = PAIRS.reduce((s, p) => s + count(p.en), 0);
    const zh = PAIRS.reduce((s, p) => s + count(p.zh), 0);
    expect(en).toBe(108);
    expect(zh).toBe(252);
    expect(zh / en).toBeGreaterThan(2.3);
    expect(zh / en).toBeLessThan(2.37); // prose: ×2.33
    const ratios = PAIRS.map((p) => count(p.zh) / count(p.en)).sort((a, b) => a - b);
    expect(ratios[0]).toBeCloseTo(28 / 18, 10); // min ×1.56 — the mountain-temple opener
    expect(ratios[ratios.length - 1]).toBeCloseTo(17 / 5, 10); // max ×3.40 — the strawberry sentence
    const median = (ratios[6] + ratios[7]) / 2;
    expect(median).toBeGreaterThan(2.4);
    expect(median).toBeLessThan(2.5); // prose: ×2.46
    // the opening pair is ×3.07 — "three times the bill"
    expect(43 / 14).toBeGreaterThan(3);
    expect(43 / 14).toBeLessThan(3.15);
  });

  it("Act 1: the prose's supporting details — sixteen English words for the mountain proverb", () => {
    expect(PAIRS[8].en.trim().split(/\s+/).length).toBe(16);
    // and the words the prose says earned whole pieces really are one piece each
    for (const s of [" the", " and", "tion"]) expect(count(s)).toBe(1);
  });

  it("Act 2: the byte anatomy — 草 ×3, 我 ×2, 的 ×1, 。×1, ，×3", () => {
    expect(count("草")).toBe(3);
    expect(count("莓")).toBe(3);
    expect(count("我")).toBe(2);
    expect(count("的")).toBe(1); // the #1 regular earned a whole piece even in an English ledger
    expect(count("。")).toBe(1);
    expect(count("，")).toBe(3);
  });

  it("Act 2: 我喜欢吃草莓。 is 7 characters, 21 bytes, 17 pieces — and no piece contains 草", () => {
    expect(XRAY_SENTENCE).toBe(PAIRS[2].zh);
    expect(Array.from(XRAY_SENTENCE).length).toBe(7);
    expect(Buffer.byteLength(XRAY_SENTENCE, "utf8")).toBe(21);
    const p = pieces(XRAY_SENTENCE);
    expect(p.length).toBe(17);
    expect(p.some((x) => x.includes(XRAY_CHAR))).toBe(false);
    // the crumbs still round-trip: the ids carry the sentence, just not the characters
    expect(decode(ids(XRAY_SENTENCE))).toBe(XRAY_SENTENCE);
  });

  it("Act 3: the story pair — 37 vs 116 tokens (×3.14), 1.8% vs 5.7% of the window, fits 55× vs 17×", () => {
    const en = count(STORY.en);
    const zh = count(STORY.zh);
    expect(en).toBe(37);
    expect(zh).toBe(116);
    expect(zh / en).toBeGreaterThan(3.1);
    expect(zh / en).toBeLessThan(3.17); // prose: ×3.14
    // the shares exactly as the Meter formats them
    expect(((en / WINDOW) * 100).toFixed(1)).toBe("1.8");
    expect(((zh / WINDOW) * 100).toFixed(1)).toBe("5.7");
    expect(Math.floor(WINDOW / en)).toBe(55);
    expect(Math.floor(WINDOW / zh)).toBe(17);
  });

  it("the presets the page mounts are drawn from this measured corpus", () => {
    for (const p of METER_PRESETS) expect(PAIRS).toContain(p);
    expect(STORY_PRESETS[0]).toBe(STORY);
    expect(STORY_PRESETS).toContain(PAIRS[0]);
    expect(METER_PRESETS[0]).toBe(PAIRS[0]); // Act 1 opens on the essay's opening line
  });
});
