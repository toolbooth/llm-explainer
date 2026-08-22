/**
 * Lazy wrappers around transformers.js. Two vocabularies live in this essay:
 * the shared GPT-2 BPE tokenizer (~2MB, loads eagerly per act) speaks for the
 * nano model in Acts 1–3/5, and the big Act-4 model (~136MB, loads only on
 * explicit user action) brings its own. `?mockModel=1` swaps in a
 * deterministic fake for tests/CI.
 */

export interface TokenPiece {
  text: string;
  id: number;
}

export interface Engine {
  /** GPT-2 BPE — the nano model's native vocab (Acts 1–3, 5). */
  tokenize(text: string): Promise<TokenPiece[]>;
  /**
   * The Act-4 model's own tokenizer — the pieces the big model actually
   * receives (pairs with decodeModel / lastLogits). Loads the tokenizer
   * alone (~3.4MB), never the model.
   */
  tokenizeModel(text: string): Promise<TokenPiece[]>;
  /** Returns the Act-4 model's logits for the LAST position given the full text. */
  lastLogits(text: string): Promise<{ logits: Float32Array; ids: number[] }>;
  /** GPT-2 vocab — pairs with tokenize() and the nano model's outputs. */
  decode(ids: number[]): Promise<string>;
  /** The Act-4 model's own vocab — for ids from lastLogits, never from tokenize(). */
  decodeModel(ids: number[]): Promise<string>;
  loadModel(onProgress: (pct: number) => void): Promise<void>;
  modelReady(): boolean;
}

const MODEL = "onnx-community/SmolLM2-135M-Instruct-ONNX";
// The nano model's weights are indexed by GPT-2's vocab (50257 entries), so
// the tokenizer shared across acts must stay GPT-2 BPE no matter which big
// model Act 4 wakes. The two id spaces are mutually meaningless.
const SHARED_TOK = "Xenova/gpt2";

/** Ġ/Ċ are byte-BPE markers for space/newline — make them human-visible. */
export function displayPiece(piece: string): string {
  return piece.replace(/Ġ/g, " ").replace(/Ċ/g, "⏎");
}

function realEngine(): Engine {
  let tokPromise: Promise<any> | null = null;
  let modelTokPromise: Promise<any> | null = null;
  let model: any = null;

  const getTok = () => {
    tokPromise ??= import("@huggingface/transformers").then(({ AutoTokenizer }) =>
      AutoTokenizer.from_pretrained(SHARED_TOK)
    );
    return tokPromise;
  };

  const getModelTok = () => {
    modelTokPromise ??= import("@huggingface/transformers").then(({ AutoTokenizer }) =>
      AutoTokenizer.from_pretrained(MODEL)
    );
    return modelTokPromise;
  };

  return {
    async tokenize(text) {
      const tok = await getTok();
      if (!text) return [];
      const pieces: string[] = tok.tokenize(text);
      const enc = await tok(text, { add_special_tokens: false });
      const ids = Array.from(enc.input_ids.data as BigInt64Array).map(Number);
      return pieces.map((p, i) => ({ text: p, id: ids[i] ?? -1 }));
    },

    async tokenizeModel(text) {
      const tok = await getModelTok();
      if (!text) return [];
      const pieces: string[] = tok.tokenize(text);
      const enc = await tok(text, { add_special_tokens: false });
      const ids = Array.from(enc.input_ids.data as BigInt64Array).map(Number);
      return pieces.map((p, i) => ({ text: p, id: ids[i] ?? -1 }));
    },

    async lastLogits(text) {
      if (!model) throw new Error("model not loaded");
      const tok = await getModelTok();
      const enc = await tok(text);
      const out = await model({ input_ids: enc.input_ids, attention_mask: enc.attention_mask });
      const [, seqLen, vocab] = out.logits.dims as [number, number, number];
      const data = out.logits.data as Float32Array;
      return {
        logits: new Float32Array(data.slice((seqLen - 1) * vocab, seqLen * vocab)),
        ids: Array.from(enc.input_ids.data as BigInt64Array).map(Number),
      };
    },

    async decode(ids) {
      const tok = await getTok();
      return tok.decode(ids);
    },

    async decodeModel(ids) {
      const tok = await getModelTok();
      return tok.decode(ids);
    },

    async loadModel(onProgress) {
      if (model) return;
      const { AutoModelForCausalLM } = await import("@huggingface/transformers");
      model = await AutoModelForCausalLM.from_pretrained(MODEL, {
        // SmolLM2-135M-Instruct q8: 135.7MB fully-quantized modern export,
        // verified at default session options; replaced 225.8MB distilgpt2
        // whose greedy continuations degenerated (2026-08-20 eval).
        dtype: "q8",
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === "progress" && typeof p.progress === "number") {
            onProgress(Math.round(p.progress));
          }
        },
      });
    },

    modelReady() {
      return model !== null;
    },
  };
}

/** Deterministic mock: word-boundary "tokens", hash-derived logits. */
function mockEngine(): Engine {
  let ready = false;
  const words = ["floor", "mat", "table", "moon", "keyboard", "sofa", "roof", "grass", "cloud", "chair", "rug", "window"];
  return {
    async tokenize(text) {
      return text
        .split(/(\s+)/)
        .filter((s) => s.trim())
        .map((w, i) => ({ text: (i > 0 ? "Ġ" : "") + w, id: (w.length * 37 + i * 13) % 180 }));
    },
    async tokenizeModel(text) {
      return this.tokenize(text);
    },
    async lastLogits(text) {
      const logits = new Float32Array(words.length);
      let h = 0;
      for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 997;
      for (let i = 0; i < words.length; i++) logits[i] = ((h + i * 131) % 17) / 2;
      return { logits, ids: [1, 2, 3] };
    },
    async decode(ids) {
      return ids.map((i) => " " + (words[i % words.length] ?? "?")).join("");
    },
    async decodeModel(ids) {
      return this.decode(ids);
    },
    async loadModel(onProgress) {
      for (const pct of [20, 60, 100]) {
        await new Promise((r) => setTimeout(r, 60));
        onProgress(pct);
      }
      ready = true;
    },
    modelReady() {
      return ready;
    },
  };
}

export function createEngine(): Engine {
  return new URLSearchParams(location.search).has("mockModel") ? mockEngine() : realEngine();
}

/** In mock mode the "vocab" is tiny; map ids→display via decode in components. */
