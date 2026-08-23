# Classroom Edition — phase 3 review sheet (REVIEW-CLASSROOM-3)

For the author and any teacher-facing reviewer. Four parts: **what was
built** (the seven shared front-matter pages, the PDF pipeline, the
REVIEW-2 polish), **every correction made to the front-matter drafts on
integration** (the drafts were written against primary sources; the site
must not say anything the code contradicts), **the ten least-confident
中文 renderings introduced**, and **open questions + what phase 4 owns**.
Source text of record for the front matter is now
`src/classroom/about/content/*.md` (copied from
`classroom-edition/front-matter/`, corrected as listed below); the
product brief is `classroom-edition/PRODUCT.md` r2 (§5 front matter, §6,
§8, §10.1 item 2).

**How to review live**: `npm run dev`, then

| page | URL (add `?mockModel=1` to run without weights, `&lang=zh` for 中文) |
|---|---|
| module index (links the seven pages under "For teachers") | `#/classroom` |
| model card | `#/classroom/about/model-card` |
| privacy & safety one-pager | `#/classroom/about/privacy` |
| tech check | `#/classroom/about/tech-check` |
| standards crosswalk (eleven columns; prints landscape) | `#/classroom/about/standards` |
| policy citations | `#/classroom/about/policy` |
| accessibility statement | `#/classroom/about/accessibility` |
| how to cite · letter kit (EN-only body; zh page = zh preface + EN kit) | `#/classroom/about/letter-kit` |
| the PDF set | `npm run build:pdf` → `dist-pdf/*.pdf` + `manifest.json` (gitignored) |

Every about page has the seven-page pill nav under its title, a Print
button in the frame nav, and a source line at the foot naming the draft
it came from. Both module guides now carry a "Shared front matter, on the
site" link row under the privacy card where the phase-1 placeholder
paragraph was; the index's "For teachers" list links the pages with a
one-line blurb each (the " — phase 3" suffix is gone).

## What was built (three commits on top of `4af5518`)

