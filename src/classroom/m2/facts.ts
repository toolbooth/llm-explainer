import type { HookFacts } from "./content/types";
import { HOOK_RUNS, MEASURED, PARK_RUN, TEN_RUNS_FAVOURITE, THOUSAND_ROLLS } from "./data";

/**
 * The numbers the prose quotes, derived once from data.ts so every page
 * (lesson, guide, slides) says the same thing and a re-measurement changes
 * them everywhere at once.
 */
export function hookFacts(): HookFacts {
  const h = MEASURED.hook;
  const t15 = HOOK_RUNS.t15;
  let w = 0;
  for (let i = 1; i < t15.length; i++) if (t15[i] > t15[w]) w = i;
  return {
    favourite: h.t10[0].label,
    p10: h.t10[0].p,
    p05: h.t05[0].p,
    p15: h.t15[0].p,
    run10: HOOK_RUNS.t10[0],
    run05: HOOK_RUNS.t05[0],
    run15: HOOK_RUNS.t15[0],
    winner15: h.t15[w].label,
    winner15Count: t15[w],
    tenMin: Math.min(...TEN_RUNS_FAVOURITE),
    tenMax: Math.max(...TEN_RUNS_FAVOURITE),
    thousand: THOUSAND_ROLLS.favourite,
    parkP: MEASURED.park.t10[0].p,
    parkRun: PARK_RUN[0],
    timP: MEASURED.boy.t10[0].p,
    andP: MEASURED.grass.t10[0].p,
    watchedP: MEASURED.grassAnd.t10[0].p,
    commaP: MEASURED.loop.t10[0].p,
    thereP: MEASURED.loop.t10[1].p,
  };
}

/** The block extension's numbers: "Two plus two is" → favourite, and where " four" sits. */
export function twoPlusTwoFacts(): { favourite: string; favouriteP: number; fourP: number } {
  const t = MEASURED.twoPlusTwo.t10;
  const four = t.find((c) => c.label === " four");
  return { favourite: t[0].label, favouriteP: t[0].p, fourP: four?.p ?? 0 };
}
