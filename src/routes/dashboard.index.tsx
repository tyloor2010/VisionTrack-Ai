import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Truck, RotateCcw } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cameras } from "@/data/mock";
import { SearchMap } from "@/components/vt/SearchMap";
import { Btn, Panel } from "@/components/vt/ui";
import { Simulation } from "@/components/vt/Simulation";
import { useLang } from "@/lib/i18n";
import { useVT, computeKpis, STATUS_LABEL, can, type CaseStatus } from "@/lib/store";
import { GlobalSearch } from "@/components/vt/GlobalSearch";
import { FilterBuilder } from "@/components/vt/SavedViews";
import { ReviewControls } from "@/components/vt/ReviewControls";
import { HandoverPanel } from "@/components/vt/CaseTools";

export const Route = createFileRoute("/dashboard/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Command Dashboard — VisionTrack AI" },
      { name: "description", content: "The operations view for a search team: open cases, live potential-match alerts, the search-radius map, unit dispatch and the human-review queue." },
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

export const statusClass: Record<CaseStatus, string> = {
  reported: "text-muted-foreground border-border", active: "text-primary border-primary/50", potential: "text-det-red border-det-red/50",
  review: "text-warning border-warning/50", dispatched: "text-det-magenta border-det-magenta/50", resolved: "text-success border-success/50",
};

function Dashboard() {
  const { t, lang } = useLang();
  const { cases, alerts, units, audit, role, confirmAlert, rejectAlert, dispatch, reset } = useVT();
  const [sel, setSel] = useState<string>("VT-2041");
  const k = useMemo(() => computeKpis(cases, alerts), [cases, alerts]);
  const c = cases.find((x) => x.id === sel) ?? cases[0];
  const open = alerts.filter((a) => a.state === "open").sort((a, b) => b.conf - a.conf);
  const fmtMin = (m: number | null) => (m === null ? "—" : m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`);
  const kpis = [
    { l: t("Time to first match", "الزمن حتى أول تطابق"), v: fmtMin(k.firstMatchMin) },
    { l: t("Alert precision", "دقة التنبيهات"), v: k.precision === null ? "—" : `${(k.precision * 100).toFixed(1)}%`, s: `${k.confirmed}✓ / ${k.rejected}✗` },
    { l: t("Cases resolved", "حالات مُغلقة"), v: String(k.resolved), s: `/ ${cases.length}` },
    { l: t("Avg. response", "متوسط الاستجابة"), v: fmtMin(k.avgResponseMin) },
  ];
  const byStatus = (Object.keys(STATUS_LABEL) as CaseStatus[]).map((s) => ({ s: STATUS_LABEL[s][lang], n: cases.filter((x) => x.status === s).length }));
  const camMatches = Array.from(new Set(open.map((a) => a.cam)));
  const reviewTip = can(role, "reviewAlert") ? undefined : t("Only an investigator or supervisor can review alerts.", "لا يملك مراجعة التنبيهات إلا المحقّق أو المشرف.");
  const dispatchTip = can(role, "dispatch") ? undefined : t("Only a field officer or supervisor can dispatch.", "لا يملك التوجيه إلا الضابط الميداني أو المشرف.");

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <GlobalSearch />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((x) => (
          <Panel key={x.l} className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{x.l}</p>
            <p dir="ltr" className="mt-2 text-2xl font-bold text-primary">{x.v} {x.s && <span className="text-xs font-normal text-muted-foreground">{x.s}</span>}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t("Cases", "الحالات")} right={<span dir="ltr" className="font-mono text-[10px] text-muted-foreground">{cases.length}</span>}>
          <ul className="max-h-[420px] overflow-auto">
            {cases.map((x) => (
              <li key={x.id} className={`flex items-center justify-between border-b border-border px-4 py-2.5 text-sm ${sel === x.id ? "bg-primary/10" : "hover:bg-secondary/50"}`}>
                <button onClick={() => setSel(x.id)} className="flex-1 text-start"><span dir="ltr" className="font-mono text-xs text-muted-foreground">{x.id}</span> · {x.name[lang]}</button>
                <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase ${statusClass[x.status]}`}>{STATUS_LABEL[x.status][lang]}</span>
                <Link to="/dashboard/case/$id" params={{ id: x.id }} className="ms-2 font-mono text-[10px] text-primary hover:underline">{t("Open", "فتح")}</Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("Live alerts — review queue", "تنبيهات حيّة — قائمة المراجعة")} right={<span dir="ltr" className="font-mono text-[10px] text-det-red">{open.length} open</span>}>
          <ul className="max-h-[420px] overflow-auto p-2" aria-live="polite">
            {open.length === 0 && <li className="p-6 text-center text-xs text-muted-foreground">{t("No open alerts.", "لا توجد تنبيهات مفتوحة.")}</li>}
            {open.map((a) => (
              <li key={a.id} className="border-b border-border px-2 py-2.5">
                <div dir="ltr" className="flex justify-between font-mono text-xs"><span className="text-det-red">⚠ {a.cam}</span><span className="text-muted-foreground">{a.caseId} · {new Date(a.at).toLocaleTimeString("en-GB")}</span></div>
                <div className="mt-1.5 h-1 bg-secondary"><div className={`h-full ${a.conf >= 70 ? "bg-det-red" : "bg-warning"}`} style={{ width: `${a.conf}%` }} /></div>
                <div className="mt-1 flex items-center justify-between">
                  <span dir="ltr" className="font-mono text-[10px] text-muted-foreground">{t("potential match", "تطابق محتمل")} {a.conf}%</span>
                  <span className="flex gap-1">
                    <ReviewControls alertId={a.id} />
                    <Btn size="sm" variant="alert" className="h-6 px-2" title={dispatchTip} disabled={!!dispatchTip} onClick={() => dispatch(a.caseId, a.id)} aria-label={t("Dispatch unit", "توجيه فريق")}><Truck className="h-3 w-3" /></Btn>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("Search zones & units", "مناطق البحث والفرق")}>
          <SearchMap origin={c?.lastSeen ?? cameras[0]!.pos} radiusKm={1.8} matches={camMatches} />
          <ul className="grid grid-cols-2 gap-px bg-border font-mono text-[10px]">
            {units.map((u) => (
              <li key={u.id} dir="ltr" className="flex items-center gap-1.5 bg-card px-2 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${u.busyWith ? "bg-warning" : "bg-success"}`} />{u.name}{u.busyWith && <span className="text-muted-foreground"> → {u.busyWith}</span>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Cases by status", "الحالات حسب الوضع")}>
          <div className="h-56 p-3" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}><XAxis dataKey="s" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={0} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={24} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} /><Bar dataKey="n" fill="var(--primary)" /></BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title={t("Audit log", "سجل التدقيق")} right={<button onClick={() => { if (confirm(t("Reset all demo data?", "إعادة ضبط جميع البيانات التجريبية؟"))) reset(); }} className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary"><RotateCcw className="h-3 w-3" />{t("Reset demo data", "إعادة ضبط البيانات")}</button>}>
          <ul dir="ltr" className="h-56 space-y-1 overflow-auto p-3 font-mono text-[11px] text-muted-foreground">
            {audit.length === 0 && <li>— {t("no actions yet", "لا إجراءات بعد")} —</li>}
            {audit.map((e, i) => <li key={e.id} className={i === 0 ? "text-foreground" : ""}><span className="text-primary">{new Date(e.at).toLocaleTimeString("en-GB")}</span> {e.role.toUpperCase()} · {e.action}</li>)}
          </ul>
        </Panel>
      </div>

      <FilterBuilder />
      <HandoverPanel />
      <Simulation />
    </div>
  );
}
