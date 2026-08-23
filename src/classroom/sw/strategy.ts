/**
 * The classroom service worker's decisions, as pure functions — shared by
 * the worker itself (classroom-sw.ts, bundled at build time by
 * vite-plugin.ts), the registration call in the app, and
 * test/classroom-sw.test.ts. Nothing here touches `self`, `caches` or the
 * DOM.
 *
 * The policy (PRODUCT.md §6.1 "offline behaviour, level (b)" — survive a
 * page *reload* with no network, once the page has been visited):
 *
 * 1. One **versioned precache** holds everything a classroom page needs:
 *    the app shell (index.html + every JS/CSS chunk the build emitted),
 *    the 7.5 MB weights and the ~2 MB self-hosted tokenizer. The version
 *    is a hash of the *contents* of every precached file, so any change to
 *    any byte — a new bundle, re-exported weights — is a new worker, a new
 *    cache, and the old cache is deleted on activation. Nothing is ever
 *    cached at runtime: the precache is the only cache, so the HTML and
 *    the chunks it names always come from the same build.
 * 2. **Navigations are network-first.** Online, a reload always fetches
 *    the current index.html from the server — a deploy is never hidden
 *    behind a cached page. Offline (or when the server fails), the
 *    precached index.html is served; its chunks are in the same cache.
 * 3. **Precached assets are cache-first**; anything else — a cross-origin
 *    request, a non-GET, a dev-server module, the flagship's optional big
 *    model — goes straight to the network and is never stored.
 * 4. The worker is **registered only from classroom pages** (ClassroomRoot
 *    mounts; the essays never call it) and only in production builds; its
 *    scope has to be the site root because every route is a hash on "/",
 *    so once installed it also serves an essay's shell offline — harmless,
 *    and the essays' DOM is untouched (HASHES.md).
 */

/** Every cache this worker has ever made starts with this; activation deletes the ones that are not the current version. */
export const CACHE_PREFIX = "classroom-";

/** The worker's URL under the site base, e.g. "/classroom-sw.js". */
export const SW_FILE = "classroom-sw.js";

export function cacheName(version: string): string {
  return `${CACHE_PREFIX}${version}`;
}

export function isOurCache(name: string, version: string): boolean {
  return name.startsWith(CACHE_PREFIX) && name !== cacheName(version);
}

/** `#/classroom`, `#/classroom/…` — the only hashes that register the worker. */
export function isClassroomHash(hash: string): boolean {
  return /^#\/classroom(\/|$)/.test(hash);
}

/**
 * Whether the app should call navigator.serviceWorker.register() now.
 * Production only (the dev server has no stable asset list and HMR would
 * fight a cache), classroom hashes only, a browser that has the API, and a
 * secure context (https, or localhost — which `vite preview` is).
 */
export function shouldRegisterServiceWorker(env: { prod: boolean; hash: string; hasServiceWorker: boolean; secureContext: boolean }): boolean {
  return env.prod && env.hasServiceWorker && env.secureContext && isClassroomHash(env.hash);
}

export type RequestKind = "navigation" | "precached" | "bypass";

/**
 * Which strategy a request gets. `precached` is the set of root-relative
 * paths in the current precache (pathname only — a navigation to
 * "/?lang=zh" is still the shell).
 */
export function classifyRequest(
  req: { url: string; method: string; mode: string; destination?: string },
  origin: string,
  base: string,
  precached: ReadonlySet<string>
): RequestKind {
  if (req.method !== "GET") return "bypass";
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    return "bypass";
  }
  if (url.origin !== origin) return "bypass";
  if (req.mode === "navigate" || req.destination === "document") {
    // only the shell's own document: a navigation to some other path on this origin is not ours
    return url.pathname === base || url.pathname === `${base}index.html` ? "navigation" : "bypass";
  }
  return precached.has(url.pathname) ? "precached" : "bypass";
}

/** The shell document's path — what a navigation falls back to offline. */
export function shellPath(base: string): string {
  return `${base}index.html`;
}

/**
 * The precache list for a build: the shell, the emitted JS/CSS chunks
 * (never the ONNX runtime's .wasm — 23 MB that no classroom page fetches),
 * and the model assets from the classroom config. Root-relative, sorted,
 * de-duplicated.
 */
export interface ModelAsset {
  readonly path: string;
  readonly files: { readonly [f: string]: number };
}

export function precachePaths(base: string, emitted: readonly string[], assets: readonly ModelAsset[]): string[] {
  const out = new Set<string>();
  out.add(shellPath(base));
  for (const f of emitted) {
    if (!/\.(js|css)$/.test(f)) continue;
    out.add(`${base}${f.replace(/^\/+/, "")}`);
  }
  for (const a of assets) for (const f of Object.keys(a.files)) out.add(`${base}${a.path.replace(/^\/+/, "")}/${f}`);
  return [...out].sort();
}

/** The classroom config's model assets in precache order (tokenizer, weights). */
export function modelAssets(assets: { readonly tokenizer: ModelAsset; readonly weights: ModelAsset }): ModelAsset[] {
  return [assets.tokenizer, assets.weights];
}

/** Bytes → MB string for logs and the tech check (one decimal). */
export function mb(bytes: number): string {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}
