import type { ReactNode } from "react";
import type { HintStrings } from "../HintPanel";

/**
 * The Classroom Edition's shared chrome, per language: the module index,
 * the frame every classroom page shares (nav, at-a-glance, model card line,
 * privacy line, footer), the hint control, and the front-matter placeholders
 * that phase 3 fills in. Module prose lives in each module's own tables
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
    seriesLink: string;
  };

  nav: {
    index: string;
    module: string;
    guide: string;
    unplugged: string;
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

  /** Placeholders for the shared guide front matter (phase 3). */
  frontMatter: { heading: string; note: string; items: { key: string; label: string }[] };

  footer: () => ReactNode;
}
