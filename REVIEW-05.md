# 第五篇《为什么它复读》审阅单（REVIEW-05）

给作者的签发材料，三部分：**中文低信心清单**、**claims-care 敏感句逐条引用**、
**开放问题**。文本在 `src/essays/why-it-repeats/content/{en,zh}.tsx`，蓝图是
`essays/05-why-it-repeats/OUTLINE.md`，claims-care 红线以蓝图为准。

**怎么现场审阅**：registry 里该文仍是 `draft`，不出现在任何列表，但直达
URL 可看：`#/essays/why-it-repeats`（加 `?mockModel=1` 可离线跑交互——复读机
在 mock 下贪心会输出 “ floor” × 40，采样用固定种子，均为确定性；
`?lang=zh` 切中文）。页眉有 DRAFT/草稿徽章，翻 `src/series/registry.ts` 的
status 为 `published` 即上线。每节可深链：`#/essays/why-it-repeats/sec-1` …
`sec-3`（`sec-4` 是纯散文幕的锚点）。本篇全程只用共享的 7.5MB nano 模型
（复读机 = TheLoop 机器 + 贪心开关 + 重复检测；第二幕是 Gamble 的
`model: "nano"` 档，教室版席位第一次被正篇启用），**从不唤醒大模型**。

体量：EN 正文（导语+四幕+结语，含小标题，同一把尺子——`section.prose` 的
DOM 文本）**约 1240 词**（第三篇同尺 1216、第四篇约 1210；章程目标
800–1200，初稿 1478，两轮删到 1240，再删就要动实测内容），加三条 widget
注约 1490；中文正文约 **2156 汉字**（第四篇约 1890——本篇数字多，中文密度
天然高一截，请作者裁）。

## 真模型实测（2026-09-15，TinyStories-1M fp16 权重 + 自托管 GPT-2 切词器，Node 端 nano-lm 前向；浏览器端已抽查复现，见开放问题 10）

**贪心循环普查**（每条 80 个新 token，普查过的其余提示词见下）：

| 提示词 | 贪心续写的循环 | 判定 |
|---|---|---|
| `Tom and Lily went to the park.` | “They slid down the slide.” × 2（第 32 个 token 处完成）；缓一段后 **“It was red and blue.” × 5**（6-token 一圈，起于第 47 个生成 token），第六圈散架成 “It was not…” | 正篇第一幕的预设与叙述 |
| `The man said` | 先 “You have to be careful and listen to me.” × 2，随后 **“You have to be careful and respectful.” × 3**（8-token 一圈，起点 55/63/71），第 80 个 token 仍在念 | 第三幕的预设 |
| `The bird flew up.` | “The bird flew away, but the bird was …” 准循环 × 4（too/still/still/safe 微变），然后自己写出大团圆并输出 `<|endoftext|>`（67 个 token 处收尾） | 第一幕“自己晃出来”的例证 |
| `The cat sat on the mat.`（×1 与 ×2） | 不复读这句话——续写正常故事；×2 之后照样讲下去 | 诚实结论：这个尺寸的模型**很少**复读你的句子 |
| 其余 12 条常规开头（Once upon a time / One day… / The dog ran. 等） | 60 个 token 内多数不成环；散见二连重复 | 循环不是必然，是贪心的“招牌”失败 |

**自我强化（第二幕的数字）**——`The cat sat on the mat.` 重复 k 遍后：

| k | “ The” 条（widget 同款 top-10、T = 1 重归一） | 整句原样返场的概率（全 softmax 连乘） |
|---|---|---|
| 1 | 26.3%（第一名是 “ She” 28.2%） | 0.0002%（约五十万分之一） |
| 2 | **50.9%** | 0.0079%（约一万三千分之一） |
| 3 | **59.1%**（“\n” 条 1.3% → 3.4% → 6.1%） | 0.0362% |
| 4 | — | 0.0808%（约一千二百分之一；k=1 → k=4 共 ×404） |

