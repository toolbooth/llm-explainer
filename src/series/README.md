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
