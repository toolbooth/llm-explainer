# Accessibility statement

*Inside the Machine: Classroom Edition · shared front matter · draft 2026-08-22; revised 2026-08-23 after the phase-4 accessibility pass. This statement is updated per release; the "Known gaps" section is filled in after each audit.*

## Our target

We aim for **WCAG 2.1 Level AA** conformance across every page and widget in the Classroom Edition. This is the standard ADA Title II requires of public K–12 schools and community colleges for web content, including course content placed in a learning management system, with compliance deadlines of April 26, 2027 for entities serving 50,000 or more people and April 26, 2028 for smaller entities as extended by DOJ [PRODUCT.md §6.3; ada.gov/resources/web-rule-first-steps; jacksonlewis.com on the DOJ extension — confirm current dates before citing]. A resource that fails this standard is not adoptable by a public school after those dates, so we treat it as a requirement, not a preference.

**Conformance status as of 2026-08-23: partially conformant, on the strength of an automated audit and a keyboard walk; not yet tested with assistive technology.** What was done: (1) an automated WCAG 2.1 A/AA audit with axe-core 4.13.0 (`npm run audit:a11y`) over every classroom page — the index, both lesson pages as loaded and again after every hint, chip, roll, step and table had been driven, one step deep link per module, both guides, both printables, the slides and the seven front-matter pages — in English and 中文, at 1280 px and 375 px; it found 24 serious-or-critical findings (128 nodes: unnamed text fields and sliders, two light-theme contrast failures, scrolling boxes a keyboard could not reach) and ends at **zero**. (2) A keyboard walk with real key events through every control of the five widgets (the record is in REVIEW-CLASSROOM-4.md). What was **not** done: testing with ChromeVox, VoiceOver or NVDA — an automated tool checks names, roles, contrast and structure; it cannot tell you what a screen reader actually says, and we do not claim to know until someone has listened. That row is the first entry under Known gaps.

## What we design for

**Keyboard.** Every widget is operable without a mouse; every page opens with a "Skip to the lesson" link, and every control shows a 3 px focus ring in the light theme (verified 2026-08-23 with real key events, not by inspection):