**循环内部的每圈存活率**（第三幕）——`The man said` 贪心走到圈上，对每圈
8 个位置的 logits 用 widget 同款采样器（`softmaxTopK(k=8, T)`）连乘：

| 圈 | T=0.2 | T=0.3 | T=0.5 | T=0.8 | T=1.0 | T=1.3 |
|---|---|---|---|---|---|---|
| 第一圈后 | 42.3% | 28.4% | 10.6% | 1.7% | 0.5% | 0.1% |
| 第二圈后 | 63.4% | 43.4% | 16.2% | 2.5% | 0.8% | 0.2% |
| 第三圈后 | **76.3%** | **54.5%** | 20.8% | 3.2% | 0.9% | 0.2% |

每一列自上而下都在涨——自我强化在活循环里的样子；正文引用的是 T=0.3 的
28→43→55 与第三圈后的 55%/21%/3.2%/0.9%。

**定种子出逃实验**——语境 = 提示词 + 前 71 个贪心 token（74 个 id，止于
“…and respectful.”），继续采样 14 个 token，`mulberry32(9000+r)`，r=0…11；
“念下去”= 14 个 token 全部等于逐位 argmax：

| T | 念满 14 个 token 的次数 | 逃逸样本（真实输出，正文引用了其中两条） |
|---|---|---|
| 0.3 | 5/12 | “You have to be careful and respectful. You have to listen to me”；“…You can be careful and respectful” |
| 0.6 | 0/12 | “You can have fun and do what you do.”\n\nLila”；“…You are not mean to each” |
| 1.0 | 0/12 | “You can also be careful. You can have fun and play. I”；“Next time, you will be careful and respectful to each other.”” |

另一实测细节（第二幕结尾的“散场的锣”）：把 “She was happy to see the sun
and the sun.” 连写两遍作提示词，贪心下一步直接给出 `\n<|endoftext|>`——
复读之后最像的事是把故事收尾。

以上全部由 `test/essay5-data.test.ts` 在每次 CI 里对着真权重重测（约 8 秒，
贪心行走 + 概率连乘逐条断言）；`test/loops.test.ts` 用合成序列测重复检测器
本身。

## 十处信心最低的中文处理（请重点过目）

1. **「为什么它复读」**（标题，任务给定的 canonical）——registry、docTitle、
   h1 三处一致；h1 无书名号（ZH-REVIEW 全局决定 1）。备选「它为什么复读」
   （与第二篇「它为什么说谎」句式对仗）、backlog 里的旧题「它为什么开始
   复读」。若改，三处 + `test/essay5-content.test.ts` 的断言一起改。
2. **「复读机」**（widget 名，EN “The Parrot”）——两个语言用了两个意象：
   英文鹦鹉、中文复读机（中文互联网的现成梗，导语顺势认领「中文互联网早就
   给这类行为起好了名字」）。我认为这是 rewrite-not-translate 的正当发挥；
   若嫌意象分叉，zh 也可叫「鹦鹉」，但会丢掉全文最顺手的一个本土词。
3. **「跳针」**（第一幕标题，EN “The Groove”)——唱片意象贯穿三幕
   （跳针 / 槽越磨越深 / 晃一晃唱针 / 散场抬起唱针）；「跳针」在中文里
   本身就指“卡在一句上反复”。备选「卡槽」（更字面，少了乐感）。
4. **「槽越磨越深」**（第二幕标题，EN “The Groove Deepens”）——「槽」承
   唱片纹路，「磨」带出“越走越深”；正文警句「槽是磨出来的，也是越磨越
   深的」同源。备选「越读越顺」（丢了唱片线）。
5. **「念经」**（贪心复读的动词，导语与第二、三幕多处）——比 EN “chant”
   多一点戏谑，且有宗教联想的风险；我认为在“机器行为”语境里安全。稳妥版
   全部换「复读」，但会在一段里连用四次。
