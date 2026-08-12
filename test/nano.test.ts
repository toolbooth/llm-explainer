import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { f16ToF32, parseSafetensors } from "../src/nano/safetensors";
import { NanoGPT, type NanoMeta } from "../src/nano/model";

const ROOT = join(__dirname, "..");
const WEIGHTS = join(ROOT, "public/weights/tinystories-1m.safetensors");
const META = join(ROOT, "public/weights/meta.json");
const REF = join(ROOT, "weights-src/reference.json");

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

const meta = JSON.parse(readFileSync(META, "utf8")) as NanoMeta;
const ref = JSON.parse(readFileSync(REF, "utf8"));
const tensors = parseSafetensors(toArrayBuffer(readFileSync(WEIGHTS)));
const model = new NanoGPT(tensors, meta);

describe("f16 decode", () => {
  it("decodes known half-precision values", () => {
    expect(f16ToF32(0x3c00)).toBe(1);
    expect(f16ToF32(0xc000)).toBe(-2);
    expect(f16ToF32(0x0000)).toBe(0);
    expect(f16ToF32(0x3555)).toBeCloseTo(1 / 3, 3);
  });
});

describe("weights", () => {
  it("loads all 108 tensors with expected shapes", () => {
    expect(tensors.size).toBe(108);
    expect(tensors.get("transformer.wte.weight")!.shape).toEqual([50257, 64]);
    expect(tensors.get("transformer.h.7.mlp.c_proj.weight")!.shape).toEqual([64, 256]);
  });
});

describe("forward pass vs official implementation", () => {
  const result = model.forward(ref.input_ids);

  it("reproduces the last-position logits (fp16 tolerance)", () => {
    for (let i = 0; i < 8; i++) {
      expect(result.logits[i]).toBeCloseTo(ref.logits_first8[i], 1);
    }
  });

  it("agrees on the top-3 next tokens, in order", () => {
    const ids = [...result.logits.keys()]
      .sort((a, b) => result.logits[b] - result.logits[a])
      .slice(0, 3);
    expect(ids).toEqual(ref.top10.slice(0, 3).map((t: { id: number }) => t.id));
  });

  it("reproduces attention matrices layer 0 head 0 and layer 7 head 3", () => {
    const seq = ref.input_ids.length;
    for (const [attn, refM] of [
      [result.attentions[0][0], ref.attn_l0_h0],
      [result.attentions[7][3], ref.attn_l7_h3],
    ] as const) {
      for (let q = 0; q < seq; q++) {
        for (let k = 0; k < seq; k++) {
          expect(Math.abs(attn[q * seq + k] - refM[q][k])).toBeLessThan(0.02);
        }
      }
    }
  });

  it("attention rows are valid distributions", () => {
    const seq = ref.input_ids.length;
    const attn = result.attentions[3][7];
    for (let q = 0; q < seq; q++) {
      let sum = 0;
      for (let k = 0; k < seq; k++) sum += attn[q * seq + k];
      expect(sum).toBeCloseTo(1, 4);
    }
  });
});

describe("greedy generation vs official implementation", () => {
  it("reproduces the exact 12-token continuation", () => {
    const out = model.generate(ref.input_ids, 12);
    expect(out).toEqual(ref.greedy_ids);
  });
});
