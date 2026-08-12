// S0 spike: what can transformers.js actually give us?
// Q1 tokenizer · Q2 forward-pass outputs (logits? attentions?) · Q3 latency
import { AutoTokenizer, AutoModelForCausalLM } from "@huggingface/transformers";

const MODEL = "Xenova/distilgpt2";

console.log("── Q1: tokenizer ──");
const t0 = Date.now();
const tok = await AutoTokenizer.from_pretrained(MODEL);
console.log(`tokenizer loaded in ${Date.now() - t0}ms`);

const text = "The cat sat on the";
const enc = await tok(text, { return_tensor: true });
const ids = enc.input_ids;
console.log(`"${text}" →`, Array.from(ids.data).map(Number));
const pieces = tok.tokenize(text);
console.log("pieces:", pieces);
const strawberry = tok.tokenize("strawberry");
console.log('tokenize("strawberry"):', strawberry);

console.log("\n── Q2: model forward outputs ──");
const t1 = Date.now();
const model = await AutoModelForCausalLM.from_pretrained(MODEL, { dtype: "q8" });
console.log(`model loaded in ${Date.now() - t1}ms`);

const t2 = Date.now();
const out = await model({ input_ids: enc.input_ids, attention_mask: enc.attention_mask });
const fwdMs = Date.now() - t2;
console.log("output keys:", Object.keys(out));
console.log("logits dims:", out.logits?.dims);
console.log("has attentions?", Object.keys(out).filter((k) => k.toLowerCase().includes("atten")));

console.log("\n── top-5 next tokens (sanity) ──");
const [, seqLen, vocab] = out.logits.dims;
const last = out.logits.data.slice((seqLen - 1) * vocab, seqLen * vocab);
const idx = [...last.keys()].sort((a, b) => last[b] - last[a]).slice(0, 5);
// softmax over top for display
const max = last[idx[0]];
const exps = idx.map((i) => Math.exp(last[i] - max));
const Z = exps.reduce((a, b) => a + b, 0);
for (let r = 0; r < idx.length; r++) {
  console.log(`  ${JSON.stringify(tok.decode([idx[r]]))}  p≈${((exps[r] / Z) * 100).toFixed(1)}% (of top5)`);
}

console.log("\n── Q3: latency ──");
for (let i = 0; i < 3; i++) {
  const s = Date.now();
  await model({ input_ids: enc.input_ids, attention_mask: enc.attention_mask });
  console.log(`forward #${i + 1}: ${Date.now() - s}ms (first was ${fwdMs}ms)`);
}