- **A — front-matter pages** (`0758b77`). `src/classroom/about/`:
  `md.ts` is a ~200-line Markdown parser (headings, paragraphs with
  newline = `<br>`, bullet/numbered lists with one level of nesting,
  blockquotes parsed recursively, pipe tables, rules; inline strong / em /
  code / link) producing a plain block tree; `Markdown.tsx` renders it —
  tables are real `<table>`s with a `<thead>` of `scope="col"` headers
  inside `.cl-table-wrap` (scrolls inside its own box), tables of ≥ 6
  columns get `dense`. No runtime dependency. `registry.ts` imports the
  documents with Vite's `?raw` (so Vitest and the build see the same
  text); `slugs.ts` holds the route slugs with no content imports so the
  router and the print list stay light. Route: `#/classroom/about/<slug>`
  (`{ kind: "about", slug }`), unknown slugs and a bare `/about` fall back
  to the index. `AboutPage.tsx`: the document's own h1 is the hero title;
  the letter-kit page prepends the series' "Cite this" block (the flagship
  BibTeX, PRODUCT.md §5 item 8 "how to cite and how to tell us"); parts in
  another language than the page (the zh letter kit's English body) are
  wrapped in their own `lang`. Chrome strings (nav label, source line, per-
  page meta descriptions, cite strings, index labels + blurbs) sit in the
  shared `ClassroomStrings` tables with a deep EN/zh parity test.
- **B — PDF pipeline** (`79dac05`). `npm run build:pdf` →
  `scripts/build-pdf.mjs`: starts a throwaway Vite dev server on a free
  port, loads `src/classroom/print.ts` through `ssrLoadModule` (the one
  list of 12 targets × 2 languages, the file-name rule, the manifest
  shape + validator, a page counter), launches the machine's Google Chrome
  via the devDependency **playwright-core 1.62.1** (no browser download;
  falls back to Edge, then Playwright's own Chromium; **exits 0 with a
  clear message if none is found**), opens each route under
  `?mockModel=1&lang=…`, emulates print media and writes Letter PDFs
  (`preferCSSPageSize`, landscape for the crosswalk) to `dist-pdf/`
  (gitignored) plus `manifest.json` (renderer, commit, per-file bytes,
  pages, title). `--only id,id` and `--lang zh` render a subset.
  **Print-font fix**: Chrome cannot embed the macOS system UI face that
  `-apple-system` / `system-ui` resolve to, nor PingFang SC — every sans
  run (table cells, chips, kicker, all 中文 sans text) came out *blank* on
  the first run; the classroom print stylesheet now names embeddable faces
  (Helvetica Neue / Arial; Hiragino Sans GB / Heiti SC for zh), scoped to
  `:root.classroom-light` so the essays' tokens are untouched. Dense tables
  print with a fixed layout (the crosswalk's "Verified against" column was
  being squeezed to one character per line); BibTeX wraps in print.
- **C — REVIEW-2 polish** (this commit). **Hidden-tab stall** (REVIEW-2
  open question 1): the animated press no longer runs ten `setTimeout(70)`
  batches; it runs a **time-based step** — `rollsDue(elapsed, 700 ms)` in
  `rolls.ts` says how many of the 100 rolls should have landed, each tick
  lands the difference, and a tick resolves on a ~70 ms timer *or* on
  `visibilitychange`. A background tab's throttled timer (1 s, then 1 min)
  therefore finds everything due when it fires, and returning to the tab
  flushes at once; a press that *starts* hidden (or under reduced motion)
  lands in one step. Verified: in a visible headless page the tally reads
  10 · 20 · 41 · 51 · 71 · 82 · 92 · 100 at 100 ms intervals, the button
  re-enables at 100, a second press reaches 200, Reset returns 0; in the
  hidden Browser pane the first tick lands all 100. **Guide placeholder
  text**: both guides' accessibility notes now point at the Accessibility
  statement page instead of "arrives with the shared front matter"; M1's
  phase-1 note about dim labels below AA on projectors is marked closed by
  the phase-2 light palette (dim text 5.9:1); M2's reduced-motion line
  says "over 0.7 s" instead of "ten batches".

## Verification record (2026-08-23)

- `npm test`: **168 tests, 23 files** (142 pre-existing + 26 new:
  `test/markdown.test.ts` 8 — inline nesting, code spans opaque, lone
  asterisks stay text, `[secondary]` stays text, line breaks, heading ids,
  tables incl. a pipe inside code and short rows, lists incl. nesting and
  kind change, recursive quotes, paragraph termination;
  `test/about.test.ts` 9 — every slug round-trips, fallbacks, index ↔
  chrome ↔ registry slug sets, single h1 per document, **EN/zh structural
  parity** (every heading level, table column × row count, list length and
  nesting, quote and rule must match — paragraph counts may differ for the
  zh 术语/语言说明 notes), letter-kit composition, real `<table>`s with
  headers and the crosswalk the only dense/landscape one, the drafts'
  label vocabulary kept (Target / Verified by construction / Secondary /
  Re-verified / no license field / not yet audited / author's extension),
  and the corrections below pinned; `test/print-targets.test.ts` 6 —
  targets, routes, names, page counter, manifest validation, and the real
  manifest when present; `test/hundred-rolls.test.ts` +3 — `rollsDue`).
  `tsc --noEmit` clean; `vite build` clean (bundle unchanged in kind:
  532 KB app + 559 KB transformers.js + 40 KB CSS).
- **Byte identity**: HASHES.md recipe re-run after A and again after C
  (dev server, iframes, `?mockModel=1`, 1280×800, 2.5 s after load) — all
  eight rows match on hash prefix and exact character count: flagship en
  `23fe4985…`/19738, zh `1316cfd3…`/15113; why-it-lies en `2475a779…`/9694,
  zh `4276ba10…`/5393; attention-heads en `9cb068c3…`/78656, zh
  `45e18766…`/69464; why-it-cant-count en `71364230…`/12395, zh
  `009c3dac…`/7237. HASHES.md needs no edit.
- **About pages, EN and zh @1280**: all seven render under the light
  root class with `html[lang]` following the page; h2 counts 9/6/5/3/3/6/5;
  every table a `<table>` with `<thead>` of `th[scope=col]` inside a
  `.cl-table-wrap`; only the crosswalk (1100 px) scrolls inside its
  container, the rest fit; no horizontal page scroll; seven-pill sub-nav
  with `aria-current="page"`; letter-kit page has the Cite block and, in
  zh, one `section[lang="en"]`; `#/essays` dark again after navigating
  away. First-column `white-space: nowrap` inherited from the guides'
  table rule made the policy and tech-check tables 1,598 / 987 px wide —
  fixed by a higher-specificity override; re-measured, all fit.
- **About pages, EN and zh @375**: no page overflow on any of the seven;
  every table wider than 340 px (privacy 413, tech check 434/347,
  crosswalk 1100, accessibility 471) scrolls inside its own wrap; the
  only element past the viewport edge is the BibTeX `code` inside its own
  scrolling `pre`; every nav pill and frame control ≥ 44 px.
- **Index and guides**: seven `#/classroom/about/*` links in the index
  list and in each guide's link row; no "phase 3" / "later phase" text
  left on any classroom page.
- **Print / PDF** (`npm run build:pdf`, Chrome 151.0.7922.110 via
  playwright-core 1.62.1, commit `0758b77` at render time): 24 PDFs,
  **159 pages**, 36.7 s. Page counts cross-checked against pypdf (all 24
  equal) and the crosswalk's media box is 792 × 612 (landscape). Pages
  rasterised and eyeballed: privacy zh p1 (table fully rendered after the
  font fix), crosswalk en/zh p2 (eleven columns on one landscape sheet,
  rows unbroken), M2 guide en p6 (dice grids + key table), letter-kit zh
  p1 (Cite block, zh preface, EN body).

  | file | pages (en / zh) |
  |---|---|
  | m1-guide | 13 / 11 |
  | m1-unplugged | 2 / 2 |
  | m2-guide | 16 / 15 |
  | m2-unplugged | 3 / 3 |
  | m2-slides | 10 / 10 |
  | about-model-card | 6 / 5 |
  | about-privacy | 5 / 4 |
  | about-tech-check | 6 / 5 |
  | about-standards | 7 / 6 |
  | about-policy | 7 / 7 |
  | about-accessibility | 4 / 4 |
  | about-letter-kit | 4 / 4 |

## 1. Corrections made to the front-matter drafts on integration

Applied by an exact-match script (each replacement had to match once) to
the copies under `src/classroom/about/content/`; the originals in
`classroom-edition/front-matter/` are untouched. EN and zh were corrected
in parallel. Only facts the built code contradicts, plus two
reconciliations with PRODUCT.md r2 that the drafts cite as their source;
every "verified / target / planned / [secondary]" label the drafts
carried is still there (test pins a sample).

| # | document | draft said | now says | why |
|---|---|---|---|---|
| 1 | privacy (IT-reviewer note 1), tech check (blocked-page symptom; unblock template), privacy (network-tab audit step 3) | the flagship loads its tokenizer files from `huggingface.co` at page load; list it as a load-time dependency; "`[or from huggingface.co if …]`" | the GPT-2 tokenizer files are served from the lesson site under `/tokenizers/gpt2/` (byte-identical to `Xenova/gpt2`) since phase 2, for classroom pages and the flagship's own Chopper alike; the only third-party fetch left in the series is the flagship's optional larger model (Act 4, explicit click, never linked from a classroom page); `test/tokenizer-locality.test.ts` guards it | phase 2 commit `c665478`; the hub mention survives only as the model card's license-citation URL (a source, not a fetch) |
| 2 | model card § "Sampling in classroom mode (planned configuration)", table column "Classroom mode (planned)", privacy safety statement "(planned configuration …)" | planned | built — `src/classroom/config.ts` (phase 1); every classroom slider 0.10–1.50 step 0.05; TheLoop's 30-token continuation "unchanged" rather than "30 or fewer"; sources re-read against the built M1/M2 pages | config.ts `maxTemperature: 1.5`, `GAMBLE_TEMP_RANGE`, `MAX_TOKENS = 30` |
| 3 | model card status line; privacy status line | "draft for integration; numbers marked planned describe the specification, not a shipped page" | integrated 2026-08-22 (phase 3); anything still marked planned is unshipped classroom-build work (service worker, Chromebook device test) | the page is now shipped |
| 4 | model card offline check, step 1 and step 6 | "loading the model (7.5 MB)" indicator; "the flagship essay today does not survive a reload offline" | the indicator's real text, "Loading the model (7.5 MB, shared by every widget on this page)…"; "neither the flagship nor a classroom page survives a reload offline" | `loadingNano` in M2's tables; service worker is phase 4 for both |
| 5 | tech check, download table | page/script/style bundles "not yet measured"; tokenizer "~2 MB"; weights fetched by "the first widget that needs the model"; total "~10 MB budget … PRODUCT.md counts the weights but not the tokenizer" | measured at build 2026-08-22: bundle 1.13 MB on disk (532 + 559 + 40 KB), ~352 KB gzipped, the 23.6 MB ONNX runtime never fetched by a classroom page; tokenizer 2,107,887 bytes (~597 KB gz) under `/tokenizers/gpt2/`; weights requested on page open and shared; total 7.50 + 2.11 + 1.13 = **10.74 MB on disk, ~8.5 MB on the wire**, the weights + tokenizer line (9.61 MB) inside the budget and pinned by a test, the bundle over the ~0.5 MB PRODUCT.md r2 left for it on disk but not on the wire — flagged as an open question for the author | `vite build` output; `test/tokenizer-locality.test.ts` |
| 6 | tech check, LMS bullet and checklist item 4; unblock template privacy URL | `#m2-step3`, `#m2-step1…3`; `https://[classroom domain]/privacy` | `#/classroom/m2/step-3`, `#/classroom/m2/step-1` … `step-3`; `…/#/classroom/about/privacy` | the routes as built (`src/classroom/route.ts`) |
| 7 | accessibility "Keyboard" (TheLoop) | "play, pause, step and reset are buttons" | "Run, Step and Reset are buttons (a run is at most 30 tokens; there is no pause control)" | `src/acts/TheLoop.tsx` has three buttons |
| 8 | accessibility "Text alternatives" (Hundred Rolls) | "a sortable table of token and count" | a table (word, model probability, expected count, rolls, share) behind a "Show as a table" disclosure; built, not sortable | `HundredRolls.tsx` |
| 9 | accessibility "Motion", "Text-to-speech" | TheLoop becomes a step mode under reduced motion; prompts can be read aloud via `speechSynthesis` | labelled: built (Hundred Rolls lands at once) vs **target, not yet built** (TheLoop step mode; TTS) | no reduced-motion or TTS code exists outside Hundred Rolls |
| 10 | accessibility "Contrast" | target only | target kept, plus the phase-2 light palette's computed ratios (17:1 / 8.6:1 / 5.9:1 / 8.3:1) | `classroom.css` light tokens |
| 11 | accessibility "Known gaps" table | one `[pending audit]` row | four rows from the phase 1–2 build notes (no TTS; X-ray "you see" row reads as letters; Loop hover popover has no keyboard path; Loop has no reduced-motion step mode or pause), each with a WCAG criterion, workaround and target, plus an `[audit findings pending]` row; the intro says these are build notes, not AT testing | M1/M2 guide accessibility sections |
| 12 | policy citations, NSF | "PRODUCT.md §2 names no NSF action" | PRODUCT.md §2.1 r2 records three NSF actions (NSF 25-545; the "Expanding K-12 Resources for AI Education" DCL; the $11 M CSTA award), every one secondary, and says there is no alignment claim to make; the do-not-cite instruction and the placeholder stay | reconciliation with PRODUCT.md r2 — the draft's sentence was false against its own source |
| 13 | standards crosswalk, re-verification log | one row | second row: published unchanged; the built M2 guide also lists HS-SOC-HU-44 for its debate (PRODUCT.md §4.3 item 6) while §4.2 names it for M3 only — to reconcile at the next revision | the guide and the crosswalk disagree; recorded rather than silently changed |

Not changed although a reviewer will notice: the crosswalk's
"Primary-document re-check of each code: pending" (still true); the
letter kit's `[classroom repository URL — TBD]`, the privacy page's
`[classroom domain — TBD]` and `[date — TBD, planned Nov 2026]` (phase 4);
the EO 14277 Sec. 6 wording caveat in the policy page (PRODUCT.md r2
resolved it as "verbatim, but a clause inside the partnership directive"
— the page keeps the draft's caution; see open question 3).

## 2. 中文 voice — the ten least-confident renderings introduced this phase

All new zh text is chrome (index blurbs, nav, source line, cite strings)
or the corrected sentences in the drafts, plus the letter-kit preface.

1. **「来信包」** for *letter kit* (page h1 「来信包——告诉我们你用它上过课」) —
   "a packet of letters"; 「推荐信工具包」 is more literal but reads as HR
   material. The index label says 「如何引用 · 如何告诉我们你用它上过课」 so
   the page is findable either way.
2. **「共用前言」** for *shared front matter* — inherited from phase 1;
   前言 is "preface", whereas these are reference pages. 「共享前置文档」 is
   what the drafts themselves use. Left as is so the index, guides and nav
   agree; reviewer's call.
3. **「由构造保证」** for *verified by construction* (kept from the draft,
   now also in the accessibility/tech-check corrections) — engineering
   idiom; a teacher may prefer 「设计上必然如此」.
4. **「已构建的配置」** for *built configuration* (model-card heading) —
   构建 is developer register; 「已实现」 would be plainer but the page
   uses 构建第 N 阶段 throughout for the build phases.
5. **「目标、尚未构建」** for *target, not yet built* (accessibility) —
   terse on purpose to match the EN label; 「目标(尚未实现)」 is the
   alternative.
6. **「线上约 8.5 MB」** for *~8.5 MB on the wire* (tech check) — 线上
   usually means "online"; 「传输约 8.5 MB」 is the technical alternative.
7. **「每个课页」** for *every lesson page* (known-gaps table) — 课页 is the
   phase-1 coinage for the lesson page (nav 「课页」); fine in context,
   opaque in a table read alone.
8. **「改看表格」展开后的一张表** for *a table behind a "Show as a table"
   disclosure* — reuses the widget's own button text; 「表格视图」 would be
   the UI convention (REVIEW-2 item 7).
9. **「为什么不译成中文」** (letter-kit preface heading-style lead) — the
   preface explains an English-only page in Chinese; the tone ("a letter
   the recipient cannot read") is deliberate but could read as brusque.
10. **「源文本」** for *source text* (the foot line) — 源 is code register;
    「原始文本」 or 「来源文档」 are the document-register alternatives.

## 3. Open questions

1. **Page-weight budget.** PRODUCT.md §6.1 r2 leaves ~0.5 MB for the
   bundle; it is 1.13 MB on disk (~352 KB gzipped). The tech-check page
   states both numbers and asks the author to either re-baseline the
   budget (10.74 MB on disk / ~8.5 MB on the wire) or replace
   transformers.js's tokenizer with a self-contained BPE (would drop the
   559 KB chunk). The existing test guards only weights + tokenizer < 10 MB.
2. **HS-SOC-HU-44 on M2.** The M2 guide lists it (debate), the crosswalk
   and PRODUCT.md §4.2 put it on M3 only, while §4.3 item 6 draws every
   module's debate from it. Logged in the crosswalk's re-verification
   table; needs a decision before the summer-2027 re-verification.
3. **Policy page vs PRODUCT.md r2.** The draft's EO 14277 Sec. 6 caveat
   ("re-check returned a different sentence") is kept verbatim although r2
   has since resolved it; likewise the page does not carry r2's added
   sub-priorities (a)(ii), (a)(ix), (a)(x). A content revision of the
   policy page against r2 is a writing task, not a build task.
4. **Print fonts on other platforms.** The print stylesheet names
   Helvetica Neue / Hiragino Sans GB (macOS). On Windows/Linux Chrome the
   stack falls through to Arial / Noto Sans CJK / Microsoft YaHei; not
   verified. The PDFs that ship should be built on one known machine.
5. **Crosswalk PDF is one row per page** in places (tall "Verified
   against" cells + `break-inside: avoid` on rows): 7 / 6 pages. A
   transposed crosswalk (one module per table) would print tighter; the
   screen version is fine as is.
6. **`huggingface.co` in the model card.** The license-citation URLs
   (`huggingface.co/roneneldan/TinyStories-1M`, the dataset card) are the
   only hub mentions left under `src/classroom/`; the locality test walks
   `.ts/.tsx/.css` only, so they pass. If that test is ever widened to
   Markdown, allow-list those two lines.
7. **Letter-kit zh page language.** `<html lang="zh">` with the English
   body in `section[lang="en"]` — correct for screen readers; the PDF
   title is the zh label. Whether the zh page should exist at all (vs. a
   redirect to the EN page) is the author's call; PRODUCT.md allows EN-only.
8. **Screenshots in the Browser pane** still only render reliably on the
   first paint after navigation (REVIEW-1/2); everything above is
   DOM/computed-style or rasterised-PDF evidence. The PDFs themselves are
   the best visual record of this phase.
9. **`mockModel=1` in the PDFs.** Guides hide widgets in print, so the
   rendered text is identical with or without weights; the dice tables and
   sample numbers come from `data.ts`, not from a live run. If a future
   printable ever renders live model output, the script needs the real
   model (drop the query param; ~10 s more per page).

## 4. Deferred to phase 4 (per PRODUCT.md §10.1)

- **WCAG 2.1 AA audit** of Chopper, Tokenizer X-ray, Gamble, TheLoop and
  Hundred Rolls with ChromeVox / VoiceOver / NVDA; fill the accessibility
  statement's Known-gaps table from findings (the four rows there now are
  build notes); TTS of prompts; TheLoop reduced-motion step mode.
- **Service worker** for offline-after-reload; until then the model card,
  privacy page and tech check say "planned".
- **Embed kit**: real canvas origin (`EMBED_ORIGIN_PLACEHOLDER`), OG
  cards, per-step URLs in the guides' §14.
- **Evidence surface**: GitHub Discussions template, repository URL into
  the letter kit / accessibility / privacy placeholders, `mailto:` surface,
  Common Sense Privacy Program request (date placeholder on the privacy
  page).
- **Chromebook device test** (4 GB managed Chromebook, iPad, 30-client
  load): turns the tech check's **Target** rows into verified ones and
  measures first paint, tab memory and the 300 MB burst.
- Hosting/domain and filter-category submissions; the weights-license
  answer recorded in the model card before the site is public (§10.1 "done
  means").
