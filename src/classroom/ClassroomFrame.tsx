import { useEffect, type ReactNode } from "react";
import { LangToggle } from "../content/i18n";
import { useClassroomStrings } from "./content/i18n";
import { classroomHref, type ClassroomPage } from "./route";
import type { ModuleId } from "./registry";

/** Root class that switches the series tokens to the light palette (classroom.css). */
export const LIGHT_ROOT_CLASS = "classroom-light";
/** `<meta name="theme-color">` while a classroom page is up (the light page background). */
export const LIGHT_THEME_COLOR = "#ffffff";

/**
 * The frame every classroom page shares: language toggle, the small nav
 * row (index / lesson / guide / printable / print), the hero, and the footer.
 * Document chrome (<title>, <meta description>, <html lang>) follows the
 * page, as the essays do. Pages pass their own hero copy; the series kicker
 * is shared.
 */
export default function ClassroomFrame(props: {
  docTitle: string;
  metaDescription: string;
  /** Extra class on the <article> ("cl-guide", "cl-sheet-page"…). */
  className?: string;
  kicker?: string;
  title: string;
  /** Rendered under the title: the module's core question or a subtitle. */
  subtitle?: ReactNode;
  subtitleClass?: string;
  /** Which module the nav points at (absent on the index). */
  moduleId?: ModuleId;
  /** Which of the module's three pages this is (drops its own nav link). */
  current?: ClassroomPage["kind"];
  showPrint?: boolean;
  children: ReactNode;
}) {
  const t = useClassroomStrings();

  useEffect(() => {
    document.title = props.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", props.metaDescription);
  }, [props.docTitle, props.metaDescription, t.htmlLang]);

  // Light theme for projectors (classroom.css, scoped to this root class).
  // Set on <html> while any classroom page is mounted and removed on the way
  // out, so the essays — which never mount this frame — stay dark; the
  // hash baseline in HASHES.md covers #root's innerHTML, which this never touches.
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

  const id = props.moduleId;
  return (
    <article className={`essay classroom${props.className ? ` ${props.className}` : ""}`}>
      <header className="hero">
        <div className="lang-row">
          <LangToggle />
        </div>
        <nav className="cl-nav" aria-label="Classroom">
          {props.current !== "index" && <a href={classroomHref({ kind: "index" })}>{t.nav.index}</a>}
          {id && props.current !== "module" && (
            <a href={classroomHref({ kind: "module", id, step: null })}>{t.nav.module}</a>
          )}
          {id && props.current !== "guide" && <a href={classroomHref({ kind: "guide", id })}>{t.nav.guide}</a>}
          {id && props.current !== "unplugged" && (
            <a href={classroomHref({ kind: "unplugged", id })}>{t.nav.unplugged}</a>
          )}
          {props.showPrint && (
            <button type="button" onClick={() => window.print()}>
              {t.nav.print}
            </button>
          )}
        </nav>
        <p className="kicker">{props.kicker ?? t.kicker}</p>
        <h1>{props.title}</h1>
        {props.subtitle && <p className={props.subtitleClass ?? "subtitle"}>{props.subtitle}</p>}
      </header>

      {props.children}

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
