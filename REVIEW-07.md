# 第七篇《中文为什么更贵》审阅单（REVIEW-07）

给作者的签发材料，三部分：**英文低信心清单**（注意：本篇倒装——中文是主文本，
EN 是伴写，所以逐条过目的是英文的处理，历史上第一次）、**claims-care 敏感句
逐条引用**、**开放问题**。文本在
`src/essays/why-chinese-costs-more/content/{zh,en}.tsx`（zh 在前，主文本），
蓝图是 `essays/07-why-chinese-costs-more/OUTLINE.md`，claims-care 红线以蓝图
为准。

**怎么现场审阅**：registry 里该文仍是 `draft`，不出现在任何列表，但直达 URL
可看：`#/essays/why-chinese-costs-more`（`?lang=zh` 切中文——本篇请**先看
中文**）。页眉有 DRAFT/草稿徽章，翻 `src/series/registry.ts` 的 status 为
`published` 即上线。每节可深链：`sec-1` … `sec-3`（`sec-4` 是纯散文幕的
锚点）。本篇**从不唤醒任何模型**——整页只要那份共用的 ~2MB 切词器，是全系列
最便宜的一页。一个与前几篇不同的地方：`?mockModel=1` 下两个部件用的是假
切词器（按空格切，中文整句一块），读数没有意义——mock 只服务 CI 与哈希；
现场审阅请直接跑 dev server 用真切词器（就 2MB，秒开）。

体量：EN 正文（导语+四幕+结语，含小标题，同一把尺子——`section.prose` 的
DOM `innerText` 按空白切词，不含 series-more）**约 1209 词**（同尺复测：
第四篇 1194、第三篇 1216、第五篇 1246；章程目标 800–1200，初稿 1332，删一
轮到线附近——超线 9 词，系列里最贴线的一篇，再删就要动实测内容）；中文正文
**1920 汉字**（加两条计价器注与 X 光注 2178）。中文是主文本，密度自然更高，
不设上限（章程只约束 EN）。

## 切词实测（2026-09-15，自托管 GPT-2 词表 `public/tokenizers/gpt2/`，一次性 scratch 脚本；下表全部由 `test/essay7-data.test.ts` 在每次 CI 里对着同一份词表复测，<1 秒，无前向传播——CI 测试就是这份实测的常驻复现，scratch 脚本在数字钉进 CI 后即删）

**语料普查**（十四对，同义、双语各自写自然；语料本体在
`src/essays/why-chinese-costs-more/corpus.ts`，页面预设与 CI 测的是同一个
模块）：

| en | zh | ×比 | 中文句（字数） |
|---|---|---|---|
| 14 | 43 | 3.07 | 同样一句话，换成中文说，价钱就翻了几倍。（20）——**本文开头那句，双语导语逐字引用** |
| 4 | 12 | 3.00 | 你好，世界。（6） |
| 5 | 17 | **3.40** | 我喜欢吃草莓。（7）——语料最贵 |
| 7 | 11 | 1.57 | 今天天气真好。（7） |
| 7 | 14 | 2.00 | 猫坐在垫子上。（7） |
| 5 | 14 | 2.80 | 请把窗户关上。（7） |
| 8 | 15 | 1.88 | 我不明白你的意思。（9） |
| 4 | 13 | 3.25 | 时间就是金钱。（7） |
| 18 | 28 | **1.56** | 从前有一座山，山里有一座庙。（14）——语料最便宜；英文 16 个词（已钉入测试） |
| 7 | 22 | 3.14 | 语言模型按 token 收费。（15） |
| 8 | 16 | 2.00 | 明天早上八点开会。（9） |
| 6 | 16 | 2.67 | 谢谢你的帮助！（7） |
| 8 | 18 | 2.25 | 上下文窗口不是记忆。（10） |
| 7 | 13 | 1.86 | 一分钱一分货。（7） |

合计 en 108 / zh 252，全篮 **×2.33**；逐对分布 ×1.56–×3.40，**中位
×2.46**（十四个值排序后第 7、8 位的均值——测量脚本初版打印的 2.67 是
上中位，正文写进 CI 前已纠正为真中位）。

**字节解剖**（第二幕）：草 → 3 块（è|į|ī）、莓 → 3、我 → 2（æĪ|ĳ）、
**的 → 1 块**（çļĦ——英文语料里漏进的中文足够把头号常用字送上榜）、
。→ 1（ãĢĤ）、，→ 3（ï|¼|Į）；the/and/tion 各 1 块（正文点名的三个英文
常客，已钉入测试）。「我喜欢吃草莓。」= 7 字、21 字节、**17 块**，且
**没有任何一块的文本里含有「草」**（X 光机 insight 的空 carriers 分支——
教学点本身）；ids 逐块 decode 回原句（碎而不失，也已钉入测试）。此数与
课堂版 M1 的 `EXTENSION_STRIP`（7 字 17 块）一致；与第四篇 zh「打一个
emoji，或者一个汉字，看它碎成字节」的说法一致。

