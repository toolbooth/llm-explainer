import { LangToggle, useLang } from "../content/i18n";
import { essayHref, publishedEssays } from "./registry";

/**
 * The series index, reachable at #/essays. Series chrome strings live here,
 * NOT in the essay content tables — each essay owns its prose, the series
 * owns its own furniture.
 */
const UI = {
  en: {
    kicker: "AN INTERACTIVE ESSAY SERIES · RUNS ENTIRELY IN YOUR BROWSER",
    subtitle:
      "Interactive essays on how language models actually work — real models, dissected live in your tab.",
    classroom: "Teaching this? Classroom Edition →",
  },
  zh: {
    kicker: "互动长文系列 · 全部在你的浏览器里运行",
    subtitle: "一系列让你亲手解剖语言模型的互动长文——真实的模型，在你的标签页里被现场解剖。",
    classroom: "要拿去上课？课堂版 →",
  },
} as const;

export default function SeriesIndex() {
  const lang = useLang();
  const ui = UI[lang];
  return (
    <article className="essay">
      <header className="hero">
        <div className="lang-row">
          <LangToggle />
        </div>
        <p className="kicker">{ui.kicker}</p>
        <h1>Inside the Machine</h1>
        <p className="subtitle">{ui.subtitle}</p>
      </header>
      <section className="prose">
        <ol className="series-list">
          {publishedEssays().map((e) => (
            <li key={e.id}>
              <a href={essayHref(e)}>{e.title[lang]}</a>
            </li>
          ))}
        </ol>
        <p className="series-classroom">
          <a href="#/classroom">{ui.classroom}</a>
        </p>
      </section>
    </article>
  );
}
