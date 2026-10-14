import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert, MessageSquare, Phone, Wifi, Plane, PowerOff, Car, Check, X, Send, Loader2 } from "lucide-react";
import { Btn, Panel, inputClass } from "./ui";
import { DetectionBox } from "./DetectionBox";
import { IntelMap, type IntelLayer, type LL } from "./IntelMap";
import { useLang } from "@/lib/i18n";
import { cameras } from "@/data/mock";

/* ---------- MOCK DATA (no real people, numbers or plates) ---------- */
const LAST: LL = [30.0444, 31.2357];
const towers = [
  { id: "A", at: [30.0465, 31.2335] as LL, km: 0.9 },
  { id: "B", at: [30.0560, 31.2500] as LL, km: 1.1 },
  { id: "C", at: [30.0640, 31.2650] as LL, km: 1.2 },
];
// phone estimate over time (minute -> pos, uncertainty km, confidence)
const track = [
  { m: 0, at: [30.0450, 31.2350] as LL, km: 0.7, conf: 58 },
  { m: 10, at: [30.0480, 31.2390] as LL, km: 0.6, conf: 63 },
  { m: 20, at: [30.0520, 31.2450] as LL, km: 0.5, conf: 69 },
  { m: 30, at: [30.0560, 31.2500] as LL, km: 0.4, conf: 74 },
  { m: 40, at: [30.0600, 31.2580] as LL, km: 0.35, conf: 77 },
  { m: 47, at: [30.0630, 31.2630] as LL, km: 0.3, conf: 81 },
];
type Ev = { t: string; kind: "sms-in" | "sms-out" | "call" | "data" | "airplane" | "off"; num?: string; dur?: string };
const events: Ev[] = [
  { t: "14:03", kind: "sms-in", num: "+20 10•• ••• 41" },
  { t: "14:11", kind: "sms-out", num: "+20 11•• ••• 07" },
  { t: "14:19", kind: "call", num: "+20 12•• ••• 93", dur: "02:48" },
  { t: "14:31", kind: "sms-in", num: "+20 10•• ••• 41" },
  { t: "14:44", kind: "data" },
  { t: "14:49", kind: "airplane" },
  { t: "14:51", kind: "off" },
];
const vehicles = [
  { plate: "ABC 12••", type: "suv", color: "red" as const, score: 78, route: [[30.0447, 31.2362], [30.0505, 31.2450], [30.0560, 31.2505], [30.0628, 31.2625]] as LL[], cams: ["CAM-014 14:42", "CAM-053 14:46", "CAM-022 14:50", "— 14:55"],
    why: { en: ["Stopped near last-seen point 4 min before signal loss", "Left area in direction of tower B"], ar: ["توقّفت قرب آخر نقطة رؤية قبل انقطاع الإشارة بـ4 دقائق", "غادرت المنطقة في اتجاه البرج B"] } },
  { plate: "KRM 7•••", type: "car", color: "magenta" as const, score: 54, route: [[30.0440, 31.2350], [30.0452, 31.2300], [30.0430, 31.2245]] as LL[], cams: ["CAM-014 14:40", "CAM-068 14:43", "CAM-047 14:49"],
    why: { en: ["Passed last-seen point within the time window"], ar: ["مرّت بآخر نقطة رؤية خلال النافذة الزمنية"] } },
  { plate: "SNA 4•••", type: "car", color: "green" as const, score: 31, route: [[30.0444, 31.2357], [30.0400, 31.2400]] as LL[], cams: ["CAM-014 14:30"],
    why: { en: ["Detected 20 min before last sighting"], ar: ["رُصدت قبل آخر رؤية بـ20 دقيقة"] } },
];

const now = () => new Date().toISOString().slice(11, 19);

