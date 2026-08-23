import { registerModulePages } from "../ClassroomRoot";
import M2 from "./M2";
import M2Guide from "./M2Guide";
import M2Slides from "./M2Slides";
import M2Unplugged from "./M2Unplugged";

/** Importing this module (src/main.tsx) makes #/classroom/m2, /guide, /unplugged and /slides render. */
registerModulePages("m2", { Module: M2, Guide: M2Guide, Unplugged: M2Unplugged, Slides: M2Slides });
