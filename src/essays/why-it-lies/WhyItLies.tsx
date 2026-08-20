import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import { LangToggle } from "../../content/i18n";
import Gamble from "../../acts/Gamble";
import TheLoop from "../../acts/TheLoop";
import ReRoll from "./ReRoll";
import MoreInSeries from "../../series/MoreInSeries";
import DraftBadge from "../../series/DraftBadge";
import { useEssay2Strings } from "./content/i18n";

/**
 * Essay #2 — "Why It Lies" (它为什么说谎). Four sections, each an
 * independently linkable widget (#/essays/why-it-lies/sec-N): the blueprint
 * is essays/02-why-it-lies/OUTLINE.md. One new widget (ReRoll); §1/§4 reuse
 * Gamble and §2 reuses TheLoop via their strings props.
 */

// Live data fed to English-trained models — stays English in every locale
// (the zh §1 prose tells the reader so).
const UNKNOWABLE_PRESETS = ["The capital of Atlantis is", "The winner of the 2031 World Cup was"];
const CITATION_PRESET = "References: [1]";
const SHAPE_PRESETS = ["The capital of France is", "The capital of Atlantis is"];

export default function WhyItLies() {
  const engine = useMemo(() => createEngine(), []);
  const t = useEssay2Strings();

  // Document chrome follows the language, same as the flagship's useI18n.
  useEffect(() => {
    document.title = t.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  }, [t]);

  // Deep links: #/essays/why-it-lies/<section-id> scrolls to that widget.
  useEffect(() => {
    const m = /^#\/essays\/why-it-lies\/([\w-]+)/.exec(location.hash);
    if (m) document.getElementById(m[1])?.scrollIntoView();
  }, []);

  return (
    <article className="essay">
      <header className="hero">
        <div className="lang-row">
          <LangToggle />
        </div>
        <p className="kicker">
          {t.hero.kicker}
          <DraftBadge essayId="why-it-lies" />
        </p>
        <h1>{t.hero.title}</h1>
        <p className="subtitle">{t.hero.subtitle}</p>
      </header>

      <section className="prose">
        <p>{t.intro.p1()}</p>
        <p>{t.intro.p2()}</p>
      </section>

      <section className="prose">
        <h2>{t.sec1.heading}</h2>
        <p>{t.sec1.p1()}</p>
        <p>{t.sec1.p2()}</p>
      </section>
      <Gamble
        engine={engine}
        strings={t.sec1.widget}
        htmlId="sec-1"
        initialText="The capital of Atlantis is"
        presets={UNKNOWABLE_PRESETS}
      />

      <section className="prose">
        <h2>{t.sec2.heading}</h2>
        <p>{t.sec2.p1()}</p>
        <p>{t.sec2.p2()}</p>
      </section>
      <TheLoop engine={engine} strings={t.sec2.widget} htmlId="sec-2" initialPrompt={CITATION_PRESET} />

      <section className="prose">
        <h2>{t.sec3.heading}</h2>
        <p>{t.sec3.p1()}</p>
        <p>{t.sec3.p2()}</p>
      </section>
      <ReRoll
        engine={engine}
        strings={t.sec3.widget}
        htmlId="sec-3"
        initialText="The capital of France is"
        presets={SHAPE_PRESETS}
      />

      <section className="prose">
        <h2>{t.sec4.heading}</h2>
        <p>{t.sec4.p1()}</p>
        <p>{t.sec4.p2()}</p>
      </section>
      <Gamble
        engine={engine}
        strings={t.sec4.widget}
        htmlId="sec-4"
        initialText="The capital of France is"
        presets={SHAPE_PRESETS}
      />

      <section className="prose">
        <h2>{t.outro.heading}</h2>
        <p>{t.outro.p1()}</p>
        <p>{t.outro.p2()}</p>
        <p>{t.outro.p3()}</p>
      </section>

      <MoreInSeries currentId="why-it-lies" />

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
