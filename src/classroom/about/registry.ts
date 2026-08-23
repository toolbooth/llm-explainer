/**
 * The seven shared front-matter documents, per language, as the Markdown
 * source they are rendered from (PRODUCT.md §5: HTML, PDF and the rest "are
 * generated from the same source text"). The drafts in
 * classroom-edition/front-matter/ were copied here and corrected against
 * the built code (REVIEW-CLASSROOM-3.md lists every correction); the site
 * renders these copies, so this directory is the text of record.
 *
 * The letter kit is English-only by design (PRODUCT.md §10.1 item 7); its
 * 中文 page is a 中文 preface followed by the English kit, each part carrying
 * its own `lang` so assistive technology switches voice at the boundary.
 */
import type { Lang } from "../../content/i18n";
import { type AboutSlug } from "./slugs";

import modelCardEn from "./content/model-card.en.md?raw";
import modelCardZh from "./content/model-card.zh.md?raw";
import privacyEn from "./content/privacy-safety.en.md?raw";
import privacyZh from "./content/privacy-safety.zh.md?raw";
import techCheckEn from "./content/tech-check.en.md?raw";
import techCheckZh from "./content/tech-check.zh.md?raw";
import standardsEn from "./content/standards-crosswalk.en.md?raw";
import standardsZh from "./content/standards-crosswalk.zh.md?raw";
import policyEn from "./content/policy-citations.en.md?raw";
import policyZh from "./content/policy-citations.zh.md?raw";
import accessibilityEn from "./content/accessibility.en.md?raw";
import accessibilityZh from "./content/accessibility.zh.md?raw";
import letterKitEn from "./content/letter-kit.en.md?raw";
import letterKitZhPreface from "./content/letter-kit.zh-preface.md?raw";

/** One run of Markdown in one language; a page is one or more parts. */
export interface AboutPart {
  lang: Lang;
  md: string;
}

export interface AboutDoc {
  slug: AboutSlug;
  /** The draft file the text came from (for the review sheet and the manifest). */
  source: string;
  parts: Record<Lang, AboutPart[]>;
  /** The crosswalk prints landscape (eleven columns). */
  landscape?: boolean;
}

export const ABOUT_DOCS: Record<AboutSlug, AboutDoc> = {
  "model-card": {
    slug: "model-card",
    source: "model-card",
    parts: { en: [{ lang: "en", md: modelCardEn }], zh: [{ lang: "zh", md: modelCardZh }] },
  },
  privacy: {
    slug: "privacy",
    source: "privacy-safety",
    parts: { en: [{ lang: "en", md: privacyEn }], zh: [{ lang: "zh", md: privacyZh }] },
  },
  "tech-check": {
    slug: "tech-check",
    source: "tech-check",
    parts: { en: [{ lang: "en", md: techCheckEn }], zh: [{ lang: "zh", md: techCheckZh }] },
  },
  standards: {
    slug: "standards",
    source: "standards-crosswalk",
    parts: { en: [{ lang: "en", md: standardsEn }], zh: [{ lang: "zh", md: standardsZh }] },
    landscape: true,
  },
  policy: {
    slug: "policy",
    source: "policy-citations",
    parts: { en: [{ lang: "en", md: policyEn }], zh: [{ lang: "zh", md: policyZh }] },
  },
  accessibility: {
    slug: "accessibility",
    source: "accessibility",
    parts: { en: [{ lang: "en", md: accessibilityEn }], zh: [{ lang: "zh", md: accessibilityZh }] },
  },
  "letter-kit": {
    slug: "letter-kit",
    source: "letter-kit",
    parts: {
      en: [{ lang: "en", md: letterKitEn }],
      zh: [
        { lang: "zh", md: letterKitZhPreface },
        { lang: "en", md: letterKitEn },
      ],
    },
  },
};
