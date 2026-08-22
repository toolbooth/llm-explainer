import { useLang, type Lang } from "../../../content/i18n";
import type { Essay4Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/**
 * Essay #4's strings tables, bound to the series-global language store —
 * the "two-line hook over its own tables" pattern from src/series/README.md.
 */
export const STRINGS: Record<Lang, Essay4Strings> = { en, zh };

export function useEssay4Strings(): Essay4Strings {
  return STRINGS[useLang()];
}
