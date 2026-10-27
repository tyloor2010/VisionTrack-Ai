import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import QRCode from "qrcode";
import { Pin, Trash2, Paperclip, Eye, EyeOff, Link2, Download, Printer, GitMerge, Star } from "lucide-react";
import { useVT, ROLE_LABEL, STATUS_LABEL, type Case, type Role } from "@/lib/store";
import { useCaseTools, computePriority, priorityBand, slaRemaining, SLA_MIN, duplicateScore, extractMentions, checkShare, type RuleCond, type RuleAction } from "@/lib/caseTools";
import { Btn, Panel, inputClass } from "./ui";
import { useLang } from "@/lib/i18n";
import { media } from "@/data/mock";

export const stageStart = (c: Case) => c.timeline[c.timeline.length - 1]?.at ?? c.openedAt;
const ROLES = Object.keys(ROLE_LABEL) as Role[];

function useNow(ms = 1000) {
  const [n, setN] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setN(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return n;
}

export function effectivePriority(c: Case, overrides: Record<string, { score: number }>, now: number) {
  return overrides[c.id]?.score ?? computePriority(c, now).score;
}

type Tab = "notes" | "priority" | "sla" | "dupes" | "share" | "flyer";

export function CaseTools({ c }: { c: Case }) {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("notes");
  const tabs: [Tab, string][] = [["notes", t("Notes", "الملاحظات")], ["priority", t("Priority", "الأولوية")], ["sla", t("SLA & rules", "المهل والقواعد")], ["dupes", t("Duplicates", "الحالات المكررة")], ["share", t("Share links", "روابط المشاركة")], ["flyer", t("Flyer", "النشرة")]];
  return (
    <Panel title={t("Case tools", "أدوات الحالة")}>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border px-2">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 border-b-2 px-3 py-2 font-mono text-xs uppercase tracking-wider ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>
      <div className="p-4">
        {tab === "notes" && <Notes c={c} />}
        {tab === "priority" && <Priority c={c} />}
        {tab === "sla" && <Sla c={c} />}
        {tab === "dupes" && <Dupes c={c} />}
        {tab === "share" && <Share c={c} />}
        {tab === "flyer" && <Flyer c={c} />}
      </div>
    </Panel>
  );
}

/* ---------- Notes ---------- */
function renderRich(text: string) {
  // **bold**, _italic_, @mention
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_|@[\p{L}\w-]+)/u).map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("_") && p.endsWith("_") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p.startsWith("@") ? <span key={i} className="bg-primary/15 px-0.5 text-primary">{p}</span> : p,
  );
}