**故事对**（第三幕）：en 37 token（158 字符）/ zh 116 token（53 字）——
×3.14；占 2048 窗口 1.8% vs 5.7%（与计价器 `toFixed(1)` 同式）；整篇能装
55 遍 vs 17 遍。

## 现代词表对照（2026-09-15，一次性 scratch 脚本对 hub 上各家公开 tokenizer 文件实测——transformers.js `AutoTokenizer.from_pretrained` 加下表括号里的 repo 名，计数口径 `add_special_tokens: false`、碎块用 `tokenize()`，与 GPT-2 侧同式，十几行即可复建；**未钉入 CI**——CI 只对仓库内文件复测，此表数字的口径是「当日对公开词表实测」，正文与第四幕注均已写明日期与来源）

| 词表 | 全篮 ×比 | 故事 ×比 | 我喜欢吃草莓。 | 草 |
|---|---|---|---|---|
| GPT-2（2019，5 万条，本页的秤） | ×2.33 | ×3.14 | 17 块 | 3 块 |
| cl100k（GPT-4 代，Xenova/gpt-4） | ×1.48 | ×2.05 | 13 块 | 2 块 |
| o200k（GPT-4o 代，Xenova/gpt-4o） | ×1.02 | ×1.08 | 6 块（我\|喜欢\|吃\|草\|莓\|。） | 1 块 |
| Qwen2.5（Qwen/Qwen2.5-0.5B-Instruct） | ×0.80 | ×1.00 | 4 块（我喜欢\|吃\|草莓\|。） | 1 块 |

正文引用的是四个全篮比值与草莓句的 17→13→6→4；o200k 的「草自己一块、
喜欢两字一块」与 Qwen 的「草莓一整块」都以上表碎块为据。cl100k/o200k 是
冻结词表，漂移风险极低；Qwen 若再版可能变——见开放问题 4。

## 十处信心最低的英文处理（本篇倒装：请重点过目 EN 伴写）

1. **"Why Chinese Costs More Tokens"**（标题，SERIES.md 给定的 canonical
   伴题）——registry、docTitle、h1 三处一致；`test/essay7-content.test.ts`
   钉了 en h1。若嫌 "Costs More Tokens" 生硬，备选 "The Tokenizer Tax"
   更顺口但丢掉了与中文主题的镜像，且改动 canonical 需连 SERIES.md 一起。
2. **"The Bilingual Meter"**（widget 名，zh「双语计价器」）——中文「计价器」
   自带出租车打表的画面，EN "meter" 平了一档；备选 "The Fare Meter"（更贴
   打表）、"The Scale"（与 Act 1 标题重复）。
3. **"On the Scale"**（第一幕标题，zh「先过秤」）——丢了「先」的动作感与
   口语感；备选 "The Weigh-In"（拳击称重的画面，可能过头）。
4. **"the ledger was counted in English"**（副题，zh「账本的偏心」）——EN
   放弃了「偏心」的拟人（claims-care 无意图语言反而更稳），但也少了锋利；
   备选 "the ledger plays favorites"（回到拟人，请作者裁）。
5. **"a regular in the vocabulary"**（导语与结语，zh「词表里的常客」）——
   「常客」在中文里一个词就立住，EN "regular" 要到第二幕 "a regulars'
   club" 才补全酒馆常客的画面；若嫌前置突兀，导语可先写
   "a frequent flyer"（另一个画面，但和 club 不接）。
6. **"the scale knows no nationality, only bytes"**（第一幕结句，zh
   「秤不认人，只认字节」）——EN 把「不认人」译成了 nationality，语义
   变窄（原句还有「不看情面」的意思）；备选 "the scale doesn't care who
   you are — only how many bytes you weigh"（更长）。
7. **"The tax never fines you once; it skims every stage."**（第三幕结句，
   zh「这笔税不重罚你一次，它在每个环节抽一点」）——"fines you once" 有点
   怪（fine 本来就是一次性的）；备选 "never hits you all at once"。
8. **"the exchange rate collapses on the spot, even inverts"**（结语 p2，
   zh「汇率当场塌掉，甚至倒挂」）——「倒挂」是财经词（利率倒挂），EN
   "inverts" 保住了这层；但 "collapses" 或让读者以为是坏事——原意是税
   塌掉（好事）。备选 "the premium collapses — and can even flip sign"。
