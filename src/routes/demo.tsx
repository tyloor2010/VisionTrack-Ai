import { createFileRoute } from "@tanstack/react-router";
import { LiveDemo } from "@/components/vt/LiveDemo";
import { SectionHead } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — VisionTrack AI" },
      { name: "description", content: "Interactive camera wall, search-radius map and human-review alerts for missing person search." },
      { property: "og:title", content: "Live Demo — VisionTrack AI" },
      { property: "og:description", content: "Watch VisionTrack AI scan camera feeds and flag potential matches for human review." },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden px-4 py-14">
      <SectionBg src={media.crowdCv} position="object-top" />
      <div className="relative mx-auto max-w-[1500px]">
        <SectionHead tag={t("Live demo", "عرض مباشر")} title={t("Search the city in seconds.", "ابحث في المدينة خلال ثوانٍ.")} sub={t("Pick a sample profile and start a search. All data is simulated.", "اختر حالة تجريبية وابدأ البحث. جميع البيانات تجريبية.")} />
        <LiveDemo />
      </div>
    </section>
  );
}
