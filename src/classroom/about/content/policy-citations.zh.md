# 政策引文页——写申报书、答校董会、申请放行时可直接引用的原文

*《机器内部·课堂版》共享前置文档 · 草稿 2026-08-22。*

**用途。** 需要在政策备忘、经费申报或放行申请里说明这套资源合理性的教师或学区协调员，应当能从这一页直接复制一句话并给出出处。下面每一条引文都按所列原始文件的原文给出，并注明核对日期。每个“钩子”后面跟一段“本资源如何对应”——只陈述资源做了什么，不对效果做任何承诺。

**语言说明。** 这些是美国法律与政策文本，引文一律保留英文原文，括号内给出**非官方中文概括**，仅供理解；任何正式文件请引英文。

**核对标记。** *简报，2026-08* = 在 PRODUCT.md §2 所转录的政策研究简报中按原文核对（简报日期不晚于 2026-08-22）。*2026-08-22 复核* = 本草稿当日又对照所列原始来源核对过一遍。*二手来源* = PRODUCT.md 引的是新闻或追踪网站而非原文；正式引用前请先取得原文。

---

## 联邦层面

### 第 14277 号行政令 “Advancing Artificial Intelligence Education for American Youth”（2025 年 4 月 23 日；90 FR 17519）

来源：govinfo.gov/content/pkg/FR-2025-04-28/pdf/2025-07368.pdf;whitehouse.gov/presidential-actions/2025/04/advancing-artificial-intelligence-education-for-american-youth/

- **Sec. 1 首句**——“Artificial intelligence (AI) is rapidly transforming the modern world, driving innovation across industries, enhancing productivity, and reshaping the way we live and work.”（AI 正在迅速改变现代世界……）*（2026-08-22 复核，whitehouse.gov。注意：PRODUCT.md §2 没有引用 Sec. 1；本草稿只核实了这一句首句。引用更多内容前请先取得整节原文。）*
- **Sec. 2**——“It is the policy of the United States to promote AI literacy and proficiency among Americans by promoting the appropriate integration of AI into education, providing comprehensive AI training for educators, and fostering early exposure to AI concepts and technology to develop an AI-ready workforce and the next generation of American AI innovators.”（美国的政策是通过把 AI 恰当地融入教育、为教育者提供全面的 AI 培训、让学生尽早接触 AI 概念与技术，来促进全民 AI 素养。）*（简报，2026-08;2026-08-22 复核。）*
- **Sec. 6**——要求提供 “online resources focused on teaching K–12 students foundational AI literacy and critical thinking skills.”（面向 K–12 学生、教授基础 AI 素养与批判性思维的在线资源）*（简报，2026-08。本草稿 2026-08-22 对 whitehouse.gov 文本的复核返回了不同的 Sec. 6 句子；正式使用前请对照 govinfo PDF 确认措辞。）*
- **Sec. 7**——“professional development for all educators, so they can integrate the fundamentals of AI into all subject areas.”（面向全体教育者的专业发展，使其能把 AI 基础融入所有学科）*（简报，2026-08；与 Sec. 6 同样的提醒。）*

**本资源如何对应。** 它是一套在线资源，主题就是语言模型的基础机制——分词、概率、attention（注意力）、采样、训练数据——以 45 分钟一课的形式教给 9–14 年级学生，每课都以学生评价模型输出收尾，这正是 Sec. 6 那句话里“批判性思维”的那一半。教师指南写到了没有任何 CS 同事的教师也能不经培训直接上课的程度；它本身不提供专业发展，也不声称满足 Sec. 7。

### America's AI Action Plan（2025 年 7 月 23 日）

来源：whitehouse.gov/wp-content/uploads/2025/07/Americas-AI-Action-Plan.pdf

- **Pillar I**——“prioritize AI skill development as a core objective of relevant education and workforce funding streams ... including career and technical education (CTE), workforce training, apprenticeships.”（把 AI 技能培养列为相关教育与劳动力经费的核心目标，包括职业技术教育。）*（简报，2026-08。）*
- **"Encourage Open-Source and Open-Weight AI"**——“many businesses and governments have sensitive data that they cannot send to closed model vendors... the Federal government should create a supportive environment for open models.”（许多企业和政府拥有不能发送给封闭模型供应商的敏感数据……联邦政府应为开放模型创造支持性环境。）*（简报，2026-08。）*

