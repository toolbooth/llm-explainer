import type { MouseEvent } from "react";

/** "Step 1" / "第 1 步" for the small label in front of a step title. */
export function stepNum(htmlLang: string, n: number): string {
  return htmlLang === "zh" ? `第 ${n} 步` : `Step ${n}`;
}

/**
 * The beat nav scrolls within the page without rewriting the route hash
 * (those ids are not routes; only step-N is). Keyboard: the links are real
 * anchors, so Enter works; href stays meaningful if JS is off.
 */
export function jumpTo(e: MouseEvent<HTMLAnchorElement>, id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
