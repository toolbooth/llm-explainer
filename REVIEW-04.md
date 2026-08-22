# 第四篇《为什么 AI 数不出 strawberry 有几个 r》审阅单(REVIEW-04)

给作者的签发材料,三部分:**中文低信心清单**、**claims-care 敏感句逐条引用**、
**开放问题**。文本在 `src/essays/why-it-cant-count/content/{en,zh}.tsx`,蓝图是
`essays/04-why-it-cant-count/OUTLINE.md`,claims-care 八条红线以蓝图为准。

**怎么现场审阅**:registry 里该文仍是 `draft`,不出现在任何列表,但直达
URL 可看:`#/essays/why-it-cant-count`(加 `?mockModel=1` 可离线跑交互,但
数字直方图在 mock 下全归“非数字”;`?lang=zh` 切中文)。页眉有 DRAFT/草稿
徽章,翻 `src/series/registry.ts` 的 status 为 `published` 即上线(徽章自动
消失,列表自动收录)。每节可深链:`#/essays/why-it-cant-count/sec-1` … `sec-4`。

体量:EN 正文(导语+四节+结语,含小标题)**约 1210 词**(同一把尺子量第三篇
得 1216,REVIEW-03 当时报 1198,所以按那把尺子约 1190;章程目标 800–1200),
加四条 widget 注共约 1410 词;中文正文约 **1890 汉字**(加注解约 2190)。

## 切词器实测(2026-08-22,`Xenova/gpt2` 与 `onnx-community/SmolLM2-135M-Instruct-ONNX`,无特殊 token)

两张词表对**词**的刀法几乎一致:`strawberry → st|raw|berry`(两边都是三块;
GPT-2 的 id 是 301/1831/8396,SmolLM2 是 302/1709/9500——页面上第一节与第二节
并排能看到两套编号),带前导空格的 ` strawberry` 两边都是一整块;
`raspberry → r|aspberry`;`hello` 一块;`lollipop → l|oll|ipop` / `l|oll|ip|op`;
`s-t-r-a-w-b-e-r-r-y` 两边都是 19 个 token,一个字母或连字符一个(拼开提示词
之所以成立的根据)。汉字在 GPT-2 里碎成 UTF-8 字节(`定 → å®|ļ`),SmolLM2
少碎一些;`🍓` 两边都是三个字节 token。

对**数字**两张词表截然不同,正文第三节的每一句都以此为据:

| 字符串 | GPT-2(切词机 / nano 模型) | SmolLM2(第二至四节的模型) |
|---|---|---|
| `12` / `123` | 各一块 | `1|2` / `1|2|3` |
| `1234` | `12|34` | `1|2|3|4` |
| `12345` / `123456` | `123|45` / `123|456` | 逐位 |
| `1000000` | `1|000000` | 逐位 |
| `2024` / ` 2024` | `20|24` / `␣2024`(一块) | `2|0|2|4` / `␣|2|0|2|4` |
| `47 * 23` | `47|␣*|␣23` | `4|7|␣*|␣|2|3` |
| 普查 | 一位数 10/10、两位数 100/100、三位数 777/1000 各为一块 | 永远逐位,数字前单独一个空格 token |

所以:所有喂给 SmolLM2 的算术/计数提示词都**以空格结尾**(否则下一个 token
有 45–65% 落在 `\n` 或 `␣` 上,读者什么都看不到);所有预设都是**单行**
(Gamble 的 `<input>` 会吞掉换行)。

## 真模型实测(SmolLM2-135M-Instruct q8;Node 为 onnxruntime-node,括号内为浏览器 WASM 复测)

