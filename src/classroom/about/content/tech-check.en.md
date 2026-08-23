# Tech check — do this the day before

*Inside the Machine: Classroom Edition · shared front matter · draft 2026-08-22. Device rows are labelled **verified** (observed by the author) or **target** (design baseline not yet tested). Do not read a "target" row as a promise.*

## Device and browser baseline

| Requirement | Status | Notes and source |
|---|---|---|
| A 2019–2021 education Chromebook: 4 GB RAM, Celeron/MediaTek, managed Chrome, no install rights | **Target** (design baseline; MVP validation item, PRODUCT.md §10.1 item 4) | Chosen because ~88 % of districts give every MS/HS student a device, 93 % plan to buy Chromebooks, and fleets average ~7.6 years [PRODUCT.md §6.1: marketbrief.edweek.org 2025/01; agp360.com]. |
| No WebGPU, no Vulkan, no WebAssembly, no web workers needed | **Verified by construction** | The engine is plain TypeScript on the main thread [nano-lm README]. WebGPU on ChromeOS needs Vulkan (Chrome 113+) and WASM fallbacks run 3–15× slower — this design needs neither [PRODUCT.md §1.2]. |
| Any current evergreen browser (Chrome, Edge, Safari, Firefox) | Chrome/Safari on the author's development machine: **verified**. ChromeOS managed profile, Windows 10/11 Edge, iPadOS Safari, Firefox: **target** (PRODUCT.md §6.1 "Tested on" list is the plan, not a report). | Touch operation of every widget is a requirement, not yet verified. |
| First interactive paint under 3 s on a 4 GB Chromebook over school Wi-Fi | **Target** | PRODUCT.md §6.1. |
| Tab memory under 500 MB | **Target / budget** | The weights widen to fp32 in memory (~15 MB); attention maps for a classroom-length sentence are kilobytes. Expect well under 100 MB, but it has not been measured on the target device. |
| Works without the optional large model | **Verified by construction** | The ~136 MB large model is loaded only on an explicit click in the flagship essay and is not linked from any classroom page [PRODUCT.md §4.1 rule 4; `src/lib/engine.ts`]. |

## What gets downloaded (first visit)

| Asset | Size | When | Cached? |
|---|---|---|---|
| Page, script and style bundles | measured at build 2026-08-23: 1.29 MB on disk (684 KB app — the seven front-matter documents travel inside it — + 559 KB transformers.js tokenizer library + 46 KB CSS), ~412 KB gzipped on the wire; the 23.6 MB ONNX runtime in the same build is fetched only by the flagship's optional larger model, never by a classroom page; the service worker itself is 1.9 KB | page open | yes |
| GPT-2 tokenizer files (`tokenizer.json`, `tokenizer_config.json`), self-hosted under `/tokenizers/gpt2/` | 2.1 MB (2,107,887 bytes; ~597 KB gzipped) | page open | yes |
| Model weights `tinystories-1m.safetensors` + `meta.json` | 7.5 MB (7,502,858 bytes) | page open — the first widget on the page asks for it, and every widget shares the one copy | yes, long-lived cache headers (planned with hosting) |
| **Total** | **≤ 10 MB** budget for weights + tokenizer + bundle [PRODUCT.md §6.1 r2]. Measured 2026-08-23: 7.50 + 2.11 + 1.29 = **10.90 MB on disk**, about **8.5 MB on the wire** (the weights do not compress; the rest does). The weights-plus-tokenizer line (9.61 MB) is inside the budget and pinned by a test; the bundle exceeds the ~0.5 MB PRODUCT.md left for it on disk but not on the wire — open question for the author: re-baseline the budget, or replace transformers.js with a self-contained BPE tokenizer | | |

After the first visit the browser serves all of this from its ordinary cache, and — since build phase 4 — a **service worker** keeps a second, versioned copy so that the page survives a reload with no network at all (next section). On a managed Chromebook that clears site data at sign-out, both copies go with it and every student re-downloads ~11 MB on each new session; plan bandwidth accordingly (below).

