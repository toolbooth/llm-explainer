# Classroom Edition — phase 1 review sheet (REVIEW-CLASSROOM-1)

For the author and any teacher-facing reviewer. Three parts: **what to check
as a teacher** (prompts, hints, timing, zh voice — with the ten least-confident
renderings), **open questions**, and **what was deferred to phases 2–4**.
Source text is `src/classroom/content/{en,zh}.tsx` (shared chrome) and
`src/classroom/m1/content/{en,zh}.tsx` (module 1: page + guide + sheet); the
product brief is `classroom-edition/PRODUCT.md` (§4.1 rules, §4.3 skeleton,
§5 guide outline, §6 device/accessibility, §10.1 MVP scope).

**How to review live**: `npm run dev`, then

| page | URL (add `?mockModel=1` to run offline, `&lang=zh` for 中文) |
|---|---|
| module index | `#/classroom` |
| M1 lesson page | `#/classroom/m1` · steps: `#/classroom/m1/step-1` … `step-3` |
| M1 teacher guide | `#/classroom/m1/guide` (has a Print button) |
| M1 unplugged printable | `#/classroom/m1/unplugged` (has a Print button) |

Entry from the site: one small link under the essay list on `#/essays`
("Teaching this? Classroom Edition →" / "要拿去上课?课堂版 →"). Nothing
classroom appears in any essay or in "More in this series".

## What was built (commits `0d7798a`, `97d050d`, + this one)

- **Shell**: `#/classroom` route family with per-step deep links; module
  registry (six planned, M1 available); classroom-mode config (`bigModel:
  false`, `maxTemperature: 1.5`); progressive hints (hidden → one per click →
  fold away; native button, `aria-expanded`/`aria-controls`, polite live
  region); `@media print` stylesheet; shared EN/zh chrome table.
- **M1 "The Word Chopper" / 切词机** following §4.3 exactly: Hook (0–3,
  projector Chopper) → Unplugged (3–13, link to the printable) → Guided
  exploration (13–33; three steps, one widget each — Chopper, Chopper with
  chips, tokenizer-only X-ray on the shared GPT-2 vocabulary — each with three
  progressive hints and a "write down" line) → Evaluation act (33–40, three
  judgment questions, on paper) → Exit ticket (40–45, three questions) → Block
  extension (+45: other-script Chopper with chips, structured debate). Model
  card line + privacy line surfaced at the top of the page (and the guide).
- **M1 teacher guide**: §5 per-module items 1–14 in order; items 7 and 10
  render from the lesson page's own tables; item 6's answer key renders from
  the measured cuts; Canvas iframe snippet with a placeholder origin.
- **M1 unplugged printable**: scissors-sentence activity; three English strips
  + a 中文 strip for the extension; paper-first layout; answer key kept in the
  guide.
- **Widget lifts** (optional props; absent → DOM unchanged): Chopper
  `presets`/`inputLabel`; Gamble/TheLoop `maxTemperature`; TokenizerXray
  `tokenizer: "shared"` + `modelGate: false`.

## Verification record (2026-08-22)

- `npm test`: **110 tests, 17 files** (84 pre-existing + 26 new: classroom
  routes/fallbacks/no-listing-leak, module registry, hints state machine,
  classroom config and slider-cap ordering, shared-table parity, M1 parity
  incl. array lengths, §4.3/§5 structural counts, canonical zh strings,
  interpolations, live-data-not-in-tables, unplugged answer-key
  self-consistency). `tsc --noEmit` clean; `vite build` clean.
- **Byte identity**: HASHES.md recipe re-run in the dev server (iframes,
  `?mockModel=1`, 1280×800, 2.5 s after load) — all eight rows identical:
  flagship en `23fe4985…`/19738, zh `1316cfd3…`/15113; why-it-lies en
  `2475a779…`/9694, zh `4276ba10…`/5393; attention-heads en `9cb068c3…`/78656,
  zh `45e18766…`/69464; why-it-cant-count en `71364230…`/12395, zh
  `009c3dac…`/7237. HASHES.md needs no edit.
