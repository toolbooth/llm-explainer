import { useLang, type Lang } from "../../../content/i18n";
import type { Essay5Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/**
 * Essay #5's strings tables, bound to the series-global language store —
 * the "two-line hook over its own tables" pattern from src/series/README.md.
 */
export const STRINGS: Record<Lang, Essay5Strings> = { en, zh };

export function useEssay5Strings(): Essay5Strings {
  return STRINGS[useLang()];
}
