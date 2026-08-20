import { useLang } from "../content/i18n";
import { essayHref, publishedEssays } from "./registry";

const HEADING = { en: "More in this series", zh: "本系列更多文章" } as const;

/**
 * Rendered at the end of an essay: every OTHER published essay in the series.
 * While the series has a single published essay this renders nothing at all,
 * so essay #1's DOM stays byte-identical until essay #2 actually ships.
 */
export default function MoreInSeries({ currentId }: { currentId: string }) {
  const lang = useLang();
  const others = publishedEssays().filter((e) => e.id !== currentId);
  if (others.length === 0) return null;
  return (
    <section className="prose series-more">
      <h2>{HEADING[lang]}</h2>
      <ul className="series-list">
        {others.map((e) => (
          <li key={e.id}>
            <a href={essayHref(e)}>{e.title[lang]}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
