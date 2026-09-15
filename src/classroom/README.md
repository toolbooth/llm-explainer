# Inside the Machine: Classroom Edition — contributor notes

Everything under `src/classroom/` is the Classroom Edition: 45-minute,
no-login, Chromebook-first lessons that run the same TinyStories-1M model
(via `nano-lm`) as the flagship essays, plus the teacher-facing material
around them. The product brief is `PRODUCT.md` in this directory (r3); the
build record is `REVIEW-CLASSROOM-1.md` … `REVIEW-CLASSROOM-4.md` at the
repo root. This file is the map for whoever touches the code next.

**One rule above all others: the classroom edition never changes the
essays.** The flagship and the essay series import nothing from this
directory; widgets from `src/acts/` are reused by passing explicit props
(the `a11y` chrome, the temperature cap), never by editing their defaults,
so the essays' DOM stays byte-identical — `npm run check:hashes` proves it
(see Toolchain below).

## Architecture

The site is one hash-routed SPA. `src/main.tsx` hands every `#/classroom…`
hash to `ClassroomRoot.tsx`, which resolves it through the sub-router in
`route.ts`. Pages render inside `ClassroomFrame.tsx` (light palette via
`classroom.css` + `LIGHT_ROOT_CLASS`, skip link, `<main>` landmark, pill
nav, Print button). Modules register themselves: importing
`src/classroom/m1` (done once in `src/main.tsx`) calls
`registerModulePages("m1", …)`, and `ClassroomRoot` renders whatever is
registered — the registry of all six planned modules (ids, numbers,
bilingual titles, `status: "available" | "planned"`) lives in
`registry.ts`.

Logic is kept in pure modules with thin React views over them, so it is
unit-testable without a DOM:

| module | what it holds | view / consumer | test |
|---|---|---|---|
| `route.ts` | hash → page resolution, href builder | `ClassroomRoot.tsx` | `test/classroom-route.test.ts`, `test/about.test.ts` |
| `config.ts` | classroom-mode constants (below) | every classroom page | `test/classroom-config.test.ts` |
| `hints.ts` | progressive-hint state | `HintPanel.tsx` | `test/hints.test.ts` |
| `embed.ts` | clean URLs, iframe snippets, widget surfaces | `EmbedPage.tsx`, `EmbedWidgetPage.tsx`, guides' §14 | `test/embed.test.ts` |
| `adopters.ts` | the public adopter list + schema check | `TaughtPage.tsx` | `test/adopters.test.ts` |
| `print.ts` | which routes are printable, manifest shape | `scripts/build-pdf.mjs` | `test/print-targets.test.ts` |
| `audit.ts` | which routes are audited, report shape, gate | `scripts/audit-a11y.mjs` | `test/a11y-audit.test.ts` |
| `sw/strategy.ts` | every service-worker decision | `sw/classroom-sw.ts`, `sw/register.ts` | `test/classroom-sw.test.ts` |
| `about/md.ts` | the Markdown parser for the front matter | `about/Markdown.tsx`, `about/AboutPage.tsx` | `test/markdown.test.ts` |

i18n: the EN/中文 choice is the series-global store (`src/content/i18n`,
localStorage key `itm-lang`). Classroom chrome strings live in
`content/{en,zh}.tsx` (typed by `content/types.ts`); each module's lesson,
guide, printable and slides strings live in `m<N>/content/{en,zh}.tsx`.
EN and 中文 are peer versions, not translations, but structural parity is
enforced by tests (below).

## Routes

All resolved by `route.ts`; anything unrecognized falls back to the index,
never a broken page.

| route | page |
|---|---|
| `#/classroom` | module index (`ClassroomIndex.tsx`) |
| `#/classroom/<id>` | lesson page (`m1/M1.tsx`, `m2/M2.tsx`) |
| `#/classroom/<id>/step-<n>` | lesson page scrolled to guided-exploration step n (deep links for Classroom/Canvas) |
| `#/classroom/<id>/guide` | teacher guide |
| `#/classroom/<id>/unplugged` | unplugged printable |
| `#/classroom/<id>/slides` | Slides companion (only modules with `slides: true`; MVP: M2) |
| `#/classroom/about/<slug>` | one of the seven shared front-matter pages |
| `#/classroom/embed` | embed kit: snippets, clean URLs, live widget previews |
| `#/classroom/embed/<widget>` | one widget alone for an LMS iframe (`chopper`, `gamble`, `hundred-rolls`), with attribution backlink |
| `#/classroom/taught` | "I taught with this" — the adoption-evidence page |

