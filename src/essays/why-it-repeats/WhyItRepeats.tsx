import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import { LangToggle } from "../../content/i18n";
import Gamble from "../../acts/Gamble";
import Parrot from "./Parrot";
import MoreInSeries from "../../series/MoreInSeries";
import DraftBadge from "../../series/DraftBadge";
import { useEssay5Strings } from "./content/i18n";

/**
 * Essay #5 — "Why It Repeats Itself" (为什么它复读). Three widget sections
 * plus a prose-only Act 4, each independently linkable
 * (#/essays/why-it-repeats/sec-N): the blueprint is
 * essays/05-why-it-repeats/OUTLINE.md. One new widget (Parrot, §1 and §3);
 * §2 reuses Gamble in nano mode. Every widget runs on the shared 7.5MB
 * brain — this essay never wakes the big model.
 */

// Live data fed to an English-trained model — stays English in every locale
// (the zh intro tells the reader so). All three Parrot presets loop under
// greedy decoding on the real weights (measured 2026-09-15; REVIEW-05.md):
// Tom and Lily → "It was red and blue." ×5, The man said → "You have to be
// careful and respectful." ×3+, The bird flew up. → a ×4 quasi-loop that
// escapes on its own and ends the story.
const PARROT_PRESETS = ["Tom and Lily went to the park.", "The man said", "The bird flew up."];
// The Act-2 presets: the same sentence once, twice, three times — the reader
// watches the " The" bar climb (measured: 26% → 51% → 59%).
const ENCORE = "The cat sat on the mat.";
const ENCORE_PRESETS = [ENCORE, `${ENCORE} ${ENCORE}`, `${ENCORE} ${ENCORE} ${ENCORE}`];

export default function WhyItRepeats() {
  const engine = useMemo(() => createEngine(), []);
  const t = useEssay5Strings();

  // Document chrome follows the language, same as the flagship's useI18n.
  useEffect(() => {
    document.title = t.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  }, [t]);

  // Deep links: #/essays/why-it-repeats/<section-id> scrolls to that widget.
  useEffect(() => {
    const m = /^#\/essays\/why-it-repeats\/([\w-]+)/.exec(location.hash);
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
          <DraftBadge essayId="why-it-repeats" />
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
      <Parrot
        engine={engine}
        strings={t.sec1.widget}
        htmlId="sec-1"
        initialPrompt={PARROT_PRESETS[0]}
        presets={PARROT_PRESETS}
        initialGreedy
      />

      <section className="prose">
        <h2>{t.sec2.heading}</h2>
        <p>{t.sec2.p1()}</p>
        <p>{t.sec2.p2()}</p>
      </section>
      <Gamble
        engine={engine}
        strings={t.sec2.widget}
        htmlId="sec-2"
        model="nano"
        initialText={ENCORE_PRESETS[0]}
        presets={ENCORE_PRESETS}
      />

      <section className="prose">
        <h2>{t.sec3.heading}</h2>
        <p>{t.sec3.p1()}</p>
        <p>{t.sec3.p2()}</p>
      </section>
      <Parrot
        engine={engine}
        strings={t.sec3.widget}
        htmlId="sec-3"
        initialPrompt={PARROT_PRESETS[1]}
        presets={PARROT_PRESETS}
        initialGreedy
        initialTemperature={0.3}
      />

      <section className="prose" id="sec-4">
        <h2>{t.sec4.heading}</h2>
        <p>{t.sec4.p1()}</p>
        <p>{t.sec4.p2()}</p>
      </section>

      <section className="prose">
        <h2>{t.outro.heading}</h2>
        <p>{t.outro.p1()}</p>
        <p>{t.outro.p2()}</p>
        <p>{t.outro.p3()}</p>
      </section>

      <MoreInSeries currentId="why-it-repeats" />

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