function Notes({ c }: { c: Case }) {
  const { t, lang } = useLang();
  const { role, emit } = useVT();
  const { notes, addNote, togglePinNote, deleteNote } = useCaseTools();
  const [text, setText] = useState("");
  const [file, setFile] = useState("");
  const list = notes.filter((n) => n.caseId === c.id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at - a.at);
  const canWrite = role !== "family";
  const submit = () => {
    if (!text.trim()) return;
    addNote({ caseId: c.id, role, text: text.trim(), attachment: file || undefined });
    const m = extractMentions(text);
    emit({ action: `NOTE added${m.length ? ` mentions=${m.join(",")}` : ""}`, msg: m.length ? { en: `New note mentions @${m.join(", @")}`, ar: `ملاحظة جديدة تشير إلى @${m.join("، @")}` } : { en: "Note added", ar: "أُضيفت ملاحظة" }, caseId: c.id, quiet: m.length === 0 });
    setText(""); setFile("");
  };
  return (
    <div className="space-y-3">
      {canWrite ? (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} placeholder={t("Write a note… **bold**, _italic_, @supervisor", "اكتب ملاحظة… **عريض**، _مائل_، @supervisor")} aria-label={t("Note", "ملاحظة")} />
          <div className="flex flex-wrap items-center gap-2">
            {ROLES.map((r) => <button key={r} onClick={() => setText((x) => `${x}${x && !x.endsWith(" ") ? " " : ""}@${r} `)} className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-primary">@{r}</button>)}
            <label className="flex cursor-pointer items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary"><Paperclip className="h-3 w-3" />{file || t("Attach (mock)", "إرفاق (تجريبي)")}<input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} /></label>
            <Btn size="sm" className="ms-auto" onClick={submit} disabled={!text.trim()}>{t("Add note", "إضافة ملاحظة")}</Btn>
          </div>
        </div>
      ) : <p className="text-xs text-muted-foreground">{t("Family members can read but not add notes.", "يمكن لأفراد الأسرة الاطلاع دون إضافة ملاحظات.")}</p>}
      {list.length === 0 && <p className="text-xs text-muted-foreground">{t("No notes yet.", "لا توجد ملاحظات بعد.")}</p>}
      <ul className="space-y-2">
        {list.map((n) => (
          <li key={n.id} className={`border p-3 text-sm ${n.pinned ? "border-primary/60 bg-primary/5" : "border-border"}`}>
            <div className="mb-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span>{ROLE_LABEL[n.role][lang]}</span><span dir="ltr">{new Date(n.at).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
              <button className="ms-auto hover:text-primary" aria-label={t("Pin", "تثبيت")} onClick={() => { togglePinNote(n.id); emit({ action: `NOTE ${n.pinned ? "unpinned" : "pinned"}`, msg: { en: "Note pin changed", ar: "تغيّر تثبيت ملاحظة" }, caseId: c.id, quiet: true }); }}><Pin className={`h-3.5 w-3.5 ${n.pinned ? "fill-primary text-primary" : ""}`} /></button>
              {(n.role === role || role === "supervisor") && <button className="hover:text-det-red" aria-label={t("Delete", "حذف")} onClick={() => { deleteNote(n.id); emit({ action: "NOTE deleted", msg: { en: "Note deleted", ar: "حُذفت ملاحظة" }, caseId: c.id, quiet: true }); }}><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
            <p className="whitespace-pre-wrap">{renderRich(n.text)}</p>
            {n.attachment && <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Paperclip className="h-3 w-3" />{n.attachment}</p>}
          </li>
        ))}
      </ul>
      <details className="text-xs"><summary className="cursor-pointer font-mono uppercase tracking-wider text-muted-foreground">{t("Activity timeline", "سجل النشاط")} ({c.timeline.length})</summary>
        <ol className="mt-2 space-y-1">{[...c.timeline].reverse().map((e, i) => <li key={i}><span dir="ltr" className="font-mono text-primary">{new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span> · {e.msg[lang]}</li>)}</ol>
      </details>
    </div>
  );
}

/* ---------- Priority ---------- */
function Priority({ c }: { c: Case }) {
  const { t, lang } = useLang();
  const { role, emit } = useVT();
  const { overrides, setOverride } = useCaseTools();
  const now = useNow(30000);
  const { score, factors } = computePriority(c, now);
  const ov = overrides[c.id];
  const [val, setVal] = useState(ov?.score ?? score);
  const [reason, setReason] = useState("");
  const canOverride = role === "supervisor" || role === "investigator";
  const eff = ov?.score ?? score;
  const band = priorityBand(eff);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="flex items-baseline gap-3"><span dir="ltr" className={`font-mono text-4xl font-bold ${band === "critical" ? "text-det-red" : band === "high" ? "text-warning" : "text-success"}`}>{eff}</span><span className="font-mono text-xs uppercase text-muted-foreground">{band === "critical" ? t("Critical", "حرجة") : band === "high" ? t("High", "مرتفعة") : t("Normal", "عادية")}{ov && ` · ${t("override", "معدّلة يدويًا")}`}</span></div>
        <ul className="mt-3 space-y-2 text-xs">
          {factors.map((f) => (
            <li key={f.key}><div className="flex justify-between"><span>{lang === "ar" ? f.ar : f.en}</span><span dir="ltr" className="font-mono">+{f.points}</span></div><div className="mt-1 h-1 bg-secondary"><div className="h-full bg-primary" style={{ width: `${(f.points / 30) * 100}%` }} /></div></li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">{t("Auto score", "الدرجة التلقائية")}: <span dir="ltr">{score}</span></p>
      </div>
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Manual override", "تعديل يدوي")}</h4>
        <input type="range" min={0} max={100} value={val} disabled={!canOverride} onChange={(e) => setVal(Number(e.target.value))} className="w-full accent-[var(--primary)]" aria-label={t("Priority", "الأولوية")} />
        <div dir="ltr" className="font-mono text-sm">{val}</div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} disabled={!canOverride} className={inputClass} placeholder={t("Reason (required)", "السبب (إلزامي)")} />
        <div className="flex gap-2">
          <Btn size="sm" disabled={!canOverride || reason.trim().length < 3} onClick={() => { setOverride(c.id, { score: val, reason }); emit({ action: `PRIORITY override ${score}→${val} reason="${reason}"`, msg: { en: `Priority set to ${val}`, ar: `ضُبطت الأولوية على ${val}` }, caseId: c.id }); setReason(""); }}>{t("Apply", "تطبيق")}</Btn>
          {ov && <Btn size="sm" variant="ghost" disabled={!canOverride} onClick={() => { setOverride(c.id, null); setVal(score); emit({ action: "PRIORITY override cleared", msg: { en: "Priority back to automatic", ar: "عادت الأولوية إلى الحساب التلقائي" }, caseId: c.id }); }}>{t("Back to auto", "العودة للتلقائي")}</Btn>}
        </div>
        {ov && <p className="text-xs text-muted-foreground">{t("Reason", "السبب")}: {ov.reason}</p>}
        {!canOverride && <p className="text-xs text-muted-foreground">{t("Only investigators and supervisors can override.", "لا يملك التعديل إلا المحقّق أو المشرف.")}</p>}
      </div>
    </div>
  );
}

/* ---------- SLA & rules ---------- */
function Ring({ frac, breached, label }: { frac: number; breached: boolean; label: string }) {
  const r = 34, C = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-24 w-24" role="img" aria-label={label}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--secondary)" strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={breached ? "var(--det-red)" : "var(--primary)"} strokeWidth="6" strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, Math.min(1, frac)))} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle" className="fill-foreground font-mono" fontSize="13">{label}</text>
    </svg>
  );
}

