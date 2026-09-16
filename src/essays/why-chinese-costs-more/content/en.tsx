import type { XrayTokenizerStrings } from "../../why-it-cant-count/TokenizerXray";
import type { Essay7Strings, MeterStrings } from "./types";

/**
 * English prose for essay #7 — the COMPANION text, this once. The essay's
 * inverted convention (essays/07-why-chinese-costs-more/OUTLINE.md, recorded
 * in SERIES.md): the 中文 edition is the primary, written first at full
 * strength, because the subject is the 中文 reader's own bill; this table is
 * the rewrite. Same series voice, same numbers — every GPT-2 figure is from
 * the 2026-09-15 measurement run against the vendored tokenizer (a scratch
 * script; REVIEW-07.md has the tables) and is re-verified in CI by
 * test/essay7-data.test.ts; the Act-4 modern-vocabulary figures are the
 * same day's hub measurements (method and repo ids recorded in REVIEW-07's
 * comparison-table header), cited with their date and NOT CI-pinned — the
 * prose and the review say so.
 */

/** Shared chrome for the Meter's two instances. */
const meter: Omit<MeterStrings, "num" | "title" | "note"> = {
  loading: "loading the tokenizer…",
  sideEn: "English",
  sideZh: "中文",
  count: (n) => `${n} token${n === 1 ? "" : "s"}`,
  share: (pct) => `${pct}% of a 2048-token window`,
  ratioCaption: (zhCount, enCount) => `中文 ${zhCount} ÷ English ${enCount}`,
};

