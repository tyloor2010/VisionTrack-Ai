import { useEffect, useState } from "react";
import { BellRing, Trash2, Plus, Zap, Megaphone, Send } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useVT, ROLE_LABEL } from "@/lib/store";
import { cameras } from "@/data/mock";
import { useAlertRules, matchingAlerts, evaluateRules, type RuleActionType } from "@/lib/alertRules";
import { btnClass } from "./ui";
import type { Profile as ProfileType } from "@/lib/store";

const PROFILES: ProfileType[] = ["child", "elderly", "alzheimers", "adult"];

/** Evaluates enabled rules against live alerts every 20s. Mounted in the dashboard layout. */
export function AlertRulesRunner() {
  useEffect(() => {
    const tick = () => {
      const { rules, fired, markFired } = useAlertRules.getState();
      const s = useVT.getState();
      for (const { rule, hits } of evaluateRules(rules, fired, s.alerts, s.cases)) {
        markFired(rule.id, hits.map((h) => h.id));
        const top = hits.reduce((a, b) => (a.conf >= b.conf ? a : b));
        if (rule.action === "dispatch") {
          s.emit({ action: `RULE "${rule.name}" auto-dispatch (${hits.length} alerts)`, msg: { en: `Rule "${rule.name}" triggered dispatch for ${top.caseId}`, ar: `قاعدة «${rule.name}» أطلقت توجيهًا للحالة ${top.caseId}` }, kind: "alert", caseId: top.caseId });
          s.dispatch(top.caseId, top.id);
        } else if (rule.action === "escalate") {
          s.emit({ action: `RULE "${rule.name}" escalated ${hits.length} alert(s), top ${top.conf}%`, msg: { en: `Escalation: "${rule.name}" matched ${hits.length} alert(s) — supervisor attention needed`, ar: `تصعيد: قاعدة «${rule.name}» طابقت ${hits.length} تنبيهًا — تتطلب انتباه المشرف` }, kind: "warning", caseId: top.caseId });
        } else {
          s.emit({ action: `RULE "${rule.name}" matched ${hits.length} alert(s)`, msg: { en: `Rule "${rule.name}" matched ${hits.length} new alert(s)`, ar: `قاعدة «${rule.name}» طابقت ${hits.length} تنبيهًا جديدًا` }, kind: "info", caseId: top.caseId });
        }
      }
    };
    const id = setInterval(tick, 20000);
    const first = setTimeout(tick, 3000);
    return () => { clearInterval(id); clearTimeout(first); };
  }, []);
  return null;
}

