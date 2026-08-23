import ClassroomFrame from "../ClassroomFrame";
import { useClassroomStrings } from "../content/i18n";
import { useM1Strings } from "./content/i18n";
import { EXTENSION_STRIP, UNPLUGGED_STRIPS } from "./data";

/**
 * Module 1's unplugged printable — the scissors-sentence activity
 * (PRODUCT.md §4.3 beat 2). Print-first: the sheet is a white "paper" card
 * even on screen; @media print drops the site chrome and keeps each strip
 * on one page. One sheet per pair; three English strips and the 中文 strip
 * for the block extension. The answer key is deliberately NOT on this sheet
 * (it is §6 of the teacher guide).
 */
export default function M1Unplugged() {
  const c = useClassroomStrings();
  const t = useM1Strings();
  const s = t.sheet;
  return (
    <ClassroomFrame
      docTitle={s.docTitle}
      metaDescription={t.metaDescription}
      className="cl-sheet-page"
      title={s.title}
      subtitle={s.subtitle}
      moduleId="m1"
      current="unplugged"
      showPrint
    >
      <div className="cl-sheet">
        <h1>{s.title}</h1>
        <p className="cl-sub">{s.subtitle}</p>
        <p>
          {s.nameLine}
          <span className="cl-names" aria-hidden="true" />
        </p>

        <h2>{s.materials.heading}</h2>
        <ul>
          {s.materials.items.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>

        <h2>{s.rounds.heading}</h2>
        <ol>
          {s.rounds.items.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>

        <h2>{s.strips.heading}</h2>
        {UNPLUGGED_STRIPS.map((strip) => (
          <div className="cl-strip" key={strip.text}>
            <div className="cl-strip-text">{strip.text}</div>
            <div className="cl-strip-cut">{s.strips.cutLabel}</div>
          </div>
        ))}
        <p className="cl-sub">{s.strips.extensionLabel}</p>
        <div className="cl-strip zh">
          <div className="cl-strip-text" lang="zh">
            {EXTENSION_STRIP.text}
          </div>
          <div className="cl-strip-cut">{s.strips.cutLabel}</div>
        </div>

        <h2>{s.questions.heading}</h2>
        <ol>
          {s.questions.items.map((q, i) => (
            <li key={i}>
              {q}
              <span className="cl-answer" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <p className="cl-foot">
          {s.teacherNote()} · {c.glance.account}
        </p>
      </div>
    </ClassroomFrame>
  );
}