| 提示词 | 前几名(T = 1,第一个 token) | 判定 |
|---|---|---|
| `Q: How many "r" are in "strawberry"? A: There are ` | 1 19%、2 19%、4 16%、**3 16%**(浏览器:1 19.7、3 18.7、2 17.3) | 答 1,错 |
| `… in s-t-r-a-w-b-e-r-r-y? …` | **3 23%**、2 19%、1 19%(浏览器:3 26.5、4 17.7、1 14.8) | 答 3,对;直方图仍平 |
| `… Spelled out: s-t-r-a-w-b-e-r-r-y. The r's: r, r, r. So there are ` | **3 32%**、2 22%、4 14%(浏览器:3 28.0、2 20.7) | 答 3,对 |
| `Q: How many "z" are in "strawberry"? …`(正确答案 0) | 3 20%、2 18%、1 16%……**0 0.6%** | 它几乎从不答零 |
| banana/a、bookkeeper/e、google/o、mississippi/s 等 | 拼开与否,赢家多半不动 | “拼开”在 135M 只是轻推 |
| `47 * 23 = ` | 4 18、5 16、3 16、1 14(浏览器:5 18.9、4 15.0、1 14.4) | 第一位近乎平 |
| `Q: What is 47 * 23? A: 47 * 23 = ` | **1 62%**、9 13%、8 9% | 量级好猜 |
| `47 * 23 = 10` | 2 18%、4 15%、**8 13%**(浏览器:2 18.3、4 15.3、8 13.3) | 进位那一位平了 |
| `1234 + 5678 = `(正确 6912) | 1 20%、2 17%、4 13%(浏览器:1 25.6、2 16.2) | 6 不在前几名 |
| 贪心续写 | `47 * 23 = ` → 1042(正确 1081);`1234 + 5678 = ` → 1444…;直接问 strawberry → “10”;拼开问 → “3” | 第三节正文引用的两个数 |

浏览器与 Node 的 q8 数值略有出入(`47 * 23 = ` 的第一名一边是 4 一边是 5),
都在“近乎平”的范围内;正文只说“几乎是平的”,没有引用具体名次。

## 十处信心最低的中文处理(请重点过目)

1. **「为什么 AI 数不出 strawberry 有几个 r」**(标题,任务给定的 canonical)
   ——英文标题是 “Why It Can't Count”,中文把 “It” 落实成了「AI」,并把梗
   本身写进标题;h1 无书名号(ZH-REVIEW 全局决定 1);docTitle、registry 三处
   一致。
2. **「模型的感官是 token」**(第一节标题,“Perception Is Tokens”)——
   「感官」偏器官,「感知」偏过程;我取了前者,因为正文把 token 比成眼睛
   的分辨率。备选「感知即 token」(更抽象,少了身体感)。
3. **「切词 X 光」**(第二节标题,“The X-ray”)——标题里中英混排加一个
   字母;备选「给切词拍一张 X 光」(更顺,但长)或「透视切词」(丢了 X 光
   这个贯穿全篇的意象)。
4. **「数一种它只听人描述过、从没见过的动物有几条腿」**(导语,“count the
   legs on an animal it has only ever heard described”)——为了把 “only
   ever heard described” 说清,句子拉长了;备选「数一只它只听说过的动物有
   几条腿」(短,但“只听说过”略弱于“只听人描述过”)。
5. **「字母,终于进了屋」/「把字母请进屋里」**(第二节 p2、结语,“the
   letters are finally in the room” / “getting the letters into the room”)
   ——“in the room” 在英文里有“到场、在场”的习语感,中文的「进屋」偏具象;
   备选「字母终于到场」/「让字母到场」(更准,少了画面)。
6. **「解法跟着机制走」**(第四节标题,“The Fix Follows the Mechanism”)
   ——备选「解法从机制里长出来」(更有劲,多了一个生长比喻)。
7. **「老缝隙还在原处」**(导语,“finds the old seam”)——seam 译「缝隙」,
   保住了第三节「算术在三道缝上都会漏」的呼应;备选「老毛病照旧」(顺口,
   丢了缝的意象与呼应)。
8. **「散场,把字母一个个念出来」**(结语标题,“Exit, Spelling It Out”)
   ——“spelling it out” 双关(拼写 / 说明白),中文「念出来」取了“出声”
   一头,与第四节「数出声来」呼应;备选「散场,把字母拼开」(取“拼写”
   一头,与第二节按钮「拼开问」呼应)。
9. **「数着呢…」**(第二节按钮运行态,“counting…”)——口语到了俏皮的程度;
   稳妥版「正在数…」。
