import { cn } from "@/lib/utils";

export function HudText({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div dir="ltr" className={cn("font-pixel text-lg leading-[1.05] tracking-wide text-foreground sm:text-xl", className)} aria-label="System status readout">
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <span className="animate-blink">█</span>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7 text-primary", className)} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 10V3h7M22 3h7v7M29 22v7h-7M10 29H3v-7" />
        <path d="M7 16s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" strokeWidth="1.6" />
      </g>
      <circle cx="16" cy="16" r="2.6" fill="var(--det-red)" />
    </svg>
  );
}
