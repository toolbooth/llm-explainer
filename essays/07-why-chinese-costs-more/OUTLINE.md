# 《中文为什么更贵》 — essay #7 of the Inside the Machine series
*(EN companion: "Why Chinese Costs More Tokens")*

> The reader-facing question: **同一个意思，为什么中文要花掉几倍的 token
> ——谁定的价，这笔税落在哪里，今天还收吗？** The tokenizer tax, taught on
> the reader's own sentences: under the site's shared GPT-2 BPE the same
> meaning costs ~2–4× more tokens in 中文 than in English, because a
> vocabulary counted out of English text gives whole pieces to English and
> sells 汉字 by the byte. The consequences are concrete (context windows,
> per-token pricing, generation steps); the resolution is honest (modern
> vocabularies — cl100k, o200k, Qwen — have refunded most of the tax, so the
> essay teaches a mechanism and a historical gradient, never "today's
> assistants charge 中文 users 3×"). Target 800–1200 words EN; the zh
> edition may run naturally longer — see the convention below. Backlog
> entry #7, promoted 2026-09-15.

## The series' one inverted convention (recorded in SERIES.md)

**The 中文 edition is the PRIMARY text for this essay** — written first, in
the series' zh voice, at full rhetorical strength; the EN edition is the
companion rewrite. This is the only essay in the series whose subject *is*
the 中文 reader's experience, so the strongest prose lives in `zh.tsx` and
REVIEW-07's low-confidence list flags **EN renderings** instead of zh ones.
"Primary" changes the writing order and where the strongest prose lives,
not the architecture: same content-module pattern (`types.ts` + `en.tsx` +
`zh.tsx`), same key-parity test, same widgets in both locales.

## The sections

| # | Section (zh primary) | Interactive | Widget source |
|---|---|---|---|
| 1 | **先过秤** (On the Scale) — token 是计价单位；同一个意思放上秤，两边的读数差几倍。语料 14 对句子实测：EN 108 / zh 252 token，全语料 ×2.33，逐对 ×1.56–×3.40（中位 ×2.46）——分布如实给出，不挑极端 | side-by-side tokenization of an EN/zh pair (shared GPT-2 BPE), live counts, the ratio, and each side's share of a 2048-token window; presets from the measured corpus, free input for the reader's own pair | **NEW widget: 双语计价器 / The Meter** — the essay's single new component; two Chopper-style panes over `engine.tokenize`, `displayPiece` rendering (Ġ/byte pieces), pure math in `corpus.ts` |
| 2 | **拆到字节** (Down to Bytes) — 为什么：BPE 词表是从字节数出来的常客名单；英文常客挣到整块，汉字（UTF-8 三字节）在英文语料里是稀客，只好按字节拆开卖。实测：草 → 3 块字节碎片、我 → 2、的 → 1（常用到连英文网页都养出了它的整块）、。→ 1、，→ 3；我喜欢吃草莓。= 7 字 21 字节 17 块，且没有任何一块里找得到「草」 | the Tokenizer X-ray in tokenizer-only mode on 我喜欢吃草莓。 with target 草 — the "you see" row shows 7 characters, the "it sees" row shows 17 byte pieces, none carrying the character | **reuse: TokenizerXray** (essay #4) with `tokenizer: "shared"`, `modelGate: false` — the classroom's tokenizer-only seam, first essay use |
| 3 | **挤窗口** (The Window Squeeze) — 后果：同一个故事，EN 37 token、zh 116（×3.14）；在 2048 的窗口里英文版能放 55 遍、中文版 17 遍。逐 token 计价年代同样的意思账单更长（历史陈述）；生成按 token 走，同样的话要走三倍的步数；早年模型中文说得笨，一部分是它在按字节读中文（机制论证，克制陈述） | the Meter again, loaded with the story pair — the window-share bars carry this act | **reuse: the Meter** (second instance, story presets) |
| 4 | **汇率在变** (The Exchange Rate Is Moving) — 同一批句子过今天的秤（2026-09-15 hub 实测，非 CI 钉死——REVIEW-07 记录）：cl100k ×1.48、o200k ×1.02、Qwen2.5 ×0.80（中文反而更便宜）；草莓句 17 → 13 → 6 → 4 块。税不是中文的属性，是一次统计的选择；今天的主流词表已把大头退了，梯度仍在，小语种还在山上 | prose-only act (flagship act-6/7 precedent) | — |

Every widget section is independently linkable
(`#/essays/why-chinese-costs-more/sec-1` … `sec-3`; `sec-4` anchors the
prose act). No model is ever woken — this essay needs only the shared
tokenizer (~2MB): the cheapest page in the series.

## The pedagogical payoff

One sentence to keep: **token 不是字也不是词，是词表里的常客名单；名单是
从语料里数出来的，语料说英语，汉字就只好按字节买。** Second payoff, the
honest one: the tax is a *training-data choice*, not a property of 中文 —
run the same sentences through a vocabulary that counted enough Chinese and
the exchange rate collapses, even inverts (Qwen2.5: ×0.80). Third, the
consequence chain the reader can verify: window share, per-token bills,
generation steps — all downstream of one counting decision made before
training begins.

## English 版

- EN companion title: **"Why Chinese Costs More Tokens"** (SERIES.md's
  canonical). Companion rewrite of the zh primary: same numbers, same
  structure, EN voice at series strength — but where the zh text speaks to
  the reader whose language is being taxed («我们»), the EN text speaks to
  the reader watching the mechanism from the untaxed side.
- REVIEW-07's ten-item low-confidence list flags EN renderings of
  zh-primary phrasings (the reverse of every earlier review).
- Widget presets are bilingual pairs — live data in `corpus.ts`, never in
  the content tables. The zh member of each pair appears identically in
  both locales (it is the substance under measurement, not chrome).

## Claims that need care — say what was measured, not the folklore

- **Every number on the GPT-2 scale is measured against the vendored
  tokenizer** (`public/tokenizers/gpt2/`, the one the site self-hosts and
  the nano model reads) and re-verified in CI by `test/essay7-data.test.ts`
  from the same `corpus.ts` the page imports. Corpus ×2.33; per-pair
  spread ×1.56–×3.40 reported as a spread, never as "3×" flat.
- **The corpus is not cherry-picked and says so.** 14 pairs including the
  cheap ones (从前有一座山… ×1.56, 今天天气真好 ×1.57); the essay quotes
  min, median and max, and the opening line of the essay itself is pair #1
  (EN 14 / zh 43, ×3.07) so the reader can re-weigh the very sentence they
  just read.
- **GPT-2's vocabulary is English-trained — that IS the thesis, and it is
  dated.** The essay must never imply today's assistants charge 中文 users
  ~3×. Act 4 measures the gradient: cl100k ×1.48, o200k ×1.02, Qwen2.5
  ×0.80 on the same corpus (hub tokenizers, scratch run 2026-09-15, the
  script deleted after the numbers were recorded; method and repo ids in
  REVIEW-07, marked measured-not-CI-pinned because CI re-verifies only
  against files vendored in this
  repo). Act 1 says up front that the page's scale is a 2019 vocabulary,
  kept because it magnifies the mechanism.
- **Pricing claims are historical and generic.** "同样的意思账单更长" is
  said of the per-token-billing era and of the mechanism; no current
  provider is named, no current price ratio is asserted.
- **The fluency claim is a mechanism argument, hedged.** 早年模型中文说得
  笨「一部分」因为按字节读中文 — a contributing mechanism, not a measured
  quantity; stated with 「一部分」 and no numbers.
- **The 的 exception is reported.** The tax is uneven inside 中文 too: 的
  earned a whole piece even in an English-counted vocabulary (enough 中文
  leaks into English webtext), 草 costs three. Honesty here inoculates the
  reader against "all 汉字 are 3 tokens".
- **窗口数字绑定 2048** — the nano model's own window (`maxPos`), named in
  the widget note; not presented as any product's window size.
- **No intent language.** The tokenizer "decides" nothing; the counting
  happened before training. The only agent verbs belong to the people who
  chose the corpus — and to the reader.

## Engine notes (for the implementation step)

- **The Meter** = one component (`Meter.tsx`) over pure `corpus.ts`
  (`PAIRS`, `STORY`, `WINDOW = 2048` — imported by both the page and the
  data test, so CI measures exactly what ships). Two `engine.tokenize`
  panes (150ms debounce, the X-ray's pattern), `displayPiece` for Ġ/byte
  rendering, `.tok` chips + window-share bars; ratio = zh ÷ en shown ×N.N.
  No nano, no big model, no dice — deterministic under `?mockModel=1` by
  construction (mock tokenize is pure).
- **TokenizerXray reuse** imports from
  `src/essays/why-it-cant-count/TokenizerXray` exactly as the classroom's
  M1 does (`tokenizer: "shared"`, `modelGate: false`,
  `XrayTokenizerStrings`).
- Presets/live data in `corpus.ts`, never in content tables —
  `test/essay7-content.test.ts` enforces (opening pair excepted: it is
  quoted in the intro prose of both locales by design, and the test pins
  that too).
- Measured-data discipline: `test/essay7-data.test.ts` re-tokenizes the
  whole corpus, the story, and the byte-anatomy set against the vendored
  files on every CI run (<1 s — no forward passes). Modern-tokenizer
  numbers live in REVIEW-07 (with the measurement method and hub repo
  ids), cited in prose with their date.
