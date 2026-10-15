import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useVT, ROLE_LABEL, setStoreLang, type Role } from "@/lib/store";
import { useLang } from "@/lib/i18n";

/** Loads saved demo state after hydration and keeps toast language in sync. */
export function StoreSync() {
  const { lang } = useLang();
  useEffect(() => { void Promise.resolve(useVT.persist.rehydrate()).then(() => useVT.getState().initClock()); }, []);
  useEffect(() => { setStoreLang(lang); }, [lang]);
  return null;
}

export function RoleSwitch() {
  const { t, lang } = useLang();
  const role = useVT((s) => s.role);
  const setRole = useVT((s) => s.setRole);
  return (
    <label className="hidden items-center gap-1.5 font-mono text-[10px] uppercase text-muted-foreground xl:flex">
      {t("Role", "الدور")}
      <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded border border-input bg-background px-1.5 py-1 text-foreground" aria-label={t("Demo role", "الدور التجريبي")}>
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r][lang]}</option>)}
      </select>
    </label>
  );
}

export function NoteBell() {
  const { t, lang } = useLang();
  const notes = useVT((s) => s.notes);
  const markAllRead = useVT((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "alert" | "unread">("all");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const unread = notes.filter((n) => !n.read).length;
  const shown = notes.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.kind === "alert" || n.kind === "warning"));
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1.5 text-muted-foreground hover:text-foreground" aria-label={t(`Notifications, ${unread} unread`, `الإشعارات، ${unread} غير مقروءة`)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && <span dir="ltr" className="absolute -end-0.5 -top-0.5 min-w-4 rounded-full bg-det-red px-1 text-center font-mono text-[9px] leading-4 text-foreground">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="fixed inset-x-2 top-16 z-[60] border border-border bg-card shadow-xl sm:absolute sm:inset-x-auto sm:end-0 sm:top-10 sm:w-80">
          <div className="flex items-center gap-1 border-b border-border p-2">
            {(["all", "unread", "alert"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 font-mono text-[10px] uppercase ${filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                {f === "all" ? t("All", "الكل") : f === "unread" ? t("Unread", "غير مقروءة") : t("Alerts", "تنبيهات")}
              </button>
            ))}
            <button onClick={markAllRead} className="ms-auto font-mono text-[10px] text-primary hover:underline">{t("Mark read", "تعليم كمقروء")}</button>
          </div>
          <ul className="max-h-80 overflow-auto" aria-live="polite">
            {shown.length === 0 && <li className="p-4 text-center text-xs text-muted-foreground">{t("Nothing here yet.", "لا شيء حتى الآن.")}</li>}
            {shown.map((n) => (
              <li key={n.id} className={`border-b border-border px-3 py-2 text-xs ${n.read ? "text-muted-foreground" : ""}`}>
                <span dir="ltr" className="me-2 font-mono text-[10px] text-primary">{new Date(n.at).toLocaleTimeString("en-GB")}</span>{n.msg[lang]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
