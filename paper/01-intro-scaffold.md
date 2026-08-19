# Section 1 (Introduction) — Working Scaffold

Target: ~800 words, 4 paragraphs, ending in two crisp contribution bullets.
Model: Transformer Explainer's AAAI demo intro. Author (Shangyan) supplies
the claims per paragraph — rough Chinese bullets are fine; Claude structures
and polishes English; every claim gets author sign-off before it lands.

## P1 — The gap (hook)

Claim to establish: high-quality LLM explainers exist, but none combines
plain-language narrative + the reader's OWN input + an auditable in-browser
model + bilingual EN/中文.

Reference class to position against (cite all three):
- Illustrated Transformer (Alammar 2018): static, developer-leaning, hugely
  cited — proves demand, doesn't interact.
- Bycroft's 3D LLM visualization: stunning, but for engineers.
- Transformer Explainer (Cho et al., AAAI 2025): interactive, live GPT-2 —
  the closest neighbor. Our differentiation must be stated carefully and
  honestly (see Q2 below — do NOT overclaim; VISxAI reviewers are from
  exactly this community).

**Author input needed**: your one-sentence version of "what's missing" that
you actually believe — the way you'd say it to a non-engineer friend.

## P2 — What Inside the Machine is

One paragraph: seven-act long-form interactive essay; the reader's sentence
is the connective thread; a real model (TinyStories-1M GPT-Neo, fp16,
self-hosted) runs every widget; plain language; EN/中文.

**Author input needed**: which act do you personally think lands the "aha"
— and why. (Papers with a point of view read better than inventories.)

## P3 — Contributions (the load-bearing paragraph)

- **C1** (system): pure-TypeScript GPT-Neo forward pass, zero runtime
  dependencies, fp16 weights, verified token-exact against the reference
  implementation (12-token greedy generation reproduced exactly), ~10ms/pass.
  Includes faithful reproduction of GPT-Neo's no-1/√d attention-scaling quirk.
- **C2** (pedagogy): every visualization is computed live from the reader's
  input — including automatic feature-head discovery (previous-token head /
  anchor head / most-diffuse head found by scanning the real attention
  tensors), never canned examples — narrated in plain language, bilingual.

**Author input needed**: answers to Q1-Q3 below become this paragraph.

## P4 — Status / deployment

Fill at launch: usage numbers, countries, course adoptions if any.
(Transformer Explainer's only empirical claim in the AAAI version was
"125,000 users." Ours will be whatever the Q1 launch produces.)

---

## Pre-writing questions (author answers before prose exists)

These double as the overdue close-out quiz for S2 (the hand-rolled model).
Rough Chinese answers are fine; wrong answers are fine — they locate gaps.

**Q1.** 为什么"逐 token 对照官方实现验证"值得作为贡献写进论文?反过来说:
如果没有这一步,一个较真的评审会对我们的交互演示提出什么合理怀疑?

**Q2.** (诚实性关键) Transformer Explainer 也是真模型、也展示 attention 和
logits。我们的手写 TS 前向传播和它跑 ONNX Runtime 的**本质**区别到底是什么?
哪种说法是我们能站住的,哪种是过度声称?(提示:想想"可审计"对读者和对
教学者分别意味着什么;再想想 no-scaling quirk 是怎么被发现和保真的。)

**Q3.** "自动特征头发现"具体在计算什么?为什么"绝不编造/never canned"
在教学上是一个值得写进论文的立场,而不只是实现细节?

**Q4.** 一句话定位练习:「Inside the Machine 是第一个 ___ 的 LLM 解释文章」。
空里填什么,既真实又有分量?(这句话的最终版会出现在 abstract 里。)

## Process

1. Author answers Q1-Q4 (chat or edit this file directly).
2. Claude probes the answers (close-out style), gaps get filled.
3. Author drafts P1-P3 from the agreed answers (Chinese or English).
4. Claude structures + polishes English; author signs off claim by claim.
5. Standard close-out at the end: author explains the finished section back.
