import { useEffect, useRef, useState } from "react";
import { useLang } from "../content/i18n";
import ClassroomFrame from "./ClassroomFrame";
import TableWrap from "./TableWrap";
import { ORIGIN_PLACEHOLDER, embedOrigin } from "./config";
import { useClassroomStrings } from "./content/i18n";
import type { ClassroomStrings } from "./content/types";
import { cleanUrl, embedSnippet, embedTargets, embedWidgets, previewUrl, type EmbedTarget } from "./embed";
import { useM1Strings } from "./m1/content/i18n";
import { useM2Strings } from "./m2/content/i18n";
import type { EmbedWidgetId } from "./route";

/**
 * `#/classroom/embed` — the embed kit (PRODUCT.md §6.4, §10.1 item 6):
 * copy-paste snippets and clean URLs for every embeddable thing, plus a
 * live preview of each single-widget surface (a real iframe of
 * `#/classroom/embed/<widget>`, same origin, `mockModel` carried through
 * so the previews are deterministic under `?mockModel=1`). Everything
 * printed here comes from the shared pure helpers in embed.ts — the same
 * ones §14 of each teacher guide renders — so the page, the guides and
 * test/embed.test.ts can never disagree about a URL.
 */

/** Copy to clipboard; if the clipboard is unavailable, reveal the text in a selectable <pre> instead. */
function CopyButton({ text, label, ariaLabel, strings }: { text: string; label?: string; ariaLabel: string; strings: ClassroomStrings }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setRevealed(true);
    }
  }

  return (
    <>
      <button type="button" className={`btn ghost cl-copy${copied ? " done" : ""}`} onClick={copy} aria-live="polite" aria-label={ariaLabel}>
        {copied ? strings.embed.copied : label ?? strings.embed.copy}
      </button>
      {revealed && (
        <pre className="cl-embed" tabIndex={0} role="group" aria-label={strings.a11y.codeRegion}>
          <code>{text}</code>
        </pre>
      )}
    </>
  );
}

export default function EmbedPage() {
  const lang = useLang();
  const c = useClassroomStrings();
  const t = c.embed;
  const m1 = useM1Strings();
  const m2 = useM2Strings();
  const mock = typeof location !== "undefined" && new URLSearchParams(location.search).has("mockModel");
  const origin = embedOrigin();

  const widgetTitles: Record<EmbedWidgetId, string> = {
    chopper: m1.hook.widget.title,
    gamble: m2.explore.step1Widget.title,
    "hundred-rolls": m2.explore.step2Widget.title,
  };

  const kindLabel = (target: EmbedTarget): string => {
    const p = target.page;
    if (p.kind === "module") return p.step === null ? t.kinds.module : t.kinds.step(p.step);
    if (p.kind === "guide") return t.kinds.guide;
    if (p.kind === "unplugged") return t.kinds.unplugged;
    return t.kinds.slides;
  };

  return (
    <ClassroomFrame
      docTitle={t.docTitle}
      metaDescription={t.metaDescription}
      className="cl-embed-kit"
      title={t.title}
      subtitle={t.subtitle}
      current="embed"
      showPrint
    >
      <section className="prose">
        <p className="cl-card">{t.contract()}</p>
        {origin.placeholder && <p className="cl-card">{t.placeholderNote(ORIGIN_PLACEHOLDER)}</p>}
        <p className="dim">{t.langNote}</p>
        <h2>{t.googleClassroom.heading}</h2>
        <p>{t.googleClassroom.intro()}</p>
        <h2>{t.canvas.heading}</h2>
        <p>{t.canvas.intro()}</p>
        <p className="dim">{t.canvas.editModeNote}</p>
      </section>

      <section className="prose">
        <h2>{t.widgetsHeading}</h2>
        <p>{t.widgetsIntro()}</p>
      </section>

      {embedWidgets().map((w) => {
        const title = widgetTitles[w.id];
        const url = cleanUrl(w.page, lang);
        const snippet = embedSnippet({
          page: w.page,
          lang,
          title: t.frameTitle(title),
          openLabel: t.openLabel(title),
          height: w.height,
        });
        return (
          <section className="prose cl-embed-card" key={w.id}>
            <h3>
              {c.index.moduleLabel(w.module.num)} · {title}
            </h3>
            <p>{t.widgets[w.id].blurb}</p>
            <p className="cl-embed-url">
              <span className="cl-embed-k">{t.urlLabel}</span> <code>{url}</code>
            </p>
            <p className="cl-embed-k">{t.snippetLabel}</p>
            <pre className="cl-embed" tabIndex={0} role="group" aria-label={c.a11y.codeRegion}>
              <code>{snippet}</code>
            </pre>
            <p className="cl-copy-row">
              <CopyButton text={snippet} ariaLabel={`${t.copy} — ${title}`} strings={c} />
            </p>
            <figure className="cl-embed-preview cl-noprint">
              <figcaption className="cl-embed-k">{t.preview}</figcaption>
              <iframe
                src={previewUrl(w.page, lang, mock)}
                width="100%"
                height={w.height}
                title={t.frameTitle(title)}
                loading="lazy"
              ></iframe>
            </figure>
          </section>
        );
      })}

      <section className="prose">
        <h2>{t.pagesHeading}</h2>
        <p>{t.pagesIntro()}</p>
        <TableWrap label={c.a11y.tableRegion}>
          <table className="cl-embed-table">
            <thead>
              <tr>
                <th scope="col">{t.table.what}</th>
                <th scope="col">{t.table.url}</th>
                <th scope="col">{t.table.height}</th>
                <th scope="col">{t.table.snippet}</th>
              </tr>
            </thead>
            <tbody>
              {embedTargets().map((target) => {
                const label = `${target.module.title[lang]} · ${kindLabel(target)}`;
                const url = cleanUrl(target.page, lang);
                const snippet = embedSnippet({
                  page: target.page,
                  lang,
                  title: t.frameTitle(label),
                  openLabel: t.openLabel(label),
                  height: target.height,
                });
                return (
                  <tr key={target.id}>
                    <td>
                      {c.index.moduleLabel(target.module.num)} · {kindLabel(target)}
                    </td>
                    <td>
                      <code>{url}</code>
                    </td>
                    <td>{target.height}</td>
                    <td>
                      <CopyButton text={snippet} ariaLabel={`${t.copy} — ${label}`} strings={c} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      </section>
    </ClassroomFrame>
  );
}
