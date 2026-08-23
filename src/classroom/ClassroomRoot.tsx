import type { ComponentType } from "react";
import ClassroomIndex from "./ClassroomIndex";
import { useClassroomRoute } from "./route";
import type { ModuleId } from "./registry";
import "./classroom.css";

/** A module's three pages. Registering a module here makes its routes render. */
export interface ModulePages {
  Module: ComponentType<{ step: number | null }>;
  Guide: ComponentType;
  Unplugged: ComponentType;
}

const MODULE_PAGES: Partial<Record<ModuleId, ModulePages>> = {};

/** Called once per module at import time (src/classroom/m1/index.ts). */
export function registerModulePages(id: ModuleId, pages: ModulePages): void {
  MODULE_PAGES[id] = pages;
}

/** `#/classroom…` → index, a module's lesson page (optionally at a step), its guide, or its printable. */
export default function ClassroomRoot() {
  const page = useClassroomRoute();
  if (page.kind === "index") return <ClassroomIndex />;
  const pages = MODULE_PAGES[page.id];
  if (!pages) return <ClassroomIndex />;
  if (page.kind === "guide") return <pages.Guide />;
  if (page.kind === "unplugged") return <pages.Unplugged />;
  return <pages.Module step={page.step} />;
}