- **Browser (DOM-level; the pane was hidden so screenshots were not usable
  beyond the first)**: M1 EN @1280 — all 16 section/widget ids present, 5
  widgets, 0 model gates, 3 hint controls, `#/classroom/m1/step-2` lands with
  the step heading at y = 15 px, no horizontal scroll. M1 zh @375 — no
  horizontal scroll, widgets 340 px wide, chips/hints/step labels localized;
  after the mobile CSS pass every control (nav links, beat chips, step `#`
  anchors, print button, module-index links) measures ≥ 44 px. Guide zh @375
  — 14 numbered sections, 28 answer-key tokens (9 + 10 + 9), three step deep
  links, 23 print rules incl. `@page`, nav/widgets hidden in print, no
  horizontal scroll. Printable EN — white sheet (#fff / #111 on screen), 4
  strips at 24.8 px letter-spaced mono, 3 answer lines, `break-inside: avoid`
  on strips, print drops the shadow. Keyboard: the hint button takes focus,
  reveal → reveal → hide → reveal cycle verified with focus retained and
  `aria-expanded` toggling. Series index: essay list unchanged (flagship
  only), classroom link present and not inside the list.
- **Tokenizer measurements** (all example sentences, chips and strips; script
  below) on `Xenova/gpt2` from the local transformers.js cache, no special
  tokens. Every cut quoted in prose, hints, guide and answer key is in this
  table.

| input | pieces |
|---|---|
| `My Chromebook restarted during the quiz.` | My · ␣Chromebook · ␣restart · ed · ␣during · ␣the · ␣quiz · . (8) |
| `I can't wait for summer vacation!` | I · ␣can · 't · ␣wait · ␣for · ␣summer · ␣vacation · ! (8) |
| `strawberry` / ` strawberry` | st · raw · berry (#301 #1831 #8396) / ␣strawberry (1) |
| `Wednesday` / `wednesday` / `Wednesdays` | 1 / wed · nesday / Wed · nes · days |
| `2024` / `20245` / `1234` / `12345` | 20 · 24 / 20 · 245 / 12 · 34 / 123 · 45 |
| `Our basketball team practices on Wednesdays.` | 9 pieces (ids in `m1/data.ts`) |
| `Grandma's lasagna recipe is unbeatable.` | 10 pieces |
| `The skateboarder landed an impossible trick.` | 9 pieces |
| `我喜欢吃草莓。` | 17 byte-pieces |
| `Me gusta la fresa.` / `🍓🍓` / `naïve café` | 7 / 6 / 3 |

```js
// node, from the repo root (transformers.js cache is under node_modules)
const { AutoTokenizer, env } = await import("./node_modules/@huggingface/transformers/dist/transformers.node.mjs");
env.allowRemoteModels = false; env.cacheDir = "./node_modules/@huggingface/transformers/.cache";
const tok = await AutoTokenizer.from_pretrained("Xenova/gpt2");
const show = (s) => console.log(s, tok.tokenize(s).map((p) => p.replace(/Ġ/g, "␣")), Array.from(tok(s, { add_special_tokens: false }).input_ids.data).map(Number));
```

## 1. Teacher-facing review — what to check

**Timing (45 min).** The plan's beats sum to 45 with the hook at 3 and
unplugged at 10. The risk is Step 1 (7 min) if the tokenizer (~2 MB) is still
downloading on 30 Chromebooks at once; the guide's tech-check line ("loads once
and is cached") is true of the browser cache but the fetch currently goes to
the Hugging Face hub (see Open questions). A reviewer should time the three
steps with real students; Step 2 (chips, predict-then-check) is the one most
likely to run short, Step 3 (X-ray) the one most likely to run long.

**Prompts.** Each step is one task + one write-down. Check: (a) Step 1's
"8–12 words, at least one unusual word" gives enough surprise on typical
student sentences — names, slang and brands reliably chop (Jalen → J·al·en,
Roblox → Rob·l·ox, TikTok → T·ik·Tok), common nouns often do not; (b) Step 2's
prediction loop is explicit enough ("before each click, predict"); (c) Step 3
uses the word *melted* for a letter inside a piece — same word as essay #4;
fine for 9–14, but "buried" is the plainer alternative.

**Hints.** Three per step, escalating from "where to look" → "what to try" →
"the mechanism". Hint 3 of each step states the lesson outright — that is
deliberate (the community-college ask was to let a stuck student finish
without restarting), but a reviewer may want hint 3 to stay a question in
Step 3 ("If the letter is melted into a bigger piece, what does the model have
to count with?").

**Evaluation act and exit ticket.** Both are on paper; the page says so twice.
The rubric's three levels (Noticing / Explaining / Judging) and the sample
responses are sized so that a Level 2 answer is what a student who did the
steps should produce. Check the L3 sample for exit Q2 (the "bare strawberry
mostly appears at the start of a line" claim is the plausible reading of the
BPE statistics, not a measured fact about the training corpus — soften to
"is rarer in text" if you prefer to quote only what was measured).

**Standards.** Rows are transcribed from PRODUCT.md §4.2 with the §2.3 IDs;
the guide says "verified 2026-08-22" meaning *against the product design's
citations*, not against the standards documents directly. The HS-SOC-HU-44
reference (debate framing) is named only in the extension paragraph. Before
publication someone should open the CSTA 2026 PDF and confirm ET-40 / HU-44
wording; the churn note on the page already hedges.

**Model card and privacy lines.** The model card says Module 1 runs only the
tokenizer (true: no weights are fetched on the page). The privacy line says
the only network activity is "fetching the page and the tokenizer/model files,
once" — true, but the tokenizer files come from huggingface.co (see Open
question 1); a district vetting form will ask where that host is.

### 中文 voice — the ten least-confident renderings

1. **「机器内部·课堂版」** (edition title) — PRODUCT.md gives 《机器内部·课堂版》
   with 书名号; the h1 drops them per ZH-REVIEW's global decision 1, and
   "Inside the Machine" itself stays in Latin in the kicker/footer as the
   series does. Alternative: keep the English title everywhere and use
   「课堂版」alone.
2. **「碎片」for *piece/token*** — essay #4 used 碎片 for the pieces and kept
   *token* for the concept; the classroom copy leans on 碎片 almost everywhere
   and says "token" only in the model card and glossary, because the audience
   is 9–14 and the word needs no scaffolding. Risk: HK/TW teachers may expect
   「詞元」; the glossary row shows both.
3. **「切词机 / 切词器」** (Chopper / tokenizer) — inherited from the flagship;
   the 机/器 distinction carries the widget-vs-program difference but is
   subtle aloud. Alternative: 「切词器」for both, with 「切词机」only in widget
   titles.
4. **「不插电」** (unplugged) — the CS Unplugged term (不插电的计算机科学) is
   established in mainland teacher circles; less so in HK (「離線活動」).
5. **「出门条」** (exit ticket) — common in mainland pedagogy posts; 「出门票」
   is as common. Taiwan tends to 「離開單」/「下課小測」.
6. **「大课延伸」** (block extension) — "block schedule" has no fixed 中文; 大课
   reads as "double period" which is the meaning. Alternative: 「连堂延伸」.
7. **「评判环节」** (evaluation act) — 评判 chosen over 评价 to keep the
   "student judges the machine" sense rather than "assessment"; 「评判机器」
   as the beat heading on the page is a little theatrical.
8. **「引导探究」** (guided exploration) — standard mainland curriculum wording
   (探究式学习); HK uses 「探究活動」.
9. **「它看见碎片 / 你看见字母」** (step 3 title and X-ray row labels) — the
   three-character 「你看见 / 它看见」pair from essay #4 is reused; it reads as a
   slogan, which is fine on a projector.
10. **「切词器为谁而建,是公平问题,不只是工程问题」** (the debate resolution) —
    a flat statement; an actual debate motion in 中文 classrooms would more
    often be phrased 「……应当被视为公平问题」. Left declarative to match the EN.

Two more to glance at: the zh Step 1 prompt asks for an **English** sentence
explicitly (「打一句你自己的英文句子」) where the EN prompt just says "a
sentence of your own"; and the zh model note adds a clause telling students
to try English and save 中文 for the extension — both are deliberate, since
the tokenizer only saw English, but they make the zh page slightly more
directive.

## 2. Open questions

1. **The tokenizer is fetched from huggingface.co at runtime**
   (`src/lib/engine.ts`, `Xenova/gpt2` via transformers.js). For the flagship
   that is fine; for a classroom it contradicts §6.2 ("no third-party
   endpoints at all after load") and is a filter risk (a domain with "hugging"
   in it is not an education category). The fix is to self-host the four
   tokenizer files under `public/tokenizer/gpt2/` and point `env.localModelPath`
   at them (~2 MB, same as now) — a phase-2 item; it also makes the
   "30 Chromebooks at once" test meaningful. Until then the privacy line's
   "tokenizer/model files" phrase is literally true but the host is not ours.
2. **Dark theme on a projector.** The classroom pages inherit the series' dark
   palette; the guide and printable go light in print, and the unplugged sheet
   is white on screen, but the lesson page itself is dark. Classroom projectors
   are often dim; a `prefers-color-scheme`/manual light mode for `.classroom`
   is a contained change (widgets use hard-coded dark surfaces, so it is not
   free). Decide before the pilot.
3. **Hook default sentence.** `My Chromebook restarted during the quiz.` is
   meant to be replaced live. If the teacher does not, the surprise is small
   (restart·ed; ␣Chromebook whole). A name is the best hook; the guide says so.
4. **Should hint 3 give the answer?** See "Hints" above.
5. **Mock mode splits on whitespace**, so under `?mockModel=1` every chip shows
   one piece and the X-ray shows one piece — reviewers should use the real
   tokenizer (no query param) to see the lesson; the mock exists for CI and the
   hash recipe.
6. **The `#/classroom/m1/<beat>` jump links** (hook, unplugged, …) scroll
   within the page and are not routes; copying one gives the module top, not
   the beat. Only `step-N` is a real deep link (per the brief). Should beats be
   deep-linkable too?
7. **Essay #4 link.** The guide's "go deeper" points at the flagship's Act 1
   only; essay #4 (the counting essay, Module 5's source) is still a draft
   registry entry, so it is mentioned but not linked.

## 3. Deferred to phases 2–4 (per PRODUCT.md §10.1)

- **Phase 2**: M2 "The Next-Word Gamble" page + **Hundred Rolls** widget;
  Gamble/TheLoop mounted with `maxTemperature={CLASSROOM.maxTemperature}` (the
  prop exists; nothing in M1 uses a temperature slider); self-hosted tokenizer
  files; service worker for offline-after-first-load.
- **Phase 3**: shared guide front matter — model card page, privacy & safety
  one-pager for district forms, tech check, standards crosswalk for all six
  modules with per-row "verified against" dates, policy citations page,
  accessibility conformance statement, how-to-cite / "I taught with this"
  template and letter kit; printable PDF pipeline from the same source; M2
  Slides companion. The classroom index lists these as placeholders.
- **Phase 4**: domain/hosting, OG cards, filter-category submissions, the real
  Canvas embed origin (the guide carries `https://classroom.YOUR-DOMAIN`),
  Chromebook/iPad/30-client testing, WCAG pass incl. text-to-speech of prompts
  (`speechSynthesis`), ChromeVox/VoiceOver/NVDA checks, Hour of AI and Common
  Sense submissions, pilot with 1–2 teachers.
- Not in MVP at all: M3–M6, Guess-then-Reveal, Dataset Peek, video, Spanish,
  LTI, the 226 MB big-model path (hidden by config, never linked).
