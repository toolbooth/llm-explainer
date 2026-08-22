import { useCallback, useEffect, useRef, useState } from "react";
import { displayPiece, type Engine } from "../lib/engine";
import { getNano, type NanoHandle } from "../lib/nanoEngine";
import { nearestNeighbors } from "nano-lm";
import { useStrings } from "../content/i18n";

interface TokenCard {
  piece: string;
  id: number;
  neighbors: { label: string; sim: number }[];
}

export default function WordMap(props: { engine: Engine }) {
  const t = useStrings();
  const [text, setText] = useState("dragon princess forest");
  const [cards, setCards] = useState<TokenCard[]>([]);
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const nanoRef = useRef<NanoHandle | null>(null);

  useEffect(() => {
    getNano(setLoadPct).then((h) => {
      nanoRef.current = h;
      setReady(true);
    });
  }, []);

  const explore = useCallback(
    async (t: string) => {
      const nano = nanoRef.current;
      if (!nano) return;
      const words = t.split(/\s+/).filter(Boolean).slice(0, 6);
      const wte = nano.wte();
      const out: TokenCard[] = [];
      for (const word of words) {
        // Look up the mid-sentence variant (" word") — it's the one the model
        // actually saw during training. Sentence-initial bare tokens are rare
        // and their embeddings are undertrained (see Act 1's position lesson).
        let pieces = await props.engine.tokenize(" " + word);
        if (pieces.length !== 1) pieces = (await props.engine.tokenize(word)).slice(0, 2);
        for (const p of pieces) {
          const raw = nearestNeighbors(wte, nano.meta.hidden, p.id, 14, {
            minId: 256,
            maxId: 30000,
          });
          const labels = await Promise.all(raw.map((n) => props.engine.decode([n.id])));
          const neighbors = raw
            .map((n, i) => ({ label: labels[i], sim: n.sim }))
            .filter((n) => n.label.trim().length > 0)
            .slice(0, 8);
          out.push({ piece: displayPiece(p.text).trim() || "␣", id: p.id, neighbors });
        }
      }
      setCards(out.slice(0, 6));
    },
    [props.engine]
  );

  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => explore(text), 350);
    return () => clearTimeout(id);
  }, [text, ready, explore]);

  return (
    <div className="widget" id="act-2">
      <div className="widget-head">
        <span className="act-num">{t.act2.num}</span>
        <span className="widget-title">{t.act2.title}</span>
      </div>

      {!ready ? (
        <p className="dim">{t.act2.loading(loadPct)}</p>
      ) : (
        <>
          <input
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            placeholder={t.act2.placeholder}
          />
          <div className="wordmap">
            {cards.map((c, i) => (
              <div className="wm-card" key={i}>
                <p className="wm-token">
                  {c.piece} <span className="tok-id">#{c.id}</span>
                </p>
                {c.neighbors.map((n, j) => (
                  <div className="wm-row" key={j}>
                    <span className="wm-label">{n.label.trim() || "␣"}</span>
                    <div className="wm-track">
                      <div className="wm-fill" style={{ width: `${Math.max(2, n.sim * 100)}%` }} />
                    </div>
                    <span className="wm-sim">{n.sim.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="widget-note">{t.act2.note()}</p>
    </div>
  );
}
