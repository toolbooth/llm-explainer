import { useLang, type Lang } from "../../../content/i18n";
import type { Essay2Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/**
 * Essay #2's strings tables, bound to the series-global language store —
 * the "two-line hook over its own tables" pattern from src/series/README.md.
 */
export const STRINGS: Record<Lang, Essay2Strings> = { en, zh };

export function useEssay2Strings(): Essay2Strings {
  return STRINGS[useLang()];
}
