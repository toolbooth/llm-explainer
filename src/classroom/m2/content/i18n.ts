import { useLang, type Lang } from "../../../content/i18n";
import type { M2Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/** Module 2's tables, bound to the series-global language store. */
export const STRINGS: Record<Lang, M2Strings> = { en, zh };

export function useM2Strings(): M2Strings {
  return STRINGS[useLang()];
}
