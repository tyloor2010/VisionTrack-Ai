import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, Plane, Box, Tag, Link2, Unlink } from "lucide-react";
import { useVT, DEVICE_KIND_LABEL, DEVICE_STATUS_LABEL, type Device, type DeviceKind } from "@/lib/store";
import { IntelMap, type IntelLayer } from "@/components/vt/IntelMap";
import { Panel, Btn } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";
import { saveAssignment, useDeviceAssignmentSync } from "@/lib/deviceSync";
import { deviceTrail, trailKm } from "@/lib/deviceHistory";

const KIND_COLOR: Record<DeviceKind, string> = { drone: "#facc15", visionbox: "#22d3ee", tracker: "#4ade80" };
const KIND_ICON: Record<DeviceKind, typeof Plane> = { drone: Plane, visionbox: Box, tracker: Tag };

function Battery({ pct, charging }: { pct: number; charging: boolean }) {
  const Icon = charging ? BatteryCharging : pct > 60 ? BatteryFull : pct > 25 ? BatteryMedium : BatteryLow;
  const color = charging ? "text-det-cyan" : pct > 60 ? "text-success" : pct > 25 ? "text-warning" : "text-det-red";
  return (
    <span className={`flex items-center gap-1 font-mono text-xs ${color}`} dir="ltr">
      <Icon className="h-3.5 w-3.5" />
      {pct}%
    </span>
  );
}