Query params: `?mockModel=1` runs every widget deterministically without
the 7.5 MB weights (used by the PDF/audit/hash scripts and the embed
previews); `?lang=zh`/`&lang=en` forces the language.

The seven about slugs are pinned in `about/slugs.ts`; their Markdown
source (the **text of record** for the front matter) is
`about/content/*.{en,zh}.md`, loaded raw by `about/registry.ts` and parsed
by `about/md.ts` — a deliberately small parser with no HTML pass-through.
The letter kit is English-only by design; its zh page is a zh preface plus
the English kit, each part with its own `lang`.

## Config constants (`config.ts`)

- `CLASSROOM` — the classroom-mode object: `bigModel: false` (the
  flagship's optional ~136 MB model is never linked or rendered here),
  `maxTemperature: 1.5` (every classroom slider is clamped),
  `assets` (exact byte counts of the self-hosted weights under
  `public/weights/` and GPT-2 tokenizer under `public/tokenizers/gpt2/` —
  `test/tokenizer-locality.test.ts` fails if they drift, and keeps
  weights + tokenizer under the 10 MB `budgetMB` line so the model can
  never eat the bundle's headroom; the whole-first-visit budget is ≤ 11 MB
  on disk, PRODUCT.md §6.1 r3).
- `CLASSROOM_ORIGIN = "https://insidethemachine.org"` — the live origin
  every embed snippet and clean URL prints from. **Pinned equal to
  `CITE_URL`** in `src/content/citation.ts`; keep them in sync on any
  domain move.
- `CLASSROOM_REPO_URL = "https://github.com/toolbooth/llm-explainer"` —
  **pinned against `CITATION.cff`**; hosts the Discussions board and
  issues.
- `ORIGIN_PLACEHOLDER` + the guards `hasOrigin` / `embedOrigin` /
  `hasRepo` / `discussionsUrl` — if either constant is ever emptied, the
  embed page prints a labelled placeholder and the taught page drops the
  board link rather than inventing a URL. Tests pin the placeholder path
  too, so the guards stay live.
- `CLASSROOM_CONTACT_EMAIL`, `TAUGHT_DISCUSSION_CATEGORY`
  (`i-taught-with-this`) — the two zero-backend contact surfaces.

## The adopters data file (how a use report becomes a commit)

The product has no backend, so the public adopter list at
`#/classroom/taught` is a checked-in array: `ADOPTERS` in `adopters.ts`.
The workflow (PRODUCT.md §8):

1. A teacher posts in the repo's **"I taught with this"** Discussion
   category (the form is `.github/DISCUSSION_TEMPLATE/i-taught-with-this.yml`;
   the category must exist once in the repo's Discussions settings with
   slug `i-taught-with-this`) — or emails `CLASSROOM_CONTACT_EMAIL`.
2. The author confirms **explicit public-listing consent** and records its
   date. Nothing is listed without it.
3. The entry lands in `ADOPTERS` as an ordinary commit — the commit is the
   audit trail. Fields mirror the letter kit's §A report: name *or a
   self-chosen anonymous label*, optional institution, course, term (must
   name a year), modules, optional quoted note, source (`discussion` with
   the thread URL, or `email` — no address is ever published), consent
   with its recorded date.
4. Removal on request is another commit, no questions asked.

`validateAdopters` + `test/adopters.test.ts` enforce the shape: consent
recorded, real dates, known modules in order, discussion URLs only under
`CLASSROOM_REPO_URL/discussions/`. **The schema has no field for
student-level data, on purpose** — if a report contains any, it is not
excerpted; the note field stays empty or the entry is declined.

## Toolchain

- `npx vitest run` — the whole suite; everything above is unit-tested.
  Structural EN/中文 parity for the front matter is `test/about.test.ts`
  (identical skeletons: headings, table column/row counts, list lengths,
  quotes, rules — paragraph counts may differ); parity for lesson content
  tables is `test/classroom-content.test.ts`.
- `npx tsc --noEmit` — must stay clean.
- **`npm run check:hashes`** — recomputes the DOM baselines in `HASHES.md`
  (sha256 of `#root` innerHTML per essay page, EN+zh, under `?mockModel=1`)
  and fails on any mismatch. Run it after any classroom change: the essays
  must be byte-identical. Uses the machine's Chrome via `playwright-core`
  (no browser download; skips politely if none found), like all three
  scripts below.
- `npm run build:pdf` — renders every printable route (`print.ts`) to
  `dist-pdf/*.pdf` + `manifest.json` (gitignored). PDFs are release
  artefacts, not a build gate; re-render after any guide/front-matter
  change.
- `npm run audit:a11y` — axe-core over every route in `audit.ts`, EN+zh,
  lesson pages also after driving every widget state. The gate: **zero
  serious or critical WCAG 2.1 A/AA violations**; `test/a11y-audit.test.ts`
  validates the report on disk when present.
- **中文 punctuation guard** — `test/zh-punctuation.test.ts` walks every
  zh content file (`*.zh.md`, `zh.tsx`, …) and fails on any ASCII
  `, : ; ? ! ( )` adjacent to a CJK character: 中文 text uses full-width
  punctuation, no exceptions.
- `npm run build` — Vite build; also emits the service worker (below).
  **Deploys are manual**: a push does NOT deploy. After merging,
  `npm run build && npx wrangler pages deploy dist --project-name
  inside-the-machine --branch main --commit-dirty=true`.

## Service worker (offline after the first visit)

`sw/vite-plugin.ts` (registered in `vite.config.ts`) bundles
`sw/classroom-sw.ts` into `dist/classroom-sw.js` after the main build — no
framework, ~2 KB. Policy (all decisions in `sw/strategy.ts`, pure and
tested): one **versioned precache** (app shell, JS/CSS chunks, weights,
tokenizer; version = hash of every precached file's contents, so any byte
change is a new worker and the old cache is deleted); **navigations are
network-first** (a deploy is never hidden behind a cached page; offline
falls back to the precached shell); **precached paths are cache-first**;
everything else — cross-origin, non-GET, the flagship's optional big
model — bypasses the cache entirely and nothing is cached at runtime.
Registered only from `#/classroom…` pages in production builds
(`sw/register.ts`, called in `ClassroomRoot`'s mount effect); essays never
register it.

## How to add M3 (or any next module)

1. **Registry**: flip `m3`'s `status` to `"available"` in `registry.ts`
   (title and question are already there); add `slides: true` only if it
   ships a Slides companion.
2. **Module directory** `m3/`: mirror `m2/` — `content/{types,en,zh}.tsx`
   + `content/i18n.ts`, `data.ts` (precomputed examples so `?mockModel=1`
   stays deterministic), `M3.tsx` (accepts `step: number | null`),
   `M3Guide.tsx`, `M3Unplugged.tsx`, and an `index.ts` that calls
   `registerModulePages("m3", …)`. Import `"./classroom/m3"` in
   `src/main.tsx`.
3. **Widgets**: reuse `src/acts/` widgets with the classroom props
   (`a11y`, the `CLASSROOM.maxTemperature` cap); at most one new widget
   (PRODUCT.md §4.1 rule 3 — for M3 that is Guess-then-Reveal), built with
   its accessible alternative from day one. M3's AttentionRoom heatmap
   needs the text-table alternative (§6.3) — the largest single follow-on
   item.
4. **Derived surfaces update themselves**: `print.ts`, `audit.ts` and
   `embed.ts` all derive from `availableModules()`, so the new pages are
   printed, audited and embeddable automatically — but tests that pin
   counts (`test/embed.test.ts`, `test/print-targets.test.ts`) and the
   guides'/front matter's numbers must be updated deliberately, and the
   crosswalk's M3 row stops being "planned".
5. **Verify like phase 4 did**: full vitest + tsc; `npm run check:hashes`
   (essays untouched); `npm run audit:a11y` at zero serious/critical;
   `npm run build:pdf`; re-measure the bundle against PRODUCT.md §6.1 r3
   (≤ 11 MB first visit on disk); then build + wrangler deploy.
6. **Record it**: a REVIEW-CLASSROOM-N section with what was built, what
   was verified, and what is deliberately not claimed. The honesty rules
   are load-bearing: pages say only what the build does.

OG cards are deliberately absent: deferred until the Show HN launch week
(decision recorded 2026-09-16 in `REVIEW-CLASSROOM-4.md`, Commit D).
