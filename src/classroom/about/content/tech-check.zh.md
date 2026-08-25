# 技术检查——上课前一天做

*《机器内部·课堂版》共享前置文档 · 草稿 2026-08-22。设备表中每一行都标注了 **已验证**（作者亲眼确认）或 **目标**（设计基线，尚未测试）。请不要把“目标”读成承诺。*

## 设备与浏览器基线

| 要求 | 状态 | 说明与来源 |
|---|---|---|
| 2019–2021 年的教育版 Chromebook:4 GB 内存、Celeron/MediaTek、受管 Chrome、无安装权限 | **目标**（设计基线；MVP 验证项，PRODUCT.md §10.1 第 4 项） | 选它是因为约 88% 的学区给每个初高中生配设备、93% 计划采购 Chromebook、设备平均服役约 7.6 年[PRODUCT.md §6.1:marketbrief.edweek.org 2025/01;agp360.com]。 |
| 不需要 WebGPU、Vulkan、WebAssembly、web worker | **由构造保证** | 引擎是跑在主线程上的普通 TypeScript[nano-lm README]。ChromeOS 上的 WebGPU 需要 Vulkan(Chrome 113+),WASM 回退慢 3–15 倍——这个设计两者都不需要[PRODUCT.md §1.2]。 |
| 任何现行的常青浏览器（Chrome、Edge、Safari、Firefox） | 作者开发机上的 Chrome/Safari:**已验证**。ChromeOS 受管账户、Windows 10/11 Edge、iPadOS Safari、Firefox:**目标**（PRODUCT.md §6.1 的 “Tested on” 是计划清单，不是测试报告）。 | 每个交互件都要支持触屏，这是要求，尚未验证。 |
| 4 GB Chromebook 在学校 Wi-Fi 下 3 秒内可交互 | **目标** | PRODUCT.md §6.1。 |
| 标签页内存低于 500 MB | **目标 / 预算** | 权重在内存中展开为 fp32 约 15 MB；课堂长度句子的 attention（注意力）矩阵只有几 KB。预期远低于 100 MB，但没在目标设备上测过。 |
| 不依赖可选大模型 | **由构造保证** | 约 136 MB 的大模型在旗舰长文里只在用户明确点击后才加载，且不从任何课堂页面链接[PRODUCT.md §4.1 规则 4;`src/lib/engine.ts`]。 |

## 首次访问会下载什么

| 资源 | 大小 | 时机 | 缓存？ |
|---|---|---|---|
| 页面、脚本与样式包 | 2026-08-23 构建时实测：磁盘 1.29 MB（应用 684 KB——七份前置文档随包一起——+ transformers.js 分词器库 559 KB + CSS 46 KB），线上 gzip 后约 412 KB；同一构建里 23.6 MB 的 ONNX 运行时只有旗舰长文的可选大模型才会取，课堂页面永远不取；service worker 本身 1.9 KB | 打开页面时 | 是 |
| GPT-2 tokenizer（分词器）文件（`tokenizer.json`、`tokenizer_config.json`），自托管于 `/tokenizers/gpt2/` | 2.1 MB（2,107,887 字节；gzip 后约 597 KB） | 打开页面 | 是 |
| 模型权重 `tinystories-1m.safetensors` + `meta.json` | 7.5 MB（7,502,858 字节） | 打开页面——页面上第一个交互件就会请求，所有交互件共用一份 | 是，长期缓存头（随托管一起规划） |
| **合计** | 权重 + 分词器 + 代码包 **≤ 10 MB** 的预算[PRODUCT.md §6.1 r2]。2026-08-23 实测：7.50 + 2.11 + 1.29 = **磁盘 10.90 MB**，线上约 **8.5 MB**（权重压不了，其余可以）。权重加分词器这一行（9.61 MB）在预算之内且有测试钉住；代码包按磁盘字节超出了 PRODUCT.md 留给它的约 0.5 MB，按线上字节没有——留给作者的问题：重定预算，还是用一个自包含的 BPE 分词器替换 transformers.js | | |

首次访问之后，浏览器全部从普通缓存读取；而且从构建第四阶段起，一个 **service worker** 另存一份带版本号的副本，让页面在完全没有网络时刷新也能继续工作（见下一节）。如果受管 Chromebook 在注销时清除站点数据，两份副本都会一起清掉，每个学生每次新会话都要重新下载约 11 MB；带宽规划见下文。

## 首次访问之后离线可用（service worker）

