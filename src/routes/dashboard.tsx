import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutGrid, FolderOpen, Grid3x3, Users, Megaphone } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { t } = useLang();
  const nav = [
    { to: "/dashboard", i: LayoutGrid, l: t("Overview", "نظرة عامة"), exact: true },
        { to: "/dashboard/planner", i: Grid3x3, l: t("Search planner", "مخطط البحث"), exact: false },
    { to: "/dashboard/command-board", i: Users, l: t("Command board", "لوحة التنسيق"), exact: false },
    { to: "/dashboard/alerts-composer", i: Megaphone, l: t("Public alert", "تنبيه عام"), exact: false },
  ] as const;
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      <aside className="shrink-0 border-b border-border bg-card/40 p-2 md:w-56 md:border-b-0 md:border-e md:p-3">
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label={t("Dashboard", "لوحة القيادة")}>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} className="flex shrink-0 items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary/10 text-primary" }}>
              <n.i className="h-4 w-4" />{n.l}
            </Link>
          ))}
          <Link to="/dashboard/case/$id" params={{ id: "VT-2041" }} className="flex shrink-0 items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary/10 text-primary" }}>
            <FolderOpen className="h-4 w-4" />{t("Case file", "ملف الحالة")}
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1"><Outlet /></div>
      <div dir="ltr" className="fixed bottom-3 end-3 z-40 border border-warning/60 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-warning">
        {t("Demo data — all mocked", "بيانات تجريبية — كلها افتراضية")}
      </div>
    </div>
  );
}
