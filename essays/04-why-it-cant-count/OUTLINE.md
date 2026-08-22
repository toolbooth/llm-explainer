# Why It Can't Count — essay #4 of the Inside the Machine series
*(中文版:《为什么 AI 数不出 strawberry 有几个 r》)*

> The reader-facing question: **it writes sonnets but can't count the r's in
> strawberry — why?** Essay #1's Act 1 showed the chop and made the joke in
> one sentence. This essay takes the joke seriously: the model's world is
> tokens, not letters, so every character-level task — counting letters,
> spelling, reversing, digit arithmetic — is being asked of a system that
> never perceives the characters. The reader X-rays their own word, watches a
> real model attempt the count with and without the letters spelled into its
> token stream, and learns why the fixes (spell it out, count out loud, hand
> it a calculator) follow from the mechanism. Target 800–1200 words EN
> (series charter).

## The four sections

| # | Section | Interactive | Widget source |
|---|---|---|---|
| 1 | **Perception Is Tokens** — the model never sees letters; it sees a list of ids snapped to a ~50k-entry vocabulary. Not a reading problem: a *sensing* problem | the reader's word in the Chopper, opened on a bare `strawberry` (→ `st · raw · berry`); add a leading space and the same word becomes one token. Digits, emoji and 中文 chop stranger still | **reuse: Chopper** (lifted to a `strings`/`htmlId`/`initialText` prop surface — the seam `src/series/README.md` §2 says to close the first time a second essay needs it; `App.tsx` passes `t.act1` + `"act-1"` so the flagship DOM stays byte-identical) |
| 2 | **The X-ray** — type a word and a letter; see the letters you see, the pieces the model sees, and the ids that actually arrive; then watch the model try to count | the reader types any word/number and a letter. Top half (tokenizer only, no wake): a letters row with the target letter marked, a pieces row (the §2–§4 model's own tokenizer) with each piece's letters and hits, and the ids. The insight line: *10 letters, 3 r's → 3 pieces, the letter r arrives as part of #… and #…, never by itself*. Bottom half (explicit wake, like Act 4): one click runs two prompts — **ask it straight** (`Q: How many "r" are in "strawberry"? A: There are `) and **spell it out first** (`… in s-t-r-a-w-b-e-r-r-y? …`) — and shows each one's next-token distribution as a 0–9 digit histogram with the true count marked, plus the raw top tokens | **NEW widget: TokenizerXray** — the essay's single new component (pure logic in `xray.ts`: spell-out, letter tally, per-piece letter map, prompt builders, digit readout; two `lastLogits` calls via the existing engine; one small engine addition, `tokenizeModel`, so the pieces shown are the counting model's own) |
| 3 | **Digits Are Tokens Too** — numbers get chopped like words, each tokenizer its own way; then the model has to emit an answer left-to-right, one piece per step, with no scratch paper | probability bars on arithmetic presets: `47 * 23 = ` (first digit), `47 * 23 = 10` (the digit after a correct start), `1234 + 5678 = `; the reader watches the first digit come out confident and the later digits come out nearly flat | **reuse: Gamble** (probability bars + temperature), arithmetic presets |
| 4 | **The Fix Follows the Mechanism** — if the failure is perception, the fixes are ways of putting the letters (or the count) into the token stream, or taking the job out of the model entirely | the same bars on three presets for one question: straight / spelled out / spelled out with a running tally (`… The r's: r, r, r. So there are `); the reader watches the mass move toward the true count as more of the work is done *in the text* | **reuse: Gamble**, mitigation presets |

Every section = independently linkable widget, same as the flagship's acts
(`#/essays/why-it-cant-count/sec-1` … `sec-4`).

## The pedagogical payoff

The reader leaves with one sentence that explains a whole family of
failures: **the model's world is tokens, not letters.** Counting letters,
spelling, reversing, rhyming, and digit arithmetic are all character-level
tasks posed to a system whose senses stop at the token boundary — it is not
that the machine is dumb, it is that it is being asked to count the legs on
an animal it has only ever heard described. Second payoff: **the fixes
follow from the mechanism.** Spelling the word out puts the letters into the
token stream; counting out loud turns "count in your head" into "copy the
tally"; a tool call moves the job to a calculator that sees characters;
targeted training teaches the famous cases. Third, the honest one:
tokenization is *one* root, not the whole tree — our 135M model is still
mostly guessing after the letters are spelled out, and arithmetic adds a
second problem (left-to-right digits, carries that flow the other way) that
no tokenizer fixes.

## 中文版

