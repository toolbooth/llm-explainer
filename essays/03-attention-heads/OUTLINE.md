# The Attention-Head Field Guide — essay #3 of the Inside the Machine series
*(中文版:《野生 attention head 图鉴》)*

> The reader-facing question: **you saw one attention matrix — what are the
> 128 heads actually doing?** Essay #1's Act 3 handed the reader a layer
> slider and a strip of sixteen head buttons, and three auto-discovered
> badges. This essay takes the strip seriously: it runs a census of every
> head in the reader's own sentence, sorts the population into the few
> recurring patterns a birdwatcher would recognise, and is honest about the
> large remainder that fits no page of the guide. Target 800–1200 words EN
> (series charter).

## The four sections

| # | Section | Interactive | Widget source |
|---|---|---|---|
| 1 | **Sixteen Gazes** — the matrix in essay #1 was *one head*; a layer holds sixteen, the model eight layers: 128 readings of the same sentence | the reader's sentence in the Attention Room, opened on layer 2 (where this model's structured heads cluster); scrub the head strip and watch the same words get read sixteen ways | **reuse: AttentionRoom** (lifted to a `strings`/`htmlId`/`initialText`/`initialLayer` prop surface — the seam `src/series/README.md` §2 says to close the first time a second essay needs it; flagship DOM byte-identical) |
| 2 | **The Census** — type a sentence, count the species | the reader types a sentence; the widget runs the real model once, scores all layers×heads against four cheap templates (looks at itself / the previous word / two words back / the first token) plus a near-uniform "wash" test, and lays the population out as a grouped gallery of thumbnails, each with its evidence score; click any head to see the five scores behind its label | **NEW widget: HeadScanner** — the essay's single new component (one `forward()`, pure scoring in `scanner.ts`, canvas thumbnails; no new model surface, no new dependency) |
| 3 | **Three Species, Up Close** — what a previous-word head, an anchor head and a wash *look like* in the matrix | the Attention Room's three badges jump to this sentence's strongest example of each; the prose teaches the visual signature (a stripe just under the diagonal; a solid first column; an even smear) so the reader can spot them unaided | **reuse: AttentionRoom**, second instance, fresh sentence |
| 4 | **The Unlabeled Majority** — most heads are neither stripe, column nor wash | the reader takes any "unlabeled" head from the census above, dials its layer and head into this Room, and reads a pattern that is plainly structured and plainly nameless | **reuse: AttentionRoom**, third instance, opened on layer 7 |

Every section = independently linkable widget, same as the flagship's acts
(`#/essays/attention-heads/sec-1` … `sec-4`).

## The pedagogical payoff

The reader leaves with the one correction the flagship couldn't afford to
make in a single act: **attention isn't one thing.** It is a population —
128 small readers of the same sentence, each with its own habit — and the
habits that recur (previous-word, anchor, self, wash) were *discovered, not
designed*: no one wrote "look at the word before"; training found that a
head doing so is useful and kept it. The second half of the payoff is the
honest one: the field guide has four pages and the forest has more species
than that. Most heads resist simple labels, the census says so in numbers,
and the reader gets to look at the unlabeled ones with their own eyes rather
than take our word that they are "doing something."

## 中文版

- Title: **《野生 attention head 图鉴》** — 图鉴 is the Pokédex / bird-guide
  register; 野生 says the specimens are wild-caught in the reader's own
  sentence, not staged. Registry entry `attention-heads` carries both
  titles as a draft; the h1 renders without 书名号 (ZH-REVIEW global
  decision 1).
- Same rewrite-not-translate discipline as `src/content/zh.tsx`: single-line
  JSX strings; technical terms annotated once then kept in English
  (attention head → 注意力头/head, entropy → 熵, uniform → 均匀分布).
- The three species names essay #1 already canonised stay verbatim
  (盯前一个词的头 / 锚在句首的头 / 目光最散的头); the census adds
  照镜子的头 (self) / 隔一个词的头 (two-back) / 无名氏 (unlabeled).
- Default sentences stay English (the model only reads English); the zh
  prose says so in §1, as the flagship does.

## Claims that need care — do not overclaim mechanistic certainty

