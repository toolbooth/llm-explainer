import type { NanoTensor } from "./safetensors";
import { geluNew, layerNorm, linear, softmaxRow } from "./ops";

export interface NanoMeta {
  hidden: number;
  layers: number;
  heads: number;
  vocab: number;
  maxPos: number;
  lnEps: number;
}

export interface ForwardResult {
  /** Logits for the last position, [vocab]. */
  logits: Float32Array;
  /** attentions[layer][head] = row-major [seq, seq] softmax weights. */
  attentions: Float32Array[][];
  seq: number;
}

/**
 * Hand-rolled GPT-Neo forward pass. Faithful to the HF implementation:
 * pre-norm blocks, separate q/k/v projections without bias, and — the famous
 * GPT-Neo quirk — NO 1/√d scaling on attention scores. Local-attention layers
 * (window 256) behave identically to global ones for our short inputs.
 */
export class NanoGPT {
  private t: Map<string, NanoTensor>;
  readonly meta: NanoMeta;

  constructor(tensors: Map<string, NanoTensor>, meta: NanoMeta) {
    this.t = tensors;
    this.meta = meta;
  }

  private w(name: string): Float32Array {
    const t = this.t.get(name);
    if (!t) throw new Error(`missing tensor ${name}`);
    return t.data;
  }

  forward(ids: number[]): ForwardResult {
    const { hidden: H, layers: L, heads: NH, vocab: V, lnEps } = this.meta;
    const HD = H / NH; // head dim
    const seq = ids.length;
    if (seq === 0) throw new Error("empty input");
    if (seq > this.meta.maxPos) throw new Error("input too long");

    const wte = this.w("transformer.wte.weight"); // [V, H]
    const wpe = this.w("transformer.wpe.weight"); // [maxPos, H]

    // embeddings
    let x = new Float32Array(seq * H);
    for (let s = 0; s < seq; s++) {
      const tokOff = ids[s] * H;
      const posOff = s * H;
      for (let d = 0; d < H; d++) x[s * H + d] = wte[tokOff + d] + wpe[posOff + d];
    }

    const attentions: Float32Array[][] = [];

    for (let l = 0; l < L; l++) {
      const p = `transformer.h.${l}`;

      // ── attention block ──
      const h1 = layerNorm(x, seq, H, this.w(`${p}.ln_1.weight`), this.w(`${p}.ln_1.bias`), lnEps);
      const q = linear(h1, seq, H, H, this.w(`${p}.attn.attention.q_proj.weight`), null);
      const k = linear(h1, seq, H, H, this.w(`${p}.attn.attention.k_proj.weight`), null);
      const v = linear(h1, seq, H, H, this.w(`${p}.attn.attention.v_proj.weight`), null);

      const layerAttn: Float32Array[] = [];
      const ctx = new Float32Array(seq * H);

      for (let head = 0; head < NH; head++) {
        const hOff = head * HD;
        const attn = new Float32Array(seq * seq); // row-major [q, k]

        for (let qi = 0; qi < seq; qi++) {
          for (let ki = 0; ki <= qi; ki++) {
            let score = 0;
            for (let d = 0; d < HD; d++) {
              score += q[qi * H + hOff + d] * k[ki * H + hOff + d];
            }
            attn[qi * seq + ki] = score; // no 1/√d — GPT-Neo quirk
          }
          for (let ki = qi + 1; ki < seq; ki++) attn[qi * seq + ki] = -Infinity; // causal
          softmaxRow(attn, qi * seq, seq);
        }
        layerAttn.push(attn);

        for (let qi = 0; qi < seq; qi++) {
          for (let d = 0; d < HD; d++) {
            let acc = 0;
            for (let ki = 0; ki <= qi; ki++) {
              acc += attn[qi * seq + ki] * v[ki * H + hOff + d];
            }
            ctx[qi * H + hOff + d] = acc;
          }
        }
      }
      attentions.push(layerAttn);

      const attnOut = linear(
        ctx, seq, H, H,
        this.w(`${p}.attn.attention.out_proj.weight`),
        this.w(`${p}.attn.attention.out_proj.bias`)
      );
      for (let i = 0; i < x.length; i++) x[i] += attnOut[i];

      // ── MLP block ──
      const h2 = layerNorm(x, seq, H, this.w(`${p}.ln_2.weight`), this.w(`${p}.ln_2.bias`), lnEps);
      const fc = geluNew(
        linear(h2, seq, H, 4 * H, this.w(`${p}.mlp.c_fc.weight`), this.w(`${p}.mlp.c_fc.bias`))
      );
      const proj = linear(fc, seq, 4 * H, H, this.w(`${p}.mlp.c_proj.weight`), this.w(`${p}.mlp.c_proj.bias`));
      for (let i = 0; i < x.length; i++) x[i] += proj[i];
    }

    // final norm + tied unembedding (last position only)
    const xf = layerNorm(x, seq, H, this.w("transformer.ln_f.weight"), this.w("transformer.ln_f.bias"), lnEps);
    const last = xf.subarray((seq - 1) * H, seq * H);
    const logits = new Float32Array(V);
    for (let tok = 0; tok < V; tok++) {
      const off = tok * H;
      let acc = 0;
      for (let d = 0; d < H; d++) acc += last[d] * wte[off + d];
      logits[tok] = acc;
    }

    return { logits, attentions, seq };
  }

  /** Greedy generation — used by the correctness test against the reference. */
  generate(ids: number[], steps: number): number[] {
    const out = [...ids];
    for (let i = 0; i < steps; i++) {
      const { logits } = this.forward(out);
      let best = 0;
      for (let t = 1; t < logits.length; t++) if (logits[t] > logits[best]) best = t;
      out.push(best);
    }
    return out;
  }
}
