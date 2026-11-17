import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Btn, Panel, inputClass } from "@/components/vt/ui";
import { SearchMap } from "@/components/vt/SearchMap";
import { cameras } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/alerts-composer")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Public Alert Composer — VisionTrack AI" },
      { name: "description", content: "Draw an alert zone, preview the phone notification with limited details and send only after supervisor approval." },
      { property: "og:title", content: "Public Alert Composer — VisionTrack AI" },
      { property: "og:description", content: "Geo-targeted public alerts with a supervisor approval step (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Composer,
});

function Composer() {
  const { t } = useLang();
  const [km, setKm] = useState(1.5);
  const [msg, setMsg] = useState(t("Missing child, age 7, red hoodie. Last seen near Tahrir Sq. Call 122.", "طفل مفقود، 7 سنوات، سترة حمراء. شوهد آخر مرة قرب ميدان التحرير. اتصل بـ122."));
  const [state, setState] = useState<"draft" | "approval" | "approving" | "sent">("draft");
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Geo-targeted public alert", "تنبيه عام موجّه جغرافيًا")}</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel title={t("Alert zone", "منطقة التنبيه")}>
          <SearchMap origin={cameras[0]!.pos} radiusKm={km} fitKm={3} className="h-80" />
          <label className="flex items-center gap-3 p-4 font-mono text-xs">{t("Radius", "النطاق")}
            <input type="range" min={0.5} max={3} step={0.1} value={km} onChange={(e) => setKm(+e.target.value)} className="flex-1 accent-[var(--primary)]" />
            <span dir="ltr">{km.toFixed(1)} km</span>
          </label>
        </Panel>
        <div className="space-y-4">
          <Panel title={t("Message", "نص الرسالة")}>
            <div className="p-4">
              <textarea className={`${inputClass} h-24`} value={msg} maxLength={140} onChange={(e) => setMsg(e.target.value)} aria-label={t("Message", "نص الرسالة")} />
              <p className="mt-1 text-xs text-muted-foreground">{t("No names, addresses or medical details.", "دون أسماء أو عناوين أو تفاصيل طبية.")}</p>
            </div>
          </Panel>
          <div className="mx-auto w-56 rounded-[2rem] border-4 border-border bg-background p-3">
            <div className="rounded-sm border border-det-red/50 bg-card p-3 text-xs">
              <p className="font-bold text-det-red">⚠ {t("Public safety alert", "تنبيه للسلامة العامة")}</p>
              <p className="mt-1">{msg}</p>
            </div>
          </div>
          {state === "draft" && <Btn className="w-full" onClick={() => setState("approval")}>{t("Request supervisor approval", "طلب موافقة المشرف")}</Btn>}
          {state === "approval" && (
            <Panel className="p-4">
              <p className="text-sm">{t("Supervisor review: approve this alert?", "مراجعة المشرف: هل تتم الموافقة على التنبيه؟")}</p>
              <div className="mt-3 flex gap-2"><Btn size="sm" variant="success" onClick={() => { setState("approving"); setTimeout(() => setState("sent"), 1500); }}>{t("Approve & send", "موافقة وإرسال")}</Btn><Btn size="sm" variant="ghost" onClick={() => setState("draft")}>{t("Back", "رجوع")}</Btn></div>
            </Panel>
          )}
          {state === "approving" && <p className="flex items-center gap-2 font-mono text-xs text-warning"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("Sending…", "جارٍ الإرسال…")}</p>}
          {state === "sent" && <p className="flex items-center gap-2 font-mono text-xs text-success"><Check className="h-3.5 w-3.5" />{t(`Sent to ~${Math.round(km * km * 9)}k phones in zone (mock)`, `أُرسل إلى نحو ${Math.round(km * km * 9)} ألف هاتف في المنطقة (تجريبي)`)}</p>}
        </div>
      </div>
    </div>
  );
}
