import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutGrid, FolderOpen, Grid3x3, Users, Megaphone, Settings, ScanSearch, Cctv, Map as MapIcon, BellRing, BarChart3, ScanEye, FileText, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { PinnedViews } from "@/components/vt/SavedViews";
import { WatchStrip, EscalationRunner } from "@/components/vt/CaseTools";
import { AlertRulesRunner } from "@/components/vt/AlertRules";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: "exclude-subtree" },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { t } = useLang();
  const nav = [
    { to: "/dashboard", i: LayoutGrid, l: t("Overview", "نظرة عامة"), exact: true },
        { to: "/dashboard/planner", i: Grid3x3, l: t("Search planner", "مخطط البحث"), exact: false },
    { to: "/dashboard/command-board", i: Users, l: t("Command board", "لوحة التنسيق"), exact: false },
    { to: "/dashboard/alerts-composer", i: Megaphone, l: t("Public alert", "تنبيه عام"), exact: false },
    { to: "/dashboard/media", i: ScanSearch, l: t("Media lab", "مختبر الوسائط"), exact: false },
    { to: "/dashboard/cameras", i: Cctv, l: t("Cameras", "الكاميرات"), exact: false },
    { to: "/dashboard/maps", i: MapIcon, l: t("Map studio", "استوديو الخرائط"), exact: false },
    { to: "/dashboard/alerts", i: BellRing, l: t("Alert rules", "قواعد التنبيه"), exact: false },
    { to: "/dashboard/analytics", i: BarChart3, l: t("Analytics", "التحليلات"), exact: false },
    { to: "/dashboard/model-quality", i: ScanEye, l: t("Model quality", "جودة النموذج"), exact: false },
    { to: "/dashboard/model-card", i: FileText, l: t("Model card", "بطاقة النموذج"), exact: false },
    { to: "/dashboard/admin", i: ShieldCheck, l: t("Administration", "الإدارة"), exact: false },
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
          <Link to="/settings" className="flex shrink-0 items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-primary/10 text-primary" }}>
            <Settings className="h-4 w-4" />{t("Settings", "الإعدادات")}
          </Link>
        </nav>
        <div className="hidden md:block"><PinnedViews /></div>
      </aside>
      <div className="min-w-0 flex-1"><div className="px-4 pt-4 sm:px-6"><WatchStrip /></div><Outlet /></div>
      <EscalationRunner />
      <AlertRulesRunner />
      <div dir="ltr" className="fixed bottom-3 end-3 z-40 border border-warning/60 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-warning">
        {t("Demo data — all mocked", "بيانات تجريبية — كلها افتراضية")}
      </div>
    </div>
  );
}
