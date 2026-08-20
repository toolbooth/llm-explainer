import { useLang } from "../content/i18n";
import { ESSAYS } from "./registry";

const LABEL = { en: "DRAFT", zh: "草稿" } as const;

/**
 * Small pill shown in an essay's hero while its registry entry is a draft —
 * the direct-URL review copy announces itself. Flipping the entry to
 * "published" makes this render nothing, with no per-essay wiring to undo.
 */
export default function DraftBadge({ essayId }: { essayId: string }) {
  const lang = useLang();
  const essay = ESSAYS.find((e) => e.id === essayId);
  if (!essay || essay.status !== "draft") return null;
  return <span className="draft-badge">{LABEL[lang]}</span>;
}