- In the Chopper and the Tokenizer X-ray the pieces are not tab stops — nothing can be done to a piece, so there is nothing to operate — but they form a named list that reads as "piece 2: ‘raw’, id 1831", the letters row reads as one phrase ("strawberry: 10 letters, r at positions 3, 8, 9"), the preset chips expose their pressed state, and the count line and the insight line are polite live regions.
- In the Gamble, the text field is named, the temperature slider responds to arrow keys and announces "T = 1.10"; the bars are a named list ("‘the’: 41.2%"); Roll is a button and the word it rolled is a polite live region.
- In TheLoop, Write, Step and Reset are buttons (a run is at most 30 tokens; there is no pause control). Every written word is itself a button named with its text and probability ("‘ sat’, 61%"); Enter or Space opens the alternatives popover that hover opens for a mouse, Escape closes it; a polite live region reports "12 words written; last ‘ sat’ at 61%"; and a step log (below) carries every number as text.
- In Hundred Rolls (M2's new widget), the trigger is a button, the slider is named and announces its value, the summary is a polite live region, and the histogram has a table alternative.
- In AttentionRoom (M3, planned), arrow keys move across the heatmap cells and the layer slider and head picker are standard form controls.

**Text alternatives for every visualization** [PRODUCT.md §6.3]:

- Probability bars → a named list ("‘the’: 41.2%"); the bar tracks themselves are hidden from assistive technology as decoration. Built.
- The autoregressive animation → a step log behind a "Show the step log" disclosure: one row per written word with its probability and the alternatives the model weighed. Built 2026-08-23.
- The Hundred Rolls histogram → a table (word, model probability, expected count, rolls, share) behind a "Show as a table" disclosure; built, not sortable.
- The attention heatmap → a sortable text table ("token X attends most to token Y, 0.61") — planned with M3.

**Not by colour alone.** Confidence colouring in TheLoop carries a numeric label; discovered attention-head types carry a text label, not just a hue.

**Contrast.** Target ratio ≥ 4.5:1 for text in both light and dark themes. The classroom pages use a light palette whose ratios were computed before it was chosen (build phase 2: body text 17:1, muted text 8.6:1, dim text 5.9:1, links 8.3:1 on the page); the essays stay dark. Verified computed on 2026-08-23 over every text node of the two lesson pages and the crosswalk: the audit found two failures — the act number's dark ink on the accent pill (2.3:1) and the 75 %-opacity token ids (below 4.5:1 on the orange tint) — now 8.3:1 and 8.0:1; the lowest ratio left is the highlighted letter in the X-ray at 4.7:1. Text inside a *disabled* control (e.g. "Reset rolls" before the first roll, 2.4:1) is exempt under 1.4.3 and is the only text below 4.5:1 on any classroom page.

**Motion.** The page respects `prefers-reduced-motion` (verified 2026-08-23 with the preference emulated). Built: Hundred Rolls lands its hundred rolls at once instead of animating them; TheLoop's Write lands its run at once — all 30 words within 120 ms, no blinking cursor, no per-word pacing (4.3 s with the pacing on) — while Step still writes one word per press; the jump links scroll without smooth-scrolling. No content auto-plays.

**Screen readers.** Target test matrix: ChromeVox (ChromeOS), VoiceOver (macOS / iPadOS), NVDA (Windows) — **none of the three has been run yet** (Known gaps, first row). Widget state changes are wired to polite live regions; the wording a screen reader actually produces has not been listened to.

**Text-to-speech.** Target, not yet built (see Known gaps): prompts read aloud via the browser's built-in `speechSynthesis`, with no external service contacted. This was an explicit request from community-college instructors [PRODUCT.md §3; arxiv.org/abs/2511.05363].

**Language.** The page declares its language (`lang="en"` or `lang="zh"`) and the two editions are peer documents, so assistive technology reads each in the right voice. Passages in the other language say so (WCAG 3.1.2): on the 中文 front-matter pages every paragraph, list item, quotation and table cell that is English — the policy quotations, the standards IDs, the letter kit's body — carries `lang="en"`; the English guides mark their 中文 glossary column and the 中文 scissors strip.

**Video.** The MVP ships no video; any future video will carry captions and a transcript.

**Print.** Every module has a print stylesheet and a printable PDF, and the unplugged activity is paper by design, so a student who cannot use the widget still has the lesson.

**Zoom and reflow.** Widgets are responsive and should reflow at 200 % zoom and on a 320-px-wide viewport without horizontal scrolling of the page.

## Known gaps

*Filled in 2026-08-23 from the phase-4 pass (MVP item 5). The three phase-1–2 build-note gaps that were here — the X-ray's letter-by-letter row, TheLoop's hover-only popover, TheLoop's missing reduced-motion mode — are closed and described above. What remains is what the pass could not do. Record each gap as: widget · WCAG success criterion · description · workaround · target release.*

| Widget | Criterion | Gap | Workaround | Target |
|---|---|---|---|---|
| Every page and widget | 4.1.2 Name, Role, Value; 4.1.3 Status Messages (as experienced) | Not yet tested with ChromeVox, VoiceOver or NVDA. The names, roles, live regions and the keyboard paths are verified by axe-core and by real key events; what a screen reader says, and whether the live regions are too chatty or too quiet, has not been heard. | None needed for sighted keyboard users; screen-reader users should expect rough edges in wording, not missing controls | before the teacher pilot (author-dependent) |
| Every lesson page | — (instructor request, not a WCAG criterion) | No text-to-speech of the prompts | The browser's or OS's own read-aloud (ChromeVox, VoiceOver, Edge Read aloud) | after the MVP |
| TheLoop (M2) | 1.3.1 Info and Relationships | The alternatives popover opens from the keyboard, but it sits inside the word's button, so a screen reader hears the word's name and probability rather than the eight alternatives | The step log table under the widget lists every alternative with its percentage | none planned — the step log is the designed path |
| Every page | 1.4.10 Reflow | Reflow was checked at 375 px (no page scrolls sideways; wide tables scroll inside a focusable box); 320 px and 200 % zoom were not measured | Wide tables and the embed code already scroll inside their own box | Chromebook / iPad device test (hardware-dependent) |

Anticipated, from the design rather than from testing: the attention heatmap (M3, not in the MVP) is the hardest case and its keyboard path and text table are not yet built [PRODUCT.md §10.2 follow-on].

## Compatibility

Intended to work with current versions of Chrome (including ChromeOS), Edge, Safari (macOS and iPadOS) and Firefox, with touch and keyboard. See the Tech check for which of these have been verified and which remain targets.

## Feedback and contact

If you encounter a barrier, or a gap not listed above, please tell us; a report with the widget name, the assistive technology and browser you used, and what happened is enough.

- Email: `shenshangyan2001@gmail.com` (the author, as listed in CITATION.cff)
- Issue tracker: `https://github.com/toolbooth/llm-explainer/issues` (GitHub Issues; no account needed to read, a GitHub account to post)

We aim to acknowledge reports within two weeks. This is a solo, volunteer-maintained project; fixes are prioritized by how many learners a barrier affects.

## Formal complaints

Students and staff at public institutions may also use their institution's ADA / Section 504 grievance procedure; the institution may forward the issue to us using the contact above.
