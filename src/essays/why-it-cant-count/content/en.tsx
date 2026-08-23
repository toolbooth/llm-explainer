import type { GambleStrings } from "../../../acts/Gamble";
import type { Essay4Strings } from "./types";

/**
 * English prose for essay #4. Same authorial voice as the flagship:
 * metaphor-dense, short-sentence payoffs, restrained humor. The claims-care
 * rules from essays/04-why-it-cant-count/OUTLINE.md are load-bearing here —
 * tokenization is ONE root, not the whole tree (Act 3 says so in the body);
 * frontier models now often get strawberry right and the intro says so
 * plainly; the model is blind at the token grain, never "dumb"; every
 * digit-tokenization sentence was measured on the two tokenizers in this
 * page; "spelling helps" is a nudge for our 135M model and a big-model claim
 * otherwise.
 */

/** The Gamble's chrome, shared by the two bar widgets on this page. */
const gamble: Omit<GambleStrings, "num" | "title" | "gateIntro" | "note"> = {
  loadError:
    "The download didn't make it — bad connection, or the model CDN is blocked from where you are. Nothing is broken on your end.",
  tryAgain: "Try again",
  wakeModel: "Wake the model (~136MB, once — then cached forever)",
  think: "Think",
  tempCareful: "🧊 careful",
  tempChaotic: "🔥 chaotic",
  roll: "🎲 Roll the dice",
  picked: (word) => (
    <>
      it picked <strong>{word}</strong> — and now gambles again on what follows
    </>
  ),
};

