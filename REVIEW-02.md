# 第二篇《它为什么说谎》审阅单(REVIEW-02)

给作者的签发材料,三部分:**中文低信心清单**、**claims-care 敏感句逐条引用**、
**开放问题**。文本在 `src/essays/why-it-lies/content/{en,zh}.tsx`,蓝图是
`essays/02-why-it-lies/OUTLINE.md`,claims-care 五条红线以蓝图为准。

**怎么现场审阅**:registry 里该文仍是 `draft`,不出现在任何列表,但直达
URL 可看:`#/essays/why-it-lies`(加 `?mockModel=1` 可离线跑交互;
`?lang=zh` 切中文)。页眉有 DRAFT/草稿 徽章,翻 `src/series/registry.ts`
的 status 为 `published` 即上线(徽章自动消失,列表自动收录)。
每节可深链:`#/essays/why-it-lies/sec-1` … `sec-4`。

体量:EN 正文(导语+四节+结语)**922 词**,加 hero 与四条 widget 注
共 1104 词(章程目标 800–1200);中文正文约 **1490 汉字**(加注解约 1780)。

## 十处信心最低的中文处理(请重点过目)

1. **「没有说话人的虚构」**(intro,“confabulation without a speaker”)——
   confabulation 没有现成中文,意译丢掉了术语性;备选:「无主的虚构」,
   或首次出现加注「confabulation(虚构症式的编造)」。
2. **「它没有不赌这个选项。」**(§1,“It cannot not bet.”)——原文双重否定
   的拗劲没保住;备选:「它做不到不下注。」(更贴,但句子发闷)。
