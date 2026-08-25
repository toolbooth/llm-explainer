# Inside the Machine

[![DOI](https://zenodo.org/badge/1345520185.svg)](https://zenodo.org/badge/latestdoi/1345520185)

**An interactive guide to how LLMs actually think — a real language model,
dissected live in your browser tab.** English and 中文.

You type a sentence; a real (very small) language model splits it into
tokens, maps them into meaning-space, reads them with sixteen attention
heads at once, and gambles on the next word — every step shown live, on
your device. No videos, no mock-ups, no server: the 7.5 MB model runs in
plain TypeScript in the page, and nothing you type leaves the tab.

*Live at [insidethemachine.org](https://insidethemachine.org) — English and 中文.*

## The series

| # | Essay | One question it answers |
|---|---|---|
| 1 | **Inside the Machine** (flagship) | What happens between your prompt and the reply? |
| 2 | Why It Lies | Why do confident-sounding answers go wrong? |
| 3 | The Attention-Head Field Guide | What are all those heads actually doing? |
| 4 | Why It Can't Count | What does tokenization break? |

New essays ship monthly after launch — see [SERIES.md](./SERIES.md).

## Classroom Edition

The same widgets, packaged as lesson modules with teacher guides,
printables, slides and an unplugged activity — WCAG-audited, offline-capable,
zero data collection. Start at `#/classroom` in a running build; the shared
front matter (model card, privacy & safety, tech check, standards crosswalk,
accessibility, letter kit) lives in
[`src/classroom/about/content/`](./src/classroom/about/content/).

## Run it locally

```bash
npm install
npm run dev
```

Tests (`npm test`), DOM-hash baselines (`npm run check:hashes`,
[HASHES.md](./HASHES.md)), accessibility audit (`npm run audit:a11y`).

## How it works

- The in-page model is **TinyStories-1M** run by
  [nano-lm](https://github.com/toolbooth/nano-lm) — a zero-dependency
  TypeScript re-implementation of the GPT-Neo forward pass, verified
  token-exact against the reference implementation.
- Act 4 optionally wakes a larger model (SmolLM2-135M-Instruct, ~136 MB,
  explicit click) via transformers.js.
- No analytics, no accounts, no cookies; the GPT-2 tokenizer and the small
  model's weights are self-hosted next to the site.

## Citation

If you reference this essay or its widgets in academic work, cite via
[CITATION.cff](./CITATION.cff) (GitHub's "Cite this repository" button):

> Shen, Shangyan. *Inside the Machine: An Interactive Guide to How LLMs
> Actually Think*. 2026. https://github.com/toolbooth/llm-explainer

An arXiv preprint is planned; once it exists, CITATION.cff's
`preferred-citation` will point at it — cite the preprint from then on.

Reports of classroom use are warmly welcomed — see the
[letter kit](./src/classroom/about/content/letter-kit.en.md) or open a
thread in [Discussions](https://github.com/toolbooth/llm-explainer/discussions).

## License

Code and text: [MIT](./LICENSE). The TinyStories-1M weights are
redistributed unchanged with attribution from an upstream research release
and are not under the MIT license — see the
[model card](./src/classroom/about/content/model-card.en.md).
