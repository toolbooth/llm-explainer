# Classroom Edition — phase 2 review sheet (REVIEW-CLASSROOM-2)

For the author and any teacher-facing reviewer. Three parts: **what to
check as a teacher** (M2's prompts, hints, dice sheet, slides, zh voice —
with the ten least-confident renderings), **the measured numbers the
answer key is built from**, and **open questions**. Source text is
`src/classroom/m2/content/{en,zh}.tsx` (module 2: page + guide + sheet +
slides) and `src/classroom/m2/data.ts` (every number, measured); the
product brief is `classroom-edition/PRODUCT.md` (§4.2 M2 + Hundred Rolls,
§4.3 skeleton, §5 guide outline, §6.1/§6.2 budget and network, §10.1 MVP).

**How to review live**: `npm run dev`, then

| page | URL (add `?mockModel=1` to run without weights, `&lang=zh` for 中文) |
|---|---|
| module index | `#/classroom` (M1 and M2 available; M3–M6 planned) |
| M2 lesson page | `#/classroom/m2` · steps: `#/classroom/m2/step-1` … `step-3` |
| M2 teacher guide | `#/classroom/m2/guide` (Print button; §6 is the dice answer key) |
| M2 unplugged printable | `#/classroom/m2/unplugged` (two dice, three tables) |
| M2 slides companion | `#/classroom/m2/slides` (ten slides on one print page) |

Under `?mockModel=1` the nano model is a fake with flat logits, so the
bars are meaningless — review M2 with the real model (no query param; the
7.5 MB weights load once from `/weights/`).

## What was built (three commits on top of `d3700ed`)

- **A — self-hosted tokenizer** (`c665478`). `public/tokenizers/gpt2/`
  holds `tokenizer.json` (2,107,653 bytes) and `tokenizer_config.json`
  (234 bytes), byte-identical to the `Xenova/gpt2` files (sha256
  `cda20b8c…` / `551e26ec…`; ~597 KB gzipped on the wire).
  `src/lib/engine.ts` builds the shared tokenizer with
  `new GPT2Tokenizer(json, config)` from two same-origin `fetch`es of
  root-relative paths — no hub resolution, no `env` flag, no host name in
  that code path, so a missing file is an error rather than a remote
  fallback. The Act-4 SmolLM2 path (`AutoTokenizer`/`AutoModel` via the
  hub) is untouched. `CLASSROOM.assets` carries the §6.1 budget as data
  (tokenizer 2.1 MB + weights 7.5 MB = 9.6 MB < 10 MB), checked against
  the files on disk. Privacy lines (EN/zh) now say "from this site's own
  server, no third-party host"; nano-lm's README gained the recipe
  (sibling repo, edited in place, **not committed there**).
- **B — light theme** (`56d44b1`). `ClassroomFrame` sets `classroom-light`
  on `<html>` while any classroom page is mounted (and the theme-color
  meta), removes it on unmount; `classroom.css` re-points the series
  tokens under `:root.classroom-light` (text 17:1, muted 8.6:1, dim 5.9:1,
  accent 8.3:1, warm 6.0:1 on the page; bar fill 6.7:1 / 4.1:1 on its
  track; chip ink ≥ 8:1 on its tint — computed before chosen) and the
  widgets' hard-coded dark surfaces one by one. Essays stay dark (verified
  across SPA route changes); print rules unchanged.
