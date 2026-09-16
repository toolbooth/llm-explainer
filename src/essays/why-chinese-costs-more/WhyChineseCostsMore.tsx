import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import { LangToggle } from "../../content/i18n";
import TokenizerXray from "../why-it-cant-count/TokenizerXray";
import Meter from "./Meter";
import { METER_PRESETS, STORY_PRESETS, XRAY_CHAR, XRAY_SENTENCE } from "./corpus";
import MoreInSeries from "../../series/MoreInSeries";
import DraftBadge from "../../series/DraftBadge";
import { useEssay7Strings } from "./content/i18n";

/**
 * Essay #7 — 《中文为什么更贵》 (EN companion: "Why Chinese Costs More
 * Tokens"). Three widget sections plus a prose-only Act 4, each
 * independently linkable (#/essays/why-chinese-costs-more/sec-N); blueprint
 * in essays/07-why-chinese-costs-more/OUTLINE.md. One new widget (the
 * Bilingual Meter, §1 and §3); §2 reuses essay #4's TokenizerXray in the
 * classroom's tokenizer-only mode (tokenizer "shared", no model gate). The
 * whole page needs only the shared ~2MB tokenizer — no model is ever woken:
 * the cheapest page in the series, on purpose.
 *
 * The bilingual pairs are live data (corpus.ts), identical in both locales
 * and re-measured against the vendored tokenizer by test/essay7-data.test.ts
 * on every CI run — never stored in the content tables.
 */

export default function WhyChineseCostsMore() {
  const engine = useMemo(() => createEngine(), []);
  const t = useEssay7Strings();

  // Document chrome follows the language, same as the flagship's useI18n.
  useEffect(() => {
    document.title = t.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  }, [t]);

  // Deep links: #/essays/why-chinese-costs-more/<section-id> scrolls to that widget.
  useEffect(() => {
    const m = /^#\/essays\/why-chinese-costs-more\/([\w-]+)/.exec(location.hash);
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
          <DraftBadge essayId="why-chinese-costs-more" />
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
      <Meter
        engine={engine}
        strings={t.sec1.widget}
        htmlId="sec-1"
        initialPair={METER_PRESETS[0]}
        presets={METER_PRESETS}
      />

      <section className="prose">
        <h2>{t.sec2.heading}</h2>
        <p>{t.sec2.p1()}</p>
        <p>{t.sec2.p2()}</p>
      </section>
      <TokenizerXray
        engine={engine}
        strings={t.sec2.widget}
        htmlId="sec-2"
        initialWord={XRAY_SENTENCE}
        initialLetter={XRAY_CHAR}
        tokenizer="shared"
        modelGate={false}
      />

      <section className="prose">
        <h2>{t.sec3.heading}</h2>
        <p>{t.sec3.p1()}</p>
        <p>{t.sec3.p2()}</p>
      </section>
      <Meter
        engine={engine}
        strings={t.sec3.widget}
        htmlId="sec-3"
        initialPair={STORY_PRESETS[0]}
        presets={STORY_PRESETS}
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

      <MoreInSeries currentId="why-chinese-costs-more" />

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