- Title: **《为什么 AI 数不出 strawberry 有几个 r》** — the strawberry gag
  stays in English (it only works in English) and the zh prose says so in
  §1, as the flagship's `afterChopper` does (「这个梗只在英文里成立,所以我们
  保留英文原词」). Registry entry `why-it-cant-count` carries both titles as
  a draft; the h1 renders without 书名号 (ZH-REVIEW global decision 1).
- Same rewrite-not-translate discipline as `src/content/zh.tsx`: single-line
  JSX strings; technical terms annotated once then kept in English
  (token → 词元/token, tokenizer → 切词器, BPE → 字节对编码/BPE,
  chain of thought → 把过程写出来).
- Canonical chrome reused verbatim: 「唤醒模型(约 136MB,只此一次,之后永久
  缓存)」, 「🧊 谨慎 / 🔥 狂野」, 「🎲 掷骰子」, 「想一想」; the Chopper's
  flagship chrome (「切词机」, 「随便打点什么…」) is reused in §1.
- Default words, letters and presets stay English (the models only read
  English); the zh prose says so in §1. 中文 typed into the X-ray still
  works as a demonstration — and chops into byte fragments, which is its own
  lesson — but the counting prompts are English.

## Claims that need care — say what was measured, not the folklore

- **Tokenization is ONE major cause, not the whole story.** For letter
  counting it is the root; for arithmetic it is one of several. Even with
  one-digit-per-token input the model emits the answer left to right, one
  digit per step, with no working memory outside the text, and the leftmost
  digit has to already account for every carry that humans compute last.
  Training data matters too. §3 says this in the body, not a footnote.
- **Frontier models now often get strawberry right** — this exact question
  became famous, it is in the training data and the fine-tuning sets, and
  products route such questions to a reasoning mode or a tool. Say so
  plainly (intro and §4). The mechanism underneath is unchanged: the same
  model asked about a less famous word, or a longer number, still has to
  work with tokens. Make no claim about any named frontier model's behavior.
- **No "the model is dumb" framing.** Blind is not stupid. The essay's
  analogy is sensory — a system that perceives at the token grain — never
  a system that is bad at thinking. The widgets mark the true answer so the
  reader can see a miss; the prose never gloats.
- **Digit-tokenization claims are measured, not assumed** (2026-08-22, both
  tokenizers run on the same strings; see Engine notes). GPT-2 BPE (the
  nano model, the Chopper): every 1- and 2-digit string is one token, 777 of
  the 1000 3-digit strings are, and longer numbers chop into 1–3-digit
  chunks cut from the left — `1234 → 12|34`, `12345 → 123|45`,
  `1000000 → 1|000000`, `2024 → 20|24` but ` 2024` (with a space) is one
  token. SmolLM2 (the §2–§4 model): **one digit per token, always**, and a
  bare space token before a number — ` 2024 → ␣|2|0|2|4`, `47 * 23 = 1081 →
  4|7|␣*|␣|2|3|␣=|␣|1|0|8|1`. Do NOT write "the model sees 1234 as one
  token" without naming which tokenizer. Other vocabularies differ again;
  the essay says "check yours" rather than describing tokenizers it did not
  run.
- **"Spelling it out helps" is a claim about big models; for ours it is a
  nudge.** Measured on SmolLM2-135M (raw softmax, first next token):
  straight `Q: How many "r" are in "strawberry"? A: There are ` → 1 19%,
  2 19%, 4 16%, **3 16%**; spelled out → **3 23%**, 2 19%, 1 19%; spelled
  out with a tally (`… The r's: r, r, r. So there are `) → **3 32%**. The
  winner flips, the histogram stays flat; on other words (banana/a,
  bookkeeper/e, google/o) spelling does not move the top pick. The prose
  says the toy is mostly guessing in both modes and that the experiment
  shows *what changes in the input*, not a cure. The same model never
  answers zero: `How many "z" are in "strawberry"` gives 0 a 0.6% bar.
- **The digit readout is the first next token only.** A "1" may be the
  start of "10"; the histogram is over the digits 0–9 at T = 1 with
  everything else pooled as "other". The widget note says so.
- **Not "tokens are bad."** BPE is a good trade — short inputs, a
  vocabulary that covers every byte — and the model's fluency is built on
  it. Perception at the token grain is a cost of that trade, the way human
  eyes don't see ultraviolet. No call to abolish tokenizers.
- **No intent language.** The model does not "refuse to count" or "ignore
  the letters"; the letters are not there to ignore.

## Engine notes (for the implementation step, later)

