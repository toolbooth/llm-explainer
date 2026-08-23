# Policy citations — quotable hooks for grant narratives, board questions and unblock requests

*Inside the Machine: Classroom Edition · shared front matter · draft 2026-08-22.*

**Purpose.** A teacher or district coordinator who needs to justify this resource in a policy memo, a grant narrative or an allowlist request should be able to copy a line from here and cite it. Every quotation below is given as verbatim from the primary document named, with the date on which it was verified. Each hook is followed by a one-paragraph alignment statement that is factual about what this resource does; it makes no claim about outcomes.

**Verification legend.** *Brief, Aug 2026* = verified verbatim in the policy research brief that PRODUCT.md §2 reproduces (brief dated on or before 2026-08-22). *Re-verified 2026-08-22* = additionally checked by this draft against the named primary source on that date. *Secondary* = PRODUCT.md cites a news or tracker source, not the primary text; retrieve the primary before quoting in a formal document.

---

## Federal

### Executive Order 14277, "Advancing Artificial Intelligence Education for American Youth" (April 23, 2025; 90 FR 17519)

Source: govinfo.gov/content/pkg/FR-2025-04-28/pdf/2025-07368.pdf; whitehouse.gov/presidential-actions/2025/04/advancing-artificial-intelligence-education-for-american-youth/

