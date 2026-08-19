import { useMemo } from "react";
import { createEngine } from "./lib/engine";
import { useStrings } from "./content/i18n";
import Chopper from "./acts/Chopper";
import WordMap from "./acts/WordMap";
import AttentionRoom from "./acts/AttentionRoom";
import Gamble from "./acts/Gamble";
import TheLoop from "./acts/TheLoop";

/** Bar widths for the Act 6 scale rows (labels live in the content modules). */
const SCALE_PCT = [2, 18, 100];

export default function App() {
  const engine = useMemo(() => createEngine(), []);
  const t = useStrings();

  return (
    <article className="essay">
      <header className="hero">
        <p className="kicker">{t.hero.kicker}</p>
        <h1>{t.hero.title}</h1>
        <p className="subtitle">{t.hero.subtitle}</p>
      </header>

      <section className="prose">
        <p>{t.intro.p1()}</p>
        <p>{t.intro.p2()}</p>
      </section>

      <Chopper engine={engine} />

      <section className="prose">
        <p>{t.afterChopper.p1()}</p>
        <p>{t.afterChopper.p2()}</p>
      </section>

      <WordMap engine={engine} />

      <section className="prose">
        <p>{t.beforeAttention()}</p>
      </section>

      <AttentionRoom engine={engine} />

      <section className="prose">
        <p>{t.beforeGamble()}</p>
      </section>

      <Gamble engine={engine} />

      <section className="prose">
        <p>{t.beforeLoop()}</p>
      </section>

      <TheLoop engine={engine} />

      <section className="prose">
        <h2>{t.act6.heading}</h2>
        <p>{t.act6.p1()}</p>
        <div className="scale">
          {t.act6.scale.map((s, i) => (
            <div className="scale-row" key={i}>
              <span className="scale-label">{s.label}</span>
              <div className="scale-track">
                <div className="scale-fill" style={{ width: `${SCALE_PCT[i]}%` }} />
              </div>
              <span className="scale-params">{s.params}</span>
            </div>
          ))}
        </div>
        <p className="dim scale-note">{t.act6.scaleNote}</p>
        <p>{t.act6.p2()}</p>
      </section>

      <section className="prose">
        <h2>{t.act7.heading}</h2>
        <p>{t.act7.p1()}</p>
        <p>{t.act7.p2()}</p>
        <p>{t.act7.p3()}</p>
        <p>{t.act7.p4()}</p>
      </section>

      <footer className="essay-foot">
        <p>{t.footer()}</p>
      </footer>
    </article>
  );
}
