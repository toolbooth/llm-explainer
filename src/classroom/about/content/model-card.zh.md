# 模型卡——学生浏览器里跑的到底是什么

*《机器内部·课堂版》共享前置文档 · 草稿 2026-08-22。状态:2026-08-22 已整合进站点(构建第三阶段);仍标注"规划中"的,是课堂版尚未完成的构建项(service worker、Chromebook 设备测试)。*

## 一段话说清

学生浏览器里运行的模型叫 **TinyStories-1M**,是一个在"合成儿童故事"上训练出来的小型 GPT-Neo 语言模型。不含词嵌入的参数约 100 万(算上词嵌入表约 375 万),整个模型存成一个 7.5 MB 的文件。ChatGPT 这一级别的模型,按公开估计,比它大十万倍以上。课上看到的每一样东西——token、概率、attention、温度、采样——在大模型里的工作方式完全相同;不同的只是词汇量和能力。这既是优点(从构造上就适合课堂;4 GB 内存的 Chromebook 不需要任何特殊硬件就能跑),也是局限(它答不了常识题,而且只会说简单的英语)。

## 它是什么

| 项目 | 值 | 来源 |
|---|---|---|
| 检查点(checkpoint) | Hugging Face 上的 `roneneldan/TinyStories-1M` | nano-lm `weights/meta.json`;nano-lm README "Weights" |
| 架构 | GPT-Neo:8 层,每层 16 个 attention head(注意力头),隐藏维度 64,位置上限 2048,激活函数 `gelu_new` | nano-lm `weights/meta.json` |
| 词表 | GPT-2 的字节级 BPE(Byte-Pair Encoding,字节对编码),50,257 个 token(词元) | nano-lm README "Tokenizers" |
| 参数量 | 不含词嵌入约 100 万;随包发布的 fp16(半精度)文件 7,502,858 字节、108 个张量,即含 50,257 × 64 的 embedding(词嵌入)表在内约 375 万个数值 | nano-lm README;旗舰长文第六幕("1M non-embedding params · 7.5MB") |
| 权重文件 | `tinystories-1m.safetensors`,fp16,作为静态文件放在课程站点自己的域名下 | nano-lm README "Self-hosting" |
| 推理引擎 | **nano-lm**——零依赖的 TypeScript 前向传播(forward pass),约 150 行普通循环,只跑在主线程:不用 WebGPU、不用 WebAssembly、不用 web worker | nano-lm README;PRODUCT.md §6.1 |
| 正确性 | 与 Hugging Face `transformers` 的 `GPTNeoForCausalLM` 在同一检查点上做过逐 token 比对:12 个 token 的贪心续写完全一致,logits 和 attention 矩阵在 fp16 容差内 | nano-lm README "Token-exact" |
| 速度 | 对一句课堂长度的句子做一次前向传播只要几毫秒(作者开发机上实测约 10 ms;Chromebook 上的数字要等 MVP 设备测试,见 PRODUCT.md §10.1 第 4 项) | nano-lm README;PRODUCT.md §1.2、§6.1 |

## 训练数据

- 训练语料是 **TinyStories** 数据集:一批"由 GPT-3.5 和 GPT-4 合成生成、只使用很小词汇量"的短篇故事——词汇量大致是三四岁孩子能听懂的范围。这些故事是机器为研究目的写出来的,不是从儿童那里或公开网络上收集的。[Hugging Face 数据集卡片 `roneneldan/TinyStories`,2026-08-22 查阅]
- 论文:Ronen Eldan 与 Yuanzhi Li,*TinyStories: How Small Can Language Models Be and Still Speak Coherent English?*,arXiv:2305.07759(2023 年 5 月)。[nano-lm README "Weights"]
- 旗舰长文第二幕把后果直接摆给你看:这个模型的"意义地图"里,*dragon* 的邻居是 *knight* 和 *monster*,因为故事里的龙就是干这些事的。模型的"观点"就是它吃过的东西;第六模块《它从哪里学来的》整节课就建在这个事实上。

## 它能做什么

- 用儿童故事的腔调续写一句简短的英文("Once upon a time there was" → "a little girl named ...")。
- 对任意位置给出一份真实的下一个 token 概率分布,让学生在自己写的句子上观察采样(sampling)、温度(temperature)和自回归循环是怎么运转的。
- 暴露每一层、每一个 head 的真实 attention 权重,其中有些 head 稳定地盯着上一个词或第一个词——正因为模型小到读得过来,这些才看得清。
- 在普通浏览器主线程上运行,什么都不用装。

## 它不能做什么——请在学生动手之前就说明

- **它答不了常识题。** 它没读过百科、新闻或教科书。问它法国的首都,你会得到一个关于猫的故事。这不是需要道歉的 bug,而是第四模块的开场展品(一句听起来很自信的错话);各模块的提示句都以模型能接住的句子开头。
- **它只懂英语。** 训练故事全是英文,而 GPT-2 的 tokenizer(分词器)把非 ASCII 文本拆成原始字节。输一句中文,或者一个 emoji,"切词机"会把它碎成一串模型在训练中几乎没见过的字节级 token,续写出来的是乱码。中文版的正文是母语写的,但模型演示例句因此全部保留英文[PRODUCT.md §9 第 1 行]。第一模块的加长课时把这个字节切碎现象**当作课题来用**("你打自己的母语时,模型看见的是什么?")。
- **它没有跨轮记忆,没有系统指令,没有聊天人格。** 它只是一台"预测下一个 token"的机器。学生不是在"和 AI 聊天",而是在解剖一个 AI。
- **它没有过滤层。** 完整表述见《隐私与安全一页纸》。简单说:模型原则上可以吐出词表里 50,257 个 token 中的任何一个;让异常输出变得不太可能的是训练数据,不是过滤器,我们也不会声称相反。
- 两个可能被尖子生问到的引擎细节:GPT-Neo 不对 attention 分数做 1/√d 缩放(引擎有意复现了这一点,因为检查点就是这么训练的);引擎把 GPT-Neo 的局部 attention 层当作全局层处理,这在 ≤ 256 个 token 的输入上是精确的——课堂句子远远到不了这个长度[nano-lm README "Known semantics"]。

