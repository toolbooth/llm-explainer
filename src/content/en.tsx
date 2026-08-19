import type { EssayStrings } from "./types";

/**
 * English prose — extracted verbatim from the act components. The rendered
 * output must stay byte-identical to the pre-extraction essay, so edit with
 * the same care you'd edit the essay itself.
 */
export const en: EssayStrings = {
  docTitle: "Inside the Machine — how LLMs actually think",
  metaDescription:
    "An interactive essay. Type your own sentence and watch a real language model — running in your browser — chop it, weigh it, and gamble on the next word.",
  htmlLang: "en",

  hero: {
    kicker: "AN INTERACTIVE ESSAY · RUNS ENTIRELY IN YOUR BROWSER",
    title: "Inside the Machine",
    subtitle:
      "You've talked to AI every day. Today, you get to watch it think — a real language model, alive in this tab, dissected act by act.",
  },

  intro: {
    p1: () => (
      <>
        Every answer ChatGPT has ever given you began the same way: your words were chopped into
        pieces, turned into numbers, weighed against each other — and then the machine{" "}
        <em>gambled</em>. This essay lets you touch each of those steps. Nothing here is a
        recording or a mock-up: the models run on your device, and everything you type stays in
        this tab.
      </>
    ),
    p2: () => (
      <>
        We start with the strangest fact about language models: <strong>they can't read.</strong>
      </>
    ),
  },

  afterChopper: {
    p1: () => (
      <>
        Those chunks are called <em>tokens</em>. The model's entire universe is a list of ~50,000
        of them — pieces of words, whole words, punctuation. Whatever you type gets snapped to
        that grid before the model ever sees it. Ask it how many “r”s are in{" "}
        <em>strawberry</em> and it stares at three chunks — <code>st · raw · berry</code> — like
        you'd stare at three jigsaw pieces and get asked how much the puzzle weighs.
      </>
    ),
    p2: () => (
      <>
        But a token id is just a number, and numbers alone carry no meaning. So the model's first
        real move is to give every token an address in a huge internal space — and it turns out{" "}
        <strong>meaning is a place</strong>. The widget below searches the actual embedding table
        of a real model that was trained on children's stories. Type a word and meet its
        neighbors.
      </>
    ),
  },

  beforeAttention: () => (
    <>
      Once your words are places on a map, the model has to work out how they relate. It does
      this with a mechanism called <em>attention</em>: as it reads each token, it decides how
      much to look back at every token before it. Below is that <strong>same model</strong> —
      all 7.5 megabytes of it, smaller than a selfie — dissected live. You are looking at its
      actual attention weights, not an illustration.
    </>
  ),

  beforeGamble: () => (
    <>
      Skip to the end of the pipeline: after all that reading and weighing, how does the model
      decide what to <em>say</em>? Here is the honest answer — it rolls dice. (This act wakes a
      bigger model, GPT-2's little sibling, so the bets are more interesting.)
    </>
  ),

  beforeLoop: () => (
    <>
      One roll gives you one word. Language models write by doing this <em>in a loop</em>: the
      word just chosen is appended to the input, the whole pipeline runs again, and the next
      word is gambled from scratch. Watch our small friend write a story this way — and hover
      any word to see the bets it beat.
    </>
  ),

  act1: {
    num: "Act 1",
    title: "The Chopper — try your own words",
    placeholder: "Type anything…",
    loading: "Loading the tokenizer (~2MB, once)…",
    tokenCount: (n) => `${n} token${n === 1 ? "" : "s"}.`,
    choppedNote: (rCount) => (
      <>
        {" "}
        Notice: <em>strawberry</em> got chopped — the model never sees the word, only the
        chunks. Your text has {rCount} “r”s, but the model can't count letters it never
        sees. That's why LLMs famously fail that question.
      </>
    ),
    wholeTokenNote: () => (
      <>
        {" "}
        Fun fact: here <em>“ strawberry”</em> (with its leading space) is common enough to
        earn a single token of its own. Now delete everything before it so it starts the
        text — same word, and watch it shatter into <code>st · raw · berry</code>.
        Tokenization even depends on <em>where</em> a word sits.
      </>
    ),
  },

  act2: {
    num: "Act 2",
    title: "The Map of Meaning — every word has neighbors",
    loading: (pct) => `Loading the dissection model (7.5MB, shared with Act 3)… ${pct}%`,
    placeholder: "Type a few words…",
    note: () => (
      <>
        These are the nearest neighbors in <em>this</em> model's embedding space — a map of meaning
        learned entirely from bedtime stories. That's the deepest lesson in this act: “meaning,” to
        a language model, is just <em>who you live next to</em> — and the neighborhood is decided
        by the training data. A model raised on children's stories files <em>dragon</em> beside
        whatever dragons did in those stories. Nothing more mystical than that.
      </>
    ),
  },

  act3: {
    num: "Act 3",
    title: "The Attention Room — who looks at whom",
    loading: (pct) => `Loading the dissection model (7.5MB, self-hosted)… ${pct}%`,
    lensHintIdle: "Click a token to see where it looks.",
    lensHintReading: (word) =>
      `Reading “${word}” — highlighted words show where this head sends its attention.`,
    layerLabel: "Layer",
    futureMasked: "the future is masked",
    diagIntro: "Auto-discovered in your sentence:",
    diagPrev: (layer, head, pct) => `👀 previous-word head · L${layer}H${head} (${pct}%)`,
    diagAnchor: (layer, head, pct) => `⚓ anchor head · L${layer}H${head} (${pct}%)`,
    diagDiffuse: (layer, head) => `🌫 most scattered · L${layer}H${head}`,
    note: () => (
      <>
        Every square is real: row = the word being read, column = the word it looks back at. These
        numbers came out of the 7.5MB model dissected live in your tab — scrub the layer slider
        and watch the same sentence get read sixteen different ways, eight times over.
      </>
    ),
  },

  act4: {
    num: "Act 4",
    title: "The Gamble — every word is a dice roll",
    gateIntro: "This act runs a real language model in your tab. One download, cached forever.",
    loadError:
      "The download didn't make it — bad connection, or the model CDN is blocked from where you are. Nothing is broken on your end.",
    tryAgain: "Try again",
    wakeModel: "Wake the model (~226MB, once — then cached forever)",
    think: "Think",
    tempCareful: "🧊 careful",
    tempChaotic: "🔥 chaotic",
    roll: "🎲 Roll the dice",
    picked: (word) => (
      <>
        it picked <strong>{word}</strong> — and now gambles again on what follows
      </>
    ),
    note: () => (
      <>
        Drag the temperature slider — the bars reshape <em>instantly</em>, because temperature
        isn't the model thinking harder. It's just how boldly it bets on the same hunches.
      </>
    ),
  },

  act5: {
    num: "Act 5",
    title: "The Loop — watch it write, one gamble at a time",
    loading: (pct) => `Loading the dissection model (7.5MB, shared)… ${pct}%`,
    stop: "⏸ Stop",
    cont: "▶ Continue",
    write: "▶ Write",
    step: "Step",
    reset: "Reset",
    legendHigh: "confident bet",
    legendMid: "split decision",
    legendLow: "long shot",
    legendHint: " — hover any word to see the dice roll it won.",
    note: () => (
      <>
        This is the same 7.5MB brain you dissected in Acts 2–3, now doing the only thing it knows:
        forward pass, probability list, dice roll, repeat. There is no plan, no sentence sketched
        in advance — each word is chosen before the next is even imaginable. Everything an LLM has
        ever written was written this way.
      </>
    ),
  },

  act6: {
    heading: "Act 6 · The Zoom-Out",
    p1: () => (
      <>
        Everything you just played with is the real mechanism — chopping, mapping, attending,
        gambling, looping. So what separates the 7.5MB toy in this tab from the AI you talk to
        every day? Almost nothing structural. The recipe is the same. What changes is{" "}
        <strong>scale</strong>:
      </>
    ),
    scale: [
      { label: "The model in this page", params: "1M non-embedding params · 7.5MB" },
      { label: "GPT-2 (2019)", params: "124M params" },
      { label: "Frontier models (2026)", params: "trillions of params (estimates)" },
    ],
    scaleNote:
      "(Log-ish scale, frontier sizes are public estimates. The bars are illustrative; the gap is not.)",
    p2: () => (
      <>
        Our toy has 8 layers and 16 heads per layer; frontier models stack around a hundred
        layers and thousands of heads' worth of attention, trained on trillions of tokens instead
        of a few gigabytes of bedtime stories. Scale doesn't change what the machine does — it
        changes how <em>uncannily well</em> the same dice-rolling starts to look like thought.
        That is the single most important — and most contested — fact in modern AI.
      </>
    ),
  },

  act7: {
    heading: "Act 7 · Why It Lies",
    p1: () => (
      <>
        Now you can solve the mystery that fills the news: why does a machine this capable{" "}
        <em>make things up</em>? You have already seen every ingredient of the answer.
      </>
    ),
    p2: () => (
      <>
        The model never stores facts — it stores <strong>neighborhoods</strong> (Act 2) and{" "}
        <strong>betting instincts</strong> (Act 4). When you ask for a citation it doesn't look
        one up; it rolls dice through the neighborhood where citations live, and out comes
        something citation-<em>shaped</em>. Authors that plausibly follow titles. Page numbers
        that plausibly follow authors. Each individual gamble is reasonable; the chain has no
        anchor to reality. And because the loop (Act 5) commits to every word before imagining
        the next, the model can talk itself into a corner — confidently — one plausible token at
        a time.
      </>
    ),
    p3: () => (
      <>
        Hallucination isn't a bug bolted onto the side of an otherwise truthful machine. It is
        the machine, doing exactly what you watched it do all essay — just in a place where
        plausible and true happen to disagree. Once you've seen the dice, you stop asking{" "}
        <em>“why does it sometimes lie?”</em> and start asking the sharper question:{" "}
        <em>“why is it so often right?”</em> — and the answer to that one is the scale bar above.
      </>
    ),
    p4: () => (
      <>
        The machine you now understand is the machine you use tomorrow. May every answer it gives
        you look a little different now — a chopper, a map, sixteen heads reading eight ways, and
        a great many dice.
      </>
    ),
  },

  footer: () => (
    <>
      Built as a free, open interactive essay · no accounts, no tracking, your text never
      leaves this tab · 中文版 in the works · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
