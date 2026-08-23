import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import SeriesIndex from "./series/SeriesIndex";
import { useRoute } from "./series/route";
import WhyItLies from "./essays/why-it-lies/WhyItLies";
import AttentionHeads from "./essays/attention-heads/AttentionHeads";
import WhyItCantCount from "./essays/why-it-cant-count/WhyItCantCount";
import ClassroomRoot from "./classroom/ClassroomRoot";
import "./styles.css";

/**
 * Slug → essay page. Registering a component here makes the slug's page
 * renderable (drafts included, for direct-URL review); the registry's status
 * decides whether any listing ever points at it.
 */
const ESSAY_PAGES: Record<string, ComponentType> = {
  "why-it-lies": WhyItLies,
  "attention-heads": AttentionHeads,
  "why-it-cant-count": WhyItCantCount,
};

/** `#/essays/<slug>` → that essay; `#/essays…` → series index; `#/classroom…` → Classroom Edition; else essay #1. */
function Root() {
  const route = useRoute();
  if (route === "index") return <SeriesIndex />;
  if (route === "classroom") return <ClassroomRoot />;
  if (route !== "flagship") {
    const Page = ESSAY_PAGES[route.slice("essay:".length)];
    if (Page) return <Page />;
    return <SeriesIndex />;
  }
  return <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
