import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haversineKm, useVT, type GeoPos, type Case, type Alert } from "./store";
import { cameras } from "@/data/mock";

export type { GeoPos } from "./store";

/* ================= Base layers & overlays ================= */
export type BaseLayer = "satellite" | "streets" | "hybrid";
export type OverlayKey = "cameras" | "units" | "radius" | "weather";

export const TILES: Record<BaseLayer, { url: string; attribution: string; sub?: string }> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
  },
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  hybrid: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri",
    sub: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
  },
};

/* ================= Geometry (pure, tested) ================= */
/** Total length of a polyline in km. */
export function pathDistanceKm(pts: GeoPos[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += haversineKm(pts[i - 1]!, pts[i]!);
  return d;
}

/** Polygon area in km² via shoelace on a local equirectangular projection. */
export function polygonAreaKm2(pts: GeoPos[]): number {
  if (pts.length < 3) return 0;
  const r = Math.PI / 180;
  const lat0 = pts.reduce((a, p) => a + p.lat, 0) / pts.length;
  const kx = 111.32 * Math.cos(lat0 * r);
  const ky = 110.57;
  const xy = pts.map((p) => ({ x: p.lng * kx, y: p.lat * ky }));
  let a = 0;
  for (let i = 0; i < xy.length; i++) {
    const p = xy[i]!, q = xy[(i + 1) % xy.length]!;
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/** Format a position as degrees-minutes-seconds, e.g. 30°02'40"N 31°14'09"E. */
export function toDMS(p: GeoPos): string {
  const conv = (v: number, pos: string, neg: string) => {
    const abs = Math.abs(v);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = Math.round(((abs - d) * 60 - m) * 60);
    return `${d}°${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"${v >= 0 ? pos : neg}`;
  };
  return `${conv(p.lat, "N", "S")} ${conv(p.lng, "E", "W")}`;
}

/* ================= Route replay ================= */
/**
 * Reconstruct a case's movement route: last-seen point first, then every
 * camera that raised an alert for the case, in chronological order.
 */
export function buildRoute(c: Case, alerts: Alert[]): GeoPos[] {
  const pts: GeoPos[] = [c.lastSeen];
  const hits = alerts
    .filter((a) => a.caseId === c.id)
    .sort((a, b) => a.at - b.at);
  for (const h of hits) {
    const cam = cameras.find((k) => k.id === h.cam);
    if (cam) pts.push(cam.pos);
  }
  return pts;
}

/** Interpolate a position at fraction f (0..1) along a route. */
export function routePointAt(pts: GeoPos[], f: number): GeoPos {
  if (pts.length === 0) return { lat: 0, lng: 0 };
  if (pts.length === 1 || f <= 0) return pts[0]!;
  if (f >= 1) return pts[pts.length - 1]!;
  const total = pathDistanceKm(pts);
  let target = total * f;
  for (let i = 1; i < pts.length; i++) {
    const seg = haversineKm(pts[i - 1]!, pts[i]!);
    if (target <= seg && seg > 0) {
      const k = target / seg;
      return { lat: pts[i - 1]!.lat + (pts[i]!.lat - pts[i - 1]!.lat) * k, lng: pts[i - 1]!.lng + (pts[i]!.lng - pts[i - 1]!.lng) * k };
    }
    target -= seg;
  }
  return pts[pts.length - 1]!;
}

/* ================= Mock weather overlay ================= */
export type WeatherCell = { lat: number; lng: number; tempC: number; windKmh: number; windDeg: number; cond: "clear" | "cloud" | "rain" | "dust" };
const CONDS: WeatherCell["cond"][] = ["clear", "cloud", "dust", "rain"];

/** Deterministic demo weather grid (4×4 cells) around a center point. */
export function mockWeather(center: GeoPos): WeatherCell[] {
  const cells: WeatherCell[] = [];
  for (let gy = 0; gy < 4; gy++)
    for (let gx = 0; gx < 4; gx++) {
      const seed = (gx * 7 + gy * 13 + 5) % 16;
      cells.push({
        lat: center.lat + (gy - 1.5) * 0.018,
        lng: center.lng + (gx - 1.5) * 0.018,
        tempC: 24 + ((seed * 3) % 9),
        windKmh: 6 + ((seed * 5) % 22),
        windDeg: (seed * 47) % 360,
        cond: CONDS[seed % 4]!,
      });
    }
  return cells;
}

/* ================= Persisted map preferences ================= */
export type Drawing = { id: string; name: string; kind: "line" | "polygon"; pts: GeoPos[]; at: number };

type MapState = {
  base: BaseLayer;
  overlays: Record<OverlayKey, boolean>;
  drawings: Drawing[];
  replayCase: string | null;
  speed: number;
  setBase: (b: BaseLayer) => void;
  toggleOverlay: (k: OverlayKey) => void;
  saveDrawing: (d: Omit<Drawing, "id" | "at">) => void;
  deleteDrawing: (id: string) => void;
  setReplayCase: (id: string | null) => void;
  setSpeed: (s: number) => void;
};

export const useMapPrefs = create<MapState>()(
  persist(
    (set, get) => ({
      base: "hybrid",
      overlays: { cameras: true, units: true, radius: true, weather: false },
      drawings: [],
      replayCase: null,
      speed: 1,
      setBase: (base) => set({ base }),
      toggleOverlay: (k) => set({ overlays: { ...get().overlays, [k]: !get().overlays[k] } }),
      saveDrawing: (d) => {
        const id = `DR-${Date.now().toString(36)}`;
        set({ drawings: [{ ...d, id, at: Date.now() }, ...get().drawings].slice(0, 30) });
        useVT.getState().emit({
          action: `MAP saved ${d.kind} "${d.name}" (${d.pts.length} pts)`,
          msg: { en: `Saved map drawing "${d.name}"`, ar: `حُفظ الرسم «${d.name}» على الخريطة` },
          kind: "success", quiet: true,
        });
      },
      deleteDrawing: (id) => {
        const d = get().drawings.find((x) => x.id === id);
        set({ drawings: get().drawings.filter((x) => x.id !== id) });
        if (d) useVT.getState().emit({ action: `MAP deleted drawing "${d.name}"`, msg: { en: `Deleted drawing "${d.name}"`, ar: `حُذف الرسم «${d.name}»` }, kind: "warning", quiet: true });
      },
      setReplayCase: (replayCase) => set({ replayCase }),
      setSpeed: (speed) => set({ speed }),
    }),
    { name: "vt-map-v1" },
  ),
);
