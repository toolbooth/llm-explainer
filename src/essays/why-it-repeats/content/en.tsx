import type { GambleStrings } from "../../../acts/Gamble";
import type { Essay5Strings, ParrotStrings } from "./types";

/**
 * English prose for essay #5. Same authorial voice as the flagship:
 * metaphor-dense, short-sentence payoffs, restrained humor. The claims-care
 * rules from essays/05-why-it-repeats/OUTLINE.md are load-bearing here —
 * every number is from the 2026-09-15 measurement run on the real
 * TinyStories-1M weights (REVIEW-05.md has the full tables); the greedy
 * loops quoted are what THIS model actually produces from the presets;
 * self-reinforcement is reported at its honest size for a 1M-parameter
 * model, with the big-model literature named for the strong version; and
 * the "finite scenery" argument is stated as a conditional (a model that
 * saw only a fixed window WOULD cycle forever) because our model reads the
 * whole growing context and measurably wobbles out of its own chants.
 */

/** The Parrot's shared chrome (flagship act-5 labels where they overlap). */
const parrot: Omit<ParrotStrings, "num" | "title" | "verdict" | "note"> = {
  loading: (pct) => `Loading the storybook model (7.5MB, shared with essay #1)… ${pct}%`,
  write: "▶ Write",
  stop: "⏸ Stop",
  cont: "▶ Continue",
  reset: "Reset",
  greedy: "🔒 greedy — always the top word",
  noRepeat: "No repeated phrase in this run — detection runs on the output, and this output has none.",
  legendRepeat: "repeated phrase",
  legendHint:
    " — same color, same phrase, found in the actual output (never scripted). Hover any word for the bets behind it.",
};

