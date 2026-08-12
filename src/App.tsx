import { useMemo } from "react";
import { createEngine } from "./lib/engine";
import Chopper from "./acts/Chopper";
import WordMap from "./acts/WordMap";
import AttentionRoom from "./acts/AttentionRoom";
import Gamble from "./acts/Gamble";
import TheLoop from "./acts/TheLoop";

const SCALE = [
  { label: "The model in this page", params: "1M non-embedding params · 7.5MB", pct: 2 },
  { label: "GPT-2 (2019)", params: "124M params", pct: 18 },
  { label: "Frontier models (2026)", params: "trillions of params (estimates)", pct: 100 },
];

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
          recording or a mock-up: the models run on your device, and everything you type stays in
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
        <p>
          But a token id is just a number, and numbers alone carry no meaning. So the model's first
          real move is to give every token an address in a huge internal space — and it turns out{" "}
          <strong>meaning is a place</strong>. The widget below searches the actual embedding table
          of a real model that was trained on children's stories. Type a word and meet its
          neighbors.
        </p>
      </section>

      <WordMap engine={engine} />

      <section className="prose">
        <p>
          Once your words are places on a map, the model has to work out how they relate. It does
          this with a mechanism called <em>attention</em>: as it reads each token, it decides how
          much to look back at every token before it. Below is that <strong>same model</strong> —
          all 7.5 megabytes of it, smaller than a selfie — dissected live. You are looking at its
          actual attention weights, not an illustration.
        </p>
      </section>

      <AttentionRoom engine={engine} />

      <section className="prose">
        <p>
          Skip to the end of the pipeline: after all that reading and weighing, how does the model
          decide what to <em>say</em>? Here is the honest answer — it rolls dice. (This act wakes a
          bigger model, GPT-2's little sibling, so the bets are more interesting.)
        </p>
      </section>

      <Gamble engine={engine} />

      <section className="prose">
        <p>
          One roll gives you one word. Language models write by doing this <em>in a loop</em>: the
          word just chosen is appended to the input, the whole pipeline runs again, and the next
          word is gambled from scratch. Watch our small friend write a story this way — and hover
          any word to see the bets it beat.
        </p>
      </section>

      <TheLoop engine={engine} />

      <section className="prose">
        <h2>Act 6 · The Zoom-Out</h2>
        <p>
          Everything you just played with is the real mechanism — chopping, mapping, attending,
          gambling, looping. So what separates the 7.5MB toy in this tab from the AI you talk to
          every day? Almost nothing structural. The recipe is the same. What changes is{" "}
          <strong>scale</strong>:
        </p>
        <div className="scale">
          {SCALE.map((s, i) => (
            <div className="scale-row" key={i}>
              <span className="scale-label">{s.label}</span>
              <div className="scale-track">
                <div className="scale-fill" style={{ width: `${s.pct}%` }} />
              </div>
              <span className="scale-params">{s.params}</span>
            </div>
          ))}
        </div>
        <p className="dim scale-note">
          (Log-ish scale, frontier sizes are public estimates. The bars are illustrative; the gap
          is not.)
        </p>
        <p>
          Our toy has 8 layers and 16 heads per layer; frontier models stack around a hundred
          layers and thousands of heads' worth of attention, trained on trillions of tokens instead
          of a few gigabytes of bedtime stories. Scale doesn't change what the machine does — it
          changes how <em>uncannily well</em> the same dice-rolling starts to look like thought.
          That is the single most important — and most contested — fact in modern AI.
        </p>
      </section>

      <section className="prose">
        <h2>Act 7 · Why It Lies</h2>
        <p>
          Now you can solve the mystery that fills the news: why does a machine this capable{" "}
          <em>make things up</em>? You have already seen every ingredient of the answer.
        </p>
        <p>
          The model never stores facts — it stores <strong>neighborhoods</strong> (Act 2) and{" "}
          <strong>betting instincts</strong> (Act 4). When you ask for a citation it doesn't look
          one up; it rolls dice through the neighborhood where citations live, and out comes
          something citation-<em>shaped</em>. Authors that plausibly follow titles. Page numbers
          that plausibly follow authors. Each individual gamble is reasonable; the chain has no
          anchor to reality. And because the loop (Act 5) commits to every word before imagining
          the next, the model can talk itself into a corner — confidently — one plausible token at
          a time.
        </p>
        <p>
          Hallucination isn't a bug bolted onto the side of an otherwise truthful machine. It is
          the machine, doing exactly what you watched it do all essay — just in a place where
          plausible and true happen to disagree. Once you've seen the dice, you stop asking{" "}
          <em>“why does it sometimes lie?”</em> and start asking the sharper question:{" "}
          <em>“why is it so often right?”</em> — and the answer to that one is the scale bar above.
        </p>
        <p>
          The machine you now understand is the machine you use tomorrow. May every answer it gives
          you look a little different now — a chopper, a map, sixteen heads reading eight ways, and
          a great many dice.
        </p>
      </section>

      <footer className="essay-foot">
        <p>
          Built as a free, open interactive essay · no accounts, no tracking, your text never
          leaves this tab · 中文版 in the works · follow{" "}
          <a href="https://x.com/toolboothdev">@toolboothdev</a>
        </p>
      </footer>
    </article>
  );
}
