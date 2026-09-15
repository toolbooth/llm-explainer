import { useEffect, useMemo } from "react";
import { createEngine } from "../lib/engine";
import Chopper from "../acts/Chopper";
import Gamble from "../acts/Gamble";
import { useLang } from "../content/i18n";
import { LIGHT_ROOT_CLASS, LIGHT_THEME_COLOR } from "./ClassroomFrame";
import { CLASSROOM } from "./config";
import { useClassroomStrings } from "./content/i18n";
import { WIDGET_MODULE, cleanUrl } from "./embed";
import HundredRolls from "./m2/HundredRolls";
import { moduleById } from "./registry";
import type { EmbedWidgetId } from "./route";
import { useM1Strings } from "./m1/content/i18n";
import { useM2Strings } from "./m2/content/i18n";
import { HOOK_TEXT as M1_HOOK_TEXT } from "./m1/data";
import { STEP_PRESETS } from "./m2/data";

/**
 * `#/classroom/embed/<widget>` — one widget alone, sized for a fixed-height
 * LMS iframe (PRODUCT.md §6.4): no lesson text, no hints, no nav — the
 * instrument plus a visible attribution backlink to insidethemachine.org
 * (which is also the student's way out to the full lesson). The widget is
 * the same component the lesson page mounts, with the same strings, the
 * classroom temperature cap and the a11y chrome; only the small "step"
 * chip is replaced by the module label, since there is no step here.
 * Everything loads from this origin; under `?mockModel=1` the page is
 * deterministic (the audit and the embed kit's live previews rely on it).
 */
export default function EmbedWidgetPage({ widget }: { widget: EmbedWidgetId }) {
  const engine = useMemo(() => createEngine(), []);
  const lang = useLang();
  const c = useClassroomStrings();
  const m1 = useM1Strings();
  const m2 = useM2Strings();
  const mod = moduleById(WIDGET_MODULE[widget])!;
  const chip = c.index.moduleLabel(mod.num);
  const cap = CLASSROOM.maxTemperature;

  const title =
    widget === "chopper" ? m1.hook.widget.title : widget === "gamble" ? m2.explore.step1Widget.title : m2.explore.step2Widget.title;

  // Document chrome — same duties as ClassroomFrame, without its furniture.
  useEffect(() => {
    document.title = c.embed.frameTitle(title);
    document.documentElement.lang = c.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", c.embed.widgets[widget].blurb);
  }, [c, title, widget]);

  // Light theme for the frame's host page (projectors, LMS pages are light).
  useEffect(() => {
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const darkThemeColor = themeMeta?.getAttribute("content") ?? null;
    root.classList.add(LIGHT_ROOT_CLASS);
    themeMeta?.setAttribute("content", LIGHT_THEME_COLOR);
    return () => {
      root.classList.remove(LIGHT_ROOT_CLASS);
      if (darkThemeColor !== null) themeMeta?.setAttribute("content", darkThemeColor);
    };
  }, []);

  const backlink = cleanUrl({ kind: "module", id: mod.id, step: null }, lang);

  return (
    <article className="essay classroom cl-embed-page">
      <main className="cl-embed-main">
        <h1 className="cl-sr-only">{c.embed.frameTitle(title)}</h1>
        {widget === "chopper" && (
          <Chopper
            engine={engine}
            strings={{ ...m1.hook.widget, num: chip }}
            htmlId="embed-widget"
            initialText={M1_HOOK_TEXT}
            inputLabel={m1.hook.widget.title}
            a11y={c.a11y}
          />
        )}
        {widget === "gamble" && (
          <Gamble
            engine={engine}
            strings={{ ...m2.explore.step1Widget, num: chip }}
            htmlId="embed-widget"
            initialText={STEP_PRESETS[0]}
            presets={STEP_PRESETS}
            maxTemperature={cap}
            model="nano"
            a11y={c.a11y}
          />
        )}
        {widget === "hundred-rolls" && (
          <HundredRolls
            engine={engine}
            strings={{ ...m2.explore.step2Widget, num: chip }}
            htmlId="embed-widget"
            initialText={STEP_PRESETS[0]}
            presets={STEP_PRESETS}
            maxTemperature={cap}
            a11y={c.a11y}
          />
        )}
      </main>
      <footer className="cl-attrib" role="contentinfo">
        <p>
          {c.embed.attribution.pre}{" "}
          <a href={backlink} target="_blank" rel="noreferrer">
            {c.embed.attribution.site}
          </a>{" "}
          {c.embed.attribution.suffix}
        </p>
      </footer>
    </article>
  );
}
