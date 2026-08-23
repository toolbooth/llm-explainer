/**
 * Vite plugin that emits dist/classroom-sw.js after the main build: the
 * worker in classroom-sw.ts, bundled (strategy.ts inlined) as one classic
 * script with the precache list and a content-hash version filled in.
 * Nothing is added to the app bundle; the essays' build is unchanged.
 *
 * Version: sha256 over the sha256 of every precached file's bytes — the
 * shell, every JS/CSS chunk, the weights, the tokenizer. Any byte changes,
 * the worker changes, the browser installs it, the old cache is dropped.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { CLASSROOM } from "../config";
import { SW_FILE, modelAssets, precachePaths } from "./strategy";

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

function listFiles(dir: string, rel = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, `${rel}${name}/`));
    else out.push(`${rel}${name}`);
  }
  return out;
}

export default function classroomServiceWorker(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "classroom-service-worker",
    apply: "build",
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      // only the main app build (the nested worker build below has no html input and skips this plugin)
      if (config.build.lib) return;
      const outDir = config.build.outDir;
      const base = config.base; // "/" by default
      const emitted = listFiles(outDir).filter((f) => f.startsWith("assets/") && /\.(js|css)$/.test(f));
      const paths = precachePaths(base, emitted, modelAssets(CLASSROOM.assets));
      const hashes = paths.map((p) => {
        const file = join(outDir, p.slice(base.length));
        return sha256(readFileSync(file));
      });
      const version = sha256(hashes.join("\n")).slice(0, 16);
      const { build } = await import("vite");
      await build({
        configFile: false,
        logLevel: "warn",
        root: config.root,
        base,
        define: {
          __SW_VERSION__: JSON.stringify(version),
          __SW_PRECACHE__: JSON.stringify(paths),
          __SW_BASE__: JSON.stringify(base),
        },
        build: {
          outDir,
          emptyOutDir: false,
          lib: { entry: join(config.root, "src/classroom/sw/classroom-sw.ts"), formats: ["iife"], name: "classroomSw", fileName: () => SW_FILE },
          rollupOptions: { output: { inlineDynamicImports: true } },
          minify: true,
          sourcemap: false,
          copyPublicDir: false,
        },
      });
      const total = paths.reduce((n, p) => n + statSync(join(outDir, p.slice(base.length))).size, 0);
      config.logger.info(`classroom-sw.js: version ${version}, ${paths.length} files precached (${(total / 1e6).toFixed(1)} MB)`);
    },
  };
}
