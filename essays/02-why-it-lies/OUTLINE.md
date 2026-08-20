# Why It Lies — essay #2 of the Inside the Machine series
*(中文版:《它为什么说谎》)*

> The reader-facing question: **you watched it think — so why does it
> confidently make things up?** Essay #1's Act 7 answered this in prose.
> This essay answers it with the reader's own hands: they force the machine
> to bet on facts it cannot know, watch a fake citation assemble itself one
> reasonable token at a time, and learn one honest, practical tell for
> spotting confabulation. Target 800–1200 words EN (series charter).

## The four sections

| # | Section | Interactive | Widget source |
|---|---|---|---|
| 1 | **The Bet It Can't Refuse** — a language model has no silence token: every prompt *must* end in a distribution over next words | probability bars on fact-shaped prompts the model can't know — preset "The capital of Atlantis is", plus the reader's own question | **reuse: Gamble** (probability bars + temperature), fact-shaped preset prompts |
| 2 | **Citation-Shaped Dice** — plausible-next-token, chained, with no anchor to reality | watch it write a fake reference from the preset "References: [1]" — hover any token to see the reasonable local bet that produced it | **reuse: TheLoop** (confidence-colored autoregression), citation preset |
| 3 | **The Re-Roll Test** — if it *knew*, asking again would get the same answer | ask the same prompt k times at the same temperature; the widget aligns the k continuations and highlights where they agree vs scatter — stable spans read like memory, scattering spans read like dice | **NEW widget: ReRoll** — the essay's single new component (k samples via the existing engine + `prob.ts`; alignment + agreement highlighting is the only new code) |
| 4 | **Sharp vs Flat** — the shape of the bet is the closest thing the model has to felt confidence | side-by-side presets through the same bars: "The capital of France is" (peaked) vs "The capital of Atlantis is" (flat-ish); read entropy as a *tell*, never as a truth-meter | **reuse: Gamble**, dual-prompt preset variant |

Every section = independently linkable widget, same as the flagship's acts.

## The pedagogical payoff

The reader leaves with a working *behavioral* model of hallucination —
"the machine samples from plausibility, and plausible is not true" — plus
two tells they can use tomorrow: **re-roll scatter** (§3) and **distribution
shape** (§4), each delivered with its failure modes attached. The emotional
arc mirrors Act 7's: not "the machine is broken" but "the machine is doing
exactly what you watched it do all series, in a place where plausible and
true disagree."

## 中文版

- Title: **《它为什么说谎》** (registry entry `why-it-lies` already carries
  both titles as a draft).
- Same rewrite-not-translate discipline as `src/content/zh.tsx`: single-line
  JSX strings, technical terms annotated once then kept in English
  (hallucination/confabulation → 幻觉, entropy → 熵).
- Preset prompts stay English (the models only read English); the zh prose
  points this out, as the flagship does.

## Claims that need care — do not overclaim mechanistic certainty

- **We demonstrate a sampling mechanism, not the cause of any specific
  hallucination.** The essay may say "this is how output is produced, and
  here is fact-shaped output produced with no fact behind it." It may NOT
  say "this is why GPT-5 invented that court case" — frontier hallucination
  involves training-data, RLHF and retrieval dynamics our 7.5MB/135M toys
  don't have. Say so, in the essay body, not a footnote.
- **No intent language.** "Lies" is the title's hook; the body must
  disarm it early: confabulation without a speaker, no knowledge of
  truth to betray. The machine is never "hiding" anything.
- **Entropy is not a truth-meter** (§4's own caveat): models are routinely
  confidently wrong, calibration varies by model and domain, and a peaked
  distribution can encode a popular misconception perfectly.
- **Re-roll agreement is a heuristic** (§3's own caveat): self-consistency
  correlates with memorized/true content but can also lock onto a
  well-learned falsehood; k samples at one temperature is a probe, not a
  proof.
- **Not unfixable-by-definition.** Retrieval grounding and calibration
  training measurably reduce hallucination; the essay explains why the
  *default* behavior confabulates, not why improvement is impossible.

## Engine notes (for the implementation step, later)

- §1/§4 run on the on-demand 135M model (`src/lib/engine.ts`), §2 on the
  nano model — both already load lazily with progress UI.
- ReRoll is one component: k× `lastLogits` + `sampleFrom` loops, then a
  token-level agreement view. No new model surface, no new dependency.
- Per `src/series/README.md`: this essay's build is the moment widget
  chrome strings get lifted out of essay #1's tables (strings prop or
  shared table) — budgeted as part of reuse, not as a new widget.
