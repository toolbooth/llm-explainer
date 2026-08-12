/** Loader for the hand-rolled 7.5MB nano model (self-hosted weights). */
import { NanoGPT, type NanoMeta } from "../nano/model";
import { parseSafetensors } from "../nano/safetensors";

export interface NanoHandle {
  forward(ids: number[]): ReturnType<NanoGPT["forward"]>;
  meta: NanoMeta;
}

async function fetchWithProgress(url: string, onPct: (pct: number) => void): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  const total = Number(res.headers.get("content-length") ?? 0);
  if (!res.body || !total) return res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onPct(Math.round((received / total) * 100));
  }
  const buf = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.length;
  }
  return buf.buffer;
}

export async function loadNano(onPct: (pct: number) => void): Promise<NanoHandle> {
  const [meta, weights] = await Promise.all([
    fetch("/weights/meta.json").then((r) => r.json() as Promise<NanoMeta>),
    fetchWithProgress("/weights/tinystories-1m.safetensors", onPct),
  ]);
  const model = new NanoGPT(parseSafetensors(weights), meta);
  return { forward: (ids) => model.forward(ids), meta };
}

/** Deterministic mock for CI: lower-triangular decaying attention. */
export function mockNano(): NanoHandle {
  const meta: NanoMeta = { hidden: 64, layers: 8, heads: 16, vocab: 50257, maxPos: 2048, lnEps: 1e-5 };
  return {
    meta,
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
      return { logits: new Float32Array(meta.vocab), attentions, seq };
    },
  };
}
