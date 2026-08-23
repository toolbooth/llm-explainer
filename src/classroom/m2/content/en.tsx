import type { M2Strings } from "./types";

/**
 * English prose for Module 2, "The Next-Word Gamble". Register: a lesson,
 * not an essay — student-facing sentences are short and concrete, teacher
 * lines are marked as such, and every number a sentence quotes arrives as
 * an argument from src/classroom/m2/data.ts (measured 2026-08-22 on the
 * real model), never retyped here. Prompts are sized for a 45-minute
 * period: each step is one task, one write-down, three hints.
 */

const pct = (p: number) => `${Math.round(p * 100)}%`;
const word = (s: string) => `“${s.trim()}”`;

const loadingNano = (pctDone: number) => `Loading the model (7.5 MB, shared by every widget on this page)… ${pctDone}%`;

const gambleCommon = {
  gateIntro: "This widget runs the 7.5 MB classroom model in your tab.",
  loadError: "The model didn't load — check the connection and reload the page. Nothing is broken on your end.",
  tryAgain: "Try again",
  wakeModel: "Load the model (7.5 MB, once)",
  think: "Think",
  tempCareful: "🧊 careful",
  tempChaotic: "🔥 chaotic",
  roll: "🎲 Roll the dice",
  picked: (w: string) => (
    <>
      it rolled <strong>{w}</strong> — and now gambles again on what follows
    </>
  ),
  loading: loadingNano,
};

