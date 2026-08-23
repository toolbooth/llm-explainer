import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CLASSROOM } from "../src/classroom/config";
import {
  CACHE_PREFIX,
  SW_FILE,
  cacheName,
  classifyRequest,
  isClassroomHash,
  isOurCache,
  modelAssets,
  precachePaths,
  shellPath,
  shouldRegisterServiceWorker,
} from "../src/classroom/sw/strategy";

/**
 * The classroom service worker (src/classroom/sw/) — offline after a
 * reload. Its decisions are pure functions here; the worker file and the
 * Vite plugin only wire them to `self`, `caches` and the build output.
 * The browser-level proof (install, go offline, reload, widgets still
 * run) is in REVIEW-CLASSROOM-4.md.
 */
const ORIGIN = "http://localhost:4199";
const PRECACHE = new Set(["/index.html", "/assets/index-abc.js", "/assets/index-abc.css", "/assets/transformers.web-x.js", "/weights/tinystories-1m.safetensors", "/weights/meta.json", "/tokenizers/gpt2/tokenizer.json", "/tokenizers/gpt2/tokenizer_config.json"]);
const get = (url: string, mode = "cors", destination = "") => ({ url, method: "GET", mode, destination });

describe("registration gate", () => {
  it("registers only in production, on a classroom hash, with the API, in a secure context", () => {
    const ok = { prod: true, hash: "#/classroom/m2", hasServiceWorker: true, secureContext: true };
    expect(shouldRegisterServiceWorker(ok)).toBe(true);
    expect(shouldRegisterServiceWorker({ ...ok, hash: "#/classroom" })).toBe(true);
    expect(shouldRegisterServiceWorker({ ...ok, hash: "#/classroom/about/privacy" })).toBe(true);
    expect(shouldRegisterServiceWorker({ ...ok, prod: false })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...ok, hash: "" })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...ok, hash: "#/essays/why-it-lies" })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...ok, hash: "#/classroomx" })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...ok, hasServiceWorker: false })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...ok, secureContext: false })).toBe(false);
  });

  it("isClassroomHash mirrors the series router's classroom family", () => {
    expect(isClassroomHash("#/classroom")).toBe(true);
    expect(isClassroomHash("#/classroom/m1/step-2")).toBe(true);
    expect(isClassroomHash("#/classrooms")).toBe(false);
    expect(isClassroomHash("#/")).toBe(false);
  });
});

describe("request classification", () => {
  it("navigations to the shell are network-first; other same-origin documents are not ours", () => {
    expect(classifyRequest(get(`${ORIGIN}/`, "navigate", "document"), ORIGIN, "/", PRECACHE)).toBe("navigation");
    expect(classifyRequest(get(`${ORIGIN}/?lang=zh#/classroom/m1`, "navigate", "document"), ORIGIN, "/", PRECACHE)).toBe("navigation");
    expect(classifyRequest(get(`${ORIGIN}/index.html`, "navigate", "document"), ORIGIN, "/", PRECACHE)).toBe("navigation");
    expect(classifyRequest(get(`${ORIGIN}/admin/`, "navigate", "document"), ORIGIN, "/", PRECACHE)).toBe("bypass");
  });

  it("precached assets are cache-first regardless of query string; everything else bypasses", () => {
    expect(classifyRequest(get(`${ORIGIN}/assets/index-abc.js`, "cors", "script"), ORIGIN, "/", PRECACHE)).toBe("precached");
    expect(classifyRequest(get(`${ORIGIN}/weights/tinystories-1m.safetensors`), ORIGIN, "/", PRECACHE)).toBe("precached");
    expect(classifyRequest(get(`${ORIGIN}/tokenizers/gpt2/tokenizer.json?v=2`), ORIGIN, "/", PRECACHE)).toBe("precached");
    expect(classifyRequest(get(`${ORIGIN}/assets/ort-wasm.wasm`), ORIGIN, "/", PRECACHE)).toBe("bypass");
    expect(classifyRequest(get(`${ORIGIN}/@vite/client`), ORIGIN, "/", PRECACHE)).toBe("bypass");
    expect(classifyRequest(get(`${ORIGIN}/favicon.ico`), ORIGIN, "/", PRECACHE)).toBe("bypass");
  });

  it("never touches cross-origin requests (the flagship's optional big model) or non-GET requests", () => {
    expect(classifyRequest(get("https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct/resolve/main/onnx/model.onnx"), ORIGIN, "/", PRECACHE)).toBe("bypass");
    expect(classifyRequest({ url: `${ORIGIN}/index.html`, method: "POST", mode: "navigate" }, ORIGIN, "/", PRECACHE)).toBe("bypass");
    expect(classifyRequest(get("not a url"), ORIGIN, "/", PRECACHE)).toBe("bypass");
  });

  it("honours a non-root base", () => {
    const pre = new Set(["/app/index.html", "/app/assets/a.js"]);
    expect(classifyRequest(get(`${ORIGIN}/app/`, "navigate", "document"), ORIGIN, "/app/", pre)).toBe("navigation");
    expect(classifyRequest(get(`${ORIGIN}/`, "navigate", "document"), ORIGIN, "/app/", pre)).toBe("bypass");
    expect(classifyRequest(get(`${ORIGIN}/app/assets/a.js`), ORIGIN, "/app/", pre)).toBe("precached");
    expect(shellPath("/app/")).toBe("/app/index.html");
  });
});

