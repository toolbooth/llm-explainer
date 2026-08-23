import ClassroomFrame from "../ClassroomFrame";
import { useClassroomStrings } from "../content/i18n";
import DiceGrid from "./DiceGrid";
import { useM2Strings } from "./content/i18n";
import { DICE_TABLES } from "./data";

/**
 * Module 2's unplugged printable — dice-and-table generation (PRODUCT.md
 * §4.3 beat 2: "roll a die against a printed probability table to
 * 'generate' three words"). Print-first: a white "paper" card even on
 * screen; @media print drops the site chrome and keeps each table on one
 * page. One sheet per pair. The three tables are the model's real top ten
 * at three positions along its favourite path, each sharing the 36
 * two-dice outcomes in proportion to the measured probabilities; the
 * probabilities themselves are deliberately NOT on this sheet (guide §6).
 */
export default function M2Unplugged() {
  const c = useClassroomStrings();
  const t = useM2Strings();
  const s = t.sheet;
  return (
    <ClassroomFrame
      docTitle={s.docTitle}
      metaDescription={t.metaDescription}
      className="cl-sheet-page"
      title={s.title}
      subtitle={s.subtitle}
      moduleId="m2"
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

        <h2>{s.tables.heading}</h2>
        <p className="cl-sub">{s.tables.branchNote}</p>
        {DICE_TABLES.map((tbl, i) => (
          <div className="cl-strip" key={tbl.prompt.text}>
            <DiceGrid
              table={tbl.prompt}
              caption={s.tables.caption(i + 1, tbl.prompt.text)}
              firstDie={s.tables.firstDie}
              secondDie={s.tables.secondDie}
              assumed={tbl.picked}
              assumedLabel={s.tables.assumed}
            />
          </div>
        ))}
        <p>
          <strong>{s.sentenceLine}</strong>
          <span className="cl-sentence" aria-hidden="true" />
        </p>

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
