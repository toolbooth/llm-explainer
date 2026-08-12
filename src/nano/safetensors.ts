/** Minimal safetensors reader (F16 → Float32Array). Format:
 *  [u64 LE header length][JSON header][raw tensor data]
 *  header: { name: { dtype, shape, data_offsets: [start, end] } }
 */

export interface NanoTensor {
  shape: number[];
  data: Float32Array;
}

export function f16ToF32(u16: number): number {
  const sign = (u16 & 0x8000) ? -1 : 1;
  const exp = (u16 >> 10) & 0x1f;
  const frac = u16 & 0x3ff;
  if (exp === 0) return sign * frac * 2 ** -24; // subnormal
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * (1 + frac / 1024) * 2 ** (exp - 15);
}

export function parseSafetensors(buf: ArrayBuffer): Map<string, NanoTensor> {
  const view = new DataView(buf);
  const headerLen = Number(view.getBigUint64(0, true));
  const headerJson = new TextDecoder().decode(new Uint8Array(buf, 8, headerLen));
  const header = JSON.parse(headerJson) as Record<
    string,
    { dtype: string; shape: number[]; data_offsets: [number, number] }
  >;
  const base = 8 + headerLen;

  const tensors = new Map<string, NanoTensor>();
  for (const [name, info] of Object.entries(header)) {
    if (name === "__metadata__") continue;
    if (info.dtype !== "F16") throw new Error(`unsupported dtype ${info.dtype} for ${name}`);
    const [start, end] = info.data_offsets;
    const u16 = new Uint16Array(buf, base + start, (end - start) / 2);
    const f32 = new Float32Array(u16.length);
    for (let i = 0; i < u16.length; i++) f32[i] = f16ToF32(u16[i]);
    tensors.set(name, { shape: info.shape, data: f32 });
  }
  return tensors;
}
