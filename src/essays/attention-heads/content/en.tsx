import type { AttentionRoomStrings } from "../../../acts/AttentionRoom";
import type { Essay3Strings } from "./types";

/**
 * English prose for essay #3. Same authorial voice as the flagship:
 * metaphor-dense, short-sentence payoffs, restrained humor. The claims-care
 * rules from essays/03-attention-heads/OUTLINE.md are load-bearing here —
 * every head "type" is a heuristic field mark from attention statistics on
 * a 1M-parameter toy, never a mechanistic claim about what a head computes
 * or about frontier models; no head wants, decides or chooses; the
 * unlabeled majority is stated in the body, in the census's own numbers.
 */

/** The Attention Room's chrome, shared by the three Rooms on this page. */
const room: Omit<AttentionRoomStrings, "num" | "title" | "note"> = {
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
};

export const en: Essay3Strings = {
  docTitle: "The Attention-Head Field Guide — Inside the Machine, essay 3",
  metaDescription:
    "An interactive essay. A real language model — running in your browser — reads your sentence with 128 attention heads at once. Run a census of all of them, learn the few recurring patterns by sight, and meet the majority that fit no label.",
  htmlLang: "en",

  hero: {
    kicker: "INSIDE THE MACHINE · ESSAY 3 · RUNS ENTIRELY IN YOUR BROWSER",
    title: "The Attention-Head Field Guide",
    subtitle:
      "You saw one attention matrix. A language model reads your sentence with a hundred and twenty-eight of them at once — here is a birdwatcher's guide to what they're doing.",
  },

  intro: {
    p1: () => (
      <>
        In <a href="#/">essay #1</a> you stood in the Attention Room and watched a real model read
        your sentence: one grid, rows for the word being read, columns for the words it looked
        back at. That grid was honest, and it was a trick of framing. It was{" "}
        <em>one attention head</em>. The model you were dissecting has sixteen of them in every
        layer and eight layers — a hundred and twenty-eight grids for the same sentence, all at
        once, each with its own habit. You were shown one bird and told it was the
        forest.
      </>
    ),
    p2: () => (
      <>
        This essay is the field guide. We'll take your sentence, run every head over it, and sort
        the population the way a birdwatcher sorts a marsh: by the few silhouettes that keep
        recurring. Three of them you met as badges in essay #1 — the previous-word head, the
        anchor head, the scatterbrain. Here they get field marks and a census. And because
        a field guide that pretends to cover every bird is a bad field guide, the last section is
        about the ones that don't fit — which, in this model, is <strong>most of them</strong>.
      </>
    ),
  },

  sec1: {
    heading: "Act 1 · Sixteen Gazes",
    p1: () => (
      <>
        Start with a correction. Below is the same Attention Room
        and the same 7.5MB model, but it opens on layer 2 instead of layer 0, and this time the
        strip of sixteen buttons is the point. Each button is a head: a separate, tiny reader
        with its own copy of the question <em>which earlier words matter for this one?</em> and
        its own answer. Click across the strip. The sentence doesn't change. The reading does —
        sixteen times in this layer, and the layer slider gives you eight layers of that.
      </>
    ),
    p2: () => (
      <>
        Why sixteen? Because one grid can only hold one habit. Where to look is not a single
        decision; it is a bundle of small cheap ones — the word before, the start of the
        sentence, the word itself — and training kept several running side by side for later
        layers to combine. Nobody chose the habits. Nobody wrote
        “head 8, watch the previous word.” A head that happened to lean that way made the
        next-word bet slightly better, and training kept it.{" "}
        <strong>Discovered, not designed</strong> — hold onto that phrase, because every label in
        this essay is ours, not the model's.
      </>
    ),
    widget: {
      ...room,
      num: "Act 1",
      title: "Sixteen Gazes — one sentence, one layer, sixteen readings",
      note: () => (
        <>
          Same grid as essay #1's Act 3, same live weights. The strip of sixteen is the whole
          point this time: each button is a separate head reading the same words. Layer 2 is
          where this model's most structured heads cluster; scrub the slider for the other seven.
        </>
      ),
    },
  },

  sec2: {
    heading: "Act 2 · The Census",
    p1: () => (
      <>
        Now all of them at once. Type a sentence — English, since that's all this model has read
        — and the scanner below runs the model once, then holds all 128 heads up against four
        cheap templates: does its weight land on the word itself, on the word
        before, two words back, or on the first token of the sentence? A fifth test catches
        heads that spread their weight almost evenly — the <em>wash</em>. Each head is drawn as
        a thumbnail of its grid and filed under the template it matches best, with a number: how
        many times more weight lands on that target than an even spread would put there. Here,
        2.3× is a strong field mark. 1.1× is a bird you're imagining.
      </>
    ),
    p2: () => (
      <>
        Read the counts before the pictures. On most sentences the scanner finds a handful of
        previous-word heads, a few anchors, a cluster of self-gazers in layer 2, almost no
        two-back heads — and then two big piles: heads so even they are barely looking anywhere,
        and heads that are clearly looking <em>somewhere</em>, just not at anything on our
        list. The list is short on purpose. Four patterns, one evenness test,
        one threshold we chose (1.75×): a <em>heuristic</em>, in the plain sense — a rule of
        thumb that sorts a population by its statistics. It is not a claim about what any head
        computes. It is a field mark, and field marks misidentify birds.
      </>
    ),
    widget: {
      num: "Act 2",
      title: "The Census — every head in your sentence, sorted",
      loading: (pct) => `Loading the dissection model (7.5MB, shared with Act 1)… ${pct}%`,
      tooShort: "Give it at least four tokens — the templates need a few rows to read.",
      summary: (c, total) => (
        <>
          {total} heads scanned: <strong>{c.prev}</strong> previous-word ·{" "}
          <strong>{c.anchor}</strong> anchor · <strong>{c.self}</strong> self ·{" "}
          <strong>{c.prev2}</strong> two-back · <strong>{c.wash}</strong> wash ·{" "}
          <strong>{c.unlabeled}</strong> unlabeled
        </>
      ),
      species: {
        prev: {
          name: "👀 previous-word",
          blurb: "weight lands on the word just before — a stripe one step under the diagonal",
        },
        anchor: {
          name: "⚓ anchor",
          blurb: "weight lands on the first token — a solid first column",
        },
        self: {
          name: "🪞 self",
          blurb: "weight lands on the word being read — the diagonal itself",
        },
        prev2: {
          name: "👀👀 two-back",
          blurb: "weight lands two words back — a stripe two steps under the diagonal",
        },
        wash: {
          name: "🌫 wash",
          blurb: "spread almost evenly over everything it can see",
        },
        unlabeled: {
          name: "❔ unlabeled",
          blurb: "structured, but none of the four templates — the honest pile",
        },
      },
      count: (n) => (n === 1 ? "1 head" : `${n} heads`),
      none: "none in this sentence",
      evidenceLift: (lift) => `${lift}× even`,
      evidenceWash: (pct) => `${pct}% even`,
      closest: (name, lift) => `closest: ${name} ${lift}×`,
      detailHeading: (layer, head, name) => (
        <>
          L{layer}H{head} · {name}
        </>
      ),
      scoreValue: (lift, sharePct) => `${lift}× · ${sharePct}% of the weight`,
      entropyLabel: "evenness",
      entropyValue: (pct) => `${pct}% even`,
      thresholdNote:
        "A label needs ≥ 1.75× an even spread; a wash needs evenness ≥ 90%. Both numbers are ours.",
      thumbHint:
        "Thumbnails are shaded by departure from an even spread — a wash looks flat, a stripe looks like a stripe. Click any head for the numbers behind its label.",
      note: () => (
        <>
          Every label here is a statistic about where this head's weight landed on this
          sentence — a field mark, not a job description. Change the sentence and heads can
          change piles. The scanner has no way to ask what a head's reading is <em>for</em>.
        </>
      ),
    },
  },

  sec3: {
    heading: "Act 3 · Three Species, Up Close",
    p1: () => (
      <>
        A field guide earns its keep when you can recognise the bird without it. Here are the
        three silhouettes this model produces most reliably, back in the Room at full size. Use
        the badges under the grid — they jump to this sentence's strongest example of each. The{" "}
        <strong>previous-word head</strong> draws a stripe one step below the diagonal: every row
        lights the column just before it. The <strong>anchor head</strong> draws a column:
        whatever word is being read, a slice of the weight lands on the first token. The{" "}
        <strong>wash</strong> is a smear: every cell a little, no cell much.
      </>
    ),
    p2: () => (
      <>
        Notice what the field marks are and aren't. They are shapes in the weights: where the
        model's attention went. They are not explanations of what the model did with it. A
        stripe tells you this head reads the previous word; it does not tell you whether what it
        read mattered for the bet at the end of the pipeline — the same shape can carry a signal
        the next layer uses or one it ignores. In bigger models, researchers have found heads
        with much richer jobs — heads that copy patterns seen earlier in the text, heads that
        track names — using tools this essay doesn't have, like switching a head off and
        watching what breaks. Our scanner has no off-switch. It counts where the weight lands,
        and it stops there.
      </>
    ),
    widget: {
      ...room,
      num: "Act 3",
      title: "Three Species, Up Close — stripe, column, smear",
      note: () => (
        <>
          The badges are computed from your sentence, not scripted: the highest average weight
          on the previous word, on the first token, and the most even spread. Change the
          sentence and the badges can move — field marks on one input, not permanent IDs. (The
          first-token column is common enough across models to have a name, an <em>attention
          sink</em> — though naming a shape is not explaining it.)
        </>
      ),
    },
  },

  sec4: {
    heading: "Act 4 · The Unlabeled Majority",
    p1: () => (
      <>
        Scroll up to the census and look at the last pile. Pick any head from it — read its
        layer and head number off the chip — and dial it into the Room below, which opens on
        layer 7, where the unlabeled run thick. What you'll see is not noise. There are
        patterns: a head that leans on the last few words without settling on one; a head that
        splits its weight between the sentence's start and the words just behind it. The
        structure is plainly there. The name is not, because we only
        brought four.
      </>
    ),
    p2: () => (
      <>
        This is the honest half of the guide. <strong>Most heads in this model resist a simple
        label</strong> — and in bigger models, the heads anyone has managed to name are still the
        minority. A census on one sentence is also only that: a head that
        reads as an anchor here may come out as a wash on your next input, because these are
        habits under particular conditions, not fixed ID cards. The labels are tools for
        looking. Look at the unlabeled heads as long as you like; don't let a tidy gallery
        convince you the forest has four birds.
      </>
    ),
    widget: {
      ...room,
      num: "Act 4",
      title: "The Unlabeled Majority — dial in a nameless head",
      note: () => (
        <>
          Opens on layer 7. Dial in any unlabeled head from the census (layer slider, then head
          button) and read the grid for yourself: real structure, no page in the guide.
        </>
      ),
    },
  },

  outro: {
    heading: "Exit, Counting Birds",
    p1: () => (
      <>
        So what are the 128 heads doing? Reading the same sentence 128 ways, at the same time,
        with habits nobody wrote down. A few of those habits recur clearly enough to name —
        previous word, anchor, self, wash — and now you can spot them in the grid without the
        badges. The rest are structured, nameless, and real.
      </>
    ),
    p2: () => (
      <>
        <strong>Attention isn't one thing.</strong> It was never one grid. It is a population of
        small specialists, found by training because they helped and kept because they kept
        helping, stacked eight deep and mixed into whatever the next layer needs. The single
        matrix in essay #1 was a doorway, not the room.
      </>
    ),
    p3: () => (
      <>
        Take your sentence to the census one more time. Count the birds. Then count the ones the
        guide couldn't name, and remember which number is bigger.
      </>
    ),
  },

  footer: () => (
    <>
      Essay 3 of <a href="#/essays">Inside the Machine</a> · free and open · no accounts, no
      tracking, your text never leaves this tab · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
