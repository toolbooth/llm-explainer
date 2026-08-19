# Section 1 — Introduction (DRAFT)

> Status: drafted by Claude at the author's direction (2026-08-19). Every
> claim below requires author sign-off at the scheduled post-completion
> deep-dive before any submission. Bracketed notes mark verify-before-use.

---

Large language models are, by usage, the most widely adopted software
artifacts of the decade — and, for most of their users, the least
understood. The prevailing mental models are either magic or dismissal
("fancy autocomplete"), and both fail the same test: they give a person no
way to reason about *why* the system just did what it did. High-quality
explainers exist, but each leaves a gap. The most-cited introduction, The
Illustrated Transformer [Alammar 2018], is static and written for
practitioners; Bycroft's 3D walkthrough renders a real network in
exquisite detail, for readers who already speak linear algebra; and
Transformer Explainer [Cho et al. 2025], the closest neighbor to this
work, puts a live GPT-2 in the browser but keeps its computation inside a
compiled inference runtime and its narrative in English, aimed at ML
students. None of them lets a curious non-engineer put *their own
sentence* into a *transparent* model and read, in plain language, what
happens to it.

Inside the Machine is a long-form interactive essay built around that
missing experience. The reader types a sentence; that sentence becomes the
connective thread of seven acts — it is chopped into tokens, located on a
map of meaning, watched by attention heads, gambled on token by token,
looped into generation, and finally used to explain both what scale buys
and why models confabulate. Every widget runs a real model (GPT-Neo,
TinyStories-1M, 7.5MB of fp16 weights self-hosted as a static asset)
entirely in the reader's browser tab; nothing typed ever leaves the
device. The narrative is written for readers with no ML background and is
fully bilingual (English / 中文).

This experience rests on two contributions:

**C1 — an auditable in-browser model.** The essay's model is not an
embedded inference runtime but a complete GPT-Neo forward pass written in
roughly 260 lines of dependency-free TypeScript (tensor ops, the
transformer stack, and a hand-rolled safetensors parser; the full in-page
engine is under 500 lines), executing in ~10ms per pass. Its fidelity is
verified token-exactly: greedy 12-token generations reproduce the
reference implementation's output exactly [VERIFY: restate the precise
verification protocol], down to faithfully reimplementing GPT-Neo's
idiosyncratic departure from standard attention scaling (no 1/√d
division). Where prior in-browser explainers visualize tensors emitted by
an opaque compiled artifact, here the exposition and the implementation
are the same object: every number on screen is traceable to source code a
motivated reader can read. [AUTHOR SIGN-OFF: this is the load-bearing
differentiation vs. Transformer Explainer — must be phrased exactly this
carefully, and the author must be able to defend it in review.]

**C2 — the reader's own words as the pedagogy.** No visualization in the
essay is canned. The embedding map searches the model's actual embedding
table for the reader's word; the attention room renders the model's actual
attention tensors over the reader's sentence, and *automatically
discovers* interpretable heads — a previous-token head, an anchor head, a
most-diffuse head — by scanning those live tensors rather than presenting
curated examples; the probability bars and the autoregressive loop gamble
on the reader's own prefix. The essay's claim is that "it computed THIS
from MY sentence" is a categorically stronger teaching move than any
pre-rendered illustration, and the bilingual plain-language narration
extends it to audiences existing explainers do not reach. [AUTHOR
SIGN-OFF: pedagogical claim wording.]

[P4 — STATUS, fill at launch: deployment numbers, countries, course
adoption, community translations. Transformer Explainer's AAAI version
carried a single number here (125,000 users); ours will carry whatever
the Q1 2027 launch produces.]

---

References to wire when formatting: Alammar 2018 (blog); Bycroft LLM
Visualization; Cho et al., Transformer Explainer (AAAI 2025, DOI
10.1609/aaai.v39i28.35347); Wang et al., CNN Explainer (IEEE TVCG 2020);
[optional: Olah, distill.pub lineage for "explorable explanations"].
