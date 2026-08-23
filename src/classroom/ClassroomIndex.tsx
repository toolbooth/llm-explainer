import { useLang } from "../content/i18n";
import ClassroomFrame from "./ClassroomFrame";
import { useClassroomStrings } from "./content/i18n";
import { MODULES } from "./registry";
import { classroomHref } from "./route";

/**
 * #/classroom — the module index. Lists all six planned modules so a
 * teacher sees the sequence; only "available" modules link anywhere.
 */
export default function ClassroomIndex() {
  const lang = useLang();
  const t = useClassroomStrings();
  const ui = t.index;
  return (
    <ClassroomFrame
      docTitle={t.docTitle}
      metaDescription={t.metaDescription}
      title={ui.title}
      subtitle={ui.subtitle}
      current="index"
    >
      <section className="prose">
        <p>{ui.whatItIs()}</p>
        <p>{ui.whatItIsNot()}</p>
        <p className="cl-card">{t.modelCard()}</p>
        <p className="cl-card">{t.privacy()}</p>
      </section>

      <section className="prose">
        <h2>{ui.modulesHeading}</h2>
        <ol className="cl-modules">
          {MODULES.map((m) => {
            const available = m.status === "available";
            return (
              <li key={m.id}>
                <span className="cl-mod-n">{ui.moduleLabel(m.num)}</span>
                <span className={`cl-mod-t${available ? "" : " planned"}`}>
                  {available ? (
                    <a href={classroomHref({ kind: "module", id: m.id, step: null })}>{m.title[lang]}</a>
                  ) : (
                    <>
                      {m.title[lang]}
                      <span className="cl-planned">{ui.planned}</span>
                    </>
                  )}
                </span>
                <span className="cl-mod-q">{m.question[lang]}</span>
                {available && (
                  <span className="cl-mod-links">
                    <a href={classroomHref({ kind: "guide", id: m.id })}>{ui.guideLink}</a>
                    <a href={classroomHref({ kind: "unplugged", id: m.id })}>{ui.unpluggedLink}</a>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="prose">
        <h2>{ui.forTeachers}</h2>
        <p className="dim">{t.frontMatter.note}</p>
        <ul className="cl-front">
          {t.frontMatter.items.map((it) => (
            <li key={it.key}>{it.label}</li>
          ))}
        </ul>
        <p>
          <a href="#/essays">{ui.seriesLink}</a>
        </p>
      </section>
    </ClassroomFrame>
  );
}