6. **「吃着药呢」**（导语 p1，EN “medicated, not cured”）——口语到了俏皮
   的程度；稳妥版「这病不是好了，是被药压住了」。
7. **「一笔在位税」**（第四幕 p1，EN “a tax on incumbency”）——政治学词
   直译；备选「给已经出场的词加税」（更长更平）。
8. **「返场测量仪」**（第二幕 widget 标题，EN “The Encore Meter”）——
   「返场」取演出 encore 的意象，与 p2 的「三次返场」呼应；备选
   「安可计」（更怪）、「复读压力表」。
9. **「散场，抬起唱针」**（结语标题，EN “Exit, Lifting the Needle”）——
   与前四篇「散场，……」句式一致；「抬起唱针」是唱片线的收束。
10. **「骰子会兴高采烈地编造文献」**（结语 p2，EN “dice happily invent
    citations”）——给骰子安了情绪，是修辞不是机制陈述（EN 同样如此），
    与第二篇的账单意象呼应；另第三幕 p2 的「它们只是不肯每一次都走第一名
    那条路」的「不肯」同理（EN “decline”）。若嫌拟人，改「骰子照样会掷出
    编造的文献」/「它们只是不会每次都走第一名」。

另一处排版决定，顺带请拍板：zh 导语 p2 结尾括号一句交代「预设一律是英文
——这个小模型只读过英文童话」（EN 版本这轮删掉了对应句，因为英文读者没有
这个疑问；zh 保留）。与第四篇的处理一致，但两语不再逐句对应。

## Claims-care 敏感句（蓝图红线，逐条引用请签字）

蓝图七条：**循环全部实测 / 有限状态论述是条件句 / 自我强化按实测大小说 /
出逃数字绑定采样器 / 产品论述克制 / 惩罚会误伤 / 无意图语言**。以下为
落实处，EN 原句 + 中文对应句。

### 1. 有限状态的陷阱是条件句，且承认小模型会晃出来（第一幕 p2）

> EN: "The fraying matters. A model choosing from only its last few words
> would be trapped by one revisit, forever — a deterministic map over
> finitely many states has nowhere new to go. Ours rereads the *whole*
> growing text, position and all, so each lap is a slightly different state
> and a small model can wobble out — the bird preset even chants its way to
> a happy ending and stops. Bigger models, better at holding the pattern,
> historically locked in harder."

> zh: 「这个散架值得看一眼。假如模型只看最后几个词来选下一个词，那么状态
> 一旦重现，它就永远出不来了——一张确定性的地图铺在有限的几个格子上，无路
> 可走。而我们的模型每一步都重读整段越来越长的文本，位置也算数，所以每一
> 圈都是一个略有不同的状态，小模型有机会自己晃出来——小鸟那个预设甚至一路
> 复读到大团圆，然后自己收了尾。更大的模型握得住花样，贪心之下历来锁得
> 更死。」

（“It was red and blue.” 的第六圈散架、鸟的 `<|endoftext|>` 都在实测表里；
「历来锁得更死」由第一幕注的 Holtzman et al. 2020 具名背书，且明说是
greedy 和 beam search 下的 GPT-2，不点任何现役产品。）

### 2. 自我强化按实测大小说，强版本归给大模型（第二幕 p2 + 注）

> EN: "…climbs from one in half a million (one copy) to one in thirteen
> thousand (two) to one in twelve hundred (four) — four hundred times
> stronger in three encores, and still a long shot — so *this* parrot
> rarely echoes your sentence, preferring ruts of its own (Act 1's red-blue
> chant). In large models the same climb — the literature's
> **self-reinforcement** — gets steep enough to capture the whole
> continuation."

> zh: 「从一句时的约五十万分之一，爬到两句时的一万三千分之一，再到四句时
> 的一千二百分之一——三次返场，力道涨了四百倍，却仍然是个小概率。所以这只
> 复读机很少复读你的句子，它更爱磨自己的槽……在大模型里，同样这条实测的
> 爬升——文献管它叫自我强化（self-reinforcement）——能陡到把整段续写都
> 吞进去。」

