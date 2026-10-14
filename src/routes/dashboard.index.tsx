import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Simulation } from "@/components/vt/Simulation";
import { cases, alerts, cameras, profiles } from "@/data/mock";
import { SearchMap } from "@/components/vt/SearchMap";
import { DetectionBox } from "@/components/vt/DetectionBox";
import { Btn, Panel } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Command Dashboard — VisionTrack AI" },
      { name: "description", content: "The operations view for a search team: open cases, live potential-match alerts, the search-radius map, camera health and the human-review queue." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrack2027.lovable.app/dashboard" },
      { property: "og:title", content: "Command Dashboard — VisionTrack AI" },
      { property: "og:description", content: "Ops-center for missing person cases with human-in-the-loop review." },
      { property: "og:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/dashboard" }],
  }),

  component: Dashboard,
});

const statusColor = { active: "text-primary border-primary/50", review: "text-warning border-warning/50", resolved: "text-success border-success/50" } as const;

function Dashboard() {
  const { t, lang } = useLang();
  const [sel, setSel] = useState<string>(cases[0].id);
  const [log, setLog] = useState<string[]>(["14:52:08 SYSTEM  alert raised CAM-014 (87%)", "14:20:00 INTAKE  case opened by Officer #217"]);
  const c = cases.find((x) => x.id === sel)!;
  const kpis = [
    { l: t("Time to first match", "الزمن حتى أول تطابق"), v: "11m 42s" }, { l: t("Alert precision", "دقة التنبيهات"), v: "88.6%" },
    { l: t("Cases resolved", "حالات مُغلقة"), v: "27" }, { l: t("Avg. response", "متوسط الاستجابة"), v: "19m" },
  ];
  const act = (a: string) => setLog((l) => [`${new Date().toISOString().slice(11, 19)} OFFICER ${a} ${c.id}`, ...l]);
  const cam = cameras[0]!;

  return (
    <div>
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <Panel key={k.l} className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</p>
              <p dir="ltr" className="mt-2 text-2xl font-bold text-primary">{k.v}</p>
            </Panel>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title={t("Active cases", "الحالات النشطة")}>
            <ul>
              {cases.map((x) => (
                <li key={x.id}>
                  <button onClick={() => setSel(x.id)} className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-start text-sm ${sel === x.id ? "bg-primary/10" : "hover:bg-secondary/50"}`}>
                    <span><Link to="/dashboard/case/$id" params={{ id: x.id }} onClick={(e) => e.stopPropagation()} dir="ltr" className="font-mono text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline">{x.id}</Link> · {x.name[lang]}</span>
                    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase ${statusColor[x.status]}`}>{x.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("Live alerts", "تنبيهات حيّة")} right={<span className="h-2 w-2 rounded-full bg-det-red animate-blink" />}>
            <ul className="p-2">
              {alerts.map((a, k) => (
                <li key={k} className="px-2 py-2.5">
                  <div dir="ltr" className="flex justify-between font-mono text-xs"><span className="text-det-red">⚠ {a.cam}</span><span className="text-muted-foreground">{a.case} · {a.time}</span></div>
                  <div className="mt-1.5 h-1 bg-secondary"><div className={`h-full ${a.conf >= 70 ? "bg-det-red" : "bg-warning"}`} style={{ width: `${a.conf}%` }} /></div>
                  <div dir="ltr" className="mt-1 font-mono text-[10px] text-muted-foreground">{t("confidence", "الثقة")} {a.conf}%</div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t("Search zones", "مناطق البحث")}>
            <SearchMap origin={cameras[0]!.pos} radiusKm={1.8} matches={["CAM-014", "CAM-053"]} />
            <div className="grid grid-cols-3 gap-px bg-border font-mono text-[10px]">
              {cameras.map((cm, k) => (
                <div key={cm.id} dir="ltr" className="flex items-center gap-1.5 bg-card px-2 py-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${k === 3 ? "bg-warning" : "bg-success"}`} />{cm.id}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Simulation />

        <Panel title={`${t("Case detail", "تفاصيل الحالة")} — ${c.id}`}>
          <div className="grid gap-6 p-4 lg:grid-cols-3">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={cam.img} alt="Candidate snapshot" className="h-full w-full object-cover object-center opacity-80" />
                <DetectionBox label="CANDIDATE" confidence={c.top} color="red" x={52} y={30} w={7} h={24} alert />
              </div>
              <dl className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Name", "الاسم")}</dt><dd>{c.name[lang]}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Age", "العمر")}</dt><dd>{c.age}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Elapsed", "الوقت المنقضي")}</dt><dd dir="ltr">{c.elapsed}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">{t("Clothing", "الملابس")}</dt><dd>{profiles[0]!.clothing[lang]}</dd></div>
              </dl>
            </div>
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Ranked candidates", "المرشحون حسب نسبة الثقة")}</h4>
              {[c.top, c.top - 16, c.top - 29].filter((v) => v > 0).map((v, k) => (
                <div key={k} className="mb-3 border border-border p-3">
                  <div dir="ltr" className="flex justify-between font-mono text-xs"><span>{cameras[k]!.id}</span><span className={v >= 70 ? "text-det-red" : "text-warning"}>{v}%</span></div>
                  <div className="mt-2 h-1 bg-secondary"><div className="h-full bg-primary" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
              <p className="mb-3 text-xs text-warning">{t("Potential matches — require human review.", "تطابقات محتملة — تتطلب مراجعة بشرية.")}</p>
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="success" onClick={() => act("CONFIRMED top candidate for")}><Check className="h-3.5 w-3.5" />{t("Confirm", "تأكيد")}</Btn>
                <Btn size="sm" variant="ghost" className="border border-border" onClick={() => act("REJECTED top candidate for")}><X className="h-3.5 w-3.5" />{t("Reject", "رفض")}</Btn>
                <Btn size="sm" variant="alert" onClick={() => act("DISPATCHED unit for")}>{t("Dispatch", "توجيه فريق")}</Btn>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Audit log", "سجل التدقيق")}</h4>
              <ul dir="ltr" className="max-h-64 space-y-1.5 overflow-auto font-mono text-[11px] text-muted-foreground">
                {log.map((l, k) => <li key={k} className={k === 0 ? "text-foreground" : ""}>{l}</li>)}
              </ul>
            </div>
          </div>
        </Panel>

      </div>
    </div>
  );
}