export const en: M2Strings = {
  docTitle: "Module 2 · The Next-Word Gamble — Classroom Edition",
  metaDescription:
    "A 45-minute lesson: is a language model choosing the next word, or rolling dice? Real model in the browser, probability bars, a hundred-roll histogram, the autoregressive loop, a dice-and-table unplugged opener, evaluation act, exit ticket. No accounts, no data collected.",
  title: "The Next-Word Gamble",
  question: "Is the model choosing, or rolling dice?",
  modelNote: () => (
    <>
      <strong>This module wakes the model.</strong> Every widget on this page runs TinyStories-1M
      live in your tab — one 7.5 MB download, shared, then cached. It writes children's stories
      and nothing else, which is exactly why its gambles are easy to watch.
    </>
  ),

  hook: {
    teacherLine: () => (
      <>
        <strong>Teacher, on the projector:</strong> keep the cat, or type a sentence from the room
        that stops before an interesting word. Press Think, then Roll the dice three times. Say
        nothing about why the ending changed.
      </>
    ),
    prose: (f) => (
      <>
        A language model does not pick the best next word. It writes down every word it could
        say next, gives each one a probability, and rolls. For <em>The cat sat on the</em> the
        favourite is {word(f.favourite)} — at {pct(f.p10)}. Four rolls in five, something else wins.
        Same sentence, same model, different roll, different word.
      </>
    ),
    widget: {
      ...gambleCommon,
      num: "Hook",
      title: "The Gamble — one sentence from the room",
      note: () => (
        <>
          The bars are the model's list for the next word — its top ten, adding up to 100%. Roll
          the dice and it picks one at random, weighted by the bars, then gambles again on the
          word after that.
        </>
      ),
    },
  },

  unplugged: {
    prose: () => (
      <>
        Before anyone touches a keyboard: two dice, three printed tables, and a sentence to finish.
        Each table is the model's real list for one position, with the 36 dice outcomes shared out
        in proportion to the probabilities. Roll, look up the word, write it, move to the next
        table. Three words later, compare endings with the pair next to you — and argue about
        whether the machine chose anything.
      </>
    ),
    link: "Open the printable",
  },

  explore: {
    intro: () => (
      <>
        Three prompts, three widgets, one model. Use your own sentences — stop them right before
        the word you are curious about. Stuck? Each prompt has three hints; open them one at a
        time.
      </>
    ),
    steps: [
      {
        title: "The list behind the word",
        prompt: () => (
          <>
            Type a sentence that stops mid-way — five to eight words, ending right before an
            interesting word — and press Think. Read the list: what is the favourite, and how sure
            is the model (the percentage)? Now press Roll the dice five times. How many times did
            the favourite actually come up?
          </>
        ),
        writeDown:
          "Write down: your sentence, the favourite and its percentage, and what five rolls actually gave you.",
        hints: [
          "The bars are the model's list: every word it could write next, sorted by how likely the model thinks each one is. You see the top ten; the rest of the vocabulary is below them.",
          "Roll several times and count. A 70% favourite should win about seven rolls in ten; a 20% favourite should lose most rolls. Try the chips — “Tom and Lily went to the” is a sure thing, “The cat sat on the” is not.",
          "The model never picks. It hands over the list, and a dice roll weighted by the list picks. When many endings are plausible the list is flat and the roll matters a lot; when one ending dominates, the roll barely matters.",
        ],
      },
      {
        title: "A hundred rolls",
        prompt: () => (
          <>
            Keep the same sentence. Press Roll 100 times and watch the solid bars (what actually
            happened) settle next to the outlined bars (what the model said would happen). Then
            move the temperature to 0.5 and roll again; then to 1.5.
          </>
        ),
        writeDown:
          "Write down: the favourite's percentage, how many of 100 rolls it won, and what happened to that count at 0.5 and at 1.5.",
        hints: [
          "Two bars per word: the model's probability and the share of rolls that landed there. With 100 rolls they should be close but not equal — that is what random looks like. Press again: with 200 or 300 rolls they get closer.",
          "Temperature does not change the model's hunches, only how boldly it bets on them. At 0.5 the favourite takes far more rolls; at 1.5 the long shots get more, and the favourite can lose.",
          "If the bars match better and better as the rolls pile up, the model is neither choosing on a whim nor choosing the best: it is a weighted dice roll, and the weights are the probabilities. “Show as a table” has the exact counts.",
        ],
      },
      {
        title: "Write a story, one gamble at a time",
        prompt: () => (
          <>
            Type a story opening (or keep <em>Once upon a time</em>). Set the temperature to 0.5
            and press Write. Press Reset, set it to 1.5, press Write again. Hover or tap any word:
            each one was one roll.
          </>
        ),
        writeDown:
          "Write down: one word the model was confident about, one long shot it took, and which temperature gave the stranger story.",
        hints: [
          "Each highlighted word shows how sure the model was when it rolled it: confident bet, split decision, long shot. Hover to see the list it rolled against.",
          "At 0.5 the story repeats what the training stories always say — a little girl, a park, a happy ending. At 1.5 it takes more long shots: sometimes interesting, sometimes nonsense.",
          "There is no plan. The model rolled one word, added it to the sentence, and rolled again on the longer sentence. Everything a chatbot has ever written was written this way — with a much bigger list and a much bigger model, but the same loop.",
        ],
      },
    ],
    step1Widget: {
      ...gambleCommon,
      num: "Step 1",
      title: "The Gamble — the list behind the word",
      note: () => (
        <>
          Drag the temperature slider — the bars reshape instantly, because temperature isn't the
          model thinking harder. It only changes how boldly the roll follows the list.
        </>
      ),
    },
    step2Widget: {
      num: "Step 2",
      title: "Hundred Rolls — the same position, a hundred times",
      loading: loadingNano,
      placeholder: "Type a sentence that stops mid-way…",
      think: "Think",
      roll: (n) => `🎲 Roll ${n} times`,
      rollMore: (n) => `🎲 Roll ${n} more`,
      rolling: "rolling…",
      reset: "Reset rolls",
      tempCareful: "🧊 careful",
      tempChaotic: "🔥 chaotic",
      modelBar: "model says",
      rollsBar: "rolls landed",
      noRolls: "No rolls yet. The outlined bars are the model's probabilities; press the button to roll this position 100 times.",
      summary: (s) =>
        `${s.n} rolls: ${word(s.winner)} won with ${s.winnerCount} (the model gave it ${pct(s.winnerP)}). The favourite ${word(s.favourite)} got ${s.favouriteCount} of ${s.n} against ${pct(s.favouriteP)} predicted. ${s.distinct} of the ten words came up at least once.`,
      tableToggle: "Show as a table",
      tableHeaders: { word: "Word", model: "Model", expected: "Expected", count: "Rolls", share: "Share" },
      note: () => (
        <>
          Same list as the Gamble above — the model's top ten at this temperature — sampled a
          hundred times with the page's random numbers. Nothing is sent anywhere; press again to
          add a hundred more and watch the bars converge.
        </>
      ),
    },
    step3Widget: {
      num: "Step 3",
      title: "The Loop — write a story, one gamble at a time",
      loading: loadingNano,
      stop: "⏸ Stop",
      cont: "▶ Continue",
      write: "▶ Write",
      step: "Step",
      reset: "Reset",
      legendHigh: "confident bet",
      legendMid: "split decision",
      legendLow: "long shot",
      legendHint: " — hover or tap any word to see the dice roll it won.",
      note: () => (
        <>
          The same model as Steps 1–2, doing the only thing it knows: forward pass, probability
          list, dice roll, repeat. Each word is chosen before the next one is even imaginable.
        </>
      ),
    },
  },

  evaluate: {
    prose: () => (
      <>
        You have watched the machine gamble. Now judge it. On paper (or in your teacher's form —
        never in this page), answer:
      </>
    ),
    questions: [
      "Pick one roll where the model wrote something wrong or strange. Was it a bad list or a bad roll? How could you tell the difference?",
      "A friend says: “The AI decided to say that.” Using the bars and the hundred rolls, correct them in two sentences.",
      "Would you trust this model to finish a sentence the same way twice? When would that matter — a story, a set of instructions? What temperature would you set, and why?",
    ],
    paperNote: "Paper or your teacher's form. This page stores nothing.",
  },

  exit: {
    prose: () => (
      <>Three questions, five minutes, on paper. Your teacher has sample answers at three levels.</>
    ),
    questions: [
      "When the model writes the next word, what does it actually do — choose the best word, or something else? Describe the steps.",
      "The model gave its favourite word about a one-in-five chance. In a hundred rolls, why didn't that word win every time — and why didn't it lose every time?",
      "What does the temperature slider change, and what does it not change?",
    ],
  },

  extension: {
    prose: (fav, favP, fourP) => (
      <>
        A second sentence type: a fact. This model has only ever read children's stories, so ask it
        something with a right answer. For <em>Two plus two is</em> its favourite is {word(fav)} at{" "}
        {pct(favP)}; {word(" four")} sits at {pct(fourP)}. Roll ten times and count how often the
        arithmetic comes out right. Then try the other chips. The dice are rolling exactly as
        before — on a list that does not know the answer.
      </>
    ),
    widget: {
      ...gambleCommon,
      num: "Extension",
      title: "The Gamble — sentences with a right answer",
      note: () => (
        <>
          Same model, same dice. The list is what it is because the model has only ever read
          children's stories — there is no fact-checker between the list and the roll.
        </>
      ),
    },
    debate: () => (
      <>
        <strong>Debate (structured, 15 min).</strong> Every word you saw today was a weighted dice
        roll — and so is every word a chatbot writes, with a far bigger list. Resolve:{" "}
        <em>“A machine that rolls dice for every word cannot mean what it says.”</em> Two teams,
        two minutes each, then one minute of rebuttal; the class votes, then votes again after
        hearing the other side.
      </>
    ),
  },

  goDeeper: () => (
    <>
      Go deeper: the flagship essay's Act 4 is the same Gamble with the full story, and Act 5 the
      same Loop — <a href="#act-4">Inside the Machine, Act 4</a>. Teachers: the{" "}
      <a href="#/classroom/m2/guide">teacher guide</a> has the minute-by-minute plan, the dice
      tables with their answer key, the rubric and the standards; the{" "}
      <a href="#/classroom/m2/slides">slides</a> are projector-ready.
    </>
  ),

  guide: {
    docTitle: "Module 2 · The Next-Word Gamble — Teacher guide",
    title: "The Next-Word Gamble — Teacher guide",
    subtitle:
      "Everything you need to run Module 2: plan, prompts and hints, the dice tables with their answer key, rubric with sample responses from measured runs, standards, and the slides.",
    sections: {
      glance: "At a glance",
      objectives: "Learning objectives",
      standards: "Standards addressed",
      background: "Teacher background",
      plan: "Minute-by-minute plan",
      unplugged: "Unplugged activity — dice and tables",
      prompts: "Guided exploration — prompts, deep links, hints",
      discussion: "Discussion prompts",
      misconceptions: "Common misconceptions and what the widget shows",
      assessment: "Evaluation act and exit ticket",
      extension: "Block extension",
      differentiation: "Differentiation",
      accessibility: "Accessibility notes",
      embed: "Slides and LMS embed",
    },
    glance: [
      { label: "Grade band", value: "9–14 (high school and intro college)" },
      { label: "Time", value: "45 minutes; 90-minute block extension included" },
      {
        label: "Prerequisites",
        value: "None. Module 1 helps (students have seen pieces and numbers) but is not required; the lesson stands alone.",
      },
      {
        label: "Devices",
        value:
          "One per student or per pair — any browser on a Chromebook, iPad or laptop; projector for the hook and the slides. The page fetches the tokenizer (~2 MB) and the model weights (7.5 MB) once from this site and caches them; 30 students loading at once is about 290 MB of school bandwidth, one time.",
      },
      {
        label: "Printables",
        value:
          "Unplugged sheet (one per pair) and two six-sided dice per pair (or one die rolled twice); the exit ticket is three questions, copied onto paper.",
      },
    ],
    objectives: [
      "I can explain that a language model produces a probability for every possible next word and then samples — rolls — rather than choosing the best one.",
      "I can predict how often a word with a given probability should come up in a hundred rolls, check the prediction, and explain the gap.",
      "I can say what temperature changes (how boldly the roll follows the list) and what it does not change (the list itself), and judge when a more or less random model is the right tool.",
    ],
    standards: {
      verified: "Mapping verified against the documents cited in the product design on 2026-08-22.",
      rows: [
        {
          framework: "CSTA 2026 PK-12 CS Standards",
          id: "HS-ALG-PS-04",
          note: "Deterministic vs. probabilistic processes — the module's core question.",
        },
        { framework: "AP CSP CED", id: "AAP-3 3.15 Random Values", note: "A weighted random choice as a program step; the dice tables are the unplugged form." },
        { framework: "AP CSP CED", id: "AAP-3 3.16 Simulations", note: "Hundred Rolls is a simulation whose outcome distribution is compared with the model's." },
        { framework: "ISTE Standards for Students", id: "1.5 Computational Thinker", note: "Collecting data from a simulation and reasoning about variation." },
        { framework: "CSTA 2026 PK-12 CS Standards", id: "HS-SOC-HU-44", note: "Human-vs-AI framing; the block-extension debate." },
        { framework: "DOL TEN 07-25", id: "Understanding AI Principles", note: "Content area tag for CTE / community college." },
      ],
      churn: () => (
        <>
          Standards are renumbered every few years and the CSTA 2026 IDs are weeks old. Each row
          is re-verified every summer; if the ID on your state's document differs, the content
          mapping still holds.
        </>
      ),
    },
    background: {
      paras: [
        (f) => (
          <>
            A language model's output for one position is not a word. It is a list: a probability
            for every entry in its vocabulary, tens of thousands of them, adding up to one. The
            word that appears on the screen is produced by a separate, dumb step called sampling —
            a random draw weighted by that list. For <em>The cat sat on the</em> the classroom model
            puts {pct(f.p10)} on {word(f.favourite)}, and the rest of the mass on couches, trees,
            floors and benches. Roll once and you get one of them; roll a hundred times and the
            favourite turns up about {Math.round(f.p10 * 100)} times. In our seeded run it turned
            up {f.run10} times; across ten such runs it ranged from {f.tenMin} to {f.tenMax}; in a
            thousand rolls it came up {f.thousand} times, within a point of the prediction.
          </>
        ),
        (f) => (
          <>
            Some positions are sure things. After <em>Tom and Lily went to the</em> the model gives{" "}
            {word(" park")} {pct(f.parkP)} (it won {f.parkRun} of our hundred rolls); after{" "}
            <em>One day, a boy named</em>, {word(" Tim")} gets {pct(f.timP)}. The dice are rolled
            there too — the table is just lopsided. This is the distinction students should leave
            with: the model is always probabilistic; how much the roll matters depends on how flat
            the list is at that position.
          </>
        ),
        (f) => (
          <>
            Temperature is a knob on the sampling step, not on the model. Dividing the model's raw
            scores by a number before turning them into probabilities makes the list sharper (below
            1) or flatter (above 1). At 0.5 the cat's favourite rises to {pct(f.p05)}; at 1.5 it
            falls to {pct(f.p15)}, and in our seeded hundred rolls at 1.5 it lost — {word(f.winner15)}{" "}
            won with {f.winner15Count}. The model computed the same scores every time. Chat
            products run somewhere around 0.7–1.0, which is why the same question gets different
            answers on different days.
          </>
        ),
        (f) => (
          <>
            Writing is this gamble repeated: roll a word, append it, run the model on the longer
            text, roll again. After <em>The cat sat on the grass</em> the model is nearly certain
            of {word(" and")} ({pct(f.andP)}); after <em>…the grass and</em> it is wide open again
            ({word(" watched")} leads at {pct(f.watchedP)}). There is no plan and no draft; each
            word is chosen before the next is conceivable. Everything a chatbot has written was
            written by this loop. Module 4 asks what that means for truth; this lesson only asks
            students to see the dice.
          </>
        ),
      ],
      deeper: () => (
        <>
          For depth: <a href="#act-4">Act 4 of the flagship essay</a> is the same Gamble with the
          narrative and <a href="#act-5">Act 5</a> the same Loop. The classroom model is
          TinyStories-1M (nano-lm); the list is its top ten at the chosen temperature, the standard
          “top-k” trick — the thousands of words below the tenth are dropped before the roll, on
          screen and on paper alike.
        </>
      ),
    },
    plan: {
      columns: ["Time", "Beat", "What happens"],
      rows: [
        {
          time: "0–3",
          beat: "Hook",
          what: "Projector (or slides 2–4). Keep the cat or take a sentence from the room; Think; Roll the dice three times. Ask “why did it change?” Accept answers; explain nothing yet.",
        },
        {
          time: "3–13",
          beat: "Unplugged",
          what: "One sheet and two dice per pair. Round 1 (4 min) roll three words against the three tables; Round 2 (3 min) compare endings with the neighbouring pair; Round 3 (3 min) argue: did the machine choose anything? Which table made the roll matter least? One minute: “each table is the model's real list — hold that thought.”",
        },
        {
          time: "13–33",
          beat: "Guided exploration",
          what: "Devices open at step 1. Step 1 (6 min), Step 2 (8 min — the hundred rolls at three temperatures), Step 3 (6 min). Students keep the three write-downs on the same paper as the exit ticket. Hints are progressive — ask for hint 1 before a hand goes up.",
        },
        {
          time: "33–40",
          beat: "Evaluation act",
          what: "Three judgment questions, on paper. Circulate; the misconception to listen for is “it picked the best word” (and its cousin, “it looked up the answer”).",
        },
        { time: "40–45", beat: "Exit ticket", what: "Three questions, on paper. Rubric and sample responses below." },
        {
          time: "+45",
          beat: "Block extension",
          what: "Sentences with a right answer on the Extension Gamble (15 min); the structured debate (15 min); a second evaluation task (15 min): “set a temperature for a homework-help bot and for a bedtime-story bot; defend both numbers with today's bars.”",
        },
      ],
    },
    unplugged: {
      prose: () => (
        <>
          One sheet and two dice per pair. Three tables, one per position along the model's
          favourite path: the first after <em>The cat sat on the</em>, the second assuming{" "}
          <em>grass</em> was rolled, the third assuming <em>and</em> was rolled next. Each table
          shares the 36 dice outcomes among the model's top ten words in proportion to their real
          probabilities, so a pair that rolls three times has generated three words the way the
          model does — and sees at once that table 2 is nearly all one word while tables 1 and 3
          are wide open. The <a href="#/classroom/m2/unplugged">printable</a> carries the student
          instructions; the script below is yours.
        </>
      ),
      script: [
        "Round 1 — roll (4 min). “First die is the row, second die is the column. Find the word in Table 1 and write it after the sentence. Now Table 2 for the next word, Table 3 for the third. If your Table 1 roll wasn't ‘grass’, keep your word anyway and carry on — the machine would have printed you a fresh table; you'll see that on the devices.”",
        "Round 2 — compare (3 min). “Read your three-word ending to the pair next to you. Did anyone in the room get the same ending? How many different second words were there in the room?”",
        "Round 3 — argue (3 min). “Did the machine choose anything? Circle the table where your roll barely mattered. Why is that table different?”",
        "Bridge (1 min). “Each table is the model's real list for that position. On the devices you'll see the list as bars, and roll a hundred times in one click. Keep your sheet.”",
      ],
      answerKeyHeading: "Answer key — the tables and where they came from",
      answerKeyNote: (verifiedOn) => (
        <>
          Measured on {verifiedOn} by running TinyStories-1M on each prompt at temperature 1.0; the
          ten words are the model's top ten and their probabilities add up to 100% because that
          is the list the roll uses (top-k). Cells are the 36 dice outcomes allocated by largest
          remainder; a word below half a cell gets none and is marked.
        </>
      ),
      keyColumns: ["Word", "Probability", "Cells of 36"],
      tableCaption: (n, prompt) => `Table ${n} — after “${prompt}”`,
      spineNote: (picked) => `The next table assumes ${word(picked)} was rolled here (the favourite).`,
      zeroCells: "under half a cell — no square",
    },
    prompts: {
      intro: () => (
        <>
          These are exactly the prompts and hints on the lesson page — rendered from the same
          text, so what you read here is what students see. Each deep link lands on that step;
          paste it into Classroom or Canvas.
        </>
      ),
      deepLinkLabel: "Deep link",
      hintsLabel: "Hints, in the order students can reveal them",
      writeDownLabel: "Write-down",
    },
    discussion: {
      items: [
        "If you rolled the hook sentence a million times, what would the bars look like next to the model's? What would still be missing?",
        "The model gives “four” a few percent after “Two plus two is.” Is a model that is sometimes right by luck better or worse than one that is always wrong? For whom?",
        "When would you want temperature near zero (the favourite, every time) and when would that be a bad idea? Think of a use where sameness matters and one where surprise matters.",
        "A weather forecast says 20% rain and it rains. Was the forecast wrong? How is that like the cat's favourite losing four rolls in five?",
        "You also don't know your next word until you say it — or do you? Is a person finishing a sentence more like the dice, or less? Defend a side.",
      ],
      debateTag: "human vs. AI debate",
    },
    misconceptions: {
      columns: ["Students often believe…", "What the widget shows"],
      rows: [
        {
          belief: "“It picks the best word.”",
          shows: "Step 1: roll five times on a flat sentence and the favourite loses most of them. Step 2: in a hundred rolls the favourite wins about its percentage, never all.",
        },
        {
          belief: "“It looks up the answer.”",
          shows: "Hundred Rolls: the same position gives a spread of words in exact proportion to the bars. A lookup would give one word every time; a dice roll gives the histogram.",
        },
        {
          belief: "“Temperature makes it think harder (or smarter).”",
          shows: "Step 2 at 0.5 and 1.5: the bars reshape instantly with no new computation; the favourite's share rises or falls, the order of the list does not change.",
        },
        {
          belief: "“It planned the sentence.”",
          shows: "Step 3: hover any word — it was rolled against a list computed from only the words before it. Reset and write again: a different story from the same opening.",
        },
        {
          belief: "“Random means anything can come out.”",
          shows: "Table 2 of the dice sheet and the “Tom and Lily” chip: when one word carries most of the mass, the roll almost always lands on it. Random is weighted.",
        },
      ],
    },
    assessment: {
      evalHeading: "Evaluation act (33–40 min)",
      evalIntro: () => (
        <>
          The evaluation act is where students judge the machine (the three questions on the
          lesson page); the exit ticket is what you collect. Both on paper — this site has no
          forms. Score the exit ticket with the three-level rubric; the sample responses show the
          level, not the wording, and the numbers in them are from the measured runs below.
        </>
      ),
      rubricHeading: "Rubric",
      levels: [
        "Level 1 — Noticing: reports that the output changed between rolls, or that the slider moved the bars, without a mechanism.",
        "Level 2 — Explaining: states that the model outputs probabilities and a weighted random draw picks the word; links one observation to it (the favourite's count, the temperature's effect).",
        "Level 3 — Judging: explains the mechanism, distinguishes the list from the roll, and uses it to predict or evaluate a case not shown in class (a new sentence, a product's temperature setting).",
      ],
      exitHeading: "Exit ticket (40–45 min) with sample responses",
      measured: (f) => (
        <>
          What the runs measured (seeded, reproducible from data.ts): for <em>The cat sat on the</em>{" "}
          at temperature 1.0 the favourite {word(f.favourite)} has {pct(f.p10)} and won {f.run10} of
          100 rolls; ten independent hundred-roll runs gave it between {f.tenMin} and {f.tenMax}; a
          thousand rolls gave {f.thousand}. At 0.5 it has {pct(f.p05)} and won {f.run05}; at 1.5
          it has {pct(f.p15)} and won {f.run15} — {word(f.winner15)} won that run with{" "}
          {f.winner15Count}.
        </>
      ),
      items: [
        {
          q: "When the model writes the next word, what does it actually do — choose the best word, or something else? Describe the steps.",
          samples: [
            () => "It rolls dice. The word can be different each time.",
            () =>
              "It makes a list of possible next words with a percentage for each, then picks one at random using the percentages — the favourite most often, but not always. Then it adds the word and does it again.",
            (f) =>
              `Two steps: the model computes a probability for every word in its vocabulary (for “The cat sat on the”, ${pct(f.p10)} on ${word(f.favourite)}), and a separate sampling step draws one word with those probabilities. So it is not choosing the best; the best is just the most frequent outcome. Repeating the draw on the longer sentence is how it writes — which is why the same opening gives different stories.`,
          ],
        },
        {
          q: "The model gave its favourite word about a one-in-five chance. In a hundred rolls, why didn't that word win every time — and why didn't it lose every time?",
          samples: [
            () => "Because it's random.",
            (f) =>
              `A ${pct(f.p10)} chance means about ${Math.round(f.p10 * 100)} wins in 100, not 100 and not 0. Our run gave ${f.run10}. The other words had their own chances and won the rest.`,
            (f) =>
              `The roll is weighted: ${word(f.favourite)} owns about a fifth of the dice outcomes, so it wins about a fifth of the rolls — ${f.run10} in our run, between ${f.tenMin} and ${f.tenMax} across ten runs, and closer to the prediction the more we rolled (${f.thousand} in 1,000). Winning every time would need a probability near 100%, like “park” after “Tom and Lily went to the”; losing every time would need near 0%. The spread around 20 is exactly what random with that weight looks like.`,
          ],
        },
        {
          q: "What does the temperature slider change, and what does it not change?",
          samples: [
            () => "It makes the answers more random or less random.",
            (f) =>
              `It changes how boldly the roll follows the list: at 0.5 the favourite got ${pct(f.p05)} and at 1.5 only ${pct(f.p15)}. It does not change which word is the favourite — the order stays the same.`,
            (f) =>
              `Temperature rescales the model's scores before they become probabilities, so it changes the shape of the list (sharper below 1, flatter above) and therefore how often the long shots get rolled — at 1.5 the favourite even lost our run to ${word(f.winner15)}. It does not change the scores themselves, the order of the list, or the model; the bars reshape with no new computation. Which is why a chat product can feel “creative” or “careful” without thinking any differently.`,
          ],
        },
      ],
    },
    extension: {
      prose: (fav, favP, fourP) => (
        <>
          Doubles the middle beat and adds a second evaluation task. New material: the Extension
          Gamble's chips — sentences with a right answer, put to a model that has only read
          stories. Measured: after <em>Two plus two is</em> the favourite is {word(fav)} at{" "}
          {pct(favP)} and {word(" four")} has {pct(fourP)}; after <em>The capital of France is</em>{" "}
          the list is <em>very</em>, <em>a</em>, <em>not</em>… The point is not that the model is
          small — it is that the dice roll on a list that does not know, exactly as they roll on a
          list that does. The debate follows CSTA HS-SOC-HU-44's human-vs-AI framing; run it as two
          teams, two minutes each, one rebuttal, two votes.
        </>
      ),
      debateIntro: "Debate prompt (as shown on the lesson page):",
    },
    differentiation: {
      ell: {
        heading: "ELL / 中文-speaking students — bilingual glossary",
        intro: "The whole lesson exists in 中文 (the language toggle at the top of every page). The six words that carry the lesson:",
        columns: ["Term", "中文", "Plain meaning"],
        glossary: [
          { term: "probability", zh: "概率", plain: "how likely the model thinks a word is; all of them add up to 100%" },
          { term: "the list / distribution", zh: "候选名单 / 概率分布", plain: "every possible next word with its probability — what the model actually outputs" },
          { term: "sample / roll the dice", zh: "采样 / 掷骰子", plain: "pick one word at random, weighted by the list" },
          { term: "favourite (top-1)", zh: "头号热门", plain: "the word with the highest probability; it wins most often, not always" },
          { term: "temperature", zh: "温度", plain: "a knob that makes the list sharper (below 1) or flatter (above 1) without changing the model" },
          { term: "deterministic / random", zh: "确定的 / 随机的", plain: "same input, same output every time / same input, a spread of outputs" },
        ],
      },
      nonStem: {
        heading: "Non-STEM classes — jargon-free variant of each prompt",
        prompts: [
          "Step 1: Type half a sentence and press Think. Which word is at the top? Press Roll five times — how many times did the top word actually show up?",
          "Step 2: Roll a hundred times. Do the solid bars end up close to the outlined ones? Slide to 0.5 and roll again, then 1.5 — what changed?",
          "Step 3: Press Write at 0.5, then again at 1.5. Which story is stranger? Hover a word: was it a safe bet or a long shot?",
        ],
      },
      advanced: {
        heading: "Advanced",
        prose: () => (
          <>
            The sampling code is twenty lines: softmax over the top-k logits divided by the
            temperature, then an inverse-CDF draw (nano-lm's <code>softmaxTopK</code> and{" "}
            <code>sampleFrom</code>; Hundred Rolls adds a seeded generator so a run can be
            replayed). Ask: what does “top-k = 10” throw away, and when does it matter? Challenge:
            compute the total-variation distance between the rolls and the bars (the table has
            everything), and predict how it should shrink with the number of rolls.
          </>
        ),
      },
    },
    accessibility: [
      "Keyboard: Tab reaches the preset chips, the text field, Think, the temperature slider (arrow keys change it in 0.05 steps; the value is read out as “T = 1.00”), Roll, Reset rolls and the “Show as a table” disclosure in reading order; every control is a native button, input or details element.",
      "Screen reader: the Gamble's bars read as word + percentage; Hundred Rolls announces a summary after each press (polite live region: who won, the favourite's count against its prediction, how many words came up) and offers the full counts as a real table; the Loop's words read as text.",
      "Text alternative: the hundred-roll histogram is aria-hidden and fully duplicated by the summary line and the table; no information is carried by colour alone (the model bar is outlined, the rolls bar is solid, and both are labelled with numbers).",
      "Reduced motion: with prefers-reduced-motion (or in a background tab) the hundred rolls land at once instead of over 0.7 s. Known gaps (phase 2): no text-to-speech of prompts yet; the Loop's hover popover has no keyboard equivalent (the step log is the text alternative). The conformance statement is the Accessibility statement page (#/classroom/about/accessibility), unaudited until phase 4.",
    ],
    embed: {
      slides: () => (
        <>
          Slides companion: <a href="#/classroom/m2/slides">#/classroom/m2/slides</a> — ten slides
          on one print-oriented page (hook, the list, the roll, the unplugged instructions, a
          hundred rolls, temperature, the loop, judge it, exit ticket), rendered from this
          module's own text and measured data. Print to PDF for Google Classroom, or project the
          page and scroll.
        </>
      ),
      canvasIntro:
        "Canvas / Schoology embed — an iframe with a fixed height and a fallback link (iframes do not render in Canvas edit mode; students see them in the published page):",
      canvasNote:
        "Replace the placeholder origin with the canonical classroom domain once it is live (phase 4). The per-step deep links in §7 work the same way.",
    },
  },

  sheet: {
    docTitle: "Module 2 · The Next-Word Gamble — Unplugged printable",
    title: "The Next-Word Gamble — Unplugged",
    subtitle: "Finish a sentence the way the machine does: with two dice and its real tables.",
    nameLine: "Names:",
    materials: {
      heading: "You need",
      items: ["This sheet (one per pair)", "Two six-sided dice (or one die, rolled twice)", "A pen"],
    },
    rounds: {
      heading: "How it goes",
      items: [
        "Round 1 — Roll (4 min). Roll both dice. The first die is the row, the second is the column. Find the word in Table 1 and write it after the sentence. Then roll on Table 2 for the next word, and on Table 3 for the third.",
        "Round 2 — Compare (3 min). Read your three-word ending to the pair next to you. Did anyone in the room get the same ending? How many different words came up for the second roll?",
        "Round 3 — Argue (3 min). Did the machine choose anything? Circle the table where your roll barely mattered, and say why that table is different.",
      ],
    },
    tables: {
      heading: "The tables — each square is one of the 36 dice outcomes; bigger share, likelier word",
      caption: (n, prompt) => `Table ${n} — after: ${prompt}`,
      firstDie: "first die ↓",
      secondDie: "second die →",
      branchNote:
        "Table 2 assumes you rolled the bold word in Table 1, and Table 3 assumes the bold word in Table 2. If your roll gave something else, keep your word and carry on anyway — on a real device the machine builds a fresh table for your sentence. That is Step 1 of the lesson.",
      assumed: "next table assumes this word",
    },
    sentenceLine: "Your sentence: The cat sat on the …",
    questions: {
      heading: "After the rolls",
      items: [
        "Which table had the most different words in the room? Which had almost only one?",
        "If you rolled all three again, would you get the same ending? How sure are you — and which table would stay the same?",
        "Finish the sentence: “The machine doesn't choose the next word — it ______.”",
      ],
    },
    teacherNote: () => (
      <>
        Teacher: the probabilities behind each table, and what a hundred rolls measured, are in the
        teacher guide, section 6 (<code>#/classroom/m2/guide</code>).
      </>
    ),
  },

  slides: {
    docTitle: "Module 2 · The Next-Word Gamble — Slides",
    title: "The Next-Word Gamble — Slides",
    subtitle: "Ten slides, one page: project it and scroll, or print to PDF for Classroom. Speaker notes print under each slide.",
    counter: (n, total) => `Slide ${n} of ${total}`,
    notesLabel: "Notes",
    tempLabel: (t) => `T = ${t.toFixed(1)}`,
    barsCaption: (prompt) => `The model's list after “${prompt}” (top ten, temperature 1.0, measured)`,
    slides: [
      {
        title: "The Next-Word Gamble",
        lines: ["Is the model choosing, or rolling dice?", "Module 2 · Inside the Machine: Classroom Edition"],
        note: () => "Hook, 0–3 min. Everything on these slides comes from the same model students will run on their own devices: TinyStories-1M, 7.5 MB, in the browser.",
      },
      {
        title: "What comes next?",
        lines: ["The cat sat on the ___", "Shout a word. Now another. Now a third.", "Which one is right?"],
        note: () => "Take three or four answers from the room. Don't judge them. The point of the next slide is that the machine has a list too — with numbers.",
      },
      {
        title: "The model's list",
        lines: ["For every position, a probability for every word", "The ten likeliest, measured:"],
        visual: "hook-bars",
        note: (f) => `Read the top three aloud with their percentages — ${word(f.favourite)} at ${pct(f.p10)} first. Ask: if the machine always picked the top word, what would every cat sit on? Then reveal the next slide.`,
      },
      {
        title: "It doesn't pick. It rolls.",
        lines: ["One roll, weighted by the list", "Favourite at about one in five → four rolls in five, something else", "Same sentence, same model, different roll, different word"],
        note: () => "If you have the lesson page open, press Roll the dice three times now. Otherwise just say: three rolls, three endings. Say nothing more — the unplugged activity does the explaining.",
      },
      {
        title: "Unplugged: two dice, three tables",
        lines: ["First die = row, second die = column", "Table 1 → write the word → Table 2 → Table 3", "Then compare endings with the pair next to you"],
        visual: "dice",
        note: (f) => `3–13 min. Hand out the sheet and the dice. Round 1 roll (4 min), Round 2 compare (3), Round 3 argue (3): did the machine choose anything? Which table made the roll matter least? (Table 2: ${word(" and")} owns ${pct(f.andP)} of it.)`,
      },
      {
        title: "A hundred rolls",
        lines: ["Roll the same position 100 times", "Solid bar: what happened · outlined bar: what the model said", "They get closer the more you roll — that is what a weighted roll looks like"],
        note: (f) => `13–33 min, Step 2. The favourite won ${f.run10} of our 100 rolls against ${pct(f.p10)} predicted; ten runs ranged from ${f.tenMin} to ${f.tenMax}; a thousand rolls gave ${f.thousand}. Students should see their own numbers land in that spread.`,
      },
      {
        title: "Temperature",
        lines: ["A knob on the roll, not on the model", "Below 1: the favourite takes more · above 1: long shots get more", "The list's order never changes"],
        visual: "temp-bars",
        note: (f) => `The same scores, rescaled: ${word(f.favourite)} goes from ${pct(f.p05)} at 0.5 to ${pct(f.p15)} at 1.5. At 1.5 the favourite can lose — in our seeded run ${word(f.winner15)} won with ${f.winner15Count}. The model computed nothing new when the slider moved.`,
      },
      {
        title: "Writing is the gamble on repeat",
        lines: ["Roll a word → add it → run the model again → roll", "No plan, no draft — each word before the next is imaginable", "Everything a chatbot writes is written this way"],
        note: (f) => `Step 3, the Loop. Run it at 0.5, then at 1.5. Hover a word to show the list it was rolled against — the very first roll after “Once upon a time” is ${word(",")} at ${pct(f.commaP)} against ${word(" there")} at ${pct(f.thereP)}.`,
      },
      {
        title: "Judge it",
        lines: ["A wrong word: bad list, or bad roll?", "“The AI decided to say that” — correct it", "Same sentence twice? When does that matter?"],
        note: () => "33–40 min, on paper. Circulate for “it picked the best word” and “it looked up the answer”.",
      },
      {
        title: "Exit ticket",
        lines: ["What does the model actually do when it writes the next word?", "Why didn't the favourite win every time — or lose every time?", "What does temperature change, and what does it not?"],
        visual: "steps",
        note: () => "40–45 min, on paper. Sample responses at three levels are in the teacher guide, section 10. The deep links take students straight to each step.",
      },
    ],
  },
};