> EN（注）: "…the percentages quoted in the prose are this model's,
> measured; Xu et al. 2022 (“Learning to Break the Loop”) measured the same
> climb in much bigger models, where it is steeper."

### 3. 出逃数字绑定这个采样器、这个循环（第三幕 p1 + 注）

> EN: "Measured from inside that chant with this widget's own sampler: at
> T = 0.3 another full lap survives the dice about half the time (55%); at
> T = 0.5, once in five; at T = 0.8, once in thirty; at T = 1, once in a
> hundred."

> zh: 「在那个循环内部、用这个部件自己的采样器实测：T = 0.3 时，再完整念
> 一圈的概率约一半（55%）；T = 0.5，五分之一；T = 0.8，三十分之一；T = 1，
> 百分之一。」

> EN（注）: "The sampler is top-k = 8 temperature sampling (essay #1's Act
> 5 machinery); the survival percentages in the prose were measured with
> exactly this code on exactly this loop. In twelve seeded runs at T = 0.3,
> five chanted straight through fourteen tokens; at T = 0.6 and T = 1, none
> did — seeds and escape transcripts in the repo's review notes."

（没有任何一句说“调温度就治好复读”；第三幕 p2 明说骰子不知道槽在哪，
结语把高温的代价交还给第二篇。）

### 4. 产品论述克制：铺平，不是填上（第四幕 p2）

> EN: "It is also why your assistant rarely chants: sampling defaults and
> penalties tuned for you, fine-tuning that marks repetition down. The
> groove is paved over, not filled in. The mechanism underneath is
> unchanged, which you can verify: you just did, on a model with the paving
> stripped away."

> zh: 「这也是你的助手如今很少复读的原因：采样默认值替你调好了，惩罚替你
> 配好了，微调也给复读的答案打了低分。槽被铺平了，不是被填上了。底下的
> 机制原封未动——这一点你可以亲自验证，因为你刚刚就在一个没铺路的模型上
> 验证过了。」

（全文不点任何一家前沿模型的名字；导语的「吃着药呢」与此同调。）

### 5. 惩罚会误伤，正文说而非脚注（第四幕 p2）

> EN: "Every bottle has side effects, because not all repetition is
> disease: a heroine must keep being named Lily, code and shopping lists
> repeat lawfully, and cranked penalties make a model dodge words it
> needs."
> zh: 「每瓶药都有副作用，因为不是所有重复都是病。女主角得一直叫 Lily；
> 代码和购物清单重复得理直气壮；惩罚拧过头，模型就开始躲它正当需要的词。」

### 6. 无剧本承诺（widget 判定行 + 图例，两处 UI 文案）

> EN: "Detected in this run: “…” × N — found in the output, not scripted."
> / " — same color, same phrase, found in the actual output (never
> scripted)."
> zh: 「这一轮检测到：“…” × N——从输出里找到的，不是剧本里写好的。」/
> 「——同一短语，同一颜色，全部来自模型真实的输出（绝无剧本）。」

（实现上也是如此：高亮与判定都来自 `loops.ts` 对刚生成 id 序列的检测，
预设只是提示词字符串。）

### 7. 无意图语言

全文对模型的动词：念、续写、掷、押、收尾、栽进；没有 wants / refuses /
decides。两处拟人修辞（骰子「兴高采烈」「不肯」）见中文清单第 10 条，
对象是骰子的隐喻而非模型的心智，请作者裁。

## 开放问题（按重要度）