2026-08-23 构建（PRODUCT.md §6.1“离线行为”第 (b) 级；§10.1 第 4 项）。第一次打开课堂页面时，浏览器会安装一个很小的 service worker（`/classroom-sw.js`，1.9 KB，不用任何框架），把一节课需要的全部文件存成一份**带版本号的预缓存**——页面外壳、三个脚本/样式文件、7.5 MB 权重和约 2 MB 的切词器（8 个文件，10.9 MB）。从此：

- **没有网络也能刷新。** 页面、每个交互件和模型都从预缓存加载。2026-08-23 在无头 Chrome 里对生产构建验证：用真实权重打开模块 2，等 worker 就绪（模型加载完后 2.0 秒），把浏览器切到离线，刷新——页面照常渲染，赌局画出十根概率条，百次掷骰能掷，循环能单步；零个失败请求；对任何未缓存地址的请求都失败，证明网络确实断了。离线状态下再导航到模块 1（中文）和本页，同样正常。
- **新版本永远不会被缓存挡住。** 页面加载是“网络优先”：在线时浏览器总是先向服务器要当前页面，拿到的就是当前版本。worker 的版本号是所有预缓存文件内容的哈希，所以站点任何改动——新构建、重新导出的权重——都是一个新 worker；浏览器在后台安装它，它填好一份新预缓存，接管时删掉旧的。新版本在**下一次**加载时生效，绝不会在课中刷新页面。
- **作用范围。** 只有课堂页面（`#/classroom…`）会注册这个 worker，而且只在生产构建里；长文从不注册。因为所有路由都是站点根目录上的 hash,worker 的作用域也是站点根目录，所以访问过课堂页之后，长文的外壳也能离线加载——无害，长文页面本身没有任何改动。运行时不缓存任何东西；预缓存是唯一的缓存，跨域请求（旗舰长文的可选大模型）一概不碰。
- **托管要求。** `classroom-sw.js` 必须以 `Cache-Control: no-cache`（或很短的 max-age）提供，新版本才会被发现；`/assets/*`（文件名带内容哈希）、`/weights/*` 和 `/tokenizers/*` 可以用长期缓存头。两者都是托管配置（随域名一起规划）。
- **限制。** 存储按浏览器配置文件计：注销时清除站点数据的受管 Chromebook 会把 worker 和预缓存一起清掉，每次新会话都等于首次访问。首次访问时，只有当浏览器的 HTTP 缓存拒绝共享页面正在进行的下载时，worker 才会把权重再下载一遍（它会先定时重试，最后才这么做）。隐身/无痕窗口可能根本不保留 worker。

**在任何设备上验证（两分钟）：** 打开一个课页，等模型指示器到 100%；打开开发者工具 → **Application** → **Service Workers**（Chrome / ChromeOS:`Ctrl`+`Shift`+`J`，再点 Application 标签），确认 `classroom-sw.js` 处于 *activated and running*；在同一面板勾选 **Offline**（或关掉 Wi-Fi）；刷新。页面应当带着所有交互件回来。

## 网络与内容过滤

- **域名。** 课堂站点位于 `insidethemachine.org`（课堂入口：`https://insidethemachine.org/#/classroom`），由作者持有的稳定域名，至少在第一次推广前 60 天上线，好让过滤厂商完成分类。`*.github.io`、`*.netlify.app`、`*.vercel.app` 有意不作为正式地址；它们被误判为“parked（停放域名）”或直接屏蔽的案例已有记录[PRODUCT.md §6.2]。
- **申请的分类：Education / Reference（教育/参考）。** GoGuardian 的 “Artificial Intelligence Tools” 分类和 Lightspeed 的 “AI – Generative” 名单针对的是托管 AI 服务；本站不调用任何 AI 服务，也不是聊天产品[PRODUCT.md §6.2;goguardian.com/product-update/new-ai-filtering-category]。上线后作者会主动向 GoGuardian、Lightspeed、Securly、ContentKeeper 提交分类。
- **如果还是被拦**，症状通常是三种之一：看到过滤器的拦截页而不是课程；页面打开了但模型进度一直停在 0%（`.safetensors` 文件按扩展名或大小被拦）；切词机始终不显示 token（同一域名下 `/tokenizers/gpt2/` 的分词器文件被拦——少见，因为它们只是普通 JSON）。把下面的模板发给你的 IT 联系人。
- **无需登录**，意味着未满 18 岁的访问不需要 Google Workspace 管理员审批[PRODUCT.md §6.2]。
- **嵌入 LMS。** Google Classroom：直接贴模块或步骤链接（每一步有自己的链接，如 `#/classroom/m2/step-3`）。Canvas/Schoology：用模块指南里的 iframe 代码；框内会显示备用链接，并注意 Canvas 在编辑模式下不渲染 iframe[PRODUCT.md §6.4;community.instructure.com 662934]。

