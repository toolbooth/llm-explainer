/** Pure probability helpers — unit-tested, no model dependency. */

export interface TokenProb {
  id: number;
  p: number;
}

/** Temperature-adjusted softmax over the top-k logits. */
export function softmaxTopK(logits: Float32Array, k: number, temperature: number): TokenProb[] {
  const t = Math.max(0.05, temperature);
  const idx = [...logits.keys()].sort((a, b) => logits[b] - logits[a]).slice(0, k);
  const max = logits[idx[0]] / t;
  const exps = idx.map((i) => Math.exp(logits[i] / t - max));
  const Z = exps.reduce((a, b) => a + b, 0);
  return idx.map((id, r) => ({ id, p: exps[r] / Z }));
}

/** Sample an entry from a distribution using rand ∈ [0,1). */
export function sampleFrom(dist: TokenProb[], rand: number): TokenProb {
  let acc = 0;
  for (const d of dist) {
    acc += d.p;
    if (rand < acc) return d;
  }
  return dist[dist.length - 1];
}
