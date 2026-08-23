import { useEffect, type ComponentType } from "react";
import ClassroomIndex from "./ClassroomIndex";
import AboutPage from "./about/AboutPage";
import { useClassroomRoute } from "./route";
import type { ModuleId } from "./registry";
import { registerClassroomServiceWorker } from "./sw/register";
import "./classroom.css";

/** A module's pages. Registering a module here makes its routes render. */
export interface ModulePages {
  Module: ComponentType<{ step: number | null }>;
  Guide: ComponentType;
  Unplugged: ComponentType;
  /** The Slides companion — only modules with `slides: true` in the registry route here. */
  Slides?: ComponentType;
}

const MODULE_PAGES: Partial<Record<ModuleId, ModulePages>> = {};

/** Called once per module at import time (src/classroom/m1/index.ts). */
export function registerModulePages(id: ModuleId, pages: ModulePages): void {
  MODULE_PAGES[id] = pages;
}

/** `#/classroom…` → index, a front-matter page, a module's lesson page (optionally at a step), its guide, its printable, or its slides. */
export default function ClassroomRoot() {
  const page = useClassroomRoute();
  // Offline-after-reload (sw/strategy.ts): registered only here, so an
  // essay visit never installs it; production builds only.
  useEffect(() => {
    void registerClassroomServiceWorker();
  }, []);
  if (page.kind === "index") return <ClassroomIndex />;
  if (page.kind === "about") return <AboutPage slug={page.slug} />;
  const pages = MODULE_PAGES[page.id];
  if (!pages) return <ClassroomIndex />;
  if (page.kind === "guide") return <pages.Guide />;
  if (page.kind === "unplugged") return <pages.Unplugged />;
  if (page.kind === "slides") return pages.Slides ? <pages.Slides /> : <pages.Module step={null} />;
  return <pages.Module step={page.step} />;
}