- **Sec. 1, opening sentence** — "Artificial intelligence (AI) is rapidly transforming the modern world, driving innovation across industries, enhancing productivity, and reshaping the way we live and work." *(Re-verified 2026-08-22, whitehouse.gov. Note: PRODUCT.md §2 does not quote Sec. 1; only this opening sentence has been verified by this draft. Retrieve the full section before quoting more.)*
- **Sec. 2** — "It is the policy of the United States to promote AI literacy and proficiency among Americans by promoting the appropriate integration of AI into education, providing comprehensive AI training for educators, and fostering early exposure to AI concepts and technology to develop an AI-ready workforce and the next generation of American AI innovators." *(Brief, Aug 2026; re-verified 2026-08-22.)*
- **Sec. 6** — calls for "online resources focused on teaching K–12 students foundational AI literacy and critical thinking skills." *(Brief, Aug 2026. This draft's 2026-08-22 re-check of the whitehouse.gov text returned a different Sec. 6 sentence; confirm the exact wording against the govinfo PDF before formal use.)*
- **Sec. 7** — "professional development for all educators, so they can integrate the fundamentals of AI into all subject areas." *(Brief, Aug 2026; same caveat as Sec. 6.)*

**How this resource aligns.** It is an online resource whose subject is the foundational mechanism of a language model — tokenization, probability, attention, sampling, training data — taught to grades 9–14 in 45-minute lessons, and each lesson ends with the student evaluating the model's output, which is the critical-thinking half of Sec. 6's phrase. The teacher guide is written so that a teacher with no CS colleague can deliver it without professional development; it does not itself provide PD and does not claim to satisfy Sec. 7.

### America's AI Action Plan (July 23, 2025)

Source: whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf

- **Pillar I** — "prioritize AI skill development as a core objective of relevant education and workforce funding streams ... including career and technical education (CTE), workforce training, apprenticeships." *(Brief, Aug 2026.)*
- **"Encourage Open-Source and Open-Weight AI"** — "many businesses and governments have sensitive data that they cannot send to closed model vendors... the Federal government should create a supportive environment for open models." *(Brief, Aug 2026.)*

**How this resource aligns.** The model is open-weight (TinyStories-1M, a public research checkpoint) and the inference code is open source; the weights are downloaded to the device and nothing a student types is sent anywhere. A classroom is an environment with sensitive data, and this is the one federal text that names sensitive data as a reason to prefer open models. The resource is tagged by DOL TEN 07-25 content area so CTE instructors can cite it; it is free, so no funding stream is required to adopt it.

### U.S. Department of Education, Dear Colleague Letter, "Guidance on the Use of Federal Grant Funds to Improve Education Outcomes Using Artificial Intelligence" (July 22, 2025)

Source: ed.gov/media/document/opepd-ai-dear-colleague-letter-7222025-110427.pdf. *(All quotations: Brief, Aug 2026.)*

| ED principle (verbatim) | What this resource does |
|---|---|
| "Educator-led: AI should support teachers, providers, tutors, advisors, and education leaders." | The teacher guide drives the lesson; the widget is a demonstration instrument, not a tutor. |
| "Ethical: ... educators should help students navigate AI to be able to evaluate the validity of AI outputs ... to learn with – rather than exclusively from – AI" | Every module ends with students judging the model's output against their own knowledge. |
| "Accessible: AI tools or systems should be accessible for those who require digital accessibility accommodations" | WCAG 2.1 AA target; see the Accessibility statement for current conformance and known gaps. |
| "Transparent and explainable: Stakeholders, especially parents, should understand how systems function" | The forward pass is ~150 lines of readable TypeScript, and explaining how the system functions is the resource's entire content. |
| "Data-protective: Systems must comply with federal privacy laws including the Family Educational Rights and Privacy Act." | No data leaves the browser; see the Privacy & safety one-pager for the FERPA position. |

Allowable-use language: funds may "Develop or procure AI-powered instructional tools that adapt to learner needs in real time" and "Train educators, providers, and families to use AI tools effectively and responsibly." *(Brief, Aug 2026.)*

**How this resource aligns.** The resource costs nothing, so "procure" does not arise; a district may spend professional-development time on adopting it. It does not adapt to learner needs in real time and should not be described as doing so.

### Secretary's Supplemental Priority, "Advancing Artificial Intelligence in Education" (final April 13, 2026, 91 FR 18774; effective May 13, 2026)

Source: govinfo.gov/content/pkg/FR-2026-04-13/pdf/2026-07087.pdf. *(All quotations: Brief, Aug 2026.)*

- **Priority (a)(i)** — "Support the integration of AI literacy skills and concepts into teaching and learning practices to improve educational outcomes for students, including how to detect AI-generated disinformation or misinformation online."
- **Priority (a)(xi)** — "Provide support and training to educators on age-appropriate AI education methodologies that emphasize foundational concepts in AI literacy and critical thinking skills while considering developmental readiness and students' safety factors in AI tool selections in K–12 education."
- **Definition** — "Artificial intelligence (AI) literacy means the technical knowledge, durable skills, civic awareness and future ready attitudes, including AI related ethical reasoning, critical social inquiry, interdisciplinary problem-solving, and creativity, required to thrive in a world influenced by AI. It enables learners to engage, create with, manage, and design AI, while critically evaluating its benefits, risks, and implications."
- **On evaluation** — "AI adoption should not be evaluated solely by efficiency or automation metrics, but by its demonstrated impact on student engagement, learning progress, and readiness for future opportunities."

**How this resource aligns.** Module 4 (*Why It Lies*) teaches why a language model produces confident false statements, which is the mechanism behind (a)(i)'s "AI-generated disinformation or misinformation." The resource's design properties — no account, no network traffic after load, a model trained only on synthetic children's stories — are the kind of "safety factors in AI tool selections" that (a)(xi) asks educators to consider; they are documented in the Privacy & safety one-pager so that a district can consider them. Read honestly: ED declined to name free, open-source or privacy-preserving tools as a federal priority and said safety is "optimally decided at the state and local level" [PRODUCT.md §2.1]. These are principles, not mandates; the mandates are in the state section.

### U.S. Department of Labor, TEN 07-25, "Artificial Intelligence Literacy Framework" (February 13, 2026)

Source: dol.gov/newsroom/releases/eta/eta20260213. *(Brief, Aug 2026.)*

Five content areas: *Understanding AI Principles; Exploring AI Uses; Directing AI Effectively; Evaluating AI Outputs; Using AI Responsibly*. Seven delivery principles including *Enable Experiential Learning* and *Embed Learning in Context*.

**How this resource aligns.** Modules are tagged by content area (M1–M3 Understanding AI Principles; M4–M5 Evaluating AI Outputs; M6 Using AI Responsibly) so a community-college CTE instructor can cite the framework. Each module's guided exploration runs on the student's own sentence, which is experiential learning in the framework's sense. The resource does not cover *Directing AI Effectively* or *Exploring AI Uses* and does not claim to.

### National Science Foundation

PRODUCT.md §2.1 (r2) records three NSF actions implementing EO 14277 — the NSF STEM K-12 solicitation (NSF 25-545), the Dear Colleague Letter "Expanding K-12 Resources for AI Education" (supplements of up to $300,000 for existing awardees), and the March 19, 2026 award of $11 M to CSTA for "Artificial Intelligence Professional Development Weeks" — **every one from a secondary source**, and it states that this resource, which takes no funding, has no NSF alignment claim to make ("do not write 'NSF-aligned'"). Do not cite NSF in connection with this resource until the solicitation page or award abstract has been retrieved and its text verified. `[placeholder — remove or fill before publication]`

---

## State

Each item: the quotation or provision, then one alignment sentence.

- **California — Ed Code §33548 (AB 2876)** [leginfo.legislature.ca.gov, AB 2876; *Brief, Aug 2026*]: AI literacy is "knowledge, skills, and attitudes related to how AI works—its principles, concepts, and applications—as well as its limitations, implications, and ethical considerations." **CDE 2025 guidance** [cde.ca.gov/ci/pl/aiincalifornia.asp]: "AI should enhance, not replace, the educator's role" and "Personally identifiable information (PII) should only ever be entered into closed AI systems since open AI systems do not contain the protections required." **CDE model policy (June 25, 2026)** [cde.ca.gov/ci/pl/aipolicy.asp] names "privacy by design," "parent and guardian review rights," and "AI literacy as a core academic competency." *Alignment:* the resource's subject is literally "how AI works — its principles," and M4–M6 are its "limitations, implications, and ethical considerations"; nothing typed into the page is entered into any AI system, open or closed, so the PII rule cannot be breached; the teacher runs the lesson and the widget demonstrates.
- **Ohio — HB 96 / ORC 3301.24** [education.ohio.gov/Topics/AI-in-Ohio-s-Education/Model-Policy; *Brief, Aug 2026*]: every district must adopt an AI policy by July 1, 2026; the ODEW model policy covers "PII limits in third-party AI tools" and an "outlined process for evaluating AI tools from third party vendors." *Alignment:* the vendor receives nothing, so the evaluation form's data questions are all answered "none"; the Privacy & safety one-pager is written to be pasted into that process.
- **Idaho — SB 1227** (effective July 1, 2026) [*Secondary:* ktvb.com; *Brief, Aug 2026*]: statewide "generative AI literacy standards" by grade band, data-privacy requirements, and a prohibition on AI replacing teachers. *Alignment:* the resource is teacher-led and collects no data; its standards mapping will be extended to Idaho's grade-band codes when they are published.
- **Utah — HB 273 (2026)** [le.utah.gov/Session/2026/bills/static/HB0273.html; *Brief, Aug 2026*]: CS standards expanded to include "AI awareness and ethical interaction; AI's role in information filtering and decision-making... critical evaluation of digital sources." *Alignment:* M4 (*Why It Lies*) and M5 (*Why It Can't Count*) are lessons in critical evaluation of machine-generated text.
- **Oklahoma — SB 1734 (2026)** [*no source URL given in PRODUCT.md; retrieve before citing*]: annual parent disclosure of AI tools and student data; opt-out without penalty. *Alignment:* the disclosure for this resource is one sentence — it collects no student data — and opting out costs nothing because the unplugged version of every lesson exists on paper.
- **Alabama — HB 329 (2026); Georgia — SB 179; Mississippi — SB 2294** [*Secondary:* future-ed.org/legislative-tracker-2026-state-ai-in-education-bills; *Brief, Aug 2026*]: a CS course "that includes AI instruction" required for graduation (Alabama: class of 2032). *Alignment:* each module is one to three class periods of AI instruction sized to drop into an existing CS course.
- **Texas** [*Secondary:* winssolutions.org/texas-ai-education-task-force; *Brief, Aug 2026*]: no TEA guidance as of Aug 2026; the TACC/UT Austin task force (June 17, 2026) recommends "a phased approach to updating the Texas Essential Knowledge and Skills (TEKS)" for AI literacy. *Alignment:* a ready resource for teachers who have a recommendation but no materials; the mapping will be extended when TEKS are updated.
- **New York** [nysenate.gov/legislation/bills/2025/A9190; schools.nyc.gov AI guidance; *Brief, Aug 2026*]: no NYSED guidance; A9190 (pending) would ban classroom AI before ninth grade except for specific uses; NYC's "Traffic Light Framework" bans AI in discipline, placement and grading. *Alignment and caveat:* the resource is for grades 9 and up and performs no grading, placement or decision function; it is **not** offered to New York middle schools while A9190 is pending.

**Aggregate context** [*Brief, Aug 2026*]: 35 states and Puerto Rico have official K-12 AI guidance as of Aug 21, 2026 [aiforeducation.io/ai-resources/state-ai-guidance]; "82% of teachers have not received formal guidance" (Gallup/Walton, May 2026) [edweek.org/technology/teachers-say-lack-of-ai-guidance-is-a-major-problem/2026/05].

---

## Two sentences for a grant narrative

> *Inside the Machine: Classroom Edition* is a free, no-account, open-source set of 45-minute lessons in which a small open-weight language model runs inside the student's own browser, so that students can inspect how a language model tokenizes, weighs and samples text and then evaluate its output — the "foundational AI literacy and critical thinking" named in EO 14277 and the "detect AI-generated disinformation or misinformation" skill named in ED's 2026 supplemental priority (a)(i). No student data is collected, so it is structurally consistent with FERPA, COPPA and state PII rules, and each module is mapped to CSTA 2026, AP CSP, AI4K12 and ISTE standards with a dated verification record.
