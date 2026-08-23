/**
 * Module 1's live data — the sentences, chips and strips fed to the GPT-2
 * byte-pair tokenizer (the nano model's vocabulary, the Chopper's
 * `engine.tokenize`). English in every locale, on purpose: the tokenizer
 * and the model only ever saw English, and the lesson pages say so.
 *
 * Every cut below was measured on `Xenova/gpt2` (no special tokens) on
 * VERIFIED_ON with the script in REVIEW-CLASSROOM-1.md; the unplugged
 * answer key is rendered from these arrays, never retyped. ␣ marks a space
 * that is part of the piece. test/classroom-content.test.ts checks that the
 * pieces re-join to the strip text and that ids pair with pieces.
 */

export const VERIFIED_ON = "2026-08-22";

/** Hook: a deliberately ordinary sentence with one surprise (restart·ed; ␣Chromebook whole). */
export const HOOK_TEXT = "My Chromebook restarted during the quiz.";

/** Step 1 default — students replace it (can·'t is the visible surprise). */
export const STEP1_TEXT = "I can't wait for summer vacation!";

/**
 * Step 2 chips. Verified cuts: strawberry → st·raw·berry (3);
 * ␣strawberry → one piece; Wednesday → one piece; wednesday → wed·nesday (2);
 * 2024 → 20·24; 20245 → 20·245.
 */
export const STEP2_PRESETS = ["strawberry", " strawberry", "Wednesday", "wednesday", "2024", "20245"];

/** Step 3 X-ray defaults (GPT-2: st #301 · raw #1831 · berry #8396). */
export const XRAY_WORD = "strawberry";
export const XRAY_LETTER = "r";

/**
 * Block extension chips. Verified: 我喜欢吃草莓。 → 17 byte-pieces for 7
 * characters; Me gusta la fresa. → 7 pieces (gust·a, f·resa); 🍓🍓 → 6 byte
 * pieces (3 per emoji); naïve café → 3 (na·ïve·␣café, the accents as bytes).
 */
export const EXTENSION_TEXT = "我喜欢吃草莓。";
export const EXTENSION_PRESETS = ["我喜欢吃草莓。", "Me gusta la fresa.", "🍓🍓", "naïve café"];

export interface Strip {
  text: string;
  words: number;
  /** The real cuts, ␣ = a space that belongs to the piece. */
  pieces: string[];
  /** GPT-2 ids, one per piece — what the model actually receives. */
  ids: number[];
}

/** The three scissors strips — chosen so the real cuts surprise (a weekday in three, a grandmother in two). */
export const UNPLUGGED_STRIPS: readonly Strip[] = [
  {
    text: "Our basketball team practices on Wednesdays.",
    words: 6,
    pieces: ["Our", "␣basketball", "␣team", "␣practices", "␣on", "␣Wed", "nes", "days", "."],
    ids: [5122, 9669, 1074, 6593, 319, 3300, 2516, 12545, 13],
  },
  {
    text: "Grandma's lasagna recipe is unbeatable.",
    words: 5,
    pieces: ["Grand", "ma", "'s", "␣las", "agna", "␣recipe", "␣is", "␣unbeat", "able", "."],
    ids: [23581, 2611, 338, 39990, 48669, 8364, 318, 36499, 540, 13],
  },
  {
    text: "The skateboarder landed an impossible trick.",
    words: 6,
    pieces: ["The", "␣skate", "board", "er", "␣landed", "␣an", "␣impossible", "␣trick", "."],
    ids: [464, 22647, 3526, 263, 11406, 281, 5340, 6908, 13],
  },
];

/** The block-extension strip: a 中文 sentence the tokenizer shatters into bytes. */
export const EXTENSION_STRIP = { text: "我喜欢吃草莓。", chars: 7, pieces: 17 } as const;

/** Re-join a strip's pieces into its text (␣ → space). */
export function joinPieces(pieces: readonly string[]): string {
  return pieces.map((p) => p.replace(/␣/g, " ")).join("");
}

/** Placeholder origin for the Canvas/Schoology iframe snippet until the canonical domain exists (phase 4). */
export const EMBED_ORIGIN_PLACEHOLDER = "https://classroom.YOUR-DOMAIN";
