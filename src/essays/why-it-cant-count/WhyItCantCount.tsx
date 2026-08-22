import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import { LangToggle } from "../../content/i18n";
import Chopper from "../../acts/Chopper";
import Gamble from "../../acts/Gamble";
import TokenizerXray from "./TokenizerXray";
import { countingPrompts } from "./xray";
import MoreInSeries from "../../series/MoreInSeries";
import DraftBadge from "../../series/DraftBadge";
import { useEssay4Strings } from "./content/i18n";

/**
 * Essay #4 — "Why It Can't Count" (为什么 AI 数不出 strawberry 有几个 r).
 * Four sections, each an independently linkable widget
 * (#/essays/why-it-cant-count/sec-N): the blueprint is
 * essays/04-why-it-cant-count/OUTLINE.md. One new widget (TokenizerXray,
 * §2); §1 reuses Chopper via its lifted strings prop, §3/§4 reuse Gamble.
 */

// Live data fed to English-trained models — stays English in every locale
// (the zh §1 prose tells the reader so). The word is bare (no leading
// space) on purpose: that is the form that chops into st · raw · berry.
const SEC1_TEXT = "strawberry";
const XRAY_WORD = "strawberry";
const XRAY_LETTER = "r";
// Arithmetic presets end in a bare space so the next token lands on a digit
// (the Act-4 vocabulary puts its own space token before a number).
const ARITH_PRESETS = ["47 * 23 = ", "Q: What is 47 * 23? A: 47 * 23 = ", "47 * 23 = 10", "1234 + 5678 = "];
// The §4 presets are the X-ray's own prompts, so the two widgets agree.
const COUNT = countingPrompts(XRAY_WORD, XRAY_LETTER);
const FIX_PRESETS = [COUNT.straight, COUNT.spelled, COUNT.tallied];

export default function WhyItCantCount() {
  const engine = useMemo(() => createEngine(), []);
  const t = useEssay4Strings();

  // Document chrome follows the language, same as the flagship's useI18n.
  useEffect(() => {
    document.title = t.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  }, [t]);

  // Deep links: #/essays/why-it-cant-count/<section-id> scrolls to that widget.
  useEffect(() => {
    const m = /^#\/essays\/why-it-cant-count\/([\w-]+)/.exec(location.hash);
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
          <DraftBadge essayId="why-it-cant-count" />
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
      <Chopper engine={engine} strings={t.sec1.widget} htmlId="sec-1" initialText={SEC1_TEXT} />

      <section className="prose">
        <h2>{t.sec2.heading}</h2>
        <p>{t.sec2.p1()}</p>
        <p>{t.sec2.p2()}</p>
      </section>
      <TokenizerXray
        engine={engine}
        strings={t.sec2.widget}
        htmlId="sec-2"
        initialWord={XRAY_WORD}
        initialLetter={XRAY_LETTER}
      />

      <section className="prose">
        <h2>{t.sec3.heading}</h2>
        <p>{t.sec3.p1()}</p>
        <p>{t.sec3.p2()}</p>
      </section>
      <Gamble
        engine={engine}
        strings={t.sec3.widget}
        htmlId="sec-3"
        initialText={ARITH_PRESETS[0]}
        presets={ARITH_PRESETS}
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
        initialText={FIX_PRESETS[0]}
        presets={FIX_PRESETS}
      />

      <section className="prose">
        <h2>{t.outro.heading}</h2>
        <p>{t.outro.p1()}</p>
        <p>{t.outro.p2()}</p>
        <p>{t.outro.p3()}</p>
      </section>

      <MoreInSeries currentId="why-it-cant-count" />

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
