import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useVT } from "@/lib/store";
import { cameras } from "@/data/mock";
import { fuzzyScore } from "@/lib/search";

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1 || !q) return <>{text}</>;
  return <>{text.slice(0, i)}<mark className="bg-primary/30 text-primary">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

type Hit = { group: string; label: string; to: string; params?: Record<string, string> };

/** Dashboard-wide search across cases, alerts, cameras, tasks and notifications. */
export function GlobalSearch() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { cases, alerts, tasks, notes } = useVT();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    if (!q.trim()) return [];
    const all: Hit[] = [
      ...cases.map((c) => ({ group: t("Cases", "الحالات"), label: `${c.id} — ${c.name[lang]} (${c.status})`, to: "/dashboard/case/$id", params: { id: c.id } })),
      ...alerts.map((a) => ({ group: t("Alerts", "التنبيهات"), label: `${a.id} — ${a.cam} ${a.conf}% (${a.caseId})`, to: "/dashboard/case/$id", params: { id: a.caseId } })),
      ...cameras.map((c) => ({ group: t("Cameras", "الكاميرات"), label: `${c.id} — ${c.name[lang]}`, to: "/demo" })),
      ...tasks.map((tk) => ({ group: t("Tasks", "المهام"), label: `${tk.id} — ${tk.title[lang]}`, to: "/dashboard/command-board" })),
      ...notes.map((n) => ({ group: t("Notifications", "الإشعارات"), label: n.msg[lang], to: "/dashboard" })),
    ];
    return all.map((h) => ({ h, s: fuzzyScore(q, h.label) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, 15).map((x) => x.h);
  }, [q, cases, alerts, tasks, notes, lang, t]);

  let lastGroup = "";
  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-sm border border-input bg-background px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder={t("Search cases, alerts, cameras, tasks…", "ابحث في الحالات والتنبيهات والكاميرات والمهام…")}
          aria-label={t("Global search", "البحث الشامل")}
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
        <kbd dir="ltr" className="hidden rounded-sm border border-border px-1.5 font-mono text-[10px] text-muted-foreground sm:block">Ctrl+K</kbd>
      </div>
      {open && q.trim() && (
        <ul className="absolute inset-x-0 top-12 z-50 max-h-96 overflow-auto rounded-sm border border-border bg-card py-1 shadow-2xl" role="listbox">
          {hits.length === 0 && <li className="px-4 py-4 text-center text-xs text-muted-foreground">{t("No results.", "لا نتائج.")}</li>}
          {hits.map((h, i) => {
            const header = h.group !== lastGroup ? h.group : null;
            lastGroup = h.group;
            return (
              <li key={i}>
                {header && <p className="px-4 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{header}</p>}
                <button onClick={() => { setOpen(false); setQ(""); void navigate({ to: h.to, params: h.params as never }); }}
                  className="block w-full truncate px-4 py-2 text-start text-sm hover:bg-primary/10 hover:text-primary">
                  <Highlight text={h.label} q={q.trim()} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
