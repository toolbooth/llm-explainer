import ClassroomFrame from "./ClassroomFrame";
import { ADOPTERS, type Adopter } from "./adopters";
import { CLASSROOM_CONTACT_EMAIL, discussionsUrl } from "./config";
import { useClassroomStrings } from "./content/i18n";
import { moduleById } from "./registry";
import { classroomHref } from "./route";

/**
 * `#/classroom/taught` — the adoption-evidence surface (PRODUCT.md §8):
 * the public list of consenting adopters from the checked-in data file
 * (src/classroom/adopters.ts), with a designed empty state that is itself
 * the invitation; the §8.1 rules; the two report channels (the GitHub
 * Discussion template and a prefilled mailto:) plus the letter kit; the
 * §8.2 field list; and the dual-use consent text in plain words. No form
 * and no backend — additions land as data-file commits.
 */
export default function TaughtPage() {
  const c = useClassroomStrings();
  const t = c.taught;
  const discussions = discussionsUrl();
  const mailto = `mailto:${CLASSROOM_CONTACT_EMAIL}?subject=${encodeURIComponent(t.channels.email.subject)}&body=${encodeURIComponent(t.channels.email.bodyTemplate)}`;

  const moduleTags = (a: Adopter) => a.modules.map((m) => `M${moduleById(m)?.num}`).join(", ");

  return (
    <ClassroomFrame
      docTitle={t.docTitle}
      metaDescription={t.metaDescription}
      className="cl-taught"
      title={t.title}
      subtitle={t.subtitle}
      current="taught"
      showPrint
    >
      <section className="prose">
        <p>{t.why()}</p>
        <h2>{t.principles.heading}</h2>
        <ol className="cl-questions">
          {t.principles.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="prose">
        <h2>{t.adopters.heading}</h2>
        {ADOPTERS.length === 0 ? (
          <p className="cl-card cl-taught-empty">{t.adopters.empty()}</p>
        ) : (
          <ul className="cl-adopters">
            {ADOPTERS.map((a, i) => (
              <li key={i}>
                <strong>{a.name}</strong>
                {a.institution && <> · {a.institution}</>} · {a.course} · {a.term}
                <span className="cl-adopter-meta">
                  {t.adopters.modulesLabel} {moduleTags(a)} ·{" "}
                  {a.source.kind === "discussion" ? (
                    <a href={a.source.url}>{t.adopters.via.discussion}</a>
                  ) : (
                    t.adopters.via.email
                  )}
                </span>
                {a.note && <q className="cl-adopter-note">{a.note}</q>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="prose">
        <h2>{t.channels.heading}</h2>
        <h3>{t.channels.discussion.heading}</h3>
        <p>{t.channels.discussion.body()}</p>
        {discussions ? (
          <p>
            <a className="btn-link" href={discussions}>
              {t.channels.discussion.link}
            </a>
          </p>
        ) : (
          <p className="dim">{t.channels.discussion.notOpen()}</p>
        )}
        <h3>{t.channels.email.heading}</h3>
        <p>{t.channels.email.body()}</p>
        <p>
          <a className="btn-link" href={mailto}>
            {t.channels.email.link}
          </a>
        </p>
        <h3>{t.channels.letter.heading}</h3>
        <p>{t.channels.letter.body()}</p>
        <p>
          <a className="btn-link" href={classroomHref({ kind: "about", slug: "letter-kit" })}>
            {t.channels.letter.link}
          </a>
        </p>
      </section>

      <section className="prose">
        <h2>{t.fields.heading}</h2>
        <p>{t.fields.intro}</p>
        <ol className="cl-questions">
          {t.fields.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="prose">
        <h2>{t.consent.heading}</h2>
        <p>{t.consent.body()}</p>
        <p className="cl-card">{t.never()}</p>
      </section>
    </ClassroomFrame>
  );
}