9. **"up the mountain, paying full byte price"**（第四幕结句，zh「小语种
   还在山上，按字节全价买单」）——「山上」在 zh 里接得住（税收、下山的
   隐喻链），EN 里 mountain 无前文指涉，稍显突兀；备选 "still out in the
   cold"（换意象）或删。
10. **"Exit, Closing the Ledger"**（结语标题，zh「散场，合上账本」）——
    与前几篇 "Exit, …" 句式一致（#5 是 "Exit, Lifting the Needle"）；
    "Closing the Ledger" 与全文账本意象收束。低风险，列入只为齐十条。

另两处排版决定，顺带请拍板：（a）本篇 zh 用「」标注字与被引句（「草」
「先过秤」「你好，世界。」），前几篇 zh 引句多用弯引号 “ ”——本篇引的
多是**中文**句子，弯引号在中文里不如直角引号正；若要全系列统一，改回
“ ” 是纯文本替换。（b）计价器的预设 chips 在两种语言下都显示**中文句**
（截断到 12 字）——预设是语料本体（live data），zh 侧就是本体的正面；EN
读者看到中文 chips 是本篇立场的一部分，但若嫌门槛高，可给 chips 加英文
悬浮提示（见开放问题 1）。

## Claims-care 敏感句（蓝图红线，逐条引用请签字）

蓝图八条：**GPT-2 数字全部实测并 CI 钉死 / 语料不挑句并自报分布 / 旧秤
自首、绝不暗示今天 3 倍 / 计价论述限于历史与机制 / 流利度论证打「一部分」
折扣 / 「的」的例外必须报 / 窗口数字绑定 2048 / 无意图语言**。以下为落实
处，zh 主句 + EN 对应句。

### 1. 语料不挑句，分布如实（第一幕 p2）

> zh: 「为了不挑好看的数字，我们过秤的是一整篮句子：十四对……合计下来英文
> 108 个 token，中文 252 个——全篮汇率 ×2.33。逐对看，差价从 ×1.56 到
> ×3.40 不等，中位 ×2.46……」

> EN: "To keep the numbers honest we weighed a whole basket, not a
> highlight reel: fourteen pairs … Total: English 108 tokens, 中文 252 — a
> basket rate of ×2.33. Pair by pair the markup runs ×1.56 to ×3.40,
> median ×2.46 …"

（最便宜与最贵的两对都点名并给出原因；全部十四对钉在
`test/essay7-data.test.ts` 的 PINNED 表里。）

### 2. 旧秤自首在导语，不等到第四幕（导语 p2）

> zh: 「先把丑话说在前面：这是一本旧账本，今天的主流词表已经把这笔税退了
> 大半——那是第四幕的内容，也是本文真正想说的事：这笔税从来不是中文的
> 属性，是一次统计的选择。」

> EN: "Full disclosure: it is an old ledger, and today's vocabularies have
> refunded most of this tax — that is Act 4, and it is the point: the tax
> was never a property of Chinese; it is a statistical choice."

### 3. 绝不暗示「今天还收 3 倍」（第四幕 p2，正面拆弹）

> zh: 「所以别把这一页读成「中文用户正在被三倍收费」——按今天的主流词表，
> 大头已经退了。」

> EN: "So do not read this page as “Chinese users are charged 3× today” —
> on the mainstream ledgers, most of the tax is refunded."

（第四幕 p1 同时交代了口径：「2026 年 9 月 15 日对各家公开词表的实测……
没有钉进本站的 CI」；EN 同句。）

### 4. 计价论述限于逐 token 计价的年代与机制（第三幕 p2）

> zh: 「逐 token 计价的年代，同样的意思，中文的发票就比英文长两三倍——
> 没有谁使坏，是计价单位本身偏了秤。」

> EN: "In the pay-per-token era the same meaning simply invoiced two to
> three times longer in Chinese — nobody scheming, just a unit of account
> with a thumb on the scale."

（不点任何现役产品、不断言任何现行价格比；两三倍与实测 ×2.33/中位
×2.46/最高 ×3.40 相容。）

### 5. 流利度是机制论证，打了折扣（第三幕 p2）

> zh: 「早年的模型说中文笨手笨脚，一部分原因就在这里——它不是在读字，
> 是在读字节碎片，同一扇窗口里装得下的中文上下文也更少。」

> EN: "early models were clumsy in Chinese partly for this reason — they
> were reading byte crumbs, not characters, with less 中文 context fitting
> in the same window."