1. **第三幕的判定行引的是 ×5 的“词干”，正文引的是 ×3 的整圈。**
   `findRepeats` 按覆盖 token 数选主导重复：`The man said` 跑到 80 个
   token 时，“. You have to be careful and” 非重叠出现 5 次（35 token），
   盖过整圈 “You have to be careful and respectful.” × 3（24 token），
   所以判定行是「“. You have to be careful and” × 5」——它同时数进了
   “listen to me” 那两圈，作为“复读了多少”的总结其实更完整；正文的
   「八个 token 一圈，已经三圈」是对循环本体的描述。两句都真。若作者
   希望判定行与正文逐字一致，可给 dominant 换“出现次数优先”或
   “尾部循环优先”的口径——现口径已在 `test/essay5-data.test.ts` 里
   逐字锁定。
2. **主导重复的相位可能从标点开头。**`Tom and Lily` 跑满 80 个 token 的
   判定是「“. It was red and blue” × 5」（句点开头）：环上任何相位都是
   合法的重复单元，检测器取最早出现的那个，我没有加“转到词首”的美化
   （诚实优先）。第一次只按一轮（40 个 token）时判定是
   「“ the slide. They” × 4」，同理。介意的话是纯显示层的改动。
3. **贪心模式的悬浮弹窗显示 T = 1 的前 8 名赔率**（重归一化后），注里
   写明「贪心无视它们、永远拿第一行」。备选：贪心下干脆不显示百分比。
4. **每圈存活率绑定 top-k = 8。**换 k 数字会变（k 越大逃逸越快）；注里
   已把采样器点名。widget 的 k 与第一篇第五幕一致，没有暴露给读者调。
5. **体量超章程上限。**EN 同尺 1240（目标 800–1200，前两篇 1216/1210），
   已从 1478 删两轮；再删就要在四个实测数字里做取舍，留给作者。zh 约
   2156 汉字，比第四篇多 ~270，同因（数字密）。
6. **`test/essay5-data.test.ts` 每次 CI 约 8 秒**（三条 80-token 贪心行走
   + 概率连乘）。m2 的先例是 ~1 秒；若嫌贵，可把 `The bird flew up.` 那条
   删成 50 步（省 ~2 秒）或整测降频。我倾向保留——这是“每个实证句都有
   人查岗”的价钱。
7. **第二幕的温度滑杆是 Gamble 自带的**，本幕课文都在 T = 1；读者拖了
   滑杆百分比就变。注里一句「温度滑杆只会重塑这排条——下一幕会把这根
   杆子伸进一个活的循环里」既解释也预告。若嫌干扰，需要给 Gamble 加
   隐藏滑杆的 prop（改共享部件，我没动）。
8. **mock 模式下贪心输出是 “ floor” × 40**（mock logits 全零，argmax=0），
   判定行照常工作（也算测了 period-1 检测）；mock 只服务 CI/哈希，不
   影响读者。
9. **复读机没有「单步」按钮**（TheLoop 有）：40 个/轮 + 继续 已经覆盖
   本文的用法，加单步会稀释“看它一路念下去”的体感。可以加，5 行。
10. **版式与浏览器复核方式。**浏览器面板在验证期间处于隐藏态（截图全黑、
    定时器被节流到 ~1 秒/步——真实前台标签页不受影响，节奏与 TheLoop
    同为 90ms/步）；改用 DOM 度量核对：EN/zh 两页标题、四幕标题、徽章、
    图例、预设齐全；375px 下 `scrollWidth` = 375（无横向滚动）；真权重在
    dev server 里实跑复读机，第一轮 40 个 token 与 Node 实测逐字一致，判定
    行给出「“ the slide. They” × 4」，继续跑至 49 个 token 时文本仍与
    Node 序列一致（“, they saw a big slide. It was”），高亮分组 pr-0/pr-1
    正常。悬浮弹窗未在真鼠标下复核（代码与 TheLoop 的成品逐行同构），请
    作者过一眼；`.loop-tok.pr-*` 六色在窄屏下的观感也请肉眼过一遍。
11. **`SERIES.md` 流水线表**第五行已写 “blueprint”（与前三篇落草稿时
    一致），发布时一并改；backlog 第 5 行标了 built。