- **C — Module 2 "The Next-Word Gamble" / 下一个词的赌局**, following
  §4.3 exactly: Hook (0–3, projector Gamble on the nano model) →
  Unplugged (3–13, link to the dice printable) → Guided exploration
  (13–33; Step 1 Gamble with chips, Step 2 **Hundred Rolls**, Step 3
  TheLoop; three progressive hints and a write-down each) → Evaluation
  act (33–40, three judgment questions, on paper) → Exit ticket (40–45,
  three questions) → Block extension (+45: Gamble on "fact" sentences,
  structured debate on HS-SOC-HU-44). Every widget runs TinyStories-1M
  with the 1.5 cap; no big-model gate is mounted anywhere.
  - **Hundred Rolls** (`m2/HundredRolls.tsx` over the pure `m2/rolls.ts`):
    same input/temperature as the Gamble, one press = 100 rolls (ten
    animated batches; one batch under `prefers-reduced-motion`), presses
    accumulate (200, 300 …), two bars per word (model probability,
    outlined; share of rolls, solid), a polite live-region summary, a real
    `<table>` behind a native `<details>`, chart `aria-hidden`. Text or
    temperature change resets the tally (the distribution changed).
  - **Gamble `model="nano"`** lift: bars from `getNano`, GPT-2 decode,
    loads on mount with a progress line, thinks about the initial text
    once ready. Absent → the flagship/essay DOM is unchanged.
  - **Teacher guide** (§5 items 1–14 in order). §6 renders the three dice
    tables and their word/probability/cells key from `data.ts`; §10's
    sample responses take their numbers from the measured runs; §14 links
    the slides and carries the Canvas snippet.
  - **Unplugged printable**: two dice × three 6×6 tables along the
    model's favourite spine (`The cat sat on the` → ` grass` → ` and`),
    cells allocated by largest remainder from the measured T = 1
    probabilities; the branch note tells a pair what to do when their roll
    leaves the spine. No probabilities on the sheet (they are the guide's
    answer key).
  - **Slides companion**: `#/classroom/m2/slides`, ten 16:9 cards on one
    print-oriented page (one per page in print), speaker notes under each,
    bars/temperatures/dice table/deep links rendered from the same data.
  - Router: `slides` page kind (only for modules with `slides: true`; M1's
    `/slides` falls back to its lesson page); registry M2 → available;
    index shows a Slides link; `src/classroom/lesson.ts` shares the step
    label / beat-jump helpers between M1 and M2.
  - M1's exit-Q2 L3 sample softened to measured-only wording ("bare
    'strawberry' — no space in front — is rarer in text") in EN and zh.

## Verification record (2026-08-22)

- `npm test`: **142 tests, 20 files** (110 pre-existing + 32 new:
  tokenizer locality incl. a fetch stub proving the two root-relative
  URLs; hundred-rolls logic — seeded PRNG, exact counts for an evenly
  spaced generator, law-of-large-numbers convergence, tally/winner/TVD,
  temperature clamp to the cap, dice allocation incl. the measured hook
  table `[8,5,5,4,4,2,2,2,2,2]`; M2 parity incl. array lengths, §4.3/§5
  counts, 8–12 slides with known visual keys, canonical zh strings,
  interpolations, "no measured number typed into a table", dice-table
  self-consistency, facts derived from data; `test/m2-data.test.ts` re-runs
  the real model on the vendored tokenizer and fails if any id, label,
  probability (±6e-5) or seeded roll count in `data.ts` drifts; routes:
  M2 available, slides route, M1 no slides, M3 planned). `tsc --noEmit`
  clean; `vite build` clean.
- **Byte identity**: HASHES.md recipe re-run (dev server, iframes,
  `?mockModel=1`, 1280×800, 2.5 s after load) — all eight rows match on
  hash prefix and exact character count: flagship en `23fe4985…`/19738,
  zh `1316cfd3…`/15113; why-it-lies en `2475a779…`/9694, zh
  `4276ba10…`/5393; attention-heads en `9cb068c3…`/78656, zh
  `45e18766…`/69464; why-it-cant-count en `71364230…`/12395, zh
  `009c3dac…`/7237. HASHES.md needs no edit.
- **Tokenizer locality (browser)**: `#/classroom/m1` and `#/classroom/m2`
  resource hosts = `localhost` only; the only asset requests are
  `/tokenizers/gpt2/tokenizer.json`, `/tokenizers/gpt2/tokenizer_config.json`,
  `/weights/meta.json`, `/weights/tinystories-1m.safetensors`. The
  flagship's Act-1 Chopper tokenizes "The cat sat on the" to
  `464 3797 3332 319 262` from the local files (same ids as before).
- **M2 lesson, EN @1280**: all 16 section/widget ids present, 5 widgets,
  0 model gates, 0 "wake"/"load" buttons, 3 hint controls, every slider
  `0.1–1.5 step 0.05`; the hook Gamble's live bars equal the measured
  table (grass 21.7 %, couch 15.2 %, tree 13.3 %, ground 11.7 %, floor
  11.6 % …); extension Gamble live (very 32.5 %, a 21.8 %, not 8.3 %);
  TheLoop ready. Hundred Rolls: 100 rolls sum to 100 (one live run: couch
  won with 24, grass 19 — the favourite losing is exactly the lesson),
  second press → 200, temperature 0.5 resets the tally and shows 36.4 %
  (= measured t05), cold run sums to 100, table has 10 rows with
  Word/Model/Expected/Rolls/Share, Reset returns to 0 and disables itself,
  chips re-think (park 98.3 % at T = 0.5 = measured). No page errors.
