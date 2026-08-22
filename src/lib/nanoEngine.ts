/**
 * Loader for the hand-rolled 7.5MB nano model (self-hosted weights).
 *
 * The engine itself — forward pass, safetensors reader, neighbour search,
 * head diagnostics — lives in the extracted `nano-lm` library (this essay is
 * its reference consumer). This module is the essay's thin layer over it:
 * one shared singleton per page, progress fan-out, and the `?mockModel=1`
 * fake for tests/CI.
 *
 * Weights stay served from this app's `public/weights/` (the same two files
 * as `nano-lm/weights/`), so the essay controls caching and CDN placement;
 * `meta.json` is fetched alongside them exactly as before.
 */
import { loadModel, type ForwardResult, type NanoGPT, type NanoMeta } from "nano-lm";

export type { ForwardResult, NanoMeta } from "nano-lm";

export interface NanoHandle {
  forward(ids: number[]): ForwardResult;
  meta: NanoMeta;
  /** Raw token-embedding table [vocab, hidden] — Act 2's map of meaning. */
  wte(): Float32Array;
}

async function loadNano(onPct: (pct: number) => void): Promise<NanoHandle> {
  const model: NanoGPT = await loadModel("/weights/tinystories-1m.safetensors", "/weights/meta.json", {
    onProgress: onPct,
  });
  return {
    forward: (ids) => model.forward(ids),
    meta: model.meta,
    wte: () => model.wte,
  };
}

/**
 * Shared singleton: Acts 2, 3 and 5 dissect the same loaded brain. The first
 * caller triggers the download; later callers resolve instantly. Progress
 * callbacks from every caller are fanned the same updates.
 */
let nanoPromise: Promise<NanoHandle> | null = null;
const progressListeners = new Set<(pct: number) => void>();

export function getNano(onPct?: (pct: number) => void): Promise<NanoHandle> {
  if (onPct) progressListeners.add(onPct);
  nanoPromise ??= new URLSearchParams(location.search).has("mockModel")
    ? Promise.resolve(mockNano())
    : loadNano((pct) => progressListeners.forEach((fn) => fn(pct)));
  return nanoPromise;
}

/** Deterministic mock for CI: lower-triangular decaying attention. */
export function mockNano(): NanoHandle {
  const meta: NanoMeta = { hidden: 64, layers: 8, heads: 16, vocab: 50257, maxPos: 2048, lnEps: 1e-5 };
  const fakeWte = new Float32Array(200 * 64).map((_, i) => Math.sin(i * 0.7) * ((i % 64) + 1));
  return {
    meta,
    wte: () => fakeWte,
    forward(ids) {
      const seq = ids.length;
      const attentions: Float32Array[][] = [];
      for (let l = 0; l < meta.layers; l++) {
        const layer: Float32Array[] = [];
        for (let h = 0; h < meta.heads; h++) {
          const attn = new Float32Array(seq * seq);
          for (let q = 0; q < seq; q++) {
            let sum = 0;
            for (let k = 0; k <= q; k++) {
              const w = 1 / (q - k + 1 + ((h + l) % 3));
              attn[q * seq + k] = w;
              sum += w;
            }
            for (let k = 0; k <= q; k++) attn[q * seq + k] /= sum;
          }
          layer.push(attn);
        }
        attentions.push(layer);
      }
      return { logits: new Float32Array(meta.vocab), attentions, hiddenStates: [], seq };
    },
  };
}
