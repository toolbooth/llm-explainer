# DOM baseline hashes

Byte-identity baseline for every page in the series: `sha256` of
`document.getElementById("root").innerHTML`, loaded fresh under
`?mockModel=1&lang=<lang>` (no real weights, so the DOM is deterministic),
1280×800 viewport, hashed 2.5 s after `load`. Recompute before and after any
change that is supposed to leave a page untouched (widget lifts, shared-style
edits, series furniture) and compare against the rows below; when a page is
*meant* to change, update its row here in the same commit.

## Current baseline

Recorded 2026-08-22 from the working tree of the commit that adds this file
(`git log --diff-filter=A --format=%h -- HASHES.md`); parent commit `6279a98`.
The flagship changed deliberately in that commit (the "Cite this" block was
added after the `MoreInSeries` slot, before the footer); the three draft essays
are byte-identical to before.

| page | route | lang | sha256 of `#root` innerHTML | chars |
|---|---|---|---|---|
| flagship (Inside the Machine) | `/` | en | `0b213e5788a2dfcd2a1cc4af60934175463f2fd7606d9fe2f5c532a720bab3b3` | 20564 |
| flagship (Inside the Machine) | `/` | zh | `ef6cce52c483d59996d4d5cae6d0329c18bf002f5ca2a0f001959d29a2e17d31` | 15459 |
| #2 Why It Lies | `#/essays/why-it-lies` | en | `8a6cc20d60175a6dc866e218328bacbd3dd55a93fb3dcad17030c037d3e66fea` | 9724 |
| #2 Why It Lies | `#/essays/why-it-lies` | zh | `308034756efebfef28c88033ae543446b9320048b8629eee86b57b1e9f9f1d79` | 5393 |
| #3 The Attention-Head Field Guide | `#/essays/attention-heads` | en | `396f9fdbe1fd498c18f4846cc90fb37cb99adc55ad0868addb6b155b14dbda11` | 78680 |
| #3 The Attention-Head Field Guide | `#/essays/attention-heads` | zh | `c0cde6df74f55489530fffa7bebadf90b839ba78f37f5d1e48bee62d4c530696` | 69464 |
| #4 Why It Can't Count | `#/essays/why-it-cant-count` | en | `d21af9f6d0a6574404fd19ce2a59d1bbcd03bf835e3ff11c088d0c464c4c3100` | 12425 |
| #4 Why It Can't Count | `#/essays/why-it-cant-count` | zh | `fb7c5d8158db499ba44f02027a566d36ef3825c61e410a6305febee70d8391ce` | 7237 |

## Superseded: pre-domain flagship (commit before insidethemachine.org wiring, 2026-08-24)

Deliberate change: the Cite-this section's canonical URL moved from the interim
GitHub URL to https://insidethemachine.org (14 characters shorter, hence the
char-count drop). Essays #2–#4 untouched (reproduced).

| page | lang | sha256 | chars |
|---|---|---|---|
| flagship (Inside the Machine) | en | `680f675b2ece144ab394a306b0bf91a73bf695e30fb48b8c7ce139b8f32e9967` | 20578 |
| flagship (Inside the Machine) | zh | `bb4b603c6754e45dd4a09d3fef674ce91d5c0fff9261506c5605d62b0586f55c` | 15473 |

## Superseded: 中文 pages before full-width punctuation (commit `c823e61` and earlier)

Deliberate change 2026-08-23 after a reader's note: every 中文 table (and the
classroom tables/docs, which are not baselined here) had written 。 full-width
but ，：；？ and （） half-width. All four 中文 pages now use full-width
punctuation throughout; character counts are unchanged because every edit is a
one-for-one replacement. English pages untouched (reproduced).

| page | lang | sha256 | chars |
|---|---|---|---|
| flagship (Inside the Machine) | zh | `755119071b32966fb8b2fe7b1abaacaa4c6256e16e3c3d2abef9c44bc066312c` | 15473 |
| #2 Why It Lies | zh | `9a71fd61a3c0d218ab4c91acfde9bc02fa82c66c148b1002a66502a45277bcc6` | 5393 |
| #3 The Attention-Head Field Guide | zh | `d1af981b4f8c341b26205de6fe71602c2784d2bea0c6267de483c5b382584165` | 69464 |
| #4 Why It Can't Count | zh | `6a959e8f124a576feb9cdaff0110ce80bf2a7ed4aa8cfe2ae16bdcf01e3d1cf2` | 7237 |

