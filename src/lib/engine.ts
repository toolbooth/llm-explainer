/**
 * Lazy wrappers around transformers.js. The tokenizer is tiny (~2MB) and
 * loads eagerly per act; the model (~50–90MB) loads only on explicit user
 * action. `?mockModel=1` swaps in a deterministic fake for tests/CI.
 */

export interface TokenPiece {
  text: string;
  id: number;
}

export interface Engine {
  tokenize(text: string): Promise<TokenPiece[]>;
  /** Returns logits for the LAST position given the full text. */
  lastLogits(text: string): Promise<{ logits: Float32Array; ids: number[] }>;
  decode(ids: number[]): Promise<string>;
  loadModel(onProgress: (pct: number) => void): Promise<void>;
  modelReady(): boolean;
}

const MODEL = "Xenova/distilgpt2";

/** Ġ/Ċ are byte-BPE markers for space/newline — make them human-visible. */
export function displayPiece(piece: string): string {
  return piece.replace(/Ġ/g, " ").replace(/Ċ/g, "⏎");
}

function realEngine(): Engine {
  let tokPromise: Promise<any> | null = null;
  let model: any = null;

  const getTok = () => {
    tokPromise ??= import("@huggingface/transformers").then(({ AutoTokenizer }) =>
      AutoTokenizer.from_pretrained(MODEL)
    );
    return tokPromise;
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

    async lastLogits(text) {
      if (!model) throw new Error("model not loaded");
      const tok = await getTok();
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

    async loadModel(onProgress) {
      if (model) return;
      const { AutoModelForCausalLM } = await import("@huggingface/transformers");
      model = await AutoModelForCausalLM.from_pretrained(MODEL, {
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
        .map((w, i) => ({ text: (i > 0 ? "Ġ" : "") + w, id: 1000 + (w.length * 37 + i) }));
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
