import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import classroomServiceWorker from "./src/classroom/sw/vite-plugin";

export default defineConfig({
  plugins: [react(), classroomServiceWorker()],
});
