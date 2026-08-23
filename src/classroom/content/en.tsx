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
      { slug: "accessibility", label: "Accessibility statement", blurb: "The WCAG 2.1 AA target, what the widgets are designed for, and the known gaps — unaudited until phase 4, and it says so." },
      { slug: "letter-kit", label: "How to cite · how to tell us you taught with this", blurb: "The citation block, the optional \"I taught with this\" report, the letter skeleton, and what we never ask for." },
    ],
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
