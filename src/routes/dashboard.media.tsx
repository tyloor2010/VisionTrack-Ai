import { createFileRoute } from "@tanstack/react-router";
import { MediaLab } from "@/components/vt/MediaLab";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/media")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Media Lab — VisionTrack AI" },
      { name: "description", content: "Video frame analysis, photo comparison, manual annotation, image enhancement and privacy blur tools (demo data)." },
      { property: "og:title", content: "Media Lab — VisionTrack AI" },
      { property: "og:description", content: "Detection and media tools for reviewing camera material (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MediaPage,
});

function MediaPage() {
  const { t } = useLang();
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Media lab", "مختبر الوسائط")}</h1>
      <MediaLab />
    </div>
  );
}
