import { useLang, type Lang } from "../../content/i18n";
import type { ClassroomStrings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

/** The classroom chrome tables, bound to the series-global language store. */
export const STRINGS: Record<Lang, ClassroomStrings> = { en, zh };

export function useClassroomStrings(): ClassroomStrings {
  return STRINGS[useLang()];
}
