import { createFileRoute } from "@tanstack/react-router";
import { DroneShowcase } from "@/components/vt/DroneShowcase";
import { SectionBg } from "@/components/vt/SectionBg";
import { SectionHead } from "@/components/vt/ui";
import aerialClip from "@/assets/drone-aerial.webm.asset.json";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/drones")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "VisionTrack Air — Our Drones" },
      { name: "description", content: "Meet VTX-1, our team-built drone prototype: aerial search coverage, live camera feed into the same detection pipeline, and human review before any alert." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrack2027.lovable.app/drones" },
      { property: "og:title", content: "VisionTrack Air — Our Drones" },
      { property: "og:description", content: "From the workbench to the search mission: our team-built VTX-1 prototype adds an aerial view to VisionTrack AI." },
      { property: "og:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/drones" }],
  }),
  component: DronesPage,
});

function DronesPage() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden border-y border-border py-16 sm:py-24">
      <SectionBg video={aerialClip.url} poster={media.aerialV2x} position="object-center" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHead
          tag={t("VisionTrack Air / VTX-1", "VisionTrack Air / VTX-1")}
          title={t("Our drones. A wider view.", "طائراتنا المسيّرة. رؤية أوسع.")}
          sub={t("From the workbench to the search mission: our team-built prototype brings the drone story into VisionTrack's second generation.", "من طاولة العمل إلى مهمة البحث: نموذج أولي صنعه فريقنا ليضيف بُعدًا جويًا إلى الجيل الثاني من VisionTrack.")}
        />
        <DroneShowcase />
      </div>
    </section>
  );
}
