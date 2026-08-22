# 第三篇《野生 attention head 图鉴》审阅单(REVIEW-03)

给作者的签发材料,三部分:**中文低信心清单**、**claims-care 敏感句逐条引用**、
**开放问题**。文本在 `src/essays/attention-heads/content/{en,zh}.tsx`,蓝图是
`essays/03-attention-heads/OUTLINE.md`,claims-care 六条红线以蓝图为准。

**怎么现场审阅**:registry 里该文仍是 `draft`,不出现在任何列表,但直达
URL 可看:`#/essays/attention-heads`(加 `?mockModel=1` 可离线跑交互;
`?lang=zh` 切中文)。页眉有 DRAFT/草稿 徽章,翻 `src/series/registry.ts`
的 status 为 `published` 即上线(徽章自动消失,列表自动收录)。
每节可深链:`#/essays/attention-heads/sec-1` … `sec-4`。

体量:EN 正文(导语+四节+结语)**1198 词**,加 hero 与四条 widget 注
共 1420 词(章程目标 800–1200);中文正文约 **1960 汉字**(加注解约 2330)。

真权重实测(默认句 “Tom and Lily went to the park to play with their new
kite.”,15 token):普查结果 **2 个盯前一个词(L2H12、L5H7,2.2 倍)· 1 个
锚在句首(L3H13,2.1 倍)· 12 个照镜子(全在第 2 层,2.1–2.7 倍)· 0 个
隔一个词 · 71 个糊成一片 · 42 个无名氏**。第二节正文里“一小撮 / 几个 /
第 2 层一簇 / 几乎没有 / 两大堆”的描述与之相符。

## 十处信心最低的中文处理(请重点过目)

1. **「野生 attention head 图鉴」**(标题,任务给定的 canonical)——中英
   混排的标题在这个系列里是头一回;h1、docTitle、registry 三处一致。若要
   全中文,备选「注意力头野外图鉴」,但会断开与 canonical 的对应。
2. **「照镜子的头」**(§2 普查,“self” head)——把“注意力落在自己身上”
   拟成照镜子,形象但带一点拟人;素版「盯自己的头」(与「盯前一个词的头」
   句式齐平,更稳)。
3. **「糊成一片」与第一篇的「目光最散的头」并存**(§2 普查组名 vs 注意力之
   屋徽章)——同一现象两个名字:普查里的 wash 是“均匀度 ≥ 90%”的一整类,
   徽章是“最散的那一个”,我让两个名字都留着并在导语里点出徽章名。若嫌
   分裂,普查组可改「🌫 目光最散的头」。
4. **「无名氏」**(“unlabeled”)——人格化了一档(无名氏是人的称呼);
   好处是短、有图鉴味;素版「没贴上标签的」。summary 行「42 个无名氏」
   同步改。
5. **「辨认特征」对译 “field mark”**(贯穿全文)——观鸟圈常说「野外识别
   特征」,我取了更口语的「辨认特征」;备选「识别特征」。此为全文级决定。
6. **「一个取景的把戏」**(导语,“a trick of framing”)——原文 framing
   双关(取景/话语框架),中文只保住摄影义;备选「一个框定视野的把戏」。
7. **「1.1 倍,是你想象出来的鸟」**(§2,“1.1× is a bird you're
   imagining”)——直译观鸟梗,中文读者未必接到“把树枝看成鸟”的经验;
   备选「1.1 倍,是看花了眼」(丢了鸟,保住意思)。
8. **「发现的,不是设计的」**(§1,“Discovered, not designed”)——原文的
   头韵没了;备选「是长出来的,不是画出来的」(更有劲,但多了一个比喻,
   且“长出来”略带生命感,与无拟人红线有张力)。
9. **「人口普查」**(§2 标题与全文的 “census”)——对一群 head 说“人口”
   略违和,但「普查」单用太轻,「点名」丢了统计感;summary 行已避开
   “人口”,只写「扫描了 128 个头」。
10. **「停车位」**(§3 widget 注,对 “attention sink” 的中文旁注)——sink
    没有现成中文,我把它意译成注意力的“停车位”并加引号;这是我的解释性
    加注,英文原注只说 “attention sink”。若嫌多,删掉引号内四字即可。

另两处排版决定,顺带请拍板:zh 的 §1 末尾沿用第二篇的做法,括号里交代
「默认例句保持英文,你自己的句子也请用英文」;chip 上的证据用「2.3 倍于
均匀」(紧凑但生硬),备选「是均匀的 2.3 倍」(更顺,但 chip 变宽)。

