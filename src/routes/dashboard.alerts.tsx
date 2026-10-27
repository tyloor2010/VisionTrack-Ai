import { createFileRoute } from "@tanstack/react-router";
import { AlertRules } from "@/components/vt/AlertRules";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Rules — VisionTrack AI" },
      { name: "description", content: "Build alert rules that watch camera matches by confidence, camera and profile, then notify, escalate or dispatch (demo data)." },
      { property: "og:title", content: "Alert Rules — VisionTrack AI" },
      { property: "og:description", content: "Rule builder for automated alert handling (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { t } = useLang();
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Alert rules", "قواعد التنبيه")}</h1>
      <AlertRules />
    </div>
  );
}
