import { useEffect, useSyncExternalStore } from "react";
import type { EssayStrings } from "./types";
import { en } from "./en";
import { zh } from "./zh";

export type Lang = "en" | "zh";

const STORAGE_KEY = "itm-lang";

export const STRINGS: Record<Lang, EssayStrings> = { en, zh };

// ── Language store ─────────────────────────────────────────────────────────
// Tiny external store so every component calling useStrings() re-renders on
// setLang, without a context provider or an i18n library. Resolution order:
// ?lang= param > persisted choice > browser language > English.

function resolveInitialLang(): Lang {
  // 1. URL param
  if (typeof location !== "undefined") {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "zh" || p === "en") return p;
  }
  // 2. persisted choice
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "zh" || stored === "en") return stored;
    }
  } catch {
    // storage unavailable (private mode etc.) — fall through
  }
  // 3. browser language
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    if (navigator.language.startsWith("zh")) return "zh";
  }
  return "en";
}

let currentLang: Lang = resolveInitialLang();
const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // best effort
  }
  for (const fn of listeners) fn();
}

function applyDocumentLang(lang: Lang): void {
  if (typeof document === "undefined") return;
  const t = STRINGS[lang];
  document.title = t.docTitle;
  document.documentElement.lang = t.htmlLang;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t.metaDescription);
}

/**
 * Current language alone — for components outside essay #1's string tables
 * (series index, "More in this series", future essays' own string hooks).
 */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** The strings table for the current language. Any component may call this. */
export function useStrings(): EssayStrings {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return STRINGS[lang];
}

/**
 * For the app shell: strings + language control, and keeps document chrome
 * (<title>, <meta description>, <html lang>) in sync. Call once, in App.
 */
export function useI18n(): { t: EssayStrings; lang: Lang; setLang: (l: Lang) => void } {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);
  return { t: STRINGS[lang], lang, setLang };
}

// ── Toggle UI ──────────────────────────────────────────────────────────────

export function LangToggle() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (
    <div className="langtoggle" role="group" aria-label="Language / 语言">
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        className={lang === "zh" ? "active" : ""}
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
      >
        中文
      </button>
    </div>
  );
}
