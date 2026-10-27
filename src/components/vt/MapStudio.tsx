import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup, Polyline, Polygon, Marker, TileLayer } from "leaflet";
import { Ruler, PenLine, Hexagon, Play, Pause, Trash2, Copy, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { useVT } from "@/lib/store";
import { cameras } from "@/data/mock";
import {
  TILES, pathDistanceKm, polygonAreaKm2, toDMS, buildRoute, routePointAt, mockWeather,
  useMapPrefs, type BaseLayer, type OverlayKey, type GeoPos,
} from "@/lib/mapTools";
import { btnClass } from "./ui";

type Mode = "pan" | "measure" | "line" | "polygon";

const COND_ICON: Record<string, string> = { clear: "☀", cloud: "☁", rain: "🌧", dust: "🌪" };

/** Full map workbench: base layers, overlays, drawing/measuring, route replay, coordinates. */
export function MapStudio() {
  const { t, lang } = useLang();
  const cases = useVT((s) => s.cases);
  const alerts = useVT((s) => s.alerts);
  const units = useVT((s) => s.units);
  const emit = useVT((s) => s.emit);
  const { base, overlays, drawings, replayCase, speed, setBase, toggleOverlay, saveDrawing, deleteDrawing, setReplayCase, setSpeed } = useMapPrefs();

  const holder = useRef<HTMLDivElement>(null);
  const lib = useRef<{ L: typeof import("leaflet"); map: LeafletMap } | null>(null);
  const tileRef = useRef<{ main?: TileLayer; sub?: TileLayer }>({});
  const groups = useRef<Partial<Record<OverlayKey, LayerGroup>> & { draw?: LayerGroup; saved?: LayerGroup; replay?: LayerGroup }>({});
  const draftLayer = useRef<Polyline | Polygon | null>(null);
  const replayMarker = useRef<Marker | null>(null);
  const replayTrail = useRef<Polyline | null>(null);

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("pan");
  const [draft, setDraft] = useState<GeoPos[]>([]);
  const [cursor, setCursor] = useState<GeoPos | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const center = cases[0]?.lastSeen ?? { lat: 30.0444, lng: 31.2357 };
  const route = replayCase ? buildRoute(cases.find((c) => c.id === replayCase)!, alerts) : [];

  /* ---- map init (client only) ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !holder.current || lib.current) return;
      const map = L.map(holder.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true, zoomSnap: 0.1 });
      groups.current = {
        cameras: L.layerGroup().addTo(map), units: L.layerGroup().addTo(map),
        radius: L.layerGroup().addTo(map), weather: L.layerGroup(),
        draw: L.layerGroup().addTo(map), saved: L.layerGroup().addTo(map), replay: L.layerGroup().addTo(map),
      };
      map.on("click", (e) => {
        const m = modeRef.current;
        if (m === "pan") return;
        setDraft((d) => [...d, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      });
      map.on("mousemove", (e) => setCursor({ lat: e.latlng.lat, lng: e.latlng.lng }));
      map.setView([center.lat, center.lng], 13);
      lib.current = { L, map };
      setReady(true);
    })();
    return () => { cancelled = true; lib.current?.map.remove(); lib.current = null; groups.current = {}; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- base layer ---- */
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L, map } = cur;
    tileRef.current.main?.remove();
    tileRef.current.sub?.remove();
    const spec = TILES[base];
    tileRef.current.main = L.tileLayer(spec.url, { attribution: spec.attribution, maxZoom: 19, keepBuffer: 6, updateWhenZooming: false }).addTo(map);
    if (spec.sub) tileRef.current.sub = L.tileLayer(spec.sub, { opacity: 0.55, maxZoom: 19, keepBuffer: 6, updateWhenZooming: false }).addTo(map);
  }, [base, ready]);

  /* ---- overlays ---- */
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L, map } = cur;
    const g = groups.current;
    (Object.keys(overlays) as OverlayKey[]).forEach((k) => {
      const layer = g[k];
      if (!layer) return;
      if (overlays[k] && !map.hasLayer(layer)) layer.addTo(map);
      if (!overlays[k] && map.hasLayer(layer)) layer.remove();
    });
    g.cameras?.clearLayers();
    cameras.forEach((c) => {
      L.marker([c.pos.lat, c.pos.lng], {
        icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="relative -translate-x-1/2 -translate-y-1/2"><span class="block h-2.5 w-2.5 rotate-45 border border-det-cyan bg-background shadow-[0_0_6px_var(--det-cyan)]"></span><span dir="ltr" class="absolute left-3 -top-1 whitespace-nowrap font-mono text-[9px] text-det-cyan/80">${c.id}</span></div>` }),
      }).addTo(g.cameras!);
    });
    g.units?.clearLayers();
    units.forEach((u) => {
      L.marker([u.pos.lat, u.pos.lng], {
        icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="relative -translate-x-1/2 -translate-y-1/2"><span class="block h-2.5 w-2.5 rounded-full ${u.busyWith ? "bg-det-red" : "bg-success"} shadow-[0_0_6px_var(--success)]"></span><span dir="ltr" class="absolute left-3 -top-1 whitespace-nowrap font-mono text-[9px] text-success/90">${u.id}</span></div>` }),
      }).addTo(g.units!);
    });
    g.radius?.clearLayers();
    L.circle([center.lat, center.lng], { radius: 2500, color: "var(--warning)", weight: 1.5, dashArray: "5 6", fillColor: "var(--det-red)", fillOpacity: 0.1 }).addTo(g.radius!);
    g.weather?.clearLayers();
    mockWeather(center).forEach((w) => {
      L.marker([w.lat, w.lng], {
        icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div dir="ltr" class="-translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-det-cyan/40 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-foreground">${COND_ICON[w.cond]} ${w.tempC}° <span style="display:inline-block;transform:rotate(${w.windDeg}deg)">→</span> ${w.windKmh}</div>` }),
      }).addTo(g.weather!);
    });
  }, [overlays, units, center.lat, center.lng, ready]);

  /* ---- draft drawing ---- */
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L } = cur;
    draftLayer.current?.remove();
    draftLayer.current = null;
    if (draft.length === 0) return;
    const latlngs = draft.map((p) => [p.lat, p.lng] as [number, number]);
    draftLayer.current =
      mode === "polygon"
        ? L.polygon(latlngs, { color: "var(--primary)", weight: 2, fillOpacity: 0.15 }).addTo(groups.current.draw!)
        : L.polyline(latlngs, { color: "var(--primary)", weight: 2, dashArray: mode === "measure" ? "4 4" : undefined }).addTo(groups.current.draw!);
    draft.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<span class="block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"></span>` }) }).addTo(groups.current.draw!);
    });
  }, [draft, mode, ready]);

  /* ---- saved drawings ---- */
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L } = cur;
    const g = groups.current.saved;
    g?.clearLayers();
    drawings.forEach((d) => {
      const latlngs = d.pts.map((p) => [p.lat, p.lng] as [number, number]);
      if (d.kind === "polygon") L.polygon(latlngs, { color: "var(--det-magenta, #e94560)", weight: 1.5, fillOpacity: 0.1 }).addTo(g!);
      else L.polyline(latlngs, { color: "var(--det-magenta, #e94560)", weight: 1.5 }).addTo(g!);
    });
  }, [drawings, ready]);

  /* ---- route replay ---- */
  useEffect(() => {
    const cur = lib.current;
    if (!cur) return;
    const { L } = cur;
    const g = groups.current.replay;
    g?.clearLayers();
    replayMarker.current = null;
    replayTrail.current = null;
    setProgress(0);
    if (route.length < 2) return;
    L.polyline(route.map((p) => [p.lat, p.lng] as [number, number]), { color: "var(--warning)", weight: 1.5, dashArray: "6 6", opacity: 0.6 }).addTo(g!);
    route.forEach((p, i) => {
      L.marker([p.lat, p.lng], { icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<span dir="ltr" class="grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-warning bg-background font-mono text-[8px] text-warning">${i + 1}</span>` }) }).addTo(g!);
    });
    replayTrail.current = L.polyline([route[0]!], { color: "var(--warning)", weight: 3 }).addTo(g!);
    replayMarker.current = L.marker([route[0]!.lat, route[0]!.lng], {
      icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="relative -translate-x-1/2 -translate-y-1/2"><span class="absolute -inset-2 rounded-full bg-warning/40 animate-ping-soft"></span><span class="relative block h-3 w-3 rounded-full border-2 border-foreground bg-warning"></span></div>` }),
    }).addTo(g!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayCase, route.length, ready]);

  useEffect(() => {
    if (!playing || route.length < 2) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.004 * speed;
        if (next >= 1) { setPlaying(false); return 1; }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [playing, speed, route.length]);

  useEffect(() => {
    if (route.length < 2 || !replayMarker.current) return;
    const pos = routePointAt(route, progress);
    replayMarker.current.setLatLng([pos.lat, pos.lng]);
    const steps = Math.max(2, Math.round(progress * 60));
    const trail: [number, number][] = [];
    for (let i = 0; i <= steps; i++) { const q = routePointAt(route, (progress * i) / steps); trail.push([q.lat, q.lng]); }
    replayTrail.current?.setLatLngs(trail);
  }, [progress, route]);

  /* ---- actions ---- */
  const clearDraft = () => { setDraft([]); groups.current.draw?.clearLayers(); };
  const saveDraft = () => {
    if (draft.length < 2) return;
    const kind = mode === "polygon" ? "polygon" : "line";
    const name = `${kind === "polygon" ? t("Zone", "منطقة") : t("Route", "مسار")} ${drawings.length + 1}`;
    saveDrawing({ name, kind, pts: draft });
    clearDraft();
    setMode("pan");
  };
  const copyCoords = () => {
    if (!cursor) return;
    navigator.clipboard?.writeText(`${cursor.lat.toFixed(6)}, ${cursor.lng.toFixed(6)}`);
    toast.success(t("Coordinates copied", "نُسخت الإحداثيات"));
  };

  const draftKm = pathDistanceKm(draft);
  const draftArea = mode === "polygon" ? polygonAreaKm2(draft) : 0;
  const routeKm = route.length > 1 ? pathDistanceKm(route) : 0;

  const modes: { id: Mode; i: typeof Ruler; l: string }[] = [
    { id: "pan", i: MousePointer2, l: t("Pan", "تحريك") },
    { id: "measure", i: Ruler, l: t("Measure", "قياس") },
    { id: "line", i: PenLine, l: t("Draw route", "رسم مسار") },
    { id: "polygon", i: Hexagon, l: t("Draw zone", "رسم منطقة") },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        <div ref={holder} role="img" aria-label={t("Operations map", "خريطة العمليات")} className="leaflet-hud relative aspect-[4/3] w-full overflow-hidden border border-border bg-background sm:aspect-[16/10]" />
        <div dir="ltr" className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="rounded-sm border border-border bg-card px-2 py-1">
            {cursor ? `${cursor.lat.toFixed(5)}, ${cursor.lng.toFixed(5)} · ${toDMS(cursor)}` : t("Move over the map for coordinates", "حرّك المؤشر فوق الخريطة لعرض الإحداثيات")}
          </span>
          <button onClick={copyCoords} disabled={!cursor} className={btnClass("outline", "sm")} aria-label={t("Copy coordinates", "نسخ الإحداثيات")}><Copy className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Base layers */}
        <section className="border border-border bg-card/40 p-3">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-wider text-primary">{t("Base layer", "الطبقة الأساسية")}</h2>
          <div className="flex flex-wrap gap-1">
            {(["satellite", "streets", "hybrid"] as BaseLayer[]).map((b) => (
              <button key={b} onClick={() => setBase(b)} className={`${btnClass(base === b ? "primary" : "outline", "sm")}`}>
                {b === "satellite" ? t("Satellite", "قمر صناعي") : b === "streets" ? t("Streets", "شوارع") : t("Hybrid", "مدمج")}
              </button>
            ))}
          </div>
          <h2 className="mb-2 mt-3 font-mono text-xs uppercase tracking-wider text-primary">{t("Overlays", "طبقات إضافية")}</h2>
          <div className="grid grid-cols-2 gap-1">
            {(["cameras", "units", "radius", "weather"] as OverlayKey[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 rounded-sm border border-border px-2 py-1.5 text-xs">
                <input type="checkbox" checked={overlays[k]} onChange={() => toggleOverlay(k)} className="accent-[var(--primary)]" />
                {k === "cameras" ? t("Cameras", "الكاميرات") : k === "units" ? t("Units", "الفرق") : k === "radius" ? t("Search radius", "نطاق البحث") : t("Weather (demo)", "الطقس (تجريبي)")}
              </label>
            ))}
          </div>
        </section>

        {/* Drawing & measuring */}
        <section className="border border-border bg-card/40 p-3">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-wider text-primary">{t("Draw & measure", "الرسم والقياس")}</h2>
          <div className="flex flex-wrap gap-1">
            {modes.map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); clearDraft(); }} className={btnClass(mode === m.id ? "primary" : "outline", "sm")} aria-pressed={mode === m.id}>
                <m.i className="h-3 w-3" /> {m.l}
              </button>
            ))}
          </div>
          {draft.length > 0 && (
            <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
              <p dir="ltr">{draft.length} pts · {draftKm.toFixed(2)} km{mode === "polygon" && draft.length > 2 ? ` · ${draftArea.toFixed(2)} km²` : ""}</p>
              <div className="flex gap-1">
                {mode !== "measure" && draft.length >= 2 && <button onClick={saveDraft} className={btnClass("primary", "sm")}>{t("Save", "حفظ")}</button>}
                <button onClick={() => setDraft(draft.slice(0, -1))} className={btnClass("outline", "sm")}>{t("Undo point", "تراجع")}</button>
                <button onClick={clearDraft} className={btnClass("outline", "sm")}>{t("Clear", "مسح")}</button>
              </div>
            </div>
          )}
          {drawings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {drawings.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-sm border border-border px-2 py-1 text-xs">
                  <span className="min-w-0 truncate">{d.name} <span className="font-mono text-muted-foreground" dir="ltr">{d.kind === "polygon" ? `${polygonAreaKm2(d.pts).toFixed(1)} km²` : `${pathDistanceKm(d.pts).toFixed(1)} km`}</span></span>
                  <button onClick={() => deleteDrawing(d.id)} aria-label={t("Delete drawing", "حذف الرسم")} className="text-det-red hover:opacity-80"><Trash2 className="h-3.5 w-3.5" /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Route replay */}
        <section className="border border-border bg-card/40 p-3">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-wider text-primary">{t("Route replay", "إعادة تشغيل المسار")}</h2>
          <select value={replayCase ?? ""} onChange={(e) => { setReplayCase(e.target.value || null); setPlaying(false); }} className="w-full rounded-sm border border-border bg-background px-2 py-1.5 text-xs" aria-label={t("Choose case", "اختر الحالة")}>
            <option value="">{t("Choose a case…", "اختر حالة…")}</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.name[lang]}</option>)}
          </select>
          {replayCase && route.length > 1 && (
            <div className="mt-2 space-y-2">
              <p className="font-mono text-xs text-muted-foreground" dir="ltr">{route.length} {t("points", "نقاط")} · {routeKm.toFixed(2)} km</p>
              <input type="range" min={0} max={1000} value={Math.round(progress * 1000)} onChange={(e) => setProgress(Number(e.target.value) / 1000)} className="w-full accent-[var(--warning)]" aria-label={t("Replay position", "موضع إعادة التشغيل")} />
              <div className="flex items-center gap-1">
                <button onClick={() => setPlaying(!playing)} className={btnClass("primary", "sm")} aria-label={playing ? t("Pause", "إيقاف مؤقت") : t("Play", "تشغيل")}>
                  {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                {[1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={btnClass(speed === s ? "primary" : "outline", "sm")} aria-pressed={speed === s}>{s}×</button>
                ))}
              </div>
            </div>
          )}
          {replayCase && route.length < 2 && <p className="mt-2 text-xs text-muted-foreground">{t("No camera sightings recorded for this case yet.", "لا توجد رصدات كاميرات مسجلة لهذه الحالة بعد.")}</p>}
        </section>

        <p className="border-s-2 border-warning ps-3 text-xs text-muted-foreground">
          {t("Weather cells and unit positions are demo data. Drawings are stored on this device only.", "خلايا الطقس ومواقع الفرق بيانات تجريبية. تُحفظ الرسومات على هذا الجهاز فقط.")}
        </p>
      </div>
    </div>
  );
}
