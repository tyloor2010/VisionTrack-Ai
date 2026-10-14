import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HelpCircle, X, Printer, Battery, Crosshair } from "lucide-react";
import { cameras, profiles, media } from "@/data/mock";
import { useVT, STATUS_LABEL, TRANSITIONS, canTransition, can, type CaseStatus } from "@/lib/store";
import { statusClass } from "./dashboard.index";
import { DetectionBox } from "@/components/vt/DetectionBox";
import { Btn, Panel } from "@/components/vt/ui";
import { IntelligenceModule } from "@/components/vt/Intelligence";
import { IntelMap } from "@/components/vt/IntelMap";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/case/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Case ${params.id} — VisionTrack AI` },
      { name: "description", content: "Case file: profile, timeline, ranked potential matches with explanations, drone feed, hospital cross-check and abduction response tools." },
      { property: "og:title", content: `Case ${params.id} — VisionTrack AI` },
      { property: "og:description", content: "A full case file in the VisionTrack AI command dashboard (demo data)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasePage,
});

function CasePage() {
  const { id } = Route.useParams();
  const [why, setWhy] = useState<number | null>(null);
  const [follow, setFollow] = useState(false);
  const [report, setReport] = useState(false);
  const { t, lang } = useLang();
  const { cases, alerts, role, transition, dispatch, confirmAlert, rejectAlert } = useVT();
  const c = cases.find((x) => x.id === id);
  if (!c) return <p className="p-10 text-center font-mono text-muted-foreground">NO CASE DETECTED — {id}</p>;
  const idx = cases.indexOf(c);
  const p0 = profiles[idx % profiles.length]!;
  const p = { ...p0, clothing: c.clothing, lastSeenPos: c.lastSeen };
  const caseAlerts = alerts.filter((a) => a.caseId === c.id).sort((a, b) => b.conf - a.conf);
  const nexts = Object.keys(TRANSITIONS[c.status] ?? {}) as CaseStatus[];
  const top = caseAlerts[0]?.conf ?? 0;
  const cands = caseAlerts.map((a) => a.conf);
  const fmt = (ms: number) => new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const timeline = c.timeline.map((e) => [fmt(e.at), e.msg[lang]] as const);
  const elapsed = (() => { const m = Math.round(((c.resolvedAt ?? Date.now()) - c.openedAt) / 60000); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; })();
  const hospitals = [
    { n: t("Kasr Al Ainy Hospital", "مستشفى القصر العيني"), s: t("No match", "لا يوجد تطابق"), ok: false },
    { n: t("Al Demerdash Hospital", "مستشفى الدمرداش"), s: t("Pending reply", "بانتظار الرد"), ok: null },
    { n: t("Dar Al Mosenin care home", "دار رعاية المسنين"), s: t("Possible — 1 unidentified, age fits", "محتمل — شخص مجهول الهوية والعمر مطابق"), ok: true },
  ];

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/dashboard" className="font-mono text-xs text-muted-foreground hover:text-primary">← {t("Dashboard", "لوحة القيادة")}</Link>
        <h1 className="text-2xl font-bold"><span dir="ltr" className="font-mono text-primary">{c.id}</span> · {c.name[lang]}</h1>
        <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase ${statusClass[c.status]}`}>{STATUS_LABEL[c.status][lang]}</span>
        {nexts.map((to) => { const ok = canTransition(c.status, to, role); return (
          <Btn key={to} size="sm" variant={to === "resolved" ? "success" : "outline"} disabled={!ok} title={ok ? undefined : t("Your role can't make this move.", "دورك لا يسمح بهذا الإجراء.")} onClick={() => transition(c.id, to)}>→ {STATUS_LABEL[to][lang]}</Btn>
        ); })}
        {c.status !== "resolved" && <Btn size="sm" variant="alert" disabled={!can(role, "dispatch")} title={can(role, "dispatch") ? undefined : t("Only a field officer or supervisor can dispatch.", "لا يملك التوجيه إلا الضابط الميداني أو المشرف.")} onClick={() => dispatch(c.id)}>{t("Dispatch nearest unit", "توجيه أقرب فريق")}</Btn>}
        {c.status === "resolved" && <Btn size="sm" variant="outline" className="ms-auto" onClick={() => setReport(true)}><Printer className="h-3.5 w-3.5" />{t("After-action report", "تقرير ما بعد الحالة")}</Btn>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t("Profile", "الملف")} className="p-0">
          <dl className="space-y-1.5 p-4 font-mono text-xs">
            {[[t("Age", "العمر"), String(c.age)], [t("Clothing", "الملابس"), p.clothing[lang]], [t("Last seen", "آخر رؤية"), `${p.lastSeen[lang]} · ${p.time}`], [t("Condition", "الحالة الصحية"), p.condition[lang]], [t("Elapsed", "الوقت المنقضي"), elapsed]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-end">{v}</dd></div>
            ))}
          </dl>
          <h4 className="px-4 pt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Timeline", "الخط الزمني")}</h4>
          <ol className="space-y-1.5 p-4 text-xs">{timeline.map(([tm, l]) => <li key={tm}><span dir="ltr" className="font-mono text-primary">{tm}</span> · {l}</li>)}</ol>
        </Panel>

        <Panel title={t("Ranked potential matches", "التطابقات المحتملة مرتبة")}>
          <div className="space-y-3 p-4">
            {cands.length === 0 && <p className="text-xs text-muted-foreground">{t("No potential matches yet.", "لا توجد تطابقات محتملة بعد.")}</p>}
            {cands.map((v, k) => (
              <div key={k} className="border border-border p-3">
                <div dir="ltr" className="flex justify-between font-mono text-xs"><span>{caseAlerts[k]!.cam} · <span className="text-muted-foreground">{caseAlerts[k]!.state}</span></span><span className={v >= 70 ? "text-det-red" : "text-warning"}>{v}%</span></div>
                <div className="mt-2 h-1 bg-secondary"><div className="h-full bg-primary" style={{ width: `${v}%` }} /></div>
                {caseAlerts[k]!.state === "open" && <span className="mt-2 flex gap-1"><Btn size="sm" variant="success" className="h-6 px-2 text-[10px]" disabled={!can(role, "reviewAlert")} onClick={() => confirmAlert(caseAlerts[k]!.id)}>{t("Confirm", "تأكيد")}</Btn><Btn size="sm" variant="ghost" className="h-6 border border-border px-2 text-[10px]" disabled={!can(role, "reviewAlert")} onClick={() => rejectAlert(caseAlerts[k]!.id)}>{t("Reject", "رفض")}</Btn></span>}
                <button onClick={() => setWhy(k)} className="mt-2 flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"><HelpCircle className="h-3 w-3" />{t("Why this match?", "لماذا هذا التطابق؟")}</button>
              </div>
            ))}
            <p className="text-xs text-warning">{t("Potential matches — require human review.", "تطابقات محتملة — تتطلب مراجعة بشرية.")}</p>
          </div>
        </Panel>

        <Panel title={t("Drone feed — D1", "بث الطائرة المسيّرة — D1")} right={<label className="flex items-center gap-1.5 font-mono text-[10px]"><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} className="accent-[var(--primary)]" /><Crosshair className="h-3 w-3" />{t("Follow target", "تتبّع الهدف")}</label>}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img src={media.aerialV2x} alt={t("Aerial view", "منظر جوي")} className={`h-full w-full object-cover transition-transform duration-1000 ${follow ? "scale-150" : ""}`} style={{ transformOrigin: "55% 45%" }} />
            <DetectionBox label="person" confidence={82} color="yellow" x={50} y={38} w={8} h={14} jitter />
            <DetectionBox label="car" confidence={91} color="green" x={22} y={58} w={18} h={14} />
            <div dir="ltr" className="absolute start-2 top-2 space-y-0.5 bg-background/70 px-1.5 py-1 font-mono text-[10px]">
              <div className="flex items-center gap-1"><Battery className="h-3 w-3" /> 72%</div><div>ALT 120 m</div><div>30.0447N 31.2362E</div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Wandering predictor", "توقّع مسار التجوّل")}>
          <IntelMap center={[p.lastSeenPos.lat, p.lastSeenPos.lng + 0.008]} className="h-64" layers={[
            { kind: "zone", at: [p.lastSeenPos.lat + 0.004, p.lastSeenPos.lng + 0.012], rx: 0.7, label: "58%" },
            { kind: "path", pts: [[p.lastSeenPos.lat, p.lastSeenPos.lng], [p.lastSeenPos.lat + 0.004, p.lastSeenPos.lng + 0.012], [p.lastSeenPos.lat + 0.008, p.lastSeenPos.lng + 0.024]], color: "#facc15", dashed: true },
            { kind: "node", at: [p.lastSeenPos.lat, p.lastSeenPos.lng], label: "LAST SEEN", color: "#facc15" },
            { kind: "node", at: [p.lastSeenPos.lat - 0.004, p.lastSeenPos.lng + 0.016], label: t("Old home", "المنزل القديم"), color: "#22c55e" },
          ]} />
          <p className="p-3 text-xs text-muted-foreground">{t("Straight-line bias plus familiar places. Potential path — requires human review.", "ميل للسير في خط مستقيم مع مراعاة الأماكن المألوفة. مسار محتمل يتطلب مراجعة بشرية.")}</p>
        </Panel>
        <Panel title={t("Hospital & shelter cross-check", "مطابقة المستشفيات ودور الرعاية")}>
          <ul className="divide-y divide-border">
            {hospitals.map((h) => (
              <li key={h.n} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{h.n}</span>
                <span className={`font-mono text-xs ${h.ok === true ? "text-warning" : h.ok === null ? "text-muted-foreground" : "text-success"}`}>{h.s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <IntelligenceModule key={c.id} caseId={c.id} />

      {why !== null && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-background/70" onClick={() => setWhy(null)}>
          <aside role="dialog" aria-modal="true" className="h-full w-full max-w-md overflow-auto border-s border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{t("Why this match?", "لماذا هذا التطابق؟")} <span dir="ltr" className="font-mono text-primary">{cands[why]}%</span></h3><button onClick={() => setWhy(null)} aria-label={t("Close", "إغلاق")}><X className="h-4 w-4" /></button></div>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {[media.crosswalkCv, cameras[why % cameras.length]!.img].map((src, k) => (
                <div key={k} className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <DetectionBox label={k ? "candidate" : "reference"} color={k ? "red" : "yellow"} x={30} y={25} w={40} h={50} />
                </div>
              ))}
            </div>
            {[[t("Clothing", "الملابس"), 40], [t("Body shape", "هيئة الجسم"), 25], [t("Timing", "التوقيت"), 20], [t("Location", "الموقع"), 15]].map(([l, w]) => (
              <div key={l} className="mb-3 text-xs">
                <div className="flex justify-between"><span>{l}</span><span dir="ltr" className="font-mono">{w}%</span></div>
                <div className="mt-1 h-1.5 bg-secondary"><div className="h-full bg-primary" style={{ width: `${Number(w) * 2.5}%` }} /></div>
              </div>
            ))}
            <p className="mt-5 border-t border-border pt-3 text-xs text-warning">{t("Potential match — requires human review.", "تطابق محتمل — يتطلب مراجعة بشرية.")}</p>
          </aside>
        </div>
      )}

      {report && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-background/80 p-4" onClick={() => setReport(false)}>
          <div className="w-full max-w-lg border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold">{t("After-action report", "تقرير ما بعد الحالة")} — <span dir="ltr">{c.id}</span></h3>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>{t("Total duration", "المدة الإجمالية")}: <span dir="ltr" className="font-mono">{elapsed}</span></li>
              <li>{t("Potential matches reviewed", "تطابقات محتملة رُوجعت")}: {caseAlerts.length}</li>
              <li>{t("Top confidence", "أعلى نسبة ثقة")}: <span dir="ltr" className="font-mono">{top}%</span></li>
              <li>{t("Response time after alert", "زمن الاستجابة بعد التنبيه")}: <span dir="ltr" className="font-mono">14m</span></li>
            </ul>
            <ol className="mt-4 space-y-1 text-xs text-muted-foreground">{timeline.map(([tm, l]) => <li key={tm}><span dir="ltr" className="font-mono">{tm}</span> · {l}</li>)}</ol>
            <div className="mt-5 flex justify-end gap-2"><Btn size="sm" variant="ghost" onClick={() => setReport(false)}>{t("Close", "إغلاق")}</Btn><Btn size="sm" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" />{t("Print", "طباعة")}</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
}
