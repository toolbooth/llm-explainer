/**
 * Module 2's live data — the prompts the page feeds the nano model, and
 * every number the prose, the guide's answer key, the unplugged dice
 * tables and the slides quote. English in every locale, on purpose (the
 * model only ever read English; the model card says so on every page).
 *
 * Every probability below was MEASURED on VERIFIED_ON by running
 * TinyStories-1M (public/weights/) through nano-lm on the vendored GPT-2
 * tokenizer, with the same `distributionAt` (top-10, temperature softmax)
 * the widgets use — see test/classroom-content.test.ts, which re-runs the
 * model and fails if any number here drifts. The seeded roll counts come
 * from `rollMany` with `mulberry32(ROLL_SEED)`, so the answer key's
 * "what happened in our run" lines are reproducible, not remembered.
 * Nothing in the page is computed from this file at run time except the
 * printable's tables and the slides' bars; the widgets run the model live.
 */

export const VERIFIED_ON = "2026-08-22";

/** Hook (projector) and Steps 1–2 default — flat enough that the favourite wins only about one roll in five. */
export const HOOK_TEXT = "The cat sat on the";
/** Steps 1–2 chips: one flat prompt, two confident ones, one in between. */
export const STEP_PRESETS = ["The cat sat on the", "Tom and Lily went to the", "The sun was very", "One day, a boy named"];
/** Step 3 (TheLoop) default. */
export const LOOP_PROMPT = "Once upon a time";
/** Block extension chips: sentences that sound like facts to a model that has only read stories. */
export const EXTENSION_PRESETS = ["The capital of France is", "Two plus two is", "The sky is"];

/** One bar: GPT-2 id, the decoded piece (leading space included), probability at that temperature. */
export interface Candidate {
  id: number;
  label: string;
  p: number;
}

/** A prompt's measured top-10 at the three temperatures the lesson names. */
export interface MeasuredPrompt {
  text: string;
  ids: number[];
  t05: Candidate[];
  t10: Candidate[];
  t15: Candidate[];
}

