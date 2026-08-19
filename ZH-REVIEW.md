# 中文版翻译审阅单(ZH Review)

给作者的声音审阅材料。中文版不是直译:英文原文比喻密集、短句收尾、幽默克制,
中文版按同等力度重写。所有译文在 `src/content/zh.tsx`,与 `src/content/en.tsx`
共享 `EssayStrings` 接口(键位齐平由 TypeScript + `test/content.test.ts` 双重保证)。

**通用策略**

- 技术词首次出现给中文注解后保留英文:token(词元)、embedding(词嵌入)、
  attention(注意力)、head、temperature(温度)、hallucination(幻觉)、scale(规模)。
- 喂给模型的默认例句一律保持英文;在第二幕导语里向读者交代了一句:
  「这个小模型只读过英文童话,所以我们喂它英文单词」。第二幕输入框 placeholder
  也写成「打几个英文单词…」。
- strawberry 数 “r” 的梗保留英文原词,在第一幕后的正文里点破:
  「——这个梗只在英文里成立,所以我们保留英文原词——」。
- canonical 译名全部原样使用(七幕标题、唤醒按钮、主标题/副题、hero 句)。

**需要作者拍板的全局决定**

1. 主标题 h1 渲染为「ChatGPT 到底在想什么」,不带书名号(《》视为引用格式而非标题本体)。
2. canonical 副题「一篇让你亲手解剖语言模型的互动长文」放在了 kicker 位置
   (顶部小字),与「全部在你的浏览器里运行」并列;hero 副题行则用了 canonical
   的「活在这个标签页里,被一幕一幕地解剖」句。若想对调,改 `zh.hero` 两个字段即可。
3. 英文页脚仍写着 “中文版 in the works”——中文版现已上线,这行该改了。
   为满足「EN 渲染逐字节不变」的要求,本次没动它,留给作者改(`en.tsx` 的 `footer`)。
4. `<html lang>` 按任务要求用 `zh`(不是 `zh-CN`)。

## 分幕状态表

| 幕 | 中文状态 | 拿捏处 / 本地化说明 |
|---|---|---|
| 全局(hero/导语) | ✅ 完成 | 「它不识字。」对应 “they can't read”——英文的 read 双关(阅读/识字)中文取了「识字」一头,更狠也更准;「机器掷了骰子」保留 gamble 的赌博意象贯穿全文 |
| 第一幕·切词机 | ✅ 完成 | “famously fail that question” → 「栽在这道题上,栽得全网皆知」(重复「栽」造节奏);wholeTokenNote 的 “earn a single token of its own” → 「挣到了一枚只属于自己的 token」;拼图比喻(问拼图有多重)原样成立,未换 |
| 第二幕·意义地图 | ✅ 完成 | “meaning is a place” → 「意义就是位置」;“who you live next to” → 「你和谁住得近」+「街区」;结尾 “Nothing more mystical than that.” → 「玄机就这么多,没了。」(短句收尾,比原文再俏皮半分,见下面低信心清单) |
| 第三幕·注意力之屋 | ✅ 完成 | “smaller than a selfie” → 「比一张自拍还小」(中文同样成立,未换);“sixteen different ways, eight times over” → 「十六道目光,读上八遍」;三个探测头命名:盯前一个词的头 / 锚在句首的头 / 目光最散的头;“the future is masked” → 「未来被遮住了」 |
| 第四幕·赌局 | ✅ 完成 | 唤醒按钮用 canonical 原文;careful/chaotic → 谨慎/狂野;“Think” 按钮 → 「想一想」;温度注解重写:「温度不是让模型想得更用力,它只决定一件事:对同一批直觉,下注下得多野。」 |
| 第五幕·循环 | ✅ 完成 | 图例三档:confident bet / split decision / long shot → 十拿九稳 / 五五开 / 爆冷;“each word is chosen before the next is even imaginable” → 「每个词落笔时,下一个词连影子都没有」 |
| 第六幕·拉远看 | ✅ 完成 | “The recipe is the same.” → 「配方是同一张。」;“The bars are illustrative; the gap is not.” → 「条形是示意,差距不是。」(保留原文机锋);参数量改用中文数量级:100 万 / 1.24 亿 / 数万亿 |
| 第七幕·它为什么说谎 | ✅ 完成 | neighborhoods / betting instincts → 街坊 / 赌性;“citation-shaped” → 「长得像文献的东西」;“commits to every word before imagining the next” → 「落子无悔」(围棋借喻,主动本地化);“talk itself into a corner” → 「把自己说进死胡同」 |
| 页脚 / 文档标题 | ✅ 完成 | 文档标题用 canonical;meta description 重写为中文;页脚加了「英文原版右上角可切换」 |

## 十处信心最低的处理(请重点过目)

1. **kicker 的排版决定** —— canonical 副题放进了 kicker 位(见上「全局决定 2」)。
   这是位置决定而非译文本身,但影响第一屏观感。
2. **「它不识字。」**(intro.p2,“they can't read”)—— 备选「它根本不认字」。
   现译最短最狠,但丢掉了 “read=阅读” 的那一半。
3. **「玄机就这么多,没了。」**(第二幕注,“Nothing more mystical than that.”)——
   添了半分俏皮,可能比原句语气更跳;稳妥版:「没有比这更朴素的了。」
4. **「落子无悔」**(第七幕,“commits to every word before imagining the next”)——
   围棋比喻是明显的再创作,意象整个换掉了;力度相当,但如果你不想引入棋类语域,
   备选:「写下就不回头」。
5. **「一本正经地胡编」**(第七幕,“make things up”)—— 「一本正经」是加戏,
   为补足原文里"能干的机器居然编造"的反差;素版:「凭空编造」。
6. **「以假乱真」**(第六幕,“how uncannily well … starts to look like thought”)——
   uncanny 的"瘆人"意味没保住;若想要那层寒意,可改「演到多么让人发毛」。
7. **「爆冷」**(第五幕图例,“long shot”)—— 赌马/体育语域,偏口语;
   保守备选:「冷门」。
8. **「下注下得多野」**(第四幕注,“how boldly it bets on the same hunches”)——
   「野」承担 boldly,语感偏口语;备选:「押注押得多大胆」。
9. **「多少眼」**(第三幕导语,“how much to look back at every token”)——
   「回头看之前每个 token 多少眼」的量词用法略带方言感;备选:「看几分」。
10. **「栽得全网皆知」**(第一幕注,“That's why LLMs famously fail that question.”)——
    「全网皆知」把 famously 落到了中文互联网语境,是主动归化;素版:
    「这道题 LLM 栽得出了名。」

## 词量对照(en 词数 / zh 汉字数)

| 段落 | EN(词) | ZH(字) |
|---|---|---|
| hero + 导语 | 112 | 184 |
| 第一幕(含幕后正文) | 179 | 282 |
| 第二幕(含幕后正文) | 161 | 272 |
| 第三幕(含导语) | 184 | 261 |
| 第四幕(含导语) | 153 | 234 |
| 第五幕(含导语) | 158 | 246 |
| 第六幕 | 159 | 239 |
| 第七幕 | 244 | 424 |
| 页脚 | 26 | 41 |
| **合计** | **1376** | **2183** |
