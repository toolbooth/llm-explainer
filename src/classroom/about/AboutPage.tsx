import { useMemo } from "react";
import { useLang } from "../../content/i18n";
import { FLAGSHIP_BIBTEX } from "../../content/citation";
import CiteThis from "../../series/CiteThis";
import ClassroomFrame from "../ClassroomFrame";
import { useClassroomStrings } from "../content/i18n";
import { classroomHref } from "../route";
import Markdown from "./Markdown";
import { inlineText, parseMarkdown, type Block } from "./md";
import { ABOUT_DOCS } from "./registry";
import { ABOUT_SLUGS, type AboutSlug } from "./slugs";

/**
 * One shared front-matter page (#/classroom/about/<slug>): the document's
 * own h1 is the hero title, the rest renders through Markdown.tsx; a
 * seven-page sub-nav sits under the hero; the source line at the foot names
 * the draft the text came from. The letter kit additionally carries the
 * series' "Cite this" block (PRODUCT.md §5 item 8: how to cite *and* how to
 * tell us). Parts in another language than the page (the 中文 letter kit's
 * English body) are wrapped in their own `lang`.
 */
export default function AboutPage({ slug }: { slug: AboutSlug }) {
  const lang = useLang();
  const t = useClassroomStrings();
  const doc = ABOUT_DOCS[slug];
  const parts = doc.parts[lang];

  const parsed = useMemo(() => parts.map((p) => ({ lang: p.lang, blocks: parseMarkdown(p.md) })), [parts]);
  // The first part's leading h1 is the page title; the body is everything after it.
  const first = parsed[0].blocks;
  const h1 = first[0]?.t === "heading" && first[0].level === 1 ? first[0] : null;
  const title = h1 ? inlineText(h1.c) : t.frontMatter.items.find((i) => i.slug === slug)?.label ?? slug;
  const body: { lang: string; blocks: Block[] }[] = parsed.map((p, i) => ({
    lang: p.lang,
    blocks: i === 0 && h1 ? p.blocks.slice(1) : p.blocks,
  }));
  const label = t.frontMatter.items.find((i) => i.slug === slug)?.label ?? title;

  return (
    <ClassroomFrame
      docTitle={`${label} — ${t.docTitle}`}
      metaDescription={t.about.descriptions[slug]}
      className={`cl-about cl-about-${slug}`}
      title={title}
      current="about"
      showPrint
    >
      <nav className="cl-about-nav cl-noprint" aria-label={t.about.navLabel}>
        {ABOUT_SLUGS.map((s) => {
          const item = t.frontMatter.items.find((i) => i.slug === s);
          return (
            <a key={s} href={classroomHref({ kind: "about", slug: s })} aria-current={s === slug ? "page" : undefined}>
              {item?.label ?? s}
            </a>
          );
        })}
      </nav>

      {slug === "letter-kit" && <CiteThis strings={t.about.cite} bibtex={FLAGSHIP_BIBTEX} />}

      {body.map((p, i) =>
        p.lang === lang ? (
          <section className="prose cl-md" key={i}>
            <Markdown blocks={p.blocks} lang={p.lang} regionLabel={t.a11y.tableRegion} />
          </section>
        ) : (
          <section className="prose cl-md" key={i} lang={p.lang}>
            <Markdown blocks={p.blocks} lang={p.lang} regionLabel={t.a11y.tableRegion} />
          </section>
        )
      )}

      <p className="dim cl-source">{t.about.sourceNote(doc.source)}</p>
    </ClassroomFrame>
  );
}