- **M2 lesson, zh @375**: no horizontal scroll, widgets 340 px wide, all
  labels localized (导入 / 第 1–3 步 / 延伸, 🎲 掷 100 次 / 清零 / 模型说 /
  骰子落点 / 改看表格), every nav/beat/step/hint/preset/button/summary
  control ≥ 44 px.
- **Keyboard walk of Hundred Rolls** (structural, see open question 3):
  focus order chips → text field → Think → temperature slider → Roll →
  (Reset, enabled after rolls) → "Show as a table"; every control a native
  `button` / `input` / `summary` with no explicit tabindex; `.focus()`
  lands on each; the slider steps 0.05 with `aria-valuetext` "T = 1.05";
  `<details>` toggles; summary line `aria-live="polite"`, chart
  `aria-hidden="true"`, table headers scoped.
- **Guide, EN @1280 and zh @375**: 14 numbered sections in §5 order;
  three dice grids of 36 cells (favourite blocks 8 / 29 / 7); key tables
  with id, probability and cells (5 rows marked "under half a cell"); the
  "what the runs measured" paragraph and nine sample responses carry the
  numbers below; three step deep links; Slides link; Canvas snippet; no
  horizontal scroll at 375; widgets hidden in print.
- **Printable, EN @1280**: white sheet, three 6×6 tables (7 columns incl.
  the row header, 6 rows, favourite blocks bold, the assumed-word line
  under tables 1–2), no probabilities on the sheet, sentence line, three
  answer lines, `break-inside: avoid` on each table.
- **Slides, zh @375**: 10 slides, counters 第 n 张,共 10 张, slide 3 bars
  (grass 21.7 % …), slide 5 dice table (36 cells), slide 7 three
  temperatures (36.4 / 21.7 / 17.3 %), slide 10 the three step deep links,
  speaker notes under every slide, print rules (`break-before: page`), no
  overflow.
- **Light theme**: classroom pages white with the computed palette; `#/`
  and `#/essays` dark again after SPA navigation; theme-color restored.

## Measured numbers used in the answer key

All from `src/classroom/m2/data.ts`, produced by running TinyStories-1M
(`public/weights/`) through nano-lm on the vendored GPT-2 tokenizer with
the widget's own `distributionAt` (top-10, temperature softmax — so the
ten probabilities sum to 100 %). Seeded runs use `mulberry32`; seeds are
in the file. `test/m2-data.test.ts` recomputes every line.

| prompt | T | top of the list | seeded 100 rolls |
|---|---|---|---|
| `The cat sat on the` | 1.0 | ␣grass 21.7 · ␣couch 15.2 · ␣tree 13.3 · ␣ground 11.7 · ␣floor 11.6 · ␣bench 6.5 · ␣branch 5.3 · ␣table 5.1 · ␣sofa 4.8 · ␣chair 4.8 | 22 · 15 · 12 · 9 · 8 · 8 · 4 · 4 · 9 · 9 (TVD 0.102) |
| same | 0.5 | ␣grass 36.4 · ␣couch 17.8 · ␣tree 13.7 · ␣ground 10.5 · ␣floor 10.4 … | 36 · 13 · 16 · 7 · 9 · 5 · 3 · 5 · 5 · 1 |
| same | 1.5 | ␣grass 17.3 · ␣couch 13.6 · ␣tree 12.5 · ␣ground 11.4 · ␣floor 11.4 … | 15 · **19** · 8 · 7 · 13 · 4 · 9 · 5 · 8 · 12 (couch wins) |
| same, ten runs (seeds 1000–1009) | 1.0 | favourite's count 27 18 24 21 20 24 24 23 20 17 → range 17–27 | TVD 0.058–0.138 |
| same, 1,000 rolls (seed 7) | 1.0 | favourite 198 (19.8 % vs 21.7 %) | TVD 0.052 |
| `The cat sat on the grass` | 1.0 | ␣and 79.7 · . 9.8 · , 3.5 · ␣in 2.0 · ␣to 1.8 · ␣with 1.2 · ␣when 0.6 · y 0.5 · ␣while 0.5 · ␣on 0.4 | dice cells 29 · 4 · 1 · 1 · 1 · 0 × 5 |
| `The cat sat on the grass and` | 1.0 | ␣watched 19.0 · ␣started 16.3 · ␣felt 14.0 · ␣looked 12.6 · ␣saw 9.3 · ␣walked 9.0 · ␣sat 6.4 · ␣ran 5.2 · ␣the 4.5 · ␣ate 3.9 | dice cells 7 · 6 · 5 · 5 · 3 · 3 · 2 · 2 · 2 · 1 |
| `Tom and Lily went to the` | 1.0 | ␣park 73.8 · ␣store 6.3 · ␣zoo 3.9 … | 66 · 8 · 3 · 3 · 1 · 5 · 3 · 5 · 5 · 1 |
| `One day, a boy named` | 1.0 | ␣Tim 79.1 · ␣Tom 12.5 · ␣Tommy 2.1 … | — |
| `Once upon a time` | 1.0 | , 69.8 · ␣there 28.9 · ␣in 0.3 … | — |
| `Two plus two is` | 1.0 | ␣a 21.5 · ␣very 13.9 · ␣counting 12.8 · . 10.8 · ␣1 10.5 · ␣three 8.2 · ␣in 7.0 · **␣four 5.6** · ␣six 4.9 · ␣seven 4.8 | — |
| `The capital of France is` | 1.0 | ␣very 32.5 · ␣a 21.8 · ␣not 8.3 · ␣about 7.8 · ␣the 7.4 … | — |
| `The sky is` | 1.0 | ␣very 39.4 · ␣so 14.4 · ␣a 13.0 … | — |