describe("precache list and cache names", () => {
  it("is the shell, every JS/CSS chunk, the weights and the tokenizer — never the ONNX .wasm — sorted and unique", () => {
    const paths = precachePaths("/", ["assets/index-abc.js", "assets/index-abc.css", "assets/transformers.web-x.js", "assets/ort-wasm-simd-threaded.asyncify-x.wasm", "assets/index-abc.js"], modelAssets(CLASSROOM.assets));
    expect(paths).toEqual([
      "/assets/index-abc.css",
      "/assets/index-abc.js",
      "/assets/transformers.web-x.js",
      "/index.html",
      "/tokenizers/gpt2/tokenizer.json",
      "/tokenizers/gpt2/tokenizer_config.json",
      "/weights/meta.json",
      "/weights/tinystories-1m.safetensors",
    ]);
    for (const p of paths) {
      expect(p.startsWith("/")).toBe(true);
      expect(p).not.toMatch(/^[a-z]+:/i);
    }
    expect(paths.some((p) => p.endsWith(".wasm"))).toBe(false);
  });

  it("the model assets are exactly the classroom config's two self-hosted sets (the §6.1 budget line)", () => {
    expect(modelAssets(CLASSROOM.assets).map((a) => a.path)).toEqual(["/tokenizers/gpt2", "/weights"]);
    const bytes = modelAssets(CLASSROOM.assets).reduce((n, a) => n + Object.values(a.files).reduce((x, y) => x + y, 0), 0);
    expect(bytes).toBe(2107653 + 234 + 7502858 + 249);
  });

  it("cache names are versioned under one prefix and activation keeps only the current one", () => {
    expect(cacheName("abc")).toBe(`${CACHE_PREFIX}abc`);
    expect(isOurCache(`${CACHE_PREFIX}old`, "abc")).toBe(true);
    expect(isOurCache(`${CACHE_PREFIX}abc`, "abc")).toBe(false);
    expect(isOurCache("workbox-precache", "abc")).toBe(false);
    expect(SW_FILE).toBe("classroom-sw.js");
  });

  it("the built worker, when dist/ exists, carries a version and every precache path that is on disk", () => {
    const dist = join(__dirname, "..", "dist");
    const file = join(dist, SW_FILE);
    if (!existsSync(file)) return;
    const src = readFileSync(file, "utf8");
    const m = /\[("\/[^"\]]+"(?:,"\/[^"\]]+")*)\]/.exec(src);
    expect(m).not.toBeNull();
    const paths = JSON.parse(`[${m![1]}]`) as string[];
    expect(paths).toContain("/index.html");
    expect(paths).toContain("/weights/tinystories-1m.safetensors");
    expect(paths).toContain("/tokenizers/gpt2/tokenizer.json");
    expect(paths.some((p) => p.endsWith(".wasm"))).toBe(false);
    for (const p of paths) expect(existsSync(join(dist, p)), p).toBe(true);
    expect(src).toMatch(/"[0-9a-f]{16}"/); // the content-hash version
    expect(src).toContain(CACHE_PREFIX);
    expect(src.length).toBeLessThan(10_000); // "minimal, no framework"
  });
});
