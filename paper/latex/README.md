# LaTeX skeleton — Inside the Machine

AAAI-style 2-column paper skeleton converted from the prose drafts in
`paper/01-intro.md` and `paper/02-system-and-ongoing.md`.

**Draft status:** every claim was drafted by Claude at the author's
direction (2026-08-19) and requires author sign-off at the scheduled
post-completion deep-dive before any submission. All `[SIGN-OFF]`,
`[FILL AT LAUNCH]`, and `[VERIFY]` markers from the markdown drafts are
preserved as visible colored todo notes.

## Files

| File | Purpose |
|---|---|
| `main.tex` | The paper. AAAI author-kit conventions throughout. |
| `references.bib` | Five verified entries (Alammar 2018; Cho et al. AAAI 2025; Wang et al. TVCG 2021; Bycroft; Rush 2018). |
| `aaai-fallback.sty` | Stand-in style used only when the official kit is absent. Approximates AAAI 2-column geometry. **Not valid for submission.** |
| `figures/` | Empty; `fig:interface` renders a framed placeholder until a screenshot lands here. |

## Dropping in the official AAAI author kit

The official `aaai26.sty` was not available offline, so `main.tex`
auto-detects it:

```latex
\IfFileExists{aaai26.sty}{\aaaikitpresenttrue}{\aaaikitpresentfalse}
```

- **Zero-line change:** copy the official `aaai26.sty` (and `aaai26.bst`)
  from the AAAI author kit into this directory and recompile. The kit
  path activates automatically: `\documentclass[letterpaper]{article}` +
  `\usepackage[submission]{aaai26}` + `\bibliographystyle{aaai26}`.
- **One-line change for a different kit year:** if the target kit is,
  say, `aaai27.sty`, edit the single marked `\IfFileExists` line near the
  top of `main.tex` (marked `<- ONE-LINE CHANGE`) and the two `aaai26`
  mentions it guards (`\usepackage[submission]{aaai26}` and
  `\bibliographystyle{aaai26}`), or simply rename the kit files to
  `aaai26.sty` / `aaai26.bst`.
- Camera-ready: drop the `[submission]` option.

Without the kit, `aaai-fallback.sty` provides letterpaper two-column
layout (0.75in margins, 0.25in column gap, unnumbered sections) and
emulates the kit's `\affiliations` command so the same `main.tex` body
compiles unchanged in both modes.

## Building

```sh
# tectonic (single command, fetches packages on demand):
tectonic main.tex

# or classic TeX Live:
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

**Compile status:** NOT yet verified — no LaTeX toolchain (tectonic,
pdflatex, xelatex, lualatex) exists on the authoring machine as of
2026-08-19 and nothing was installed. The structure was validated by
review plus a mechanical brace/environment/citation-key check. First
real compile should be smooth but expect at most trivial fixes.

## Todo-marker system

Draft-only commands defined in `main.tex` (they use `xcolor`, which is
not part of the kit):

- `\signoff{...}` — red; claims needing author sign-off
- `\fillatlaunch{...}` — blue; numbers/figures that arrive at Q1 2027 launch
- `\verifynote{...}` — orange; facts to re-verify before use

Set `\showtodosfalse` in the preamble for a clean read-through build.
Delete the whole block (and `xcolor`) before submission.

## Structural decisions

- Kit auto-detection via `\IfFileExists` before `\documentclass`, so the
  fallback can select the `twocolumn` class option while the kit path
  keeps the kit-mandated plain `article` (the kit handles columns itself).
- The kit-required package block (`times`, `helvet`, `courier`, `url`,
  `graphicx`, `natbib`, `caption`, `\frenchspacing`, `\pdfpagewidth`) is
  loaded unconditionally, matching AAAI template order; engine-specific
  primitives are guarded with `\ifdefined` so tectonic/xelatex also work.
- `\bibliographystyle` switches with the kit: `aaai26` when present,
  `plainnat` otherwise (both consume the same natbib `\citep` calls).
- CJK: the drafts say "fully bilingual (English / 中文)". pdflatex cannot
  typeset CJK glyphs without extra packages the kit disallows, so the
  body says "(English/Chinese)" with the original phrasing preserved in
  an adjacent comment.
- The abstract did not exist in the drafts; it was assembled from
  Section 1 language and carries its own `\signoff` marker. Same for the
  one added sentence wiring the Rush 2018 and Wang et al. citations
  (neither appeared in the draft prose, only in its wire-list), and for
  the `fig:interface` caption draft.
- Cho et al. entry verified against the DOI landing page on 2026-08-19
  (AAAI vol. 39 no. 28, pp. 29625–29627). CNN Explainer is cited with
  its journal record (TVCG vol. 27 no. 2, 2021; presented at VIS 2020).
