# Accessibility statement

*Inside the Machine: Classroom Edition · shared front matter · draft 2026-08-22. This statement is updated per release; the "Known gaps" section is filled in after each audit.*

## Our target

We aim for **WCAG 2.1 Level AA** conformance across every page and widget in the Classroom Edition. This is the standard ADA Title II requires of public K–12 schools and community colleges for web content, including course content placed in a learning management system, with compliance deadlines of April 26, 2027 for entities serving 50,000 or more people and April 26, 2028 for smaller entities as extended by DOJ [PRODUCT.md §6.3; ada.gov/resources/web-rule-first-steps; jacksonlewis.com on the DOJ extension — confirm current dates before citing]. A resource that fails this standard is not adoptable by a public school after those dates, so we treat it as a requirement, not a preference.

**Conformance status as of this draft: not yet audited.** The flagship widgets were built with keyboard operation and text alternatives in mind, but no formal WCAG 2.1 AA evaluation has been completed. The first audit is the MVP's accessibility pass on the four reused widgets plus Hundred Rolls (PRODUCT.md §10.1 item 5, "phase 4"). This statement will be revised with its findings.

## What we design for

**Keyboard.** Every widget is intended to be fully operable without a mouse:

- Tab moves through tokens in the Chopper and Tokenizer X-ray; each token is focusable and its id is readable.
- In the Gamble, the temperature slider responds to arrow keys and announces its value; the "roll" control is a button.
- In TheLoop, Run, Step and Reset are buttons (a run is at most 30 tokens; there is no pause control); the per-token confidence is exposed as text, not only as colour.
- In Hundred Rolls (M2's new widget), the trigger is a button and the histogram has a table alternative.
- In AttentionRoom (M3, planned), arrow keys move across the heatmap cells and the layer slider and head picker are standard form controls.

**Text alternatives for every visualization** [PRODUCT.md §6.3]:

- Probability bars → a list ("the, 0.41; a, 0.22; ...").
- The autoregressive animation → a step log (token chosen, probability, alternatives).
- The Hundred Rolls histogram → a table (word, model probability, expected count, rolls, share) behind a "Show as a table" disclosure; built, not sortable.
- The attention heatmap → a sortable text table ("token X attends most to token Y, 0.61") — planned with M3.

**Not by colour alone.** Confidence colouring in TheLoop carries a numeric label; discovered attention-head types carry a text label, not just a hue.

**Contrast.** Target ratio ≥ 4.5:1 for text in both light and dark themes. The classroom pages use a light palette whose ratios were computed before it was chosen (build phase 2: body text 17:1, muted text 8.6:1, dim text 5.9:1, links 8.3:1 on the page); the essays stay dark.

**Motion.** The page respects `prefers-reduced-motion`. Built: Hundred Rolls lands its hundred rolls at once instead of animating them. Target, not yet built: TheLoop's animation becoming a step-by-step mode. No content auto-plays.

**Screen readers.** Target test matrix: ChromeVox (ChromeOS), VoiceOver (macOS / iPadOS), NVDA (Windows). Widget state changes are announced via live regions.

**Text-to-speech.** Target, not yet built (see Known gaps): prompts read aloud via the browser's built-in `speechSynthesis`, with no external service contacted. This was an explicit request from community-college instructors [PRODUCT.md §3; arxiv.org/abs/2511.05363].

**Language.** The page declares its language (`lang="en"` or `lang="zh"`) and the two editions are peer documents, so assistive technology reads each in the right voice.

**Video.** The MVP ships no video; any future video will carry captions and a transcript.

**Print.** Every module has a print stylesheet and a printable PDF, and the unplugged activity is paper by design, so a student who cannot use the widget still has the lesson.

**Zoom and reflow.** Widgets are responsive and should reflow at 200 % zoom and on a 320-px-wide viewport without horizontal scrolling of the page.

## Known gaps

*To be completed after the phase-4 accessibility audit (MVP item 5). Until then the honest statement is: unaudited. The rows below come from the build notes of phases 1–2 (the Module 1 and 2 guides' accessibility sections), not from testing with assistive technology. Record each gap as: widget · WCAG success criterion · description · workaround · target release.*

| Widget | Criterion | Gap | Workaround | Target |
|---|---|---|---|---|
| Every lesson page | — (instructor request, not a WCAG criterion) | No text-to-speech of the prompts | The browser's or OS's own read-aloud (ChromeVox, VoiceOver, Edge Read aloud) | phase 4 |
| Tokenizer X-ray (M1) | 1.3.1 Info and Relationships | The "you see" row reads to a screen reader as single letters | The piece list under it reads as words with their numbers | phase 4 audit |
| TheLoop (M2) | 2.1.1 Keyboard | The per-token hover popover has no keyboard equivalent | The step log carries the same numbers as text | phase 4 audit |
| TheLoop (M2) | 2.2.2 Pause, Stop, Hide | No reduced-motion step mode and no pause (a run is user-started and at most 30 tokens) | Step runs one token at a time | phase 4 |
| `[audit findings pending]` | | | | |

Anticipated, from the design rather than from testing: the attention heatmap (M3, not in the MVP) is the hardest case and its keyboard path and text table are not yet built [PRODUCT.md §10.2 follow-on]; screen-reader testing with ChromeVox on a managed Chromebook has not been done; the slider's announced value format has not been checked against NVDA.

## Compatibility

Intended to work with current versions of Chrome (including ChromeOS), Edge, Safari (macOS and iPadOS) and Firefox, with touch and keyboard. See the Tech check for which of these have been verified and which remain targets.

## Feedback and contact

If you encounter a barrier, or a gap not listed above, please tell us; a report with the widget name, the assistive technology and browser you used, and what happened is enough.

- Email: `shenshangyan2001@gmail.com` (the author, as listed in CITATION.cff)
- Issue tracker: `[classroom repository URL — TBD]` (GitHub Issues; no account needed to read, a GitHub account to post)

We aim to acknowledge reports within two weeks. This is a solo, volunteer-maintained project; fixes are prioritized by how many learners a barrier affects.

## Formal complaints

Students and staff at public institutions may also use their institution's ADA / Section 504 grievance procedure; the institution may forward the issue to us using the contact above.
