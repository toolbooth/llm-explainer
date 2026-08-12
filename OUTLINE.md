# Inside the Machine — an interactive guide to how LLMs actually think
*(working title; 中文版:《ChatGPT 到底在想什么》)*

> One long-form interactive essay. The reader types their own sentence and
> watches a REAL model — running in their browser — tokenize it, embed it,
> attend over it, and gamble on the next word. Not an animation. A live organ.

## Reference class & the gap

- Jay Alammar "Illustrated Transformer": static, dev-leaning, cited by every
  course on earth — proves citation value.
- Brendan Bycroft's 3D LLM viz: gorgeous, but for engineers.
- **Gap: plain-language + your-own-input + live model + bilingual (EN/中文).**

## The seven acts

| # | Act | Interactive | Model requirement |
|---|---|---|---|
| 1 | **The Chopper** — your sentence becomes tokens | live tokenizer on user input; the strawberry-r's payoff | tokenizer only |
| 2 | **Words as Numbers** — embeddings | nearest-neighbor explorer over a precomputed vocab map | precomputed |
| 3 | **The Attention Room** — who looks at whom | live attention heatmap on user input; layer/head picker; plain-language reading of heads | ⚠️ needs attention weights |
| 4 | **The Gamble** — next-token probabilities | live probability bars; temperature slider morphing the distribution | logits |
| 5 | **The Loop** — autoregression | watch it write, one gamble at a time, probabilities exposed | logits + sampling |
| 6 | **The Zoom-Out** — from this toy to GPT-5 | parameter-count visual; what scale buys | none |
| 7 | **Why It Lies** — hallucination explained by acts 1–5 | callbacks to earlier widgets | none |

Every act = independently linkable/embeddable widget (teachers embed one act).

## Architecture principles

- Static site, all inference client-side (zero marginal cost, the portfolio rule).
- Progressive: acts 1–2 work instantly (tiny assets); acts 3–5 load a small
  model on demand with progress UI.
- Bilingual from the start: prose in EN + 中文, same widgets.

## S0 spike results (2026-08-12) — VERDICT: GREEN LIGHT

Probed `Xenova/distilgpt2` via transformers.js in Node (`spike/probe.mjs`):

1. **Tokenizer ✅** — standalone, 485ms load. Bonus: `strawberry` →
   `['st','raw','berry']` — Act 1's payoff demo confirmed with real output.
2. **Logits ✅** — forward pass returns `logits [1, seq, 50257]`; top-5 for
   "The cat sat on the" = back/ground/bench/floor (sane). **Acts 4–5 fully
   feasible with the stock model.**
   **Attentions ❌** — outputs expose only logits + KV cache (`present.*`);
   no queries, so attention can't be reconstructed from stock ONNX.
3. **Latency ✅** — 4–9ms/forward on CPU (Node). Even at 10× in browser WASM,
   live per-keystroke inference works.

**Act 3 decision: fallback (b) — hand-rolled tiny GPT in pure TS.**
Rationale: full control of every intermediate tensor (attention, embeddings,
logit lens later), no self-hosted ONNX complexity, and the size itself becomes
pedagogy ("the entire model you're dissecting is a few MB"). Weight candidate:
TinyStories-class checkpoint; architecture port is S2's first task (watch for
GPT-Neo local-attention quirks vs plain GPT-2 — prefer a GPT-2-arch checkpoint).

## Milestones

- **S0 (now)**: spike — answer the three questions above
- S1: act 1 + act 4 shipped as a teaser page (the two cheapest, most magical)
- S2: act 3 (whichever fallback the spike selects) + acts 2, 5
- S3: prose polish EN/中文, acts 6–7, design pass
- S4: launch — HN / X / 少数派/知乎 (2027 Q1, between AI Year seasons)
