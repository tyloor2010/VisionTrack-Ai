import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Circle as LeafletCircle, Marker as LeafletMarker, LayerGroup } from "leaflet";
import { cameras } from "@/data/mock";

type GeoPos = { lat: number; lng: number };

type Props = {
  origin: GeoPos;
  radiusKm: number;
  matches?: string[];
  compact?: boolean;
  interactive?: boolean;
  pin?: GeoPos | null;
  onPick?: (p: GeoPos) => void;
  className?: string;
};

/**
 * Real dark map (CARTO tiles via Leaflet) with the VisionTrack HUD on top:
 * last-seen point, animated search radius, camera pins that turn red on match.
 */
export function SearchMap({ origin, radiusKm, matches = [], compact = false, interactive = false, pin = null, onPick, className }: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const lib = useRef<{ L: typeof import("leaflet"); map: LeafletMap } | null>(null);
  const layers = useRef<{
    cams?: LayerGroup;
    glow?: LeafletCircle;
    ring?: LeafletCircle;
    last?: LeafletMarker;
    pinMarker?: LeafletMarker;
    picks?: LayerGroup;
  }>({});
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Create the map once, client-side only (Leaflet is browser-only).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !holder.current || lib.current) return;
      const map = L.map(holder.current, {
        zoomControl: false,
        attributionControl: !compact,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: interactive,
        zoomSnap: 0.1,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const lt = layers.current;
      // Camera pins
      lt.cams = L.layerGroup(
        cameras.map((c) => {
          const hit = matches.includes(c.id);
          return L.marker([c.pos.lat, c.pos.lng], {
            icon: L.divIcon({
              className: "",
              html: `<div class="relative -translate-x-1/2 -translate-y-1/2">${hit
                ? `<span class="absolute -inset-1.5 rounded-full bg-det-red/50 animate-ping-soft"></span><span class="relative block h-3 w-3 rounded-full bg-det-red glow-red"></span><span dir="ltr" class="absolute left-4 -top-1 whitespace-nowrap bg-det-red px-1 font-mono text-[9px] font-bold text-ink">${c.id} ⚠</span>`
                : `<span class="block h-2.5 w-2.5 rotate-45 border border-det-cyan bg-background shadow-[0_0_6px_var(--det-cyan)]"></span>${compact ? "" : `<span dir="ltr" class="absolute left-4 -top-1 whitespace-nowrap font-mono text-[9px] text-det-cyan/80">${c.id}</span>`}`}</div>`,
              iconSize: [0, 0],
            }),
          });
        }),
      ).addTo(map);
      // Search radius: heat fill + dashed boundary
      lt.glow = L.circle([origin.lat, origin.lng], { radius: radiusKm * 1000, stroke: false, fillColor: "var(--det-red)", fillOpacity: 0.18 }).addTo(map);
      lt.ring = L.circle([origin.lat, origin.lng], { radius: radiusKm * 1000, color: "var(--warning)", weight: 1.5, dashArray: "5 6", fill: false }).addTo(map);
      // Last-seen marker
      lt.last = L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="relative -translate-x-1/2 -translate-y-1/2"><span class="absolute -inset-2 rounded-full bg-warning/40 animate-ping-soft"></span><span class="relative block h-3.5 w-3.5 rounded-full border-2 border-foreground bg-warning"></span>${compact ? "" : `<span dir="ltr" class="absolute left-5 -top-1 whitespace-nowrap bg-warning px-1 font-mono text-[9px] font-bold text-ink">LAST SEEN</span>`}</div>`,
          iconSize: [0, 0],
        }),
      }).addTo(map);
      if (interactive) {
        lt.picks = L.layerGroup().addTo(map);
        map.on("click", (e) => onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
      }
      map.setView([origin.lat, origin.lng], 14);
      lib.current = { L, map };
      // Position the view on the search radius once measured
      requestAnimationFrame(() => fit(map, origin, radiusKm));
    })();
    return () => {
      cancelled = true;
      lib.current?.map.remove();
      lib.current = null;
      layers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fit(map: LeafletMap, o: GeoPos, km: number) {
    map.fitBounds(
      [
        [o.lat - km / 111, o.lng - km / (111 * Math.cos((o.lat * Math.PI) / 180))],
        [o.lat + km / 111, o.lng + km / (111 * Math.cos((o.lat * Math.PI) / 180))],
      ],
      { padding: [12, 12], animate: true },
    );
  }

  // Update radius, origin and match highlights when props change.
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L, map } = cur;
    const lt = layers.current;
    lt.glow?.setLatLng([origin.lat, origin.lng]).setRadius(Math.max(80, radiusKm * 1000));
    lt.ring?.setLatLng([origin.lat, origin.lng]).setRadius(Math.max(80, radiusKm * 1000));
    lt.last?.setLatLng([origin.lat, origin.lng]);
    // Rebuild camera pins so match highlights follow the matches prop
    lt.cams?.clearLayers();
    cameras.forEach((c) => {
      const hit = matches.includes(c.id);
      L.marker([c.pos.lat, c.pos.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="relative -translate-x-1/2 -translate-y-1/2">${hit
            ? `<span class="absolute -inset-1.5 rounded-full bg-det-red/50 animate-ping-soft"></span><span class="relative block h-3 w-3 rounded-full bg-det-red glow-red"></span><span dir="ltr" class="absolute left-4 -top-1 whitespace-nowrap bg-det-red px-1 font-mono text-[9px] font-bold text-ink">${c.id} ⚠</span>`
            : `<span class="block h-2.5 w-2.5 rotate-45 border border-det-cyan bg-background"></span>${compact ? "" : `<span dir="ltr" class="absolute left-4 -top-1 whitespace-nowrap font-mono text-[9px] text-det-cyan/80">${c.id}</span>`}`}</div>`,
          iconSize: [0, 0],
        }),
      }).addTo(lt.cams!);
    });
    lt.pinMarker?.remove();
    if (pin) {
      lt.pinMarker = L.marker([pin.lat, pin.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="relative -translate-x-1/2 -translate-y-1/2"><span class="absolute -inset-2 rounded-full bg-det-red/40 animate-ping-soft"></span><span class="relative block h-3 w-3 rounded-full bg-det-red glow-red"></span></div>`,
          iconSize: [0, 0],
        }),
      }).addTo(map);
    }
    fit(map, origin, radiusKm);
  }, [origin.lat, origin.lng, radiusKm, matches.join("|"), compact, pin?.lat, pin?.lng]);

  return (
    <div
      ref={holder}
      role="img"
      aria-label="Search map over Cairo"
      className={`relative overflow-hidden border border-border bg-background leaflet-hud ${interactive ? "cursor-crosshair" : ""} ${className ?? "aspect-[4/3] w-full"}`}
    />
  );
}
