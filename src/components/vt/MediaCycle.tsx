import { useEffect, useState } from "react";

export type CycleLayer = { src: string; kind: "video" | "img"; poster?: string };

/**
 * Stacks several photos, GIFs or clips in the same frame and slowly cross
 * fades between them, so a backdrop keeps changing instead of sitting still.
 */
export function MediaCycle({
  layers,
  intervalMs = 5200,
  className = "",
}: {
  layers: CycleLayer[];
  intervalMs?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (layers.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % layers.length), intervalMs);
    return () => clearInterval(id);
  }, [layers.length, intervalMs]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {layers.map((l, k) => (
        <div
          key={l.src + k}
          className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
            k === i ? "opacity-100" : "opacity-0"
          }`}
        >
          {l.kind === "video" ? (
            <video
              src={l.src}
              poster={l.poster}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={l.src}
              alt=""
              loading={k === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}