## Claims-care 敏感句(蓝图红线,逐条引用请签字)

蓝图六条:**启发式标签≠机制论断 / 无拟人 / 多数无标签要明说 / 注意力≠解释 /
标签是单句快照、门槛是我们定的 / “发现非设计”不等于训练有意图**。以下为
落实处,EN 原句 + 中文对应句。

### 1. 启发式标签,不是机制论断,不指向前沿模型(§2 p2 + §2 widget 注 + §3 p2)

> EN: "The list is short on purpose. Four patterns, one evenness test, one
> threshold we chose (1.75×): a *heuristic*, in the plain sense — a rule of
> thumb that sorts a population by its statistics. It is not a claim about
> what any head computes. It is a field mark, and field marks misidentify
> birds."

> zh: 「清单故意开得短。四种轮廓、一项均匀度检测、一个我们自己定的门槛
> (1.75 倍):这是启发式(heuristic),最朴素的那种意思——一条按统计量给
> 人口分堆的经验法则。它不是关于任何一个头在算什么的论断。它是辨认特征,
> 而辨认特征会认错鸟。」

> EN(§3 p2,文献只作指路牌): "In bigger models, researchers have found
> heads with much richer jobs — heads that copy patterns seen earlier in the
> text, heads that track names — using tools this essay doesn't have, like
> switching a head off and watching what breaks. Our scanner has no
> off-switch. It counts where the weight lands, and it stops there."

> zh: 「在更大的模型里,研究者找到过分工丰富得多的头——把前文出现过的模式
> 照抄下来的头、追踪人名的头——用的是这篇文章没有的工具,比如把一个头
> 关掉,看什么坏了。我们的扫描器没有开关。它数的是注意力落在哪儿,到此
> 为止。」

> EN(§2 widget 注): "Every label here is a statistic about where this
> head's weight landed on this sentence — a field mark, not a job
> description. Change the sentence and heads can change piles. The scanner
> has no way to ask what a head's reading is *for*."

> zh: 「这里的每一个标签,都是一条统计量:这个头的注意力在这句话上落在了
> 哪儿——是辨认特征,不是岗位说明书。换一句话,头可能就换堆。扫描器没办法
> 问一个头读这些是为了什么。」

### 2. 无拟人:标签是我们的,不是模型的(§1 p2)

> EN: "Nobody chose the habits. Nobody wrote 'head 8, watch the previous
> word.' A head that happened to lean that way made the next-word bet
> slightly better, and training kept it. **Discovered, not designed** — hold
> onto that phrase, because every label in this essay is ours, not the
> model's."

> zh: 「没有人挑选过这些习性,没有人写过“8 号头,盯住前一个词”。某个头碰巧
> 往那边偏了一点,下一个词的赌注就准了一点,训练便把它留了下来。发现的,
> 不是设计的——这句话请攥紧,因为这篇文章里的每一个标签,都是我们贴的,
> 不是模型自己的。」

全文对 head 的动词:落在(lands on)、偏了一点(lean)、靠着(leans on)、
劈成两半(splits);没有 wants / decides / prefers / chooses。§1 p1 的
「手里各攥着同一道题」是比喻读者,不是说 head 有意图——请确认可接受。
「习性」对译 habit(观鸟语域),比「脾气」克制。

### 3. 多数 head 抗拒标签,写在正文(导语 p2 + §4 p2)

> EN(导语): "the last section is about the ones that don't fit — which, in
> this model, is **most of them**."

> EN(§4 p2): "**Most heads in this model resist a simple label** — and in
> bigger models, the heads anyone has managed to name are still the
> minority."

> zh: 「这颗模型里的大多数头,抗拒简单的标签——而在更大的模型里,被人叫得
> 出名字的头,到今天也还是少数。」

(初稿写的是「没有理由相信模型越大这个比例就越小——真要说,只会越来越
怪」,那是对前沿模型的断言,已按红线改成对研究现状的陈述。)

### 4. 注意力 ≠ 解释(§3 p2)

> EN: "They are shapes in the weights: where the model's attention went.
> They are not explanations of what the model did with it. A stripe tells
> you this head reads the previous word; it does not tell you whether what
> it read mattered for the bet at the end of the pipeline — the same shape
> can carry a signal the next layer uses or one it ignores."

> zh: 「它们是权重里的形状:模型的注意力去了哪儿。它们不是模型拿这些注意力
> 做了什么的解释。一道条纹告诉你这个头在读前一个词;它不告诉你读到的东西
> 对流水线尽头那次下注有没有用——同一个形状,可能载着下一层要用的信号,
> 也可能载着下一层扔掉的东西。」

