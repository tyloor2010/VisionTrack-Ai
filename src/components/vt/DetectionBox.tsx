import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type DetColor = "yellow" | "magenta" | "green" | "cyan" | "red";

const colorVar: Record<DetColor, string> = {
  yellow: "var(--det-yellow)",
  magenta: "var(--det-magenta)",
  green: "var(--det-green)",
  cyan: "var(--det-cyan)",
  red: "var(--det-red)",
};

type Props = {
  label: string;
  confidence?: number | undefined;
  color?: DetColor | undefined;
  /** percentage coordinates */
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number | undefined;
  jitter?: boolean | undefined;
  alert?: boolean | undefined;
};

/** Animated YOLO-style bounding box positioned with % coordinates inside a relative container. */
export function DetectionBox({ label, confidence, color = "yellow", x, y, w, h, delay = 0, jitter = false, alert = false }: Props) {
  const [conf, setConf] = useState(confidence);
  useEffect(() => {
    if (!jitter || confidence === undefined) return;
    const id = setInterval(() => {
      setConf(Math.max(5, Math.min(99, confidence + Math.round((Math.random() - 0.5) * 6))));
    }, 900 + Math.random() * 800);
    return () => clearInterval(id);
  }, [jitter, confidence]);

  const c = colorVar[color];
  const strong = (conf ?? 80) >= 70 || alert;
  // keep the label inside the container: flip alignment near the right/top edges
  const nearRight = x + w > 72;
  const nearTop = y < 12;

  return (
    <motion.div
      aria-label={`${label}${conf !== undefined ? ` ${conf}%` : ""}`}
      role="img"
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
      initial={{ opacity: 0, scale: 1.15 }}
      animate={{ opacity: strong ? 1 : 0.6, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          border: `${strong ? 2 : 1}px solid ${c}`,
          boxShadow: strong ? `0 0 14px color-mix(in oklab, ${c} 55%, transparent)` : undefined,
        }}
        animate={alert ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
        transition={alert ? { repeat: Infinity, duration: 1.1 } : {}}
      />
      <div
        dir="ltr"
        className={`absolute whitespace-nowrap px-1 font-mono text-[10px] font-semibold leading-[18px] text-ink sm:text-[11px] ${nearTop ? "top-0" : "-top-[18px]"} ${nearRight ? "end-[-1px]" : "start-[-1px]"}`}
        style={{ background: c }}
      >
        {alert && "⚠ "}
        {label}
        {conf !== undefined && ` ${conf}%`}
      </div>
    </motion.div>
  );
}
