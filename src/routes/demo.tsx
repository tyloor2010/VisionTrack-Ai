import { createFileRoute } from "@tanstack/react-router";
import { LiveDemo } from "@/components/vt/LiveDemo";
import { SectionHead } from "@/components/vt/ui";
import { SectionBg } from "@/components/vt/SectionBg";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/demo")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Live Demo — VisionTrack AI" },
      { name: "description", content: "Run a search yourself: pick a case, watch the camera wall flag potential matches, and see the predicted search radius grow with time before a reviewer confirms." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrack2027.lovable.app/demo" },
      { property: "og:title", content: "Live Demo — VisionTrack AI" },
      { property: "og:description", content: "Watch VisionTrack AI scan camera feeds and flag potential matches for human review." },
      { property: "og:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/demo" }],
  }),

  component: DemoPage,
});

function DemoPage() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden px-4 py-14">
      <SectionBg video={media.walkGif} poster={media.streetCv} />
      <div className="relative mx-auto max-w-[1500px]">
        <SectionHead tag={t("Live demo", "عرض حي")} title={t("Search the city in seconds.", "مسح المدينة في ثوانٍ.")} sub={t("Pick a sample profile and start a search. All data is simulated.", "اختر حالة وابدأ البحث. جميع البيانات افتراضية.")} />
        <LiveDemo />
      </div>
    </section>
  );
}
