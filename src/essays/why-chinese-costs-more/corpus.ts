/**
 * Essay #7's live data — the bilingual corpus the essay measures, imported
 * by BOTH the page (as widget presets) and test/essay7-data.test.ts (which
 * re-tokenizes every pair against the vendored GPT-2 files on each CI run),
 * so CI always measures exactly what ships. Same doctrine as the flagship's
 * types.ts note and essay #5's presets: this is substance flowing through
 * the tokenizer, not chrome, so it lives outside the content tables and is
 * identical in both locales.
 *
 * Measured 2026-09-15 against the vendored GPT-2 BPE (scratch run, since
 * superseded by the CI test, which re-measures everything here):
 * corpus EN 108 / zh 252 tokens, ratio ×2.33; per-pair ×1.56–×3.40,
 * median ×2.46. Pair #1 is the essay's own opening line (EN 14 / zh 43,
 * ×3.07) — the intro quotes it, and the reader can re-weigh it.
 */

export interface Pair {
  en: string;
  zh: string;
}

export const PAIRS: readonly Pair[] = [
  // #1 — the essay's opening line, quoted verbatim in both intros.
  { en: "The same sentence, said in Chinese, costs several times as much.", zh: "同样一句话，换成中文说，价钱就翻了几倍。" },
  { en: "Hello, world.", zh: "你好，世界。" },
  { en: "I like eating strawberries.", zh: "我喜欢吃草莓。" },
  { en: "The weather is really nice today.", zh: "今天天气真好。" },
  { en: "The cat sat on the mat.", zh: "猫坐在垫子上。" },
  { en: "Please close the window.", zh: "请把窗户关上。" },
  { en: "I don't understand what you mean.", zh: "我不明白你的意思。" },
  { en: "Time is money.", zh: "时间就是金钱。" },
  { en: "Once upon a time there was a mountain, and in the mountain there was a temple.", zh: "从前有一座山，山里有一座庙。" },
  { en: "Language models charge by the token.", zh: "语言模型按 token 收费。" },
  { en: "The meeting is at eight tomorrow morning.", zh: "明天早上八点开会。" },
  { en: "Thank you for your help!", zh: "谢谢你的帮助！" },
  { en: "The context window is not a memory.", zh: "上下文窗口不是记忆。" },
  { en: "You get what you pay for.", zh: "一分钱一分货。" },
];

/**
 * The Act-3 story pair — the same small story, written naturally in both
 * languages (names transliterated, the zh convention). EN 37 tokens, zh 116
 * (×3.14): 1.8% vs 5.7% of a 2048-token window; it fits 55× vs 17×.
 */
export const STORY: Pair = {
  en: "Tom and Lily went to the park. They slid down the slide. The sun was warm, and they laughed all afternoon. When the moon came up, they walked home for dinner.",
  zh: "汤姆和莉莉去了公园。他们从滑梯上滑下来。太阳暖洋洋的，他们笑了一下午。月亮升起来的时候，他们走回家吃晚饭。",
};

/**
 * The window the Meter's share bars are drawn against: the nano model's own
 * context size (nano-lm `maxPos`) — a real, page-local window, not any
 * product's. Ratios survive any window size; this one is honest.
 */
export const WINDOW = 2048;

/** Act-1 presets: the opening line, then a spread of the corpus including its cheapest and dearest pairs. */
export const METER_PRESETS: readonly Pair[] = [PAIRS[0], PAIRS[1], PAIRS[2], PAIRS[8], PAIRS[13], PAIRS[9]];

/** Act-3 presets: the story first; the opening line kept for comparison. */
export const STORY_PRESETS: readonly Pair[] = [STORY, PAIRS[0]];

/** The Act-2 X-ray subject: 7 characters, 21 UTF-8 bytes, 17 GPT-2 pieces — none of them containing 草. */
export const XRAY_SENTENCE = "我喜欢吃草莓。";
export const XRAY_CHAR = "草";
