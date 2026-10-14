import { motion } from "framer-motion";
import { cameras } from "@/data/mock";

/** Styled SVG tactical map: last-seen point, probability radius, cameras, match pins. */
export function SearchMap({ radius, origin = { x: 46, y: 46 }, matches = [] as string[], compact = false }: { radius: number; origin?: { x: number; y: number }; matches?: string[]; compact?: boolean }) {
  const r = Math.max(3, Math.min(60, radius));
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-background hud-grid" role="img" aria-label={`Search map, radius ${r.toFixed(0)} units`}>
      <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <g stroke="var(--muted-foreground)" strokeOpacity="0.35" fill="none" strokeWidth="0.35">
          <path d="M0 20 L100 28" /><path d="M0 50 L100 44" /><path d="M20 0 L28 75" /><path d="M58 0 L52 75" /><path d="M80 0 L74 75" />
          <path d="M0 65 Q40 58 100 70" strokeWidth="0.25" /><path d="M5 5 L45 40 L95 72" strokeWidth="0.25" />
        </g>
        <path d="M0 8 Q30 12 45 4 T100 10 L100 0 L0 0Z" fill="var(--det-cyan)" fillOpacity="0.12" />
        <defs>
          <radialGradient id="heat">
            <stop offset="0%" stopColor="var(--det-red)" stopOpacity="0.55" />
            <stop offset="50%" stopColor="var(--warning)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--warning)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.ellipse cx={origin.x} cy={origin.y * 0.75} fill="url(#heat)" animate={{ rx: r, ry: r * 0.75 }} transition={{ duration: 0.5 }} />
        <motion.ellipse cx={origin.x} cy={origin.y * 0.75} fill="none" stroke="var(--warning)" strokeWidth="0.3" strokeDasharray="1 1" animate={{ rx: r, ry: r * 0.75 }} transition={{ duration: 0.5 }} />
      </svg>

      {cameras.map((c) => {
        const hit = matches.includes(c.id);
        return (
          <div key={c.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${c.mapPos.x}%`, top: `${c.mapPos.y}%` }}>
            {hit && <span className="absolute inset-0 rounded-full bg-det-red animate-ping-soft" />}
            <div className={hit ? "relative h-3 w-3 rounded-full bg-det-red glow-red" : "relative h-2 w-2 rotate-45 border border-det-cyan bg-background"} />
            {!compact && (
              <span dir="ltr" className={`absolute start-3 top-[-6px] whitespace-nowrap font-mono text-[9px] ${hit ? "text-det-red" : "text-det-cyan/80"}`}>
                {c.id}{hit && " ⚠"}
              </span>
            )}
          </div>
        );
      })}

      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${origin.x}%`, top: `${origin.y}%` }}>
        <span className="absolute inset-0 rounded-full bg-warning animate-ping-soft" />
        <div className="relative h-3 w-3 rounded-full border-2 border-foreground bg-warning" />
        {!compact && <span dir="ltr" className="absolute start-4 top-[-5px] whitespace-nowrap bg-warning px-1 font-mono text-[9px] font-bold text-ink">LAST SEEN</span>}
      </div>
    </div>
  );
}
