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
    note: "The shared sections of the teacher guide — model card, privacy & safety one-pager, tech check, standards crosswalk, policy citations, accessibility statement, how to cite — arrive in a later phase. Until then, the one-line versions on each lesson page are the authoritative text.",
    items: [
      { key: "model-card", label: "The model card, honestly" },
      { key: "privacy", label: "Privacy & safety one-pager" },
      { key: "tech-check", label: "Tech check (5 minutes, the day before)" },
      { key: "crosswalk", label: "Standards crosswalk (all six modules)" },
      { key: "policy", label: "Policy citations" },
      { key: "accessibility", label: "Accessibility statement" },
      { key: "cite", label: "How to cite · how to tell us you used it" },
    ],
  },

  footer: () => (
    <>
      Inside the Machine: Classroom Edition · free forever · no accounts, no tracking, your
      students' text never leaves their device · <a href="#/essays">the essay series</a>
    </>
  ),
};
