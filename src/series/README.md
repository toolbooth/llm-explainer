# The series layer — what a new essay may build on

"Inside the Machine" is a series; the seven-act flagship is essay #1. This
directory is the series' own furniture (registry, hash router, index page,
"More in this series"). Everything an essay is *made of* lives outside it.
This file is the module boundary: a new essay imports from the four surfaces
below and nothing else.

## 1. The nano engine (live dissection)

The hand-rolled GPT that makes attention/embeddings/logits inspectable. The
engine itself is the extracted **`nano-lm`** library (`"nano-lm":
"file:../nano-lm"`, zero runtime dependencies; this essay is its reference
consumer). Widgets import the essay-side wrapper first, the library second:

- `src/lib/nanoEngine.ts` — `getNano(onPct?)` shared singleton loader (all
  widgets on a page dissect the same 7.5MB brain, served from
  `public/weights/`), `NanoHandle` (`forward(ids)`, `meta`, `wte()`),
  `mockNano()` for tests/CI (`?mockModel=1`); re-exports `ForwardResult` /
  `NanoMeta`.
- `nano-lm` — `NanoGPT`, `ForwardResult` (logits + per-layer, per-head
  attentions + hidden states), `nearestNeighbors`, `diagnoseHeads`,
  `parseSafetensors`/`loadModel`, and the tensor primitives
  (`layerNorm`, `linear`, `geluNew`, `softmaxRow`) should you need a new
  probe. The library takes GPT-2 BPE token ids; `src/lib/engine.ts`'s
  `tokenize()` produces them.

For the bigger on-demand model (Acts 4–5 class widgets): `src/lib/engine.ts`
(`createEngine`, `Engine`, `displayPiece`) and `src/lib/prob.ts`
(`softmaxTopK`, `sampleFrom`, re-exported from `nano-lm`). Both respect
`?mockModel=1`.

## 2. The widgets

`src/acts/*.tsx` — Chopper, WordMap, AttentionRoom, Gamble, TheLoop. Each
takes an `engine` prop and manages its own model loading/progress UI.

Seam resolved (essay #2, commit e664168): Gamble and TheLoop take a `strings`
prop (`GambleStrings` / `LoopStrings`, same shape as the act4/act5 tables),
an `htmlId`, and optional `initialText` / `initialPrompt` / `presets`. Essay
#3 lifted AttentionRoom the same way (`AttentionRoomStrings` = the act3
table, `htmlId`, optional `initialText` / `initialLayer`), and essay #4
lifted Chopper (`ChopperStrings` = the act1 table, `htmlId`, optional
`initialText`). A new essay passes its own tables; the flagship passes its
own. WordMap still reads `useStrings()` directly — lift it the same way the
first time a second essay needs it.

Engine surface added by essay #4: `Engine.tokenizeModel(text)` — the Act-4
model's own tokenizer (pairs with `decodeModel`/`lastLogits`; loads the
tokenizer alone, never the model). `tokenize()` stays GPT-2 BPE for the
Chopper and the nano model.

## 3. The content architecture

Per-essay pattern, replicated rather than shared (each essay owns its prose):

- an `EssayStrings`-style interface (`src/content/types.ts`) — every string
  typed, JSX-returning functions for prose with inline markup;
- one table per locale (`en.tsx`, `zh.tsx`) satisfying that interface, so
  key parity is a compile error;
- a deep key/type-parity test (`test/content.test.ts`'s `typedPaths`
  walker) catching drift beyond what TS enforces.

A new essay creates its own `types.ts` + `en.tsx` + `zh.tsx` (e.g. under
`src/essays/<slug>/content/`). Do **not** import essay #1's `content/en.tsx`
/ `content/zh.tsx` — those tables are essay #1's prose, not a shared pool.

## 4. The i18n store

`src/content/i18n.tsx` — the language *store* is series-global (one `itm-lang`
choice across all essays):

- `useLang()` — current `Lang`, re-renders on toggle; for anything outside
  essay #1's string tables (this directory uses it).
- `setLang`, `LangToggle` — the shared toggle UI.
- `useStrings()` / `useI18n()` — bound to essay #1's tables; a new essay
  writes the same two-line hooks over its own tables instead.

