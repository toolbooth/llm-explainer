import type { ClassroomStrings } from "./types";

/**
 * 课堂版共用文案(大陆简体)。与长文系列同一纪律:不逐句直译,按同等力度
 * 重写。但语域不同——这是教师指南,不是长文:平实、具体、少比喻;凡是
 * 说到页面“做什么、存什么”,每一句都必须与代码事实一致。
 *
 * 术语:token → 碎片(首次出现时注 token);tokenizer → 切词器;Chopper →
 * 切词机;unplugged → 不插电;exit ticket → 出门条;block extension → 大课
 * 延伸;rubric → 评分量表;deep link → 直达链接。
 *
 * 注意:JSX 会把跨行文本用一个空格拼接,所以每段中文必须写成单行。
 */
/* eslint-disable max-len */
// prettier-ignore
export const zh: ClassroomStrings = {
  docTitle: "机器内部·课堂版 — Inside the Machine",
  metaDescription: "免费的 45 分钟课:一个真实的语言模型在浏览器里运行,处理每个学生自己打的句子。无账号、无后端、不收集任何数据。附教师指南与可打印的不插电活动。",
  htmlLang: "zh",

  kicker: "INSIDE THE MACHINE · 课堂版",

  index: {
    title: "机器内部·课堂版",
    subtitle: "45 分钟一节、无需登录、Chromebook 优先的课:一个真实的语言模型在浏览器里处理每个学生自己的句子——配教师指南、可打印的不插电导入,以及课程标准对照表。永久免费。",
    whatItIs: () => (
      <>每个模块就是一节课:投影导入、十分钟不插电活动、二十分钟在学生自己的句子上做引导探究、一个让学生评判模型的环节,最后是出门条。模块之间彼此独立;顺序是建议,不是要求。面向高中到大学低年级(美国 9–14 年级)。</>
    ),
    whatItIsNot: () => (
      <>这<strong>不是聊天机器人</strong>,也不是批改工具。学生在这里不是在“用 AI”,而是在拆开一个 AI 看。无账号,不保存任何东西,任何年龄的学生数据都不收集。</>
    ),
    modulesHeading: "六个模块",
    moduleLabel: (n) => `模块 ${n}`,
    planned: "规划中",
    forTeachers: "给老师",
    guideLink: "教师指南",
    unpluggedLink: "不插电活动(打印版)",
    slidesLink: "幻灯片",
    seriesLink: "这套课是从《Inside the Machine》长文系列长出来的 →",
  },

  nav: {
    index: "课堂版",
    module: "课页",
    guide: "教师指南",
    unplugged: "打印版",
    slides: "幻灯片",
    print: "打印本页",
    linkToStep: "本步骤的直达链接",
  },

  hints: {
    reveal: (next, total) => `看提示 ${next}/${total}`,
    hide: "收起提示",
    label: (n) => `提示 ${n}`,
  },

  modelCard: () => (
    <><strong>模型说明卡,实话实说。</strong>这套课里跑的模型是 TinyStories-1M——一个 100 万参数的 GPT-Neo,用合成的儿童故事训练而成,比 ChatGPT 那一级的模型小约十万倍。token、概率、注意力、采样,机制一模一样;词汇量和本事,差得远。它只读过英文,所以每一页的例句一律是英文。</>
  ),
  privacy: () => (
    <><strong>隐私。</strong>无账号、无 cookie、无统计、无任何标识符。学生打的字只在这个标签页里处理,不离开设备,也不保存。唯一的网络活动,是第一次打开时下载页面、切词器(约 2 MB)和模型权重(7.5 MB)——全部来自本站自己的服务器,不连接任何第三方主机。</>
  ),

  glance: {
    grades: "9–14 年级",
    time: "45 分钟 · 含 90 分钟大课延伸",
    devices: "Chromebook、iPad,任何浏览器",
    account: "无账号 · 数据不离开设备",
  },

  beats: {
    hook: { label: "导入", time: "0–3 分钟 · 投影" },
    unplugged: { label: "不插电", time: "3–13 分钟 · 合上设备" },
    explore: { label: "引导探究", time: "13–33 分钟 · 用设备" },
    evaluate: { label: "评判环节", time: "33–40 分钟 · 纸笔" },
    exit: { label: "出门条", time: "40–45 分钟 · 纸笔" },
    extension: { label: "大课延伸", time: "+45 分钟" },
  },

  frontMatter: {
    heading: "共用前言",
    intro: "教师指南的共用部分,每份一页,可打印(每页都有“打印本页”按钮;PDF 版由同一份文本生成)。页上每一句关于页面做什么、存什么的话,都对照已构建的代码写成,并注明日期。",
    guideLine: "共用前言,在站点上",
    items: [
      { slug: "model-card", label: "模型说明卡,实话实说", blurb: "TinyStories-1M 是什么、能做什么、不能做什么,训练数据,课堂模式下的采样上限,以及权重许可的现状。" },
      { slug: "privacy", label: "隐私与安全一页纸", blurb: "写法对准学区审核表,可整段粘贴:无账号、不收集任何数据、浏览器缓存了什么、FERPA / COPPA / SOPIPA 立场,以及五分钟的网络面板审计。" },
      { slug: "tech-check", label: "技术检查(5 分钟,提前一天做)", blurb: "设备基线、首次访问下载什么、过滤分类、放行申请模板,以及课前清单。" },
      { slug: "standards", label: "课标对照表(全部六个模块)", blurb: "CSTA 2026、AP CSP、AI4K12、CSTA/AI4K12 优先级、ISTE、DOL TEN 07-25 与加州教育法 §33548,每行带核对日期。" },
      { slug: "policy", label: "政策引文", blurb: "联邦与各州政策的原文,供申报书、校董会答问和放行申请直接引用,每条带核对标记。" },
      { slug: "accessibility", label: "无障碍声明", blurb: "WCAG 2.1 AA 目标、交互件按什么设计、已知缺口——第四阶段审计前都是“未审计”,页上照实写。" },
      { slug: "letter-kit", label: "如何引用 · 如何告诉我们你用它上过课", blurb: "引用块、可选的“我用它上过课”报告、来信骨架,以及我们永远不会要的东西。" },
    ],
  },

  about: {
    navLabel: "共用前言",
    sourceNote: (source) => (
      <>源文本:<code>classroom-edition/front-matter/{source}.zh.md</code>(草稿 2026-08-22),整合时对照已构建的代码做了修正——修正清单见 REVIEW-CLASSROOM-3.md。中文页与英文页是对等文档,不是翻译。</>
    ),
    descriptions: {
      "model-card": "学生浏览器里跑的模型:经 nano-lm 运行的 TinyStories-1M——它是什么、能做什么、不能做什么、训练数据、课堂采样上限,以及权重许可的现状。",
      privacy: "给学区审核用的隐私与安全一页纸:无账号、不收集数据、缓存了什么、FERPA / COPPA / SOPIPA 立场、安全声明、网络面板审计。",
      "tech-check": "上课前一天的技术检查:设备基线、下载内容、过滤分类、放行申请模板、30 台设备同时上课的建议、课前清单。",
      standards: "六个规划模块的课标对照表:CSTA 2026、AP CSP、AI4K12、CSTA/AI4K12 优先级、ISTE、DOL TEN 07-25、加州教育法 §33548,附核对日期。",
      policy: "政策引文:联邦与各州政策原文,供申报书、校董会答问与放行申请引用,每条带核对标记。",
      accessibility: "无障碍声明:WCAG 2.1 AA 目标、交互件的设计原则、已知缺口、兼容性与联系方式。",
      "letter-kit": "如何引用《Inside the Machine》,以及如何告诉我们你用它上过课:可选的报告、来信骨架,以及我们永远不会要的东西。",
    },
    cite: {
      heading: "如何引用",
      copy: "复制",
      copied: "已复制",
      note: "课堂版与旗舰长文共用同一个引用对象(PRODUCT.md §1.4)。arXiv 预印本即将发布,发布后请改引预印本。",
    },
  },

  footer: () => (
    <>Inside the Machine · 课堂版 · 永久免费 · 无账号、无追踪,学生打的字不离开自己的设备 · <a href="#/essays">长文系列</a></>
  ),
};