3. **「拒绝不了的赌局」**(§1 标题,“The Bet It Can't Refuse”)——原文暗埋
   《教父》“an offer he can't refuse”;中文观众未必接到这层;备选:
   「推不掉的赌局」。
4. **「安全吊牌」**(§3/§4,“safety tag”)——先译「安全牌」被我否掉(中文
   里是"打安全牌"的稳妥义);现译「像安全吊牌一样拴在工具上」直白但略生造;
   备选:「警示吊牌」。§4 开头「吊牌再挂一次」与之配套。
5. **「一根条一柱擎天,其余矮成一排」**(§4,“one bar towering, the rest
   cowering”)——towering/cowering 的韵脚只补了对仗没补韵;「一柱擎天」
   语域偏高,可能过火;备选:「一根条鹤立,其余全蹲着」。
6. **「一委员会的小条面面相觑」**(§4,“a committee of small bars shrugging
   at each other”)——量词活用(一委员会的)是险棋;稳妥版:
   「一整个委员会的小矮条,面面相觑」。
7. **「破绽」贯穿全文对译 “tell”**(赌桌术语:对手泄底的小动作)——
   中文丢了赌桌语域,换来的是「看破绽」的武侠语域;备选「马脚」更口语,
   但「揣好两个马脚」不通,标题就得重写。此为全文级决定。
8. **「土办法」**(hero 副题,“two honest tricks”)——honest 的「不玄乎、
   不装神弄鬼」义取了「土」,添了自贬的幽默;素版:「两个实打实的办法」。
9. **「带一股童话味」**(§2,“charmingly story-flavored”)——charmingly
   丢了;补上就腻(「可爱地带着童话味」);现版赌的是「一股…味」自带俏皮。
10. **「以讹传讹」+「滚瓜烂熟」**(§3,“a misconception half the internet
    repeats” / “a falsehood the model learned well”)——两个成语替换了原文
    的直白句;信息等价,语域变文;素版:「半个互联网都在重复的错误」。

另两处非译文的排版决定,顺带请拍板:zh 的 §3 正文直接说「先点 France
预设,再点 Atlantis」(预设词条保持英文,第一节末尾已向读者交代);
kicker 沿用系列页的「互动长文系列」而非另起名号。

## Claims-care 敏感句(蓝图红线,逐条引用请签字)

蓝图五条:**机制≠成因 / 无意图 / 熵非测谎仪 / 重掷是启发式 / 并非不可修**。
以下为落实处,EN 原句 + 中文对应句。

### 1. 机制 ≠ 前沿模型幻觉的成因(蓝图要求写进正文,不入脚注 → 在 §2 p2)

> EN: "What you're watching is the *sampling mechanism* — how any output,
> true or false, gets produced. It is not a diagnosis of why some frontier
> model invented a court case last week: those failures also involve
> training data, human-feedback fine-tuning, retrieval — moving parts our
> toy doesn't have. What the mechanism explains is why making-things-up is
> the *default* that big models must be trained away from, not the accident
> report for any particular fabrication."

> zh: 「你看到的是采样机制——任何输出,不管真假,都是这么生产出来的。
> 它不是上周某个前沿模型编造判例的事故鉴定书:那种翻车还牵扯训练数据、
> 人类反馈微调、检索——一堆我们这个玩具没有的活动部件。这套机制解释的
> 是,为什么"编"是大模型出厂的默认动作,得靠训练一点点扳回来——而不是
> 任何一次具体翻车的原因。」

### 2. 无意图 / 拆掉标题(蓝图:disarm it early → intro p2 + 结语 p1)

> EN: "A lie needs a liar — someone who knows the truth and steers you away
> from it. The machine below has nothing to steer you away from: no
> beliefs, no intent, no private stash of facts it is choosing to hide.
> What it produces when it 'lies' is stranger than dishonesty —
> **confabulation without a speaker**."

> zh: 「说谎,得先有个说谎的人:他知道真相,还故意把你往岔路上引。下面
> 这台机器无路可引——没有信念,没有意图,没有一个私藏事实的小抽屉。」

> EN(结语): "Hallucination isn't the machine breaking; it is the machine
> working, in a place where plausibility and truth happen to disagree. No
> intent. No deception. Dice."

> zh: 「幻觉不是机器坏了,是机器在正常干活……没有意图,没有骗局。骰子而已。」

### 3. 重掷一致 = 可错的启发式(§3 p2 + widget 注 + 一致率读数)

> EN: "*agreement is a heuristic, not a proof*. A falsehood the model
> learned well — a misconception half the internet repeats — re-rolls just
> as consistently as a fact. Five samples at one temperature is a probe.
> Scatter is strong evidence of dice; stability is only weak evidence of
> truth."

> zh: 「一致是启发式(heuristic),不是证明。……同一温度下的五个样本,
> 是一根探针,不是一纸判决。四散,是骰子的强证据;稳定,只是真话的弱证据。」

> EN(一致率读数): "Agreement across rolls: N%. Stable spans are
> *candidates* for memory — not certificates of truth."
> zh: 「五次重掷的一致率:N%。稳定的片段是"像记忆"的候选——不是真话的证书。」

> EN(widget 注,对齐算法的自我披露): "The alignment is deliberately naive —
> token-by-position — so a shared answer that shifts by a word can read as
> scatter. It errs on the side of suspicion, which is the right side for a
> tell."

### 4. 熵不是测谎仪(§4 p2)

> EN: "shape is a tell, not a truth-meter. Models are routinely confidently
> wrong; calibration varies by model and by domain; a popular misconception
> can be peaked as perfectly as a fact. Sharp means the model has seen this
> movie many times. It does not mean the movie was a documentary."

> zh: 「形状是破绽,不是测谎仪。模型经常错得信心十足;校准(calibration)
> 因模型、因领域而异;一个流传够广的误解,能顶出和事实一样漂亮的尖。」

### 5. 并非不可修(结语 p2)

> EN: "None of this is a life sentence. Retrieval grounding — letting the
> model look things up before it bets — and calibration training measurably
> reduce confabulation. This essay explains why the *default* behavior
> needs that help, not why help is impossible."

> zh: 「这不是无期徒刑。检索接地(retrieval grounding)……都能实打实压低
> 虚构率。这篇文章解释的是默认行为为什么需要这些帮助,不是帮助为什么不可能。」

### 6. 防越界的两句加固(不在蓝图清单里,但同属红线精神)

> EN(§1 p2,防「模型说不出不知道」的过度主张): "nothing stops a model
> from writing 'I don't know' — those are tokens too, and training can make
> them likely."

> EN(§1 widget 注,claim 限定在这一层): "That isn't a flaw bolted on
> later — **at this layer**, betting is the only move the mechanism has."

> EN(§2 widget 注): "Fluency is the mechanism working; truth was never
> one of its inputs."

## 开放问题(按重要度)

1. **工作区里有一份未提交的分词器修复(不是本次提交的一部分)。**
   本次动工时,工作区已有并行会话留下的未提交改动:`src/lib/engine.ts`
   拆成双分词器(nano 走 GPT-2 BPE,Act-4 大模型走自己的),`Gamble` 的
   两处 `decode` 改 `decodeModel`,外加 en/zh 第四幕导语的一句改写
   (这句会改变第一篇字节,故不能进我的提交)。我把这些原样留在工作区,
   并把 `Gamble`/`ReRoll` 的 `decodeModel` 适配同步到了树上(未提交)。
   **该修复落地时,ReRoll.tsx 第 57 行的 `decode` 要一并迁到
   `decodeModel`(树上已是,提交里不是)。**
2. **§2 的语义正确性依赖上述修复。** 自 7430a39 换 SmolLM2 分词器起,
   TheLoop/WordMap 用大模型的分词器喂 GPT-Neo 词表的 nano 模型,id 空间
   错位(第一篇的既有问题,为守住字节不变没有动)。修复落地前,§2 的
   实际输出不可靠;落地后请用真权重过一遍。
3. **童话模型写 "References: [1]" 的实际观感未经真权重验证。**
   TinyStories 没见过书目;文案已预先对冲(「带一股童话味」「story-
   flavored」),但请作者用真模型跑一遍,不行就换预设(比如给 §2 换成
   讲故事中途索引用的变体,或直接在正文再压一句期望)。
4. **§3/§4 预设在真模型上的演示效果未验证。** SmolLM2-135M-Instruct 裸
   补全 "The capital of France is" 是否给出干净的 " Paris" 尖峰、Atlantis
   是否够平,决定两节的说服力;mock 模式只验证了交互。若效果弱,换
   预设词即可(内容表里没有预设,改 `WhyItLies.tsx` 常量)。
5. **ReRoll 的成本**:5×12 次 135M 前向,普通硬件约 10–40 秒;有逐 token
   渐进渲染兜底。K/MAX_NEW_TOKENS/T 都是 `ReRoll.tsx` 顶部常量。
6. **三个模型闸门互不感知。** §1 唤醒后,§3/§4 的闸门仍在(共享 engine,
   但组件不重渲染),点一下即瞬时通过;闸门文案已写明「在第一节唤醒过
   就是瞬间的」。要根治得加一个共享 readiness store,草稿阶段先不做。
7. **对齐算法故意朴素**(按位置逐 token),整体后移一词会被记为四散——
   widget 注里已向读者披露,测试(`agreement.test.ts`)钉住了这一偏差。
   要更聪明的对齐(LCS 等)是发布前的可选升级,但会稀释「探针不装神」
   的姿态。
8. **英文页脚**:第一篇 EN 页脚仍写 “中文版 in the works”(字节不变
   约束,未动;ZH-REVIEW 已提过)。第二篇页脚没有此句。
