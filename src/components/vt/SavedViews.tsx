import { useMemo, useState } from "react";
import { Pin, PinOff, Save, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useVT, STATUS_LABEL } from "@/lib/store";
import { cameras } from "@/data/mock";
import { applyGroups, type FilterGroup, type FilterRule, type Operator, type SavedView } from "@/lib/search";
import { useViews } from "@/lib/views";
import { Panel, Btn, inputClass } from "@/components/vt/ui";

type Target = SavedView["target"];

const FIELDS: Record<Target, { v: string; en: string; ar: string }[]> = {
  cases: [
    { v: "id", en: "Case ID", ar: "رقم الحالة" },
    { v: "status", en: "Status", ar: "الحالة" },
    { v: "age", en: "Age", ar: "العمر" },
    { v: "profile", en: "Profile", ar: "الفئة" },
  ],
  alerts: [
    { v: "caseId", en: "Case ID", ar: "رقم الحالة" },
    { v: "cam", en: "Camera", ar: "الكاميرا" },
    { v: "conf", en: "Confidence", ar: "نسبة الثقة" },
    { v: "state", en: "State", ar: "الحالة" },
  ],
  cameras: [
    { v: "id", en: "Camera ID", ar: "رقم الكاميرا" },
    { v: "name", en: "Name", ar: "الاسم" },
  ],
};

const OPS: { v: Operator; en: string; ar: string }[] = [
  { v: "is", en: "is", ar: "يساوي" },
  { v: "isNot", en: "is not", ar: "لا يساوي" },
  { v: "contains", en: "contains", ar: "يحتوي" },
  { v: "gt", en: ">", ar: "أكبر من" },
  { v: "lt", en: "<", ar: "أصغر من" },
];