export const en: Essay4Strings = {
  docTitle: "Why It Can't Count — Inside the Machine, essay 4",
  metaDescription:
    "An interactive essay. X-ray your own word to see the pieces a language model actually receives, then watch a real model — running in your browser — try to count its letters, with and without the word spelled out. Why counting, spelling and arithmetic share one root.",
  htmlLang: "en",

  hero: {
    kicker: "INSIDE THE MACHINE · ESSAY 4 · RUNS ENTIRELY IN YOUR BROWSER",
    title: "Why It Can't Count",
    subtitle:
      "It writes sonnets and fumbles the r's in strawberry. Not a thinking problem — a seeing problem. X-ray your own word, then watch a real model try.",
  },

  intro: {
    p1: () => (
      <>
        In <a href="#/">essay #1</a> the Chopper made a joke at a famous question's expense: ask
        a language model how many r's are in <em>strawberry</em> and it stares at three chunks —{" "}
        <code>st · raw · berry</code> — like you'd stare at three jigsaw pieces and get asked how
        much the puzzle weighs. This essay takes it seriously,
        because behind it is the most useful fact for predicting when a fluent model will
        fumble: <strong>the model's world is tokens, not letters.</strong>
      </>
    ),
    p2: () => (
      <>
        Two things first. One: the big assistants now usually get strawberry
        right — this question became famous, it is all over their training data, and the
        products route it to a slower reasoning mode or a calculator. Two: the mechanism
        underneath did not change: the same models still receive words as chunks, and the same
        question about a less famous word, or a longer sum, finds the old seam. None of this is a
        machine being dumb. It is a machine being asked to count the legs on an animal it has
        only ever heard described.
      </>
    ),
  },

  sec1: {
    heading: "Act 1 · Perception Is Tokens",
    p1: () => (
      <>
        Here is the Chopper again, opened on the word by itself. The tokenizer — a small separate
        program that runs before the model wakes — snaps your text to a fixed menu of about
        fifty thousand pieces. Common words get a piece of their own; rarer ones are built
        from fragments. The model receives the piece numbers and nothing else: no letters, no
        spelling, no way to look inside <code>#301</code> and find an r.
      </>
    ),
    p2: () => (
      <>
        Put a space in front of strawberry and it becomes one piece — with the
        space, it is common enough to have earned one. Type a number and watch it cut
        like a word. Type an emoji, or a 中文 character, and watch it break into bytes. None of
        these cuts is a decision the model makes, or a mistake — pieces keep inputs short and
        cover every alphabet. They are the grain of the model's senses, fixed
        before training started, the way your eyes stop at ultraviolet. Perception has a
        resolution. The model's is the token.
      </>
    ),
    widget: {
      num: "Act 1",
      title: "Perception Is Tokens — the Chopper, one word at a time",
      placeholder: "Type a word, a number, an emoji…",
      loading: "Loading the tokenizer (~2MB, once)…",
      tokenCount: (n) => `${n} token${n === 1 ? "" : "s"}.`,
      choppedNote: (rCount) => (
        <>
          {" "}
          <em>strawberry</em> got chopped: the word never reaches the model, only the pieces. Your
          text has {rCount} “r”{rCount === 1 ? "" : "s"}, and not one of them arrives as a token.
        </>
      ),
      wholeTokenNote: () => (
        <>
          {" "}
          With its leading space, <em>“ strawberry”</em> is common enough to be one piece. Delete
          whatever sits in front of it and watch it shatter again — where a word stands changes
          how it is cut.
        </>
      ),
    },
  },

  sec2: {
    heading: "Act 2 · The X-ray",
    p1: () => (
      <>
        The X-ray below shows the letters you see, then
        the pieces the model sees — this time cut by the tokenizer of the 135-million-parameter
        model from Act 4, because it is about to take the test. For strawberry, ten letters and
        three r's become three pieces, and the letter r never arrives on its own: it is melted
        into <code>raw</code> and <code>berry</code>. To count it, the model would have to know,
        from a piece number alone, which letters made the piece. Sometimes it does, from
        pieces spelled out in its training text. Often it doesn't.
      </>
    ),
    p2: () => (
      <>
        Then wake the model and let it try, two ways. <strong>Straight</strong>: <em>how many r's
        are in strawberry?</em> <strong>Spelled out first</strong>: the same question about{" "}
        <code>s-t-r-a-w-b-e-r-r-y</code> — nineteen tokens, one per letter and hyphen, so the r's
        now exist as things the model can attend to. Each attempt shows as its bet on the
        answer's first digit. Expect humility: this is a small model, close to guessing in both
        modes on most words. What the second panel demonstrates is not a cure but a
        change in the input — the letters are finally in the room.
      </>
    ),
    widget: {
      num: "Act 2",
      title: "The X-ray — what you see, what it sees, what it answers",
      wordLabel: "word",
      letterLabel: "letter",
      loadingTokenizer: "loading the model's tokenizer (~3MB, once)…",
      youSee: "you see",
      modelSees: "it sees",
      letterTally: (letters, count, letter) =>
        `${letters} letter${letters === 1 ? "" : "s"} · ${count} × “${letter}”`,
      pieceTally: (pieces) => `${pieces} piece${pieces === 1 ? "" : "s"}`,
      insight: ({ letters, count, letter, pieces, carriers }) =>
        count === 0 ? (
          <>
            {letters} letters, no “{letter}” at all — and {pieces} piece{pieces === 1 ? "" : "s"}{" "}
            that say nothing about letters either way. The model has no “{letter}” to find and no
            way to confirm its absence.
          </>
        ) : carriers.length === count && pieces === letters ? (
          <>
            {letters} letters, {count} × “{letter}” — and every character is its own piece here.
            This is the spelled-out case: the letter arrives as a token the model can attend to.
          </>
        ) : (
          <>
            {letters} letters, {count} × “{letter}” → {pieces} piece{pieces === 1 ? "" : "s"}. The
            “{letter}” never arrives by itself: it is melted into{" "}
            {carriers.map((id, i) => (
              <span key={id}>
                {i > 0 && (i === carriers.length - 1 ? " and " : ", ")}
                <code>#{id}</code>
              </span>
            ))}
            . To count it, the model must know what those ids are made of.
          </>
        ),
      gateIntro:
        "The counting test runs the real 135M-parameter model from essay #1's Act 4 in your tab. One download, cached forever.",
      loadError:
        "The download didn't make it — bad connection, or the model CDN is blocked from where you are. Nothing is broken on your end.",
      tryAgain: "Try again",
      wakeModel: "Wake the model (~136MB, once — then cached forever)",
      run: "Ask it — straight, then spelled out",
      running: "counting…",
      straightHeading: "Straight",
      spelledHeading: "Spelled out first",
      promptLabel: "what the model was given:",
      truthLabel: (truth) => `true count: ${truth}`,
      otherMass: (pct) => `non-digit tokens: ${pct}%`,
      verdictHit: (digit) => (
        <>
          Its top digit is <strong>{digit}</strong> — right.
        </>
      ),
      verdictMiss: (digit, truth) => (
        <>
          Its top digit is <strong>{digit}</strong>; the answer is {truth}.
        </>
      ),
      verdictNone: "No digit among its top candidates — it isn't even answering in numbers.",
      rawTop: "raw top tokens:",
      note: () => (
        <>
          Each histogram is the model's bet on the <em>first</em> token after the prompt, read
          over the digits 0–9 at T = 1 — a “1” could be the start of “10”. The true count is
          outlined. This 135M model is mostly guessing in both panels; on strawberry the
          spelled-out version tips the winner to 3 while the histogram stays flat. That is the
          honest size of the effect here. In bigger models, the same move is the difference
          between wrong and right.
        </>
      ),
    },
  },

  sec3: {
    heading: "Act 3 · Digits Are Tokens Too",
    p1: () => (
      <>
        Numbers go through the same chopper, and each tokenizer chops them its own way. The GPT-2
        vocabulary the Chopper uses has a token for every one- and two-digit string and most
        three-digit ones, so longer numbers break into chunks cut from the left: 1234 becomes{" "}
        <code>12 · 34</code>, 12345 becomes <code>123 · 45</code>, and one million is{" "}
        <code>1 · 000000</code>. The model in this section goes the other way: every number
        becomes single digits — 1234 is <code>1 · 2 · 3 · 4</code> — with a bare space token
        in front. Two vocabularies, two experiences of the same number — neither the one you
        had in second grade. Whatever model you use, check how it chops.
      </>
    ),
    p2: () => (
      <>
        But the tokenizer is only the first problem, and that needs saying. Even with
        clean single-digit tokens, the model writes its answer left to right, one digit per step,
        with no scratch paper — and the leftmost digit has to already account for the carries you
        would work out last. Load the presets below. Bare, <code>47 * 23 =</code> gets a nearly flat first digit;
        asked in full — <em>Q: What is 47 * 23?</em> — the model puts most of its weight on 1,
        which is right, because the magnitude is easy. Hand it a correct start,{" "}
        <code>47 * 23 = 10</code>, and the next digit goes flat again. Left
        alone, it writes 1042; the answer is 1081. Chopped input, sequential output, no working
        memory: arithmetic fails at three seams, and tokenization is only one of them.
      </>
    ),
    widget: {
      ...gamble,
      num: "Act 3",
      title: "Digits Are Tokens Too — the first digit is easy, the last is not",
      gateIntro:
        "Same 135M model as Act 2 — if you already woke it there, this button is instant. Otherwise: one download, cached forever.",
      note: () => (
        <>
          The bars are over single digits because that is how this model's vocabulary cuts
          numbers; the prompts end in a space because the vocabulary puts its own space token
          before a number. Compare the shape on <code>=</code> (a magnitude guess) with the shape
          one digit in (a carry it cannot see).
        </>
      ),
    },
  },

  sec4: {
    heading: "Act 4 · The Fix Follows the Mechanism",
    p1: () => (
      <>
        If the failure is perception, the fixes are ways of putting the missing thing into the
        token stream — or taking the job out of the model. Spell the word out, and the letters
        become tokens. Make it count out loud — <em>s, t, r (1) … r (2), r (3)</em> — and the last
        step stops being “count in your head” and becomes “copy the tally”; a reasoning mode
        that thinks for a paragraph before answering is doing exactly this. Hand it a
        calculator — a line of code that runs outside the model — and the count happens somewhere
        characters exist. And teach it the famous cases — part of why strawberry works today is that
        strawberry was taught.
      </>
    ),
    p2: () => (
      <>
        Load the three presets and watch the weight move: the straight question, the
        spelled-out one, and the spelled-out one with the tally written in. For our small
        model the movement is a nudge — the winner tips to 3, the histogram stays flat — and that
        is the honest result at this size. In bigger models the same three moves are
        the difference between wrong and right. The lesson is not the trick; it's where the trick
        comes from. Every fix here is a way of handing the model letters. None of them is a way
        of making it see.
      </>
    ),
    widget: {
      ...gamble,
      num: "Act 4",
      title: "The Fix Follows the Mechanism — straight, spelled, tallied",
      gateIntro:
        "Same 135M model as Act 2 — if you already woke it there, this button is instant. Otherwise: one download, cached forever.",
      note: () => (
        <>
          Three prompts, one question, more of the work done in the text each time. The third
          preset is the chain-of-thought trick in miniature: the count is already on the page, so
          the last step is copying, not counting. (A real tool call — running{" "}
          <code>"strawberry".count("r")</code> — would leave the model entirely; this toy can only
          predict what such code usually looks like.)
        </>
      ),
    },
  },

  outro: {
    heading: "Exit, Spelling It Out",
    p1: () => (
      <>
        So why can't it count? Because the question is about letters, and the model never
        receives letters. It receives pieces, and learns about the insides of pieces only by
        accident. Counting, spelling, reversing a word, finding a rhyme, adding long numbers — all
        of it is character work posed to a system whose senses stop at the token.
      </>
    ),
    p2: () => (
      <>
        <strong>The model's world is tokens, not letters.</strong> Keep that sentence; it predicts
        the failures better than any list of them. When a model stumbles on something a child
        can do, ask first whether the child could do it blindfolded, by ear. Then ask what the fix
        would be — and notice that spelling it out, counting out loud and calling a calculator
        are all the same move: getting the letters into the room.
      </>
    ),
    p3: () => (
      <>
        Take a word the internet never argued about — your surname, your street — to the X-ray,
        and count with it.
      </>
    ),
  },

  footer: () => (
    <>
      Essay 4 of <a href="#/essays">Inside the Machine</a> · free and open · no accounts, no
      tracking, your text never leaves this tab · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
