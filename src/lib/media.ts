import type { Box } from "@/data/mock";

/** Pure logic for the media lab: mock frame detection, exports, filters, enhancement, camera health. */

export type DetFrame = { t: number; boxes: Box[] };

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLASSES = ["person", "car", "bus", "bicycle"] as const;
const COLORS: Record<string, Box["color"]> = { person: "yellow", car: "green", bus: "cyan", bicycle: "magenta" };

/** Deterministic per-frame detections for a sampled video. `seed` from the file name keeps re-runs stable. */
export function analyzeVideo(seed: string, duration: number, step = 0.5): DetFrame[] {
  const rnd = mulberry32([...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
  const frames: DetFrame[] = [];
  for (let t = 0; t <= duration; t += step) {
    const n = Math.floor(rnd() * 5); // 0–4 boxes
    const boxes: Box[] = [];
    for (let i = 0; i < n; i++) {
      const label = CLASSES[Math.floor(rnd() * CLASSES.length)]!;
      boxes.push({
        label,
        conf: Math.round(30 + rnd() * 68),
        color: COLORS[label]!,
        x: Math.round(rnd() * 80),
        y: Math.round(10 + rnd() * 55),
        w: Math.round(4 + rnd() * 14),
        h: Math.round(6 + rnd() * 22),
      });
    }
    frames.push({ t: +t.toFixed(1), boxes });
  }
  return frames;
}

export type DetFilter = {
  classes: string[];       // empty = all
  minConf: number;
  maxConf: number;
  from: number;            // seconds
  to: number;
};

export const DEFAULT_FILTER: DetFilter = { classes: [], minConf: 0, maxConf: 100, from: 0, to: Infinity };

export function filterFrames(frames: DetFrame[], f: DetFilter): DetFrame[] {
  return frames
    .filter((fr) => fr.t >= f.from && fr.t <= f.to)
    .map((fr) => ({
      t: fr.t,
      boxes: fr.boxes.filter(
        (b) =>
          (f.classes.length === 0 || f.classes.includes(b.label)) &&
          (b.conf ?? 0) >= f.minConf &&
          (b.conf ?? 0) <= f.maxConf,
      ),
    }));
}

/** Detection counts per time bucket, for the heat strip. */
export function heatStrip(frames: DetFrame[], buckets = 24): number[] {
  if (frames.length === 0) return Array(buckets).fill(0);
  const max = frames[frames.length - 1]!.t || 1;
  const out = Array(buckets).fill(0) as number[];
  for (const fr of frames) {
    const i = Math.min(buckets - 1, Math.floor((fr.t / max) * buckets));
    out[i]! += fr.boxes.length;
  }
  return out;
}

export function framesToCSV(frames: DetFrame[]): string {
  const rows = ["time_s,label,confidence,x_pct,y_pct,w_pct,h_pct"];
  for (const fr of frames)
    for (const b of fr.boxes) rows.push(`${fr.t},${b.label},${b.conf ?? ""},${b.x},${b.y},${b.w},${b.h}`);
  return rows.join("\n");
}

export function framesToJSON(frames: DetFrame[]): string {
  return JSON.stringify({ version: 1, frames }, null, 2);
}

/** CSS filter string for the canvas enhancement pass. */
export function enhanceFilter(o: { brightness: number; contrast: number; sharpen: boolean; denoise: boolean }): string {
  const parts = [`brightness(${o.brightness}%)`, `contrast(${o.contrast}%)`];
  if (o.sharpen) parts.push("saturate(1.25)", "contrast(1.08)");
  if (o.denoise) parts.push("blur(0.6px)");
  return parts.join(" ");
}

/** Mock similarity between two camera stills: shared classes + confidence closeness. */
export function compareStills(a: Box[], b: Box[]): { score: number; shared: string[] } {
  const la = new Set(a.map((x) => x.label));
  const lb = new Set(b.map((x) => x.label));
  const shared = [...la].filter((l) => lb.has(l));
  const confA = a.reduce((s, x) => s + (x.conf ?? 50), 0) / Math.max(1, a.length);
  const confB = b.reduce((s, x) => s + (x.conf ?? 50), 0) / Math.max(1, b.length);
  const score = Math.min(97, Math.round(shared.length * 22 + 30 - Math.abs(confA - confB) / 4));
  return { score: Math.max(8, score), shared };
}

export type CamHealth = { hour: number; ok: boolean; ms: number };

/** 24h mock health history for a camera, stable per camera id. */
export function healthHistory(camId: string): CamHealth[] {
  const rnd = mulberry32([...camId].reduce((a, c) => a * 33 + c.charCodeAt(0), 11) >>> 0);
  return Array.from({ length: 24 }, (_, hour) => {
    const ok = rnd() > 0.08;
    return { hour, ok, ms: ok ? Math.round(18 + rnd() * 60) : 0 };
  });
}

/** Mock connection test: latency + packet loss, stable-ish per camera. */
export function testConnection(camId: string): { ok: boolean; ms: number; loss: number } {
  const rnd = mulberry32(Date.now() ^ [...camId].reduce((a, c) => a + c.charCodeAt(0), 0));
  const ok = rnd() > 0.12;
  return { ok, ms: ok ? Math.round(20 + rnd() * 80) : 0, loss: ok ? +(rnd() * 1.4).toFixed(1) : 100 };
}

/** Download a text file in the browser. */
export function downloadText(name: string, text: string, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
