import { useEffect, useRef, useState } from "react";
import type { CiteStrings } from "../content/types";

/**
 * "Cite this" block rendered at the end of an essay: a BibTeX entry in a
 * horizontally scrolling <pre> plus a copy-to-clipboard button. The BibTeX is
 * locale-free; the chrome strings come from the essay's content tables so a
 * later essay can render the same block over its own tables.
 */
export default function CiteThis({ strings, bibtex }: { strings: CiteStrings; bibtex: string }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context / permission denied): select
      // the entry so a plain Ctrl/Cmd+C still works.
      const pre = preRef.current;
      const sel = window.getSelection();
      if (!pre || !sel) return;
      const range = document.createRange();
      range.selectNodeContents(pre);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  return (
    <section className="prose cite" id="cite">
      <h2>{strings.heading}</h2>
      <pre className="cite-pre" ref={preRef} tabIndex={0}>
        <code>{bibtex}</code>
      </pre>
      <div className="cite-row">
        <button
          type="button"
          className={`btn ghost cite-copy${copied ? " done" : ""}`}
          onClick={copy}
          aria-live="polite"
        >
          {copied ? strings.copied : strings.copy}
        </button>
        <p className="cite-note">{strings.note}</p>
      </div>
    </section>
  );
}
