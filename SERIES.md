# Inside the Machine — the series

*Essay #1 (the seven-act flagship at the root URL) proved the format:
plain-language + your-own-input + live model + bilingual. The series turns
that format into a cadence.*

## Charter

- **Cadence**: quarterly, starting after the flagship's Q1 2027 launch.
  One essay per quarter is a pace the engine subsidizes; the writing is the
  bottleneck, and that's the part worth being slow at.
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
| 3–5 | backlog below | | candidates |

## Candidate backlog (essays #3–5)

| # | Candidate | One-line premise | Engine reuse |
|---|---|---|---|
| 3 | **The Attention-Head Field Guide** (注意力头图鉴) | A birdwatcher's guide to the sixteen gazes: name the recurring head species — previous-word heads, anchor heads, scatterbrains — and find each one live in the reader's own sentence. | AttentionRoom + `diagnoseHeads`, extended taxonomy |
| 4 | **The Temperature Knob** (温度旋钮) | One slider, no thinking: what temperature actually multiplies, why T=0 is still not truth, and where "creativity" really comes from. | Gamble + TheLoop presets |
| 5 | **Why It Can't Count** (它为什么数不对) | The strawberry lesson at full length: every character-level task the tokenizer quietly sabotages — counting, rhyming, reversing — demonstrated on the reader's own words. | Chopper + tokenizer probes |

Backlog rules: an essay is promoted from the backlog only when its blueprint
answers the same five questions essay #2's does (question, sections+widgets,
payoff, zh title, claims-that-need-care).