10. **「思维链(chain of thought)」**(第四节 widget 注)——蓝图里原计划
    写成「把过程写出来」避开术语;落稿时觉得这个词已经够普及,给了术语加
    英文。若嫌术语,改回「把过程写出来的那一招」。

另两处排版决定,顺带请拍板:zh 第一节 p1 末尾加了一个括号,一口气交代
「梗只在英文里成立、原词保留英文、模型只读英文、默认输入与你的输入请用
英文」——比前几篇的交代句长;可拆成两句或删掉后半。X 光机的行标签
「你看见 / 它看见」三字对仗,比英文 “you see / it sees” 更像口号,我觉得
合适,但它会出现在每次渲染里。

## Claims-care 敏感句(蓝图红线,逐条引用请签字)

蓝图八条:**切词只是主因之一 / 前沿模型如今多半答对要明说 / 不说“模型笨” /
数字切词的说法必须是实测 / “拼开有用”在 135M 只是轻推 / 只读第一个 token /
token 不是坏东西 / 无意图语言**。以下为落实处,EN 原句 + 中文对应句。

### 1. 切词只是主因之一,不是全部(第三节 p2,正文而非脚注)

> EN: "But the tokenizer is only the first problem, and that needs saying.
> Even with clean single-digit tokens, the model writes its answer left to
> right, one digit per step, with no scratch paper — and the leftmost digit
> has to already account for the carries you would work out last. […]
> Chopped input, sequential output, no working memory: arithmetic fails at
> three seams, and tokenization is only one of them."

> zh: 「可切词器只是第一个问题,老实说得把话说全。就算输入是干干净净的单个
> 数位,模型写答案也是从左到右、一步一位,没有草稿纸——而最左边那一位,得
> 提前把你最后才算的进位都算进去。[…]切碎的输入、顺序的输出、没有工作记忆:
> 算术在三道缝上都会漏,切词只是其中一道。」

> EN(蓝图“payoff”在结语的落点): "Counting, spelling, reversing a word,
> finding a rhyme, adding long numbers — all of it is character work posed to
> a system whose senses stop at the token."
> zh: 「数字母、拼写、把词倒过来念、找押韵、算长一点的加法——全都是字符层面
> 的活,交给的却是一套感官停在 token 上的系统。」

### 2. 前沿模型如今多半答对,明说(导语 p2 + 第四节 p1)

> EN: "Two things first. One: the big assistants now usually get strawberry
> right — this question became famous, it is all over their training data,
> and the products route it to a slower reasoning mode or a calculator. Two:
> the mechanism underneath did not change: the same models still receive
> words as chunks, and the same question about a less famous word, or a
> longer sum, finds the old seam."

> zh: 「开讲之前先说两件事。第一,如今那些大牌助手多半已经能把 strawberry
> 数对了——这道题出了名,训练数据里到处都是,产品也会把这类问题转给慢一点
> 的推理模式,或者干脆丢给计算器。第二,底下的机制一点没变:同样的模型收到
> 的词仍然是一块块碎片,换一个不那么出名的词、换一道长一点的算式,老缝隙
> 还在原处。」

> EN(第四节 p1): "And teach it the famous cases — part of why strawberry
> works today is that strawberry was taught."
> zh: 「再把出了名的那几道题教给它:strawberry 今天能数对,一部分原因就是
> strawberry 这个词,被专门教过。」

全文没有点任何一家前沿模型的名字;「多半 / usually」是有意留的余地。

### 3. 不说“模型笨”:是感官,不是智力(导语 p2 + 第一节 p2)

> EN: "None of this is a machine being dumb. It is a machine being asked to
> count the legs on an animal it has only ever heard described."
> zh: 「这些都不是机器笨。这是让一台机器去数一种它只听人描述过、从没见过
> 的动物有几条腿。」

> EN: "They are the grain of the model's senses, fixed before training
> started, the way your eyes stop at ultraviolet. Perception has a
> resolution. The model's is the token."
> zh: 「它们是模型感官的颗粒度,在训练开始之前就定死了,就像你的眼睛看不见
> 紫外线一样。感知是有分辨率的。模型的分辨率,就是 token。」

