import { registerModulePages } from "../ClassroomRoot";
import M1 from "./M1";
import M1Guide from "./M1Guide";
import M1Unplugged from "./M1Unplugged";

/** Importing this module (src/main.tsx) makes #/classroom/m1, /guide and /unplugged render. */
registerModulePages("m1", { Module: M1, Guide: M1Guide, Unplugged: M1Unplugged });
