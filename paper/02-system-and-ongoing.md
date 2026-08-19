# Sections 2-3 (DRAFT — author sign-off required at the deep-dive)

## 2. System Design and Implementation

Two principles shaped the essay.

**P1 — The implementation is the exposition.** Every number the reader sees
is produced by a forward pass they can read: a dependency-free TypeScript
implementation of GPT-Neo (~260 lines covering the tensor ops, the
transformer stack, and a hand-rolled safetensors parser) running
TinyStories-1M (7.5MB, fp16, self-hosted). Fidelity is enforced by
token-exact verification against the reference implementation — greedy
12-token generations reproduce exactly — which required faithfully
reimplementing GPT-Neo's departure from standard 1/√d attention scaling.
[SIGN-OFF: verification protocol wording]

**P2 — The reader's sentence is the curriculum.** The seven acts follow the
actual data path (tokenize → embed → attend → sample → loop), and every
visualization is computed live from the reader's own input. The attention
act discovers interpretable heads — previous-token, anchor, most-diffuse —
by scanning the live attention tensors of the reader's sentence rather
than showing curated examples. Act 4 optionally wakes a larger model
(SmolLM2-135M-Instruct, 136MB quantized, explicit click, cached) for
richer next-token distributions. The narrative is plain-language and fully
bilingual (EN/中文).

*Usage scenario.* A high-school teacher pastes a sentence from tomorrow's
lesson. She watches it fragment into tokens (and sees why letter-counting
fails), finds the previous-token head reading HER sentence, drags the
temperature slider until the dice go wild, and steps the loop one gamble
at a time — arriving at Act 7 already owning the explanation of why the
model confabulates. [SIGN-OFF: scenario tone]

*Implementation.* React + Vite + TypeScript; ~10ms per forward pass on a
laptop; everything runs client-side with zero telemetry — typed text never
leaves the tab.

## 3. Ongoing Work

Mobile refinement and the Chinese edition's editorial pass precede a
Q1 2027 public launch. We plan privacy-respecting deployment counting,
outreach to instructors (the essay is designed as assignable course
reading), and a formal learning-outcome study for an extended paper.
[FILL AT LAUNCH: deployment numbers]
