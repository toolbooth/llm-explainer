import { useMemo } from "react";
import ClassroomFrame from "../ClassroomFrame";
import TableWrap from "../TableWrap";
import FrontMatterLinks from "../about/FrontMatterLinks";
import { useClassroomStrings } from "../content/i18n";
import { classroomHref } from "../route";
import DiceGrid, { cellWord } from "./DiceGrid";
import { useM2Strings } from "./content/i18n";
import { DICE_TABLES, EMBED_ORIGIN_PLACEHOLDER, VERIFIED_ON } from "./data";
import { hookFacts, twoPlusTwoFacts } from "./facts";
import { diceCells } from "./rolls";

/**
 * Module 2's teacher guide — PRODUCT.md §5 "Per-module guide", items 1–14 in
 * order, as one printable HTML page. Items 7 (prompts + hints) and 10 (exit
 * questions) render from the SAME strings the lesson page uses; item 6's
 * answer key renders the dice tables from the measured probabilities in
 * data.ts; the sample responses take their numbers from the measured runs.
 */
export default function M2Guide() {
  const c = useClassroomStrings();
  const t = useM2Strings();
  const g = t.guide;
  const s = g.sections;
  const facts = useMemo(hookFacts, []);
  const ext = useMemo(twoPlusTwoFacts, []);
  const embed = `<iframe src="${EMBED_ORIGIN_PLACEHOLDER}/#/classroom/m2" width="100%" height="900" style="border:0" title="Module 2 · The Next-Word Gamble" allow="fullscreen"></iframe>\n<p><a href="${EMBED_ORIGIN_PLACEHOLDER}/#/classroom/m2">Open Module 2 in a new tab</a></p>`;

  let n = 0;
  const H = (label: string) => (
    <h2>
      {++n}. {label}
    </h2>
  );
  const pct = (p: number) => `${(p * 100).toFixed(1)}%`;

  return (
    <ClassroomFrame
      docTitle={g.docTitle}
      metaDescription={t.metaDescription}
      className="cl-guide"
      title={g.title}
      subtitle={g.subtitle}
      moduleId="m2"
      current="guide"
      showPrint
    >
      <p className="cl-card">{c.modelCard()} {t.modelNote()}</p>
      <p className="cl-card">{c.privacy()}</p>
      <FrontMatterLinks />

      {/* 1. At a glance */}
      <section className="prose">
        {H(s.glance)}
        <table className="cl-table">
          <tbody>
            {g.glance.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 2. Learning objectives */}
      <section className="prose">
        {H(s.objectives)}
        <ol className="cl-questions">
          {g.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ol>
      </section>

      {/* 3. Standards */}
      <section className="prose">
        {H(s.standards)}
        <TableWrap label={c.a11y.tableRegion}>
          <table className="cl-table">
            <tbody>
              {g.standards.rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.framework}</td>
                  <td>
                    <strong>{r.id}</strong>
                    <br />
                    {r.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="dim">{g.standards.verified}</p>
        <p className="dim">{g.standards.churn()}</p>
      </section>

      {/* 4. Teacher background */}
      <section className="prose">
        {H(s.background)}
        {g.background.paras.map((p, i) => (
          <p key={i}>{p(facts)}</p>
        ))}
        <p className="dim">{g.background.deeper()}</p>
      </section>

      {/* 5. Minute-by-minute */}
      <section className="prose">
        {H(s.plan)}
        <TableWrap label={c.a11y.tableRegion}>
          <table className="cl-table">
            <thead>
              <tr>
                {g.plan.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.plan.rows.map((r) => (
                <tr key={r.time}>
                  <td>{r.time}</td>
                  <td>{r.beat}</td>
                  <td>{r.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </section>

      {/* 6. Unplugged + answer key (dice tables from measured data) */}
      <section className="prose cl-page-break">
        {H(s.unplugged)}
        <p>{g.unplugged.prose()}</p>
        <ol className="cl-questions">
          {g.unplugged.script.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
        <h3>{g.unplugged.answerKeyHeading}</h3>
        <p className="dim">{g.unplugged.answerKeyNote(VERIFIED_ON)}</p>
        {DICE_TABLES.map((tbl, i) => {
          const { alloc } = diceCells(tbl.prompt.t10.map((x) => x.p));
          return (
            <div key={tbl.prompt.text}>
              <DiceGrid
                table={tbl.prompt}
                caption={g.unplugged.tableCaption(i + 1, tbl.prompt.text)}
                firstDie={t.sheet.tables.firstDie}
                secondDie={t.sheet.tables.secondDie}
                assumed={tbl.picked}
                compact
              />
              <TableWrap label={c.a11y.tableRegion}>
                <table className="cl-table">
                  <thead>
                    <tr>
                      {g.unplugged.keyColumns.map((col) => (
                        <th key={col} scope="col">
                    {col}
                  </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tbl.prompt.t10.map((cand, j) => (
                      <tr key={cand.id}>
                        <td>
                          <code>{cellWord(cand.label)}</code> <span className="dim">#{cand.id}</span>
                        </td>
                        <td>{pct(cand.p)}</td>
                        <td>{alloc[j] > 0 ? alloc[j] : g.unplugged.zeroCells}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
              {tbl.picked && <p className="dim">{g.unplugged.spineNote(tbl.picked)}</p>}
            </div>
          );
        })}
      </section>

      {/* 7. Prompts, deep links, hints — from the lesson page's own table */}
      <section className="prose cl-page-break">
        {H(s.prompts)}
        <p>{g.prompts.intro()}</p>
        {t.explore.steps.map((step, i) => {
          const href = classroomHref({ kind: "module", id: "m2", step: i + 1 });
          return (
            <div key={i}>
              <h3>
                {i + 1}. {step.title}
              </h3>
              <p>{step.prompt()}</p>
              <p className="cl-deep">
                {g.prompts.deepLinkLabel}: <a href={href}>{href}</a>
              </p>
              <p>
                <strong>{g.prompts.writeDownLabel}:</strong> {step.writeDown}
              </p>
              <p>
                <strong>{g.prompts.hintsLabel}</strong>
              </p>
              <ol className="cl-questions">
                {step.hints.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      {/* 8. Discussion */}
      <section className="prose">
        {H(s.discussion)}
        <ol className="cl-questions">
          {g.discussion.items.map((q, i) => (
            <li key={i}>
              {q}
              {i === g.discussion.items.length - 1 && <span className="cl-level"> · {g.discussion.debateTag}</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* 9. Misconceptions */}
      <section className="prose">
        {H(s.misconceptions)}
        <TableWrap label={c.a11y.tableRegion}>
          <table className="cl-table">
            <thead>
              <tr>
                {g.misconceptions.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.misconceptions.rows.map((r) => (
                <tr key={r.belief}>
                  <td style={{ whiteSpace: "normal" }}>{r.belief}</td>
                  <td>{r.shows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </section>

      {/* 10. Evaluation act + exit ticket, rubric, samples (numbers from measured runs) */}
      <section className="prose cl-page-break">
        {H(s.assessment)}
        <h3>{g.assessment.evalHeading}</h3>
        <p>{g.assessment.evalIntro()}</p>
        <ol className="cl-questions">
          {t.evaluate.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
        <h3>{g.assessment.rubricHeading}</h3>
        <ul className="cl-list">
          {g.assessment.levels.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <h3>{g.assessment.exitHeading}</h3>
        <p className="dim">{g.assessment.measured(facts)}</p>
        {g.assessment.items.map((item, i) => (
          <div key={i}>
            <p>
              <strong>
                {i + 1}. {item.q}
              </strong>
            </p>
            {item.samples.map((sample, lvl) => (
              <p className="cl-sample" key={lvl}>
                <span className="cl-level">L{lvl + 1}</span>
                <q>{sample(facts)}</q>
              </p>
            ))}
          </div>
        ))}
      </section>

      {/* 11. Block extension */}
      <section className="prose">
        {H(s.extension)}
        <p>{g.extension.prose(ext.favourite, ext.favouriteP, ext.fourP)}</p>
        <p className="dim">{g.extension.debateIntro}</p>
        <p className="cl-debate">{t.extension.debate()}</p>
      </section>

      {/* 12. Differentiation */}
      <section className="prose">
        {H(s.differentiation)}
        <h3>{g.differentiation.ell.heading}</h3>
        <p>{g.differentiation.ell.intro}</p>
        <TableWrap label={c.a11y.tableRegion}>
          <table className="cl-table">
            <thead>
              <tr>
                {g.differentiation.ell.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.differentiation.ell.glossary.map((row) => (
                <tr key={row.term}>
                  <td lang="en">{row.term}</td>
                  <td lang="zh">{row.zh}</td>
                  <td>{row.plain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <h3>{g.differentiation.nonStem.heading}</h3>
        <ul className="cl-list">
          {g.differentiation.nonStem.prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <h3>{g.differentiation.advanced.heading}</h3>
        <p>{g.differentiation.advanced.prose()}</p>
      </section>

      {/* 13. Accessibility */}
      <section className="prose">
        {H(s.accessibility)}
        <ul className="cl-list">
          {g.accessibility.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      {/* 14. Slides + embed */}
      <section className="prose">
        {H(s.embed)}
        <p>{g.embed.slides()}</p>
        <p>{g.embed.canvasIntro}</p>
        <pre className="cl-embed" tabIndex={0} role="group" aria-label={c.a11y.codeRegion}>
          <code>{embed}</code>
        </pre>
        <p className="dim">{g.embed.canvasNote}</p>
      </section>
    </ClassroomFrame>
  );
}
