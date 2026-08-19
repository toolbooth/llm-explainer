import type { EssayStrings } from "./types";
import { en } from "./en";

/**
 * Step 1 of the i18n refactor: prose lives in content modules, components
 * consume it through this hook. Only English exists yet — the language store
 * (?lang= / localStorage / navigator.language resolution, toggle, <html lang>
 * and <title> swap) lands together with the zh table in the next commit.
 */
export function useStrings(): EssayStrings {
  return en;
}
