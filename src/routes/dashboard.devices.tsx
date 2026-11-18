import { createFileRoute } from "@tanstack/react-router";
import { DeviceFleet } from "@/components/vt/DeviceFleet";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/devices")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Device Tracking — VisionTrack AI" },
      { name: "description", content: "Track the VTX-1 drones, Vision Box camera units and Nano Tracker tags on a live Cairo map, with battery, status and case assignment (demo data)." },
      { property: "og:title", content: "Device Tracking — VisionTrack AI" },
      { property: "og:description", content: "Live fleet tracking for drones, Vision Box units and Nano Tracker tags (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { t } = useLang();
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Device tracking", "تتبّع الأجهزة")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "Live positions, battery and case assignment for the VTX-1 drones, Vision Box units and Nano Tracker tags.",
            "المواقع المباشرة ومستوى البطارية وإسناد الحالات لدرونات VTX-1 ووحدات صندوق الرؤية وأجهزة النانو تراكر.",
          )}
        </p>
      </div>
      <DeviceFleet />
    </div>
  );
}