export const COND_LABEL: Record<RuleCond, { en: string; ar: string }> = {
  slaBreached: { en: "SLA overdue by more than (min)", ar: "تجاوز المهلة بأكثر من (دقيقة)" },
  priorityAbove: { en: "Priority above", ar: "الأولوية أعلى من" },
  openAlerts: { en: "Unreviewed alerts more than", ar: "تنبيهات غير مراجَعة أكثر من" },
};
export const ACTION_LABEL: Record<RuleAction, { en: string; ar: string }> = {
  notifySupervisor: { en: "Notify supervisor", ar: "إخطار المشرف" },
  raisePriority: { en: "Raise priority +10", ar: "رفع الأولوية 10 نقاط" },
  notifyAll: { en: "Notify all roles", ar: "إخطار جميع الأدوار" },
};

function Sla({ c }: { c: Case }) {
  const { t, lang } = useLang();
  const { role, emit } = useVT();
  const { rules, addRule, toggleRule, deleteRule } = useCaseTools();
  const now = useNow();
  const rem = slaRemaining(c.status, stageStart(c), now);
  const lim = SLA_MIN[c.status];
  const [cond, setCond] = useState<RuleCond>("slaBreached");
  const [value, setValue] = useState(0);
  const [action, setAction] = useState<RuleAction>("notifySupervisor");
  const fmt = (ms: number) => { const s = Math.abs(Math.round(ms / 1000)); return `${ms < 0 ? "-" : ""}${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const isSup = role === "supervisor";
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="text-center">
        {rem === null ? <p className="text-xs text-muted-foreground">{t("No SLA for this stage.", "لا توجد مهلة لهذه المرحلة.")}</p> : <Ring frac={rem / ((lim ?? 1) * 60000)} breached={rem < 0} label={fmt(rem)} />}
        <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{STATUS_LABEL[c.status][lang]}{lim && ` · ${lim} ${t("min", "د")}`}</p>
        {rem !== null && rem < 0 && <p className="font-mono text-[10px] uppercase text-det-red">{t("Overdue", "تجاوزت المهلة")}</p>}
      </div>
      <div className="space-y-3">
        <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("Escalation rules", "قواعد التصعيد")}</h4>
        <ul className="space-y-1.5 text-xs">
          {rules.map((r) => (
            <li key={r.id} className={`flex flex-wrap items-center gap-2 border border-border px-2 py-1.5 ${r.enabled ? "" : "opacity-50"}`}>
              <span className="font-mono text-primary">{t("IF", "إذا")}</span>{COND_LABEL[r.cond][lang]} <span dir="ltr" className="font-mono">{r.value}</span>
              <span className="font-mono text-primary">{t("THEN", "إذن")}</span>{ACTION_LABEL[r.action][lang]}
              <span className="ms-auto flex gap-2">
                <button disabled={!isSup} className="font-mono text-[10px] uppercase hover:text-primary disabled:opacity-40" onClick={() => { toggleRule(r.id); emit({ action: `RULE ${r.id} ${r.enabled ? "disabled" : "enabled"}`, msg: { en: "Escalation rule updated", ar: "حُدّثت قاعدة تصعيد" }, quiet: true }); }}>{r.enabled ? t("On", "مفعّلة") : t("Off", "معطّلة")}</button>
                <button disabled={!isSup} aria-label={t("Delete", "حذف")} className="hover:text-det-red disabled:opacity-40" onClick={() => { deleteRule(r.id); emit({ action: `RULE ${r.id} deleted`, msg: { en: "Rule deleted", ar: "حُذفت القاعدة" }, quiet: true }); }}><Trash2 className="h-3.5 w-3.5" /></button>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono text-primary">{t("IF", "إذا")}</span>
          <select value={cond} onChange={(e) => setCond(e.target.value as RuleCond)} className={`${inputClass} h-8 w-auto`} disabled={!isSup}>{(Object.keys(COND_LABEL) as RuleCond[]).map((k) => <option key={k} value={k}>{COND_LABEL[k][lang]}</option>)}</select>
          <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className={`${inputClass} h-8 w-20`} disabled={!isSup} aria-label={t("Value", "القيمة")} />
          <span className="font-mono text-primary">{t("THEN", "إذن")}</span>
          <select value={action} onChange={(e) => setAction(e.target.value as RuleAction)} className={`${inputClass} h-8 w-auto`} disabled={!isSup}>{(Object.keys(ACTION_LABEL) as RuleAction[]).map((k) => <option key={k} value={k}>{ACTION_LABEL[k][lang]}</option>)}</select>
          <Btn size="sm" disabled={!isSup} onClick={() => { addRule({ cond, value, action }); emit({ action: `RULE added ${cond}>${value} -> ${action}`, msg: { en: "Escalation rule added", ar: "أُضيفت قاعدة تصعيد" } }); }}>{t("Add rule", "إضافة قاعدة")}</Btn>
        </div>
        {!isSup && <p className="text-xs text-muted-foreground">{t("Only a supervisor can edit escalation rules.", "لا يعدّل قواعد التصعيد إلا المشرف.")}</p>}
        <p className="text-[11px] text-muted-foreground">{t("Rules are checked every 30 seconds while the command dashboard is open.", "تُفحص القواعد كل 30 ثانية ما دامت لوحة القيادة مفتوحة.")}</p>
      </div>
    </div>
  );
}

/** Runs escalation rules against all open cases. Mounted once in the dashboard layout. */
export function EscalationRunner() {
  useEffect(() => {
    const run = () => {
      const { cases, alerts, emit } = useVT.getState();
      const { rules, fired, markFired, overrides, setOverride } = useCaseTools.getState();
      const now = Date.now();
      for (const c of cases) {
        if (c.status === "resolved") continue;
        for (const r of rules) {
          if (!r.enabled) continue;
          const key = `${r.id}:${c.id}:${c.status}`;
          if (fired.includes(key)) continue;
          const rem = slaRemaining(c.status, stageStart(c), now);
          const pr = effectivePriority(c, overrides, now);
          const open = alerts.filter((a) => a.caseId === c.id && a.state === "open").length;
          const hit = r.cond === "slaBreached" ? rem !== null && -rem > r.value * 60000 : r.cond === "priorityAbove" ? pr > r.value : open > r.value;
          if (!hit) continue;
          markFired(key);
          if (r.action === "raisePriority") setOverride(c.id, { score: Math.min(100, pr + 10), reason: `Auto-escalation ${r.id}` });
          const who = r.action === "notifyAll" ? { en: "all roles", ar: "جميع الأدوار" } : r.action === "notifySupervisor" ? { en: "supervisor", ar: "المشرف" } : { en: "priority raised", ar: "رُفعت الأولوية" };
          emit({ action: `ESCALATION ${r.id} ${r.cond} -> ${r.action}`, msg: { en: `Escalation on ${c.id}: ${who.en}`, ar: `تصعيد للحالة ${c.id}: ${who.ar}` }, kind: "warning", caseId: c.id });
        }
      }
    };
    const first = setTimeout(run, 4000);
    const id = setInterval(run, 30000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  return null;
}

/* ---------- Duplicates ---------- */
function Dupes({ c }: { c: Case }) {
  const { t, lang } = useLang();
  const { cases, role, emit, transition } = useVT();
  const { merged, merge } = useCaseTools();
  const cands = useMemo(() => cases.filter((x) => x.id !== c.id && !merged[x.id]).map((x) => ({ x, s: duplicateScore(c, x) })).filter((d) => d.s >= 40).sort((a, b) => b.s - a.s), [cases, c, merged]);
  const [sel, setSel] = useState<string | null>(null);
  const other = cands.find((d) => d.x.id === sel)?.x;
  const canMerge = role === "supervisor";
  if (merged[c.id]) return <p className="text-sm">{t("This case was merged into", "دُمجت هذه الحالة في")} <Link to="/dashboard/case/$id" params={{ id: merged[c.id]! }} className="font-mono text-primary">{merged[c.id]}</Link>.</p>;
  return (
    <div className="space-y-3">
      {cands.length === 0 && <p className="text-xs text-muted-foreground">{t("No likely duplicates (similarity below 40%).", "لا توجد حالات مكررة مرجّحة (التشابه أقل من 40%).")}</p>}
      <ul className="space-y-1">
        {cands.map(({ x, s }) => (
          <li key={x.id}><button onClick={() => setSel(x.id)} className={`flex w-full items-center justify-between border px-3 py-2 text-sm ${sel === x.id ? "border-primary" : "border-border"}`}><span><span dir="ltr" className="font-mono text-primary">{x.id}</span> · {x.name[lang]}</span><span dir="ltr" className="font-mono text-xs">{s}%</span></button></li>
        ))}
      </ul>
      {other && (
        <div className="space-y-3">
          <table className="w-full text-xs">
            <thead><tr className="text-muted-foreground"><th className="py-1 text-start">{t("Field", "الحقل")}</th><th className="text-start" dir="ltr">{c.id}</th><th className="text-start" dir="ltr">{other.id}</th></tr></thead>
            <tbody>
              {([[t("Name", "الاسم"), c.name[lang], other.name[lang]], [t("Age", "العمر"), c.age, other.age], [t("Clothing", "الملابس"), c.clothing[lang], other.clothing[lang]], [t("Status", "الحالة"), STATUS_LABEL[c.status][lang], STATUS_LABEL[other.status][lang]], [t("Reported", "تاريخ البلاغ"), new Date(c.openedAt).toLocaleTimeString("en-GB"), new Date(other.openedAt).toLocaleTimeString("en-GB")]] as const).map(([k, a, b]) => (
                <tr key={k} className="border-t border-border"><td className="py-1 text-muted-foreground">{k}</td><td className={a === b ? "text-success" : ""}>{a}</td><td className={a === b ? "text-success" : ""}>{b}</td></tr>
              ))}
            </tbody>
          </table>
          <Btn size="sm" disabled={!canMerge} onClick={() => { merge(other.id, c.id); if (other.status !== "resolved") transition(other.id, "resolved"); emit({ action: `MERGE ${other.id} into ${c.id}`, msg: { en: `${other.id} merged into ${c.id}`, ar: `دُمجت ${other.id} في ${c.id}` }, caseId: c.id, kind: "success" }); setSel(null); }}><GitMerge className="h-3.5 w-3.5" />{t("Merge into this case", "دمج في هذه الحالة")}</Btn>
          {!canMerge && <p className="text-xs text-muted-foreground">{t("Only a supervisor can merge cases.", "لا يدمج الحالات إلا المشرف.")}</p>}
          <p className="text-xs text-warning">{t("Potential duplicate — requires human review.", "تكرار محتمل — يتطلب مراجعة بشرية.")}</p>
        </div>
      )}
    </div>
  );
}

/* ---------- Share links ---------- */
function Share({ c }: { c: Case }) {
  const { t } = useLang();
  const { role, emit } = useVT();
  const { shares, addShare, openShare, revokeShare } = useCaseTools();
  const [hours, setHours] = useState(24);
  const [maxViews, setMaxViews] = useState(5);
  const [pw, setPw] = useState("");
  const [tryPw, setTryPw] = useState<Record<string, string>>({});
  const list = shares.filter((s) => s.caseId === c.id);
  const canShare = role === "supervisor" || role === "investigator";
  const REASON: Record<string, string> = { ok: t("Opened", "فُتح"), revoked: t("Revoked", "أُلغي"), expired: t("Expired", "انتهت صلاحيته"), limit: t("View limit reached", "بلغ حد المشاهدات"), password: t("Wrong password", "كلمة مرور خاطئة") };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 text-xs">
        <label>{t("Expires in (h)", "ينتهي بعد (ساعة)")}<input type="number" min={1} value={hours} onChange={(e) => setHours(Math.max(1, Number(e.target.value)))} className={`${inputClass} h-8 w-20`} /></label>
        <label>{t("Max views", "أقصى مشاهدات")}<input type="number" min={1} value={maxViews} onChange={(e) => setMaxViews(Math.max(1, Number(e.target.value)))} className={`${inputClass} h-8 w-20`} /></label>
        <label>{t("Password (optional)", "كلمة المرور (اختيارية)")}<input value={pw} onChange={(e) => setPw(e.target.value)} className={`${inputClass} h-8 w-32`} /></label>
        <Btn size="sm" disabled={!canShare} onClick={() => { const l = addShare({ caseId: c.id, expiresAt: Date.now() + hours * 3600000, maxViews, password: pw }); emit({ action: `SHARE link ${l.id} created exp=${hours}h views=${maxViews} pw=${pw ? "yes" : "no"}`, msg: { en: "Secure share link created", ar: "أُنشئ رابط مشاركة آمن" }, caseId: c.id }); setPw(""); }}><Link2 className="h-3.5 w-3.5" />{t("Create link", "إنشاء رابط")}</Btn>
      </div>
      {!canShare && <p className="text-xs text-muted-foreground">{t("Only investigators and supervisors can create share links.", "لا يُنشئ روابط المشاركة إلا المحقّق أو المشرف.")}</p>}
      {list.length === 0 && <p className="text-xs text-muted-foreground">{t("No share links yet.", "لا توجد روابط مشاركة بعد.")}</p>}
      <ul className="space-y-2">
        {list.map((l) => {
          const st = checkShare(l, Date.now(), "__none__");
          const live = st.ok || st.reason === "password";
          return (
            <li key={l.id} className="border border-border p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <code dir="ltr" className="text-primary">vt.link/{l.id.toLowerCase()}</code>
                <span className={live ? "text-success" : "text-det-red"}>{live ? t("Active", "نشط") : REASON[st.reason]}</span>
                <span dir="ltr" className="font-mono text-muted-foreground">{l.views}/{l.maxViews} · {new Date(l.expiresAt).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}</span>
                {!l.revoked && <button className="ms-auto font-mono uppercase text-det-red hover:underline" disabled={!canShare} onClick={() => { revokeShare(l.id); emit({ action: `SHARE link ${l.id} revoked`, msg: { en: "Share link revoked", ar: "أُلغي رابط المشاركة" }, caseId: c.id }); }}>{t("Revoke", "إلغاء")}</button>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{t("Simulate a visitor:", "محاكاة زائر:")}</span>
                {l.password && <input placeholder={t("password", "كلمة المرور")} value={tryPw[l.id] ?? ""} onChange={(e) => setTryPw({ ...tryPw, [l.id]: e.target.value })} className={`${inputClass} h-7 w-28`} />}
                <Btn size="sm" variant="outline" className="h-7" onClick={() => { const r = checkShare(l, Date.now(), tryPw[l.id] ?? ""); openShare(l.id, r.ok, r.reason); emit({ action: `SHARE link ${l.id} open ${r.reason}`, msg: { en: `Share link: ${r.reason}`, ar: `رابط المشاركة: ${REASON[r.reason]}` }, caseId: c.id, quiet: true }); }}><Eye className="h-3 w-3" />{t("Open", "فتح")}</Btn>
              </div>
              {l.log.length > 0 && <ol className="mt-2 space-y-0.5 border-t border-border pt-2">{l.log.slice(0, 5).map((e, i) => <li key={i} className={e.ok ? "text-success" : "text-det-red"}><span dir="ltr" className="font-mono">{new Date(e.at).toLocaleTimeString("en-GB")}</span> · {REASON[e.reason]}</li>)}</ol>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Flyer ---------- */
const SIZES = { a4: [1240, 1754], square: [1080, 1080], story: [1080, 1920] } as const;
type SizeKey = keyof typeof SIZES;

function Flyer({ c }: { c: Case }) {
  const { t, lang: uiLang } = useLang();
  const { emit } = useVT();
  const [tpl, setTpl] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<"en" | "ar">(uiLang);
  const [size, setSize] = useState<SizeKey>("a4");
  const [show, setShow] = useState({ photo: true, age: true, clothing: true, lastSeen: true, condition: false });
  const ref = useRef<HTMLCanvasElement>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/report?case=${c.id}` : `/report?case=${c.id}`;

  useEffect(() => {
    let cancel = false;
    (async () => {
      const cv = ref.current; if (!cv) return;
      const [W, H] = SIZES[size]; cv.width = W; cv.height = H;
      const g = cv.getContext("2d")!;
      const bg = tpl === "dark" ? "#1f2023" : "#f5f5f0", fg = tpl === "dark" ? "#ffffff" : "#111111", acc = "#facc15";
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const rtl = lang === "ar"; g.direction = rtl ? "rtl" : "ltr"; g.textAlign = rtl ? "right" : "left";
      const x = rtl ? W - 70 : 70; const u = W / 1080;
      g.fillStyle = acc; g.fillRect(0, 0, W, 150 * u);
      g.fillStyle = "#111"; g.font = `800 ${78 * u}px Cairo, "Inter Tight", sans-serif`;
      g.fillText(lang === "ar" ? "شخص مفقود" : "MISSING PERSON", x, 105 * u);
      let y = 200 * u;
      if (show.photo) {
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = media.crosswalkCv;
        await new Promise((r) => { img.onload = r; img.onerror = r; });
        if (cancel) return;
        const ph = Math.min(H * 0.38, 560 * u), pw = W - 140;
        try { const s = Math.max(pw / img.width, ph / img.height); g.save(); g.beginPath(); g.rect(70, y, pw, ph); g.clip(); g.drawImage(img, 70 + (pw - img.width * s) / 2, y + (ph - img.height * s) / 2, img.width * s, img.height * s); g.restore(); } catch { g.fillStyle = "#555"; g.fillRect(70, y, pw, ph); }
        y += ph + 70 * u;
      }
      g.fillStyle = fg; g.font = `800 ${72 * u}px Cairo, "Inter Tight", sans-serif`; g.fillText(c.name[lang], x, y); y += 70 * u;
      g.font = `600 ${38 * u}px Cairo, "Inter Tight", sans-serif`;
      const rows: string[] = [];
      if (show.age) rows.push(`${lang === "ar" ? "العمر" : "Age"}: ${c.age}`);
      if (show.clothing) rows.push(`${lang === "ar" ? "الملابس" : "Clothing"}: ${c.clothing[lang]}`);
      if (show.lastSeen) rows.push(`${lang === "ar" ? "آخر رؤية" : "Last seen"}: ${c.lastSeen.lat.toFixed(3)}, ${c.lastSeen.lng.toFixed(3)}`);
      if (show.condition) rows.push(`${lang === "ar" ? "الحالة" : "Profile"}: ${c.profile}`);
      for (const r of rows) { g.fillText(r, x, y); y += 56 * u; }
      const q = 240 * u;
      const qr = await QRCode.toDataURL(url, { margin: 1, width: Math.round(q), color: { dark: "#111111", light: "#ffffff" } });
      const qi = new Image(); qi.src = qr; await new Promise((r) => { qi.onload = r; });
      if (cancel) return;
      const qx = rtl ? 70 : W - 70 - q, qy = H - q - 70 * u;
      g.drawImage(qi, qx, qy, q, q);
      g.fillStyle = fg; g.font = `600 ${32 * u}px Cairo, "Inter Tight", sans-serif`;
      g.fillText(lang === "ar" ? "لديك معلومة؟ امسح الرمز للإبلاغ" : "Seen them? Scan to report", x, qy + 60 * u);
      g.fillStyle = acc; g.font = `700 ${30 * u}px "JetBrains Mono", monospace`;
      g.fillText(c.id, x, qy + 120 * u);
      g.fillStyle = tpl === "dark" ? "#aaa" : "#555"; g.font = `400 ${24 * u}px Cairo, sans-serif`;
      g.fillText(lang === "ar" ? "VisionTrack AI — بيانات تجريبية" : "VisionTrack AI — demo data", x, H - 40 * u);
    })();
    return () => { cancel = true; };
  }, [c, tpl, lang, size, show, url]);

  const download = () => {
    const a = document.createElement("a"); a.download = `${c.id}-flyer-${size}.png`;
    try { a.href = ref.current!.toDataURL("image/png"); } catch { return; }
    a.click(); emit({ action: `FLYER exported png ${size} ${lang} fields=${Object.entries(show).filter(([, v]) => v).map(([k]) => k).join(",")}`, msg: { en: "Flyer downloaded", ar: "نُزّلت النشرة" }, caseId: c.id });
  };
  const pdf = () => {
    let data = ""; try { data = ref.current!.toDataURL("image/png"); } catch { return; }
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<title>${c.id}</title><style>@page{margin:0}body{margin:0}img{width:100%}</style><img src="${data}" onload="print()">`);
    emit({ action: `FLYER exported pdf ${lang}`, msg: { en: "Flyer sent to print / PDF", ar: "أُرسلت النشرة للطباعة / PDF" }, caseId: c.id });
  };
  const FIELDS: [keyof typeof show, string][] = [["photo", t("Photo", "الصورة")], ["age", t("Age", "العمر")], ["clothing", t("Clothing", "الملابس")], ["lastSeen", t("Last seen location", "موقع آخر رؤية")], ["condition", t("Medical profile", "الملف الصحي")]];
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <canvas ref={ref} className="mx-auto max-h-[480px] w-auto max-w-full border border-border" aria-label={t("Flyer preview", "معاينة النشرة")} />
      <div className="space-y-3 text-xs">
        <fieldset><legend className="mb-1 font-mono uppercase text-muted-foreground">{t("Template", "القالب")}</legend>
          {(["dark", "light"] as const).map((k) => <button key={k} onClick={() => setTpl(k)} className={`me-1 border px-2 py-1 ${tpl === k ? "border-primary text-primary" : "border-border"}`}>{k === "dark" ? t("Dark", "داكن") : t("Light", "فاتح")}</button>)}</fieldset>
        <fieldset><legend className="mb-1 font-mono uppercase text-muted-foreground">{t("Language", "اللغة")}</legend>
          {(["en", "ar"] as const).map((k) => <button key={k} onClick={() => setLang(k)} className={`me-1 border px-2 py-1 ${lang === k ? "border-primary text-primary" : "border-border"}`}>{k === "en" ? "English" : "العربية"}</button>)}</fieldset>
        <fieldset><legend className="mb-1 font-mono uppercase text-muted-foreground">{t("Size", "المقاس")}</legend>
          {(Object.keys(SIZES) as SizeKey[]).map((k) => <button key={k} onClick={() => setSize(k)} className={`me-1 mb-1 border px-2 py-1 ${size === k ? "border-primary text-primary" : "border-border"}`}>{k === "a4" ? "A4" : k === "square" ? t("Post 1:1", "منشور 1:1") : t("Story 9:16", "قصة 9:16")}</button>)}</fieldset>
        <fieldset><legend className="mb-1 font-mono uppercase text-muted-foreground">{t("Include (privacy)", "تضمين (الخصوصية)")}</legend>
          {FIELDS.map(([k, l]) => <label key={k} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} className="accent-[var(--primary)]" />{show[k] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{l}</label>)}</fieldset>
        <div className="flex flex-wrap gap-2"><Btn size="sm" onClick={download}><Download className="h-3.5 w-3.5" />PNG</Btn><Btn size="sm" variant="outline" onClick={pdf}><Printer className="h-3.5 w-3.5" />PDF</Btn></div>
        <p className="text-muted-foreground">{t("QR opens the public report page for this case.", "يفتح الرمز صفحة الإبلاغ العامة لهذه الحالة.")}</p>
      </div>
    </div>
  );
}

/* ---------- Watch button, strip & handover (dashboard) ---------- */
export function WatchButton({ kind, id }: { kind: "case" | "camera" | "vehicle"; id: string }) {
  const { t } = useLang();
  const { watch, toggleWatch } = useCaseTools();
  const { emit } = useVT();
  const on = watch.some((w) => w.kind === kind && w.id === id);
  return <Btn size="sm" variant="outline" aria-pressed={on} onClick={() => { toggleWatch({ kind, id }); emit({ action: `WATCH ${on ? "removed" : "added"} ${kind} ${id}`, msg: on ? { en: `Stopped following ${id}`, ar: `أُلغيت متابعة ${id}` } : { en: `Following ${id}`, ar: `تجري متابعة ${id}` }, quiet: true }); }}><Star className={`h-3.5 w-3.5 ${on ? "fill-primary text-primary" : ""}`} />{on ? t("Following", "متابَعة") : t("Follow", "متابعة")}</Btn>;
}

export function WatchStrip() {
  const { t, lang } = useLang();
  const { watch, toggleWatch } = useCaseTools();
  const { cases, alerts } = useVT();
  const [kind, setKind] = useState<"camera" | "vehicle">("camera");
  const [val, setVal] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2 border border-border bg-card/40 px-3 py-2 text-xs">
      <span className="flex items-center gap-1 font-mono uppercase tracking-widest text-primary"><Star className="h-3.5 w-3.5" />{t("Watchlist", "قائمة المتابعة")}</span>
      {watch.length === 0 && <span className="text-muted-foreground">{t("Nothing followed yet.", "لا توجد عناصر متابَعة.")}</span>}
      {watch.map((w) => {
        const c = w.kind === "case" ? cases.find((x) => x.id === w.id) : undefined;
        const camHits = w.kind === "camera" ? alerts.filter((a) => a.cam === w.id && a.state === "open").length : 0;
        return (
          <span key={`${w.kind}-${w.id}`} className="flex items-center gap-1.5 border border-border px-2 py-1">
            {c ? <Link to="/dashboard/case/$id" params={{ id: c.id }} className="font-mono text-primary">{c.id}</Link> : <span dir="ltr" className="font-mono">{w.id}</span>}
            <span className="text-muted-foreground">{c ? STATUS_LABEL[c.status][lang] : w.kind === "camera" ? `${camHits} ${t("open alerts", "تنبيهات مفتوحة")}` : t("no ANPR hit", "لا رصد للوحة")}</span>
            <button aria-label={t("Remove", "إزالة")} className="text-muted-foreground hover:text-det-red" onClick={() => toggleWatch(w)}>×</button>
          </span>
        );
      })}
      <span className="ms-auto flex max-w-full flex-wrap items-center gap-1">
        <select value={kind} onChange={(e) => setKind(e.target.value as "camera" | "vehicle")} className="h-8 w-32 shrink-0 rounded-sm border border-input bg-background px-2 text-sm text-foreground focus:border-primary focus:outline-none"><option value="camera">{t("Camera", "كاميرا")}</option><option value="vehicle">{t("Vehicle plate", "لوحة مركبة")}</option></select>
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={kind === "camera" ? "CAM-014" : "ABC 1234"} className="h-8 w-28 shrink-0 rounded-sm border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none" />
        <Btn size="sm" className="h-7" disabled={!val.trim()} onClick={() => { toggleWatch({ kind, id: val.trim().toUpperCase() }); setVal(""); }}>+</Btn>
      </span>
    </div>
  );
}

export function HandoverPanel() {
  const { t, lang } = useLang();
  const { cases, alerts, role, emit } = useVT();
  const { handovers, addHandover, ackHandover, notes } = useCaseTools();
  const build = () => {
    const open = cases.filter((c) => c.status !== "resolved");
    const pend = alerts.filter((a) => a.state === "open");
    const pinned = notes.filter((n) => n.pinned);
    const L = lang === "ar";
    return [
      `${L ? "الحالات المفتوحة" : "Open cases"} (${open.length}): ${open.map((c) => `${c.id} ${STATUS_LABEL[c.status][lang]}`).join(" · ")}`,
      `${L ? "تنبيهات بانتظار المراجعة" : "Alerts pending review"}: ${pend.length}`,
      `${L ? "ملاحظات مثبّتة" : "Pinned notes"}: ${pinned.length ? pinned.map((n) => `${n.caseId}: ${n.text}`).join(" | ") : L ? "لا يوجد" : "none"}`,
    ].join("\n");
  };
  const last = handovers[0];
  return (
    <Panel title={t("Shift handover", "تسليم المناوبة")}>
      <div className="space-y-3 p-4 text-sm">
        <Btn size="sm" onClick={() => { addHandover({ by: role, summary: build() }); emit({ action: "HANDOVER generated", msg: { en: "Shift handover generated — awaiting next shift", ar: "أُعدّ تسليم المناوبة — بانتظار المناوبة التالية" } }); }}>{t("Generate handover", "إعداد التسليم")}</Btn>
        {last && (
          <div className="border border-border p-3">
            <p className="mb-1 font-mono text-[10px] text-muted-foreground">{ROLE_LABEL[last.by][lang]} · <span dir="ltr">{new Date(last.at).toLocaleString("en-GB")}</span></p>
            <pre className="whitespace-pre-wrap font-sans text-xs">{last.summary}</pre>
            {last.ackBy ? <p className="mt-2 text-xs text-success">{t("Acknowledged by", "استلمه")} {ROLE_LABEL[last.ackBy][lang]} · <span dir="ltr">{new Date(last.ackAt!).toLocaleTimeString("en-GB")}</span></p>
              : <Btn size="sm" variant="success" className="mt-2" disabled={role === last.by} title={role === last.by ? t("The next shift (a different role) must acknowledge.", "يجب أن تستلمه المناوبة التالية (دور مختلف).") : undefined} onClick={() => { ackHandover(last.id, role); emit({ action: `HANDOVER ${last.id} acknowledged`, msg: { en: "Handover acknowledged", ar: "تم استلام المناوبة" }, kind: "success" }); }}>{t("Acknowledge", "تأكيد الاستلام")}</Btn>}
          </div>
        )}
      </div>
    </Panel>
  );
}
