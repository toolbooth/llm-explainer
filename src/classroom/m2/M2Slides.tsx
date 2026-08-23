import { useMemo } from "react";
import ClassroomFrame from "../ClassroomFrame";
import { classroomHref } from "../route";
import DiceGrid, { cellWord } from "./DiceGrid";
import { useM2Strings } from "./content/i18n";
import { DICE_TABLES, MEASURED, type Candidate } from "./data";
import { hookFacts } from "./facts";

/**
 * Module 2's Slides companion (PRODUCT.md §5, §10.1: "Slides companion for
 * M2 only") as one print-oriented page: 8–12 slides, each a 16:9 card on
 * screen and one page in print, with the speaker note under it. Text comes
 * from the module's own table; the bars and the dice table from measured
 * data — the same sources as the lesson page and the guide.
 */
export default function M2Slides() {
  const t = useM2Strings();
  const sl = t.slides;
  const facts = useMemo(hookFacts, []);
  const total = sl.slides.length;

  return (
    <ClassroomFrame
      docTitle={sl.docTitle}
      metaDescription={t.metaDescription}
      className="cl-slides-page"
      title={sl.title}
      subtitle={sl.subtitle}
      moduleId="m2"
      current="slides"
      showPrint
    >
      {sl.slides.map((s, i) => (
        <div key={i}>
          <section className={`cl-slide${i === 0 ? " title-slide" : ""}`} id={`slide-${i + 1}`} aria-label={sl.counter(i + 1, total)}>
            <span className="cl-slide-n">{sl.counter(i + 1, total)}</span>
            <h2>{s.title}</h2>
            <ul>
              {s.lines.map((line, j) => (
                <li key={j}>{line}</li>
              ))}
            </ul>
            {s.visual === "hook-bars" && (
              <div className="cl-slide-vis">
                <Bars cands={MEASURED.hook.t10.slice(0, 5)} />
                <p className="cl-slide-cap">{sl.barsCaption(MEASURED.hook.text)}</p>
              </div>
            )}
            {s.visual === "temp-bars" && (
              <div className="cl-slide-vis cl-slide-temps">
                {(
                  [
                    [0.5, MEASURED.hook.t05],
                    [1.0, MEASURED.hook.t10],
                    [1.5, MEASURED.hook.t15],
                  ] as const
                ).map(([temp, cands]) => (
                  <div key={temp}>
                    <h3>{sl.tempLabel(temp)}</h3>
                    <Bars cands={cands.slice(0, 3)} />
                  </div>
                ))}
              </div>
            )}
            {s.visual === "dice" && (
              <div className="cl-slide-vis">
                <DiceGrid
                  table={DICE_TABLES[0].prompt}
                  caption={t.sheet.tables.caption(1, DICE_TABLES[0].prompt.text)}
                  firstDie={t.sheet.tables.firstDie}
                  secondDie={t.sheet.tables.secondDie}
                  assumed={DICE_TABLES[0].picked}
                  compact
                />
              </div>
            )}
            {s.visual === "steps" && (
              <div className="cl-slide-vis cl-slide-steps">
                {t.explore.steps.map((step, j) => {
                  const href = classroomHref({ kind: "module", id: "m2", step: j + 1 });
                  return (
                    <span key={j}>
                      {j + 1}. {step.title} — <code>{href}</code>
                    </span>
                  );
                })}
              </div>
            )}
          </section>
          <p className="cl-slide-note">
            <strong>{sl.notesLabel}:</strong> {s.note(facts)}
          </p>
        </div>
      ))}
    </ClassroomFrame>
  );
}

/** A few measured bars, large enough for a projector. */
function Bars({ cands }: { cands: readonly Candidate[] }) {
  return (
    <div className="cl-slide-bars">
      {cands.map((c) => (
        <div className="cl-slide-bar" key={c.id}>
          <span className="lbl">{cellWord(c.label)}</span>
          <span className="trk">
            <span className="fil" style={{ width: `${Math.max(1, c.p * 100)}%` }} />
          </span>
          <span className="val">{(c.p * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