## Offline after the first visit (service worker)

Built 2026-08-23 (PRODUCT.md §6.1 "offline behaviour", level (b); §10.1 item 4). The first time a classroom page is opened, the browser installs a small service worker (`/classroom-sw.js`, 1.9 KB, no framework) that stores one **versioned precache** of everything a lesson needs — the page shell, the three script/style files, the 7.5 MB weights and the ~2 MB tokenizer (8 files, 10.9 MB). From then on:

- **A reload with no network works.** The page, every widget and the model load from the precache. Verified 2026-08-23 in headless Chrome against the production build: open Module 2 with real weights, wait for the worker (ready 2.0 s after the model), switch the browser to offline, reload — the page renders, the Gamble draws its ten bars, Hundred Rolls rolls, the Loop steps; zero failed requests; a fetch of any un-cached URL fails, proving the network was really off. Navigating offline to Module 1 (中文) and to this page also works.
- **A new release is never hidden behind the cache.** Page loads are network-first: online, the browser always asks the server for the current page and gets the current one. The worker's version is a hash of the contents of every precached file, so any change to the site — a new build, re-exported weights — is a new worker; the browser installs it in the background, it fills a new precache, and the old one is deleted when it takes over. The newer version is served on the *next* load, never by reloading a page mid-lesson.
- **Scope.** The worker is registered only from classroom pages (`#/classroom…`) and only in production builds; the essays never register it. Because every route is a hash on the site root, the worker's scope is the site root too, so after a classroom visit an essay's shell also loads offline — harmless, and the essays' pages are unchanged. Nothing is ever cached at runtime; the precache is the only cache, and cross-origin requests (the flagship's optional larger model) are never touched.
- **Hosting requirement.** `classroom-sw.js` must be served with `Cache-Control: no-cache` (or a short max-age) so a new release is noticed; `/assets/*` (content-hashed file names), `/weights/*` and `/tokenizers/*` can carry long-lived cache headers. Both settings are hosting configuration (planned with the domain).
- **Limits.** Storage is per browser profile: a managed Chromebook that clears site data at sign-out clears the worker and its precache with it, so each new session is a first visit again. On the first visit the worker fetches the weights a second time only if the browser's HTTP cache refuses to share the page's in-flight download (it retries on a timer before resorting to that). Private/incognito windows may not keep a worker at all.

**To verify on any device (two minutes):** open a lesson page, wait for the model indicator to reach 100 %, open DevTools → **Application** → **Service Workers** (Chrome / ChromeOS: `Ctrl`+`Shift`+`J`, then the Application tab) and confirm `classroom-sw.js` is *activated and running*; tick **Offline** in the same panel (or turn Wi-Fi off); reload. The page should come back with every widget working.

## Network and content-filter notes

- **Domain.** The classroom site lives at `[classroom.<flagship-domain> — TBD]`, a stable domain owned by the author, published at least 60 days before the first distribution push so that filter vendors categorize it. `*.github.io`, `*.netlify.app` and `*.vercel.app` are deliberately not the canonical URL; they have been miscategorized as "parked" or blocked [PRODUCT.md §6.2].
- **Category we request:** **Education / Reference.** GoGuardian's "Artificial Intelligence Tools" category and Lightspeed's "AI – Generative" list are keyed on hosted AI services; this site makes no call to any AI service and is not a chat product [PRODUCT.md §6.2; goguardian.com/product-update/new-ai-filtering-category]. The author submits the domain proactively to GoGuardian, Lightspeed, Securly and ContentKeeper once live.
- **If the page is blocked anyway**, the symptom is usually one of: a filter block page instead of the lesson; the page loads but the model indicator never leaves 0 % (the `.safetensors` file is blocked by extension or size); or the Chopper never shows tokens (the tokenizer files under `/tokenizers/gpt2/` on the same domain are blocked — unusual, since they are plain JSON). Send the template below to your IT contact.
- **No sign-in** means no Google Workspace admin approval is needed for under-18 access [PRODUCT.md §6.2].
- **LMS embedding.** Google Classroom: paste the module or step URL (each step has its own link, e.g. `#/classroom/m2/step-3`). Canvas/Schoology: use the iframe snippet in the module guide; the frame shows a fallback link, and note that Canvas does not render iframes in edit mode [PRODUCT.md §6.4; community.instructure.com 662934].