**本资源如何对应。** 模型是开放权重的（TinyStories-1M，公开的研究检查点），推理代码开源；权重下载到设备上，学生输入的任何内容都不会发送到任何地方。课堂是一个存在敏感数据的环境，而这是唯一一份以“敏感数据”为由支持开放模型的联邦文本。各模块按 DOL TEN 07-25 的内容领域打了标签，方便 CTE 教师引用；资源免费，采用它不需要任何经费。

### 美国教育部 Dear Colleague Letter “Guidance on the Use of Federal Grant Funds to Improve Education Outcomes Using Artificial Intelligence”（2025 年 7 月 22 日）

来源：ed.gov/media/document/opepd-ai-dear-colleague-letter-7222025-110427.pdf。*（全部引文：简报，2026-08。）*

| ED 原则（原文） | 本资源做了什么 |
|---|---|
| “Educator-led: AI should support teachers, providers, tutors, advisors, and education leaders.”（以教育者为主导） | 教师指南主导整节课；交互件是演示仪器，不是辅导员。 |
| “Ethical: ... educators should help students navigate AI to be able to evaluate the validity of AI outputs ... to learn with – rather than exclusively from – AI”（合乎伦理：学生要能评价 AI 输出的有效性，“与 AI 一起学”，而非“只从 AI 学”） | 每个模块都以学生对照自己的知识评判模型输出收尾。 |
| “Accessible: AI tools or systems should be accessible for those who require digital accessibility accommodations”（无障碍） | 目标 WCAG 2.1 AA；现状与已知缺口见《无障碍声明》。 |
| “Transparent and explainable: Stakeholders, especially parents, should understand how systems function”（透明、可解释） | 前向传播是约 150 行可读的 TypeScript；解释系统如何工作就是这套资源的全部内容。 |
| “Data-protective: Systems must comply with federal privacy laws including the Family Educational Rights and Privacy Act.”（保护数据） | 没有任何数据离开浏览器；FERPA 立场见《隐私与安全一页纸》。 |

可用经费的表述：经费可用于 “Develop or procure AI-powered instructional tools that adapt to learner needs in real time” 和 "Train educators, providers, and families to use AI tools effectively and responsibly."*（简报，2026-08。）*

**本资源如何对应。** 资源不收费，所以“采购”一说不成立；学区可以把专业发展时间用在采用它上。它不会实时适应学习者需求，也不应被描述成会。

### 教育部长补充优先事项 “Advancing Artificial Intelligence in Education”（2026 年 4 月 13 日定稿，91 FR 18774;2026 年 5 月 13 日生效）

来源：govinfo.gov/content/pkg/FR-2026-04-13/pdf/2026-07087.pdf。*（全部引文：简报，2026-08。）*

- **Priority (a)(i)**——“Support the integration of AI literacy skills and concepts into teaching and learning practices to improve educational outcomes for students, including how to detect AI-generated disinformation or misinformation online.”（支持把 AI 素养融入教学，包括如何识别网上 AI 生成的虚假与错误信息。）
- **Priority (a)(xi)**——“Provide support and training to educators on age-appropriate AI education methodologies that emphasize foundational concepts in AI literacy and critical thinking skills while considering developmental readiness and students' safety factors in AI tool selections in K–12 education.”（为教育者提供符合年龄的 AI 教育方法支持，强调基础概念与批判性思维，并在选择 AI 工具时考虑学生的发展阶段与安全因素。）
- **定义**——“Artificial intelligence (AI) literacy means the technical knowledge, durable skills, civic awareness and future ready attitudes, including AI related ethical reasoning, critical social inquiry, interdisciplinary problem-solving, and creativity, required to thrive in a world influenced by AI. It enables learners to engage, create with, manage, and design AI, while critically evaluating its benefits, risks, and implications.”
- **关于评估**——“AI adoption should not be evaluated solely by efficiency or automation metrics, but by its demonstrated impact on student engagement, learning progress, and readiness for future opportunities.”（AI 的采用不应只用效率或自动化指标评估，而应看它对学生参与度、学习进展的实际影响。）