export const en: Essay5Strings = {
  docTitle: "Why It Repeats Itself — Inside the Machine, essay 5",
  metaDescription:
    "An interactive essay. Watch a real language model — running in your browser — fall into “The cat sat on the mat. The cat sat on the mat.” loops, measure how each repetition deepens the groove, and break the chant with the temperature dial. Why greedy decoding circles, and why dice are the cure.",
  htmlLang: "en",

  hero: {
    kicker: "INSIDE THE MACHINE · ESSAY 5 · RUNS ENTIRELY IN YOUR BROWSER",
    title: "Why It Repeats Itself",
    subtitle:
      "The cat sat on the mat. The cat sat on the mat. The cat — every language model has a stuck-record mode. Watch a real one fall into the groove, and watch a pinch of randomness lift the needle.",
  },

  intro: {
    p1: () => (
      <>
        Anyone who ran a language model at home in the early years can do the impression: the
        story starts fine, wobbles, and then chants — <em>the door opened the door opened the
        door</em>. The big assistants have mostly outgrown it, but the failure is medicated, not
        cured — run a small open model with temperature zero and penalties off, and you can summon
        it tonight. A machine this complicated has a thousand ways to be wrong. Why is its
        signature failure <strong>going in circles</strong>?
      </>
    ),
    p2: () => (
      <>
        This page answers with <a href="#/">essay #1</a>'s 7.5MB storybook brain — every widget
        shares it, no big download. The answer has three parts.{" "}
        <em>One</em>: “always pick the most likely next word” is a machine with no randomness —
        same text in, same word out, every time. <em>Two</em>: a walker with no dice, in scenery
        that repeats, can only walk the same loop. <em>Three</em>, the vicious part: every lap
        makes the loop more likely, because a phrase that just appeared twice is, to the model, a
        phrase that appears. Every cure — temperature, penalties, all of them — is one medicine in
        different bottles: dice.
      </>
    ),
  },

  sec1: {
    heading: "Act 1 · The Groove",
    p1: () => (
      <>
        Each step ends with essay #1's bet sheet: a probability for every possible next token.{" "}
        <strong>Greedy decoding</strong> cashes it the simplest way: take the favorite, every
        step, no dice. Two things follow. Determinism — press <em>Write</em>, then{" "}
        <em>Reset</em>, then <em>Write</em>: the same story, letter for letter, because nothing
        anywhere changed. And the groove: its choice depends only on the text so far, so the
        moment recent text resembles something it has continued once, it continues it the same
        way — producing text that resembles it even more. A needle in a record groove, cutting
        the groove deeper as it plays.
      </>
    ),
    p2: () => (
      <>
        The first preset walks straight in: two identical <em>“They slid down the slide.”</em> by
        token 32, a brief recovery, then — press <em>Continue</em> — a chant of <em>“It was red
        and blue.”</em>, a six-token cycle, five full laps, fraying at last into <em>“It was
        not…”</em>. The fraying matters. A model choosing from only its last few words would be
        trapped by one revisit, forever — a deterministic map over finitely many states has
        nowhere new to go. Ours rereads the <em>whole</em> growing text, position and all, so
        each lap is a slightly different state and a small model can wobble out — the bird preset
        even chants its way to a happy ending and stops. Bigger models, better at holding the
        pattern, historically locked in harder.
      </>
    ),
    widget: {
      ...parrot,
      num: "Act 1",
      title: "The Parrot — greedy decoding, needle in the groove",
      verdict: (unit, count) => (
        <>
          Detected in this run: <strong>“{unit}”</strong> × {count} — found in the output, not
          scripted.
        </>
      ),
      note: () => (
        <>
          Greedy mode ignores the dice entirely: at every step it takes the top row of the bet
          sheet (hover any word to see the sheet — the percentages shown are the T = 1 odds among
          the top 8). The highlighting is computed from the tokens the model actually produced:
          exact repeated phrases, same phrase = same color. Greedy loops like these are the
          classic “neural text degeneration” — big models did it too (Holtzman et al. 2020 watched
          GPT-2 fall into loops under greedy and beam search); ours frays faster because it holds
          the pattern less firmly.
        </>
      ),
    },
  },

  sec2: {
    heading: "Act 2 · The Groove Deepens",
    p1: () => (
      <>
        Why circles, and not some other failure? Because repetition is the one mistake that
        recruits. Below, essay #1's bars point at a famous sentence; load the presets in order.
        After one <em>“The cat sat on the mat.”</em>, the favorite next word is{" "}
        <em>She</em> at 28%, with <em>The</em> second at 26%. After two copies, <em>The</em> leads
        at 51%. After three, 59%. The model has no memory outside the text; it reads the text as
        evidence of what this document is like — and a document that has said the same thing
        twice is a document that says things twice. Each lap is an argument for the next.{" "}
        <strong>The groove deepens because it is walked.</strong>
      </>
    ),
    p2: () => (
      <>
        The same push shows on the whole sentence. The chance of reproducing the <em>exact</em>{" "}
        seven-token sentence next climbs from one in half a million (one copy) to one in thirteen
        thousand (two) to one in twelve hundred (four) — four hundred times stronger in three
        encores, and still a long shot — so <em>this</em> parrot rarely echoes your sentence,
        preferring ruts of its own (Act 1's red-blue chant). In large models the same climb — the
        literature's <strong>self-reinforcement</strong> — gets steep enough to capture the whole
        continuation. And the newline bar grows from 1% to 6%: to a brain raised on tiny stories
        that <em>end</em>, chanting reads as a closing ritual.
      </>
    ),
    widget: {
      num: "Act 2",
      title: "The Encore Meter — one sentence, once, twice, three times",
      loading: (pct) => `Loading the storybook model (7.5MB, shared with essay #1)… ${pct}%`,
      gateIntro: "The bars come from the shared 7.5MB storybook model — no extra download.",
      loadError:
        "The download didn't make it — bad connection, or the weights are blocked from where you are. Nothing is broken on your end.",
      tryAgain: "Try again",
      wakeModel: "Wake the model",
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
          Top-10 bars at T = 1, from the same 7.5MB model as every widget on this page. The
          percentages quoted in the prose are this model's, measured; Xu et al. 2022 (“Learning to
          Break the Loop”) measured the same climb in much bigger models, where it is steeper. The
          temperature slider only reshapes these bars — the next act pulls that lever inside a
          live loop.
        </>
      ),
    },
  },

  sec3: {
    heading: "Act 3 · Shake the Needle",
    p1: () => (
      <>
        Temperature, in one line: logits are divided by T before the softmax, so low T sharpens
        the favorite's edge and T near zero <em>is</em> greedy. Now the experiment. Run the
        preset greedy twice (<em>Write</em>, then <em>Continue</em>): by token 80 it chants{" "}
        <em>“You have to be careful and respectful.”</em> — an eight-token lap, three laps and
        holding. Unlock the toggle and <em>Continue</em> at different temperatures. Measured from
        inside that chant with this widget's own sampler: at T = 0.3 another full lap survives
        the dice about half the time (55%); at T = 0.5, once in five; at T = 0.8, once in thirty;
        at T = 1, once in a hundred.
      </>
    ),
    p2: () => (
      <>
        Two details matter. First, the groove deepens <em>under your feet</em>: at a fixed T =
        0.3, the chance of one more lap rose from 28% after the first lap to 43% after the
        second to 55% after the third — Act 2's self-reinforcement, measured inside a live loop.
        Break it early. Second, read the actual escapes: <em>“You have to listen to me”</em>,{" "}
        <em>“Next time, you will be careful and respectful to each other.”</em> The dice don't
        know where the rut is. They
        only decline to take the favorite road every single time — and one lucky token changes
        the scenery, which changes every bet after it. That asymmetry is the whole cure: a loop
        needs <em>every</em> step to cooperate; an escape needs one.
      </>
    ),
    widget: {
      ...parrot,
      num: "Act 3",
      title: "The Parrot, Shaken — temperature against the chant",
      verdict: (unit, count) => (
        <>
          Detected in this run: <strong>“{unit}”</strong> × {count} — found in the output, not
          scripted.
        </>
      ),
      note: () => (
        <>
          Same widget, same brain as Act 1 — the toggle and the slider are the only difference,
          which is the lesson. The sampler is top-k = 8 temperature sampling (essay #1's Act 5
          machinery); the survival percentages in the prose were measured with exactly this code
          on exactly this loop. In twelve seeded runs at T = 0.3, five chanted straight through
          fourteen tokens; at T = 0.6 and T = 1, none did — seeds and escape transcripts in the
          repo's review notes.
        </>
      ),
    },
  },

  sec4: {
    heading: "Act 4 · The Pharmacy",
    p1: () => (
      <>
        The anti-repetition shelf on any model API's settings page is one prescription in
        different strengths. <strong>Temperature</strong> flattens the favorite's edge so the
        dice can disagree. <strong>Top-p and top-k</strong> trim the bet sheet before rolling:
        dice with guardrails. <strong>Presence and frequency penalties</strong> aim squarely at
        Act 2 — if appearing in the text raises a token's probability, subtract the raise back
        out: a tax on incumbency. The bluntest bottle, the <strong>no-repeat-n-gram ban</strong>,
        simply forbids a third copy. Different labels, one active ingredient: stop letting the
        map be only a map.
      </>
    ),
    p2: () => (
      <>
        Every bottle has side effects, because not all repetition is disease: a heroine must keep
        being named Lily, code and shopping lists repeat lawfully, and cranked penalties make a
        model dodge words it needs. It is also why your assistant rarely chants: sampling
        defaults and penalties tuned for you, fine-tuning that marks repetition down. The groove
        is paved over, not filled in. The mechanism underneath is
        unchanged, which you can verify: you just did, on a model with the paving stripped away.
      </>
    ),
  },

  outro: {
    heading: "Exit, Lifting the Needle",
    p1: () => (
      <>
        So why does it repeat itself? Because “always take the best next word” is a machine with
        no randomness, feeding on its own output. The moment its text looks like something it has
        watched itself write, it writes it again — and each lap makes the next more likely.
        Repetition is not a glitch on top of next-word prediction; it is what next-word
        prediction <em>does</em> once you remove the dice. The best local step, taken every time,
        is a terrible global walk.
      </>
    ),
    p2: () => (
      <>
        Keep the strange part: this is the one place in the machine where randomness is
        load-bearing. <a href="#/essays/why-it-lies">Essay #2</a> showed the bill — dice happily
        invent citations. Here is what the same dice buy: motion. A model that never gambles
        walks in circles; a model that gambles a little walks somewhere. The dial between those
        failures is yours.
      </>
    ),
    p3: () => (
      <>
        Bring your own opening line to the Parrot. Run it greedy twice and watch determinism look
        you in the eye — then unlock the dice, one notch at a time, and find the temperature
        where your story stops circling.
      </>
    ),
  },

  footer: () => (
    <>
      Essay 5 of <a href="#/essays">Inside the Machine</a> · free and open · no accounts, no
      tracking, your text never leaves this tab · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