## 课堂模式下的采样上限(已构建的配置)

课堂版沿用旗舰长文的各个交互件,并增加一套"课堂模式"配置(`src/classroom/config.ts`,构建第一阶段)[PRODUCT.md §9 第 2 行;§10.2 "classroom shell"]。已构建的配置如下:

| 控制项 | 旗舰交互件现状 | 课堂模式(已构建) |
|---|---|---|
| 温度范围 | Gamble 0.10–2.00(默认 1.00);TheLoop 0.10–1.60(默认 0.80) | 课堂页面的每个滑块都是 0.10–**1.50**、步长 0.05(Gamble、TheLoop、掷一百次都一样) |
| 每次掷骰考虑的候选数(top-k) | Gamble 前 10;TheLoop 前 8 | 不变 |
| 续写长度(TheLoop) | 每个提示最多 30 个 token,然后需重置 | 不变:每个提示最多 30 个 token,然后需重置 |
| 采样时的可选 token 屏蔽名单(blocklist) | 无 | 学区要求时一天内可加,默认关闭 |
| 可选的大模型 | 另一个约 136 MB 的模型,仅在用户明确点击后加载 | **不从任何课堂页面链接** |

(来源:仓库中的 `src/acts/Gamble.tsx`、`src/acts/TheLoop.tsx`、`src/lib/engine.ts` 与 `src/classroom/config.ts`,2026-08-22 对照已构建的模块 1、2 页面复核。若上线页面显示的数字与此不同,以页面为准,本表即为过期。)

为什么这个上限既是防御也是教学需要:温度超过 1.5 左右,前 10 个候选的分布会被压平到接近均匀,"骰子"几乎成了公平骰子,课程想说明的那个要点——温度改变的是模型押注的胆量,不是它知道的东西——就淹没在噪声里了。

## 权重的来源与许可

- **来源。** 作者用 nano-lm 中的 `tools/convert_weights.py` 从 `roneneldan/TinyStories-1M` 转换而来;转换是确定性的,参考夹具(`tools/reference.json`)由上游检查点重新生成[nano-lm README "Weights";`tools/README.md`]。
- **上游许可——请仔细读这一条。** 截至 2026-08-22,Hugging Face 上 `roneneldan/TinyStories-1M` 的模型卡片**没有显示任何 license 字段**。TinyStories *数据集* 卡片标注的许可是 **CDLA-Sharing-1.0**(Community Data License Agreement – Sharing)。nano-lm 的 `meta.json` 把权重记录为 "roneneldan/TinyStories (research release)"。因此本文档**不**对权重断言任何许可;作者会在公开发布前向上游作者确认条款,或把再分发依据写清楚,届时更新本节。在那之前,把这些权重当作"原样再分发、注明出处的研究发布"对待。[2026-08-22 查阅自 huggingface.co/roneneldan/TinyStories-1M 与 huggingface.co/datasets/roneneldan/TinyStories]
- **引擎许可。** nano-lm 的许可"将在开源发布前选定",并受作者雇主的开源审批流程约束[nano-lm README "Status";PRODUCT.md §9 第 5 行]。占位:`[LICENSE——开源审批通过后确定]`。
- **引用。** 请引用旗舰对象:Shen, Shangyan. *Inside the Machine: An Interactive Guide to How LLMs Actually Think*(仓库中的 CITATION.cff)。若专门引用浏览器内的模型,请引用 nano-lm(它有自己的 CITATION.cff)。arXiv 预印本即将发布,发布后请改引预印本。

## 怎么验证它真的离线运行(五分钟,任何设备)

1. 打开课程链接,等"正在加载模型(7.5 MB,本页所有部件共用一份)…"的进度到 100%。
2. 打开浏览器开发者工具(Chrome / ChromeOS:`Ctrl`+`Shift`+`J`,切到 **Network** 面板),勾选"Preserve log"。
3. 关掉 Wi-Fi(或把 Network 面板的限速菜单设为 **Offline**)。
4. 往切词机或 Gamble 里输一句新的话。token 照样出现,概率条照样重画。
5. 看 Network 面板:没有发起任何新请求,也没有任何失败的请求。你刚才看到的计算就发生在这个标签页里。
6. 仍在离线状态下刷新页面。**规划中、尚未实现:** 课堂版加上 service worker 之后,页面能从缓存重新加载并继续工作;而目前无论旗舰长文还是课堂页面都**不能**在离线状态下刷新,只能扛住课中断网。在 service worker 上线之前,请把纸质的"不插电"活动单当作备用方案[PRODUCT.md §6.1 "Offline after first load"]。

面向学区 IT 审核员的完整版"网络面板审计"写在《隐私与安全一页纸》里。

## 贴在教室墙上的规模尺

| 模型 | 参数量 | 来源 |
|---|---|---|
| 本页面里的模型 | 不含词嵌入约 100 万(7.5 MB) | nano-lm |
| GPT-2(2019) | 1.24 亿 | 旗舰长文第六幕 |
| 前沿模型(2026) | 数万亿(公开估计) | 旗舰长文第六幕 |

"规模不改变机器做的事——它改变的是,同一套掷骰子,看起来有多像思考。"[旗舰长文第六幕,中文版表述以站点为准]
