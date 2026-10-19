import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Search, FileText, Camera, Users, Zap, Clock, Keyboard } from "lucide-react";
import { useVT, ROLE_LABEL, type Role } from "@/lib/store";
import { cameras } from "@/data/mock";
import { useLang } from "@/lib/i18n";
import { fuzzyScore } from "@/lib/search";
import { usePrefs, DEFAULT_PREFS } from "@/lib/prefs";

type Item = { id: string; group: string; label: string; hint?: string; run: () => void };

const RECENTS_KEY = "vt-recents";

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]"); } catch { return []; }
}

export function CommandPalette() {
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const cases = useVT((s) => s.cases);
  const units = useVT((s) => s.units);
  const role = useVT((s) => s.role);
  const setRole = useVT((s) => s.setRole);
  const reset = useVT((s) => s.reset);
  const [open, setOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "?" && !typing) { e.preventDefault(); setHelpOpen((o) => !o); }
      else if (e.key === "Escape") { setOpen(false); setHelpOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setSel(0); setRecents(loadRecents()); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const pages: Item[] = [
      { id: "p-home", group: t("Pages", "الصفحات"), label: t("Overview", "نظرة عامة"), run: () => navigate({ to: "/" }) },
      { id: "p-demo", group: t("Pages", "الصفحات"), label: t("Live Demo", "عرض حي"), run: () => navigate({ to: "/demo" }) },
      { id: "p-dash", group: t("Pages", "الصفحات"), label: t("Command Dashboard", "لوحة القيادة"), run: () => navigate({ to: "/dashboard" }) },
      { id: "p-planner", group: t("Pages", "الصفحات"), label: t("Search planner", "مخطط البحث"), run: () => navigate({ to: "/dashboard/planner" }) },
      { id: "p-board", group: t("Pages", "الصفحات"), label: t("Command board", "لوحة التنسيق"), run: () => navigate({ to: "/dashboard/command-board" }) },
      { id: "p-alert", group: t("Pages", "الصفحات"), label: t("Public alert", "تنبيه عام"), run: () => navigate({ to: "/dashboard/alerts-composer" }) },
      { id: "p-report", group: t("Pages", "الصفحات"), label: t("Report a case", "إبلاغ عن حالة"), run: () => navigate({ to: "/report" }) },
      { id: "p-registry", group: t("Pages", "الصفحات"), label: t("Safe registry", "السجل الآمن"), run: () => navigate({ to: "/registry" }) },
      { id: "p-security", group: t("Pages", "الصفحات"), label: t("Security", "الأمان"), run: () => navigate({ to: "/security" }) },
      { id: "p-settings", group: t("Pages", "الصفحات"), label: t("Settings & accessibility", "الإعدادات وإمكانية الوصول"), run: () => navigate({ to: "/settings" }) },
    ];
    const caseItems: Item[] = cases.map((c) => ({
      id: `c-${c.id}`, group: t("Cases", "الحالات"), label: `${c.id} — ${c.name[lang]}`,
      hint: c.status, run: () => navigate({ to: "/dashboard/case/$id", params: { id: c.id } }),
    }));
    const camItems: Item[] = cameras.map((c) => ({
      id: `cam-${c.id}`, group: t("Cameras", "الكاميرات"), label: `${c.id} — ${c.name[lang]}`, run: () => navigate({ to: "/demo" }),
    }));
    const unitItems: Item[] = units.map((u) => ({
      id: `u-${u.id}`, group: t("Units", "الفرق"), label: u.name, hint: u.busyWith ? u.busyWith : t("Available", "متاحة"),
      run: () => navigate({ to: "/dashboard/command-board" }),
    }));
    const roles = Object.keys(ROLE_LABEL) as Role[];
    const actions: Item[] = [
      { id: "a-new", group: t("Actions", "إجراءات"), label: t("New case (open report form)", "حالة جديدة (فتح نموذج الإبلاغ)"), run: () => navigate({ to: "/report" }) },
      { id: "a-role", group: t("Actions", "إجراءات"), label: t("Switch role (cycle)", "تبديل الدور (بالتناوب)"), hint: ROLE_LABEL[role][lang], run: () => setRole(roles[(roles.indexOf(role) + 1) % roles.length]!) },
      { id: "a-scenario", group: t("Actions", "إجراءات"), label: t("Run scenario (open simulation)", "تشغيل سيناريو (فتح المحاكاة)"), run: () => navigate({ to: "/demo" }) },
      { id: "a-lang", group: t("Actions", "إجراءات"), label: t("Toggle language", "تبديل اللغة"), run: () => setLang(lang === "en" ? "ar" : "en") },
      { id: "a-reset", group: t("Actions", "إجراءات"), label: t("Reset demo data", "إعادة ضبط البيانات التجريبية"), run: () => reset() },
      { id: "a-help", group: t("Actions", "إجراءات"), label: t("Keyboard shortcuts", "اختصارات لوحة المفاتيح"), hint: "?", run: () => setHelpOpen(true) },
    ];
    return [...pages, ...caseItems, ...camItems, ...unitItems, ...actions];
  }, [cases, units, role, lang, t, navigate, setRole, setLang, reset]);

  const results = useMemo(() => {
    if (!q.trim()) {
      const recentItems = recents.map((id) => items.find((i) => i.id === id)).filter((i): i is Item => !!i);
      return [...recentItems, ...items.filter((i) => !recents.includes(i.id))].slice(0, 12);
    }
    return items
      .map((i) => ({ i, s: Math.max(fuzzyScore(q, i.label), fuzzyScore(q, i.id)) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((x) => x.i);
  }, [q, items, recents]);

  const pick = (item: Item) => {
    const next = [item.id, ...recents.filter((r) => r !== item.id)].slice(0, 5);
    setRecents(next);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setOpen(false);
    item.run();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && results[sel]) { e.preventDefault(); pick(results[sel]); }
  };

  let lastGroup = "";
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] flex items-start justify-center bg-background/70 p-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div role="dialog" aria-label={t("Command palette", "لوحة الأوامر")}
              className="w-full max-w-xl overflow-hidden rounded-sm border border-border bg-card shadow-2xl"
              initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onInputKey}
                  placeholder={t("Search pages, cases, cameras, actions…", "ابحث في الصفحات والحالات والكاميرات والإجراءات…")}
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
                <kbd dir="ltr" className="rounded-sm border border-border px-1.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
              </div>
              <ul className="max-h-80 overflow-auto py-1" role="listbox">
                {results.length === 0 && <li className="px-4 py-6 text-center text-xs text-muted-foreground">{t("No results.", "لا نتائج.")}</li>}
                {results.map((item, idx) => {
                  const header = item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;
                  const Icon = item.id.startsWith("c-") ? FileText : item.id.startsWith("cam-") ? Camera : item.id.startsWith("u-") ? Users : item.id.startsWith("a-") ? Zap : recents.includes(item.id) && !q ? Clock : Search;
                  return (
                    <li key={item.id}>
                      {header && <p className="px-4 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{header}</p>}
                      <button role="option" aria-selected={idx === sel} onMouseEnter={() => setSel(idx)} onClick={() => pick(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-start text-sm ${idx === sel ? "bg-primary/10 text-primary" : "text-foreground"}`}>
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.hint && <span className="font-mono text-[10px] uppercase text-muted-foreground">{item.hint}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div dir="ltr" className="flex gap-3 border-t border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
                <span>↑↓ {t("navigate", "تنقّل")}</span><span>↵ {t("open", "فتح")}</span><span>? {t("shortcuts", "الاختصارات")}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

const SHORTCUTS: { keys: string; en: string; ar: string }[] = [
  { keys: "Ctrl/⌘ + K", en: "Command palette", ar: "لوحة الأوامر" },
  { keys: "?", en: "This cheat sheet", ar: "دليل الاختصارات" },
  { keys: "↑ / ↓", en: "Move in lists", ar: "التنقل في القوائم" },
  { keys: "Enter", en: "Open selection", ar: "فتح المحدد" },
  { keys: "Esc", en: "Close dialogs", ar: "إغلاق النوافذ" },
];

export function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <div role="dialog" aria-label={t("Keyboard shortcuts", "اختصارات لوحة المفاتيح")}
            className="w-full max-w-md rounded-sm border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary"><Keyboard className="h-4 w-4" />{t("Keyboard shortcuts", "اختصارات لوحة المفاتيح")}</h2>
            <ul className="mt-4 space-y-2">
              {SHORTCUTS.map((s) => (
                <li key={s.keys} className="flex items-center justify-between gap-4 text-sm">
                  <span>{t(s.en, s.ar)}</span>
                  <kbd dir="ltr" className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-xs text-primary">{s.keys}</kbd>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{t("Customize these in Settings → Shortcuts.", "يمكن تخصيصها من الإعدادات ← الاختصارات.")}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Applies display preferences (density, text size, contrast, motion, scanlines) to the document. */
export function PrefsSync() {
  const p = usePrefs();
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.density = p.density;
    el.dataset.palette = p.palette;
    el.style.fontSize = `${[14, 16, 18, 20][p.textSize]}px`;
    el.classList.toggle("high-contrast", p.highContrast);
    el.classList.toggle("reduce-motion", p.reduceMotion);
    el.style.setProperty("--scanline-opacity", String(p.scanlines / 100));
    el.style.setProperty("--det-box-w", `${p.boxThickness}px`);
  }, [p]);
  return null;
}

export { DEFAULT_PREFS };
