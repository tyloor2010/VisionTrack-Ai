import { useEffect, useState } from "react";

export type CycleLayer = { src: string; kind: "video" | "img"; poster?: string };

/**
 * Cross-fades between photos, GIFs or clips. Only the current and the
 * previous (fading-out) layer are mounted, so the browser never decodes
 * every GIF/video at once — that's what caused stutter.
 */
export function MediaCycle({
  layers,
  intervalMs = 6000,
  className = "",
}: {
  layers: CycleLayer[];
  intervalMs?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  // Preload the next image so it's ready before it fades in.
  useEffect(() => {
    const next = layers[(i + 1) % layers.length];
    if (next && next.kind === "img") {
      const im = new Image();
      im.src = next.src;
    }
  }, [i, layers]);

  useEffect(() => {
    if (layers.length < 2) return;
    const id = setInterval(() => {
      setI((v) => {
        setPrev(v);
        return (v + 1) % layers.length;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [layers.length, intervalMs]);

  // Unmount the old layer once its fade has finished.
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 1300);
    return () => clearTimeout(t);
  }, [prev]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {layers.map((l, k) => {
        if (k !== i && k !== prev) return null;
        const active = k === i;
        return (
          <div
            key={l.src + k}
            className="absolute inset-0 will-change-[opacity]"
            style={{ animation: active ? "vt-fade-in 1200ms ease-out both" : undefined, zIndex: active ? 1 : 0 }}
          >
            {l.kind === "video" ? (
              <video src={l.src} poster={l.poster} autoPlay muted loop playsInline preload="auto" className="h-full w-full object-cover" />
            ) : (
              <img src={l.src} alt="" decoding="async" className="h-full w-full object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