/** Alert rules builder: create, preview, enable/disable and delete rules. */
export function AlertRules() {
  const { t, lang } = useLang();
  const role = useVT((s) => s.role);
  const alerts = useVT((s) => s.alerts);
  const cases = useVT((s) => s.cases);
  const { rules, addRule, toggleRule, deleteRule } = useAlertRules();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [minConf, setMinConf] = useState(70);
  const [cams, setCams] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [action, setAction] = useState<RuleActionType>("notify");

  const canEdit = role === "supervisor" || role === "investigator";
  const preview = matchingAlerts({ minConf, cams, profiles }, alerts, cases);
  const profileLabel = (p: ProfileType) =>
    p === "child" ? t("Child", "طفل") : p === "elderly" ? t("Elderly", "مسن") : p === "alzheimers" ? t("Alzheimer's", "الزهايمر") : t("Adult", "بالغ");
  const actionLabel = (a: RuleActionType) =>
    a === "notify" ? t("Notify", "إشعار") : a === "escalate" ? t("Escalate", "تصعيد") : t("Auto-dispatch", "توجيه تلقائي");
  const actionIcon = (a: RuleActionType) => (a === "notify" ? Megaphone : a === "escalate" ? Zap : Send);

  const toggleIn = <T,>(arr: T[], v: T, set: (x: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    if (!name.trim()) return;
    if (addRule({ name: name.trim(), enabled: true, minConf, cams, profiles, action })) {
      setShowForm(false); setName(""); setMinConf(70); setCams([]); setProfiles([]); setAction("notify");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {t("Rules watch every new camera alert and act when it matches. Each alert fires a rule only once.", "تراقب القواعد كل تنبيه كاميرا جديد وتتصرّف عند تطابقه. كل تنبيه يُفعّل القاعدة مرة واحدة فقط.")}
        </p>
        {canEdit && (
          <button onClick={() => setShowForm(!showForm)} className={`${btnClass("primary", "sm")} ms-auto`}>
            <Plus className="h-3 w-3" /> {t("New rule", "قاعدة جديدة")}
          </button>
        )}
      </div>
      {!canEdit && <p className="border-s-2 border-warning ps-3 text-xs text-muted-foreground">{t("You can view rules as", "يمكنك الاطلاع على القواعد بدور")} {ROLE_LABEL[role][lang]}. {t("Only a supervisor or investigator can create them; only a supervisor can delete.", "لا ينشئها إلا المشرف أو المحقّق، ولا يحذفها إلا المشرف.")}</p>}

      {showForm && (
        <section className="space-y-3 border border-primary/40 bg-card/40 p-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-primary">{t("New alert rule", "قاعدة تنبيه جديدة")}</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Rule name…", "اسم القاعدة…")} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" aria-label={t("Rule name", "اسم القاعدة")} />
          <label className="block text-xs">
            {t("Minimum confidence", "الحد الأدنى للثقة")}: <span dir="ltr" className="font-mono text-primary">{minConf}%</span>
            <input type="range" min={30} max={99} value={minConf} onChange={(e) => setMinConf(Number(e.target.value))} className="mt-1 w-full accent-[var(--primary)]" />
          </label>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">{t("Cameras (none selected = all)", "الكاميرات (عدم التحديد = الكل)")}</p>
            <div className="flex flex-wrap gap-1">
              {cameras.map((c) => (
                <button key={c.id} onClick={() => toggleIn(cams, c.id, setCams)} className={btnClass(cams.includes(c.id) ? "primary" : "outline", "sm")} aria-pressed={cams.includes(c.id)}>{c.id}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">{t("Profiles (none selected = all)", "الفئات (عدم التحديد = الكل)")}</p>
            <div className="flex flex-wrap gap-1">
              {PROFILES.map((p) => (
                <button key={p} onClick={() => toggleIn(profiles, p, setProfiles)} className={btnClass(profiles.includes(p) ? "primary" : "outline", "sm")} aria-pressed={profiles.includes(p)}>{profileLabel(p)}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">{t("When it matches", "عند التطابق")}</p>
            <div className="flex flex-wrap gap-1">
              {(["notify", "escalate", "dispatch"] as RuleActionType[]).map((a) => {
                const I = actionIcon(a);
                return <button key={a} onClick={() => setAction(a)} className={btnClass(action === a ? "primary" : "outline", "sm")} aria-pressed={action === a}><I className="h-3 w-3" /> {actionLabel(a)}</button>;
              })}
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {t("Would match now:", "ستطابق الآن:")} <span className="text-primary" dir="ltr">{preview.length}</span> {t("open alert(s)", "تنبيهًا مفتوحًا")}
          </p>
          <div className="flex gap-2">
            <button onClick={submit} disabled={!name.trim()} className={btnClass("primary", "sm")}>{t("Create rule", "إنشاء القاعدة")}</button>
            <button onClick={() => setShowForm(false)} className={btnClass("outline", "sm")}>{t("Cancel", "إلغاء")}</button>
          </div>
        </section>
      )}

      <ul className="space-y-2">
        {rules.map((r) => {
          const hits = matchingAlerts(r, alerts, cases);
          const I = actionIcon(r.action);
          return (
            <li key={r.id} className={`border p-3 ${r.enabled ? "border-border bg-card/40" : "border-border/50 opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <BellRing className={`h-4 w-4 ${r.enabled ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-bold">{r.name}</span>
                <span dir="ltr" className="rounded-sm border border-border px-1.5 font-mono text-[10px] text-muted-foreground">≥{r.minConf}%</span>
                <span className="flex items-center gap-1 rounded-sm border border-border px-1.5 font-mono text-[10px] text-primary"><I className="h-3 w-3" />{actionLabel(r.action)}</span>
                <span className="ms-auto flex items-center gap-1">
                  <button onClick={() => toggleRule(r.id)} className={btnClass(r.enabled ? "outline" : "primary", "sm")} aria-pressed={r.enabled}>
                    {r.enabled ? t("Disable", "تعطيل") : t("Enable", "تفعيل")}
                  </button>
                  {role === "supervisor" && (
                    <button onClick={() => deleteRule(r.id)} className="p-1.5 text-det-red hover:opacity-80" aria-label={t("Delete rule", "حذف القاعدة")}><Trash2 className="h-4 w-4" /></button>
                  )}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {r.cams.length ? r.cams.join(", ") : t("All cameras", "كل الكاميرات")} · {r.profiles.length ? r.profiles.map(profileLabel).join(", ") : t("All profiles", "كل الفئات")} · {t("matches now:", "تطابق الآن:")} <span dir="ltr" className="text-primary">{hits.length}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