（「一部分/partly」是红线要求的折扣；无数字，无现役模型。）

### 6. 「的」的例外（第二幕 p2——防止读者带走「汉字都是三块」）

> zh: 「税率在中文内部也不均：头号常用字「的」居然挣到了整块……句号「。」
> 也有整块，全角逗号「，」却要三块。同一本账，常用字打折，生僻字全价。」

> EN: "And the tax is uneven inside Chinese too: 的, the most common
> character, earned a whole piece … the period 。 has one; the comma ，
> costs three."

### 7. 窗口数字绑定 2048，并交代比例不变性（第三幕注）

> zh: 「2048 是本页小模型真实的窗口尺寸；产品里的窗口更大，但分子分母
> 同乘一个常数，比例不动。」

> EN: "2048 is this page's model's real window; product windows are bigger,
> but numerator and denominator scale together — the rate stands."

### 8. 无意图语言

切词器的动词：扫、数、拼、切、报数；两处人格化都是职业隐喻而非心智——
「它只是个点票员：谁常见，谁便宜」（EN "It is a teller: frequent is
cheap"）与「切词器没有立场」（EN "The tokenizer has no opinions"，本身就
是无意图声明）。「账本的偏心」只出现在副题（修辞位），正文用「以英文为主
的语料」陈述来源。

## 开放问题（按重要度）

1. **预设 chips 的语言**。计价器 chips 两个 locale 都显示中文句（live
   data 的正面）；EN-only 读者要点开才看见英文侧。要不要给 chips 加
   `title` 悬浮或双行显示？我倾向保持——「中文是主角」是本篇的立场，
   chips 是立场的一部分。
2. **第四幕数字未钉 CI**（设计决定，蓝图红线允许）。cl100k/o200k 是冻结
   词表，基本不会漂；Qwen2.5 若模型再版理论上可变。想钉死需要把三份
   tokenizer.json（各 3–7MB）vendor 进仓库——为四个引用数字加 15MB，我
   判断不值。折中：复测方法与 repo 名全部记录在上文对照表表头（十几行
   脚本即可重建；测量脚本本身是一次性 scratch，未保留）。
3. **mock 模式下计价器读数无意义**（mock 切词按空格，中文整句一块，比值
   ×0.1 级），与前几篇「mock 下交互可看」不同。mock 只服务 CI/哈希（初始
   DOM 确定、两次连续运行哈希逐字节一致，已验证）；要不要在 mock 下加一条
   「假切词器」提示？加了会改 DOM 基线，我建议不加。
4. **语料对 #10 的中文句里有拉丁词**（「语言模型按 token 收费。」）——
   技术中文的自然写法（与全系列 zh 保留英文术语的纪律一致），但它把这一对
   的 zh 计数抬高了（22 块里有 token 一词的份）。删换会动 CI 钉的数字，
   且「token 在中文里也要按外来词付费」本身是个诚实的小注脚。请作者裁。
5. **故事对的人名音译**（汤姆和莉莉）。「同一个故事」的对齐方式选了音译
   （中文儿童书惯例）；若换成本土名（小明小丽），「同义」就打了折扣。
   蓝图与第三幕注都交代了。
6. **o200k 的英文全篮是 107 不是 108**（GPT-2 是 108）——现代表格只引比值
   不引绝对数，无句子骑在这 1 token 上；表中比值按各自分母算，如实。
7. **X 光机的「盯住哪个字」框接受任何字符**。中文字下 carriers 恒空（教学
   点），但读者若粘贴英文词，走的是第三分支（「这一个挣到了整块待遇」）
   ——三个分支的文案都写了并有测试，但英文词场景在本篇语境里略显跳戏。
   可选：把预设换句时 letter 自动跟随。5 行改动，我没做。
8. **计价器 token 区最高 220px 内滚**（长文本时中文侧 116 块会滚动）——
   故意的：不让 zh 侧把页面推成两屏。故事预设下请作者肉眼过一遍观感。
9. **版式与浏览器复核**。真切词器 dev server 实跑：双页标题、四幕标题、
   徽章、读数齐全；计价器两实例读数 14/43（×3.07）与 37/116（×3.14）、
   X 光 insight 空-carriers 分支、17 块碎片均与 Node 实测逐字一致；375px
   下 `scrollWidth` = 375，计价器塌成单列。`npm run check:hashes` 全 12 行
   通过（旧 10 行逐字节复现）。
10. **SERIES.md 流水线表**第 7 行写 "blueprint"（与前几篇落草稿时一致），
    发布时一并改 `published` 并把行内状态更新；backlog 第 7 行已标
    built 2026-09-15。
