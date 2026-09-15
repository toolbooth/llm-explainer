# Why It Repeats Itself — essay #5 of the Inside the Machine series
*(中文版:《为什么它复读》)*

> The reader-facing question: **why does a language model fall into "The cat
> sat on the mat. The cat sat on the mat." — and why do temperature and
> penalties cure it?** The degeneration loop, taught with the real machinery:
> greedy decoding is a deterministic map, so a revisited state means a cycle;
> repetition self-reinforces, so the cycle deepens as it is walked; and every
> anti-repetition control on every API settings page is the same medicine —
> dice. The reader watches a real model (the shared 7.5MB nano brain — this
> essay never wakes the big model) chant, measures the chant deepening, and
> breaks it with the temperature dial. Target 800–1200 words EN (series
> charter). Backlog entry #5, promoted 2026-09-15.

## The sections

| # | Section | Interactive | Widget source |
|---|---|---|---|
| 1 | **The Groove** — greedy decoding takes the bet sheet's favorite, every step: no dice means determinism (same prompt, same story, forever) and grooves (a revisited neighborhood replays) | greedy runs on measured looping presets: `Tom and Lily went to the park.` chants *"It was red and blue."* ×5 (6-token cycle) and frays on lap six; `The bird flew up.` quasi-chants ×4 then ends the story by itself. Repeated n-grams in the ACTUAL output get highlighted, same span same color; a verdict line quotes the dominant repeat | **NEW widget: The Parrot** — the essay's single new component (TheLoop's autoregressive machinery + greedy toggle + repeat detection in pure `loops.ts`; shared nano engine via `getNano`, no big-model gate) |
| 2 | **The Groove Deepens** — repetition recruits: each copy of a sentence raises the odds of another copy (the literature's "self-reinforcement"), measured honestly at this scale | bet-sheet bars on `The cat sat on the mat.` ×1/×2/×3: the " The" bar climbs 26% → 51% → 59%; the prose carries the whole-sentence climb (1 in 500k → 1 in 1,200, ×404) and the rising "\n" bar (the storybook's own exit: end the story) | **reuse: Gamble** in `model: "nano"` mode (classroom phase-2 seam — first essay use) |
| 3 | **Shake the Needle** — temperature from inside a live loop: measured per-lap survival under the widget's own top-k=8 sampler; survival RISES lap over lap (28→43→55% at T=0.3) — self-reinforcement inside the chant | reader runs `The man said` greedy into the *"You have to be careful and respectful."* chant (8-token lap ×3 by token 80), then unlocks the greedy toggle and Continues at different T; measured: one more lap survives at T=0.3 ~55%, T=0.5 ~21%, T=0.8 ~3%, T=1 ~1% | **reuse: The Parrot** (second instance, same presets, T slider unlocked) |
| 4 | **The Pharmacy** — temperature, top-p/top-k, presence/frequency penalties, no-repeat-n-gram bans: one prescription in different bottles (stop letting the map be only a map), each with side effects (legitimate repetition gets taxed too) | prose-only act (flagship act-6/7 precedent) | — |

Every widget section is independently linkable
(`#/essays/why-it-repeats/sec-1` … `sec-3`; `sec-4` anchors the prose act).

## The pedagogical payoff

One sentence to keep: **repetition is what "always take the best word" does
— a deterministic map, fed its own output, walks into a cycle, and every lap
makes the next lap more likely.** Second payoff, the strange one: this is
the single place in the machine where randomness is load-bearing — essay #2
showed the dice inventing citations (the cost); this essay shows what the
same dice buy (motion). Third, the honest one: at 1M parameters the loops
are real but leaky — greedy itself frays out of the red-blue chant on lap
six, and the bird preset chants its way to "The End" — because the model
rereads the whole growing context, so laps are not identical states. The
finite-state trap is stated as the conditional it is.

## 中文版

- Title: **《为什么它复读》** — registry entry `why-it-repeats` carries both
  titles as a draft; the h1 renders without 书名号 (ZH-REVIEW global
  decision 1). 「复读机」 is the Chinese internet's own word for this
  failure and becomes the widget's zh name; the vinyl metaphor (跳针 /
  晃一晃唱针 / 抬起唱针) carries the section titles.
