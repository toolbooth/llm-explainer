import { useClassroomStrings } from "../content/i18n";
import { classroomHref } from "../route";

/**
 * The one-line row of links to the seven shared front-matter pages, shown
 * under the model-card / privacy cards of every module guide (PRODUCT.md §5:
 * the per-module guide sits behind the shared front matter). Prints as
 * plain text so a printed guide still names the pages.
 */
export default function FrontMatterLinks() {
  const t = useClassroomStrings();
  return (
    <p className="cl-front-row">
      <span className="cl-front-k">{t.frontMatter.guideLine}:</span>
      {t.frontMatter.items.map((it) => (
        <a key={it.slug} href={classroomHref({ kind: "about", slug: it.slug })}>
          {it.label}
        </a>
      ))}
    </p>
  );
}
