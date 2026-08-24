# Inside the Machine — Classroom Edition

*Product design document. Drafted 2026-08-22; revised 2026-08-22 (r2) to reconcile it against the shared front-matter drafts and the policy research journal — see the Revision log at the end. Status: proposal, not yet approved for build.*

**One line:** a set of 45-minute, no-login, Chromebook-first lessons in which a real language model runs in the browser on each student's own sentence, packaged with a teacher guide and a standards crosswalk — free forever, no accounts, no backend, no data collection, no revenue.

**What already exists (the assets this document assumes):**

- *Inside the Machine* — bilingual (EN/中文) interactive essay series, four essays (the seven-act flagship; *Why It Lies*; *The Attention-Head Field Guide*; *Why It Can't Count*).
- Widgets: **Chopper** (tokenizer playground), **WordMap** (embedding neighbors), **AttentionRoom** (attention heatmap with automatic feature-head discovery), **Gamble** (next-token probability bars with temperature slider), **TheLoop** (autoregressive loop with per-token confidence), **Re-roll agreement** (essay 2), **Head scanner** (essay 3), **Tokenizer X-ray** (essay 4).
- **nano-lm** — zero-dependency TypeScript GPT-Neo forward pass, TinyStories-1M checkpoint (~1 M *non-embedding* parameters; the fp16 file holds ~3.75 M values including the 50,257 × 64 token-embedding table — 7,502,858 bytes ≈ 7.5 MB), self-hosted as a static file, ~10 ms per forward pass on the main thread (author's development machine), verified token-exact against Hugging Face `transformers`. Note: the flagship essay currently loads its GPT-2 tokenizer files (~2 MB) from huggingface.co via transformers.js; the classroom build self-hosts them (§6.2, phase 2).
- i18n store with EN/中文 peer versions; CITATION.cff; a parity-test pattern for content tables.

**Non-negotiable constraints (author's):** free forever; no accounts; no backend; no revenue (no ads, donations, or sponsors); no data collection of any kind. These are not marketing claims; they are the reason the product can exist as a solo project and, as §2 shows, they happen to be the exact properties school policy language now asks for.

---

## 1. Positioning

### 1.1 The gap

The competitive scan found that no existing offering combines all of the following (source: competitive landscape brief, Aug 2026):

| Property | Who has it | Who doesn't |
|---|---|---|
| A real model running in-browser on the **student's own sentence** | Transformer Explainer (GPT-2, 124M; 563k+ users) [poloclub.github.io/transformer-explainer] ; possibly LLens | Code.org *How AI Works* (co-writes with a hosted chatbot), Day of AI (Teachable Machine, images only), Experience AI, CRAFT, Common Sense (no model at all); AnimatedLLM (precomputed traces, no free input) |
| **Lesson-sized modules + teacher guide** with the model embedded | none | Transformer Explainer has no lesson plan or teacher guide |
| **Zero accounts** | Transformer Explainer, Teachable Machine | Day of AI and aiEDU gate materials behind registration; Code.org's AI Chat Lab is 13+ with district authorization |
| **Bilingual EN/中文** designed together | none | AnimatedLLM (UI translation only), an unofficial Chinese fork of Transformer Explainer, LLMs Unplugged (paper-based) |
| **Chromebook-first** (runs on 4 GB RAM, no WebGPU) | unverified for every tool | Transformer Explainer's 124M-param GPT-2 via ONNX/WASM is the closest |
| **High-school-calibrated progression** (next word → tokens → probabilities/temperature → attention → training data) on one live model | none | Transformer Explainer presents the full QKV/softmax stack at university level |

The one-sentence positioning the brief suggests, and which this document adopts: **"Transformer Explainer's live model + Experience AI's lesson packaging + Day of AI's zero-cost ethos, minus the registration wall, and bilingual from day one."**

### 1.2 Why the existing essay series is the right base

- The series already runs the model on the reader's own input, which is the single hardest property to add to a curriculum after the fact. The CSTA/AI4K12 priorities workshop explicitly asked for tools to "explore and explain how computers understand the meaning of a prompt, generate text" and could only name Neuron Sandbox and TensorFlow Playground for high school [csteachers.org/.../AI-Priorities-for-All-K-12-Students-Report-from-CSTA-AI4K12.pdf].
- nano-lm's 7.5 MB weights and pure-TypeScript forward pass sidestep the WebGPU problem entirely: WebGPU on ChromeOS requires Vulkan (Chrome 113+) and WASM fallbacks are 3–15x slower [developer.chrome.com/blog/webgpu-release ; sitepoint.com/webgpu-vs-webasm-transformers-js]. We do not need either.
- The same priorities report proposes building "a small language model" from a children's book so students "understand conceptually how a large language model works – and why it sometimes delivers inaccurate output." TinyStories-1M *is* a small language model trained on children's stories. The product is the report's proposal, already built.

### 1.3 What this is not

- Not a chatbot. Students never "use AI" in the sense filters and district policies regulate; they *inspect* a model. This matters because ~40% of schools/districts don't allow student GenAI use [newsroom.collegeboard.org, May 2025] and 37% of teachers in Feb–Mar 2026 were "not at all"/"slightly" eager to integrate AI [edweek.org, May 2026]. A tool that teaches *about* AI serves skeptics and adopters alike.
- Not a semester course. CSTA's 2025 Landscape found 85% of CS teachers spend fewer than five hours per year on AI content [csteachers.org/the-2025-cs-teacher-landscape]. Everything here is sized for 1–3 class periods.
- Not a teacher-PD product. That layer is crowded (Google's 6M-educator training, ISTE+ASCD AI 101, Code.org). The thin layer is "show students the mechanism."
- Not a replacement for the flagship essays. The Classroom Edition is a second front door to the same engine and widgets, with different prose, pacing, and packaging.

### 1.4 Name

Working name: **Inside the Machine: Classroom Edition** (中文: 《机器内部·课堂版》). Keeps the citation identity of the flagship (CITATION.cff title "Inside the Machine: An Interactive Guide to How LLMs Actually Think") so academic and classroom adoption accrue to one object.

---

## 2. Policy alignment — exact quotable hooks

Federal quotations in this section are verbatim from the primary documents as verified in the policy research brief (the EO text, the ED Dear Colleague Letter PDF, the Federal Register final priority, the AI Action Plan PDF). State items are marked **[secondary]** where the brief relied on a news report or a legislative tracker rather than the bill text — retrieve the primary before quoting those in a formal document. The point of collecting it: a teacher or district coordinator who needs to justify the tool in a policy memo, a grant narrative, or an unblock request should be able to copy a line from here and cite it.

### 2.1 Federal

**Executive Order 14277, "Advancing Artificial Intelligence Education for American Youth," April 23, 2025 (90 FR 17519)** [govinfo.gov/content/pkg/FR-2025-04-28/pdf/2025-07368.pdf]

- Sec. 1 (Purpose), two non-contiguous verbatim excerpts: "Artificial intelligence (AI) is rapidly transforming the modern world, driving innovation across industries, enhancing productivity, and reshaping the way we live and work." … "To ensure the United States remains a global leader in this technological revolution, we must provide our Nation's youth with opportunities to cultivate the skills and understanding necessary to use and create the next generation of AI technology." (First sentence re-verified against whitehouse.gov 2026-08-22 by the front-matter draft; second verified in the policy research journal.)
- Sec. 2 (Policy): "It is the policy of the United States to promote AI literacy and proficiency among Americans by promoting the appropriate integration of AI into education, providing comprehensive AI training for educators, and fostering early exposure to AI concepts and technology to develop an AI-ready workforce and the next generation of American AI innovators." (Verified verbatim; unchanged from the first draft.)
- Sec. 6 (K–12 resources) directs agencies to establish "public-private partnerships with leading AI industry organizations, academic institutions, nonprofit entities, and other organizations with expertise in AI and computer science education to collaboratively develop online resources focused on teaching K–12 students foundational AI literacy and critical thinking skills," with resources "ready for use in K-12 instruction within 180 days." Sec. 6 also orders the Secretary of Education to issue guidance within 90 days on using "formula and discretionary grant funds to improve education outcomes using AI" — the July 22, 2025 Dear Colleague Letter below is that guidance. (The first draft quoted only the "online resources …" fragment and the front-matter re-check flagged a possible mismatch: the fragment is verbatim, but it is a clause inside the partnership directive, so quote it with that context.)
- Sec. 7 (Educator training): within 120 days the Secretary of Education must prioritize AI in discretionary teacher-training grants, including "professional development for all educators, so they can integrate the fundamentals of AI into all subject areas"; the NSF Director is to create "teacher training opportunities"; USDA is to use "4-H and the Cooperative Extension System." (Quoted fragment verified verbatim; unchanged.)

*How we use it:* the product is an "online resource focused on teaching K–12 students foundational AI literacy and critical thinking skills" in the most literal reading — the model's mechanism is the foundation, and the evaluation act that ends every module is the critical-thinking half. Honest caveat: Sec. 6 tasks federal agencies and their partners with *producing* such resources; it does not endorse or certify third-party ones. The hook is descriptive, not a designation.

**National Science Foundation actions implementing EO 14277** (from the policy research journal, Aug 2026; every item below is reported by a **[secondary]** source — retrieve the NSF solicitation page and award abstract before a formal citation)

- **September 2025:** NSF released three coordinated funding actions implementing EO 14277. Two are identified: the ~$30 M **NSF STEM K-12** program (solicitation **NSF 25-545**) and a Dear Colleague Letter, **"Expanding K-12 Resources for AI Education,"** allowing existing NSF awardees to request supplements of up to **$300,000** to scale AI-education resources [secondary: education.asu.edu/funding-calendar/expanding-k-12-resources-ai-education-dcl]. The third action is not identified in the journal.
- **March 19, 2026:** NSF awarded **$11 M to CSTA** for "Artificial Intelligence Professional Development Weeks: CS Foundations for Creating with AI" — nine states, roughly 2,500–3,000 teachers [secondary: govtech.com/education/k-12/nsf-awards-11m-to-expand-ai-training-for-k-12-teachers].
- **Standing roles:** the NSF Director sits on the White House Task Force on AI Education (EO 14277 Sec. 4) and is directed to create "teacher training opportunities" (Sec. 7); America's AI Action Plan says NAIRR should "connect an increasing number of researchers and educators across the country to critical AI resources."

*How we use it:* we are not an NSF applicant and take no funding, so there is no alignment claim to make — do not write "NSF-aligned." The relevance is indirect and concrete: the CSTA PD Weeks put ~2,500–3,000 teachers through "CS Foundations for Creating with AI" in nine states, which is exactly the population §3 targets and the CSTA channel in §7.2 reaches; and an existing NSF awardee (a university or nonprofit) could cite the supplement DCL to fund classroom piloting of an open resource such as this one.

**America's AI Action Plan, July 23, 2025** [whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf]

- Pillar I: "prioritize AI skill development as a core objective of relevant education and workforce funding streams ... including career and technical education (CTE), workforce training, apprenticeships."
- "Encourage Open-Source and Open-Weight AI": "many businesses and governments have sensitive data that they cannot send to closed model vendors... the Federal government should create a supportive environment for open models."

*How we use it:* this is the only federal text that praises open models for sensitive-data reasons. A classroom is a sensitive-data environment; our model is open-weight and never leaves the device.

**ED Dear Colleague Letter, July 22, 2025, "Guidance on the Use of Federal Grant Funds to Improve Education Outcomes Using Artificial Intelligence"** [ed.gov/media/document/opepd-ai-dear-colleague-letter-7222025-110427.pdf]

Five principles for responsible use, each of which maps to a design property:

| ED principle (verbatim) | Classroom Edition property |
|---|---|
| "Educator-led: AI should support teachers, providers, tutors, advisors, and education leaders." | Teacher guide drives the lesson; the widget is a demonstration instrument, not an autonomous tutor. |
| "Ethical: ... educators should help students navigate AI to be able to evaluate the validity of AI outputs ... to learn with – rather than exclusively from – AI" | Every module ends with students evaluating the model's output against their own knowledge (Re-roll agreement, confidence coloring). |
| "Accessible: AI tools or systems should be accessible for those who require digital accessibility accommodations" | WCAG 2.1 AA target (§6.3). |
| "Transparent and explainable: Stakeholders, especially parents, should understand how systems function" | The forward pass is ~150 lines of readable TypeScript; the product's entire purpose is explainability. |
| "Data-protective: Systems must comply with federal privacy laws including the Family Educational Rights and Privacy Act." | No data leaves the browser; FERPA compliance is structural, not contractual. |

Allowable-use language for grants: funds may "Develop or procure AI-powered instructional tools that adapt to learner needs in real time" and "Train educators, providers, and families to use AI tools effectively and responsibly." We are free, so "procure" is moot, but a district can spend PD funds on time to adopt the module.

**Secretary's Supplemental Priority "Advancing Artificial Intelligence in Education," final April 13, 2026 (91 FR 18774), effective May 13, 2026** [govinfo.gov/content/pkg/FR-2026-04-13/pdf/2026-07087.pdf]

- Procedural facts: proposed July 21, 2025 (90 FR 34203; 300+ comments; Docket ED-2025-OS-0118); final April 13, 2026; usable as an absolute, competitive-preference, or invitational priority in any ED discretionary grant program.
- Priority (a)(i): "Support the integration of AI literacy skills and concepts into teaching and learning practices to improve educational outcomes for students, including how to detect AI-generated disinformation or misinformation online."
- Priority (a)(ii): "Expand offerings of age-appropriate AI and computer science education in K–12 education." Priority (a)(ix): "Support dissemination of appropriate methods of integrating AI into education." Priority (a)(x): "Build evidence of appropriate methods of integrating AI into education."
- Priority (a)(xi): "Provide support and training to educators on age-appropriate AI education methodologies that emphasize foundational concepts in AI literacy and critical thinking skills while considering developmental readiness and students' safety factors in AI tool selections in K–12 education."
- Definition: "Artificial intelligence (AI) literacy means the technical knowledge, durable skills, civic awareness and future ready attitudes, including AI related ethical reasoning, critical social inquiry, interdisciplinary problem-solving, and creativity, required to thrive in a world influenced by AI. It enables learners to engage, create with, manage, and design AI, while critically evaluating its benefits, risks, and implications."
- ED on evaluation: "AI adoption should not be evaluated solely by efficiency or automation metrics, but by its demonstrated impact on student engagement, learning progress, and readiness for future opportunities."

*How we use it:* Module 4 (*Why It Lies*) is a direct hit on (a)(i)'s "detect AI-generated disinformation or misinformation." "Students' safety factors in AI tool selections" is the hook for the no-account, no-network, children's-story-model design. (a)(ii) is the hook for a district adding a CS-with-AI elective (Alabama/Georgia/Mississippi in §2.2); (a)(x) "build evidence" is the federal phrasing for what §8 does with voluntary teacher use-reports. Note honestly: ED explicitly **declined** to name free, open-source, or privacy-preserving tools as a federal priority and said safety is "optimally decided at the state and local level." The federal hooks are principles, not mandates; the mandates are at the state level.

**DOL TEN 07-25, "Artificial Intelligence Literacy Framework," Feb 13, 2026** [dol.gov/newsroom/releases/eta/eta20260213]

Five content areas — *Understanding AI Principles; Exploring AI Uses; Directing AI Effectively; Evaluating AI Outputs; Using AI Responsibly* — and seven delivery principles including *Enable Experiential Learning* and *Embed Learning in Context*. Intended for CTE curricula and K-12/higher-ed integration. The module plan (§4) tags each module with its DOL content area so community-college CTE instructors can cite the framework.

### 2.2 State

- **California** Ed Code §33548 (AB 2876): AI literacy is "knowledge, skills, and attitudes related to how AI works—its principles, concepts, and applications—as well as its limitations, implications, and ethical considerations." [leginfo.legislature.ca.gov ... AB2876]. CDE 2025 guidance: "AI should enhance, not replace, the educator's role" and "Personally identifiable information (PII) should only ever be entered into closed AI systems since open AI systems do not contain the protections required" [cde.ca.gov/ci/pl/aiincalifornia.asp]. The CDE model policy (June 25, 2026) names "privacy by design," "parent and guardian review rights," and "AI literacy as a core academic competency" [cde.ca.gov/ci/pl/aipolicy.asp]. *Hook:* "how AI works — its principles" is the statutory definition; a tool whose subject is literally how AI works, and into which no PII can be sent anywhere, satisfies both the definition and the PII rule at once.
- **Ohio** HB 96 / ORC 3301.24: every district must adopt an AI policy by July 1, 2026; the ODEW model policy covers "PII limits in third-party AI tools" and an "outlined process for evaluating AI tools from third party vendors" [education.ohio.gov/Topics/AI-in-Ohio-s-Education/Model-Policy]. *Hook:* vendor evaluation is trivial when the vendor receives nothing.
- **Idaho** SB 1227 (signed March 2026; effective July 1, 2026): statewide "generative AI literacy standards" by grade band (K–2, 3–5, 6–8, beyond), data-privacy requirements, educator PD, parent guidance; prohibits AI replacing teachers; classroom implementation possibly 2027–28 [**secondary:** ktvb.com/article/news/local/capitol-watch/idaho-create-statewide-ai-literacy-standards-students/277-a52f4bdb-be08-47d9-a095-6ced716b8af4; multistate.us/insider/2026/4/9/how-states-are-regulating-ai-in-education-this-legislative-session — bill text not yet retrieved].
- **Utah** HB 273 "Classroom Technology Amendments" (2026, signed): CS standards expanded to include "AI awareness and ethical interaction; AI's role in information filtering and decision-making... critical evaluation of digital sources"; full implementation targeted for 2027–28 [primary: le.utah.gov/Session/2026/bills/static/HB0273.html].
- **Oklahoma** SB 1734 (2026): district AI policies by 2027–28; bans AI for grading, discipline, and high-stakes decisions; annual parent disclosure of AI tools and student data; opt-out without penalty [**secondary:** future-ed.org/legislative-tracker-2026-state-ai-in-education-bills; k12dive.com/news/4-more-states-require-districts-to-adopt-ai-policies/824749 — the journal holds no primary (oklegislature.gov) text; retrieve before quoting]. *Hook:* the disclosure for this tool is one sentence — "collects no student data."
- **Alabama** HB 329 (2026): CS course "that includes AI instruction" required for graduation from the class of 2032; **Georgia** SB 179 (CS including AI as a graduation requirement from 2031–32) and **Mississippi** SB 2294 (CS/CTE credit with AI instruction from 2029–30) passed both chambers in 2026 [**secondary:** future-ed.org/legislative-tracker-2026-state-ai-in-education-bills; k12dive.com/news/4-more-states-require-districts-to-adopt-ai-policies/824749 — bill texts not retrieved]. *Hook:* every Alabama CS teacher now needs AI instruction content that fits a CS course.
- **Texas:** no TEA guidance as of Aug 2026 [aiforeducation.io/ai-resources/state-ai-guidance]; the TACC/UT Austin task force report (published June 17, 2026) recommends "a phased approach to updating the Texas Essential Knowledge and Skills (TEKS)" for AI literacy [**secondary:** winssolutions.org/texas-ai-education-task-force — the task-force PDF itself is not in the journal]. *Hook:* Texas teachers have a recommendation but no resource; cite the task force when distributing through Texas CSTA chapters / WeTeach_CS.
- **New York:** no NYSED guidance; A9190 (pending) would ban classroom AI before ninth grade except for specific uses [nysenate.gov/legislation/bills/2025/A9190]. NYC's "Traffic Light Framework" bans AI in discipline/placement/grading [schools.nyc.gov ... guidance-on-artificial-intelligence]. *Hook and caveat:* we target grades 9+ and perform no grading or decision function, so we sit in every framework's green tier — but we must not market to NY middle schools while A9190 is live.

Aggregate context for the pitch: 35 states + Puerto Rico have official K-12 AI guidance as of Aug 21, 2026 [aiforeducation.io/ai-resources/state-ai-guidance]; Gallup/Walton (May 2026): "82% of teachers have not received formal guidance" [edweek.org/technology/teachers-say-lack-of-ai-guidance-is-a-major-problem/2026/05].

### 2.3 Standards the modules map to (named in §4)

- **CSTA 2026 PK-12 CS Standards** (July 2026, AI integrated with an [AI] tag): HS-ALG-PS-04 (deterministic vs probabilistic algorithms), HS-ALG-PS-05 (evaluate AI-generated output for bias, accuracy, harms), HS-ALG-ML-07 (evaluate training data source/quality/representativeness/bias/privacy), HS-DAT-IM-27, HS-SOC-ET-40, HS-SOC-HU-44 [csteachers.org/wp-content/uploads/2026/07/AI-in-the-Foundational-Standards.pdf]. Listed in the brief but **not mapped to any module** in §4.2 or the crosswalk: HS-ALG-IM-10 — retained here so it is not lost; a future module or block extension must claim it, or it is dropped at the summer-2027 re-verification.
- **AP CSP CED (effective Fall 2023, no major 2025-26 change):** IOC-1.B.1, IOC-1.D.1–3 (Topic 5.3 Computing Bias), CRD-1.A.4 (M6; was used in §4.2 but missing from this list in the first draft), DAT-2, AAP-3 3.15 Random Values / 3.16 Simulations [apcentral.collegeboard.org ... ap-computer-science-principles-course-and-exam-description.pdf].
- **AI4K12 Five Big Ideas:** Big Idea 3 (Learning: neural networks, datasets), Big Idea 4 (Natural Interaction; 9-12 LO 4-A-i on language structure), Big Idea 5 (Societal Impact) [ai4k12.org/gradeband-progression-charts]. The 2025 priorities report says Big Idea 4 is the one most in need of a generative-AI update — the module plan fills exactly that hole. The crosswalk additionally maps Big Idea 3 to M2 and Big Idea 4 to M5 as **author's extensions** (marked † in §4.2; proposals until verified against the progression charts).
- **CSTA/AI4K12 AI Learning Priorities (May 2025), 9-12:** "Describe how current AI models (e.g., LLMs) use data representation"; "compare and contrast the strengths and limitations of their reasoning"; "Evaluate the data used to solve a problem"; "Debate what differences do or should exist between human and artificial intelligence."
- **ISTE Standards for Students:** 1.5 Computational Thinker, 1.3 Knowledge Constructor, 1.2 Digital Citizen [iste.org/standards].
- **DOL TEN 07-25** five content areas (for CTE / community college). Only three are claimed: *Understanding AI Principles* (M1–M3), *Evaluating AI Outputs* (M4–M5), *Using AI Responsibly* (M6); *Directing AI Effectively* and *Exploring AI Uses* are deliberately not claimed.
- **CA Ed Code §33548 definition elements** ("how AI works—its principles, concepts, and applications"; "its limitations, implications, and ethical considerations") — the only state text specific enough to map by element; it is the last content column of the crosswalk and of §4.2.

---

## 3. Target users

**Primary: the US high-school CS teacher who teaches AP CSP, an intro CS elective, or a new state-mandated "CS with AI" course.** Profile from CSTA 2025 Landscape: 81% believe AI should be foundational to CS, only 42% feel equipped (46% at HS), 50% have no CS colleague in the building, only 17% can get PD when they need it, and one of them wrote "I teach 4 different preps every day...no time left for PD" [csteachers.org/the-2025-cs-teacher-landscape]. This teacher needs something that works in 45 minutes on the devices the school already has, with no approval chain.

**Secondary: community-college instructors** in CS, IT, Business, Engineering, Math teaching a 3-credit intro course (150 contact min/week). From the 17-instructor focus group [arxiv.org/abs/2511.05363]: they rate interactive demonstrations highest (3.20/4.0), want progressive hints ("retry without restarting the module"), text-to-speech, less dense text ("my students often have short attention spans"), and jargon scaffolding for non-STEM students. California's 116 community colleges (2.1M students) have an ASCCC resolution to integrate AI literacy across all disciplines [asccc.org/resolutions/support-ai-literacy-integration].

**Tertiary:**
- Non-CS secondary teachers (ELA, library/media, math) assigned an AI-literacy week — the Passaic NJ / Washington County MD pattern [edweek.org/technology/its-not-magic ... 2025/10]. They need the unplugged opener and the discussion prompts more than the standards table.
- Outreach / informal educators (Hour of AI, AI Literacy Day, 4-H, museum workshops).
- 中文 users: Hong Kong and Taiwan secondary teachers, and mainland teachers responding to the MoE 《中小学人工智能通识教育指南（2025年版）》 call for 高中 students to "结合技术原理开展探究性学习" [edu.cn/xxh/focus/zc/202505/t20250513_2667990.shtml]. Served by the bilingual prose, with the honest caveat in §9 that the live model is English-trained.

**Explicitly not targeted:** students under 13 (COPPA; no direct student marketing at all), and any setting that needs a hosted chatbot.

**The student** (grades 9–14, age 14–20) is the end user but not the adopter. Design for them: one sentence in, something surprising out, within the first 60 seconds; no reading wall before the first interaction.

---

## 4. Module plan

### 4.1 Design rules

1. **45 minutes net** (Carnegie period) with a marked 90-minute block extension — Code.org forum teachers report 45-min AI lessons "required 90 minutes in block classes" [forum.code.org/t/thoughts-on-the-ai-foundations-course/41484], so the extension is planned, not improvised.
2. **First 10 minutes unplugged**, no device — the CSTA/AI4K12 priorities report and "AI Unplugged" research both recommend embodied-first [arxiv.org/html/2602.13242v1]. Also the printable fallback for the day the Wi-Fi is down.
3. **Reuse before build.** Every module is assembled from the eight named widgets. **At most one new widget per module**, and only where no existing widget can carry the activity.
4. **Same model throughout.** TinyStories-1M via nano-lm in every module. No optional big-model download in the classroom track — the flagship's optional model is **SmolLM2-135M-Instruct (q8, ~136 MB; swapped in for distilgpt2 on 2026-08-20)**, loaded only on an explicit click; classroom mode hides it regardless of which model the flagship ships, behind a teacher-only "bigger model" page.
5. **Every module ends with an evaluation act** — the student judges the model — to satisfy the ED "learn with – rather than exclusively from – AI" principle and CSTA HS-ALG-PS-05.
6. **Modules are independent.** A teacher can run M2 alone. Sequence is recommended, not required.
7. **Deep-linkable steps.** Each widget state in a lesson has a URL (`#m2-step3`) so a teacher can put a link in Classroom/Canvas that lands on the right step.

### 4.2 The six modules

| # | Module (EN / 中文) | Core question | Widgets reused | New widget (≤1) | Standards | DOL area | CA §33548 element |
|---|---|---|---|---|---|---|---|
| M1 | **The Word Chopper** / 切词机 | What does the model actually see when I type a sentence? | Chopper, Tokenizer X-ray | none | AI4K12 BI4 LO 4-A-i; CSTA/AI4K12 priority "how LLMs use data representation"; CSTA HS-SOC-ET-40; AP CSP DAT-2; ISTE 1.5 | Understanding AI Principles | "how AI works — its principles, concepts, and applications" |
| M2 | **The Next-Word Gamble** / 下一个词的赌局 | Is the model choosing, or rolling dice? | Gamble (prob bars + temperature), TheLoop | **Hundred Rolls** — press once, sample the same position 100 times, watch the frequency histogram converge on the probability bars | CSTA HS-ALG-PS-04 (deterministic vs probabilistic); AP CSP AAP-3 3.15 Random Values, 3.16 Simulations; AI4K12 BI3 (Learning) †; CSTA/AI4K12 priority "strengths and limitations of their reasoning" (partial) †; ISTE 1.5 | Understanding AI Principles | "its principles, concepts" |
| M3 | **Where It Looks** / 它在看哪里 | When the model predicts, which earlier words does it use? | AttentionRoom (heatmap, layer slider, head picker, auto head discovery), Head scanner | **Guess-then-Reveal** — a one-question overlay ("which earlier word will this head attend to?") shown before the heatmap unblurs; purely client-side, no scoring stored | AI4K12 BI3/BI4; CSTA/AI4K12 priority "compare and contrast the strengths and limitations of their reasoning"; CSTA HS-SOC-HU-44; ISTE 1.5 | Understanding AI Principles | "its principles, concepts" |
| M4 | **Why It Lies** / 它为什么说谎 | Why does something that sounds confident get things wrong? | Gamble, TheLoop (confidence coloring), Re-roll agreement | none | ED priority (a)(i) "detect AI-generated disinformation or misinformation"; CSTA HS-ALG-PS-05; AP CSP IOC-1.B.1; AI4K12 BI5; CSTA/AI4K12 priority "limitations of their reasoning" and, in the block extension, "Debate what differences do or should exist between human and artificial intelligence" †; ISTE 1.3 | Evaluating AI Outputs | "its limitations, implications" |
| M5 | **Why It Can't Count** / 为什么数不出 strawberry 有几个 r | Which tasks does tokenization quietly sabotage? | Chopper, Tokenizer X-ray, Gamble | none | CSTA HS-ALG-PS-05; CSTA HS-SOC-ET-40; CSTA/AI4K12 priority "limitations of their reasoning"; AI4K12 BI4 (representation limits) †; ISTE 1.3 | Evaluating AI Outputs | "its limitations" |
| M6 | **What It Learned From** / 它从哪里学来的 | Where do the model's "opinions" come from? | WordMap (embedding neighbors), Gamble | **Dataset Peek** — shows a small bundled sample of TinyStories training passages (static; the dataset is CDLA-Sharing-1.0, so the bundled excerpt carries that notice — a separate question from the *weights* license in §9, and not in the MVP) next to the model's completions so students trace a completion to its diet | CSTA HS-ALG-ML-07 (evaluate training data); AP CSP IOC-1.D.1–3 (Computing Bias), CRD-1.A.4; AI4K12 BI3 (datasets), BI5; CSTA HS-DAT-IM-27; ISTE 1.2 | Using AI Responsibly | "ethical considerations"; "implications" |

† **Author-mapped** in the standards crosswalk (front matter) beyond the first draft of this table: the activity plainly exercises the idea, but the cell has not been verified against the primary standard. Treat as a proposal. The standards columns here, §2.3, and the crosswalk in §5 are now the same list; the crosswalk adds a "verified against" date per row.

### 4.3 Module skeleton (identical for all six)

Each module page is a single static route with the following beats. Timing is for the 45-minute version; the block extension doubles the middle beat and adds a second evaluation task.

1. **Hook (0–3 min, projector).** Teacher types one student-suggested sentence into the widget. One surprising result, no explanation yet.
2. **Unplugged (3–13 min, no devices).** Printable activity. M1: cut a sentence into pieces with scissors and argue about where the cuts go. M2: roll a die against a printed probability table to "generate" three words. M3: students in a row point at which earlier classmate's word they'd "look at" to guess the next. M4: the "confident wrong answer" card sort. M5: count letters in a word written in syllable-chunks. M6: sort ten sentences by "which book did this come from."
3. **Guided exploration (13–33 min, devices).** Three numbered prompts, each a deep link to a widget state. Students use their own sentences. Progressive hints on each prompt (the community-college ask: "retry without restarting the module").
4. **Evaluation act (33–40 min).** The student judges the model: is this output right? how sure was the model? would you trust it? Written on paper or in the teacher's own form — never in our page.
5. **Exit ticket (40–45 min).** Three questions, printed in the guide, with sample responses at three levels (the Code.org forum complaint that "answer keys lack sample responses").
6. **Block extension (+45 min).** A second sentence type (e.g., a sentence in the student's home language in M1 to see byte-level chopping; a factual sentence in M4) and a structured debate prompt drawn from CSTA HS-SOC-HU-44.

### 4.4 Sequencing suggestions in the guide

- **One period:** M2 alone (the "dice" lesson is the most self-contained and the one Utah/Charleston-style "see the chatbot's flaws" teaching is reaching for [wsls.com ... 2026/08/21]).
- **Three periods ("AI Literacy Week"):** M1 → M2 → M4.
- **AP CSP Unit 5 (Impact of Computing, 21–26% of exam):** M4 + M6.
- **Full sequence (six periods or three blocks):** M1–M6 in order.
- **Community college, one 75-min meeting:** M2 + M3 with the block extension of M3.

---

## 5. Teacher guide outline

One guide per module plus a shared front matter, delivered as (a) a static HTML page on the site, (b) a printable PDF, and (c) a Google Slides companion deck (teachers embed Slides natively in Classroom; the research found true Classroom add-ons require paid licenses [support.google.com/edu/classroom/answer/12234529]). All three are generated from the same source text to keep them in sync. EN and 中文 versions are peer documents, not translations.

**Front matter (shared)**

1. What this is, in 100 words — and what it is not (not a chatbot, not a grader).
2. **The model card, honestly.** "The model running in your students' browsers is TinyStories-1M, a GPT-Neo with about 1 million non-embedding parameters (about 3.75 million values in the 7.5 MB file once the word-embedding table is counted), trained on synthetic children's stories. ChatGPT-class models are ~100,000x larger. Everything you see — tokens, probabilities, attention, sampling — works the same way; the vocabulary and the competence do not." Why this is a feature (age-appropriate by construction; runs on anything) and a limitation (it can't answer trivia). The card also states the weights-license status plainly (§9 "Weights license unresolved"): as of 2026-08-22 the upstream model card carries no license field, the weights are described as a research release redistributed unchanged with attribution, and a license request to the model author is pending.
3. **Privacy & safety one-pager**, written to be pasted into a district vetting form: no accounts; no network requests to any host other than the lesson domain, and none at all after the page and its assets have loaded (this depends on the self-hosted tokenizer, §6.2 — phase 2 of the build; until it ships, the flagship's huggingface.co load-time dependency must be disclosed in any allowlist request); no cookies, analytics, or identifiers; no student input leaves the device; **what is stored, precisely:** one preference value (the EN/中文 choice, localStorage key `itm-lang`) plus the ordinary browser cache of the page, the weights, and the tokenizer files — no student input is stored anywhere, including locally, and clearing site data removes everything; no third-party scripts; COPPA/FERPA/SOPIPA position (§8.5); contact for the Common Sense Privacy Program evaluation once obtained.
4. **Tech check** (5 minutes, do it the day before): open the URL on a student Chromebook; confirm the model loads (7.5 MB weights + ~2 MB tokenizer, one time); confirm the filter category; link to the unblock-request template letter.
5. **Standards crosswalk table** (all six modules × CSTA 2026 / AP CSP / AI4K12 / CSTA-AI4K12 priorities / ISTE / DOL TEN 07-25 / CA Ed Code §33548) — the same cells as §4.2, with author-mapped cells marked and a "verified against" date per row (§9 "Standards churn").
6. **Policy citations page** — §2 of this document, condensed to one page per level (federal / your state), for grant narratives and school-board questions.
7. Accessibility statement and known gaps (§6.3).
8. How to cite (CITATION.cff) and how to tell us you used it (§8).

**Per-module guide**

1. At a glance: grade band, time (45 / 90), prerequisites (none), devices, printables list.
2. Learning objectives (3) in student language.
3. Standards addressed (pulled from the crosswalk).
4. Teacher background (≤ 600 words, with a link to the corresponding flagship essay act for depth).
5. Minute-by-minute plan (the §4.3 skeleton with specifics).
6. Unplugged activity: instructions + printable.
7. Guided exploration prompts with deep links and the progressive hints students will see.
8. Discussion prompts (5) including one human-vs-AI debate prompt.
9. Common misconceptions and what the widget shows to dislodge them (e.g., "it looks up the answer" → Hundred Rolls).
10. Evaluation act and exit ticket with a 3-level rubric and sample responses at each level.
11. Block extension.
12. Differentiation: ELL / 中文-speaking students (bilingual glossary), non-STEM (jargon-free variant of each prompt), advanced (pointer to Transformer Explainer and nano-lm source).
13. Accessibility notes specific to the widgets in this module (keyboard path, what the screen reader announces, the text-table alternative to the heatmap).
14. Slides deck link and the Canvas embed snippet for this module.

---

## 6. Chromebook, LMS, and accessibility requirements

### 6.1 Device baseline

Design target: a 2019–2021 education Chromebook — 4 GB RAM, Celeron/MediaTek, managed Chrome, no install rights, no Vulkan/WebGPU — because 93% of districts plan to buy Chromebooks [marketbrief.edweek.org ... 2025/01], fleets average ~7.6 years [agp360.com/post/chromebook-aue-explained], and ~88% of districts provide devices to all MS/HS students.

Requirements:

- **No WebGPU, no WASM, no workers required.** nano-lm runs on the main thread in plain TypeScript; a forward pass over a sentence is ~10 ms. Keep it that way for the classroom build.
- **First interactive paint under 3 s on a 4 GB Chromebook over school Wi-Fi; weights (7.5 MB) and tokenizer files (~2 MB) fetched once, cached with long-lived headers; the page must work with 30 students fetching simultaneously** (~10 MB × 30 ≈ 300 MB burst — not the 225 MB the first draft computed from weights alone; acceptable on a school link, but test it, and note the unplugged opener staggers the loads for free).
- **Total first-visit page weight budget ≤ 10 MB, itemized** (the first draft's "≤ 10 MB including weights" silently omitted the tokenizer files and the JS bundle):

  | Component | Size | Status |
  |---|---|---|
  | Model weights `tinystories-1m.safetensors` + `meta.json` | 7.5 MB (7,502,858 bytes) | measured |
  | GPT-2 tokenizer files `tokenizer.json` + `tokenizer_config.json`, self-hosted on the lesson domain (§6.2) | ~2 MB | measured in the flagship; self-hosting is phase 2 |
  | HTML + JS + CSS bundle (the flagship bundle includes the transformers.js tokenizer library) | **to measure at build** | the 10 MB total leaves ~0.5 MB for this line; if the bundle exceeds it, either replace transformers.js with a self-contained BPE tokenizer or re-baseline the budget and the 30-client arithmetic above |

  No fonts from third-party hosts; system font stack.
- **Works with the optional big model hidden.** The optional big-model path (SmolLM2-135M-Instruct q8, ~136 MB in the flagship, loaded only on an explicit click) is not linked from any classroom page; the classroom-mode configuration hides it (phase 1, built).
- **Tab memory under 500 MB.** Chrome's per-tab cap is ~4 GB but a 4 GB machine with 8 tabs open is the real ceiling.
- **Target browser/OS matrix (a plan, not a test report):** ChromeOS (managed student profile), Windows 10/11 Edge, macOS Safari, iPadOS Safari, Firefox; touch operation of every widget. **Verified as of 2026-08-22:** Chrome and Safari on the author's development machine only; everything else is MVP item 4 (§10.1). The first draft's parenthetical "the 65% of districts buying Apple" contradicted the 93%-Chromebook figure above and has no source in the research brief, so it is dropped; iPad support is justified by Apple's share of the fleet whatever that share turns out to be.
- **Offline behaviour, two levels.** (a) *Already true by construction:* once the page and its assets have loaded, a dropped Wi-Fi mid-lesson does not stop the widgets, because nothing is fetched after load. (b) **Planned — phase 4, not built:** surviving a page *reload* offline requires the service worker; until it ships, a reload on a dead connection loses the page. Print the unplugged sheet anyway.

### 6.2 Network and filtering

- **Hosting:** static files only, on a stable custom domain owned by the author, published at least 60 days before the first distribution push so filter vendors categorize it. Avoid `*.github.io`, `*.netlify.app`, `*.vercel.app` as the canonical URL — these have been mis-categorized as "parked" or blocked [answers.netlify.com ... parked-category ; gist.github.com/grovesNL/2d00b568038bd28896d44d1b5b3299cd].
- **No AI-chat traffic signature.** No calls to any LLM API; no request to any host other than the lesson domain at any point, and no requests at all after load. **Requirement (phase 2 of the build): the GPT-2 tokenizer files (`tokenizer.json`, `tokenizer_config.json`, ~2 MB) are served from the lesson domain — self-hosted tokenizer.** The flagship essay today fetches them from huggingface.co at page load via transformers.js (`src/lib/engine.ts`, read 2026-08-22) — static vocabulary files only, never student text, but a third-party host all the same; the classroom build must not inherit that path, and until the self-hosted tokenizer ships, every allowlist request and the privacy one-pager must list huggingface.co as a load-time dependency. GoGuardian's "Artificial Intelligence Tools" category [goguardian.com/product-update/new-ai-filtering-category] and Lightspeed's "AI – Generative" list (3,000+ sites) are keyed on hosted AI services; we want to be categorized as "Education," which means the site's own text and metadata must say "lesson," "teacher guide," "standards" prominently and never present as a chat product.
- **Submit the domain proactively** to GoGuardian, Lightspeed, Securly, and ContentKeeper category review as Education/Reference once live. Ship an "unblock request" template letter in the guide.
- **No sign-in of any kind**, which removes the Google Workspace for Education under-18 third-party-app block entirely [support.google.com/a/answer/13288950].
- **No cookies or persistent identifiers** — COPPA's amended definition of personal information (compliance by April 22, 2026) now reaches persistent identifiers used beyond internal operations; having none is simpler than arguing the exception.

### 6.3 Accessibility (WCAG 2.1 AA)

ADA Title II requires WCAG 2.1 AA for public K-12 and community colleges, including course content placed in an LMS; deadlines April 26, 2027 (entities serving 50k+) and April 26, 2028 [ada.gov/resources/web-rule-first-steps ; jacksonlewis.com ... doj-extends]. A tool that fails this is un-adoptable by a public school after those dates. Requirements:

- Every widget fully keyboard-operable (tab order through tokens, arrow keys across the heatmap, slider with arrow keys and announced value).
- **Text alternatives for every visualization:** the attention heatmap gets a sortable text table ("token X attends most to token Y, 0.61"); probability bars get a list; the autoregressive animation gets a step log.
- No information conveyed by color alone (confidence coloring also shows a numeric label; head-type discovery shows a label, not just a hue).
- Contrast ≥ 4.5:1 in both light and dark themes; respects `prefers-reduced-motion` (TheLoop animation becomes step mode).
- Screen-reader tested with ChromeVox (ChromeOS), VoiceOver (macOS/iOS), NVDA (Windows).
- Text-to-speech for prompts via the browser's built-in `speechSynthesis` — the community-college instructors' explicit ask — no external service.
- Captions/transcripts for any video; the MVP ships no video.
- A written accessibility conformance statement with known gaps, updated per release.

### 6.4 LMS embedding

- **Google Classroom:** a clean URL per module and per step, an OG preview card, and the Slides deck. No add-on (paid-tier only).
- **Canvas / Schoology:** an `<iframe>` embed snippet per module with fixed height and a fallback link; HTTPS only; note in the guide that iframes don't render in Canvas edit mode [community.instructure.com ... 662934]. No LTI (requires admin-created developer keys).
- `X-Frame-Options` / CSP set to allow framing from any origin (we have nothing to protect).
- Printable PDF of every module for the LMS file drop.

---

## 7. Distribution plan

Principle: teacher adoption is word of mouth [marketbrief.edweek.org ... teachers-word-carries-weight], and CS teachers' "colleagues" are online because half have none in the building. So distribution = being present, with something concrete, in the eight places the research names, on the four dates that matter.

### 7.1 Calendar (assumes the classroom MVP goes live between late October and mid-December 2026 depending on pace; see §10.2)

| When | Channel | Action |
|---|---|---|
| Sept–Oct 2026 | **CSforALL Hour of AI activity catalog** | Submit M2 ("The Next-Word Gamble") as a one-hour activity for CS Education Week (second week of December; 2025 was Dec 8–14 with 100+ activities from 50+ orgs) [csforall.org/en-US/hour-of-ai]. This is the single largest discovery window for a free AI activity. Deadline must be confirmed on the catalog page in September. |
| Fall 2026 | **CSTA 2027 Annual Conference** session proposal | Proposals typically open in the fall (2026's super-early-bird closed Jan 11, 2026) [conference.csteachers.org]. Propose a hands-on 60-min session: "Run a real language model on a Chromebook in 45 minutes." |
| Nov 2026 onward | **Common Sense Privacy Program** | Request a privacy evaluation; a Pass rating is the artifact district coordinators look for [commonsense.org/education/articles/check-out-the-privacy-ratings]. |
| Dec 2026 | CS Ed Week / Hour of AI | Be live, be in the catalog, answer forum threads that week. |
| Jan–Mar 2027 | **National AI Literacy Day** (aiEDU; March 27 in 2026; the organizers solicit K-12 lesson contributions) [ailiteracyday.org/how-to-get-involved] | Submit M4 ("Why It Lies") as the Literacy Day lesson. Districts run "AI Literacy Weeks" around it — offer the M1→M2→M4 three-day sequence. |
| Q1 2027 | Flagship essay launch (HN / 少数派 / 知乎) | Cross-link: the essay's "Teach this" button and the classroom site's "Go deeper" links. |
| Jun–Jul 2027 | ISTELive 27; CSTA 2027 | Present if accepted; otherwise attend chapter sessions virtually. |

### 7.2 Standing channels

- **CSTA:** community.csteachers.org discussion boards; the Resources Library; local chapters (start with Texas — no state guidance but a task-force recommendation — and California, Ohio, Alabama where mandates create demand); CSTA Voice article pitch.
- **Code.org / CodeAI Professional Learning Community forum** (forum.code.org): the "AI Foundations" category and the recurring "Recommendations for AI course for 9th graders" threads [forum.code.org/t/recommendations-for-ai-course-for-9th-graders/42268]. Answer with the module, not a link dump; teachers there specifically asked for "more AI" and "cool lessons regarding training data" (M6).
- **r/CSEducation** (~26k), Facebook groups "AP Computer Science Principles Teachers," "Computer Science Educators," WeTeach_CS (Texas).
- **College Board AP Community** (AP CSP) — post the Unit 5 pairing (M4 + M6).
- **State listservs and CS supervisors:** California CDE computer-science-all list (subscribe via blank email to subscribe-computer-science-all@mlist.cde.ca.gov); Colorado CDE resource bank (lists AI4K12); the new AI coordinators Maryland SB 720 creates.
- **Community college:** CCC AI Fellows network / ASCCC; the CCCCO "AI Literacy for Educators" course community; DOL TEN 07-25 framing for CTE.
- **Academic:** the flagship's VISxAI 2027 / arXiv / AAAI-28 demo plan already exists; the classroom edition adds a **JOSE** submission (§8) and a possible SIGCSE/ITiCSE poster once teaching-use evidence exists.
- **中文:** 少数派 / 知乎 posts for the bilingual angle; Hong Kong CUHK "AI for the Future" network and Taiwan CS teacher groups as the first non-US classroom channels; mainland distribution depends on hosting reachability (§9).
- **Directories:** AI4K12 resource directory, TeachAI resource list, Common Sense Education lesson collections, aiEDU partner resources, Experience AI / Raspberry Pi Foundation community (they have the guides and no model — propose a link exchange, not a merger).

### 7.3 What we will not do

No paid ads, no sponsorships, no affiliate links, no newsletter signup that stores emails on our infrastructure, no "Pledge to America's Youth" signature (that is for organizations, and we are one person). A plain `mailto:` and a GitHub Discussions board are the only contact surfaces.

---

## 8. Adoption-evidence plan

The product collects nothing, so evidence of adoption must come from **teachers volunteering it**, and from public artifacts we did not create. This section defines what we ask for, how, and what it may be used for.

### 8.1 Principles

1. **Teacher-level only.** We never ask for, accept, or store student names, work, screenshots with student faces, or any student-level data. If a teacher sends it anyway, we delete it and say so.
2. **Aggregate professional observation is fine.** "About 25 students; most could explain temperature afterward" is the teacher's own professional judgment, contains no PII, and is the kind of evidence ED itself asks for ("demonstrated impact on student engagement, learning progress").
3. **Voluntary, un-incentivized, revocable.** No gift cards, no swag, no early access. Any teacher can ask for their statement to be removed at any time.
4. **Adults only.** We do not solicit student testimonials, ever.
5. **Disclosed dual use.** Teachers are told, in plain words, that letters and statements may be used (a) publicly on the site with their consent, (b) in academic submissions (JOSE, VISxAI), and (c) as evidence of impact in the author's own professional and immigration records. A teacher can consent to any subset.

### 8.2 Instruments (all zero-backend)

- **"I taught with this" GitHub Discussion template** — fields: name (or "anonymous HS teacher, Ohio"), institution (optional), course, grade band, date(s), which modules, approximate class size (rounded to tens), device type, one thing that worked, one thing that didn't. Public by default; teachers can email instead.
- **Letter request kit** — a one-page explanation of why letters matter and a 150-word skeleton, sent only to teachers who have already posted a use report and only if they ask how to help further. Letters are signed by the teacher, on their letterhead if they choose, addressed "To whom it may concern," and describe their own use.
- **Open feedback issues** — bugs and lesson notes, the usual open-source channel.
- **Exit-ticket aggregate (optional)** — teachers who want to contribute can report the *distribution* of exit-ticket rubric levels for a class (e.g., "Level 3: 12, Level 2: 9, Level 1: 4"). This is how we learn whether the modules teach anything, without ever seeing a student response.

### 8.3 Public evidence we track (without collecting)

GitHub stars/forks of the classroom repo and nano-lm; npm downloads of nano-lm once published; inclusion in the Hour of AI catalog, AI Literacy Day lessons, AI4K12 directory, Common Sense collections; Common Sense Privacy rating; CSTA/ISTE session acceptances; citations of the CITATION.cff object; press/blog mentions; forum threads where teachers recommend it to each other (screenshots of public posts, with usernames redacted unless the poster consents).

**Web analytics:** none. No cookie, no beacon, no self-hosted counter. Static hosts keep request logs for their own operations; we do not query, export, or report them. The privacy page says exactly this.

### 8.4 What counts as "teaching use" — for JOSE and for us

For the **Journal of Open Source Education** submission (which accepts both software and learning modules; verify the current author guidelines and reviewer checklist at the time of submission, since they change), we will treat a module as having been "used in teaching" only when **all** of the following hold:

1. An instructor **other than the author** delivered it in a real course section (not a demo, not a webinar), and
2. the delivery is documented by that instructor in their own words (a use report or letter) naming institution, course, term, the modules used, and an approximate student count, and
3. the instructor has given explicit permission for the documentation to be cited.

Author-delivered outreach sessions (Hour of AI events, workshops) count as *piloting*, reported separately and honestly labeled. Target before a JOSE submission: **five instructors, three states or two countries, at least two modules, at least one community college.** Rationale: enough to show it was not a single friendly teacher, few enough to be achievable in one school year.

### 8.5 FERPA / COPPA posture in one paragraph (for the guide)

The tool receives no student data and therefore is not a "school official" under FERPA, creates no "education records," and is not an "operator" collecting personal information under COPPA. The only data we ever hold is what adult teachers voluntarily send us about themselves. Districts that require a Data Privacy Agreement can use the SDPC national template; we will sign one that says "no data" if a district needs the paper [privacy.a4l.org/national-dpa]. California's SOPIPA (Bus. & Prof. Code §22584) restricts what operators of K–12 online services may do with student information — targeted advertising, profiling, sale; we collect no student information, so none of those activities can occur, and CDE's rule that PII "should only ever be entered into closed AI systems" is satisfied structurally, because nothing typed into the page reaches any AI system, open or closed (§2.2; identical wording in the front-matter privacy one-pager).

---

## 9. Risks — honest

| Risk | Likelihood | What we do about it | What we can't fix |
|---|---|---|---|
| **The model is tiny and English-only.** TinyStories-1M cannot answer a factual question, and Chinese input is chopped into bytes by the GPT-2 tokenizer. Students will type "what is the capital of France" and get a story about a cat. | Certain | The model card (§5) says so up front; M1's block extension *uses* the Chinese-bytes behavior as a lesson; every prompt set leads with sentences the model handles. The 中文 edition's prose is native but its model examples stay English. | A teacher who wanted a ChatGPT demo will be disappointed. We are not that. |
| **Unfiltered generative output in a classroom.** The model can in principle emit any GPT-2 token; the training distribution is children's stories, but "in principle" is what a district asks about. | Low probability, high salience | Document the training data honestly; sampling is capped (short continuations, ≤ 30 tokens; temperature ≤ 1.5 — the flagship sliders run to 2.0 in Gamble and 1.6 in TheLoop, and the classroom-mode configuration, built in phase 1, clamps both to 1.5); an optional token blocklist at sampling time is a one-day change if a district asks. Never claim "safe"; claim "trained only on synthetic children's stories, runs offline, and here is the source." | Someone will eventually find an odd completion and post it. |
| **Weights license unresolved — pre-release blocker.** The Hugging Face model card for `roneneldan/TinyStories-1M` shows **no license field** (verified 2026-08-22). The TinyStories *dataset* is CDLA-Sharing-1.0, whose §3.5 imposes no obligations on models trained on the data — so the dataset license neither grants nor restricts redistribution of the weights — and nano-lm's `meta.json` records them only as a "research release." The first draft's "license-checked" wording was wrong. | Certain until resolved | A license request to the model author is pending. Until a written answer or a documented redistribution basis exists: the classroom site does not go public with the weights; the model card says "research release, redistributed unchanged with attribution," not "licensed"; §10.1 "done means" carries the blocker. Fallback if the author never answers: train a replacement ~1 M-parameter model on the CDLA-Sharing dataset, which §3.5 permits — a retraining task, not a content change. | Timing. An unanswered request can hold the release past the Hour of AI window exactly as the employer gate can (next row but one). |
| **Filter categorization.** A new domain may be blocked by default; a domain with "AI" in the name may be swept into the AI-Tools category. | Medium | Stable domain, 60-day lead, proactive category submission, no chat signature, unblock template in the guide. | District-by-district unblocking is repeated work we cannot do for teachers. |
| **Solo author, zero revenue, indefinite maintenance.** Browsers change; WCAG rules tighten; standards get renumbered. | Certain over 3+ years | Zero-dependency engine and static hosting make the bit-rot surface small; the repo is open so others can fork; no service to keep alive. | If the author stops, it freezes. It does not break, but it stops improving. |
| **Employer open-source / publication approval gate.** The flagship is already subject to an employer OSS approval and real-name publication gate; the classroom edition inherits it. | Medium; timing risk is the real issue | Start approval for the classroom scope with the flagship's request, not after; keep the classroom edition in the same repository family so one approval covers it. | Approval timing could push the MVP past the Hour of AI window (Dec 2026). If so, target AI Literacy Day (Mar 2027) instead. |
| **Standards churn.** CSTA 2026 IDs are weeks old; AI4K12 is revising Big Idea 4; states (ID, UT) are writing grade-band standards for 2027-28. | High | Crosswalk lives in one data table with a "verified against" date per row; re-verify each summer. | Some mapping will be stale at any given moment. Say so on the page. |
| **Policy direction reverses.** NY A9190 would ban classroom AI before ninth grade; a broader backlash ("tech backlash grows," EdWeek June 2026) could make "AI lesson" a harder sell. | Medium | We target 9+; the product is *about* AI rather than *using* AI, which is the framing skeptics accept; keep the unplugged version strong so the lesson survives a device ban. | We cannot control the word "AI" in a headline. |
| **Adoption is invisible.** With no analytics, we may have 50,000 users and zero evidence. | High | §8's instruments; make "tell us" frictionless; track public artifacts. | Evidence will undercount real use, probably badly. Accept it; it is the price of the privacy position, and the privacy position is the product. |
| **Mistaken for the competitor.** Teachers already know Transformer Explainer; reviewers may see this as a smaller copy. | Medium | Lead with what it does that TE doesn't: lesson packaging, 45-min sizing, Chromebook baseline, no WebGPU/ONNX, auditable forward pass, bilingual, standards crosswalk. Credit TE openly and link to it as "go deeper." | Some people will still say "TE but smaller." Fine — for a 4 GB Chromebook, smaller is the point. |
| **Under-13 drift.** Middle-school teachers will use it regardless of the 9+ label. | High | The tool itself collects nothing, so the COPPA exposure is nil; the label exists for developmental appropriateness and NY-style policy, not privacy. Say "designed for grades 9–14; no student data is collected at any age." | None needed beyond honesty. |
| **Mainland China reachability.** Static hosting on common CDNs may be unreachable or slow; the 中文 edition may mostly serve HK/TW and diaspora. | Medium | Keep assets self-contained so a mirror is a copy of one folder; do not promise mainland availability. | Not ours to solve. |
| **Scope creep from the teacher guide.** Six modules × three formats × two languages is 36 documents. | Certain if unmanaged | MVP is two modules (§10). Generate all formats from one source. Add modules only when a teacher asks for the next one. | — |

---

## 10. MVP scope and effort estimate

### 10.1 MVP scope

**Ship:** a static site, `classroom.` subdomain of the flagship's domain, containing:

1. **Two modules, M1 "The Word Chopper" and M2 "The Next-Word Gamble,"** each a single page following the §4.3 skeleton, with deep-linkable steps, progressive hints, and the block extension. Widgets reused: Chopper, Tokenizer X-ray, Gamble, TheLoop. **Exactly one new widget: Hundred Rolls** (M2). M1 gets no new widget.
2. **Teacher guide for both modules** plus the shared front matter (model card, privacy & safety one-pager, tech check, standards crosswalk for all six planned modules, policy citations page, accessibility statement), in EN and 中文, as HTML and printable PDF. Slides companion for M2 only.
3. **Two printable unplugged activities** (scissors sentence; dice-and-table generation), EN and 中文.
4. **Chromebook validation:** load and run on a managed 4 GB Chromebook and an iPad; 30-client simultaneous-load test; offline-after-*reload* via service worker (phase 4 — planned, not built; offline-after-load without a reload already holds by construction).
5. **Accessibility pass to WCAG 2.1 AA on the four reused widgets plus Hundred Rolls:** keyboard paths, text-table alternatives, reduced-motion, ChromeVox/VoiceOver/NVDA check, conformance statement with known gaps.
6. **Embed kit:** Canvas iframe snippet, OG cards, per-step URLs.
7. **Adoption-evidence surface:** "I taught with this" Discussion template, `mailto:`, letter kit text (not yet sent to anyone).
8. **Submissions:** Hour of AI catalog (M2) and Common Sense Privacy Program request.

**Explicitly out of MVP:** M3–M6; the Guess-then-Reveal and Dataset Peek widgets; video; Spanish; any LMS integration beyond iframe/links; the optional ~136 MB big-model path (SmolLM2-135M-Instruct q8); JOSE submission (needs teaching-use evidence first); conference sessions (proposal only).

**Done means:** a teacher who has never seen the flagship can open the M2 URL on a school Chromebook, run the unplugged opener from the printout, run the lesson in one 45-minute period with no account and no IT ticket, and find the standards and privacy language they need in the guide — and the author has verified this with at least one teacher who is not a friend. **Also done means:** the weights-license question (§9) is closed before the site is public — a written answer from the model author, or a documented redistribution basis, recorded in the model card — and the tokenizer is self-hosted (phase 2) so the privacy one-pager's "no host other than the lesson domain" sentence is literally true.

### 10.2 Effort estimate (solo, assuming the existing assets)

Units are focused solo engineering days (≈ 6 productive hours). Evenings-and-weekends pace is roughly 2.5 such days per calendar week.

| Work item | Days | Notes |
|---|---|---|
| Classroom shell: routes, step deep-links, hint system, print stylesheet, classroom-mode config (big model hidden, temperature cap at 1.5 — **phase 1, built**), self-hosted tokenizer (phase 2), service worker (phase 4) | 4 | Reuses series registry/route/i18n patterns. The phase-1 config is done; the remaining days cover phases 2–4 of the shell. |
| M1 page (EN + 中文 prose, prompts, hints) | 3 | Chopper + Tokenizer X-ray already exist; this is writing and wiring. |
| M2 page (EN + 中文) | 3 | Gamble + TheLoop exist. |
| **Hundred Rolls** widget | 2 | Sampling loop over existing softmax/prob code plus a histogram; accessible table alternative included. |
| Teacher guides M1, M2 + shared front matter (EN + 中文), HTML + PDF pipeline | 6 | Writing-dominated; the standards crosswalk table and policy page are mostly transcription from §2 and §4. |
| Two unplugged printables (EN + 中文) | 1.5 | |
| M2 Slides companion | 1 | |
| Accessibility pass on 5 widgets + statement | 4 | The heatmap is not in MVP, which removes the hardest case. |
| Chromebook/iPad/30-client testing and fixes | 2 | Borrow or buy a used 4 GB Chromebook. |
| Domain, hosting, filter-category submissions, OG cards, embed snippet | 1.5 | |
| Hour of AI and Common Sense submissions, Discussion template, letter kit text | 1 | |
| Pilot with 1–2 teachers, fix what they hit | 3 | Calendar-bound; recruit via CSTA/forum threads in advance. |
| **Total** | **≈ 32 days** | ≈ 13 calendar weeks at 2.5 days/week; ≈ 7 weeks if run near full-time. |

Contingency: +25% for the 中文 peer versions taking longer than transcription (they always do) → **≈ 40 days**. Starting 1 Sept 2026 at the evenings pace lands in early-to-mid December — after the Hour of AI catalog deadline, which is why §7 says to submit M2 to the catalog in September/October with the flagship's existing Gamble act as the demo and the classroom page as "available December." If the employer approval gate slips, the fallback target is AI Literacy Day, late March 2027, which the same estimate comfortably meets.

**Follow-on (not estimated here):** each additional module is ≈ 5–7 days (page + guide + printable, both languages) plus ≈ 2–3 days for its new widget if it has one; M3's accessibility work on the heatmap is the largest single follow-on item (≈ 4 days).

---

## Appendix A — Source index (abbreviated)

Policy: EO 14277 (govinfo.gov FR-2025-04-28/2025-07368; Sec. 1 text via whitehouse.gov/presidential-actions/2025/04/advancing-artificial-intelligence-education-for-american-youth); NSF actions — NSF 25-545 and the DCL "Expanding K-12 Resources for AI Education" (secondary: education.asu.edu funding calendar) and the $11 M NSF–CSTA award of Mar 19, 2026 (secondary: govtech.com); America's AI Action Plan (whitehouse.gov, July 23, 2025); ED DCL July 22, 2025 (ed.gov/media/document/opepd-ai-dear-colleague-letter-7222025-110427.pdf); ED final priority 91 FR 18774 (govinfo.gov FR-2026-04-13/2026-07087); DOL TEN 07-25 (dol.gov/newsroom/releases/eta/eta20260213); CA AB 2876 / Ed Code §33548 and CDE guidance (cde.ca.gov/ci/pl/aiincalifornia.asp, aipolicy.asp); Ohio ODEW model policy (education.ohio.gov); Idaho SB 1227 (secondary: ktvb.com, multistate.us); Utah HB 273 (le.utah.gov); Oklahoma SB 1734 and Alabama HB 329 / Georgia SB 179 / Mississippi SB 2294 (secondary: FutureEd 2026 tracker, future-ed.org; k12dive.com); Texas task force (secondary: winssolutions.org); AI for Education state tracker (aiforeducation.io); NY A9190 (nysenate.gov); NYC DOE AI guidance (schools.nyc.gov).

Teacher needs: CSTA 2025 Landscape (csteachers.org, landscape.csteachers.org); CSTA 2026 standards (csteachers.org/k12standards/revision); CSTA/AI4K12 priorities (csteachers.org/ai-priorities); AP CSP CED (apcentral.collegeboard.org); AI4K12 (ai4k12.org); ISTE (iste.org/standards); community-college focus groups (arxiv.org/abs/2511.05363); Gallup/Walton via k12dive.com and edweek.org (May 2026); RAND RRA4180-1 and RRA956-31; CDT 2025 via govtech.com; EdWeek Research Center (Mar, May 2026); Code.org forum threads (forum.code.org/t/41484, /42268); AP via wsls.com (Aug 21, 2026); device data (marketbrief.edweek.org, aboutchromebooks.com, agp360.com); WebGPU (developer.chrome.com/blog/webgpu-release); filters (goguardian.com, lightspeedsystems.com); Google Workspace under-18 policy (support.google.com/a/answer/13288950); COPPA 2025 amendments; SDPC (privacy.a4l.org); ADA Title II (ada.gov, jacksonlewis.com); Classroom/Canvas embedding (support.google.com/edu/classroom/answer/12234529, community.instructure.com/.../662934); CSTA/ISTE conference dates; Hour of AI (csforall.org/en-US/hour-of-ai); AI Literacy Day (ailiteracyday.org).

Build facts (read 2026-08-22): nano-lm README and `weights/meta.json`; flagship `src/lib/engine.ts`, `src/acts/Gamble.tsx`, `src/acts/TheLoop.tsx`; Hugging Face model card `roneneldan/TinyStories-1M` and dataset card `roneneldan/TinyStories` (CDLA-Sharing-1.0).

Competitors: Code.org How AI Works and AI Chat Lab; MIT Day of AI (dayofai.org); AI4K12; Teachable Machine; Stanford CRAFT (craft.stanford.edu); aiEDU (aiedu.org); CS50 AI; Transformer Explainer (poloclub.github.io/transformer-explainer; arXiv 2408.04619; CHI 2026); AnimatedLLM (arXiv 2601.04213; TeachingNLP 2026); bbycroft llm-viz; LLens; LLMs Unplugged (llmsunplugged.org); Experience AI (experience-ai.org); Common Sense AI Literacy Lessons; China MoE 2025 guidelines (edu.cn); CUHK AI for the Future.


---

## Revision log

| Date | Rev | What changed | Why |
|---|---|---|---|
| 2026-08-22 | r1 | First draft. | — |
| 2026-08-22 | r2 | Reconciled against the shared front-matter drafts (model card, privacy one-pager, tech check, standards crosswalk, policy citations, accessibility statement, letter kit) and the policy research journal. Specifically: (1) "no third-party endpoints" restated as a self-hosted-tokenizer requirement, phase 2, in §5 and §6.2, with the flagship's huggingface.co load-time dependency disclosed; (2) §6.1 page-weight budget itemized — weights 7.5 MB + tokenizer ~2 MB + JS bundle (to measure at build) — and the 30-client burst recomputed at ~300 MB; (3) "226 MB distilgpt2" replaced by SmolLM2-135M-Instruct q8, ~136 MB (swapped 2026-08-20) in §4.1, §6.1, §10.1; (4) parameter count stated as ~1 M non-embedding / ~3.75 M stored values (7,502,858 bytes) wherever the size appears; (5) "license-checked" removed — upstream model card has no license field (verified 2026-08-22), dataset is CDLA-Sharing-1.0 (§3.5 imposes no obligations on trained models), license request to the author pending; new pre-release-blocker row in §9 and a "done means" line in §10.1; (6) EO 14277 Sec. 1 excerpts added, Sec. 6 quote given with its partnership-directive context, Sec. 2 and Sec. 7 confirmed verbatim; (7) NSF actions added to §2.1 from the journal, all marked secondary; (8) state items marked [secondary] with the journal's URLs; Oklahoma SB 1734 still has no primary URL; (9) §2.3, §4.2 and §5 aligned to the crosswalk — HS-ALG-IM-10 flagged unmapped, CRD-1.A.4 added to §2.3, CA §33548 column and †-marked author extensions added to §4.2; (10) "nothing is stored" replaced by the precise statement (localStorage `itm-lang`; browser cache of weights and tokenizer; no student input stored); (11) SOPIPA sentence added to §8.5; (12) offline-after-reload labelled planned, phase 4, in §6.1, §10.1, §10.2; (13) §6.1 "Tested on" reworded as a target matrix versus what is verified; unsourced "65% Apple" statistic dropped; (14) temperature cap 1.5 annotated against the flagship slider ranges (Gamble 2.0, TheLoop 1.6) and the phase-1 classroom-mode clamp. Also: ED supplemental priority procedural facts and sub-priorities (a)(ii), (a)(ix), (a)(x) added; §2 intro now distinguishes primary from secondary sources; Appendix A extended. | The front-matter drafts were written against primary sources and the build, and found 14 places where this document overstated, misnumbered, or contradicted them. A design document that the teacher guide must quote cannot be looser than the guide. |
