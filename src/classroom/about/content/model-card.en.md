# Model card — the model in your students' browsers

*Inside the Machine: Classroom Edition · shared front matter · draft 2026-08-22. Status: integrated into the site 2026-08-22 (build phase 3); the service worker shipped 2026-08-23 (phase 4); anything still marked "planned" is classroom-build work that has not shipped (the Chromebook device test).*

## In one paragraph

The model running in your students' browsers is **TinyStories-1M**, a small GPT-Neo language model trained on synthetic children's stories. It is about 1 million non-embedding parameters (about 3.75 million counting the word-embedding table), stored as a single 7.5 MB file. ChatGPT-class models are roughly 100,000 times larger or more (public estimates). Everything you see in the lessons — tokens, probabilities, attention, temperature, sampling — works the same way in the large models; the vocabulary and the competence do not. This is a feature (age-appropriate by construction; runs on a 4 GB Chromebook without special hardware) and a limitation (it cannot answer a trivia question, and it does not speak anything but simple English).

## What it is

| Item | Value | Source |
|---|---|---|
| Checkpoint | `roneneldan/TinyStories-1M` (Hugging Face) | nano-lm `weights/meta.json`; nano-lm README "Weights" |
| Architecture | GPT-Neo: 8 layers, 16 attention heads per layer, hidden size 64, 2048 positions, `gelu_new` activation | nano-lm `weights/meta.json` |
| Vocabulary | GPT-2 byte-level BPE (Byte-Pair Encoding), 50,257 tokens | nano-lm README "Tokenizers" |
| Parameters | ~1 M non-embedding; the shipped fp16 file is 7,502,858 bytes (108 tensors), i.e. ~3.75 M stored values including the 50,257 × 64 token-embedding table | nano-lm README; flagship essay Act 6 ("1M non-embedding params · 7.5MB") |
| Weight file | `tinystories-1m.safetensors`, fp16, self-hosted as a static file on the lesson site | nano-lm README "Self-hosting" |
| Engine | **nano-lm** — a dependency-free TypeScript forward pass (~150 lines of plain loops), main thread only: no WebGPU, no WebAssembly, no web workers | nano-lm README; PRODUCT.md §6.1 |
| Correctness | Verified token-exact (identical 12-token greedy continuation) against Hugging Face `transformers` `GPTNeoForCausalLM` on the same checkpoint; logits and attention maps within fp16 tolerance | nano-lm README "Token-exact" |
| Speed | A forward pass over a classroom-length sentence takes milliseconds (~10 ms measured on the author's development machine; Chromebook timing is pending the MVP device test, PRODUCT.md §10.1 item 4) | nano-lm README; PRODUCT.md §1.2, §6.1 |

## Training data

- The model was trained on **TinyStories**, a dataset of short stories "synthetically generated (by GPT-3.5 and GPT-4) ... that only use a small vocabulary" — the vocabulary a typical three- to four-year-old would understand. The stories were written by machines, for research, not collected from children or from the open web. [Hugging Face dataset card, `roneneldan/TinyStories`, retrieved 2026-08-22]
- Paper: Ronen Eldan and Yuanzhi Li, *TinyStories: How Small Can Language Models Be and Still Speak Coherent English?*, arXiv:2305.07759 (May 2023). [nano-lm README "Weights"]
- The flagship essay's Act 2 shows the consequence directly: the model's "map of meaning" places *dragon* next to *knight* and *monster* because that is what dragons did in those stories. The model's "opinions" are its diet, and Module 6 (*What It Learned From*) is built on that fact.

## What it can do

- Continue a short, simple English sentence in the register of a children's story ("Once upon a time there was" → "a little girl named ...").
- Show, for any position, a genuine next-token probability distribution, so students can watch sampling, temperature and the autoregressive loop operate on their own sentence.
- Expose real attention weights for every layer and head, including heads that reliably attend to the previous word or to the first word — useful precisely because the model is small enough to read.
- Run on the main thread of an ordinary browser with nothing installed.

## What it cannot do — say this to students before they type

- **It cannot answer factual questions.** It has never seen an encyclopedia, a news article or a textbook. Ask it the capital of France and you will get a story about a cat. This is not a bug to apologise for; it is Module 4's opening exhibit (a confident-sounding wrong answer), and the prompt sets in every module lead with sentences the model handles.
- **It is English-only.** The training stories are English, and the GPT-2 tokenizer represents non-ASCII text as raw bytes. Type a 中文 sentence, or an emoji, and the Chopper will show it shattered into byte-level tokens the model has essentially never seen during training; completions will be nonsense. The 中文 edition's prose is native, but its live-model examples stay in English for this reason [PRODUCT.md §9, row 1]. Module 1's block extension *uses* the byte-chopping as the lesson ("what does the model see when you type your home language?").
- **It has no memory between runs, no instructions, no chat persona.** It is a next-token predictor and nothing else. Students are not "talking to an AI"; they are inspecting one.
- **It is not filtered.** See the Privacy & safety one-pager for the full statement. In short: the model can in principle emit any of the 50,257 tokens in its vocabulary; what makes odd output improbable is the training data, not a filter, and we do not claim otherwise.
- Two engine quirks you may be asked about by an advanced student: GPT-Neo does not scale attention scores by 1/√d (the engine reproduces this on purpose, because the checkpoint was trained that way), and the engine treats GPT-Neo's local-attention layers as global, which is exact for inputs of ≤ 256 tokens — far longer than any classroom sentence [nano-lm README "Known semantics"].

## Sampling in classroom mode (built configuration)

The classroom build inherits the flagship widgets and adds a classroom-mode configuration (`src/classroom/config.ts`, build phase 1) [PRODUCT.md §9 row 2; §10.2 "classroom shell"]. As built:

| Control | Flagship widget today | Classroom mode (built) |
|---|---|---|
| Temperature range | Gamble 0.10–2.00 (default 1.00); TheLoop 0.10–1.60 (default 0.80) | Every classroom slider runs 0.10–**1.50** in 0.05 steps (Gamble, TheLoop and Hundred Rolls alike) |
| Candidates considered per roll (top-k) | Gamble top 10; TheLoop top 8 | Unchanged |
| Continuation length (TheLoop) | 30 tokens per prompt, then Reset | Unchanged: 30 tokens per prompt, then Reset |
| Optional token blocklist at sampling time | none | Available as a one-day change if a district asks; off by default |
| The optional larger model | A separate ~136 MB model, loaded only on an explicit click | **Not linked from any classroom page** |

(Sources: `src/acts/Gamble.tsx`, `src/acts/TheLoop.tsx`, `src/lib/engine.ts` and `src/classroom/config.ts` in the repository, re-read 2026-08-22 against the built Module 1 and 2 pages. If a shipped page shows different numbers, the page is right and this table is stale.)

Why the cap matters pedagogically, not just defensively: above roughly T = 1.5 the top-10 distribution flattens enough that the "dice" become nearly uniform, and the lesson point — that temperature changes *how boldly* the model bets on the same hunches, not what it knows — gets lost in noise.

## Provenance and license of the weights

- **Source.** Converted by the author from `roneneldan/TinyStories-1M` with `tools/convert_weights.py` in nano-lm; the conversion is deterministic and the reference fixture (`tools/reference.json`) is regenerated from the upstream checkpoint [nano-lm README "Weights"; `tools/README.md`].
- **Upstream license — please read this carefully.** As of 2026-08-22 the Hugging Face model card for `roneneldan/TinyStories-1M` shows **no license field**. The TinyStories *dataset* card states the license **CDLA-Sharing-1.0** (Community Data License Agreement – Sharing). nano-lm's `meta.json` records the weights as "roneneldan/TinyStories (research release)". This front matter therefore does **not** assert a license for the weights; the author will confirm terms with the upstream authors, or document the basis for redistribution, before the public release, and this section will be updated. Until then, treat the weights as a research release redistributed unchanged with attribution. [Retrieved 2026-08-22 from huggingface.co/roneneldan/TinyStories-1M and huggingface.co/datasets/roneneldan/TinyStories]
- **Engine license.** nano-lm's license "will be chosen before the open-source release" [nano-lm README "Status"; PRODUCT.md §9 row 5]. Placeholder: `[LICENSE — TBD at release]`.
- **Citation.** Cite the flagship object: Shen, Shangyan. *Inside the Machine: An Interactive Guide to How LLMs Actually Think* (CITATION.cff in the repository). When citing the in-browser model specifically, cite nano-lm (its own CITATION.cff). An arXiv preprint is forthcoming; cite that once it exists.

## How to verify it runs offline (five minutes, any device)

1. Open the lesson URL and wait for the "Loading the model (7.5 MB, shared by every widget on this page)…" indicator to reach 100 %.
2. Open the browser's developer tools (Chrome / ChromeOS: `Ctrl`+`Shift`+`J`, then the **Network** tab). Tick "Preserve log".
3. Turn off Wi-Fi (or set the Network tab's throttling menu to **Offline**).
4. Type a new sentence into the Chopper or the Gamble. Tokens appear and probability bars redraw.
5. Look at the Network tab: no new requests were attempted, and nothing failed. The computation you just watched happened in the tab.
6. Reload the page while still offline. **Built 2026-08-23:** a classroom page reloads from the service worker's precache and keeps working (the Tech check describes what is stored, how updates work and how to confirm the worker is running); the flagship essay has no worker of its own, so it survives a dropped connection mid-session but not a reload. Keep the printed unplugged sheet as the fallback for the day a device arrives with a cleared profile [PRODUCT.md §6.1 "Offline after first load"].

A longer network-tab audit, suitable for a district IT reviewer, is in the Privacy & safety one-pager.

## Scale bar for the classroom wall

| Model | Parameters | Source |
|---|---|---|
| The model in this page | ~1 M non-embedding (7.5 MB) | nano-lm |
| GPT-2 (2019) | 124 M | flagship essay Act 6 |
| Frontier models (2026) | trillions (public estimates) | flagship essay Act 6 |

"Scale doesn't change what the machine does — it changes how uncannily well the same dice-rolling starts to look like thought." [flagship essay, Act 6]