- **Labels are heuristics from attention statistics on a 1M-parameter toy.**
  "Previous-word head" means: on *this* sentence, this head's attention
  lands on the previous token at ≥1.75× the rate an even spread would. It
  is NOT a claim about what the head computes, NOT a mechanistic-
  interpretability result, and NOT a statement about frontier models. The
  literature on induction heads and circuits is about bigger models with
  methods this essay doesn't use (ablation, activation patching); name it
  only as a pointer, never as something the reader "is looking at."
- **No anthropomorphic "the head wants."** Heads don't want, decide,
  prefer or choose. Say where the weight lands: "puts its weight on", "the
  pattern sits on", "lands on." The birdwatcher framing is about *our*
  naming, not the head's intent — the essay should say so once.
- **Say plainly that most heads resist labels.** In calibration (four
  sentences, 7–15 tokens) the census labels roughly 10–40 of 128 heads with
  a focused pattern, calls 50–70 "wash", and leaves 25–60 unlabeled. §4 is
  built around that remainder; the prose must not imply the four templates
  cover the population.
- **Attention ≠ explanation.** A head's pattern shows where weight went,
  not why the model's output came out as it did; the same pattern can feed
  a value vector that matters or one that doesn't. A label describes the
  pattern, not its function.
- **Labels are per-sentence snapshots.** A head that reads as "anchor" on
  one sentence may be "wash" on the next (the calibration shows exactly
  this). The census is a snapshot of a population on one input, not a
  species ID card; the threshold (1.75× lift, 0.9 normalized entropy) is a
  design choice, said out loud in the widget note.
- **"Discovered, not designed" is a claim about training, not about
  intent.** Nobody hand-coded these patterns — true. Training "wanted" them
  — not a sentence this essay writes.

## Engine notes (for the implementation step, later)

- All four sections run on the nano model (`src/lib/nanoEngine.ts`,
  `nano-lm`): `forward(ids)` returns `attentions[layer][head]` as row-major
  `[seq, seq]`; one call per sentence is milliseconds.
- **AttentionRoom lift** (budgeted as reuse, per README §2): `strings:
  AttentionRoomStrings` (= `EssayStrings["act3"]`), `htmlId`, optional
  `initialText` / `initialLayer`; `MatrixRow` takes `futureMasked` as a prop
  instead of calling `useStrings()`. `App.tsx` passes `t.act3`, `"act-3"`
  and nothing else, so the flagship's DOM is unchanged (verify the sha256s).
- **HeadScanner** = one component + `scanner.ts` (pure, unit-tested without
  a model):
  - templates: self (offset 0, rows q≥1), prev (offset −1, q≥2), prev2
    (offset −2, q≥3), anchor (column 0, q≥2) — the q floors keep prev/anchor
    and prev2/anchor from coinciding on the rows where they'd be identical;
  - per template: `share` = mean attention on the target, `lift` =
    share ÷ the same mean under an even spread (1/(q+1)); the evidence the
    reader sees is the lift, shown with the share;
  - `wash` = mean normalized row entropy (H/ln(q+1), rows q≥2) ≥ 0.9;
  - decision: the template with the highest lift wins if lift ≥ 1.75; else
    wash if entropy ≥ 0.9; else `unlabeled` (the closest template and its
    lift are still reported). `null` for seq < 4;
  - calibration on the real weights (2026-08-22, four sentences): strongest
    self heads L2H8/H13/H11 at 2.2–2.7×; prev L2H8, L2H12, L5H7, L6H7 at
    ~2×; anchor L1H4 3.6×, L1H3 3.3×, L0H8 2.8× (sentence-dependent);
    prev2 never past 1.9×; absolute shares never reach 50% on any template
    (head dim is 4), which is why the score is a lift, not a share.
- Thumbnails: one small `<canvas>` per head (128 × seq² pixels — trivial);
  click selects a head and shows its five scores as bars. The component
  draws from `?mockModel=1` attentions in CI just as well, so the draft
  hash/visibility checks need no real weights.
- AttentionRoom keeps calling `diagnoseHeads` for its three badges; the
  scanner is a population view, not a replacement.
