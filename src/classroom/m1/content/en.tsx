import type { M1Strings } from "./types";

/**
 * English prose for Module 1, "The Word Chopper". Register: a lesson, not
 * an essay — student-facing sentences are short and concrete, teacher
 * lines are marked as such, and every factual claim about a cut was
 * measured (src/classroom/m1/data.ts). Prompts are sized for a 45-minute
 * period: each step is one task, one write-down, three hints.
 */

const loading = "Loading the tokenizer (~2MB, once)…";
const tokenCount = (n: number) => `${n} piece${n === 1 ? "" : "s"}.`;
const choppedNote = (rCount: number) => (
  <>
    {" "}
    <em>strawberry</em> got chopped: the word never reaches the model, only the pieces. Your text has{" "}
    {rCount} “r”{rCount === 1 ? "" : "s"}, and not one of them arrives as a piece.
  </>
);
const wholeTokenNote = () => (
  <>
    {" "}
    With its leading space, <em>“ strawberry”</em> is common enough to be one piece. Delete whatever is in
    front of it and watch it shatter.
  </>
);

export const en: M1Strings = {
  docTitle: "Module 1 · The Word Chopper — Classroom Edition",
  metaDescription:
    "A 45-minute lesson: what a language model actually sees when a student types a sentence. Real tokenizer in the browser, unplugged opener, three guided prompts with hints, evaluation act, exit ticket. No accounts, no data collected.",
  title: "The Word Chopper",
  question: "What does the model actually see when I type a sentence?",
  modelNote: () => (
    <>
      <strong>This module runs only the tokenizer</strong> — the program that turns text into the
      numbered pieces the model reads. No model weights are needed today; Modules 2–6 wake the
      model itself.
    </>
  ),

  hook: {
    teacherLine: () => (
      <>
        <strong>Teacher, on the projector:</strong> ask for one sentence from the room — a name, a
        team, a food — and type it in. Say nothing about why it cut where it did. Let them look.
      </>
    ),
    prose: () => (
      <>
        Every word you type to a language model gets chopped into pieces before the model sees
        anything — and the pieces are not letters, not syllables, and not always words. Each piece
        has a number. The model receives the numbers.
      </>
    ),
    widget: {
      num: "Hook",
      title: "The Chopper — one sentence from the room",
      placeholder: "Type the sentence a student suggested…",
      loading,
      tokenCount,
      choppedNote,
      wholeTokenNote,
    },
  },

  unplugged: {
    prose: () => (
      <>
        Before anyone touches a keyboard: a sentence strip, a pair of scissors, and an argument.
        Cut the sentence into the pieces you think a machine should memorize, then defend your cuts
        to the pair next to you. The real chopper's cuts are revealed at the end.
      </>
    ),
    link: "Open the printable",
  },

  explore: {
    intro: () => (
      <>
        Three prompts, each with its own Chopper or X-ray. Use your own sentences — the stranger the
        word, the better. Stuck? Each prompt has three hints; open them one at a time.
      </>
    ),
    steps: [
      {
        title: "Your sentence, in pieces",
        prompt: () => (
          <>
            Type a sentence of your own, 8–12 words, with at least one word you think is unusual —
            a name, a place, a slang word, a long word. Count the words. Count the pieces. Find one
            word that was cut into more than one piece.
          </>
        ),
        writeDown: "Write down: the word, how it was cut, and the number under each piece.",
        hints: [
          "Each piece shows a number under it. That number is all the model receives — not the letters.",
          "Common words usually arrive whole. Rare words get built from fragments. Try a name, a brand, or a word you made up.",
          "The cuts are not syllables. They are the most frequent chunks in a huge pile of text — which is why “restarted” becomes restart · ed but “Wednesdays” becomes Wed · nes · days.",
        ],
      },
      {
        title: "Same word, different cut",
        prompt: () => (
          <>
            Click the chips. <code>strawberry</code> with and without a space in front.{" "}
            <code>Wednesday</code> with a capital and without. <code>2024</code>, then{" "}
            <code>20245</code>. Before each click, predict the number of pieces; then check.
          </>
        ),
        writeDown:
          "Write down: one pair where the same word got a different number of pieces, and your best guess why.",
        hints: [
          "Look for ␣ at the front of a piece: the space is glued onto the word and becomes part of it. “ strawberry” (with a space) is one piece; “strawberry” (without) is three.",
          "Capital letters make a different word as far as the tokenizer is concerned. “Wednesday” is one piece; “wednesday” is two.",
          "Numbers are chopped like words: 2024 is 20 · 24. The tokenizer has no idea 2024 is a quantity — it only knows which strings of digits showed up often.",
        ],
      },
      {
        title: "You see letters; it sees pieces",
        prompt: () => (
          <>
            Pick one word from your sentence and one letter in it. Count the letter yourself. Then
            look at the bottom row: does your letter ever arrive on its own, or is it melted into a
            bigger piece?
          </>
        ),
        writeDown:
          "Write down: the word, the letter, your count, and whether the letter ever appears as its own piece.",
        hints: [
          "Top row is what you see: letters. Bottom row is what the model gets: pieces, each with its number. Highlighted pieces are the ones that contain your letter.",
          "Try strawberry and r. Three r's, three pieces — and the r is inside “raw” and “berry”, never alone.",
          "If the letter is melted into a bigger piece, the model has no letter to count. It has a number. Whether it can count from a number alone is Module 5's question.",
        ],
      },
    ],
    step1Widget: {
      num: "Step 1",
      title: "The Chopper — your own sentence",
      placeholder: "Type your sentence…",
      loading,
      tokenCount,
      choppedNote,
      wholeTokenNote,
    },
    step2Widget: {
      num: "Step 2",
      title: "The Chopper — same word, different cut",
      placeholder: "Click a chip, or type…",
      loading,
      tokenCount,
      choppedNote,
      wholeTokenNote,
    },
    step3Widget: {
      num: "Step 3",
      title: "The X-ray — letters in, pieces out",
      wordLabel: "word",
      letterLabel: "letter",
      loadingTokenizer: "loading the tokenizer…",
      youSee: "you see",
      modelSees: "it sees",
      letterTally: (letters, count, letter) =>
        `${letters} letter${letters === 1 ? "" : "s"} · ${count} × “${letter}”`,
      pieceTally: (pieces) => `${pieces} piece${pieces === 1 ? "" : "s"}`,
      insight: ({ letters, count, letter, pieces, carriers }) =>
        count === 0 ? (
          <>
            {letters} letters, no “{letter}” at all — and {pieces} piece{pieces === 1 ? "" : "s"} that say
            nothing about letters either way. The model has no “{letter}” to find and no way to confirm it
            is missing.
          </>
        ) : carriers.length === count && pieces === letters ? (
          <>
            {letters} letters, {count} × “{letter}” — and every character is its own piece here. The letter
            arrives as a piece the model can actually see.
          </>
        ) : (
          <>
            {letters} letters, {count} × “{letter}” → {pieces} piece{pieces === 1 ? "" : "s"}. The “{letter}”
            never arrives by itself: it is melted into{" "}
            {carriers.map((id, i) => (
              <span key={id}>
                {i > 0 && (i === carriers.length - 1 ? " and " : ", ")}
                <code>#{id}</code>
              </span>
            ))}
            . To count it, the model would have to know what those numbers are made of.
          </>
        ),
      note: () => (
        <>
          Same tokenizer as the Chopper above (GPT-2's byte-pair vocabulary, the one the series'
          model reads). The highlight marks pieces that contain your letter; the underline marks
          the letter inside the piece. Nothing here runs the model — that is Module 5.
        </>
      ),
    },
  },

  evaluate: {
    prose: () => (
      <>
        The model didn't decide any of these cuts — a separate program did, before training, by
        counting which chunks were common. Now you judge it. On paper (or in your teacher's form —
        never in this page), answer:
      </>
    ),
    questions: [
      "Pick one cut from your sentence that a human would never make. Why might it still be useful to a machine?",
      "A friend says: “The model reads my words.” Using what you saw, correct them in one sentence.",
      "Would you trust this model to count the letters in a word? Say why, using the X-ray.",
    ],
    paperNote: "Paper or your teacher's form. This page stores nothing.",
  },

  exit: {
    prose: () => (
      <>Three questions, five minutes, on paper. Your teacher has sample answers at three levels.</>
    ),
    questions: [
      "What does the model receive when you type a sentence — words, letters, or something else? Be specific.",
      "Why did “ strawberry” (with a space) become one piece and “strawberry” (without) become three?",
      "Name one task where seeing pieces instead of letters would make a model worse, and one where it wouldn't matter.",
    ],
  },

  extension: {
    prose: () => (
      <>
        Type a sentence in a language other than English — 中文, Spanish, Arabic, Korean, emoji.
        Count the pieces per word. Then try the chips: the same idea in several scripts. A 中文
        sentence of seven characters becomes seventeen pieces, and the pieces are not even
        characters — they are bytes, shown in the tokenizer's own byte alphabet.
      </>
    ),
    widget: {
      num: "Extension",
      title: "The Chopper — other languages, other scripts",
      placeholder: "Type a sentence in any language…",
      loading,
      tokenCount,
      choppedNote,
      wholeTokenNote,
    },
    debate: () => (
      <>
        <strong>Debate (structured, 15 min).</strong> This tokenizer was built from a pile of text
        that was mostly English, so it chops English into few pieces and other languages into many.
        Longer inputs cost more and fit less. Resolve: <em>“Who a tokenizer is built for is a
        fairness question, not just an engineering one.”</em> Two teams, two minutes each, then one
        minute of rebuttal; the class votes, then votes again after hearing the other side.
      </>
    ),
  },

  goDeeper: () => (
    <>
      Go deeper: the flagship essay's Act 1 is the same Chopper with the full story —{" "}
      <a href="#act-1">Inside the Machine, Act 1</a>. Teachers: the{" "}
      <a href="#/classroom/m1/guide">teacher guide</a> has the minute-by-minute plan, the hints,
      the rubric and the standards.
    </>
  ),

  guide: {
    docTitle: "Module 1 · The Word Chopper — Teacher guide",
    title: "The Word Chopper — Teacher guide",
    subtitle:
      "Everything you need to run Module 1: plan, prompts and hints, rubric with sample responses, standards, and the unplugged answer key.",
    sections: {
      glance: "At a glance",
      objectives: "Learning objectives",
      standards: "Standards addressed",
      background: "Teacher background",
      plan: "Minute-by-minute plan",
      unplugged: "Unplugged activity",
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
        value: "None. No prior CS or AI knowledge; students need to be able to type a sentence.",
      },
      {
        label: "Devices",
        value:
          "One per student or per pair — any browser on a Chromebook, iPad or laptop; projector for the hook. The tokenizer (~2 MB) loads once and is cached by the browser; no model weights are needed in this module.",
      },
      {
        label: "Printables",
        value:
          "Unplugged sheet (one per pair) and scissors (one pair per pair); the exit ticket is three questions, copied onto paper.",
      },
    ],
    objectives: [
      "I can explain that a language model receives numbered pieces, not words or letters.",
      "I can predict when a word will be cut into more than one piece and check my prediction.",
      "I can judge a tokenizer's cut — say whether it is useful to a machine and what it makes hard for the model.",
    ],
    standards: {
      verified: "Mapping verified against the documents cited in the product design on 2026-08-22.",
      rows: [
        {
          framework: "AI4K12 Five Big Ideas",
          id: "Big Idea 4, 9–12 LO 4-A-i",
          note: "Natural Interaction — language structure; how a model represents text.",
        },
        {
          framework: "CSTA/AI4K12 AI Learning Priorities (2025), 9–12",
          id: "“Describe how current AI models (e.g., LLMs) use data representation”",
          note: "The module's core question, verbatim.",
        },
        { framework: "CSTA 2026 PK-12 CS Standards", id: "HS-SOC-ET-40", note: "Society / ethics; the block-extension debate." },
        { framework: "AP CSP CED", id: "DAT-2", note: "Data representation: text as numbers." },
        { framework: "ISTE Standards for Students", id: "1.5 Computational Thinker", note: "Decomposition and representation." },
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
        () => (
          <>
            A language model never sees your sentence. Before it runs, a separate and much
            simpler program — the tokenizer — snaps the text onto a fixed menu of about fifty
            thousand pieces and hands the model the piece numbers. Nothing else: no letters, no
            spelling, no word boundaries beyond what the pieces happen to encode.
          </>
        ),
        () => (
          <>
            The menu was built once, before training, by a counting procedure called byte-pair
            encoding: start with single bytes, repeatedly merge the pair of adjacent pieces that
            appears most often in a large pile of text, stop at about fifty thousand. Common
            words earn a piece of their own; rare words are assembled from fragments that were
            common in other words. Because the counting was done over text, the cuts follow
            frequency, not grammar: <em>restarted</em> becomes restart·ed, but <em>Wednesdays</em>{" "}
            becomes Wed·nes·days — because those chunks were frequent, not because they mean
            anything.
          </>
        ),
        () => (
          <>
            Three consequences students can see in this lesson. The space before a word is part
            of the piece, so “ strawberry” (one piece) and “strawberry” (three) are different
            inputs. Capitalization changes the piece: Wednesday is whole, wednesday is two. Digits
            are chopped like words — 2024 is 20·24 — so a number's meaning has to be rebuilt by
            the model from pieces that do not carry it. And text in other scripts falls through
            the menu to the byte level: a seven-character 中文 sentence becomes seventeen
            byte-pieces, which is part of why the same model is slower and weaker in languages it
            rarely saw.
          </>
        ),
        () => (
          <>
            Why it matters beyond trivia: this is the grain of the model's perception. Anything
            posed at the letter level — counting letters, spelling, rhyming, reversing — is being
            asked of a system that never received letters. Module 5 follows that thread. For this
            lesson one sentence is enough: the model's world is pieces — not words, and not
            letters.
          </>
        ),
      ],
      deeper: () => (
        <>
          For depth: <a href="#act-1">Act 1 of the flagship essay</a> is the same Chopper with the
          narrative. The tokenizer used here is GPT-2's byte-pair vocabulary (50,257 pieces), which
          the series' TinyStories-1M model reads.
        </>
      ),
    },
    plan: {
      columns: ["Time", "Beat", "What happens"],
      rows: [
        {
          time: "0–3",
          beat: "Hook",
          what: "Projector. Ask for one sentence from the room; type it into the Hook Chopper. Ask “how many pieces did you expect?” Accept answers; explain nothing yet.",
        },
        {
          time: "3–13",
          beat: "Unplugged",
          what: "One strip sheet and scissors per pair. Round 1 (3 min) cut; Round 2 (3 min) compare with the neighbouring pair and argue one cut; Round 3 (3 min) reveal the real cuts from the answer key below, pairs count matches. One minute: “the machine's cuts are not syllables — hold that thought.”",
        },
        {
          time: "13–33",
          beat: "Guided exploration",
          what: "Devices open at step 1. Step 1 (7 min), Step 2 (6 min), Step 3 (7 min). Students keep the three write-downs on the same paper as the exit ticket. Hints are progressive — ask for hint 1 before a hand goes up.",
        },
        {
          time: "33–40",
          beat: "Evaluation act",
          what: "Three judgment questions, on paper. Circulate; the misconception to listen for is “the model reads words”.",
        },
        { time: "40–45", beat: "Exit ticket", what: "Three questions, on paper. Rubric and sample responses below." },
        {
          time: "+45",
          beat: "Block extension",
          what: "Other-script chopping on the Extension Chopper (15 min); the structured debate (15 min); a second evaluation task (15 min): “write the one-sentence privacy line a school would need for this tool, then check this page against it.”",
        },
      ],
    },
    unplugged: {
      prose: () => (
        <>
          One sheet per pair: three English strips, plus an optional 中文 strip for the block
          extension. The strips were chosen so that the real cuts surprise — a weekday in three
          pieces, a grandmother in two, a lasagna nobody would cut that way. The{" "}
          <a href="#/classroom/m1/unplugged">printable</a> carries the student instructions; the
          script below is yours.
        </>
      ),
      script: [
        "Round 1 — cut (3 min). “Cut this sentence into the pieces a machine should memorize. Rule: every piece must be something you'd expect to see again in other sentences. You may cut inside a word.”",
        "Round 2 — argue (3 min). “Compare with the pair next to you. Pick one place where you cut differently and convince them.”",
        "Round 3 — reveal (3 min). Show the answer key on the projector. “Count how many of your cuts match the machine's. Where does the machine cut that no human would?”",
        "Bridge (1 min). “The machine's cuts aren't syllables and aren't always words. They're the chunks that were most common in a giant pile of text. Keep your strip — we'll check it against the real thing on the screen.”",
      ],
      answerKeyHeading: "Answer key — the real cuts",
      answerKeyNote: () => (
        <>
          GPT-2 byte-pair vocabulary, measured 2026-08-22. ␣ marks a space that belongs to the
          piece; the number is the piece's id — what the model actually receives. The extension
          strip is not listed piece by piece: its seventeen pieces are bytes, not characters, and
          the Extension Chopper shows them live.
        </>
      ),
      tally: (words, pieces) => `${words} words → ${pieces} pieces`,
      extensionTally: (chars, pieces) => `${chars} characters → ${pieces} byte-pieces`,
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
        "If the tokenizer were built from a pile of text in your home language instead of English, which words would get whole pieces?",
        "The model receives only numbers. What does it mean, then, when people say a model “understands” a word?",
        "A tokenizer that chops a name into three fragments never “saw” that name whole. Whose names are more likely to be chopped, and does it matter?",
        "Would a model that received letters instead of pieces be better? What would it cost? (A sentence becomes about five times longer.)",
        "You also don't read letter by letter — you recognize word shapes. Is the tokenizer's chopping more like how you read, or less? Defend a side.",
      ],
      debateTag: "human vs. AI debate",
    },
    misconceptions: {
      columns: ["Students often believe…", "What the widget shows"],
      rows: [
        {
          belief: "“The model reads my words.”",
          shows: "Step 1: a word arrives as numbered pieces; nothing in the widget is a word. The model receives the numbers.",
        },
        {
          belief: "“The pieces are syllables.”",
          shows: "Unplugged reveal and Step 1 hint 3: Wed·nes·days next to restart·ed — the cuts follow frequency, not sound.",
        },
        {
          belief: "“Spaces and capitals don't matter to a computer.”",
          shows: "Step 2 chips: “ strawberry” is one piece, “strawberry” is three; Wednesday is one, wednesday is two.",
        },
        {
          belief: "“It knows 2024 is a number.”",
          shows: "Step 2: 2024 is 20·24 and 20245 is 20·245 — two pieces like any word; the digits are strings to the tokenizer.",
        },
        {
          belief: "“The model decided where to cut.”",
          shows: "Teacher background: the menu was fixed before training by counting; the model never chooses. Raise this in the evaluation act.",
        },
      ],
    },
    assessment: {
      evalHeading: "Evaluation act (33–40 min)",
      evalIntro: () => (
        <>
          The evaluation act is where students judge the machine (the three questions on the
          lesson page); the exit ticket is what you collect. Both on paper — this site has no
          forms. Score the exit ticket with the three-level rubric; the sample responses show
          the level, not the wording.
        </>
      ),
      rubricHeading: "Rubric",
      levels: [
        "Level 1 — Noticing: reports what the widget showed (pieces, numbers) without a mechanism.",
        "Level 2 — Explaining: states that the model receives numbered pieces and links one observation to its reason (frequency, the space, the capital).",
        "Level 3 — Judging: explains the mechanism and uses it to predict or evaluate a case not shown in class.",
      ],
      exitHeading: "Exit ticket (40–45 min) with sample responses",
      items: [
        {
          q: "What does the model receive when you type a sentence — words, letters, or something else? Be specific.",
          samples: [
            "Pieces. The words got chopped up.",
            "Numbered pieces — each chunk of text becomes a number from a fixed list, and the model gets the list of numbers, not the letters.",
            "A list of numbers, one per piece. The pieces come from a menu built by counting common chunks, so a common word is one number and a rare word is several. The model never gets letters, which is why it can't see spelling.",
          ],
        },
        {
          q: "Why did “ strawberry” (with a space) become one piece and “strawberry” (without) become three?",
          samples: [
            "Because of the space.",
            "The space is part of the piece. “ strawberry” with a space is common in text (words usually follow a space), so it got its own piece; without the space it is rarer and gets built from st·raw·berry.",
            "The menu was built by counting chunks including their leading space. “ strawberry” appeared often enough to earn one piece; bare “strawberry” — no space in front — is rarer in text, so it falls back to fragments. The same word in a different position is different input — which is why a prompt that starts with a word can behave differently from one that has it mid-sentence.",
          ],
        },
        {
          q: "Name one task where seeing pieces instead of letters would make a model worse, and one where it wouldn't matter.",
          samples: [
            "Spelling would be worse. Writing a story wouldn't matter.",
            "Counting letters or rhyming would be worse, because the letters never arrive. Predicting the next word wouldn't matter much, because common words are single pieces anyway.",
            "Anything at the letter level — counting r's, reversing a word, spelling a rare name — is worse because the model only has piece numbers. Word- or sentence-level tasks are fine because the pieces already carry that. A model can still learn some spelling by accident, from text that spells words out, so “worse” means unreliable, not impossible.",
          ],
        },
      ],
    },
    extension: {
      prose: () => (
        <>
          Doubles the middle beat and adds a second evaluation task. New material: the Extension
          Chopper's other-script chips — each verified: 我喜欢吃草莓。 is 17 byte-pieces for 7
          characters; <em>Me gusta la fresa.</em> is 7 pieces for 4 words (gust·a, f·resa); 🍓🍓
          is 6; naïve café is 3, with the accents as bytes. The debate follows CSTA HS-SOC-HU-44's
          human-vs-AI framing; run it as two teams, two minutes each, one rebuttal, two votes.
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
          { term: "piece / token", zh: "碎片 / token", plain: "one chunk from the tokenizer's menu; the model gets its number" },
          { term: "tokenizer", zh: "切词器", plain: "the program that chops text into pieces before the model runs" },
          { term: "vocabulary / menu", zh: "词表", plain: "the fixed list of about 50,000 pieces" },
          { term: "id / piece number", zh: "编号", plain: "the number the model receives instead of the text" },
          { term: "byte", zh: "字节", plain: "the smallest unit of stored text; non-English characters fall back to bytes" },
          { term: "model", zh: "模型", plain: "the program that predicts the next piece — Modules 2–6" },
        ],
      },
      nonStem: {
        heading: "Non-STEM classes — jargon-free variant of each prompt",
        prompts: [
          "Step 1: Type a sentence. Which words stayed in one piece, and which got broken up? Find the longest break-up.",
          "Step 2: Click each chip and count the pieces. Does adding a space or a capital letter change the count? Why might a computer care?",
          "Step 3: Pick a word and a letter. Does your letter ever show up by itself in the bottom row?",
        ],
      },
      advanced: {
        heading: "Advanced",
        prose: () => (
          <>
            The tokenizer is GPT-2's byte-pair encoding; the full vocabulary is public. Ask: why
            50,257? Point students to the Transformer Explainer (poloclub.github.io/transformer-explainer)
            for the same tokenizer feeding GPT-2, and to the nano-lm source for a readable forward
            pass. Challenge: find the shortest English word that takes three pieces.
          </>
        ),
      },
    },
    accessibility: [
      "Keyboard: Tab reaches the text field, the preset chips, the hint button and the X-ray's two fields in reading order; chips and hints activate with Enter or Space. The pieces themselves are output, not controls, and read as text.",
      "Screen reader: the Chopper's pieces read as text with their numbers (“st #301 raw #1831 berry #8396”); the piece count is in the note under the widget. Each revealed hint is announced (polite live region).",
      "Text alternative: every visualization on this page is already text — pieces and numbers. No information is carried by color alone: piece colors only separate neighbors; the X-ray marks a letter hit with an underline as well as a color.",
      "Phase 4 (2026-08-23): the page passes an automated WCAG 2.1 AA audit (axe-core, zero violations in both languages) and a keyboard walk; the pieces now form a named list (“piece 2: ‘raw’, id 1831”), the X-ray's “you see” row reads as one phrase (“strawberry: 10 letters, r at positions 3, 8, 9”), and a skip link opens every page. Still open: no text-to-speech of prompts, and no testing with a real screen reader yet. The conformance statement, with the full known-gaps table, is the Accessibility statement page (#/classroom/about/accessibility).",
    ],
    embed: {
      slides:
        "Slides companion: none for Module 1 in the MVP (Module 2 only). The lesson page is projector-ready; each beat is a jump link at the top of the page.",
      canvasIntro:
        "Canvas / Schoology embed — an iframe with a fixed height and a fallback link (iframes do not render in Canvas edit mode; students see them in the published page):",
      canvasNote:
        "Replace the placeholder origin with the canonical classroom domain once it is live (phase 4). The per-step deep links in §7 work the same way.",
    },
  },

  sheet: {
    docTitle: "Module 1 · The Word Chopper — Unplugged printable",
    title: "The Word Chopper — Unplugged",
    subtitle: "Cut a sentence into the pieces a machine would memorize. Then argue about it.",
    nameLine: "Names:",
    materials: {
      heading: "You need",
      items: ["This sheet (one per pair)", "Scissors", "A pen — write your reason next to any cut you argued about"],
    },
    rounds: {
      heading: "How it goes",
      items: [
        "Round 1 — Cut (3 min). Cut each sentence strip into pieces. Rule: every piece must be something you'd expect to see again in other sentences. You may cut inside a word.",
        "Round 2 — Argue (3 min). Compare with the pair next to you. Find one place you cut differently and convince them you're right.",
        "Round 3 — Reveal (3 min). Your teacher shows the machine's real cuts. Count how many of yours match. Circle a cut the machine made that no human would.",
      ],
    },
    strips: {
      heading: "Sentence strips — cut along the dashed border first, then cut the sentence",
      cutLabel: "cut here ✂",
      extensionLabel:
        "Block extension strip — a sentence in 中文. Cut it the way you would; then see what the machine does.",
    },
    questions: {
      heading: "After the reveal",
      items: [
        "How many pieces did you make? How many did the machine make?",
        "Where did the machine cut that you never would? Write the piece.",
        "Finish the sentence: “The machine doesn't see words — it sees ______.”",
      ],
    },
    teacherNote: () => (
      <>
        Teacher: the answer key — the real cuts with their numbers — is in the teacher guide,
        section 6 (<code>#/classroom/m1/guide</code>).
      </>
    ),
  },
};
