import type { Device } from "@/lib/store";

export type TrailPoint = { lat: number; lng: number; at: number };

/** Deterministic pseudo-random from a string seed (stable across reloads). */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const STEP_KM: Record<Device["kind"], number> = { drone: 0.35, tracker: 0.12, visionbox: 0 };

/**
 * Simulated location history ending at the device's current position.
 * One point every 10 minutes for the last `hours` hours. Demo data only.
 */
export function deviceTrail(d: Device, hours: number, now: number): TrailPoint[] {
  const stepMs = 10 * 60 * 1000;
  const n = Math.round((hours * 3600000) / stepMs);
  const r = rng(d.id);
  const step = STEP_KM[d.kind] / 111;
  const pts: TrailPoint[] = [];
  let lat = d.pos.lat, lng = d.pos.lng, heading = r() * Math.PI * 2;
  const end = Math.floor(now / stepMs) * stepMs;
  for (let i = 0; i <= n; i++) {
    pts.push({ lat, lng, at: end - i * stepMs });
    heading += (r() - 0.5) * 1.4;
    const s = step * (0.4 + r());
    lat += Math.sin(heading) * s;
    lng += Math.cos(heading) * s;
  }
  return pts.reverse();
}

export function trailKm(pts: TrailPoint[]): number {
  let km = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const dy = (b.lat - a.lat) * 111, dx = (b.lng - a.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
    km += Math.hypot(dx, dy);
  }
  return km;
}
