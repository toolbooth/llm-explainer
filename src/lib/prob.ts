/** Probability helpers now live in the extracted nano-lm library; re-exported
 *  here so widgets keep importing from "../lib/prob". */
export { sampleFrom, softmaxTopK, type TokenProb } from "nano-lm";
