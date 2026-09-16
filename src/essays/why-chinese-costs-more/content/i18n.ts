import { useLang, type Lang } from "../../../content/i18n";
import type { Essay7Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/**
 * Essay #7's strings tables, bound to the series-global language store —
 * the "two-line hook over its own tables" pattern from src/series/README.md.
 * (zh is this essay's primary text; the store neither knows nor cares —
 * the toggle works exactly as on every other page.)
 */
export const STRINGS: Record<Lang, Essay7Strings> = { en, zh };

export function useEssay7Strings(): Essay7Strings {
  return STRINGS[useLang()];
}