## Series furniture (this directory)

- `registry.ts` — `ESSAYS` (id, slug, EN/zh title, `published | draft`),
  `publishedEssays()`, `essayHref()`. Ship an essay by flipping its status.
- `route.ts` — dependency-free hash router: `#/essays…` → index, anything
  else → essay #1 at the root URL.
- `SeriesIndex.tsx`, `MoreInSeries.tsx` — render published entries only, so
  drafts never leak into the UI.
- `CiteThis.tsx` — the "Cite this" block (BibTeX in a scrolling `<pre>` +
  copy button). Takes the essay's `CiteStrings` table and a BibTeX string;
  the flagship's comes from `src/content/citation.ts`, which is also the
  source of truth for index.html's Google Scholar meta tags and CITATION.cff.

## The Classroom Edition (`src/classroom/`) — a second front door, same engine

`#/classroom…` is a fourth top-level route (`route.ts` → `"classroom"`), and
everything under it is its own sub-router (`src/classroom/route.ts`: index /
`<module>` / `<module>/step-N` / `<module>/guide` / `<module>/unplugged`).
It builds on the same four surfaces as an essay and adds nothing to them:

- `src/classroom/registry.ts` — the six-module plan (`MODULES`); only
  `status: "available"` modules get pages. Never an `ESSAYS` entry, so the
  classroom cannot appear in any essay listing; the only way in is the small
  link under the series index and the URL.
- `src/classroom/config.ts` — `CLASSROOM` (big model hidden, temperature ≤
  1.5). Widgets learn the cap only as an explicit prop; the flagship and the
  essays never import this file.
- Widget seams lifted for it (all optional, absent → DOM unchanged):
  Chopper `presets` + `inputLabel`; Gamble / TheLoop `maxTemperature`
  (defaults exported as `GAMBLE_TEMP_RANGE` / `LOOP_TEMP_RANGE`);
  TokenizerXray `tokenizer: "shared" | "model"` and `modelGate: false` (a
  tokenizer-only X-ray over `XrayTokenizerStrings`); Gamble `model: "nano"`
  (phase 2: the bars come from the shared 7.5 MB brain via `getNano`, GPT-2
  vocabulary, no wake-up gate, optional `loading` string — the flagship and
  the essays keep the big-model gate).
- The one new classroom widget, **Hundred Rolls** (`m2/HundredRolls.tsx`
  over the pure `m2/rolls.ts`: seeded PRNG, `rollMany`, `tally`, dice-cell
  allocation), samples one position 100× and shows empirical vs. model
  probabilities; `m2/DiceGrid.tsx` draws the printable's 6×6 tables from the
  same allocation.
- Module pages: `Module`, `Guide`, `Unplugged`, and an optional `Slides`
  (`#/classroom/<id>/slides`, only for modules with `slides: true` in the
  registry — M2 in the MVP).
- The shared tokenizer is self-hosted (`public/tokenizers/gpt2/`, built with
  `GPT2Tokenizer` from two same-origin fetches in `src/lib/engine.ts`); a
  classroom page never contacts a third-party host.
- Light theme: `ClassroomFrame` puts `classroom-light` on `<html>` while
  mounted; `classroom.css` re-points the tokens and the widgets' hard-coded
  dark surfaces under `:root.classroom-light`.
- `hints.ts` + `HintPanel.tsx` — progressive hints; `ClassroomFrame.tsx` —
  shared nav/hero/footer; `classroom.css` — scoped styles incl. `@media print`.
- Per-module content replicates the essay pattern: `m1/content/{types,en,zh,
  i18n}` is one table for the lesson page, the teacher guide and the unplugged
  sheet, so the guide renders the page's prompts and hints from the same
  source; live inputs (sentences, chips, strips, verified cuts) live in
  `m1/data.ts` (M2: `m2/data.ts`, every number measured on the real model
  and re-checked by `test/m2-data.test.ts`). A module registers its pages in
  `m1/index.ts` / `m2/index.ts` (`registerModulePages`) and `src/main.tsx`
  imports it.
