import { useLang, type Lang } from "../../../content/i18n";
import type { M1Strings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/** Module 1's tables, bound to the series-global language store. */
export const STRINGS: Record<Lang, M1Strings> = { en, zh };

export function useM1Strings(): M1Strings {
  return STRINGS[useLang()];
}