/** Advanced filter builder with saved views. Filters the live store data and lists matches. */
export function FilterBuilder() {
  const { t, lang } = useLang();
  const cases = useVT((s) => s.cases);
  const alerts = useVT((s) => s.alerts);
  const { views, saveView, deleteView, togglePin } = useViews();
  const [target, setTarget] = useState<Target>("cases");
  const [comb, setComb] = useState<"and" | "or">("and");
  const [rules, setRules] = useState<FilterRule[]>([{ field: "status", op: "is", value: "" }]);
  const [name, setName] = useState("");

  const groups: FilterGroup[] = useMemo(() => [{ comb, rules: rules.filter((r) => r.value.trim()) }], [comb, rules]);

  const rows = useMemo(() => {
    if (target === "cases") return cases.map((c) => ({ ...c, _label: `${c.id} — ${c.name[lang]}` }));
    if (target === "alerts") return alerts.map((a) => ({ ...a, _label: `${a.id} — ${a.cam} ${a.conf}%` }));
    return cameras.map((c) => ({ id: c.id, name: c.name[lang], _label: `${c.id} — ${c.name[lang]}` }));
  }, [target, cases, alerts, lang]);

  const matched = useMemo(() => rows.filter((r) => applyGroups(groups, r as unknown as Record<string, unknown>)), [rows, groups]);

  const updateRule = (i: number, patch: Partial<FilterRule>) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const applyView = (v: SavedView) => { setTarget(v.target); setComb(v.groups[0]?.comb ?? "and"); setRules(v.groups[0]?.rules ?? []); };

  return (
    <Panel title={t("Filter builder & saved views", "منشئ المرشحات والعروض المحفوظة")}>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {(["cases", "alerts", "cameras"] as Target[]).map((tg) => (
            <button key={tg} onClick={() => { setTarget(tg); setRules([{ field: FIELDS[tg][0]!.v, op: "is", value: "" }]); }}
              className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase ${target === tg ? "bg-primary/15 text-primary" : "border border-border text-muted-foreground"}`}>
              {tg === "cases" ? t("Cases", "الحالات") : tg === "alerts" ? t("Alerts", "التنبيهات") : t("Cameras", "الكاميرات")}
            </button>
          ))}
          <div className="ms-auto flex overflow-hidden rounded-sm border border-border">
            {(["and", "or"] as const).map((c) => (
              <button key={c} onClick={() => setComb(c)} className={`px-3 py-1.5 font-mono text-xs uppercase ${comb === c ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>{c === "and" ? t("AND", "و") : t("OR", "أو")}</button>
            ))}
          </div>
        </div>

        {rules.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select value={r.field} onChange={(e) => updateRule(i, { field: e.target.value })} className={inputClass + " w-auto"} aria-label={t("Field", "الحقل")}>
              {FIELDS[target].map((f) => <option key={f.v} value={f.v}>{f[lang]}</option>)}
            </select>
            <select value={r.op} onChange={(e) => updateRule(i, { op: e.target.value as Operator })} className={inputClass + " w-auto"} aria-label={t("Operator", "المعامل")}>
              {OPS.map((o) => <option key={o.v} value={o.v}>{o[lang]}</option>)}
            </select>
            {target === "cases" && r.field === "status" ? (
              <select value={r.value} onChange={(e) => updateRule(i, { value: e.target.value })} className={inputClass + " w-auto"} aria-label={t("Value", "القيمة")}>
                <option value="">{t("Any", "أي")}</option>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
              </select>
            ) : (
              <input value={r.value} onChange={(e) => updateRule(i, { value: e.target.value })} placeholder={t("Value", "القيمة")} className={inputClass + " w-36"} />
            )}
            <button onClick={() => setRules((rs) => rs.filter((_, j) => j !== i))} className="p-1.5 text-muted-foreground hover:text-det-red" aria-label={t("Remove rule", "إزالة الشرط")}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={() => setRules((rs) => [...rs, { field: FIELDS[target][0]!.v, op: "is", value: "" }])} className="font-mono text-xs text-primary hover:underline">
          + {t("Add rule", "إضافة شرط")}
        </button>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("View name…", "اسم العرض…")} className={inputClass + " w-44"} />
          <Btn size="sm" variant="outline" disabled={!name.trim()}
            onClick={() => { saveView({ name: name.trim(), target, groups }); setName(""); }}>
            <Save className="h-3.5 w-3.5" />{t("Save view", "حفظ العرض")}
          </Btn>
          <span className="ms-auto font-mono text-xs text-muted-foreground">{matched.length} / {rows.length} {t("match", "نتيجة")}</span>
        </div>

        {views.filter((v) => v.target === target).length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {views.filter((v) => v.target === target).map((v) => (
              <li key={v.id} className="flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-xs">
                <button onClick={() => applyView(v)} className="hover:text-primary">{v.name}</button>
                <button onClick={() => togglePin(v.id)} aria-label={t("Pin to sidebar", "تثبيت في الشريط الجانبي")} className="text-muted-foreground hover:text-primary">
                  {v.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </button>
                <button onClick={() => deleteView(v.id)} aria-label={t("Delete view", "حذف العرض")} className="text-muted-foreground hover:text-det-red"><Trash2 className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        )}

        <ul className="max-h-48 divide-y divide-border overflow-auto border-t border-border" aria-live="polite">
          {matched.slice(0, 30).map((r) => (
            <li key={String((r as { id: string }).id)} className="py-1.5 text-xs text-muted-foreground">{(r as { _label: string })._label}</li>
          ))}
          {matched.length === 0 && <li className="py-3 text-center text-xs text-muted-foreground">{t("Nothing matches these rules.", "لا شيء يطابق هذه الشروط.")}</li>}
        </ul>
      </div>
    </Panel>
  );
}

/** Pinned saved views shown in the dashboard sidebar. */
export function PinnedViews() {
  const { t } = useLang();
  const views = useViews((s) => s.views);
  const pinned = views.filter((v) => v.pinned);
  if (pinned.length === 0) return null;
  return (
    <div className="mt-3 border-t border-border pt-2">
      <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("Pinned views", "عروض مثبتة")}</p>
      {pinned.map((v) => (
        <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <Pin className="h-3 w-3 text-primary" />{v.name}
        </div>
      ))}
    </div>
  );
}