function DeviceRow({ d }: { d: Device }) {
  const { t, lang } = useLang();
  const { cases, assignDevice } = useVT();
  const [pick, setPick] = useState(d.caseId ?? "");
  const Icon = KIND_ICON[d.kind];
  const linked = d.caseId ? cases.find((c) => c.id === d.caseId) : undefined;
  const openCases = cases.filter((c) => c.status !== "resolved");
  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" style={{ color: KIND_COLOR[d.kind] }} />
        <span dir="ltr" className="font-mono text-xs text-primary">{d.id}</span>
        <span className="min-w-0 flex-1 truncate text-sm">{d.name[lang]}</span>
        <Battery pct={d.battery} charging={d.status === "charging"} />
        <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${d.status === "active" ? "border-success/50 text-success" : d.status === "offline" ? "border-det-red/50 text-det-red" : "border-border text-muted-foreground"}`}>
          {DEVICE_STATUS_LABEL[d.status][lang]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {linked ? (
          <>
            <span className="text-warning">{t("Tracking case", "يتتبع الحالة")} <span dir="ltr" className="font-mono">{linked.id}</span> — {linked.name[lang]}</span>
            <Btn variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { if (assignDevice(d.id, undefined)) void saveAssignment(d.id, undefined); setPick(""); }}>
              <Unlink className="h-3 w-3" />{t("Unassign", "إلغاء الإسناد")}
            </Btn>
          </>
        ) : (
          <>
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-7 rounded-sm border border-input bg-background px-2 font-mono text-xs" disabled={d.status === "offline"}>
              <option value="">{t("Assign to case…", "إسناد إلى حالة…")}</option>
              {openCases.map((c) => (
                <option key={c.id} value={c.id}>{c.id} — {c.name[lang]}</option>
              ))}
            </select>
            <Btn variant="outline" size="sm" className="h-6 px-2 text-[10px]" disabled={!pick} onClick={() => { if (assignDevice(d.id, pick)) { void saveAssignment(d.id, pick); setPick(""); } }}>
              <Link2 className="h-3 w-3" />{t("Assign", "إسناد")}
            </Btn>
          </>
        )}
      </div>
    </li>
  );
}

/** Live fleet tracker: VTX-1 drones, Vision Box units and Nano Tracker tags on one map. */
export function DeviceFleet() {
  const { t, lang } = useLang();
  const { devices } = useVT();
  useDeviceAssignmentSync();
  const [hours, setHours] = useState(4);
  const [sel, setSel] = useState<string>("all");
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);
  const trails = useMemo(
    () => (now ? devices.map((d) => ({ d, pts: deviceTrail(d, hours, now) })) : []),
    [devices, hours, now],
  );
  const selTrail = trails.find((x) => x.d.id === sel);

  const layers = useMemo<IntelLayer[]>(
    () => [
      ...trails
        .filter((x) => (sel === "all" || x.d.id === sel) && x.d.kind !== "visionbox")
        .map((x) => ({
          kind: "path" as const,
          pts: x.pts.map((p) => [p.lat, p.lng] as [number, number]),
          color: x.d.status === "offline" ? "#6b7280" : KIND_COLOR[x.d.kind],
          dashed: sel === "all",
        })),
      ...devices.map((d) => ({
        kind: "node" as const,
        at: [d.pos.lat, d.pos.lng] as [number, number],
        label: d.id,
        color: d.status === "offline" ? "#6b7280" : KIND_COLOR[d.kind],
      })),
    ],
    [devices, trails, sel],
  );

  const byKind = (["drone", "visionbox", "tracker"] as const).map((k) => ({
    kind: k,
    list: devices.filter((d) => d.kind === k),
  }));
  const active = devices.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: t("Total devices", "إجمالي الأجهزة"), v: devices.length },
          { l: t("Active now", "نشطة الآن"), v: active },
          { l: t("On a case", "مكلّفة بحالة"), v: devices.filter((d) => d.caseId).length },
          { l: t("Offline", "غير متصلة"), v: devices.filter((d) => d.status === "offline").length },
        ].map((s) => (
          <Panel key={s.l} className="p-3">
            <div className="font-mono text-2xl font-bold text-primary" dir="ltr">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title={t("Live positions — Cairo", "المواقع المباشرة — القاهرة")} className="p-0">
          <IntelMap center={[30.047, 31.238]} layers={layers} className="h-80 sm:h-96" />
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2 text-xs">
            <span className="text-muted-foreground">{t("Trail", "المسار")}</span>
            <select value={sel} onChange={(e) => setSel(e.target.value)} className="h-7 rounded-sm border border-input bg-background px-2 font-mono text-xs">
              <option value="all">{t("All devices", "كل الأجهزة")}</option>
              {devices.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.name[lang]}</option>)}
            </select>
            {[2, 4, 6].map((h) => (
              <Btn key={h} size="sm" variant={hours === h ? "primary" : "outline"} className="h-7 px-2 text-[10px]" onClick={() => setHours(h)}>
                {t(`Last ${h}h`, `آخر ${h} ساعات`)}
              </Btn>
            ))}
          </div>
          {selTrail && (
            <div className="border-t border-border px-4 py-2 text-xs">
              <div className="mb-1 text-muted-foreground">
                {selTrail.d.kind === "visionbox"
                  ? t("Fixed unit — stayed at its mounting point.", "وحدة ثابتة — بقيت في موقع تركيبها.")
                  : t(`Moved about ${trailKm(selTrail.pts).toFixed(1)} km in the last ${hours} hours.`, `تحرّك نحو ${trailKm(selTrail.pts).toFixed(1)} كم خلال آخر ${hours} ساعات.`)}
                {" "}<span className="opacity-70">{t("(simulated history)", "(سجل محاكاة)")}</span>
              </div>
              <ul className="max-h-40 space-y-0.5 overflow-y-auto font-mono text-[11px]" dir="ltr">
                {selTrail.pts.filter((_, i) => i % 3 === 0).reverse().map((p) => (
                  <li key={p.at} className="flex justify-between gap-3">
                    <span>{new Date(p.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-muted-foreground">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-border px-4 py-2 font-mono text-[10px] uppercase text-muted-foreground">
            {(["drone", "visionbox", "tracker"] as const).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: KIND_COLOR[k] }} />
                {DEVICE_KIND_LABEL[k][lang]}
              </span>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          {byKind.map(({ kind, list }) => (
            <Panel key={kind} title={`${DEVICE_KIND_LABEL[kind][lang]} · ${list.length}`} className="p-0">
              <ul className="divide-y divide-border">
                {list.map((d) => (
                  <DeviceRow key={d.id} d={d} />
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
