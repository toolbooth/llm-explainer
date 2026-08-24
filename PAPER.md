# Citability & Companion Paper Plan

Goal: turn this essay into (a) a Google-Scholar-visible citable object and
(b) a peer-reviewed publication credit, on the template proven by
Transformer Explainer (VIS 2024 poster → AAAI 2025 demo → CHI 2026 full
paper, all growing under one arXiv ID).

## Venue ladder (researched 2026-08-18)

**Primary target: VISxAI 2027** (Workshop on Visualization for AI
Explainability @ IEEE VIS).
- The interactive explainable ITSELF is the submission — no separate paper
  required ("the explainable must stand on its own").
- Deadline pattern: Jul 30 / Aug 6 / Aug 6 / Aug 10 for 2023-2026 →
  **expect early Aug 2027, CFP ~May 2027**. 9-12 acceptances/year.
- Transformer Explainer won Best Submission 2025; The Illustrated AlphaFold
  (indie two-person team) won 2024 — indie teams appear every year.
- No DOI/proceedings from the workshop itself → pair with arXiv (below).
- Timing: Oct–Nov 2026 launch (pulled forward 08-21) → ~9 months of usage stats → submit Aug 2027.

**Citable object: arXiv preprint** (at/after the Oct–Nov 2026 launch).
- Since 2026-01-21 EVERYONE needs an endorsement (institutional email no
  longer waives it) — solo-gmail is no longer a special disadvantage.
- Endorser = arXiv author with ~3 recent papers in the domain; standard play:
  ask authors of works we cite (Poloclub, PAIR lineage), with the live site
  and draft PDF in hand. Start the submission to generate the endorsement
  code, then use "Which of these authors are endorsers?" on related papers.
- Category: **cs.CY primary** (its scope text explicitly names "computers
  and education"), cross-list cs.HC. cs.CL only if the contribution is
  framed as NLP methods.
- Google Scholar indexes arXiv reliably; Zenodo is officially NOT indexed
  by Scholar → Zenodo DOI is the archival artifact reference, arXiv is the
  Scholar-visible citation target. CITATION.cff `preferred-citation` should
  point at arXiv once live.

**Proceedings DOI: AAAI-28 Demonstrations** (expect deadline ~Sept 2027).
- The exact Transformer Explainer route: 3-page demo paper in AAAI
  proceedings, DOI 10.1609/... Real publication credit.
- AAAI-27's deadline is Sept 18, 2026 (EAAI-27: Sept 8, 2026) — see
  "deliberately skipped" below.

**Opportunistic: ACL 2027 System Demonstrations** (deadline likely
~Feb 2027; ACL 2026's was Feb 27). Explicitly welcomes "tools supporting
learning or education", favors open-source, single-blind, needs 6-page
paper + 2.5-min screencast + live URL. Decide when the CFP posts.

**Later: JOSE** (Journal of Open Source Education) — diamond OA, Crossref
DOI, ~1000-word paper.md, public GitHub review, no affiliation requirement.
Wants evidence of real teaching use → submit after course adoption exists.

## Why AAAI-27 / EAAI-27 (Sept 2026 deadlines) are deliberately skipped

1. **No runway**: the launch itself, the remaining polish, and a
   submission-quality draft all land in Q4 2026; three weeks to the Sept
   deadlines is not enough for any of them.
2. **The 2027 venues fit better**: VISxAI wants the explainable itself plus
   real usage evidence, and AAAI-28 / ACL demos land after the Oct–Nov 2026
   launch has produced months of deployment numbers.

## Minimum viable companion paper (the Transformer Explainer model: 3 pages)

Sections, per the published AAAI demo paper's anatomy:
1. **Intro** (~800 words) with exactly two crisp contributions. Draft:
   - C1: a pure-TypeScript, dependency-free GPT-Neo forward pass running
     fp16 weights in-browser, **verified token-exact against the reference
     implementation** — vs. the ONNX-runtime black box other explainers
     embed. The reader inspects a real model, not a reenactment.
   - C2: the reader's OWN sentence as the pedagogical spine: live
     tokenization, embedding neighborhoods, attention with **automatic
     feature-head discovery computed from the user's input** (never
     canned), and per-token sampling — in plain language, bilingual EN/中文.
2. **System Design** (~600 words): two named design principles + one usage
   scenario + implementation-stack sentence.
3. **Ongoing Work** (~150 words).
4. One full-width interface figure. Deployment numbers do the persuasion
   (Transformer Explainer used "125,000 users" with no user study at all).

Full-strength upgrade later (TVCG/CHI model): design goals, formative
research, 16-person observational study is enough for a TVCG-class paper —
defer, grow under the same arXiv ID.

## Timeline (working backward)

| When | Action |
|---|---|
| Now → 2026 Q4 | Clear the remaining pre-launch gates; finish S3b (中文/polish/80MB path test). |
| 2026 Q4 | Author (Shangyan) drafts the 3-page paper skeleton; instrument privacy-respecting usage counting for deployment stats. |
| **2026 Oct–Nov (pulled forward 08-21)** | Launch. Same week: Zenodo DOI (GitHub release toggle), update CITATION.cff (doi, url), create Google Scholar profile, begin arXiv endorsement hunt. |
| ~Feb 2027 | ACL 2027 demos — decide when CFP posts (location/travel permitting). |
| May 2027 | VISxAI 2027 CFP posts — prep submission. |
| ~Early Aug 2027 | **Submit explainable to VISxAI 2027** with launch usage stats. |
| ~Sept 2027 | AAAI-28 demo paper (proceedings DOI). |
| Ongoing | Push course adoption (email instructors, CS224n-listing playbook) → JOSE when teaching evidence exists. |
