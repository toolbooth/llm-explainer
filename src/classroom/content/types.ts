import type { ReactNode } from "react";
import type { CiteStrings } from "../../content/types";
import type { HintStrings } from "../HintPanel";
import type { AboutSlug } from "../about/slugs";

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
