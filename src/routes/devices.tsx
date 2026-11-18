import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lightbox } from "@/components/vt/Lightbox";
import { DroneShowcase } from "@/components/vt/DroneShowcase";
import { VisionBox } from "@/components/vt/VisionBox";
import { SectionBg } from "@/components/vt/SectionBg";
import { SectionHead } from "@/components/vt/ui";
import aerialClip from "@/assets/drone-aerial.webm.asset.json";
import integrationSnapFly from "@/assets/integration-snap-fly.jpg.asset.json";
import integrationPayload from "@/assets/integration-payload.jpg.asset.json";
import integrationAssembly from "@/assets/integration-assembly.webp.asset.json";
import nanoTrackerSheet from "@/assets/nano-tracker-sheet.jpg.asset.json";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/devices")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Our Devices — VisionTrack AI" },
      { name: "description", content: "Meet the hardware behind VisionTrack AI: the VTX-1 drone prototype built by our team and the Vision Box wall-mounted smart camera unit — how each one captures, detects, matches, alerts and logs." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrackai.site/devices" },
      { property: "og:title", content: "Our Devices — VisionTrack AI" },
      { property: "og:description", content: "The VTX-1 drone prototype and the Vision Box smart camera unit: the devices that carry VisionTrack AI into the street." },
      { property: "og:image", content: "https://visiontrackai.site/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrackai.site/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrackai.site/devices" }],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { t } = useLang();
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-14">
        <SectionBg video={media.walkGif} poster={media.streetCv} />
        <div className="relative mx-auto max-w-7xl">
          <SectionHead
            tag={t("Our devices", "أجهزتنا")}
            title={t("Built by us, for the search.", "من صنعنا، من أجل البحث.")}
            sub={t("Three pieces of hardware carry VisionTrack AI into the street: a small wall unit that watches a corner around the clock, a drone that searches from above, and a pocket tracker that stays with the person.", "ثلاث قطع من العتاد تنقل VisionTrack AI إلى الشارع: وحدة جدارية صغيرة تراقب الناصية على مدار الساعة، ومسيّرة تبحث من الأعلى، ومتتبّع جيبي يبقى مع الشخص.")}
          />
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

      <section id="integration" className="relative isolate scroll-mt-20 overflow-hidden border-t border-border py-16 sm:py-24 hud-grid">
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHead
            tag={t("Snap-and-fly integration", "الدمج بنظام الركِّب واطير")}
            title={t("One system. The box flies with the drone.", "نظام واحد. الصندوق يطير مع المسيّرة.")}
            sub={t("Vision Box is not only a wall unit — a miniaturised version of it snaps onto VTX-1's nose in seconds, with no screws or tools. Spring-loaded rails lock it in place, a tiny two-pin plug powers it from the drone's own battery, and soft dampers keep the picture steady. Snap it on, and the drone gains the same eyes the walls have.", "Vision Box ليس وحدة جدارية فحسب — نسخة مصغَّرة منه تُركَّب على مقدّمة VTX-1 في ثوانٍ، دون براغي أو أدوات. قضبان بنوابض تثبّته في مكانه، وقابس صغير ذو سنَّين يغذّيه بالطاقة من بطارية المسيّرة نفسها، وممتصّات اهتزاز مرنة تحافظ على ثبات الصورة. ركّبه، وتمتلك المسيّرة العيون نفسها التي على الجدران.")}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              [integrationSnapFly, t("The snap-and-fly concept", "فكرة الركِّب واطير"), t("The vision module slides into the drone's nose and clicks locked — balanced with the battery so the flight stays level.", "تنزلق وحدة الرؤية في مقدّمة المسيّرة وتُقفَل بنقرة — متوازنة مع البطارية ليبقى الطيران مستويًا.")],
              [integrationPayload, t("The smart payload system", "نظام الحمولة الذكي"), t("A custom 3D-printed nose shell, shared power and data, vibration damping and air vents over the chips.", "غطاء أمامي مخصّص مطبوع ثلاثي الأبعاد، وطاقة وبيانات مشتركة، وامتصاص للاهتزاز، وفتحات تهوية فوق الرقائق.")],
              [integrationAssembly, t("Step-by-step mounting", "التركيب خطوة بخطوة"), t("Slide, click, plug, fly — the full quick-release assembly with no screws and no tools.", "ازلق، انقر، وصّل، ثم حلّق — التجميع الكامل بنظام الفك السريع دون براغي أو أدوات.")],
            ].map(([asset, title, body], i) => (
              <figure key={i} className="overflow-hidden rounded-sm border border-border bg-card">
                <button type="button" onClick={() => setZoom((asset as typeof integrationSnapFly).url)} className="block w-full cursor-zoom-in"><img src={(asset as typeof integrationSnapFly).url} alt={`${title} — Vision Box and VTX-1 drone integration diagram`} loading="lazy" decoding="async" className="w-full" /></button>
                <figcaption className="border-t border-border px-4 py-2.5">
                  <p className="text-sm font-bold">{title as string}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{body as string}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="nano-tracker" className="relative isolate scroll-mt-20 overflow-hidden border-t border-border py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHead
            tag={t("Nano Tracker / Design concept", "Nano Tracker / تصميم مبدئي")}
            title={t("A tracker that stays with them.", "متتبّع يبقى معهم.")}
            sub={t("Our next design concept: a coin-sized GPS and Bluetooth tag that clips onto a bag, a keychain or a jacket. It broadcasts its position on its own, and when someone is close by, a loud buzzer helps pinpoint them. Small enough to go anywhere — loud enough to be found.", "تصميمنا المبدئي القادم: شريحة بحجم العملة المعدنية تعمل بنظامَي GPS وBluetooth وتُعلَّق على حقيبة أو ميدالية مفاتيح أو سترة. تبثّ موقعها بشكل مستقل، وعند الاقتراب منها يصدر جرس عالٍ يساعد على تحديد مكانها بدقة. صغيرة بما يكفي لتذهب إلى أي مكان — وعالية الصوت بما يكفي ليُعثر عليها.")}
          />
          <figure className="overflow-hidden rounded-sm border border-border bg-card">
            <button type="button" onClick={() => setZoom(nanoTrackerSheet.url)} className="block w-full cursor-zoom-in">
              <img src={nanoTrackerSheet.url} alt={t("DIY Nano Tracker design sheet — standalone GPS and Bluetooth tracking system", "لوحة تصميم Nano Tracker — نظام تتبّع مستقل بنظامَي GPS وBluetooth")} loading="lazy" decoding="async" className="w-full" />
            </button>
            <figcaption className="border-t border-border px-4 py-2.5">
              <p className="text-sm font-bold">{t("The full design sheet", "لوحة التصميم الكاملة")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("Dual-mode locating with GPS and Bluetooth 5.0, a replaceable coin-cell battery, a 90dB finder buzzer, and snap-on mounts for bags, keychains and flat surfaces — from signal, to map, to sound, to recovery.", "تحديد مزدوج للموقع عبر GPS وBluetooth 5.0، وبطارية قابلة للاستبدال، وجرس تحديد بقوة 90 ديسيبل، وقواعد تثبيت للحقائب والمفاتيح والأسطح المستوية — من الإشارة، إلى الخريطة، إلى الصوت، إلى الاستعادة.")}</p>
            </figcaption>
          </figure>
        </div>
      </section>
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </>
  );
}
