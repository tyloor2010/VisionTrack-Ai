import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:glow-primary hover:brightness-110",
  outline: "bg-transparent text-foreground border border-primary hover:bg-primary/10",
  alert: "bg-det-red text-foreground hover:glow-red",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  success: "bg-success text-ink hover:brightness-110",
} as const;

export function btnClass(variant: keyof typeof variants = "primary", size: "sm" | "md" | "lg" = "md") {
  const s = { sm: "h-8 px-3 text-xs", md: "h-10 px-5 text-sm", lg: "h-12 px-7 text-sm" }[size];
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-wide shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
    s,
    variants[variant],
  );
}

export function Btn({ variant, size, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: "sm" | "md" | "lg" }) {
  return <button className={cn(btnClass(variant, size), className)} {...rest} />;
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ to, decimals = 0, suffix = "", prefix = "" }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} dir="ltr">
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function SectionHead({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <div dir="ltr" className="mb-4 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground">
        {tag}
      </div>
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

export function Panel({ children, className, title, right }: { children: ReactNode; className?: string; title?: string; right?: ReactNode }) {
  return (
    <div className={cn("relative rounded-xl border border-border bg-card shadow-[0_20px_50px_-30px_oklch(0_0_0/0.6)] overflow-hidden", className)}>
            {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
