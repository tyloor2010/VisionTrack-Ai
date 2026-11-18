import { createFileRoute } from "@tanstack/react-router";
import { DroneShowcase } from "@/components/vt/DroneShowcase";
import { VisionBox } from "@/components/vt/VisionBox";
import { SectionBg } from "@/components/vt/SectionBg";
import { SectionHead } from "@/components/vt/ui";
import aerialClip from "@/assets/drone-aerial.webm.asset.json";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/devices")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Our Devices — VisionTrack AI" },
      { name: "description", content: "Meet the hardware behind VisionTrack AI: the VTX-1 drone prototype built by our team and the Vision Box wall-mounted smart camera unit — how each one captures, detects, matches, alerts and logs." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrack2027.lovable.app/devices" },
      { property: "og:title", content: "Our Devices — VisionTrack AI" },
      { property: "og:description", content: "The VTX-1 drone prototype and the Vision Box smart camera unit: the devices that carry VisionTrack AI into the street." },
      { property: "og:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/devices" }],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { t } = useLang();
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-14">
        <SectionBg video={media.walkGif} poster={media.streetCv} />
        <div className="relative mx-auto max-w-7xl">
          <SectionHead
            tag={t("Our devices", "أجهزتنا")}
            title={t("Built by us, for the search.", "من صنعنا، من أجل البحث.")}
            sub={t("Two pieces of hardware carry VisionTrack AI into the street: a drone that searches from above, and a small wall unit that watches a corner around the clock.", "قطعتان من العتاد تنقلان VisionTrack AI إلى الشارع: مسيّرة تبحث من الأعلى، ووحدة جدارية صغيرة تراقب الناصية على مدار الساعة.")}
          />
        </div>
      </section>

      <section id="air-unit" className="relative isolate scroll-mt-20 overflow-hidden border-t border-border py-16 sm:py-24">
        <SectionBg video={aerialClip.url} poster={media.aerialV2x} position="object-center" />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHead
            tag={t("VisionTrack Air / VTX-1", "VisionTrack Air / VTX-1")}
            title={t("Our drone prototype. A wider view.", "نموذجنا المسيّر. رؤية أوسع.")}
            sub={t("From the workbench to the search mission: our team-built prototype brings the drone story into VisionTrack's second generation.", "من طاولة العمل إلى مهمة البحث: نموذج أولي صنعه فريقنا ليضيف بُعدًا جويًا إلى الجيل الثاني من VisionTrack.")}
          />
          <DroneShowcase />
        </div>
      </section>

      <section id="vision-box" className="relative isolate scroll-mt-20 overflow-hidden border-t border-border py-16 sm:py-24 hud-grid">
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHead
            tag="VISION BOX / SMART VISION UNIT"
            title={t("Vision Box. See. Detect. Protect.", "Vision Box. يرى. يرصد. يحمي.")}
            sub={t("Our wall-mounted hardware unit brings VisionTrack's AI to every street corner — always watching for a safer world.", "وحدتنا الجدارية تنقل ذكاء VisionTrack إلى كل ناصية، وتبقى يقظة من أجل عالم أكثر أمانًا.")}
          />
          <VisionBox />
        </div>
      </section>
    </>
  );
}