> EN(结语 p2): "When a model stumbles on something a child can do, ask
> first whether the child could do it blindfolded, by ear."
> zh: 「下次模型在一件小孩都会的事上绊倒,先问:蒙上眼睛、只靠耳朵,小孩
> 还会不会?」

(“dumb” 全文只出现在这句否定里。widget 的判定行写「答案是 3」「对了」,
不写“错了”“失败”。)

### 4. 数字切词的每一句都是实测(第三节 p1)

> EN: "The GPT-2 vocabulary the Chopper uses has a token for every one- and
> two-digit string and most three-digit ones, so longer numbers break into
> chunks cut from the left: 1234 becomes 12 · 34, 12345 becomes 123 · 45,
> and one million is 1 · 000000. The model in this section goes the other
> way: every number becomes single digits — 1234 is 1 · 2 · 3 · 4 — with a
> bare space token in front. […] Whatever model you use, check how it
> chops."

> zh: 「切词机用的 GPT-2 词表,给每一个一位数和两位数、以及大多数三位数都
> 备了一枚 token,于是更长的数字从左边起按块切:1234 切成 12 · 34,12345
> 切成 123 · 45,一百万是 1 · 000000。这一节的模型反其道而行,把每个数字都
> 拆成单个数位——1234 是 1 · 2 · 3 · 4——前面还单独垫一个空格 token。[…]不管
> 你用的是哪个模型,把算式交给它之前,先看看它怎么切。」

每个数字都在上表里;没有描述任何没跑过的词表。

### 5. “拼开有用”在 135M 只是轻推(第二节 p2 + 第二节注 + 第四节 p2)

> EN(第二节 p2): "Expect humility: this is a small model, close to
> guessing in both modes on most words. What the second panel demonstrates
> is not a cure but a change in the input — the letters are finally in the
> room."
> zh: 「请把期待放低:这是个小模型,在多数词上,两种问法它都接近瞎猜。第二
> 块面板展示的不是药到病除,而是输入变了什么——字母,终于进了屋。」

> EN(第二节注): "This 135M model is mostly guessing in both panels; on
> strawberry the spelled-out version tips the winner to 3 while the
> histogram stays flat. That is the honest size of the effect here. In
> bigger models, the same move is the difference between wrong and right."
> zh: 「这个 1.35 亿参数的模型在两块面板里都基本是在猜;在 strawberry 上,
> 拼开的版本把赢家拨到了 3,直方图却还是平的。在这个尺寸上,效果诚实地说
> 就这么大。在更大的模型里,同一招是答错与答对的分界。」

> EN(第四节 p2): "For our small model the movement is a nudge — the
> winner tips to 3, the histogram stays flat — and that is the honest result
> at this size."
> zh: 「对我们这个小模型,挪动只是轻轻一推——赢家拨到 3,直方图仍然是平的
> ——在这个尺寸上,结果诚实的形状就是这样。」

“In bigger models … the difference between wrong and right” 是对大模型的
概括性陈述(拼开 / 思维链 / 工具在大模型上有效是公认的),没有引具体数字。

### 6. 只读第一个 token(第二节注)

> EN: "Each histogram is the model's bet on the first token after the
> prompt, read over the digits 0–9 at T = 1 — a “1” could be the start of
> “10”. The true count is outlined."
> zh: 「每张直方图都是模型对提示词之后第一个 token 的下注,按数字 0–9 读出,
> T = 1——“1” 也可能是 “10” 的开头。正确答案那一格描了边。」

### 7. token 不是坏东西(第一节 p2)

> EN: "None of these cuts is a decision the model makes, or a mistake —
> pieces keep inputs short and cover every alphabet."
> zh: 「这些刀口,没有一刀是模型自己决定的,也没有一刀是失误——碎片让输入
> 变短,也让任何文字都切得开。」

### 8. 无意图语言

全文对模型的动词:收到、盯着、下注、押、写出、猜;没有 wants / refuses /
ignores / decides。初稿 zh 的 verdictNone 写过「它压根没打算用数字回答」,
「打算」是意图,已改成「它给出的根本不是数字」。第一节 wholeTokenNote 的
「一个词站在哪儿,决定它怎么被切」的主语是位置,不是模型。