- Same rewrite-not-translate discipline as `src/content/zh.tsx`: single-line
  JSX strings; technical terms annotated once then kept in English
  (greedy decoding → 贪心解码、self-reinforcement → 自我强化、
  neural text degeneration → 神经文本退化).
- Canonical chrome reused verbatim: 「▶ 开写 / ⏸ 停下 / ▶ 继续 / 单步 /
  重来」 family from essay #1 act 5 (the Parrot has no 单步), 「想一想 /
  🧊 谨慎 / 🔥 狂野 / 🎲 掷骰子」 in the nano Gamble.
- Presets stay English (the model only read English storybooks); the zh
  intro says so.

## Claims that need care — say what was measured, not the folklore

- **Every loop quoted is a real greedy continuation of THIS model**
  (2026-09-15 measurement run; tables in REVIEW-05.md, re-verified in CI by
  `test/essay5-data.test.ts` against the live weights). No invented loops,
  no scripted widget content: highlighting and verdicts come from
  `findRepeats` over the ids the model just produced.
- **The finite-state-cycle argument is a conditional, stated as one.** "If
  the model chose from only the last few words, one revisit would trap it
  forever." Our model rereads the whole growing context (positions differ),
  so its chants measurably fray: the red-blue chant breaks on lap six, the
  bird preset ends the story. Do NOT claim this model loops forever; DO
  say bigger models historically locked in harder (Holtzman et al. 2020,
  greedy and beam search on GPT-2 — named in the Act-1 widget note).
- **Self-reinforcement is claimed at its measured size.** At this scale it
  is real but gentle: the " The" bar 26→51→59%; the whole-sentence encore
  probability ×404 from one copy to four yet still ~1/1,200 — which is
  exactly why this model rarely echoes the reader's sentence and digs its
  own ruts instead. The strong version ("captures the whole continuation")
  is attributed to bigger models via Xu et al. 2022 ("Learning to Break the
  Loop", named in the Act-2 widget note). Inside the live chant the per-lap
  survival climb (28→43→55% at T=0.3) is the same phenomenon, measured
  with the widget's own sampler.
- **Escape-temperature numbers are tied to the exact sampler.** Top-k = 8
  temperature sampling (essay #1's Act 5 machinery) on the exact logits of
  the measured chant; the Act-3 note says so. No claim that T=1 "fixes"
  repetition in general — the model can wander back (self-reinforcement
  pulls), and essay #2 owns the cost of high T.
- **Product claims stay modest.** Assistants rarely chant because sampling
  defaults, tuned penalties and fine-tuning suppress it — "paved over, not
  filled in". No named frontier model, no claim about any specific product's
  sampler.
- **Penalties tax legitimate repetition** — names, code, lists. The
  pharmacy act says so in the body, not a footnote.
- **No intent language.** The model never "wants" to repeat or "refuses" to
  stop; the dice "refuse" nothing — they are dice. The only agent verbs
  are the reader's.

## Engine notes (for the implementation step)

- **The Parrot** = one component (`Parrot.tsx`) + pure `loops.ts`
  (`findRepeats`: exact repeated n-grams MIN_N=3…MAX_N=20, coverage-scored
  greedy assignment, small-period windows dropped so a chant reports its
  smallest unit; explicit period-1/2 run candidates; `mulberry32` for the
  mock dice). Greedy toggle = argmax (dist shown at T=1 in the popover);
  sampling = `softmaxTopK(logits, 8, T)` + `sampleFrom`, exactly TheLoop's.
  40 tokens per press, Continue extends to 160. Under `?mockModel=1` the
  dice are seeded, so runs are deterministic; the initial DOM (hashed) has
  no steps either way.
- **Gamble nano mode** (`model: "nano"`) — the classroom phase-2 seam,
  first used by an essay here; loads on mount with a progress line, no
  gate, thinks about preset ×1 immediately.
- Presets live in `WhyItRepeats.tsx` (live data, English), never in the
  content tables — `test/essay5-content.test.ts` enforces.
- Measured-data discipline: `test/essay5-data.test.ts` re-runs the greedy
  walks, the bars and the survival products against the shipped weights on
  every CI run (~8 s).
