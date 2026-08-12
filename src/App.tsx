import { useMemo } from "react";
import { createEngine } from "./lib/engine";
import Chopper from "./acts/Chopper";
import AttentionRoom from "./acts/AttentionRoom";
import Gamble from "./acts/Gamble";

export default function App() {
  const engine = useMemo(() => createEngine(), []);

  return (
    <article className="essay">
      <header className="hero">
        <p className="kicker">AN INTERACTIVE ESSAY · RUNS ENTIRELY IN YOUR BROWSER</p>
        <h1>Inside the Machine</h1>
        <p className="subtitle">
          You've talked to AI every day. Today, you get to watch it think — a real language model,
          alive in this tab, dissected act by act.
        </p>
      </header>

      <section className="prose">
        <p>
          Every answer ChatGPT has ever given you began the same way: your words were chopped into
          pieces, turned into numbers, weighed against each other — and then the machine{" "}
          <em>gambled</em>. This essay lets you touch each of those steps. Nothing here is a
          recording or a mock-up: the model runs on your device, and everything you type stays in
          this tab.
        </p>
        <p>
          We start with the strangest fact about language models: <strong>they can't read.</strong>
        </p>
      </section>

      <Chopper engine={engine} />

      <section className="prose">
        <p>
          Those chunks are called <em>tokens</em>. The model's entire universe is a list of ~50,000
          of them — pieces of words, whole words, punctuation. Whatever you type gets snapped to
          that grid before the model ever sees it. Ask it how many “r”s are in{" "}
          <em>strawberry</em> and it stares at three chunks — <code>st · raw · berry</code> — like
          you'd stare at three jigsaw pieces and get asked how much the puzzle weighs.
        </p>
        <p className="placeholder-note">
          [Act 2 — words as numbers — is being built. This is a preview of the full essay.]
        </p>
        <p>
          Once your words are chunks, the model has to work out how they relate. It does this with
          a mechanism called <em>attention</em>: as it reads each token, it decides how much to
          look back at every token before it. Below is a <strong>complete language model</strong> —
          all 7.5 megabytes of it, smaller than a selfie — dissected live. You are looking at its
          actual attention weights, not an illustration.
        </p>
      </section>

      <AttentionRoom engine={engine} />

      <section className="prose">
        <p>
          Skip to the end of the pipeline: after all that reading and weighing, how does the model
          decide what to <em>say</em>? Here is the honest answer — it rolls dice.
        </p>
      </section>

      <Gamble engine={engine} />

      <section className="prose">
        <p>
          Every single word in every AI answer you've ever read was chosen like this: a probability
          list, a temperature, a roll. String enough rolls together and you get poetry, code — or
          confident nonsense. Which is exactly where the full essay is headed: once you've seen the
          dice, hallucination stops being a mystery and becomes an inevitability you can reason
          about.
        </p>
      </section>

      <footer className="essay-foot">
        <p>
          Built as a free, open interactive essay · no accounts, no tracking, your text never
          leaves this tab · full seven-act version coming — follow{" "}
          <a href="https://x.com/toolboothdev">@toolboothdev</a>
        </p>
      </footer>
    </article>
  );
}
