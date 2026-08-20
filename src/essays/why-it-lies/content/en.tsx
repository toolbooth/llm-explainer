import type { Essay2Strings } from "./types";

/**
 * English prose for essay #2. Same authorial voice as the flagship:
 * metaphor-dense, short-sentence payoffs, restrained humor. The claims-care
 * rules from essays/02-why-it-lies/OUTLINE.md are load-bearing here — the
 * sampling mechanism is demonstrated, never sold as the mechanistic cause of
 * frontier-model hallucination; no intent language survives past the title;
 * both "tells" ship with their failure modes attached.
 */
export const en: Essay2Strings = {
  docTitle: "Why It Lies — Inside the Machine, essay 2",
  metaDescription:
    "An interactive essay. Force a real language model — running in your browser — to bet on facts it cannot know, watch a fake citation assemble itself, and learn two honest tells for spotting confabulation.",
  htmlLang: "en",

  hero: {
    kicker: "INSIDE THE MACHINE · ESSAY 2 · RUNS ENTIRELY IN YOUR BROWSER",
    title: "Why It Lies",
    subtitle:
      "You've watched a language model think. Now watch it make something up — live, in this tab — and leave with two honest tricks for catching it.",
  },

  intro: {
    p1: () => (
      <>
        At the end of <a href="#/">essay #1</a> you watched a real language model think: chop,
        map, attend, gamble, loop. The finale made a promise — once you've seen the dice,
        hallucination stops being a mystery. This essay keeps that promise with your own hands on
        the table. Same machinery, four short experiments, one question:{" "}
        <em>why does a machine this fluent make things up?</em>
      </>
    ),
    p2: () => (
      <>
        First, the word in the title has to go. A lie needs a liar — someone who knows the truth
        and steers you away from it. The machine below has nothing to steer you away from: no
        beliefs, no intent, no private stash of facts it is choosing to hide. What it produces
        when it “lies” is stranger than dishonesty — <strong>confabulation without a
        speaker</strong>. Every time this essay says <em>lies</em>, the quotation marks are doing
        real work.
      </>
    ),
  },

  sec1: {
    heading: "§1 · The Bet It Can't Refuse",
    p1: () => (
      <>
        A language model has no silence token. There is no entry in its vocabulary for staying
        quiet, no way for the pipeline to end in a shrug. Every prompt — <em>every</em> prompt —
        must end in a distribution over next words. Ask a librarian for the capital of Atlantis
        and you get a raised eyebrow. Ask a language model, and you get bars.{" "}
        <strong>It cannot not bet.</strong>
      </>
    ),
    p2: () => (
      <>
        To be fair: nothing stops a model from writing “I don't know” — those are tokens too, and
        training can make them likely. But that honesty has to be learned, bet by bet, like
        everything else; there is no built-in silence to fall back on. Some bar always wins. Try
        a question no one can answer, and watch the bars rise anyway.
      </>
    ),
    widget: {
      num: "§1",
      title: "The Bet It Can't Refuse — ask it something unknowable",
      gateIntro:
        "This section runs a real 135M-parameter model in your tab — the same one essay #1's Act 4 wakes. One download, cached forever.",
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
      note: () => (
        <>
          The model bets on your question whether or not an answer exists. That isn't a flaw
          bolted on later — at this layer, betting is the only move the mechanism has.
        </>
      ),
    },
  },

  sec2: {
    heading: "§2 · Citation-Shaped Dice",
    p1: () => (
      <>
        Here is the same loop you watched write a story in essay #1, pointed at the most
        notorious crime scene: the bibliography. The brain below is our 7.5MB storybook model —
        it has never read a journal in its life, so its “references” come out charmingly
        story-flavored. Watch the shape anyway, because the shape is the lesson. Hover any token
        and you'll find a perfectly reasonable local bet: a plausible word after
        “References”, a plausible word after that. <strong>Each link defensible; the chain
        anchored to nothing.</strong> Nothing in the loop ever checks the sentence against the
        world — there is no “against the world” anywhere in the machinery.
      </>
    ),
    p2: () => (
      <>
        This is worth saying carefully. What you're watching is the <em>sampling mechanism</em> —
        how any output, true or false, gets produced. It is not a diagnosis of why some frontier
        model invented a court case last week: those failures also involve training data,
        human-feedback fine-tuning, retrieval — moving parts our toy doesn't have. What the
        mechanism explains is why making-things-up is the <em>default</em> that big models must
        be trained away from, not the accident report for any particular fabrication.
      </>
    ),
    widget: {
      num: "§2",
      title: "Citation-Shaped Dice — watch a reference assemble",
      loading: (pct) => `Loading the storybook model (7.5MB, shared with essay #1)… ${pct}%`,
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
          Every token you hover won its local dice roll fair and square. The chain reads
          fluently because each bet is reasonable — and that is the whole trick. Fluency is the
          mechanism working; truth was never one of its inputs.
        </>
      ),
    },
  },

  sec3: {
    heading: "§3 · The Re-Roll Test",
    p1: () => (
      <>
        Now the practical part. If the model “knew” the answer — if the fact is carved deep into
        its weights — then asking again should get the same answer.{" "}
        <strong>Memory is stable under re-rolling. Dice are not.</strong> The widget below asks
        your prompt five times at the same temperature and lines the five continuations up:
        spans that agree across rolls glow steady blue; spans that scatter run hot orange. Try
        the France preset, then the Atlantis one, and watch memory and dice separate in front of
        you.
      </>
    ),
    p2: () => (
      <>
        One warning, tied to the tool like a safety tag: <em>agreement is a heuristic, not a
        proof</em>. A falsehood the model learned well — a misconception half the internet
        repeats — re-rolls just as consistently as a fact. Five samples at one temperature is a
        probe. Scatter is strong evidence of dice; stability is only weak evidence of truth.
      </>
    ),
    widget: {
      num: "§3",
      title: "The Re-Roll Test — same question, five rolls",
      gateIntro:
        "Same 135M model as §1 — if you already woke it there, this button is instant. Otherwise: one download, cached forever.",
      loadError:
        "The download didn't make it — bad connection, or the model CDN is blocked from where you are. Nothing is broken on your end.",
      tryAgain: "Try again",
      wakeModel: "Wake the model (~136MB, once — then cached forever)",
      roll: "🎲 Ask it five times",
      rolling: (done, k) => `rolling ${done}/${k}…`,
      tempNote: "T = 0.8, fixed — same dice, five throws.",
      legendStable: "agrees across rolls",
      legendMixed: "mixed",
      legendScatter: "scatters",
      legendHint: " — color = how many of the five rolls put the same token in this spot.",
      agreement: (pct) => (
        <>
          Agreement across rolls: <strong>{pct}%</strong>. Stable spans are <em>candidates</em>{" "}
          for memory — not certificates of truth.
        </>
      ),
      note: () => (
        <>
          The alignment is deliberately naive — token-by-position — so a shared answer that
          shifts by a word can read as scatter. It errs on the side of suspicion, which is the
          right side for a tell.
        </>
      ),
    },
  },

  sec4: {
    heading: "§4 · Sharp vs Flat",
    p1: () => (
      <>
        The re-roll test costs five queries. Here is the cheaper tell, hiding in a widget you
        already know: <strong>the shape of the bet</strong>. Load the two presets below into the
        same bars. “The capital of France is” comes out sharp — one bar towering, the rest
        cowering. “The capital of Atlantis is” comes out flat — a committee of small bars
        shrugging at each other. That flatness has a name, <em>entropy</em>, and it is the
        closest thing the model has to felt confidence.
      </>
    ),
    p2: () => (
      <>
        And the safety tag again, because this one gets misused: shape is a tell, not a
        truth-meter. Models are routinely confidently wrong; calibration varies by model and by
        domain; a popular misconception can be peaked as perfectly as a fact. Sharp means the
        model has seen this movie many times. It does not mean the movie was a documentary.
      </>
    ),
    widget: {
      num: "§4",
      title: "Sharp vs Flat — two prompts, same bars",
      gateIntro:
        "Same 135M model as §1 — if you already woke it there, this button is instant. Otherwise: one download, cached forever.",
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
      note: () => (
        <>
          Same bars, same temperature — the only thing that changed is how sure the model's
          training left it. Read the shape, not just the top word. Then remember the shape can
          lie too.
        </>
      ),
    },
  },

  outro: {
    heading: "Exit, With Two Tells",
    p1: () => (
      <>
        So — why does it “lie”? Because you have watched it, all series long, do exactly one
        thing: sample a plausible next token. And <strong>plausible is not true</strong>.
        Hallucination isn't the machine breaking; it is the machine working, in a place where
        plausibility and truth happen to disagree. No intent. No deception. Dice.
      </>
    ),
    p2: () => (
      <>
        None of this is a life sentence. Retrieval grounding — letting the model look things up
        before it bets — and calibration training measurably reduce confabulation. This essay
        explains why the <em>default</em> behavior needs that help, not why help is impossible.
        Until it arrives everywhere, you carry two tells: re-roll and watch for scatter; when
        you can see the bars, read their shape. Both fallible. Both better than trust.
      </>
    ),
    p3: () => (
      <>
        The machine will bet whether or not the truth is on the table. You've seen the dice —
        count them before you believe the roll.
      </>
    ),
  },

  footer: () => (
    <>
      Essay 2 of <a href="#/essays">Inside the Machine</a> · free and open · no accounts, no
      tracking, your text never leaves this tab · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
