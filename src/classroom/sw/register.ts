/**
 * Registration of the classroom service worker — called from
 * ClassroomRoot's mount effect, i.e. only when a `#/classroom…` page is
 * up. Production builds only; see strategy.ts for the policy.
 */
import { SW_FILE, shouldRegisterServiceWorker } from "./strategy";

let registered = false;

export async function registerClassroomServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (registered) return null;
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  const ok = shouldRegisterServiceWorker({
    prod: import.meta.env.PROD,
    hash: location.hash,
    hasServiceWorker: "serviceWorker" in navigator,
    secureContext: window.isSecureContext,
  });
  if (!ok) return null;
  registered = true;
  const base = import.meta.env.BASE_URL;
  try {
    const reg = await navigator.serviceWorker.register(`${base}${SW_FILE}`, { scope: base });
    // A classroom page is a good moment to look for a newer build; the new
    // worker precaches in the background and serves the next load.
    void reg.update().catch(() => {});
    return reg;
  } catch {
    // an old browser, a blocked worker, a file: URL — the page works without it
    return null;
  }
}
