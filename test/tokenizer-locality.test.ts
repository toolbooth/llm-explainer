import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CLASSROOM } from "../src/classroom/config";
import { SHARED_TOKENIZER_FILES, SHARED_TOKENIZER_PATH, loadSharedTokenizer } from "../src/lib/engine";

/**
 * PRODUCT.md §6.2: a classroom page makes "no third-party endpoints at all
 * after load". The shared GPT-2 tokenizer used to come from huggingface.co at
 * runtime; it is now vendored under public/tokenizers/gpt2/ and built with
 * the GPT2Tokenizer constructor from two same-origin fetches. This file pins
 * (1) the path shape, (2) the files and their byte sizes (the §6.1 budget),
 * (3) that loadSharedTokenizer() touches exactly those two root-relative
 * URLs and nothing else, and (4) that the vendored files tokenize like the
 * hub copy did ("The cat sat on the" → the flagship's well-known ids).
 */
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

describe("shared tokenizer locality", () => {
  it("the shared tokenizer path is root-relative on this origin — no scheme, no host", () => {
    expect(SHARED_TOKENIZER_PATH.startsWith("/")).toBe(true);
    expect(SHARED_TOKENIZER_PATH.startsWith("//")).toBe(false);
    expect(SHARED_TOKENIZER_PATH).not.toMatch(/^[a-z]+:/i);
    expect(SHARED_TOKENIZER_PATH).not.toContain("huggingface");
    expect(SHARED_TOKENIZER_PATH).not.toContain("Xenova");
    expect(CLASSROOM.assets.tokenizer.path).toBe(SHARED_TOKENIZER_PATH);
    expect(SHARED_TOKENIZER_FILES).toEqual(["tokenizer.json", "tokenizer_config.json"]);
  });

  it("the vendored files exist with the byte sizes the budget declares, and the whole set fits §6.1", () => {
    let total = 0;
    for (const asset of [CLASSROOM.assets.tokenizer, CLASSROOM.assets.weights]) {
      for (const [file, bytes] of Object.entries(asset.files)) {
        const size = statSync(join(PUBLIC, asset.path, file)).size;
        expect({ file, size }).toEqual({ file, size: bytes });
        total += size;
      }
      // nothing unexpected ships in those directories
      expect(readdirSync(join(PUBLIC, asset.path)).sort()).toEqual(Object.keys(asset.files).sort());
    }
    expect(total / 1e6).toBeLessThan(CLASSROOM.assets.budgetMB);
    expect(Object.keys(CLASSROOM.assets.tokenizer.files)).toEqual([...SHARED_TOKENIZER_FILES]);
  });

  it("no classroom source (or the engine's shared-tokenizer path) goes through the hub", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|css)$/.test(name)) files.push(p);
      }
    };
    walk(join(ROOT, "src/classroom"));
    expect(files.length).toBeGreaterThan(10);
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      expect(src, f).not.toContain("huggingface.co");
      expect(src, f).not.toContain("from_pretrained");
    }
    // engine.ts: the shared tokenizer never uses AutoTokenizer; only the Act-4 model does.
    const engine = readFileSync(join(ROOT, "src/lib/engine.ts"), "utf8");
    expect(engine.match(/AutoTokenizer\.from_pretrained\(/g)?.length).toBe(1);
    expect(engine).toContain("AutoTokenizer.from_pretrained(MODEL)");
    expect(engine).not.toContain('"Xenova/gpt2"');
  });

  describe("loadSharedTokenizer()", () => {
    const realFetch = globalThis.fetch;
    afterEach(() => {
      globalThis.fetch = realFetch;
    });

    it("fetches exactly the two root-relative files and tokenizes like the hub copy", async () => {
      const requested: string[] = [];
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        requested.push(url);
        // A root-relative URL has no host: serve it from public/. Anything
        // else (a scheme, a host) is exactly what must never happen.
        if (!url.startsWith("/") || url.startsWith("//")) throw new Error(`non-local fetch: ${url}`);
        return new Response(readFileSync(join(PUBLIC, url)), { status: 200 });
      }) as typeof fetch;

      const tok = await loadSharedTokenizer();
      expect(requested.sort()).toEqual(
        SHARED_TOKENIZER_FILES.map((f) => `${SHARED_TOKENIZER_PATH}/${f}`).sort()
      );

      const ids = (s: string) => Array.from(tok(s, { add_special_tokens: false }).input_ids.data as BigInt64Array).map(Number);
      expect(ids("The cat sat on the")).toEqual([464, 3797, 3332, 319, 262]);
      expect(ids("Once upon a time")).toEqual([7454, 2402, 257, 640]);
      expect(tok.tokenize("The cat sat on the")).toEqual(["The", "Ġcat", "Ġsat", "Ġon", "Ġthe"]);
      // Module 1's measured cuts still hold on the vendored files
      expect(tok.tokenize("strawberry")).toEqual(["st", "raw", "berry"]);
      expect(ids("strawberry")).toEqual([301, 1831, 8396]);
      expect(tok.decode([464, 3797])).toBe("The cat");
      // the vocabulary is the nano model's: GPT-2's 50,257 entries, <|endoftext|> last
      expect(tok.convert_tokens_to_ids(["Ġcat", "<|endoftext|>"])).toEqual([3797, 50256]);
      expect(tok.model_max_length).toBe(1024);
    }, 30000);
  });
});
