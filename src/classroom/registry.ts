/**
 * The module registry for the Classroom Edition — the six-module plan from
 * classroom-edition/PRODUCT.md §4.2, in order. Only `status: "available"`
 * modules get a page and a link; "planned" entries exist so the classroom
 * index can show teachers the whole sequence without promising dates.
 *
 * Deliberately NOT an ESSAYS entry: the classroom family never appears in
 * the essay series index or any essay's "More in this series".
 */
import type { Lang } from "../content/i18n";

export type ModuleId = "m1" | "m2" | "m3" | "m4" | "m5" | "m6";
export type ModuleStatus = "available" | "planned";

export interface ModuleMeta {
  id: ModuleId;
  /** 1-based module number as teachers refer to it. */
  num: number;
  title: Record<Lang, string>;
  /** The module's core question, in student language. */
  question: Record<Lang, string>;
  status: ModuleStatus;
  /** Has a Slides companion page (#/classroom/<id>/slides) — MVP: M2 only (§10.1). */
  slides?: boolean;
}

export const MODULES: readonly ModuleMeta[] = [
  {
    id: "m1",
    num: 1,
    title: { en: "The Word Chopper", zh: "切词机" },
    question: {
      en: "What does the model actually see when I type a sentence?",
      zh: "我打一句话进去，模型到底看见了什么？",
    },
    status: "available",
  },
  {
    id: "m2",
    num: 2,
    title: { en: "The Next-Word Gamble", zh: "下一个词的赌局" },
    question: { en: "Is the model choosing, or rolling dice?", zh: "模型是在选，还是在掷骰子？" },
    status: "available",
    slides: true,
  },
  {
    id: "m3",
    num: 3,
    title: { en: "Where It Looks", zh: "它在看哪里" },
    question: {
      en: "When the model predicts, which earlier words does it use?",
      zh: "模型预测的时候，用到了前面哪些词？",
    },
    status: "planned",
  },
  {
    id: "m4",
    num: 4,
    title: { en: "Why It Lies", zh: "它为什么说谎" },
    question: {
      en: "Why does something that sounds confident get things wrong?",
      zh: "为什么一个听起来很自信的东西会答错？",
    },
    status: "planned",
  },
  {
    id: "m5",
    num: 5,
    title: { en: "Why It Can't Count", zh: "为什么数不出 strawberry 有几个 r" },
    question: {
      en: "Which tasks does tokenization quietly sabotage?",
      zh: "哪些任务被切词悄悄拖了后腿？",
    },
    status: "planned",
  },
  {
    id: "m6",
    num: 6,
    title: { en: "What It Learned From", zh: "它从哪里学来的" },
    question: { en: "Where do the model's “opinions” come from?", zh: "模型的“观点”是从哪儿来的？" },
    status: "planned",
  },
];

export function availableModules(): ModuleMeta[] {
  return MODULES.filter((m) => m.status === "available");
}

export function moduleById(id: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.id === id);
}