export const MEASURED = {
  hook: {
    text: "The cat sat on the",
    ids: [464, 3797, 3332, 319, 262],
    t05: [
      { id: 8701, label: " grass", p: 0.3643 },
      { id: 18507, label: " couch", p: 0.1784 },
      { id: 5509, label: " tree", p: 0.1374 },
      { id: 2323, label: " ground", p: 0.1053 },
      { id: 4314, label: " floor", p: 0.1036 },
      { id: 7624, label: " bench", p: 0.0330 },
      { id: 8478, label: " branch", p: 0.0220 },
      { id: 3084, label: " table", p: 0.0205 },
      { id: 34902, label: " sofa", p: 0.0178 },
      { id: 5118, label: " chair", p: 0.0177 },
    ],
    t10: [
      { id: 8701, label: " grass", p: 0.2169 },
      { id: 18507, label: " couch", p: 0.1518 },
      { id: 5509, label: " tree", p: 0.1332 },
      { id: 2323, label: " ground", p: 0.1166 },
      { id: 4314, label: " floor", p: 0.1157 },
      { id: 7624, label: " bench", p: 0.0653 },
      { id: 8478, label: " branch", p: 0.0532 },
      { id: 3084, label: " table", p: 0.0515 },
      { id: 34902, label: " sofa", p: 0.0480 },
      { id: 5118, label: " chair", p: 0.0478 },
    ],
    t15: [
      { id: 8701, label: " grass", p: 0.1729 },
      { id: 18507, label: " couch", p: 0.1362 },
      { id: 5509, label: " tree", p: 0.1249 },
      { id: 2323, label: " ground", p: 0.1143 },
      { id: 4314, label: " floor", p: 0.1137 },
      { id: 7624, label: " bench", p: 0.0776 },
      { id: 8478, label: " branch", p: 0.0678 },
      { id: 3084, label: " table", p: 0.0663 },
      { id: 34902, label: " sofa", p: 0.0633 },
      { id: 5118, label: " chair", p: 0.0631 },
    ],
  },
  grass: {
    text: "The cat sat on the grass",
    ids: [464, 3797, 3332, 319, 262, 8701],
    t05: [
      { id: 290, label: " and", p: 0.9817 },
      { id: 13, label: ".", p: 0.0150 },
      { id: 11, label: ",", p: 0.0019 },
      { id: 287, label: " in", p: 0.0006 },
      { id: 284, label: " to", p: 0.0005 },
      { id: 351, label: " with", p: 0.0002 },
      { id: 618, label: " when", p: 0.0001 },
      { id: 88, label: "y", p: 0.0000 },
      { id: 981, label: " while", p: 0.0000 },
      { id: 319, label: " on", p: 0.0000 },
    ],
    t10: [
      { id: 290, label: " and", p: 0.7967 },
      { id: 13, label: ".", p: 0.0984 },
      { id: 11, label: ",", p: 0.0346 },
      { id: 287, label: " in", p: 0.0199 },
      { id: 284, label: " to", p: 0.0180 },
      { id: 351, label: " with", p: 0.0116 },
      { id: 618, label: " when", p: 0.0060 },
      { id: 88, label: "y", p: 0.0055 },
      { id: 981, label: " while", p: 0.0050 },
      { id: 319, label: " on", p: 0.0042 },
    ],
    t15: [
      { id: 290, label: " and", p: 0.5762 },
      { id: 13, label: ".", p: 0.1429 },
      { id: 11, label: ",", p: 0.0712 },
      { id: 287, label: " in", p: 0.0493 },
      { id: 284, label: " to", p: 0.0461 },
      { id: 351, label: " with", p: 0.0343 },
      { id: 618, label: " when", p: 0.0222 },
      { id: 88, label: "y", p: 0.0209 },
      { id: 981, label: " while", p: 0.0195 },
      { id: 319, label: " on", p: 0.0174 },
    ],
  },
  grassAnd: {
    text: "The cat sat on the grass and",
    ids: [464, 3797, 3332, 319, 262, 8701, 290],
    t05: [
      { id: 7342, label: " watched", p: 0.2882 },
      { id: 2067, label: " started", p: 0.2121 },
      { id: 2936, label: " felt", p: 0.1560 },
      { id: 3114, label: " looked", p: 0.1268 },
      { id: 2497, label: " saw", p: 0.0693 },
      { id: 6807, label: " walked", p: 0.0650 },
      { id: 3332, label: " sat", p: 0.0331 },
      { id: 4966, label: " ran", p: 0.0216 },
      { id: 262, label: " the", p: 0.0160 },
      { id: 15063, label: " ate", p: 0.0119 },
    ],
    t10: [
      { id: 7342, label: " watched", p: 0.1896 },
      { id: 2067, label: " started", p: 0.1627 },
      { id: 2936, label: " felt", p: 0.1395 },
      { id: 3114, label: " looked", p: 0.1258 },
      { id: 2497, label: " saw", p: 0.0930 },
      { id: 6807, label: " walked", p: 0.0901 },
      { id: 3332, label: " sat", p: 0.0643 },
      { id: 4966, label: " ran", p: 0.0519 },
      { id: 262, label: " the", p: 0.0446 },
      { id: 15063, label: " ate", p: 0.0385 },
    ],
    t15: [
      { id: 7342, label: " watched", p: 0.1577 },
      { id: 2067, label: " started", p: 0.1423 },
      { id: 2936, label: " felt", p: 0.1285 },
      { id: 3114, label: " looked", p: 0.1199 },
      { id: 2497, label: " saw", p: 0.0980 },
      { id: 6807, label: " walked", p: 0.0960 },
      { id: 3332, label: " sat", p: 0.0767 },
      { id: 4966, label: " ran", p: 0.0664 },
      { id: 262, label: " the", p: 0.0601 },
      { id: 15063, label: " ate", p: 0.0545 },
    ],
  },
  park: {
    text: "Tom and Lily went to the",
    ids: [13787, 290, 20037, 1816, 284, 262],
    t05: [
      { id: 3952, label: " park", p: 0.9833 },
      { id: 3650, label: " store", p: 0.0071 },
      { id: 26626, label: " zoo", p: 0.0027 },
      { id: 1097, label: " car", p: 0.0020 },
      { id: 4436, label: " hospital", p: 0.0012 },
      { id: 26728, label: " swings", p: 0.0010 },
      { id: 16723, label: " pond", p: 0.0009 },
      { id: 9592, label: " kitchen", p: 0.0007 },
      { id: 11376, label: " garden", p: 0.0006 },
      { id: 13546, label: " lake", p: 0.0005 },
    ],
    t10: [
      { id: 3952, label: " park", p: 0.7384 },
      { id: 3650, label: " store", p: 0.0627 },
      { id: 26626, label: " zoo", p: 0.0386 },
      { id: 1097, label: " car", p: 0.0334 },
      { id: 4436, label: " hospital", p: 0.0256 },
      { id: 26728, label: " swings", p: 0.0234 },
      { id: 16723, label: " pond", p: 0.0220 },
      { id: 9592, label: " kitchen", p: 0.0204 },
      { id: 11376, label: " garden", p: 0.0187 },
      { id: 13546, label: " lake", p: 0.0168 },
    ],
    t15: [
      { id: 3952, label: " park", p: 0.4950 },
      { id: 3650, label: " store", p: 0.0957 },
      { id: 26626, label: " zoo", p: 0.0693 },
      { id: 1097, label: " car", p: 0.0628 },
      { id: 4436, label: " hospital", p: 0.0527 },
      { id: 26728, label: " swings", p: 0.0495 },
      { id: 16723, label: " pond", p: 0.0475 },
      { id: 9592, label: " kitchen", p: 0.0452 },
      { id: 11376, label: " garden", p: 0.0427 },
      { id: 13546, label: " lake", p: 0.0398 },
    ],
  },
  sun: {
    text: "The sun was very",
    ids: [464, 4252, 373, 845],
    t05: [
      { id: 3772, label: " happy", p: 0.3861 },
      { id: 3024, label: " hot", p: 0.2624 },
      { id: 6016, label: " bright", p: 0.1138 },
      { id: 5814, label: " warm", p: 0.1004 },
      { id: 4692, label: " cold", p: 0.0837 },
      { id: 4950, label: " beautiful", p: 0.0126 },
      { id: 2495, label: " pretty", p: 0.0113 },
      { id: 2705, label: " soft", p: 0.0109 },
      { id: 9583, label: " wet", p: 0.0095 },
      { id: 1263, label: " big", p: 0.0092 },
    ],
    t10: [
      { id: 3772, label: " happy", p: 0.2396 },
      { id: 3024, label: " hot", p: 0.1975 },
      { id: 6016, label: " bright", p: 0.1301 },
      { id: 5814, label: " warm", p: 0.1221 },
      { id: 4692, label: " cold", p: 0.1115 },
      { id: 4950, label: " beautiful", p: 0.0432 },
      { id: 2495, label: " pretty", p: 0.0410 },
      { id: 2705, label: " soft", p: 0.0403 },
      { id: 9583, label: " wet", p: 0.0376 },
      { id: 1263, label: " big", p: 0.0371 },
    ],
    t15: [
      { id: 3772, label: " happy", p: 0.1888 },
      { id: 3024, label: " hot", p: 0.1660 },
      { id: 6016, label: " bright", p: 0.1257 },
      { id: 5814, label: " warm", p: 0.1205 },
      { id: 4692, label: " cold", p: 0.1134 },
      { id: 4950, label: " beautiful", p: 0.0603 },
      { id: 2495, label: " pretty", p: 0.0583 },
      { id: 2705, label: " soft", p: 0.0576 },
      { id: 9583, label: " wet", p: 0.0549 },
      { id: 1263, label: " big", p: 0.0544 },
    ],
  },
  boy: {
    text: "One day, a boy named",
    ids: [3198, 1110, 11, 257, 2933, 3706],
    t05: [
      { id: 5045, label: " Tim", p: 0.9737 },
      { id: 4186, label: " Tom", p: 0.0244 },
      { id: 19919, label: " Tommy", p: 0.0007 },
      { id: 3619, label: " Jack", p: 0.0006 },
      { id: 5436, label: " Max", p: 0.0003 },
      { id: 3409, label: " Sam", p: 0.0001 },
      { id: 15890, label: " Billy", p: 0.0001 },
      { id: 20037, label: " Lily", p: 0.0001 },
      { id: 3932, label: " Ben", p: 0.0000 },
      { id: 15470, label: " Johnny", p: 0.0000 },
    ],
    t10: [
      { id: 5045, label: " Tim", p: 0.7915 },
      { id: 4186, label: " Tom", p: 0.1254 },
      { id: 19919, label: " Tommy", p: 0.0215 },
      { id: 3619, label: " Jack", p: 0.0199 },
      { id: 5436, label: " Max", p: 0.0128 },
      { id: 3409, label: " Sam", p: 0.0084 },
      { id: 15890, label: " Billy", p: 0.0081 },
      { id: 20037, label: " Lily", p: 0.0058 },
      { id: 3932, label: " Ben", p: 0.0038 },
      { id: 15470, label: " Johnny", p: 0.0029 },
    ],
    t15: [
      { id: 5045, label: " Tim", p: 0.5821 },
      { id: 4186, label: " Tom", p: 0.1704 },
      { id: 19919, label: " Tommy", p: 0.0527 },
      { id: 3619, label: " Jack", p: 0.0499 },
      { id: 5436, label: " Max", p: 0.0372 },
      { id: 3409, label: " Sam", p: 0.0280 },
      { id: 15890, label: " Billy", p: 0.0275 },
      { id: 20037, label: " Lily", p: 0.0219 },
      { id: 3932, label: " Ben", p: 0.0166 },
      { id: 15470, label: " Johnny", p: 0.0137 },
    ],
  },
  loop: {
    text: "Once upon a time",
    ids: [7454, 2402, 257, 640],
    t05: [
      { id: 11, label: ",", p: 0.8534 },
      { id: 612, label: " there", p: 0.1465 },
      { id: 287, label: " in", p: 0.0000 },
      { id: 2712, label: " playing", p: 0.0000 },
      { id: 379, label: " at", p: 0.0000 },
      { id: 6155, label: " walking", p: 0.0000 },
      { id: 257, label: " a", p: 0.0000 },
      { id: 673, label: " she", p: 0.0000 },
      { id: 994, label: " here", p: 0.0000 },
      { id: 1909, label: " today", p: 0.0000 },
    ],
    t10: [
      { id: 11, label: ",", p: 0.6979 },
      { id: 612, label: " there", p: 0.2892 },
      { id: 287, label: " in", p: 0.0032 },
      { id: 2712, label: " playing", p: 0.0023 },
      { id: 379, label: " at", p: 0.0021 },
      { id: 6155, label: " walking", p: 0.0015 },
      { id: 257, label: " a", p: 0.0014 },
      { id: 673, label: " she", p: 0.0010 },
      { id: 994, label: " here", p: 0.0010 },
      { id: 1909, label: " today", p: 0.0006 },
    ],
    t15: [
      { id: 11, label: ",", p: 0.5909 },
      { id: 612, label: " there", p: 0.3284 },
      { id: 287, label: " in", p: 0.0162 },
      { id: 2712, label: " playing", p: 0.0129 },
      { id: 379, label: " at", p: 0.0125 },
      { id: 6155, label: " walking", p: 0.0097 },
      { id: 257, label: " a", p: 0.0092 },
      { id: 673, label: " she", p: 0.0074 },
      { id: 994, label: " here", p: 0.0074 },
      { id: 1909, label: " today", p: 0.0054 },
    ],
  },
  france: {
    text: "The capital of France is",
    ids: [464, 3139, 286, 4881, 318],
    t05: [
      { id: 845, label: " very", p: 0.5788 },
      { id: 257, label: " a", p: 0.2601 },
      { id: 407, label: " not", p: 0.0378 },
      { id: 546, label: " about", p: 0.0333 },
      { id: 262, label: " the", p: 0.0301 },
      { id: 523, label: " so", p: 0.0257 },
      { id: 287, label: " in", p: 0.0122 },
      { id: 3772, label: " happy", p: 0.0118 },
      { id: 329, label: " for", p: 0.0067 },
      { id: 1165, label: " too", p: 0.0035 },
    ],
    t10: [
      { id: 845, label: " very", p: 0.3249 },
      { id: 257, label: " a", p: 0.2178 },
      { id: 407, label: " not", p: 0.0830 },
      { id: 546, label: " about", p: 0.0780 },
      { id: 262, label: " the", p: 0.0741 },
      { id: 523, label: " so", p: 0.0685 },
      { id: 287, label: " in", p: 0.0471 },
      { id: 3772, label: " happy", p: 0.0464 },
      { id: 329, label: " for", p: 0.0351 },
      { id: 1165, label: " too", p: 0.0251 },
    ],
    t15: [
      { id: 845, label: " very", p: 0.2359 },
      { id: 257, label: " a", p: 0.1807 },
      { id: 407, label: " not", p: 0.0950 },
      { id: 546, label: " about", p: 0.0911 },
      { id: 262, label: " the", p: 0.0881 },
      { id: 523, label: " so", p: 0.0835 },
      { id: 287, label: " in", p: 0.0651 },
      { id: 3772, label: " happy", p: 0.0644 },
      { id: 329, label: " for", p: 0.0535 },
      { id: 1165, label: " too", p: 0.0428 },
    ],
  },
  twoPlusTwo: {
    text: "Two plus two is",
    ids: [7571, 5556, 734, 318],
    t05: [
      { id: 257, label: " a", p: 0.3738 },
      { id: 845, label: " very", p: 0.1550 },
      { id: 14143, label: " counting", p: 0.1312 },
      { id: 13, label: ".", p: 0.0939 },
      { id: 352, label: " 1", p: 0.0892 },
      { id: 1115, label: " three", p: 0.0539 },
      { id: 287, label: " in", p: 0.0401 },
      { id: 1440, label: " four", p: 0.0251 },
      { id: 2237, label: " six", p: 0.0196 },
      { id: 3598, label: " seven", p: 0.0183 },
    ],
    t10: [
      { id: 257, label: " a", p: 0.2154 },
      { id: 845, label: " very", p: 0.1387 },
      { id: 14143, label: " counting", p: 0.1276 },
      { id: 13, label: ".", p: 0.1079 },
      { id: 352, label: " 1", p: 0.1052 },
      { id: 1115, label: " three", p: 0.0818 },
      { id: 287, label: " in", p: 0.0705 },
      { id: 1440, label: " four", p: 0.0558 },
      { id: 2237, label: " six", p: 0.0493 },
      { id: 3598, label: " seven", p: 0.0477 },
    ],
    t15: [
      { id: 257, label: " a", p: 0.1710 },
      { id: 845, label: " very", p: 0.1275 },
      { id: 14143, label: " counting", p: 0.1206 },
      { id: 13, label: ".", p: 0.1079 },
      { id: 352, label: " 1", p: 0.1060 },
      { id: 1115, label: " three", p: 0.0897 },
      { id: 287, label: " in", p: 0.0812 },
      { id: 1440, label: " four", p: 0.0695 },
      { id: 2237, label: " six", p: 0.0640 },
      { id: 3598, label: " seven", p: 0.0626 },
    ],
  },
  sky: {
    text: "The sky is",
    ids: [464, 6766, 318],
    t05: [
      { id: 845, label: " very", p: 0.7397 },
      { id: 523, label: " so", p: 0.0984 },
      { id: 257, label: " a", p: 0.0802 },
      { id: 287, label: " in", p: 0.0273 },
      { id: 6016, label: " bright", p: 0.0159 },
      { id: 3772, label: " happy", p: 0.0113 },
      { id: 612, label: " there", p: 0.0076 },
      { id: 991, label: " still", p: 0.0070 },
      { id: 4950, label: " beautiful", p: 0.0065 },
      { id: 1165, label: " too", p: 0.0061 },
    ],
    t10: [
      { id: 845, label: " very", p: 0.3938 },
      { id: 523, label: " so", p: 0.1436 },
      { id: 257, label: " a", p: 0.1297 },
      { id: 287, label: " in", p: 0.0756 },
      { id: 6016, label: " bright", p: 0.0578 },
      { id: 3772, label: " happy", p: 0.0488 },
      { id: 612, label: " there", p: 0.0398 },
      { id: 991, label: " still", p: 0.0383 },
      { id: 4950, label: " beautiful", p: 0.0369 },
      { id: 1165, label: " too", p: 0.0357 },
    ],
    t15: [
      { id: 845, label: " very", p: 0.2715 },
      { id: 523, label: " so", p: 0.1386 },
      { id: 257, label: " a", p: 0.1295 },
      { id: 287, label: " in", p: 0.0904 },
      { id: 6016, label: " bright", p: 0.0756 },
      { id: 3772, label: " happy", p: 0.0674 },
      { id: 612, label: " there", p: 0.0589 },
      { id: 991, label: " still", p: 0.0574 },
      { id: 4950, label: " beautiful", p: 0.0560 },
      { id: 1165, label: " too", p: 0.0547 },
    ],
  },
} satisfies Record<string, MeasuredPrompt>;

