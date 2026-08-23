# Inside the Machine — the series

*Essay #1 (the seven-act flagship at the root URL) proved the format:
plain-language + your-own-input + live model + bilingual. The series turns
that format into a cadence.*

## Charter

- **Cadence** (revised 2026-08-23, author decision): **launch with the
  flagship plus every reviewed follow-up live on day one** (a body of work,
  not a single essay), then **one new essay per month** for as long as the
  attention window lasts. Inventory is built ahead of the publish calendar
  and decoupled from it; the publish flag flips only after the author's
  review (claims-care sentences + flagged zh renderings). Slowness was a
  cost, not a virtue: in the current LLM attention window a quarterly pace
  is opportunity cost.
- **Size**: every follow-up is *shorter* than the flagship — target
  **800–1200 words EN** (the flagship is the overture; the series is songs).
  One reader-facing question per essay, answered completely.
- **Engine reuse**: essays are made from the existing surface documented in
  `src/series/README.md` — nano engine, widgets, content architecture, i18n
  store. Budget **at most one new widget per essay**, and only when no
  existing widget can carry the section.
- **Bilingual from the start**: EN + 中文 as peer versions, same widgets,
  rewritten (not translated) voice — the flagship's `zh.tsx` discipline.
- **VISxAI-submittable**: each essay stands alone as an interactive-
  explainer submission — self-contained question, live evidence, honest
  limitations section. Keep per-essay CITATION metadata current.
- **Free and open**: no accounts, no tracking, all inference client-side.

## Shipping an essay

1. Draft `essays/NN-<slug>/OUTLINE.md` (blueprint first, code second).
2. Build under the module boundary in `src/series/README.md`; essay content
   tables replicate the `types.ts` + `en.tsx`/`zh.tsx` + parity-test pattern.
3. Flip the registry entry (`src/series/registry.ts`) from `draft` to
   `published` — the series index and every "More in this series" slot pick
   it up with no further wiring.

## Pipeline

| # | Working title | 中文 | Status |
|---|---|---|---|
| 1 | Inside the Machine (seven acts) | ChatGPT 到底在想什么 | shipping Q1 2027 |
| 2 | Why It Lies | 它为什么说谎 | blueprint — `essays/02-why-it-lies/OUTLINE.md` |
| 3 | The Attention-Head Field Guide | 野生 attention head 图鉴 | blueprint — `essays/03-attention-heads/OUTLINE.md` |
| 4 | Why It Can't Count | 为什么 AI 数不出 strawberry 有几个 r | blueprint — `essays/04-why-it-cant-count/OUTLINE.md` |
| 5 | backlog below | | candidate |

## Candidate backlog (#3, #4 built 2026-08-22; pool deepened 2026-08-23 for a monthly cadence)

| # | Candidate | One-line premise | Engine reuse |
|---|---|---|---|
| 3 | **The Attention-Head Field Guide** (注意力头图鉴) | A birdwatcher's guide to the sixteen gazes: name the recurring head species — previous-word heads, anchor heads, scatterbrains — and find each one live in the reader's own sentence. | AttentionRoom + `diagnoseHeads`, extended taxonomy |
| 4 | **The Temperature Knob** (温度旋钮) | One slider, no thinking: what temperature actually multiplies, why T=0 is still not truth, and where "creativity" really comes from. | Gamble + TheLoop presets |
| 5→4 | **Why It Can't Count** (为什么 AI 数不出 strawberry 有几个 r) | The strawberry lesson at full length: every character-level task the tokenizer quietly sabotages — counting, rhyming, reversing — demonstrated on the reader's own words. | Chopper + Gamble + one tokenizer X-ray widget |

| 5 | **Why It Repeats Itself** (它为什么开始复读) | The degeneration loop: greedy decoding walks into "the door opened the door"; watch the probability mass collapse and see why sampling, repetition penalties and temperature are all cures for the same disease. We have the artefact — distilgpt2's degenerate continuation from the 2026-08-20 eval. | TheLoop (greedy vs sampled, side by side) + Gamble |
| 6 | **How It Knows Word Order** (它怎么知道词的顺序) | Attention is a bag — so how does "dog bites man" differ from "man bites dog"? Positional signals, demonstrated by shuffling the reader's sentence and watching which heads flinch. | AttentionRoom + `hiddenStates`; one small "shuffle" widget |
| 7 | **中文为什么更贵** (Why Chinese Costs More Tokens) | The tokenizer tax: the same meaning costs 2–4× more tokens in 中文, and what that does to context windows, pricing and "fluency". The series' only essay whose zh edition is the primary and the EN the companion. | Chopper + Tokenizer X-ray on bilingual pairs |
| 8 | **King − Man + Woman** (向量算术) | Embedding arithmetic on the real 7.5 MB table: what works, what only works in the demos, and why "meaning is a place" has an exchange rate. | WordMap + `nearestNeighbors`; vector-arithmetic probe |
| 9 | **Same Sentence, Two Brains** (同一句话,两个脑子) | The 1M-parameter storybook model and the 135M assistant read the reader's sentence side by side: what scale buys, token by token. The live version of Act 6. | Gamble ×2 (nano + big) on one prompt |
| 10 | **What a Prompt Actually Does** (提示词到底改变了什么) | "You are a helpful assistant" is not an instruction to anyone — it's a shift of the dice. Show the distribution moving as the reader edits the prompt; prompt engineering as steering, not commanding. | Gamble (big) with prefix presets; a delta view |
| 11 | **The Context Window Is a Table, Not a Memory** (上下文窗口不是记忆) | Why it "forgets" the start of a long chat: attention over a fixed table, what falls off the edge, and why summaries work. | AttentionRoom with long inputs; a window-edge widget |
| 12 | **Why It Sounds Like an Assistant** (它为什么说话像客服) | Base model vs instruct-tuned model on the same prompt: where the "assistant voice" comes from, and what it costs. Needs a second big-model download — gate it. | Gamble ×2 (base vs instruct) — engine supports one big model today; extension needed |

Priority for the next build: **#5 and #9** (both are fully evidenced by artefacts we already have), then **#7** (the bilingual angle no one else can write), then #6/#8/#10. #11/#12 need engine work.

Backlog rules: an essay is promoted from the backlog only when its blueprint
answers the same five questions essay #2's does (question, sections+widgets,
payoff, zh title, claims-that-need-care).
