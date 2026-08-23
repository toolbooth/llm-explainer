import type { ReactNode } from "react";

/**
 * The scrolling box every classroom table sits in. A wide table scrolls
 * inside this box instead of the page (mobile, the eleven-column
 * crosswalk), and a box that can scroll must be reachable from the
 * keyboard — WCAG 2.1.1 via axe's `scrollable-region-focusable` — so it is
 * a named, focusable group: Tab lands on it, arrow keys scroll it, and a
 * screen reader hears the label ("Table, scrolls sideways") before the
 * table itself. (`group`, not `region`: a region is a landmark, and ten
 * identically named landmarks on a guide page would fail axe's
 * landmark-unique best practice and clutter a landmark list.)
 */
export default function TableWrap(props: { label: string; children: ReactNode }) {
  return (
    <div className="cl-table-wrap" tabIndex={0} role="group" aria-label={props.label}>
      {props.children}
    </div>
  );
}
