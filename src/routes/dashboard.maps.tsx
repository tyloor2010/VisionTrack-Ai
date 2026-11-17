import { createFileRoute } from "@tanstack/react-router";
import { MapStudio } from "@/components/vt/MapStudio";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/maps")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Map Studio — VisionTrack AI" },
      { name: "description", content: "Operations map with layer switcher, drawing and measuring tools, route replay, coordinates and weather overlay (demo data)." },
      { property: "og:title", content: "Map Studio — VisionTrack AI" },
      { property: "og:description", content: "Map layers, drawing, measuring and route replay for search operations (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapsPage,
});

function MapsPage() {
  const { t } = useLang();
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Map studio", "استوديو الخرائط")}</h1>
      <MapStudio />
    </div>
  );
}
