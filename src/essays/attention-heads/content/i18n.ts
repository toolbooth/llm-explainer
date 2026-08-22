import { useLang, type Lang } from "../../../content/i18n";
import type { Essay3Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/**
 * Essay #3's strings tables, bound to the series-global language store —
 * the "two-line hook over its own tables" pattern from src/series/README.md.
 */
export const STRINGS: Record<Lang, Essay3Strings> = { en, zh };

export function useEssay3Strings(): Essay3Strings {
  return STRINGS[useLang()];
}