export function IntelligenceModule({ caseId, officer = "OFC-217" }: { caseId: string; officer?: string }) {
  const { t, lang } = useLang();
  const [role, setRole] = useState<"analyst" | "authorized">("authorized");
  const [abduction, setAbduction] = useState(false);
  const [level, setLevel] = useState<0 | 1 | 2>(0);
  const [modal, setModal] = useState<null | "warrant" | "supervisor">(null);
  const [tab, setTab] = useState<"case" | "intel">("case");
  const [audit, setAudit] = useState<{ ts: string; who: string; a: string }[]>([]);
  const log = (a: string, who = officer) => setAudit((l) => [{ ts: now(), who, a: `${a} [${caseId}]` }, ...l]);

  const openIntel = () => {
    if (level === 0) setModal("warrant");
    else setTab("intel");
  };

  return (
    <Panel title={t("Kidnapping response mode", "وضع الاستجابة لحالات الاختطاف")} right={<span dir="ltr" className="font-mono text-[10px] text-muted-foreground">MOCK DATA</span>}>
      <div className="flex items-center gap-2 border-b border-warning/40 bg-warning/10 px-4 py-2 text-xs text-warning">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        {t("Lawful access only. All actions are logged.", "الوصول القانوني فقط. تُسجَّل جميع الإجراءات.")}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-3 text-sm">
        <label className="flex items-center gap-2 font-mono text-xs">
          {t("Role", "الدور")}
          <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="rounded border border-input bg-background px-2 py-1">
            <option value="authorized">{t("Authorized officer", "ضابط مخوَّل")}</option>
            <option value="analyst">{t("Analyst", "محلل")}</option>
          </select>
        </label>
        <label className={`flex items-center gap-2 ${role !== "authorized" ? "opacity-50" : ""}`}>
          <input type="checkbox" disabled={role !== "authorized"} checked={abduction} onChange={(e) => { setAbduction(e.target.checked); log(e.target.checked ? "FLAGGED suspected abduction" : "CLEARED abduction flag"); if (!e.target.checked) setTab("case"); }} className="h-4 w-4 accent-[var(--det-red)]" />
          <span className="font-semibold">{t("Suspected abduction", "اشتباه في اختطاف")}</span>
        </label>
        {role !== "authorized" && <span className="text-xs text-muted-foreground">{t("Only an authorized officer can set this flag.", "لا يملك تفعيل هذه العلامة إلا ضابط مخوَّل.")}</span>}
        <div className="ms-auto flex gap-1">
          <button onClick={() => setTab("case")} className={`px-3 py-1.5 font-mono text-xs uppercase ${tab === "case" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>{t("Overview", "نظرة عامة")}</button>
          {abduction && (
            <button onClick={openIntel} className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase ${tab === "intel" ? "bg-det-red/20 text-det-red" : "text-muted-foreground"}`}>
              {level === 0 && <Lock className="h-3 w-3" />}{t("Intelligence", "الاستخبارات")}
            </button>
          )}
          {level > 0 && <span dir="ltr" className="ms-2 self-center border border-primary/50 px-1.5 font-mono text-[10px] text-primary">LEVEL {level}</span>}
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {tab === "case" ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {abduction ? t("Open the Intelligence tab. A judicial order is required first.", "افتح تبويب الاستخبارات. يلزم أولًا إدخال أمر قضائي.") : t("Flag the case as a suspected abduction to unlock telecom and vehicle intelligence.", "صنّف الحالة على أنها اشتباه اختطاف لإتاحة بيانات الاتصالات والمركبات.")}
            </p>
          ) : (
            <IntelTabs level={level} onLevel2={() => setModal("supervisor")} log={log} />
          )}
        </div>
        <div>
          <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Audit log — append only", "سجل التدقيق — إضافة فقط")}</h4>
          <ul dir="ltr" className="max-h-96 space-y-1 overflow-auto border border-border bg-background/60 p-2 font-mono text-[10px]">
            {audit.length === 0 && <li className="text-muted-foreground">— no entries —</li>}
            {audit.map((e, k) => (
              <li key={audit.length - k} className={k === 0 ? "text-foreground" : "text-muted-foreground"}>
                <span className="text-primary">{e.ts}</span> {e.who} · {e.a}
              </li>
            ))}
          </ul>
          <p className="mt-1 flex items-center gap-1 font-mono text-[9px] text-muted-foreground"><Lock className="h-2.5 w-2.5" />{t("Entries cannot be edited or deleted", "لا يمكن تعديل السجلات أو حذفها")}</p>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <AuthModal
            kind={modal}
            onCancel={() => setModal(null)}
            onDone={(ref) => {
              if (modal === "warrant") { setLevel(1); setTab("intel"); log(`AUTHORIZED level 1 (metadata) · order ${ref}`); }
              else { setLevel(2); log(`AUTHORIZED level 2 (content) · supervisor ${ref}`, ref); }
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
      {lang && null}
    </Panel>
  );
}

