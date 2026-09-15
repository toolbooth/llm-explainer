import type { ReactNode } from "react";
import type { CiteStrings } from "../../content/types";
import type { HintStrings } from "../HintPanel";
import type { AboutSlug } from "../about/slugs";
import type { EmbedWidgetId } from "../route";

export interface ClassroomA11yStrings {
  /** "Skip to the lesson" — first focusable element on every classroom page. */
  skipLink: string;
  /** Name of every widget's free-text field ("Your sentence"); widgets that already label theirs ignore it. */
  inputLabel: string;
  /** Name of every temperature slider, and its announced value ("T = 1.05"). */
  temperature: string;
  temperatureValue: (t: string) => string;
  /** Chopper / X-ray: the piece list and one piece's name. */
  pieces: string;
  pieceItem: (n: number, text: string, id: number) => string;
  /** X-ray: the letters row ("strawberry: 10 letters, r at 3, 8, 9") and one piece with its letter count. */
  letters: (word: string, n: number, letter: string, positions: number[]) => string;
  xrayPieceItem: (n: number, text: string, id: number, carries: number) => string;
  /** Gamble: the bar list and one bar's name ("'the': 41.2%"). */
  probabilities: string;
  probabilityItem: (label: string, pct: string) => string;
  /** TheLoop: a written token's name, the popover list, the live status, the step log. */
  tokenName: (text: string, pct: string) => string;
  alternatives: string;
  status: (n: number, text: string, pct: string) => string;
  statusRunning: string;
  stepLog: string;
  stepLogHeaders: { n: string; token: string; p: string; alts: string };
  /** Scrollable regions a keyboard user can focus: tables and the embed code. */
  tableRegion: string;
  codeRegion: string;
}

/**
 * The Classroom Edition's shared chrome, per language: the module index,
 * the frame every classroom page shares (nav, at-a-glance, model card line,
 * privacy line, footer), the hint control, and the chrome of the shared
 * front-matter pages (#/classroom/about/*). Module prose lives in each module's own tables
 * (src/classroom/m1/content/), replicating the series' content pattern —
 * each module owns its words; this table owns the furniture.
 */
export interface ClassroomStrings {
  docTitle: string;
  metaDescription: string;
  htmlLang: string;

  /** Series kicker above every classroom h1. */
  kicker: string;

  index: {
    title: string;
    subtitle: string;
    whatItIs: () => ReactNode;
    whatItIsNot: () => ReactNode;
    modulesHeading: string;
    moduleLabel: (n: number) => string;
    planned: string;
    forTeachers: string;
    guideLink: string;
    unpluggedLink: string;
    slidesLink: string;
    seriesLink: string;
  };

  nav: {
    index: string;
    module: string;
    guide: string;
    unplugged: string;
    slides: string;
    print: string;
    /** Title of the small "#" anchor next to every step heading. */
    linkToStep: string;
  };

  hints: HintStrings;

  /**
   * Accessibility chrome (PRODUCT.md §6.3): the skip link, and the names
   * and live-region text the shared widgets render only when a classroom
   * page passes them (Chopper, Gamble, TheLoop, Tokenizer X-ray, Hundred
   * Rolls each declare the subset they take as an `a11y` prop; this one
   * table satisfies all five structurally). Essays never pass it.
   */
  a11y: ClassroomA11yStrings;

  /** §5 front matter item 2, one line; every module page surfaces it. */
  modelCard: () => ReactNode;
  /** §5 front matter item 3, one line; every module page surfaces it. */
  privacy: () => ReactNode;

  /** The at-a-glance strip under a module's title. */
  glance: { grades: string; time: string; devices: string; account: string };

  /** The §4.3 beats — label + timing — shared by every module's jump nav and plan. */
  beats: {
    hook: { label: string; time: string };
    unplugged: { label: string; time: string };
    explore: { label: string; time: string };
    evaluate: { label: string; time: string };
    exit: { label: string; time: string };
    extension: { label: string; time: string };
  };

