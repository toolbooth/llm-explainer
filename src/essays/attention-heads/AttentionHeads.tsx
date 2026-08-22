import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import { LangToggle } from "../../content/i18n";
import AttentionRoom from "../../acts/AttentionRoom";
import HeadScanner from "./HeadScanner";
import MoreInSeries from "../../series/MoreInSeries";
import DraftBadge from "../../series/DraftBadge";
import { useEssay3Strings } from "./content/i18n";

/**
 * Essay #3 — "The Attention-Head Field Guide" (野生 attention head 图鉴).
 * Four sections, each an independently linkable widget
 * (#/essays/attention-heads/sec-N): the blueprint is
 * essays/03-attention-heads/OUTLINE.md. One new widget (HeadScanner, §2);
 * §1/§3/§4 reuse AttentionRoom via its lifted strings prop.
 */

// Live data fed to an English-trained model — stays English in every locale
// (the zh §1 prose tells the reader so). Four different sentences so each
// Room and the census start from their own specimen.
const SEC1_TEXT = "Once upon a time there was a little girl who loved her red ball.";
const SEC2_TEXT = "Tom and Lily went to the park to play with their new kite.";
const SEC3_TEXT = "One day, a big dog ran after a small cat in the garden.";
const SEC4_TEXT = "The cat sat on the mat and looked at the dog.";
/** Where this model's most structured heads cluster (calibration in the blueprint). */
const SEC1_LAYER = 2;
/** Where the unlabeled heads run thick. */
const SEC4_LAYER = 7;

export default function AttentionHeads() {
  const engine = useMemo(() => createEngine(), []);
  const t = useEssay3Strings();

  // Document chrome follows the language, same as the flagship's useI18n.
  useEffect(() => {
    document.title = t.docTitle;
    document.documentElement.lang = t.htmlLang;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
  }, [t]);

  // Deep links: #/essays/attention-heads/<section-id> scrolls to that widget.
  useEffect(() => {
    const m = /^#\/essays\/attention-heads\/([\w-]+)/.exec(location.hash);
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
          <DraftBadge essayId="attention-heads" />
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
      <AttentionRoom
        engine={engine}
        strings={t.sec1.widget}
        htmlId="sec-1"
        initialText={SEC1_TEXT}
        initialLayer={SEC1_LAYER}
      />

      <section className="prose">
        <h2>{t.sec2.heading}</h2>
        <p>{t.sec2.p1()}</p>
        <p>{t.sec2.p2()}</p>
      </section>
      <HeadScanner engine={engine} strings={t.sec2.widget} htmlId="sec-2" initialText={SEC2_TEXT} />

      <section className="prose">
        <h2>{t.sec3.heading}</h2>
        <p>{t.sec3.p1()}</p>
        <p>{t.sec3.p2()}</p>
      </section>
      <AttentionRoom engine={engine} strings={t.sec3.widget} htmlId="sec-3" initialText={SEC3_TEXT} />

      <section className="prose">
        <h2>{t.sec4.heading}</h2>
        <p>{t.sec4.p1()}</p>
        <p>{t.sec4.p2()}</p>
      </section>
      <AttentionRoom
        engine={engine}
        strings={t.sec4.widget}
        htmlId="sec-4"
        initialText={SEC4_TEXT}
        initialLayer={SEC4_LAYER}
      />

      <section className="prose">
        <h2>{t.outro.heading}</h2>
        <p>{t.outro.p1()}</p>
        <p>{t.outro.p2()}</p>
        <p>{t.outro.p3()}</p>
      </section>

      <MoreInSeries currentId="attention-heads" />

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
