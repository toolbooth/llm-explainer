import { useEffect, useMemo } from "react";
import { createEngine } from "../../lib/engine";
import Chopper from "../../acts/Chopper";
import TokenizerXray from "../../essays/why-it-cant-count/TokenizerXray";
import ClassroomFrame from "../ClassroomFrame";
import HintPanel from "../HintPanel";
import { useClassroomStrings } from "../content/i18n";
import { jumpTo, stepNum } from "../lesson";
import { classroomHref } from "../route";
import { useM1Strings } from "./content/i18n";
import {
  EXTENSION_PRESETS,
  EXTENSION_TEXT,
  HOOK_TEXT,
  STEP1_TEXT,
  STEP2_PRESETS,
  XRAY_LETTER,
  XRAY_WORD,
} from "./data";

/**
 * Module 1 — "The Word Chopper" (切词机): the §4.3 skeleton as one static
 * page. Hook (projector) → unplugged (printable) → three guided steps, one
 * widget each, progressive hints → evaluation act (paper) → exit ticket →
 * block extension. Widgets: Chopper ×4 (hook, step 1, step 2, extension)
 * and the tokenizer-only X-ray (step 3) on the shared GPT-2 vocabulary. No
 * model is loaded on this page at all — only the tokenizer (§4.1 rule 4).
 *
 * Deep links: #/classroom/m1/step-N scrolls to that step's prompt (the
 * `step` prop arrives from the sub-router and changes on hashchange).
 */
export default function M1({ step }: { step: number | null }) {
  const engine = useMemo(() => createEngine(), []);
  const c = useClassroomStrings();
  const t = useM1Strings();

  useEffect(() => {
    if (step === null) return;
    document.getElementById(`step-${step}`)?.scrollIntoView();
  }, [step]);

  const beats = c.beats;
  const beatNav: { id: string; label: string }[] = [
    { id: "hook", label: beats.hook.label },
    { id: "unplugged", label: beats.unplugged.label },
    { id: "explore", label: beats.explore.label },
    { id: "evaluate", label: beats.evaluate.label },
    { id: "exit", label: beats.exit.label },
    { id: "extension", label: beats.extension.label },
  ];

  return (
    <ClassroomFrame
      docTitle={t.docTitle}
      metaDescription={t.metaDescription}
      title={t.title}
      subtitle={t.question}
      subtitleClass="question"
      moduleId="m1"
      current="module"
    >
      <p className="cl-glance">
        <span>{c.glance.grades}</span>
        <span>{c.glance.time}</span>
        <span>{c.glance.devices}</span>
        <span>{c.glance.account}</span>
      </p>
      <p className="cl-card" id="model-card">
        {c.modelCard()} {t.modelNote()}
      </p>
      <p className="cl-card" id="privacy">
        {c.privacy()}
      </p>
      <nav className="cl-beats cl-noprint" aria-label="Lesson beats">
        {beatNav.map((b) => (
          <a href={`#/classroom/m1/${b.id}`} key={b.id} onClick={(e) => jumpTo(e, b.id)}>
            {b.label}
          </a>
        ))}
      </nav>

      {/* 1. Hook */}
      <section className="prose cl-beat" id="hook">
        <h2>
          {beats.hook.label} <span className="cl-time">{beats.hook.time}</span>
        </h2>
        <p className="cl-teacher">{t.hook.teacherLine()}</p>
        <p>{t.hook.prose()}</p>
      </section>
      <Chopper engine={engine} strings={t.hook.widget} htmlId="hook-widget" initialText={HOOK_TEXT} inputLabel={t.hook.widget.title} a11y={c.a11y} />

      {/* 2. Unplugged */}
      <section className="prose cl-beat" id="unplugged">
        <h2>
          {beats.unplugged.label} <span className="cl-time">{beats.unplugged.time}</span>
        </h2>
        <p>{t.unplugged.prose()}</p>
        <p>
          <a className="btn-link" href={classroomHref({ kind: "unplugged", id: "m1" })}>
            {t.unplugged.link}
          </a>
        </p>
      </section>

      {/* 3. Guided exploration */}
      <section className="prose cl-beat" id="explore">
        <h2>
          {beats.explore.label} <span className="cl-time">{beats.explore.time}</span>
        </h2>
        <p>{t.explore.intro()}</p>
      </section>

      {t.explore.steps.map((s, i) => {
        const n = i + 1;
        const href = classroomHref({ kind: "module", id: "m1", step: n });
        return (
          <div key={n}>
            <section className="prose cl-step" id={`step-${n}`}>
              <h3>
                <span className="cl-step-n">{stepNum(c.htmlLang, n)}</span>
                {s.title}
                <a className="cl-steplink" href={href} title={c.nav.linkToStep} aria-label={c.nav.linkToStep}>
                  #
                </a>
              </h3>
              <p>{s.prompt()}</p>
            </section>
            {n === 1 && (
              <Chopper
                engine={engine}
                strings={t.explore.step1Widget}
                htmlId="step-1-widget"
                initialText={STEP1_TEXT}
                inputLabel={t.explore.step1Widget.title}
                a11y={c.a11y}
              />
            )}
            {n === 2 && (
              <Chopper
                engine={engine}
                strings={t.explore.step2Widget}
                htmlId="step-2-widget"
                initialText={STEP2_PRESETS[0]}
                presets={STEP2_PRESETS}
                inputLabel={t.explore.step2Widget.title}
                a11y={c.a11y}
              />
            )}
            {n === 3 && (
              <TokenizerXray
                engine={engine}
                strings={t.explore.step3Widget}
                htmlId="step-3-widget"
                initialWord={XRAY_WORD}
                initialLetter={XRAY_LETTER}
                tokenizer="shared"
                modelGate={false}
                a11y={{ letters: c.a11y.letters, pieces: c.a11y.pieces, pieceItem: c.a11y.xrayPieceItem }}
              />
            )}
            <HintPanel id={`step-${n}`} hints={s.hints} strings={c.hints} />
            <p className="cl-writedown">✎ {s.writeDown}</p>
          </div>
        );
      })}

      {/* 4. Evaluation act */}
      <section className="prose cl-beat" id="evaluate">
        <h2>
          {beats.evaluate.label} <span className="cl-time">{beats.evaluate.time}</span>
        </h2>
        <p>{t.evaluate.prose()}</p>
        <ol className="cl-questions">
          {t.evaluate.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
        <p className="cl-paper">{t.evaluate.paperNote}</p>
      </section>

      {/* 5. Exit ticket */}
      <section className="prose cl-beat" id="exit">
        <h2>
          {beats.exit.label} <span className="cl-time">{beats.exit.time}</span>
        </h2>
        <p>{t.exit.prose()}</p>
        <ol className="cl-questions">
          {t.exit.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </section>

      {/* 6. Block extension */}
      <section className="prose cl-beat" id="extension">
        <h2>
          {beats.extension.label} <span className="cl-time">{beats.extension.time}</span>
        </h2>
        <p>{t.extension.prose()}</p>
      </section>
      <Chopper
        engine={engine}
        strings={t.extension.widget}
        htmlId="extension-widget"
        initialText={EXTENSION_TEXT}
        presets={EXTENSION_PRESETS}
        inputLabel={t.extension.widget.title}
        a11y={c.a11y}
      />
      <section className="prose">
        <p className="cl-debate">{t.extension.debate()}</p>
      </section>

      <section className="prose">
        <p className="dim">{t.goDeeper()}</p>
      </section>
    </ClassroomFrame>
  );
}