- **Tokenizer census (2026-08-22, `Xenova/gpt2` and
  `onnx-community/SmolLM2-135M-Instruct-ONNX` via transformers.js, no
  special tokens).** Words: `strawberry → st|raw|berry` in BOTH vocabularies;
  ` strawberry` (leading space) is one token in both; `Strawberry →
  St|raw|berry`; `raspberry → r|aspberry`; `mississippi → miss|iss|ippi`
  (GPT-2) / `miss|issippi` (SmolLM2); `hello` one token in both;
  `lollipop → l|oll|ipop` / `l|oll|ip|op`; `s-t-r-a-w-b-e-r-r-y` → 19 tokens,
  one per letter and hyphen, in both (this is what makes the spelled-out
  prompt work: the letters become tokens). 中文 chops into UTF-8 byte
  fragments in GPT-2 (`定 → å®|ļ`) and fewer in SmolLM2; `🍓` is three byte
  tokens in both. Digits: see the claims-care bullet.
- **Model behaviour census (SmolLM2-135M-Instruct q8, same build as Act 4).**
  Prompts that end in a bare space put the next token on a digit (because of
  the ␣-before-number tokenization); prompts ending in `Answer:` put 45–65%
  of the mass on `\n` or ` ` and tell the reader nothing. All presets
  therefore end in a trailing space. Prompts must be single-line for the
  Gamble reuse (an `<input>` strips newlines) — the `Q: … A: There are `
  form is used everywhere so the X-ray's prompt pastes into §4's bars
  unchanged. Arithmetic: `47 * 23 = ` → first digit nearly flat (4 18%,
  5 16%, 3 16%, 1 14%); `Q: What is 47 * 23? A: 47 * 23 = ` → **1 62%**
  (the magnitude is easy); `47 * 23 = 10` → 2 18%, 4 15%, **8 13%** (the
  carry digit is not); greedy answers 1042 (true 1081) and `1234 + 5678 =
  1444…` (true 6912). `>>> "strawberry".count("r")` as a prompt does not
  make the toy run Python — it predicts a code continuation; the tool
  mitigation in §4 is described, not demonstrated, and the prose says so.
- **Chopper lift** (budgeted as reuse, per README §2): `strings:
  ChopperStrings` (= `EssayStrings["act1"]`), `htmlId`, optional
  `initialText`. `App.tsx` passes `t.act1`, `"act-1"` and nothing else, so
  the flagship's DOM is unchanged (verify the sha256s: flagship EN
  b5fe4891… / zh c1097d95…; why-it-lies EN 2475a779… / zh 4276ba10…;
  attention-heads EN 9cb068c3… / zh 45e18766…, all recomputed on the clean
  checkout 2026-08-22 as sha256 of `#root` innerHTML under `?mockModel=1`).
- **Engine addition**: `Engine.tokenizeModel(text)` — the §2–§4 model's own
  tokenizer (3.4MB `tokenizer.json`, loads on the X-ray's first render, no
  model download), mirroring `decodeModel`. The mock engine's
  `tokenizeModel` is its word-split `tokenize`. `tokenize()` stays GPT-2 BPE
  for the Chopper and the nano model.
- **TokenizerXray** = one component + `xray.ts` (pure, unit-tested without
  a model):
  - `spellOut(word)` → `s-t-r-a-w-b-e-r-r-y` (code points, so `🍓` and
    中文 spell out as whole characters); `letterTally(word, letter)` →
    count + positions, case-insensitive; `pieceLetters(pieces, letter)` →
    per piece: its characters and which of them hit;
  - `countingPrompts(word, letter)` → `{ straight, spelled }` in the
    single-line `Q: … A: There are ` form;
  - `digitReadout(bars)` → probability on each of `0`–`9` (label trimmed,
    number words one–nine folded in), `other`, `top` digit, `correct`
    flag against the tally; built from `softmaxTopK(logits, 40, 1)` +
    `decodeModel` — the same two helpers Gamble uses;
  - word input capped at 40 characters; letter input is one character;
    a letter absent from the word is allowed (true count 0 — the model's
    near-zero bar for 0 is a finding).
- Gamble ×2 with `presets` (no newlines): §3 `["47 * 23 = ", "47 * 23 =
  10", "1234 + 5678 = "]`; §4 `["Q: How many \"r\" are in \"strawberry\"? A:
  There are ", "Q: How many \"r\" are in s-t-r-a-w-b-e-r-r-y? A: There are
  ", "Q: How many \"r\" are in \"strawberry\"? A: Spelled out:
  s-t-r-a-w-b-e-r-r-y. The r's: r, r, r. So there are "]`. Same 135M model
  as §2; a wake in any section is instant in the others.
- Mock path (`?mockModel=1`): the X-ray's top half shows the mock's
  word-split "pieces"; the bottom half's histogram pools everything as
  "other" (the mock vocabulary has no digits). The draft hash/visibility
  tests need no real weights; the counting demo is browser-verified with
  the real model.