  /**
   * The shared guide front matter (PRODUCT.md §5 items 2–8), one page per
   * slug under #/classroom/about/. `items` is the index's list (label +
   * one-line blurb); `guideLine` prefixes the link row in every module guide.
   */
  frontMatter: {
    heading: string;
    intro: string;
    guideLine: string;
    items: { slug: AboutSlug; label: string; blurb: string }[];
  };

  /** The index's two tool links under the front matter: the embed kit and the evidence page. */
  tools: {
    embed: { label: string; blurb: string };
    taught: { label: string; blurb: string };
  };

  /** #/classroom/taught — the adoption-evidence surface (PRODUCT.md §8). */
  taught: {
    docTitle: string;
    metaDescription: string;
    title: string;
    subtitle: string;
    /** Why we ask, with all three uses — improvement, academic, the author's records — disclosed plainly (§8.1 rule 5). */
    why: () => ReactNode;
    principles: { heading: string; items: string[] };
    /** The public list of consenting adopters (src/classroom/adopters.ts) and its designed empty state. */
    adopters: {
      heading: string;
      empty: () => ReactNode;
      /** "Modules:" label in front of an entry's M1/M2 list. */
      modulesLabel: string;
      /** Where an entry came from. */
      via: { discussion: string; email: string };
    };
    channels: {
      heading: string;
      discussion: { heading: string; body: () => ReactNode; link: string; notOpen: () => ReactNode };
      email: { heading: string; body: () => ReactNode; link: string; subject: string; bodyTemplate: string };
      letter: { heading: string; body: () => ReactNode; link: string };
    };
    /** The §A report fields, mirrored from the letter kit. */
    fields: { heading: string; intro: string; items: string[] };
    consent: { heading: string; body: () => ReactNode };
    never: () => ReactNode;
  };

  /** #/classroom/embed — the embed kit (PRODUCT.md §6.4, §10.1 item 6). */
  embed: {
    docTitle: string;
    metaDescription: string;
    title: string;
    subtitle: string;
    /** What every embed carries: same-origin assets only, the classroom limits, the visible attribution backlink. */
    contract: () => ReactNode;
    /** Shown only if CLASSROOM_ORIGIN is ever unset: the snippets carry a labelled placeholder domain. */
    placeholderNote: (placeholder: string) => ReactNode;
    googleClassroom: { heading: string; intro: () => ReactNode };
    canvas: { heading: string; intro: () => ReactNode; editModeNote: string };
    /** The single-widget section: heading, intro, and one blurb per widget (titles come from the module tables). */
    widgetsHeading: string;
    widgetsIntro: () => ReactNode;
    widgets: Record<EmbedWidgetId, { blurb: string }>;
    /** The whole-page section: every lesson page, step, guide, printable and slides has a URL and a snippet. */
    pagesHeading: string;
    pagesIntro: () => ReactNode;
    /** Column labels of the whole-page table. */
    table: { what: string; url: string; height: string; snippet: string };
    kinds: { module: string; step: (n: number) => string; guide: string; unplugged: string; slides: string };
    /** Labels of one widget card's parts. */
    preview: string;
    urlLabel: string;
    snippetLabel: string;
    /** The link text inside the snippet's fallback paragraph. */
    openLabel: (title: string) => string;
    /** The iframe title attribute (WCAG 4.1.2) for one target. */
    frameTitle: (title: string) => string;
    copy: string;
    copied: string;
    /** Snippets and URLs on this page follow the page language. */
    langNote: string;
    /** The visible attribution footer every embedded widget carries (the backlink to the site). */
    attribution: { pre: string; site: string; suffix: string };
  };

  /** Chrome of an about page: the seven-page sub-nav, the source line, the letter kit's "Cite this". */
  about: {
    navLabel: string;
    sourceNote: (source: string) => ReactNode;
    /** Meta description per page (the body's own h1 is the title). */
    descriptions: Record<AboutSlug, string>;
    cite: CiteStrings;
  };

  footer: () => ReactNode;
}