export const en: Essay7Strings = {
  docTitle: "Why Chinese Costs More Tokens — Inside the Machine, essay 7",
  metaDescription:
    "An interactive essay. The same meaning costs a handful of tokens in English and dozens in Chinese — put your own sentences on a real scale running in your browser, watch 汉字 shatter into bytes, watch the context window shrink, and watch today's vocabularies refund the tax.",
  htmlLang: "en",

  hero: {
    kicker: "INSIDE THE MACHINE · ESSAY 7 · RUNS ENTIRELY IN YOUR BROWSER",
    title: "Why Chinese Costs More Tokens",
    subtitle:
      "The same sentence: 14 tokens in English, 43 in Chinese. Not because Chinese is wasteful — because the ledger was counted in English. Put your own sentences on the scale and watch the tax being collected. And refunded.",
  },

  intro: {
    p1: () => (
      <>
        The same sentence, said in Chinese, costs several times as much. The sentence you just
        read is the evidence: on this page's scale its English version weighs 14 tokens, its 中文
        version 43 — one meaning, three times the bill. And a language model's world has no
        “character count”, only token counts: context windows hold tokens, APIs invoice tokens,
        generation walks token by token. The markup is hard currency. So:{" "}
        <strong>who set the price — and why is Chinese the expensive one?</strong>
      </>
    ),
    p2: () => (
      <>
        The scale is <a href="#/">essay #1</a>'s opening blade — the GPT-2 tokenizer: fifty
        thousand entries, counted in 2019 out of mostly-English text, the vocabulary every
        widget on this site shares. Full disclosure: it is an old ledger, and today's
        vocabularies have refunded most of this tax — that is Act 4, and it is the point:{" "}
        <em>the tax was never a property of Chinese; it is a statistical choice.</em> Three
        steps to the answer. One: a token is neither a character nor a word — it is a regular
        in the vocabulary. Two: the regulars are counted from a corpus — the frequent earn
        whole pieces. Three: in an English ledger, 汉字 are strangers, sold by the byte. (This
        once, the presets are bilingual — 中文 is the protagonist.)
      </>
    ),
  },

  sec1: {
    heading: "Act 1 · On the Scale",
    p1: () => (
      <>
        The bilingual meter below has one input per language and one tokenizer weighing both
        pans: each side's token count, its share of a 2048-token window, and the exchange
        rate. Load the first preset, this essay's opening line. The
        English side cuts into tidy whole-word pieces; the 中文 side comes out a screenful of
        mojibake crumbs. Don't rub your eyes: that is literally what the model receives — 汉字
        broken into bytes. Why they break is Act 2's business; this act, just read the dials.
      </>
    ),
    p2: () => (
      <>
        To keep the numbers honest we weighed a whole basket, not a highlight reel: fourteen
        pairs, same meaning, both sides natural — from “你好，世界。” to a proverb. Total:
        English 108 tokens, 中文 252 — a basket rate of <strong>×2.33</strong>. Pair by pair
        the markup runs ×1.56 to ×3.40, median ×2.46: Chinese gets its best deal on sayings
        (the mountain-temple opener 从前有一座山… is only ×1.56 — English needs sixteen words
        to say it) and pays hardest on small talk (我喜欢吃草莓。, “I like eating
        strawberries.”: seven characters, seventeen pieces, ×3.40). Put your own sentences on
        it — the scale knows no nationality, only bytes.
      </>
    ),
    widget: {
      ...meter,
      num: "Act 1",
      title: "The Bilingual Meter — one meaning, two pans",
      note: () => (
        <>
          The scale is this site's self-hosted GPT-2 tokenizer — both pans, one vocabulary. The
          mojibake crumbs on the 中文 side are byte-pair encoding's display characters for raw
          UTF-8 bytes; Act 2 dissects them. The window bars are drawn against 2048 tokens — the
          entire field of view of essay #1's 7.5MB model. Both inputs are free: the meter
          doesn't care what you feed it — it cuts, counts, reports.
        </>
      ),
    },
  },

  sec2: {
    heading: "Act 2 · Down to Bytes",
    p1: () => (
      <>
        Where a vocabulary comes from: before training, a program sweeps the corpus, starts
        from single bytes, counts which two pieces most often sit together, merges the winner,
        and repeats tens of thousands of times — byte-pair encoding (BPE), a regulars' club.
        English owns that corpus, so <em>the</em>, <em>and</em> and <em>-tion</em> all earned
        whole pieces. A 汉字 is three bytes of UTF-8, too rare on mostly-English webpages to
        win many merges. So 草 (grass) walks in and is split into three byte crumbs; 我 (me)
        does a little better at two. The tokenizer has no opinions. It is a teller: frequent is
        cheap.
      </>
    ),
    p2: () => (
      <>
        Feed 我喜欢吃草莓。 into the X-ray: you see seven characters, the model receives
        seventeen pieces — the sentence is twenty-one bytes, nearly a piece per byte. The
        sharpest line hides in the highlight: the sentence plainly contains a 草, yet no piece
        contains it. The character never entered the building as itself — the model sees three
        bytes, each moonlighting in other characters elsewhere. And the tax is uneven{" "}
        <em>inside</em> Chinese too: 的, the most common character, earned a whole piece
        (enough 中文 leaks into English webtext to put the #1 regular on the list); the period
        。 has one; the comma ， costs three. Same ledger: frequent characters discounted, rare
        ones full byte price.
      </>
    ),
    widget: {
      num: "Act 2",
      title: "The X-ray — one 汉字 in, three bytes out",
      wordLabel: "sentence",
      letterLabel: "watch which character",
      loadingTokenizer: "loading the tokenizer…",
      youSee: "you see",
      modelSees: "it sees",
      letterTally: (letters, count, letter) => `${letters} character${letters === 1 ? "" : "s"} · ${count} × “${letter}”`,
      pieceTally: (pieces) => `${pieces} piece${pieces === 1 ? "" : "s"}`,
      insight: ({ letters, count, letter, pieces, carriers }) =>
        count === 0 ? (
          <>
            {letters} characters and no “{letter}” among them — pick another character to watch.
          </>
        ) : carriers.length === 0 ? (
          <>
            {letters} characters, {count} × “{letter}” → {pieces} pieces — and not one piece
            contains “{letter}”. It was dismantled at the door: the model has never seen this
            character itself, only its parts.
          </>
        ) : (
          <>
            {letters} characters, {count} × “{letter}” → {pieces} piece{pieces === 1 ? "" : "s"},
            with “{letter}” riding inside{" "}
            {carriers.map((id, i) => (
              <span key={id}>
                {i > 0 && ", "}
                <code>#{id}</code>
              </span>
            ))}{" "}
            — this one earned whole-piece treatment.
          </>
        ),
      note: () => (
        <>
          Same tokenizer as the meter. The mojibake is the byte-pair vocabulary's display
          character for each raw byte — what the model receives was never “characters” anyway,
          only ids. Try your own name; or drop 的 in alone and watch the #1 regular's
          whole-piece privilege.
        </>
      ),
    },
  },

  sec3: {
    heading: "Act 3 · The Window Squeeze",
    p1: () => (
      <>
        The markup hurts first in the window. A context window is not a memory — it is a table
        of fixed size, seats counted in tokens. The meter below holds one small story — Tom and
        Lily's afternoon at the park — written naturally in both languages: English 37 tokens,
        中文 116, <strong>×3.14</strong>. Over a 2048-token window, the English version fits
        fifty-five times; the 中文 version, seventeen. Same window: three times the history in
        English — and the 中文 speaker's table is full a third of the way into the story.
      </>
    ),
    p2: () => (
      <>
        It is not the only bill. In the pay-per-token era the same meaning simply invoiced two
        to three times longer in Chinese — nobody scheming, just a unit of account with a thumb
        on the scale. Generation walks in tokens too: the same reply, on that old ledger, took two to three times
        the steps in 中文, each step another roll of the dice (
        <a href="#/essays/why-it-lies">essay #2</a> priced those dice). One subtler line: early
        models were clumsy in Chinese partly for this reason — they were reading byte crumbs,
        not characters, with less 中文 context fitting in the same window. The tax never fines
        you once; it skims every stage.
      </>
    ),
    widget: {
      ...meter,
      num: "Act 3",
      title: "The Meter, Loaded with a Story — the window's bill",
      note: () => (
        <>
          Both story versions are natural writing with aligned meaning (names transliterated,
          as 中文 convention has it). 2048 is this page's model's real window; product windows
          are bigger, but numerator and denominator scale together — the rate stands. For a
          longer test, paste any two longer texts side by side — everything runs in your
          browser, and nothing you type leaves this tab.
        </>
      ),
    },
  },

  sec4: {
    heading: "Act 4 · The Exchange Rate Is Moving",
    p1: () => (
      <>
        Now carry the basket to today's scales (measured 2026-09-15 against each vendor's
        published vocabulary; figures from the repo's measurement script, not this site's CI).
        GPT-4's generation (cl100k, ~100k entries): <strong>×1.48</strong>. GPT-4o's (o200k,
        ~200k): <strong>×1.02</strong> — near parity. Qwen2.5 (~150k, Chinese-rich corpus):{" "}
        <strong>×0.80</strong> — Chinese now <em>cheaper</em> than English. The strawberry
        sentence prices at 17, 13, 6, 4 pieces across the four ledgers: by o200k, 草 finally
        stands as one piece and 喜欢 packs two characters into one; by Qwen, even 草莓 —
        strawberry itself — is a single piece. Bigger vocabularies, more Chinese counted, more
        whole pieces: the tax rate has been falling for years.
      </>
    ),
    p2: () => (
      <>
        So do not read this page as “Chinese users are charged 3× today” — on the mainstream
        ledgers, most of the tax is refunded. Take the mechanism instead:{" "}
        <strong>expensive is never written in the language; it is written in the corpus that
        did the counting.</strong> Whoever's text is plentiful gets whole pieces; a language's
        price level in the token world is set by one census before training, and moves with
        the next. That is why this page keeps its 2019 scale — it magnifies the mechanism
        until the naked eye can see it. And the gradient has not vanished, only moved off
        Chinese: languages the vocabularies still miss are up the mountain, paying full byte
        price.
      </>
    ),
  },

  outro: {
    heading: "Exit, Closing the Ledger",
    p1: () => (
      <>
        So why does Chinese cost more? Because a token is neither a character nor a word but a
        regular in a vocabulary; because the regulars were counted, before training, from a
        corpus that mostly spoke English; so English moved into whole pieces and 汉字 were
        sold by the byte. Windows, invoices, steps — everything downstream flows from that one
        count.
      </>
    ),
    p2: () => (
      <>
        Keep the best part: there is no essence in this tax. Nothing about Chinese inherently
        burns tokens — hand the census enough 中文 and the exchange rate collapses on the
        spot, even inverts. In the machine's world, much of what looks like a property of a
        language is a property of a corpus.
      </>
    ),
    p3: () => (
      <>
        Back to the scale. Weigh your name, your catchphrase, your favorite line of poetry —
        one version per pan. Watch the rate; watch the crumbs. And remember: the readout never
        described your language. It describes the corpus.
      </>
    ),
  },

  footer: () => (
    <>
      Essay 7 of <a href="#/essays">Inside the Machine</a> · free and open · no accounts, no
      tracking, your text never leaves this tab · follow{" "}
      <a href="https://x.com/toolboothdev">@toolboothdev</a>
    </>
  ),
};