**本资源如何对应。** 第四模块《它为什么说谎》讲的是语言模型为什么会自信地说错话，这正是 (a)(i) 所说 “AI-generated disinformation or misinformation” 背后的机制。资源的设计属性——无账号、加载后无网络流量、模型只在合成儿童故事上训练——属于 (a)(xi) 要求教育者考虑的那类 “safety factors in AI tool selections”，并写进了《隐私与安全一页纸》供学区审阅。如实地说：ED 明确**拒绝**把免费、开源或隐私保护工具列为联邦优先事项，并表示安全问题“optimally decided at the state and local level”（最好由州和地方决定）[PRODUCT.md §2.1]。联邦层面是原则，不是强制；强制在各州。

### 美国劳工部 TEN 07-25 “Artificial Intelligence Literacy Framework”（2026 年 2 月 13 日）

来源：dol.gov/newsroom/releases/eta/eta20260213。*（简报，2026-08。）*

五个内容领域：*Understanding AI Principles; Exploring AI Uses; Directing AI Effectively; Evaluating AI Outputs; Using AI Responsibly*。七条实施原则，包括 *Enable Experiential Learning*（体验式学习）和 *Embed Learning in Context*（情境化学习）。

**本资源如何对应。** 各模块按内容领域打标签（M1–M3 Understanding AI Principles;M4–M5 Evaluating AI Outputs;M6 Using AI Responsibly），社区学院 CTE 教师可据此引用框架。每个模块的引导探究都在学生自己写的句子上进行，这就是框架意义上的体验式学习。本资源不涉及 *Directing AI Effectively* 和 *Exploring AI Uses*，也不声称涉及。

### 美国国家科学基金会（NSF）

PRODUCT.md §2.1（r2）记录了三项落实第 14277 号行政令的 NSF 行动——NSF STEM K-12 征集（NSF 25-545）、Dear Colleague Letter “Expanding K-12 Resources for AI Education”（现有受资助者可申请最多 30 万美元的补充经费）、以及 2026 年 3 月 19 日给 CSTA 的 1,100 万美元 “Artificial Intelligence Professional Development Weeks” 资助——**每一项都来自二手来源**，并明确写道：本资源不接受任何经费，没有 NSF 对应关系可言（“不要写 'NSF-aligned'”）。在取得征集页面或资助摘要并核实原文之前，请勿在本资源的语境下引用 NSF。`[占位——发布前删除或填写]`

---

## 州层面

每条：引文或条款，然后一句对应说明。