function AuthModal({ kind, onCancel, onDone }: { kind: "warrant" | "supervisor"; onCancel: () => void; onDone: (ref: string) => void }) {
  const { t } = useLang();
  const [f, setF] = useState({ a: "", b: "", c: "" });
  const [state, setState] = useState<"idle" | "checking" | "ok">("idle");
  const fields = kind === "warrant"
    ? [t("Warrant / order number", "رقم الأمر القضائي"), t("Issuing authority", "الجهة المُصدِرة"), t("Officer ID", "الرقم التعريفي للضابط")]
    : [t("Supervisor ID", "الرقم التعريفي للمشرف"), t("Justification", "مبرّر الاطلاع على المحتوى")];
  const vals = [f.a, f.b, f.c];
  const ready = fields.every((_, i) => vals[i]!.trim().length > 1);
  const submit = () => {
    setState("checking");
    setTimeout(() => setState("ok"), 1400);
    setTimeout(() => onDone(f.a.trim()), 2100);
  };
  return (
    <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-background/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl border border-primary/50 bg-card p-6" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <div dir="ltr" className="mb-3 inline-block bg-primary px-1.5 font-mono text-xs font-semibold text-primary-foreground">{kind === "warrant" ? "LEGAL GATE · LEVEL 1" : "LEGAL GATE · LEVEL 2"}</div>
        <h3 className="text-xl font-bold">{kind === "warrant" ? t("Judicial authorization required", "يلزم إذن قضائي") : t("Supervisor approval", "موافقة المشرف")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{kind === "warrant" ? t("Grants metadata only: times, masked numbers, towers. No content.", "يتيح البيانات الوصفية فقط: الأوقات والأرقام المحجوبة والأبراج، دون أي محتوى.") : t("Grants access to message and call content for this case.", "يتيح الاطلاع على محتوى الرسائل والمكالمات لهذه الحالة.")}</p>
        <div className="mt-4 space-y-3">
          {fields.map((l, i) => (
            <label key={l} className="block text-xs">
              <span className="mb-1 block font-mono uppercase tracking-wider text-muted-foreground">{l}</span>
              <input className={inputClass} value={vals[i]} disabled={state !== "idle"} onChange={(e) => setF((p) => ({ ...p, [["a", "b", "c"][i]!]: e.target.value }))} />
            </label>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          {state === "checking" && <span className="me-auto flex items-center gap-2 font-mono text-xs text-warning"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("Verifying…", "جارٍ التحقق…")}</span>}
          {state === "ok" && <span className="me-auto flex items-center gap-2 font-mono text-xs text-success"><Check className="h-3.5 w-3.5" />{t("Verified", "تم التحقق")}</span>}
          <Btn size="sm" variant="ghost" onClick={onCancel} disabled={state !== "idle"}>{t("Cancel", "إلغاء")}</Btn>
          <Btn size="sm" onClick={submit} disabled={!ready || state !== "idle"}>{t("Authorize", "اعتماد")}</Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IntelTabs({ level, onLevel2, log }: { level: 0 | 1 | 2; onLevel2: () => void; log: (a: string) => void }) {
  const { t } = useLang();
  const [sub, setSub] = useState<"telecom" | "anpr" | "fusion">("telecom");
  const tabs = [["telecom", t("Telecom timeline", "الخط الزمني للاتصالات")], ["anpr", t("Vehicle intelligence", "معلومات المركبات")], ["fusion", t("Movement fusion", "دمج مسار الحركة")]] as const;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => { setSub(k); log(`VIEWED ${k}`); }} className={`-mb-px border-b-2 px-3 py-2 font-mono text-xs uppercase ${sub === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{l}</button>
        ))}
        {level === 1 && <Btn size="sm" variant="outline" className="ms-auto mb-1" onClick={onLevel2}><Lock className="h-3 w-3" />{t("Request level 2", "طلب المستوى 2")}</Btn>}
      </div>
      {sub === "telecom" && <Telecom level={level} />}
      {sub === "anpr" && <Anpr log={log} />}
      {sub === "fusion" && <Fusion log={log} />}
    </div>
  );
}

function Locked({ children, open }: { children: React.ReactNode; open: boolean }) {
  return (
    <span className="relative inline-block">
      <span className={open ? "" : "select-none blur-sm"}>{children}</span>
      {!open && <Lock className="absolute inset-0 m-auto h-3.5 w-3.5 text-primary" />}
    </span>
  );
}

function Telecom({ level }: { level: 0 | 1 | 2 }) {
  const { t } = useLang();
  const [i, setI] = useState(track.length - 1);
  const p = track[i]!;
  const layers = useMemo<IntelLayer[]>(() => [
    ...towers.map((x) => ({ kind: "tower" as const, at: x.at, km: x.km, label: `TWR-${x.id}` })),
    { kind: "path", pts: track.slice(0, i + 1).map((x) => x.at), color: "#ef4444", dashed: true },
    { kind: "phone", at: p.at, km: p.km, label: `PHONE ${p.conf}%` },
    { kind: "node", at: LAST, label: "LAST SEEN", color: "#facc15" },
  ], [i, p]);
  const ic = { "sms-in": MessageSquare, "sms-out": MessageSquare, call: Phone, data: Wifi, airplane: Plane, off: PowerOff };
  const lbl = (k: Ev["kind"]) => ({
    "sms-in": t("SMS · incoming", "رسالة · واردة"), "sms-out": t("SMS · outgoing", "رسالة · صادرة"), call: t("Call", "مكالمة"),
    data: t("Last data session", "آخر جلسة بيانات"), airplane: t("Airplane mode on", "تفعيل وضع الطيران"), off: t("Phone switched off", "إغلاق الهاتف"),
  })[k];
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <ol className="relative space-y-3 border-s border-border ps-4">
        <li className="font-mono text-[10px] uppercase text-muted-foreground">{t("Last 60 minutes", "آخر 60 دقيقة")}</li>
        {events.map((e, k) => {
          const I = ic[e.kind];
          return (
            <li key={k} className="relative text-xs">
              <span className={`absolute -start-[21px] top-1 h-2.5 w-2.5 rounded-full ${e.kind === "off" ? "bg-det-red" : "bg-primary"}`} />
              <div className="flex items-center gap-2"><span dir="ltr" className="font-mono text-primary">{e.t}</span><I className="h-3.5 w-3.5" />{lbl(e.kind)}</div>
              {e.num && <div dir="ltr" className="mt-0.5 font-mono text-muted-foreground">{e.num}{e.dur && ` · ${e.dur}`}</div>}
              {e.kind.startsWith("sms") && <div className="mt-1 text-muted-foreground"><Locked open={level === 2}>{t("Message content (mock) — redacted sample text", "محتوى الرسالة (تجريبي) — نص نموذجي")}</Locked></div>}
              {e.kind === "call" && (
                <div className="mt-1.5">
                  <div className="mb-1 font-mono text-[10px] text-muted-foreground">{t("Last 3 minutes of audio", "آخر 3 دقائق من الصوت")}</div>
                  <Locked open={level === 2}>
                    <span className="flex h-6 items-end gap-[2px]">{Array.from({ length: 36 }, (_, j) => <span key={j} className="w-[3px] bg-det-cyan" style={{ height: `${20 + Math.abs(Math.sin(j * 1.7)) * 80}%` }} />)}</span>
                  </Locked>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="min-w-0">
        <div className="relative overflow-hidden border border-border">
          <IntelMap center={[30.054, 31.249]} layers={layers} className="h-80" />
          <div dir="ltr" className="absolute start-2 top-2 z-[500] bg-background/80 px-2 py-1 font-mono text-[10px]">EST. LOCATION · ±{Math.round(p.km * 1000)} m · CONF {p.conf}%</div>
        </div>
        <label className="mt-3 flex items-center gap-3 font-mono text-xs">
          <span dir="ltr">T+{p.m}m</span>
          <input type="range" min={0} max={track.length - 1} value={i} onChange={(e) => setI(+e.target.value)} className="flex-1 accent-[var(--warning)]" aria-label={t("Replay movement", "إعادة عرض الحركة")} />
        </label>
        <p className="mt-2 text-xs text-warning">{t("Tower-based estimate — potential location, requires human review.", "تقدير مبني على الأبراج — موقع محتمل يتطلب مراجعة بشرية.")}</p>
      </div>
    </div>
  );
}

function Anpr({ log }: { log: (a: string) => void }) {
  const { t, lang } = useLang();
  const [sel, setSel] = useState(0);
  const [sent, setSent] = useState(false);
  const [partner, setPartner] = useState<"idle" | "pending" | "done">("idle");
  const v = vehicles[sel]!;
  const tiles = [cameras[0]!, cameras[1]!, cameras[4]!];
  const layers = useMemo<IntelLayer[]>(() => [
    { kind: "path", pts: v.route, color: "#facc15" },
    ...v.route.map((at, k) => ({ kind: "node" as const, at, label: k === v.route.length - 1 ? `LAST SEEN ${v.cams[k]!.split(" ")[1]}` : v.cams[k]!, color: k === v.route.length - 1 ? "#ef4444" : "#facc15" })),
  ], [v]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((c, k) => (
          <div key={c.id} className="relative aspect-video overflow-hidden bg-muted">
            <img src={c.img} alt={c.id} className="h-full w-full object-cover opacity-80" />
            <DetectionBox label={k === 1 ? "car" : "suv"} confidence={88 + k * 3} color="green" x={30} y={45} w={36} h={34} />
            <DetectionBox label={`plate ${93 - k * 4}%`} color="yellow" x={42} y={70} w={12} h={7} />
            <span dir="ltr" className="absolute bottom-1 end-1 bg-background/80 px-1 font-mono text-[10px]">{c.id} · {vehicles[k]!.plate}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div>
          <h4 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Vehicles near last-seen point", "المركبات القريبة من آخر نقطة رؤية")}</h4>
          <p className="mb-2 font-mono text-[10px] text-muted-foreground">{t("Radius 800 m · 14:20–14:55", "نطاق 800 م · 14:20–14:55")}</p>
          <ul className="space-y-2">
            {vehicles.map((x, k) => (
              <li key={x.plate}>
                <button onClick={() => { setSel(k); setSent(false); log(`VIEWED vehicle ${x.plate}`); }} className={`w-full border p-2.5 text-start text-xs ${sel === k ? "border-primary bg-primary/10" : "border-border"}`}>
                  <div dir="ltr" className="flex justify-between font-mono"><span><Car className="me-1 inline h-3.5 w-3.5" />{x.plate} · {x.type}</span><span className={x.score >= 70 ? "text-det-red" : "text-warning"}>{x.score}</span></div>
                  <ul className="mt-1 list-disc ps-4 text-muted-foreground">{x.why[lang].map((w) => <li key={w}>{w}</li>)}</ul>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <div className="overflow-hidden border border-border"><IntelMap center={[30.052, 31.247]} layers={layers} className="h-72" /></div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Btn size="sm" variant="alert" disabled={sent} onClick={() => { setSent(true); log(`DISTRIBUTED checkpoint alert ${v.plate}`); }}><Send className="h-3.5 w-3.5" />{sent ? t("Sent to 6 checkpoints", "أُرسل إلى 6 نقاط تفتيش") : t("Distribute alert to checkpoints", "تعميم تنبيه على نقاط التفتيش")}</Btn>
          </div>
          <div className="mt-3 border border-border p-3 text-xs">
            <div className="mb-2 flex items-center justify-between font-mono uppercase tracking-wider text-muted-foreground">{t("Partner lookup — ride-hailing / taxi", "استعلام الشركاء — النقل التشاركي والأجرة")}
              <Btn size="sm" variant="outline" disabled={partner !== "idle"} onClick={() => { setPartner("pending"); log(`PARTNER lookup ${v.plate}`); setTimeout(() => setPartner("done"), 1800); }}>{t("Request", "إرسال طلب")}</Btn>
            </div>
            <p dir="ltr" className="font-mono">
              {partner === "idle" && "STATUS: —"}
              {partner === "pending" && <span className="text-warning">STATUS: PENDING · awaiting partner response…</span>}
              {partner === "done" && <span className="text-success">STATUS: RECEIVED · 0 active trips match (mock)</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fusion({ log }: { log: (a: string) => void }) {
  const { t } = useLang();
  const [state, setState] = useState<"open" | "confirmed" | "rejected" | "dispatched">("open");
  const nodes: { at: LL; l: string; c: string; time: string; d: { en: string; ar: string } }[] = [
    { at: LAST, l: "1", c: "#facc15", time: "14:20", d: { en: "Last seen — CAM-014", ar: "آخر رؤية — CAM-014" } },
    { at: [30.0465, 31.2335], l: "2", c: "#22d3ee", time: "14:31", d: { en: "SMS via tower A", ar: "رسالة عبر البرج A" } },
    { at: [30.0505, 31.2450], l: "3", c: "#22c55e", time: "14:46", d: { en: "SUV ABC 12•• — CAM-053", ar: "مركبة ABC 12•• — CAM-053" } },
    { at: [30.0560, 31.2500], l: "4", c: "#22d3ee", time: "14:49", d: { en: "Hop to tower B, airplane mode", ar: "انتقال إلى البرج B، وضع الطيران" } },
    { at: [30.0628, 31.2625], l: "5", c: "#ef4444", time: "14:51", d: { en: "Signal lost", ar: "انقطاع الإشارة" } },
  ];
  const layers: IntelLayer[] = [
    { kind: "zone", at: [30.0700, 31.2760], rx: 0.9, label: "ZONE A 62%" },
    { kind: "zone", at: [30.0720, 31.2520], rx: 0.7, label: "ZONE B 24%" },
    { kind: "path", pts: nodes.map((n) => n.at), color: "#ffffff" },
    ...nodes.map((n) => ({ kind: "node" as const, at: n.at, label: n.l, color: n.c })),
  ];
  const act = (s: typeof state, a: string) => { setState(s); log(a); };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 overflow-hidden border border-border"><IntelMap center={[30.058, 31.255]} layers={layers} className="h-96" /></div>
      <div className="space-y-3">
        <ol className="space-y-2 text-xs">
          {nodes.map((n) => (
            <li key={n.l} className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm font-mono text-[10px] font-bold text-ink" style={{ background: n.c }}>{n.l}</span><span><span dir="ltr" className="font-mono text-primary">{n.time}</span> · {t(n.d.en, n.d.ar)}</span></li>
          ))}
        </ol>
        <p className="text-xs text-warning">{t("Potential link — requires human review.", "رابط محتمل — يتطلب مراجعة بشرية.")}</p>
        <div className="border border-det-red/60 bg-det-red/10 p-3">
          <p className="text-sm font-semibold">{t("Potential vehicle link detected", "رُصد رابط محتمل بمركبة")}</p>
          <p dir="ltr" className="mt-1 font-mono text-xs text-det-red">ABC 12•• · {t("Confidence", "الثقة")} 78%</p>
          {state === "open" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn size="sm" variant="success" onClick={() => act("confirmed", "CONFIRMED vehicle link ABC 12••")}><Check className="h-3.5 w-3.5" />{t("Confirm", "تأكيد")}</Btn>
              <Btn size="sm" variant="ghost" className="border border-border" onClick={() => act("rejected", "REJECTED vehicle link ABC 12••")}><X className="h-3.5 w-3.5" />{t("Reject", "رفض")}</Btn>
              <Btn size="sm" variant="alert" onClick={() => act("dispatched", "DISPATCHED checkpoint alert ABC 12••")}>{t("Dispatch checkpoint alert", "إرسال تنبيه لنقاط التفتيش")}</Btn>
            </div>
          ) : (
            <p className="mt-3 font-mono text-xs uppercase text-success">{state === "confirmed" ? t("Confirmed by reviewer", "أكّده المراجِع") : state === "rejected" ? t("Rejected — logged for review", "مرفوض — سُجّل للمراجعة") : t("Checkpoint alert dispatched", "أُرسل التنبيه لنقاط التفتيش")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