/**
 * The unplugged dice tables: three positions along the "favourite" spine
 * (each table assumes the likeliest word was rolled in the one before —
 * the printable says what to do if it wasn't). Cells are allocated at
 * render time by diceCells() from these T = 1.0 probabilities.
 */
export const DICE_TABLES: readonly { prompt: MeasuredPrompt; picked: string | null }[] = [
  { prompt: MEASURED.hook, picked: " grass" },
  { prompt: MEASURED.grass, picked: " and" },
  { prompt: MEASURED.grassAnd, picked: null },
];

/** Seed of the reproducible runs quoted in the guide (mulberry32). */
export const ROLL_SEED = 2026;

/** 100 seeded rolls on the hook prompt at each temperature — counts in the order of the t05/t10/t15 arrays above. */
export const HOOK_RUNS = {
  t05: [36, 13, 16, 7, 9, 5, 3, 5, 5, 1],
  t10: [22, 15, 12, 9, 8, 8, 4, 4, 9, 9],
  t15: [15, 19, 8, 7, 13, 4, 9, 5, 8, 12],
} as const;

/** The favourite's count in ten independent 100-roll runs at T = 1 (seeds 1000…1009): the spread students should expect. */
export const TEN_RUNS_FAVOURITE = [27, 18, 24, 21, 20, 24, 24, 23, 20, 17] as const;
/** Total-variation distance (rolls vs model) in those ten runs. */
export const TEN_RUNS_TVD = [0.133, 0.058, 0.1, 0.094, 0.113, 0.088, 0.134, 0.088, 0.083, 0.138] as const;
/** 1,000 seeded rolls (seed 7) at T = 1: the favourite's count and the distance — what "converging" looks like. */
export const THOUSAND_ROLLS = { favourite: 198, tvd: 0.052, seed: 7 } as const;
/** 100 seeded rolls (ROLL_SEED) on the confident prompt "Tom and Lily went to the" at T = 1. */
export const PARK_RUN = [66, 8, 3, 3, 1, 5, 3, 5, 5, 1] as const;

/** Placeholder origin for the Canvas/Schoology iframe snippet until the canonical domain exists (phase 4). */
export const EMBED_ORIGIN_PLACEHOLDER = "https://classroom.YOUR-DOMAIN";

/** "22%" — one place for the rounding the prose uses. */
export function pct(p: number): string {
  return `${Math.round(p * 100)}%`;
}