- **加州——教育法 §33548(AB 2876)**[leginfo.legislature.ca.gov,AB 2876;*简报，2026-08*]:AI 素养是 “knowledge, skills, and attitudes related to how AI works—its principles, concepts, and applications—as well as its limitations, implications, and ethical considerations.”（关于 AI 如何工作——原理、概念、应用——及其局限、影响与伦理考量的知识、技能与态度。）**CDE 2025 指南**[cde.ca.gov/ci/pl/aiincalifornia.asp]：“AI should enhance, not replace, the educator's role” 及 “Personally identifiable information (PII) should only ever be entered into closed AI systems since open AI systems do not contain the protections required.”（AI 应增强而非取代教师；个人身份信息只能输入封闭 AI 系统。）**CDE 示范政策（2026 年 6 月 25 日）**[cde.ca.gov/ci/pl/aipolicy.asp]点名 “privacy by design”、“parent and guardian review rights”、“AI literacy as a core academic competency”。*对应：* 本资源的主题就是字面意义上的 “how AI works — its principles”，M4–M6 就是它的 “limitations, implications, and ethical considerations”；输入页面的任何内容都不会进入任何 AI 系统，无论开放还是封闭，PII 规则无从违反；课由教师主导，交互件只做演示。
- **俄亥俄——HB 96 / ORC 3301.24**[education.ohio.gov/Topics/AI-in-Ohio-s-Education/Model-Policy;*简报，2026-08*]：每个学区须在 2026 年 7 月 1 日前通过 AI 政策；ODEW 示范政策涵盖 “PII limits in third-party AI tools” 和 “outlined process for evaluating AI tools from third party vendors”。*对应：* 供应商什么都收不到，评估表里所有数据问题的答案都是“无”；《隐私与安全一页纸》就是按可以直接粘进那套流程来写的。
- **爱达荷——SB 1227**（2026 年 7 月 1 日生效）[*二手来源：* ktvb.com;*简报，2026-08*]：全州分年级段的 “generative AI literacy standards”、数据隐私要求、禁止 AI 取代教师。*对应：* 资源由教师主导、不收集数据；爱达荷分年级段编号公布后，标准映射会随之扩展。
- **犹他——HB 273(2026)**[le.utah.gov/Session/2026/bills/static/HB0273.html;*简报，2026-08*]:CS 标准扩展至 "AI awareness and ethical interaction; AI's role in information filtering and decision-making... critical evaluation of digital sources."*对应：* M4《它为什么说谎》和 M5《为什么数不出 strawberry 有几个 r》就是批判性评价机器生成文本的课。
- **俄克拉荷马——SB 1734(2026)**[*PRODUCT.md 未给出来源链接；引用前请先检索*]：每年向家长披露 AI 工具与学生数据；可无惩罚退出。*对应：* 本资源的披露只有一句——不收集学生数据；退出不付任何代价，因为每节课都有纸质的不插电版本。
- **阿拉巴马——HB 329（2026）；佐治亚——SB 179；密西西比——SB 2294**[*二手来源：* future-ed.org/legislative-tracker-2026-state-ai-in-education-bills;*简报，2026-08*]：毕业须修一门 “that includes AI instruction” 的 CS 课（阿拉巴马：2032 届起）。*对应：* 每个模块都是 1–3 个课时的 AI 教学，按能直接放进现有 CS 课的尺寸设计。
- **德克萨斯**[*二手来源：* winssolutions.org/texas-ai-education-task-force;*简报，2026-08*]：截至 2026 年 8 月 TEA 没有指南；TACC/UT Austin 工作组（2026 年 6 月 17 日）建议 “a phased approach to updating the Texas Essential Knowledge and Skills (TEKS)”。*对应：* 给“有建议、没教材”的老师一套现成资源；TEKS 更新后映射随之扩展。
- **纽约**[nysenate.gov/legislation/bills/2025/A9190;schools.nyc.gov AI 指南；*简报，2026-08*]：没有 NYSED 指南；A9190（待决）将禁止九年级以前的课堂 AI（特定用途除外）；纽约市的 “Traffic Light Framework” 禁止在纪律、分班、评分中使用 AI。*对应与提醒：* 本资源面向 9 年级及以上，不做评分、分班或任何决策功能；在 A9190 待决期间**不**向纽约的初中推广。

**整体背景**[*简报，2026-08*]：截至 2026 年 8 月 21 日，35 个州加波多黎各发布了官方 K-12 AI 指南[aiforeducation.io/ai-resources/state-ai-guidance]；“82% of teachers have not received formal guidance”（82% 的教师没有收到正式指导，Gallup/Walton,2026 年 5 月）[edweek.org/technology/teachers-say-lack-of-ai-guidance-is-a-major-problem/2026/05]。

---

## 写进申报书的两句话（英文原文，附中文概括）

> *Inside the Machine: Classroom Edition* is a free, no-account, open-source set of 45-minute lessons in which a small open-weight language model runs inside the student's own browser, so that students can inspect how a language model tokenizes, weighs and samples text and then evaluate its output — the "foundational AI literacy and critical thinking" named in EO 14277 and the "detect AI-generated disinformation or misinformation" skill named in ED's 2026 supplemental priority (a)(i). No student data is collected, so it is structurally consistent with FERPA, COPPA and state PII rules, and each module is mapped to CSTA 2026, AP CSP, AI4K12 and ISTE standards with a dated verification record.

（概括：一套免费、无账号、开源的 45 分钟课程，一个开放权重的小模型在学生自己的浏览器里运行，学生观察它如何切词、加权、采样，然后评价其输出；不收集任何学生数据；每个模块都映射到 CSTA 2026、AP CSP、AI4K12、ISTE 标准并带有核对日期。）