### 9. 工具调用只描述、不演示(第四节注)

> EN: "(A real tool call — running "strawberry".count("r") — would leave the
> model entirely; this toy can only predict what such code usually looks
> like.)"
> zh: 「(真正的工具调用——跑一遍 "strawberry".count("r")——会彻底离开模型;
> 这个小家伙只能预测这样的代码通常长什么样。)」

(实测 `>>> "strawberry".count("r")\n` 作为提示词,模型下一个 token 是
`\n` 30% / "```" 28%——它在续写代码块,不是在执行。)

## 开放问题(按重要度)

1. **第三、四节的“唤醒”按钮在第二节唤醒之后仍显示。** Gamble 在渲染时读
   `engine.modelReady()`,第二节唤醒不会触发它重渲染;点一下就秒开(文案
   已写明「秒开」),与第二篇的行为一致。治本要一个页面级/系列级的
   “模型已就绪” store,草稿阶段先不做。
2. **直方图只读第一位。** 正确答案 ≥ 10 时按首位判定(`truthDigit`),注里
   说了“1 可能是 10 的开头”。是否给 X 光机的词长/字母数设上限(比如
   正确答案 ≤ 9 才给判定行)?现在只限词长 40 字符。
3. **Node 与浏览器的 q8 数值不完全一致**(见上表括号),`47 * 23 = ` 的
   第一名一边是 4 一边是 5。正文避开了名次,只说“几乎是平的”;REVIEW 的表
   两套数都留着。
4. **「不管你用的是哪个模型,先看看它怎么切」没有给“怎么看”。** 页面上只
   能看 GPT-2 与 SmolLM2 两张词表;其它模型要靠外部的 tokenizer 页面。要不
   要给一个外链(会破“自包含”)?留给作者。
5. **Chopper 的 lift 改动了第一篇的源码**(`strings`/`htmlId`/`initialText`
   prop,App.tsx 传 `t.act1` + `"act-1"`),第一篇 DOM 已验证逐字节不变
   (EN b5fe4891… / zh c1097d95…),第二篇(2475a779… / 4276ba10…)、第三篇
   (9cb068c3… / 45e18766…)亦然,全部在改动前后各算一次(sha256 of
   `#root` innerHTML,`?mockModel=1`)。`src/series/README.md` §2 的 seam
   说明已更新;WordMap 仍读 `useStrings()`。
6. **引擎新增 `Engine.tokenizeModel`**(SmolLM2 自己的切词器,约 3.4MB,
   X 光机挂载即加载,不碰模型)。mock 引擎下它等于按空格切词,所以
   `?mockModel=1` 时 X 光机上半部显示的是假碎片、下半部直方图全归“非数字”;
   草稿的可见性/哈希测试不需要真权重,数数演示已用真模型在浏览器里验过。
7. **X 光机的字母框接受任何字符**(包括汉字、emoji);词里有汉字时提示词
   仍是英文句式,模型的数字几乎无意义。是否限制为 ASCII 字母?我倾向不限
   ——“汉字碎成字节”本身是第一节的教学点。
8. **版式验证方式。** 浏览器面板在验证过程中大多处于隐藏态,面板截图全黑;
   改用 headless Chrome 截了 EN/zh 桌面版整页(hero、导语、第一节、第二节
   X 光机上半部均正常),并在真实标签页里用 DOM 度量核对:桌面 1280px 下
   两块面板并排(各 312px)、直方图 120px 高、正确答案格描边、无元素溢出
   widget;375px 下 `scrollWidth` = 375(无横向滚动)、面板上下堆叠、每个
   数字格 24px、运行按钮 44px 高。真模型数值在 EN 页逐节读出(见上表);
   zh 页读了标题、徽章、各节标题、X 光机两行、第一节注与页脚。请作者仍
   肉眼过一遍 `.xr-hist` 在窄屏下的观感。
9. **`SERIES.md` 流水线表**第四行写 “blueprint”(与第二、三篇落草稿时一致),
   发布时一并改。