### Unblock-request template (adapt and send to IT)

> Subject: Allowlist request — Inside the Machine: Classroom Edition (`[classroom domain]`)
>
> Hello `[name]`,
>
> I plan to use a free AI-literacy lesson with my `[course]` class on `[date]`. The resource is a static website at `https://[classroom domain]/` (hosted by `[host]`; repository: `[URL]`). It is currently `[blocked entirely / loads but the model file does not download / uncategorized]` on our student Chromebooks.
>
> Technical summary for your review:
> - Static HTML/JavaScript; no accounts, no sign-in, no cookies, no analytics, no third-party scripts.
> - Downloads one 7.5 MB model file (`tinystories-1m.safetensors`) and ~2 MB of vocabulary files from the same domain, then makes no further network requests. Student input never leaves the browser.
> - It is not a chatbot and contacts no AI service; the appropriate category is Education/Reference rather than AI Tools.
> - Privacy statement and a five-minute network-tab audit procedure: `https://[classroom domain]/#/classroom/about/privacy`.
>
> Could you allow `[classroom domain]` for student devices (and permit the `.safetensors` file type if it is blocked by extension)? I am happy to demonstrate on a student device.
>
> Thank you,
> `[teacher name, school, room]`

## 30-client classroom load guidance

- **Arithmetic.** 30 students × ~10 MB ≈ **300 MB** burst if everyone opens the page at the same second (PRODUCT.md §6.1 states 225 MB for the weights alone). On a 100 Mbps shared school link that is roughly 25–30 s of saturation; on a 1 Gbps link, a few seconds. Acceptable, but **not yet tested** — a 30-client simultaneous-load test is MVP item 4 [PRODUCT.md §10.1].
- **Stagger it for free.** The lesson's first ten minutes are unplugged by design [PRODUCT.md §4.1 rule 2]. Ask students to open the URL as they sit down, put the lid halfway down, and start the unplugged activity; by minute 13 every device has the model cached and there is no visible wait.
- **Second day is free.** Once cached, returning devices download nothing (assuming site data persists across sign-out on your managed profiles; ask IT if students see the 7.5 MB download every day).
- **Compute is not the bottleneck.** A forward pass is milliseconds; thirty devices computing independently do not contend for anything.
- **If Wi-Fi dies mid-lesson**, devices that already loaded the page keep working. Devices that had not finished loading need the printed unplugged sheet and a partner's screen. Always print the sheet.

## Five-minute pre-class checklist (the day before, on a student device)

1. ☐ On a **student** Chromebook under a **student** profile (not your teacher account), open the module URL. Page renders within a few seconds.
2. ☐ The model-loading indicator reaches 100 %. (If it stalls at 0 %, the weights file is blocked — send the template above.)
3. ☐ Type a sentence into the first widget. Tokens appear; in M2, probability bars appear and the temperature slider redraws them.
4. ☐ Open the three deep-linked steps for the module (`#/classroom/m2/step-1`, `step-2`, `step-3`) from the guide; each lands on the right widget state.
5. ☐ Turn Wi-Fi off for ten seconds and type another sentence. Still works. Turn Wi-Fi back on.
6. ☐ Projector: open the same URL on the teacher machine; check that text is legible from the back row (browser zoom 125–150 % works; widgets are responsive).
7. ☐ Print the unplugged activity sheet (one per pair) and the exit ticket (one per student).
8. ☐ Confirm the filter category with one tab of a student device pointed at the privacy page; if it is blocked, you have a day to send the unblock request.

If step 1 or 2 fails and IT cannot help in time, run the unplugged activity for the full period and demonstrate the widget from the projector — the lesson is designed to survive a device-free day [PRODUCT.md §9 "Policy direction reverses"].