### 放行申请模板（改好发给 IT）

> 主题：放行申请——Inside the Machine: Classroom Edition（`insidethemachine.org`）
>
> `[姓名]` 您好，
>
> 我计划于 `[日期]` 在 `[课程]` 班使用一套免费的 AI 素养课程。该资源是位于 `https://insidethemachine.org/` 的静态网站（托管商：Cloudflare Pages；仓库：`https://github.com/toolbooth/llm-explainer`）。目前在我校学生 Chromebook 上 `[被完全拦截 / 页面可开但模型文件无法下载 / 未分类]`。
>
> 供您审核的技术摘要：
> - 静态 HTML/JavaScript；无账号、无登录、无 cookie、无统计、无第三方脚本。
> - 从同一域名下载一个 7.5 MB 的模型文件（`tinystories-1m.safetensors`）和约 2 MB 的词表文件，之后不再发起任何网络请求。学生输入永不离开浏览器。
> - 它不是聊天机器人，不联系任何 AI 服务；合适的分类是 Education/Reference 而非 AI Tools。
> - 隐私声明与五分钟网络面板审计步骤：`https://insidethemachine.org/#/classroom/about/privacy`。
>
> 能否为学生设备放行 `insidethemachine.org`（若 `.safetensors` 文件类型被拦，请一并放行）？我很乐意在学生设备上演示。
>
> 谢谢！
> `[教师姓名、学校、教室]`

## 30 台设备同时上课

- **算一下。** 30 名学生 × 约 10 MB ≈ **300 MB** 的瞬时流量，如果所有人在同一秒打开页面（PRODUCT.md §6.1 只按权重算为 225 MB）。在 100 Mbps 的共享校园出口上大约是 25–30 秒的饱和；1 Gbps 的话只要几秒。可以接受，但**尚未测试**——30 客户端并发加载测试是 MVP 第 4 项[PRODUCT.md §10.1]。
- **免费的错峰办法。** 课程前十分钟本来就设计为不插电[PRODUCT.md §4.1 规则 2]。让学生落座时就打开链接，把屏幕半合上，开始不插电活动；到第 13 分钟，每台设备都已把模型缓存好，看不到任何等待。
- **第二天不花流量。** 缓存之后，再次访问的设备不下载任何东西（前提是受管账户在注销后保留站点数据；如果学生每天都看到那个 7.5 MB 的下载，问一下 IT）。
- **算力不是瓶颈。** 一次前向传播只要几毫秒；三十台设备各算各的，互不争抢。
- **课中 Wi-Fi 断了**，已经加载完的设备照常工作。没加载完的设备用纸质活动单，或者看同伴的屏幕。活动单一定要打印。

## 五分钟课前清单（前一天，在学生设备上）

1. ☐ 用**学生**的 Chromebook、登**学生**账户（不是你的教师账户），打开模块链接。页面几秒内渲染出来。
2. ☐ 模型加载进度到 100%。（停在 0% 说明权重文件被拦——发上面的模板。）
3. ☐ 在第一个交互件里输一句话。token 出现；在 M2 里，概率条出现，拖温度（temperature）滑块它会重画。
4. ☐ 从指南打开该模块的三个步骤深链接（`#/classroom/m2/step-1`、`step-2`、`step-3`）；每个都落在正确的交互件状态上。
5. ☐ 关 Wi-Fi 十秒，再输一句话。照常工作。开回 Wi-Fi。
6. ☐ 投影：在教师机上打开同一链接；确认最后一排看得清（浏览器缩放 125–150% 可用；交互件自适应布局）。
7. ☐ 打印不插电活动单（每两人一份）和出门票（每人一份）。
8. ☐ 用学生设备开一个标签页访问隐私页，确认过滤分类；如果被拦，你还有一天时间发放行申请。

如果第 1 或第 2 步失败、IT 来不及处理，就用整节课做不插电活动，并在投影上演示交互件——这套课就是按“设备全不能用的那天也能上”来设计的[PRODUCT.md §9 "Policy direction reverses"]。
