import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

export type LL = [number, number];
export type IntelLayer =
  | { kind: "tower"; at: LL; label: string; km: number }
  | { kind: "phone"; at: LL; km: number; label: string }
  | { kind: "path"; pts: LL[]; color: string; dashed?: boolean }
  | { kind: "node"; at: LL; label: string; color: string }
  | { kind: "zone"; at: LL; rx: number; label: string };

/** Dark Leaflet map (client-only) for the intelligence module. Fixed view; only layers redraw. */
export function IntelMap({ center, layers, className = "h-72" }: { center: LL; layers: IntelLayer[]; className?: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const ref = useRef<{ L: typeof import("leaflet"); map: LeafletMap; g: LayerGroup } | null>(null);
  const latest = useRef(layers);
  latest.current = layers;

  const draw = () => {
    const r = ref.current;
    if (!r) return;
    const { L, g } = r;
    g.clearLayers();
    const css = (v: string) => `var(--${v})`;
    for (const l of latest.current) {
      if (l.kind === "tower") {
        L.circle(l.at, { radius: l.km * 1000, color: "#22d3ee", weight: 1, opacity: 0.5, fillOpacity: 0.06 }).addTo(g);
        L.marker(l.at, { icon: L.divIcon({ className: "", html: `<div style="color:#22d3ee;font:600 10px monospace;white-space:nowrap;transform:translate(-6px,-18px)">▲ ${l.label}</div>` }) }).addTo(g);
      } else if (l.kind === "phone") {
        L.circle(l.at, { radius: l.km * 1000, color: "#ef4444", weight: 2, dashArray: "4 4", fillOpacity: 0.15 }).addTo(g);
        L.marker(l.at, { icon: L.divIcon({ className: "", html: `<div style="background:#ef4444;color:#111;font:700 10px monospace;padding:0 4px;white-space:nowrap;transform:translate(-50%,-50%)">${l.label}</div>` }) }).addTo(g);
      } else if (l.kind === "path") {
        L.polyline(l.pts, { color: l.color, weight: 3.5, opacity: 0.95, dashArray: l.dashed ? "6 6" : undefined }).addTo(g);
      } else if (l.kind === "node") {
        L.marker(l.at, { icon: L.divIcon({ className: "", html: `<div style="background:${l.color};color:#0b0b0b;font:800 13px monospace;padding:3px 8px;white-space:nowrap;border-radius:4px;border:2px solid rgba(0,0,0,.85);box-shadow:0 0 0 2px ${l.color},0 0 14px 3px ${l.color};transform:translate(-50%,-50%)">${l.label}</div>` }) }).addTo(g);
      } else if (l.kind === "zone") {
        L.circle(l.at, { radius: l.rx * 1000, color: "#f59e0b", weight: 1, fillColor: "#f59e0b", fillOpacity: 0.22 }).addTo(g);
        L.marker(l.at, { icon: L.divIcon({ className: "", html: `<div style="color:#f59e0b;font:700 11px monospace;white-space:nowrap;transform:translate(-50%,-50%)">${l.label}</div>` }) }).addTo(g);
      }
      void css;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !holder.current || ref.current) return;
      const map = L.map(holder.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, doubleClickZoom: false, keyboard: false });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, keepBuffer: 6 }).addTo(map);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, opacity: 0.6 }).addTo(map);
      map.setView(center, 13.4);
      ref.current = { L, map, g: L.layerGroup().addTo(map) };
      draw();
    })();
    return () => {
      cancelled = true;
      ref.current?.map.remove();
      ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(draw, [layers]);

  return <div ref={holder} className={`leaflet-hud w-full brightness-95 ${className}`} />;
}
