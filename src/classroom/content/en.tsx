import type { ClassroomStrings } from "./types";

/**
 * English chrome for the Classroom Edition. Register: a teacher guide, not
 * an essay — plain, specific, no metaphor-stacking; every claim about what
 * the page does or stores is literally true of the code (see PRODUCT.md
 * §6.2: the site's own text must say "lesson", "teacher guide", "standards"
 * and never present as a chat product).
 */
export const en: ClassroomStrings = {
  docTitle: "Classroom Edition — Inside the Machine",
  metaDescription:
    "Free 45-minute lessons in which a real language model runs in the browser on each student's own sentence. No accounts, no backend, no data collection. Teacher guide and printable unplugged activity included.",
  htmlLang: "en",

  kicker: "INSIDE THE MACHINE · CLASSROOM EDITION",

  index: {
    title: "Classroom Edition",
    subtitle:
      "45-minute, no-login, Chromebook-first lessons in which a real language model runs in the browser on each student's own sentence — with a teacher guide, a printable unplugged opener, and a standards crosswalk. Free forever.",
    whatItIs: () => (
      <>
        Each module is one lesson: a projector hook, ten minutes unplugged, twenty minutes of
        guided exploration on the students' own sentences, an evaluation act in which students
        judge the model, and an exit ticket. Modules are independent; the sequence is recommended,
        not required. Designed for grades 9–14.
      </>
    ),
    whatItIsNot: () => (
      <>
        This is <strong>not a chatbot</strong> and not a grader. Students never “use AI” here —
        they inspect one. No accounts, nothing stored, no student data collected at any age.
      </>
    ),
    modulesHeading: "The modules",
    moduleLabel: (n) => `Module ${n}`,
    planned: "planned",
    forTeachers: "For teachers",
    guideLink: "Teacher guide",
    unpluggedLink: "Unplugged printable",
    slidesLink: "Slides",
    seriesLink: "Built from the Inside the Machine essay series →",
  },

  nav: {
    index: "Classroom",
    module: "Lesson page",
    guide: "Teacher guide",
    unplugged: "Printable",
    slides: "Slides",
    print: "Print this page",
    linkToStep: "Link to this step",
  },

  hints: {
    reveal: (next, total) => `Show hint ${next} of ${total}`,
    hide: "Hide hints",
    label: (n) => `Hint ${n}`,
  },

  a11y: {
    skipLink: "Skip to the lesson",
    inputLabel: "Your sentence",
    temperature: "Temperature",
    temperatureValue: (t) => `T = ${t}`,
    pieces: "Pieces the model sees",
    pieceItem: (n, text, id) => `piece ${n}: “${text}”, id ${id}`,
    letters: (word, n, letter, positions) =>
      positions.length === 0
        ? `${word}: ${n} letters, no ${letter}`
        : `${word}: ${n} letters, ${letter} at ${positions.length === 1 ? "position" : "positions"} ${positions.join(", ")}`,
    xrayPieceItem: (n, text, id, carries) => `piece ${n}: “${text}”, id ${id}, carries ${carries}`,
    probabilities: "Next-word probabilities, top ten",
    probabilityItem: (label, pct) => `“${label}”: ${pct}`,
    tokenName: (text, pct) => `“${text}”, ${pct}`,
    alternatives: "Words the model weighed at this position",
    status: (n, text, pct) => `${n} ${n === 1 ? "word" : "words"} written; last “${text}” at ${pct}`,
    statusRunning: "Writing…",
    stepLog: "Show the step log",
    stepLogHeaders: { n: "#", token: "Word", p: "Probability", alts: "Alternatives" },
    tableRegion: "Table, scrolls sideways",
    codeRegion: "Embed code, scrolls sideways",
  },

  modelCard: () => (
    <>
      <strong>The model card, honestly.</strong> The model in this series is TinyStories-1M, a
      1-million-parameter GPT-Neo trained on synthetic children's stories — about 100,000× smaller
      than a ChatGPT-class model. Tokens, probabilities, attention and sampling work the same way;
      the vocabulary and the competence do not. It has only ever read English, so the example
      inputs on every page are English.
    </>
  ),
  privacy: () => (
    <>
      <strong>Privacy.</strong> No accounts, no cookies, no analytics, no identifiers. What
      students type is processed in this tab and never leaves the device; nothing is stored. The
      only network activity is fetching the page, the tokenizer (~2 MB) and the model weights
      (7.5 MB) — all from this site's own server, once; no third-party host is contacted.
    </>
  ),

  glance: {
    grades: "Grades 9–14",
    time: "45 min · 90-min block extension",
    devices: "Chromebook, iPad, any browser",
    account: "No account · nothing leaves the device",
  },

  beats: {
    hook: { label: "Hook", time: "0–3 min · projector" },
    unplugged: { label: "Unplugged", time: "3–13 min · no devices" },
    explore: { label: "Guided exploration", time: "13–33 min · devices" },
    evaluate: { label: "Evaluation act", time: "33–40 min · paper" },
    exit: { label: "Exit ticket", time: "40–45 min · paper" },
    extension: { label: "Block extension", time: "+45 min" },
  },

  frontMatter: {
    heading: "Shared front matter",
    intro:
      "The shared sections of the teacher guide, one page each, printable (the Print button on every page; the PDF set is built from the same text). Every claim on them is written against the built code and dated.",
    guideLine: "Shared front matter, on the site",
    items: [
      { slug: "model-card", label: "The model card, honestly", blurb: "What TinyStories-1M is, what it can and cannot do, its training data, the sampling limits in classroom mode, and the weights-license status." },
      { slug: "privacy", label: "Privacy & safety one-pager", blurb: "Written to paste into a district vetting form: no accounts, nothing collected, what the browser caches, the FERPA / COPPA / SOPIPA position, and a five-minute network-tab audit." },
      { slug: "tech-check", label: "Tech check (5 minutes, the day before)", blurb: "Device baseline, what gets downloaded, filter categories, the unblock-request template, and the pre-class checklist." },
      { slug: "standards", label: "Standards crosswalk (all six modules)", blurb: "CSTA 2026, AP CSP, AI4K12, the CSTA/AI4K12 priorities, ISTE, DOL TEN 07-25 and CA Ed Code §33548, with a verified-against date per row." },
      { slug: "policy", label: "Policy citations", blurb: "Verbatim federal and state hooks for grant narratives, board questions and unblock requests, each with a verification label." },
      { slug: "accessibility", label: "Accessibility statement", blurb: "The WCAG 2.1 AA target, the automated audit and keyboard walk that every page passes, and the known gaps — screen-reader testing is still owed, and it says so." },
      { slug: "letter-kit", label: "How to cite · how to tell us you taught with this", blurb: "The citation block, the optional \"I taught with this\" report, the letter skeleton, and what we never ask for." },
    ],
  },

  tools: {
    embed: {
      label: "Embed kit",
      blurb:
        "One-line iframe snippets (fixed height, fallback link) for Canvas / Schoology, clean per-step URLs for Google Classroom, and live previews of the three single-widget embeds.",
    },
    taught: {
      label: "“I taught with this”",
      blurb:
        "The public list of teachers who have reported using these lessons — and how to add yours: a two-minute report on the Discussion board or by email. Voluntary, revocable, never required.",
    },
  },

  taught: {
    docTitle: "I taught with this — Classroom Edition — Inside the Machine",
    metaDescription:
      "The public record of classroom use: consenting teachers' reports (name or anonymous, course, term, modules), how to add yours via GitHub Discussions or email, and what we never ask for.",
    title: "“I taught with this”",
    subtitle:
      "The lessons collect nothing, so this page is the only record of use that exists — and every line of it was volunteered by a teacher. Here is the list, and how to join it.",
    why: () => (
      <>
        These lessons have no analytics, no accounts and no counters, so the only way we can ever
        know they were used is if a teacher says so. Reports do three things, and we say all
        three plainly: they <strong>improve the lessons</strong> (what worked and what didn't in
        a real class is the only feedback loop we have); they <strong>document teaching use</strong>{" "}
        for academic submissions (a Journal of Open Source Education submission, conference
        posters); and they serve as <strong>evidence of the work's impact</strong> in the
        author's own professional and immigration records. You can consent to any subset of
        those three, or none — the consent section below spells it out.
      </>
    ),
    principles: {
      heading: "The rules we hold ourselves to",
      items: [
        "Teacher-level only. We never ask for, accept or store student names, student work, screenshots that show students, or any student-level data; if any arrives anyway, we delete it and say so.",
        "Aggregate professional observation is fine — “about 25 students; most could explain temperature afterward” is a teacher's own judgment and contains no student data.",
        "Voluntary, un-incentivized, revocable. No gift cards, no swag, no early access; any statement is removed on request, at any time, and we confirm the removal.",
        "Adults only. We never solicit student testimonials.",
        "Disclosed dual use. Public listing, academic submissions and the author's professional and immigration records are three separate consents — you choose any subset.",
      ],
    },
    adopters: {
      heading: "Who taught with it",
      empty: () => (
        <>
          <strong>No reports yet.</strong> This site went live in September 2026, and this list
          starts with the first teacher who says “I taught with this.” If that could be you: the
          report takes about two minutes, the fields are listed below, and{" "}
          <em>“anonymous HS teacher, Ohio”</em> is a perfectly good name. Post it on the
          Discussion board or email it — either way it lands here as a plain, public commit to a
          data file. No form, no backend, nothing stored anywhere else.
        </>
      ),
      modulesLabel: "Modules:",
      via: { discussion: "via the Discussion board", email: "reported by email" },
    },
    channels: {
      heading: "Tell us — two ways, both optional",
      discussion: {
        heading: "A. The public report (two minutes)",
        body: () => (
          <>
            Post in the repository's GitHub Discussions using the “I taught with this” template —
            the fields below are the whole form. Public by default, editable by you afterwards,
            and other teachers get to see what worked.
          </>
        ),
        link: "Open the Discussion board →",
        notOpen: () => <>The Discussion board is not open yet — use email below.</>,
      },
      email: {
        heading: "B. The same report, by email",
        body: () => (
          <>
            Prefer not to post publicly? Email the same fields, and say plainly whether we may
            list the report on this page — with your name, or anonymously. The mail stays in the
            author's mailbox; nothing else stores it.
          </>
        ),
        link: "Email a report →",
        subject: "I taught with this — use report",
        bodyTemplate:
          "Name (or a label like: anonymous HS teacher, Ohio):\nInstitution (optional):\nCourse:\nGrade band:\nDate(s) / term:\nModules used (M1 The Word Chopper / M2 The Next-Word Gamble):\nApproximate class size, rounded to tens:\nDevice type:\nOne thing that worked:\nOne thing that didn't:\nMay we list this report publicly on the site? (yes with name / yes anonymously / no):",
      },
      letter: {
        heading: "C. A letter (only if you want to help further)",
        body: () => (
          <>
            If you have posted a report and ask how else you can help, we send the letter kit — a
            one-page explanation of why letters matter and a 150-word skeleton. A letter is
            signed by you, on your letterhead if you choose, and describes your own use in your
            own words.
          </>
        ),
        link: "The letter kit →",
      },
    },
    fields: {
      heading: "The report fields",
      intro: "The same list the letter kit and the Discussion template use — teacher-level only:",
      items: [
        "Your name — or a label like “anonymous HS teacher, Ohio”",
        "Institution (optional)",
        "Course",
        "Grade band",
        "Date(s) / term",
        "Which modules",
        "Approximate class size, rounded to tens",
        "Device type",
        "One thing that worked",
        "One thing that didn't",
      ],
    },
    consent: {
      heading: "Consent, in plain words",
      body: () => (
        <>
          A report appears on this page only if you say it may — with your name or an anonymous
          label, your choice, changeable or revocable at any time by email. Separately, you may
          allow a report or a letter to be (a) quoted publicly, (b) cited in academic
          submissions, and (c) used by the author as evidence of the work's impact in
          professional and immigration records. Each is its own yes; none is required, and any
          subset is fine.
        </>
      ),
    },
    never: () => (
      <>
        <strong>What we never ask for, accept or store:</strong> student names, student work,
        screenshots that show students, exit-ticket responses, or any student-level data — and
        we do not offer gift cards, swag or early access in return for reports.
      </>
    ),
  },

  embed: {
    docTitle: "Embed kit — Classroom Edition — Inside the Machine",
    metaDescription:
      "One-line iframe snippets with a fixed height and a fallback link for Canvas / Schoology, clean per-step URLs for Google Classroom, and live previews of the three embeddable widgets. No accounts, no third-party requests.",
    title: "Embed kit",
    subtitle:
      "Put a live widget — or a whole lesson page — into Canvas, Schoology or Google Classroom. Everything embeds from this site's own domain, with no account and the classroom limits built in.",
    contract: () => (
      <>
        <strong>What every embed carries.</strong> The frames below load this site and nothing
        else — no third-party fonts, scripts or analytics, and nothing students type leaves their
        device. The widgets run the classroom configuration (temperature capped at 1.5; the
        optional large model is never mounted), and every embedded widget shows a visible
        attribution line linking back to <strong>insidethemachine.org</strong> — which is also the
        student's way out to the full lesson.
      </>
    ),
    placeholderNote: (placeholder) => (
      <>
        This build has no classroom origin configured, so the snippets below carry the placeholder{" "}
        <code>{placeholder}</code> — replace it with your deployment's domain.
      </>
    ),
    googleClassroom: {
      heading: "Google Classroom — paste a link",
      intro: () => (
        <>
          Classroom needs no iframe: paste the clean URL. Every lesson page, step, guide and
          printable has one, and each carries the language parameter <code>?lang=en</code> /{" "}
          <code>?lang=zh</code>, so your class lands in the right edition whatever the device
          remembers. A step URL lands mid-page on the right prompt.
        </>
      ),
    },
    canvas: {
      heading: "Canvas / Schoology — one line of HTML",
      intro: () => (
        <>
          Copy a snippet into the rich-text editor's HTML view. Each snippet is one fixed-height
          iframe plus a fallback link under it — if frames are blocked, or the screen is small,
          the link opens the same thing in a new tab.
        </>
      ),
      editModeNote:
        "Canvas does not render iframes in edit mode; students see the frame in the published page.",
    },
    widgetsHeading: "Embed one widget",
    widgetsIntro: () => (
      <>
        These three surfaces render one widget alone — no lesson text, no hints, just the
        instrument and the attribution line. Same code, same 7.5 MB model, same limits as the
        lesson pages; students can type their own sentences.
      </>
    ),
    widgets: {
      chopper: { blurb: "Module 1's tokenizer playground: a sentence in, the pieces and their ids out." },
      gamble: { blurb: "Module 2's next-word probability bars with the temperature slider — roll for the next word." },
      "hundred-rolls": { blurb: "Module 2's sampling histogram: press once and the same position is rolled 100 times against the bars." },
    },
    pagesHeading: "Embed or link a whole page",
    pagesIntro: () => (
      <>
        Every lesson page, each of its three steps, the teacher guide, the unplugged printable
        and (Module 2) the slides. The URL column is what you paste into Google Classroom; the
        snippet is the Canvas iframe at the height shown.
      </>
    ),
    table: { what: "What", url: "URL", height: "Frame height", snippet: "Snippet" },
    kinds: {
      module: "Lesson page",
      step: (n) => `Step ${n}`,
      guide: "Teacher guide",
      unplugged: "Unplugged printable",
      slides: "Slides",
    },
    preview: "Live preview",
    urlLabel: "URL",
    snippetLabel: "Iframe snippet",
    openLabel: (title) => `Open ${title} (Inside the Machine: Classroom Edition)`,
    frameTitle: (title) => `${title} — Inside the Machine: Classroom Edition`,
    copy: "Copy",
    copied: "Copied",
    langNote: "Snippets and URLs on this page follow the page language — switch to 中文 above for the 中文 links.",
    attribution: {
      pre: "From",
      site: "insidethemachine.org",
      suffix: "· Inside the Machine: Classroom Edition · free · no accounts · nothing typed here leaves the device",
    },
  },

  about: {
    navLabel: "Shared front matter",
    sourceNote: (source) => (
      <>
        Source text: <code>classroom-edition/front-matter/{source}.en.md</code> (draft 2026-08-22),
        corrected against the built code on integration — the corrections are listed in
        REVIEW-CLASSROOM-3.md. The 中文 page is a peer document, not a translation.
      </>
    ),
    descriptions: {
      "model-card": "The model in your students' browsers: TinyStories-1M via nano-lm — what it is, what it can and cannot do, its training data, classroom sampling limits, and the weights-license status.",
      privacy: "Privacy & safety one-pager for district vetting: no accounts, no data collected, what is cached, FERPA / COPPA / SOPIPA position, safety statement, network-tab audit.",
      "tech-check": "Tech check the day before: device baseline, downloads, filter categories, unblock-request template, 30-client guidance, pre-class checklist.",
      standards: "Standards crosswalk for all six planned modules: CSTA 2026, AP CSP, AI4K12, CSTA/AI4K12 priorities, ISTE, DOL TEN 07-25, CA Ed Code §33548, with verification dates.",
      policy: "Policy citations: verbatim federal and state hooks for grant narratives, school-board questions and allowlist requests, each with a verification label.",
      accessibility: "Accessibility statement: WCAG 2.1 AA target, what the widgets are designed for, known gaps, compatibility and contact.",
      "letter-kit": "How to cite Inside the Machine and how to tell us you taught with it: the optional report, the letter skeleton, and what we never ask for.",
    },
    cite: {
      heading: "How to cite",
      copy: "Copy",
      copied: "Copied",
      note: "The Classroom Edition shares the flagship essay's citation identity (PRODUCT.md §1.4). An arXiv preprint is forthcoming; please cite that once available.",
    },
  },

  footer: () => (
    <>
      Inside the Machine: Classroom Edition · free forever · no accounts, no tracking, your
      students' text never leaves their device · <a href="#/essays">the essay series</a>
    </>
  ),
};