> EN(§3 widget 注,attention sink 的加固): "The first-token column is
> common enough across models to have a name, an *attention sink* — though
> naming a shape is not explaining it."

> zh: 「句首那根柱子在各种模型里都常见,常见到有了名字:attention sink,
> 注意力的“停车位”——不过给形状起名,不等于解释了它。」

(初稿 §3 p1 写锚头「多半是一个停车位,给无处可去的注意力停靠」,那是
功能论断,已从正文删除,改成 widget 注里带 hedge 的命名。)

### 5. 单句快照 + 门槛是我们定的(§4 p2 + §3 widget 注 + 扫描器阈值注)

> EN: "A census on one sentence is also only that: a head that reads as an
> anchor here may come out as a wash on your next input, because these are
> habits under particular conditions, not fixed ID cards."

> zh: 「一句话上的普查,也只是一句话上的普查:在这儿读作锚的头,换你下一句
> 输入可能就糊成一片,因为这些是特定条件下的习性,不是固定的身份证。」

> EN(阈值注,点开任一 head 可见): "A label needs ≥ 1.75× an even spread;
> a wash needs evenness ≥ 90%. Both numbers are ours."
> zh: 「贴标签需要 ≥ 1.75 倍于均匀摊开;糊成一片需要均匀度 ≥ 90%。两个数
> 都是我们定的。」

### 6. 证据只举看见过的例子(§4 p1)

> EN: "There are patterns: a head that leans on the last few words without
> settling on one; a head that splits its weight between the sentence's
> start and the words just behind it."

> zh: 「那里有纹路:一个头靠着最后几个词,却不落在其中任何一个上;一个头把
> 注意力劈成两半,一半给句子开头,一半给紧挨着身后的几个词。」

(初稿还有「一个头见到逗号就亮」,真权重里没验证过,已删。上面两例对应
校准里的 L7H2 / L6H7 类(近因梯度,lift 不到门槛)与 L5H0 / L4H4 类
(句首 + 近处对半)。)

## 开放问题(按重要度)

1. **阈值是设计选择,请拍板。** 1.75 倍 / 90% 是按四句校准定的(蓝图
   “Engine notes” 有数字)。往下调到 1.5 倍,照镜子的头会从 12 个涨到
   30 个左右、锚头涨到 6–20 个;往上调到 2 倍,盯前一个词的头在多数句子上
   归零。两个常数在 `src/essays/attention-heads/scanner.ts` 顶部。
2. **「两-back」几乎永远为空。** 四句校准里 prev2 的 lift 从未超过 1.9;
   这一组在默认句上是 0。我把它留着,作为“图鉴有这一页、林子里却几乎
   没这种鸟”的教学点(§2 p2 已写明「几乎没有」)。若嫌空组难看,去掉
   模板即可(scanner.ts 的 FOCUSED 与 types 的 species 表同步删)。
3. **短句体验。** 模板要 ≥ 4 个 token;而 7 token 的句子上 lift 被压缩
   (均匀基线本身就高),锚头会偏多、照镜子偏少。默认句都选了 12–15 token,
   请作者试几句自己的。
4. **缩略图按 lift 上色,注意力之屋按绝对值上色。** 两种着色并存是有意的
   (屋里的绝对着色下,这颗模型的多数格子几乎看不见),widget 注已交代;
   但读者对着同一个头看到两种亮度,可能困惑。可选:给屋加一个“按偏离
   均匀上色”开关——那会改第一篇的 DOM,放在发布后。
5. **AttentionRoom 的 lift 改动了第一篇的源码**(`strings`/`htmlId`/
   `initialText`/`initialLayer` prop),第一篇 DOM 已验证逐字节不变
   (EN b5fe4891… / zh c1097d95…),第二篇亦然(2475a779… / 4276ba10…)。
   `src/series/README.md` §2 的 seam 说明已更新;Chopper / WordMap 仍
   读 `useStrings()`。
6. **三间屋子 + 普查共四个输入框**,各自独立;§4 让读者“从普查读层号头号
   再拨进屋里”是跨部件的手工操作。自动联动(点 chip 直接跳到 §4 的屋)
   要加一个页面级 store,草稿阶段先不做。
7. **性能。** 128 个 canvas 各 seq×seq 像素,一次 forward 几毫秒;140
   字符上限下最多三十来个 token,无压力。
8. **`SERIES.md` 流水线表**第三行仍写 “blueprint”(第二篇当年落草稿时
   也没改),发布时一并改。
