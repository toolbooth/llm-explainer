/// <reference lib="webworker" />
/**
 * The Classroom Edition's service worker — offline after the first visit,
 * including a page reload (PRODUCT.md §6.1 level (b), §10.1 item 4). No
 * framework, no runtime caching, one versioned precache; the decisions are
 * in strategy.ts and the policy is documented there. This file is bundled
 * into dist/classroom-sw.js by vite-plugin.ts, which fills in the two
 * build-time constants below from the files the build actually emitted.
 */
import { cacheName, classifyRequest, isOurCache, shellPath } from "./strategy";

declare const __SW_VERSION__: string;
declare const __SW_PRECACHE__: string[];
declare const __SW_BASE__: string;

const sw = self as unknown as ServiceWorkerGlobalScope;
const VERSION = __SW_VERSION__;
const BASE = __SW_BASE__;
const PRECACHE: string[] = __SW_PRECACHE__;
const PRECACHED = new Set(PRECACHE);
const NAME = cacheName(VERSION);

/**
 * Precache one file. The worker installs while the page is still
 * downloading the same weights, and Chrome's HTTP cache refuses a second
 * request for an entry that is in flight ("Cache.add() encountered a
 * network error", observed against `vite preview`) — so a failed add is
 * retried on a short timer until the page's download has landed, and
 * only the last attempt bypasses the HTTP cache (`cache: "reload"`, a
 * second download) rather than failing the install.
 */
async function addWithRetry(cache: Cache, url: string, attempts = 12, delayMs = 2000): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      await cache.add(i === attempts - 1 ? new Request(url, { cache: "reload" }) : url);
      return;
    } catch (e) {
      if (i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

sw.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(NAME);
      // Plain requests first: the page has usually just fetched the
      // weights and the tokenizer, and the HTTP cache hands them over
      // without a second download.
      await Promise.all(PRECACHE.map((url) => addWithRetry(cache, url)));
      await sw.skipWaiting();
    })()
  );
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => isOurCache(n, VERSION)).map((n) => caches.delete(n)));
      await sw.clients.claim();
    })()
  );
});

sw.addEventListener("fetch", (event) => {
  const req = event.request;
  const kind = classifyRequest({ url: req.url, method: req.method, mode: req.mode, destination: req.destination }, sw.location.origin, BASE, PRECACHED);
  if (kind === "bypass") return;
  if (kind === "navigation") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cached = await caches.match(shellPath(BASE), { cacheName: NAME, ignoreVary: true });
          return cached ?? Response.error();
        }
      })()
    );
    return;
  }
  event.respondWith(
    (async () => {
      // Match on the path alone: the page's request for a module script
      // carries an Origin header and the server answers `Vary: Origin`,
      // which would otherwise miss the entry the worker stored itself.
      const cached = await caches.match(new URL(req.url).pathname, { cacheName: NAME, ignoreSearch: true, ignoreVary: true });
      return cached ?? fetch(req);
    })()
  );
});

// Lets a page ask which build is serving it (the tech check's "how to verify" step).
sw.addEventListener("message", (event) => {
  if (event.data === "classroom-sw:version") event.source?.postMessage({ type: "classroom-sw:version", version: VERSION, precache: PRECACHE.length });
});
