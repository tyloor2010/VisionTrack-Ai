import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, PlugZap, Power } from "lucide-react";
import { cameras } from "@/data/mock";
import { useVT } from "@/lib/store";
import { useMedia, type ManagedCam } from "@/lib/mediaStore";
import { healthHistory, testConnection } from "@/lib/media";
import { IntelMap, type IntelLayer } from "@/components/vt/IntelMap";
import { Panel, Btn, inputClass } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/cameras")({
  head: () => ({
    meta: [
      { title: "Camera Management — VisionTrack AI" },
      { name: "description", content: "Add, edit and disable cameras, view field-of-view cones on the map, health history and connection tests (demo data)." },
      { property: "og:title", content: "Camera Management — VisionTrack AI" },
      { property: "og:description", content: "Manage the camera network and its health (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CamerasPage,
});

const ZONES = ["Downtown", "Ramses", "Corniche", "Nasr City"] as const;

function CamerasPage() {
  const { t, lang } = useLang();
  const { role, emit } = useVT();
  const { customCams, disabledCams, addCamera, toggleCamera } = useMedia();
  const isSupervisor = role === "supervisor";
  const [sel, setSel] = useState(cameras[0]!.id);
  const [test, setTest] = useState<{ id: string; ok: boolean; ms: number; loss: number } | null>(null);
  const [form, setForm] = useState({ en: "", ar: "", zone: ZONES[0] as string, lat: "30.0444", lng: "31.2357" });

  const all: ManagedCam[] = useMemo(
    () => [
      ...cameras.map((c) => ({ id: c.id, name: c.name, zone: "Downtown", pos: c.pos, disabled: disabledCams.includes(c.id) })),
      ...customCams.map((c) => ({ ...c, disabled: disabledCams.includes(c.id) })),
    ],
    [customCams, disabledCams],
  );
  const cur = all.find((c) => c.id === sel) ?? all[0]!;
  const health = useMemo(() => healthHistory(cur.id), [cur.id]);

  /** FOV cone: two short rays fanning out from the camera position. */
  const layers = useMemo<IntelLayer[]>(() => {
    const p: [number, number] = [cur.pos.lat, cur.pos.lng];
    return [
      { kind: "node", at: p, label: cur.id, color: cur.disabled ? "#6b7280" : "#facc15" },
      { kind: "path", pts: [p, [p[0] + 0.004, p[1] + 0.002]], color: "#facc15" },
      { kind: "path", pts: [p, [p[0] + 0.004, p[1] - 0.002]], color: "#facc15" },
      { kind: "path", pts: [[p[0] + 0.004, p[1] + 0.002], [p[0] + 0.004, p[1] - 0.002]], color: "#facc15", dashed: true },
    ];
  }, [cur]);

  const submit = () => {
    if (!form.en.trim()) return;
    const id = `CAM-${100 + customCams.length + 1}`;
    addCamera({ id, name: { en: form.en, ar: form.ar || form.en }, zone: form.zone, pos: { lat: +form.lat || 30.0444, lng: +form.lng || 31.2357 }, custom: true });
    emit({ action: `CAMERA ${id} added (${form.zone})`, msg: { en: `Camera ${id} added to ${form.zone}`, ar: `أُضيفت الكاميرا ${id} إلى منطقة ${form.zone}` }, kind: "success" });
    setForm({ en: "", ar: "", zone: ZONES[0], lat: "30.0444", lng: "31.2357" });
    setSel(id);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Camera management", "إدارة الكاميرات")}</h1>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title={`${t("Network", "الشبكة")} · ${all.length}`} className="p-0">
          <ul className="divide-y divide-border">
            {all.map((c) => (
              <li key={c.id} className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${c.id === cur.id ? "bg-primary/5" : ""}`}>
                <button onClick={() => setSel(c.id)} className="flex min-w-0 items-center gap-2 text-start">
                  <span dir="ltr" className={`font-mono text-xs ${c.disabled ? "text-muted-foreground line-through" : "text-primary"}`}>{c.id}</span>
                  <span className="truncate">{c.name[lang]}</span>
                  {c.custom && <span className="border border-det-cyan/50 px-1 font-mono text-[9px] uppercase text-det-cyan">{t("added", "مضافة")}</span>}
                </button>
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${c.disabled ? "bg-muted-foreground" : "bg-success"}`} />
                  <Btn size="sm" variant="ghost" className="h-6 border border-border px-1.5" disabled={!isSupervisor} title={isSupervisor ? undefined : t("Only a supervisor can change cameras.", "لا يغيّر الكاميرات إلا المشرف.")}
                    onClick={() => { toggleCamera(c.id); emit({ action: `CAMERA ${c.id} ${c.disabled ? "enabled" : "disabled"}`, msg: { en: `Camera ${c.id} ${c.disabled ? "back online" : "taken offline"}`, ar: c.disabled ? `عادت الكاميرا ${c.id} للخدمة` : `أُخرجت الكاميرا ${c.id} من الخدمة` }, kind: "warning" }); }}
                    aria-label={c.disabled ? t("Enable", "تشغيل") : t("Disable", "إيقاف")}>
                    <Power className={`h-3 w-3 ${c.disabled ? "text-success" : "text-det-red"}`} />
                  </Btn>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title={`${cur.id} — ${t("FOV & health", "مجال الرؤية والحالة")}`} className="p-0">
            <IntelMap center={[cur.pos.lat + 0.002, cur.pos.lng]} layers={layers} className="h-56" />
            <div className="flex h-10 items-end gap-px border-t border-border p-2" dir="ltr" aria-label={t("24-hour health", "الحالة خلال ٢٤ ساعة")}>
              {health.map((h) => <div key={h.hour} title={`${h.hour}:00 — ${h.ok ? `${h.ms}ms` : "down"}`} className={`flex-1 ${h.ok ? "bg-success" : "bg-det-red"}`} style={{ height: h.ok ? `${30 + (h.ms / 80) * 70}%` : "12%" }} />)}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <Btn size="sm" variant="outline" onClick={() => { const r = testConnection(cur.id); setTest({ id: cur.id, ...r }); emit({ action: `CAMERA ${cur.id} connection test: ${r.ok ? `OK ${r.ms}ms` : "FAILED"}`, msg: { en: r.ok ? `Connection OK — ${r.ms} ms, ${r.loss}% loss` : "Connection test failed", ar: r.ok ? `الاتصال سليم — ${r.ms} مللي ثانية، فقد ${r.loss}٪` : "فشل اختبار الاتصال" }, kind: r.ok ? "success" : "alert" }); }}>
                <PlugZap className="h-3.5 w-3.5" />{t("Test connection", "اختبار الاتصال")}
              </Btn>
              {test && test.id === cur.id && (
                <span dir="ltr" className={`font-mono text-xs ${test.ok ? "text-success" : "text-det-red"}`}>{test.ok ? `OK · ${test.ms}ms · ${test.loss}%` : "TIMEOUT"}</span>
              )}
            </div>
          </Panel>

          <Panel title={t("Add a camera", "إضافة كاميرا")}>
            <div className="space-y-2 p-4 text-sm">
              <input className={inputClass} placeholder={t("Name (English)", "الاسم (بالإنجليزية)")} value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value })} />
              <input className={inputClass} placeholder={t("Name (Arabic)", "الاسم (بالعربية)")} value={form.ar} onChange={(e) => setForm({ ...form, ar: e.target.value })} />
              <div className="flex gap-2" dir="ltr">
                <input className={inputClass} placeholder="lat" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                <input className={inputClass} placeholder="lng" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
              </div>
              <select className={inputClass} value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} aria-label={t("Zone", "المنطقة")}>
                {ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>
              <Btn size="sm" disabled={!isSupervisor || !form.en.trim()} title={isSupervisor ? undefined : t("Only a supervisor can change cameras.", "لا يغيّر الكاميرات إلا المشرف.")} onClick={submit}>
                <Plus className="h-3.5 w-3.5" />{t("Add camera", "إضافة الكاميرا")}
              </Btn>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
