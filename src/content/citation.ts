/**
 * Citation metadata for the flagship essay — the single TypeScript source for
 * the "Cite this" block. index.html's Google Scholar (Highwire Press) meta tags
 * and CITATION.cff carry the same values by hand; test/content.test.ts checks
 * index.html against the constants below so the three cannot drift silently.
 */

export const CITE_TITLE = "Inside the Machine: An Interactive Guide to How LLMs Actually Think";
/** BibTeX "Last, First" form, as in citation_author. */
export const CITE_AUTHOR = "Shen, Shangyan";
// TODO(launch): the public launch year. PAPER.md projects 2027 Q1 — update this,
// citation_publication_date in index.html, and CITATION.cff together.
export const CITE_YEAR = "2026";
// TODO(launch): replace with the essay's canonical domain once it is live
// (interim: the repository). Keep in sync with citation_public_url in
// index.html and `url` in CITATION.cff.
export const CITE_URL = "https://github.com/toolbooth/llm-explainer";
export const CITE_KEY = "shen2026insidethemachine";

/** BibTeX for an interactive essay with no DOI yet — an @misc entry. */
export function bibtexEntry(opts: {
  key: string;
  author: string;
  title: string;
  year: string;
  url: string;
  note: string;
}): string {
  // Brace-protect the acronym so case-folding styles keep "LLMs".
  const title = opts.title.replace(/\bLLMs\b/g, "{LLMs}");
  return [
    `@misc{${opts.key},`,
    `  author       = {${opts.author}},`,
    `  title        = {${title}},`,
    `  year         = {${opts.year}},`,
    `  howpublished = {\\url{${opts.url}}},`,
    `  note         = {${opts.note}}`,
    `}`,
  ].join("\n");
}

export const FLAGSHIP_BIBTEX = bibtexEntry({
  key: CITE_KEY,
  author: CITE_AUTHOR,
  title: CITE_TITLE,
  year: CITE_YEAR,
  url: CITE_URL,
  note: "Interactive essay",
});