Dice table 1 (hook, T = 1): grass 8 · couch 5 · tree 5 · ground 4 · floor
4 · bench 2 · branch 2 · table 2 · sofa 2 · chair 2 = 36. Because top-10
sampling renormalises over the ten words, no table has an "anything else"
cell; `rolls.ts` supports one (tested) and the guide's answer-key note
says why there is none.

Measurement recipe (vitest, because the TS modules have extensionless
imports): see the `load()` helper in `test/m2-data.test.ts`; the JSON that
generated `data.ts` was produced by the same code.

## 1. Teacher-facing review — what to check

**Timing (45 min).** Hook 3, unplugged 10 (4 + 3 + 3), steps 6 + 8 + 6,
evaluation 7, exit 5. Step 2 is the one most likely to run long: the
three-temperature sequence is three presses plus two slider moves, and
students will want to press "100 more" several times. The plan says so;
a reviewer should time it. The weights (7.5 MB) load on page open — on 30
Chromebooks at once that is ~290 MB of school bandwidth, once (the guide's
at-a-glance row says this).

**Prompts.** Step 1 asks for five to eight words "ending right before an
interesting word"; student sentences that end on a function word ("the",
"a") give the best flat lists, sentences ending on a noun often give
punctuation as the favourite — hint 2 steers to the chips. Step 3's
"stranger story" comparison at 0.5 vs 1.5 works reliably on TinyStories.

**Hints.** Three per step, "where to look" → "what to try" → "the
mechanism"; hint 3 states the lesson outright, as in M1.

**Unplugged.** The spine assumption (tables 2–3 assume the favourite was
rolled) is a simplification the sheet and the script both name; a pair
whose Table 1 roll is not "grass" keeps its word and continues. Expect
about 8 pairs in 36 to stay on the spine at Table 1 and almost all to
roll "and" at Table 2 — which is the point of Table 2.

**Exit ticket.** Q2's wording ("about a one-in-five chance") is deliberately
number-light on the page; the numbers are in the guide's samples and
"what the runs measured" paragraph.

**Standards.** HS-ALG-PS-04, AAP-3 3.15/3.16, ISTE 1.5, HS-SOC-HU-44 (debate
only), DOL tag — transcribed from PRODUCT.md §4.2 with the §2.3 IDs and
"verified against the product design's citations"; the CSTA 2026 wording
should still be checked against the PDF before publication (same note as
M1).

### 中文 voice — the ten least-confident renderings

1. **「下一个词的赌局」** (title, inherited from the registry) — 赌局 reads
   as "a gambling game"; 「下一个词的骰子」 would be plainer but loses the
   series' Act-4 echo (赌局——每个词都是一把骰子).
2. **「头号热门」** for *favourite / top-1* — colloquial (racing / charts);
   alternatives 「首选词」 (reads as "preferred") or 「最可能的词」 (exact but
   long). Used everywhere a number is quoted, so it matters.
3. **「候选名单」** for *the list* (the distribution) — the glossary pairs it
   with 「概率分布」; HK/TW teachers may prefer 「候選清單」.
4. **「掷一百次」** as the widget's name — 「百次掷骰」 is tighter but less
   like a button label; the button itself is 「🎲 掷 100 次」.