## Superseded: essays #2–#4 before the Act/幕 relabel (commit `4be85e5` and earlier)

Deliberate series-wide change 2026-08-23: section labels §N / 第N节 → Act N / 第N幕
to match the flagship's seven-act framing. Flagship unchanged.

| page | lang | sha256 | chars |
|---|---|---|---|
| #2 Why It Lies | en | `2475a7799339f0035e2e4a593281726bc7a2d36402da2b2b6030b9a091fc197b` | 9694 |
| #2 Why It Lies | zh | `4276ba10b2e59769416c75fb9f1f36d1d38428cb170de88a4c6c6483d1ee0514` | 5393 |
| #3 The Attention-Head Field Guide | en | `9cb068c31f17d6ae19def54ddd76a2644f68030aa9dc735cdc9063fa5493f7c4` | 78656 |
| #3 The Attention-Head Field Guide | zh | `45e187666f3415dac2dc28aa1a9f1f58a33de339843d253b0ad5d2781861ef52` | 69464 |
| #4 Why It Can't Count | en | `71364230e5aba6be208e0ee31f3c99c639d864400319869278392e819c44fa28` | 12395 |
| #4 Why It Can't Count | zh | `009c3dac887ebdf82374619d1ecc756c26a23177b235400bafd10ebf1f3953e5` | 7237 |

## Superseded: pre-Act-3-transition flagship (commit `2308a84` and earlier)

Deliberate content change 2026-08-23: a second paragraph before Act 3 explaining
heads (16 parallel readers) and layers (8 passes), plus captions on the layer slider
and head buttons. Essays #2–#4 unchanged.

| page | lang | sha256 | chars |
|---|---|---|---|
| flagship | en | `23fe498576c91137e8bec6d58586417d61de36488731b853f178dfaf95c17e35` | 19738 |
| flagship | zh | `1316cfd39c624f901cef712a6f801ade3e9c653ca440a5adbe992c4a4e8cedb6` | 15113 |

## Superseded: pre-"Cite this" flagship (commit `6279a98` and earlier)

These are the flagship hashes every review since essay #2 checked against
(REVIEW-02/03/04.md). They are no longer expected to match.

| page | lang | sha256 of `#root` innerHTML | chars |
|---|---|---|---|
| flagship | en | `b5fe48916687390e319e226df23a9b14dd86cf082f9e33048429d7c60be30d96` | 19128 |
| flagship | zh | `c1097d95db3e466cfd9f61d6d6967f63f36a3a301dad203f49b728fd6aeea502` | 14551 |

## Recipe

Run on any page of the dev server (`npm run dev`), from the browser console.
It reproduces every hash above, including the superseded ones at `6279a98`.

```js
(async () => {
  const pages = [["flagship", ""], ["why-it-lies", "#/essays/why-it-lies"],
    ["attention-heads", "#/essays/attention-heads"], ["why-it-cant-count", "#/essays/why-it-cant-count"]];
  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))]
    .map((x) => x.toString(16).padStart(2, "0")).join("");
  const out = [];
  for (const [page, hash] of pages) for (const lang of ["en", "zh"]) {
    const f = document.createElement("iframe");
    f.style.cssText = "width:1280px;height:800px;position:fixed;left:0;top:0;opacity:0.01;pointer-events:none";
    f.src = `${location.origin}/?mockModel=1&lang=${lang}${hash}`;
    document.body.appendChild(f);
    await new Promise((r) => (f.onload = r));
    await new Promise((r) => setTimeout(r, 2500));
    const html = f.contentDocument.getElementById("root").innerHTML;
    out.push({ page, lang, hash: await sha(html), chars: html.length });
    f.remove();
  }
  console.table(out);
})();
```