5. **「骰子落点」** for the *rolls landed* legend — 落点 is the "landing
   spot" image; 「实际次数」 is the literal alternative.
6. **「空心条 / 实心条」** for *outlined / solid* bars — the model bar is a
   translucent fill with an outline, so 空心 is approximate; 「浅色条 /
   深色条」 would describe the colours instead.
7. **「改看表格」** for *Show as a table* — 「表格视图」 is the UI convention;
   改看 is more spoken.
8. **「板上钉钉」** for *a sure thing* (hint 2, background) — idiomatic
   mainland usage; 「十拿九稳」 is already taken by the Loop's legend, and
   using both keeps them distinct.
9. **The debate motion** 「一台每个词都靠掷骰子的机器,不可能真的‘想表达’它说的
   话」 for *cannot mean what it says* — "mean" has no clean 中文; 想表达
   ("intend to express") is one reading, 「有所指」 another. Left as a
   statement to match the EN.
10. **「清零」** for *Reset rolls* — "zero the counter"; 「重置」 is the
    generic UI word. 清零 says what it does.

Two more to glance at: 「温度」 appears bare (no 参数 / 采样温度) because the
flagship does the same; and the zh printable's table heading adds 「句子保留
英文:这个模型只读过英文」 where the EN heading does not — deliberate, same
convention as M1's strips.

## 2. Open questions

1. **Hidden-tab timers.** The animated roll is ten `setTimeout(70)`
   batches; Chrome throttles timers in background tabs (to 1 s, and after
   five minutes hidden to 1 min), so a student who presses Roll and
   switches tabs comes back to a stalled bar. `prefers-reduced-motion`
   already takes the one-batch path; the widget could also take it when
   `document.hidden`. Not a classroom-visible problem, but the review
   tooling hit it.
2. **Top-k renormalisation on paper.** Bars and dice tables both show the
   model's top ten summing to 100 %; the real distribution has mass below
   the tenth word. The guide's answer-key note and the "Advanced" box say
   so; `rolls.ts` can print an "anything else" cell if the tables are ever
   built from full-vocabulary probabilities. Decide whether that honesty
   belongs on the student sheet.
3. **Keyboard walk.** Real key injection did not reach the page (the
   Browser pane was hidden; the Chrome-extension route needs a user
   selection), so the walk above is structural (native controls, DOM
   order, focus(), aria). Someone should Tab through Step 2 by hand once.
4. **Spine vs. branches on the printable.** Three tables along the
   favourite path fit one sheet. A second branch (" couch" → …) would let
   more pairs stay "on model" at the cost of a second page; the guide's
   script explains the simplification instead.
5. **Slides as HTML, not Google Slides.** PRODUCT.md §5 asks for a Google
   Slides deck; the MVP ships one print-oriented HTML page (ten slides,
   notes under each) rendered from the module's own text. Print-to-PDF is
   the Classroom path; a real Slides export would be a phase-3/4 item.
6. **Screenshots.** With the pane hidden only the first paint after a
   navigation screenshots reliably; every check above is DOM/computed-style
   level (as in REVIEW-CLASSROOM-1). A visual pass on a projector is still
   owed.
7. **The nano-lm README edit** (self-hosting recipe) lives in the sibling
   repo and is uncommitted there; commit it with nano-lm's next change.
8. **Gamble in nano mode thinks on mount** (one forward pass per Gamble on
   page open, ~10 ms each) — fine, but with three Gambles plus Hundred
   Rolls plus TheLoop the page now mounts five model consumers of the same
   singleton; worth a glance on a 4 GB Chromebook (phase 4's test).
9. **M1 exit-Q2** now says only what was measured; the fuller BPE
   explanation (line-initial tokens) could return as a teacher-background
   aside if a source is cited.

## 3. Deferred (per PRODUCT.md §10.1)

- **Phase 3**: shared guide front matter (model card page, privacy &
  safety one-pager, tech check, crosswalk for all six modules, policy
  citations, accessibility statement, cite / "I taught with this"), a
  printable-PDF pipeline, the service worker for offline-after-first-load.
- **Phase 4**: domain/hosting, OG cards, filter-category submissions, the
  real Canvas origin, Chromebook/iPad/30-client testing, full WCAG pass
  (text-to-speech, ChromeVox/VoiceOver/NVDA), Hour of AI and Common Sense
  submissions, pilot with 1–2 teachers.
- Not in MVP: M3–M6, Guess-then-Reveal, Dataset Peek, video, Spanish, LTI,
  the 226 MB big-model path (hidden by config, never linked).
