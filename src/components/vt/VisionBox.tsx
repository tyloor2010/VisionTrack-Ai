import { Camera, ScanFace, Database, Bell, MapPin, Cloud, Cpu, Battery, Wifi, HardDrive, Ruler, Plug } from "lucide-react";
import { Panel, Reveal } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";
import device from "@/assets/vision-box-device.png.asset.json";
import exploded from "@/assets/vision-box-exploded.png.asset.json";
import sheet from "@/assets/vision-box-sheet.png.asset.json";
import cadPerspective from "@/assets/vision-box-cad-perspective.png.asset.json";
import cadInternal from "@/assets/vision-box-cad-internal.png.asset.json";
import cadSide from "@/assets/vision-box-cad-side.png.asset.json";
import assembly from "@/assets/vision-box-assembly.webp.asset.json";
import shellBlueprint from "@/assets/vision-box-shell-blueprint.webp.asset.json";

export function VisionBox() {
  const { t } = useLang();
  const steps = [
    [Camera, t("Capture", "الالتقاط"), t("The 2 MP camera captures images around the clock.", "تلتقط كاميرا بدقة 2 ميغابكسل الصور على مدار الساعة.")],
    [ScanFace, t("Detect", "الرصد"), t("On-board AI finds faces in every frame.", "يرصد الذكاء الاصطناعي داخل الجهاز الوجوه في كل إطار.")],
    [Database, t("Match", "المطابقة"), t("Faces are compared with the missing-persons database.", "تُقارَن الوجوه بقاعدة بيانات المفقودين.")],
    [Bell, t("Alert", "التنبيه"), t("A possible match sends an instant alert for human review.", "عند وجود تطابق محتمل يُرسَل تنبيه فوري للمراجعة البشرية.")],
    [MapPin, t("Log", "التسجيل"), t("Images, time and place are stored with the match.", "تُحفَظ الصور والوقت والمكان مع التطابق.")],
  ] as const;
  const parts = [
    ["ESP32-CAM", t("Dual-core 240 MHz brain with Wi-Fi and Bluetooth", "معالج ثنائي النواة 240 ميغاهرتز مع Wi-Fi وبلوتوث")],
    ["OV2640", t("2 MP camera (1600 × 1200)", "كاميرا 2 ميغابكسل (1600 × 1200)")],
    ["TP4056 USB-C", t("5V USB-C charging for the battery", "شحن البطارية عبر USB-C بجهد 5 فولت")],
    ["Magnetic mount", t("Snaps onto a wall with no wiring", "يُثبَّت على الجدار دون أسلاك")],
    ["Li-Po 3.7V 2000 mAh", t("Keeps running during power cuts", "يواصل العمل أثناء انقطاع الكهرباء")],
    ["MicroSD ≤ 32 GB", t("Local storage for images and logs", "تخزين محلي للصور والسجلات")],
    [t("Buzzer + LEDs", "صفارة ومؤشرات ضوئية"), t("Sound and light status on the device", "تنبيه صوتي وضوئي على الجهاز")],
    [t("Glass front + ABS shell", "واجهة زجاجية وغلاف ABS"), t("Tempered glass cover and aluminium lens ring", "غطاء من الزجاج المقوّى وحلقة عدسة من الألومنيوم")],
  ];
  const specs = [
    [Cpu, t("Processor", "المعالج"), "ESP32 dual-core 240 MHz"],
    [Camera, t("Camera", "الكاميرا"), "OV2640 2 MP"],
    [Wifi, t("Connectivity", "الاتصال"), "Wi-Fi 2.4 GHz · Bluetooth"],
    [HardDrive, t("Storage", "التخزين"), "MicroSD up to 32 GB"],
    [Plug, t("Power input", "الطاقة"), "USB-C 5V"],
    [Battery, t("Battery", "البطارية"), "3.7V 2000 mAh Li-Po"],
        [Ruler, t("Dimensions", "الأبعاد"), "60 × 63 × 53 mm"],
  ] as const;
  const cad: [typeof sheet, string, string][] = [
    [cadPerspective, t("Perspective view", "المنظور المجسَّم"), t("Closed shell with the lens opening and the side ports.", "الغلاف مغلقًا مع فتحة العدسة والمنافذ الجانبية.")],
    [cadInternal, t("Internal view", "المنظر الداخلي"), t("The shell from inside with the camera module and the board seated.", "الغلاف من الداخل مع وحدة الكاميرا واللوحة الإلكترونية.")],
    [cadSide, t("Angled side view", "المنظر الجانبي المائل"), t("Depth, the mounting holes and the lens barrel.", "السماكة وثقوب التثبيت وحاجز العدسة.")],
  ];
  return (
    <div className="space-y-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <Reveal>
          <Panel className="p-4"><img src={device.url} alt="Vision Box smart vision unit mounted on a wall" loading="lazy" className="w-full rounded-sm" /></Panel>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-2xl font-bold sm:text-3xl">{t("A small box that turns any wall into a search point.", "صندوق صغير يحوّل أي جدار إلى نقطة بحث.")}</p>
          <p className="mt-4 text-lg text-muted-foreground">{t(
            "Vision Box is our own smart camera unit. Shops, schools, stations and homes can mount it in minutes. It watches, recognises faces of reported missing people on the device itself, and sends a located alert to VisionTrack — so the city's search network grows one wall at a time.",
            "Vision Box وحدة رؤية ذكية صمّمها فريقنا. يمكن للمحال والمدارس والمحطات والمنازل تثبيتها في دقائق. ترصد الوحدة الوجوه وتطابقها مع المفقودين المبلَّغ عنهم داخل الجهاز نفسه، ثم ترسل تنبيهًا محدَّد الموقع إلى VisionTrack؛ فتتسع شبكة البحث في المدينة جدارًا بعد جدار.")}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[[Cpu, t("ESP32-CAM", "ESP32-CAM")], [Wifi, t("Wi-Fi + Bluetooth", "Wi-Fi وبلوتوث")], [Plug, t("USB-C charging", "شحن USB-C")], [ScanFace, t("On-device AI", "ذكاء داخل الجهاز")], [Cloud, t("Secure cloud sync", "مزامنة سحابية آمنة")], [Bell, t("Instant alerts", "تنبيهات فورية")]].map(([I, l], i) => {
              const Icon = I as typeof Camera;
              return <div key={i} className="flex items-center gap-2 rounded-sm border border-border bg-card/70 px-3 py-2 text-sm"><Icon className="h-4 w-4 text-primary" />{l as string}</div>;
            })}
          </div>
        </Reveal>
      </div>

      <Reveal>
        <h3 className="mb-4 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground" dir="ltr">HOW IT WORKS</h3>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([Icon, title, body], i) => (
            <li key={i} className="rounded-sm border border-border bg-card/80 p-4">
              <div className="flex items-center gap-2"><span className="font-mono text-sm text-primary">0{i + 1}</span><Icon className="h-5 w-5 text-primary" /></div>
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Panel title={t("Exploded view", "المنظر التفكيكي")} className="h-full">
            <img src={exploded.url} alt="Exploded view of Vision Box: glass cover, lens ring, ESP32-CAM module, USB-C power board, battery, back shell and magnetic wall mount" loading="lazy" className="w-full" />
          </Panel>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <Panel title={t("Technical specifications", "المواصفات الفنية")} className="h-full">
            <dl className="divide-y divide-border">
              {specs.map(([Icon, k, v], i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{k}</dt>
                  <dd dir="ltr" className="font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </Reveal>
      </div>

      <Reveal>
        <h3 className="mb-4 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground" dir="ltr">COMPONENTS</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {parts.map(([n, d], i) => (
            <div key={i} className="rounded-sm border border-border bg-card/80 p-4">
              <p dir="ltr" className="font-mono text-sm font-semibold text-primary">{n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h3 className="mb-4 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground" dir="ltr">ASSEMBLY STEPS</h3>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{t(
          "The unit goes together in seven steps: the magnetic wall mount, the back shell, the Li-Po battery, the USB-C power board with the buzzer and LEDs, the ESP32-CAM with the OV2640 camera, the aluminium lens ring, and finally the tempered glass front cover.",
          "يُجمَّع الجهاز في سبع خطوات: القاعدة المغناطيسية للتثبيت على الجدار، ثم الغلاف الخلفي، ثم بطارية الليثيوم بوليمر، ثم لوحة الطاقة بمنفذ USB-C مع الصفارة والمؤشرات الضوئية، ثم لوحة ESP32-CAM بكاميرا OV2640، ثم حلقة العدسة المصنوعة من الألومنيوم، وأخيرًا الغطاء الأمامي من الزجاج المقوّى.")}</p>
        <Panel title={t("Step-by-step assembly diagram", "مخطط التجميع خطوة بخطوة")}>
          <a href={assembly.url} target="_blank" rel="noreferrer"><img src={assembly.url} alt="Vision Box assembly diagram: magnetic wall mount, back shell, Li-Po battery, USB-C power board, ESP32-CAM with OV2640 camera, lens ring and front glass cover" loading="lazy" className="w-full" /></a>
        </Panel>
      </Reveal>

      <Reveal>
        <h3 className="mb-4 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground" dir="ltr">3D CAD MODEL</h3>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{t(
          "The outer shell was modelled in 3D before building: a 63 × 63 mm body with four corner mounts, a lens opening at the front, side openings for the indicators and the power port, and inside, fixed seats for the camera module and the board.",
          "صُمِّم الغلاف الخارجي بالنمذجة ثلاثية الأبعاد قبل التصنيع: جسم بأبعاد 63 × 63 ملم، وأربعة مثبتات في الأركان، وفتحة للعدسة في المقدّمة، وفتحات جانبية للمؤشرات ومنفذ الطاقة، وفي الداخل مقاعد ثابتة لوحدة الكاميرا واللوحة الإلكترونية.")}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {cad.map(([asset, title, body], i) => (
            <Panel key={i} title={title} className="h-full">
              <img src={asset.url} alt={`${title} of the Vision Box shell 3D model`} loading="lazy" className="w-full" />
              <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">{body}</p>
            </Panel>
          ))}
        </div>
        <Panel title={t("3D-printable back shell blueprint", "المخطط الهندسي للغلاف الخلفي القابل للطباعة ثلاثية الأبعاد")} className="mt-4">
          <a href={shellBlueprint.url} target="_blank" rel="noreferrer"><img src={shellBlueprint.url} alt="Vision Box back shell engineering blueprint: front and rear isometric views, cross-section, M2 screw bosses, battery bay, magnetic mount recess, USB-C cutouts, 2.0 mm wall thickness" loading="lazy" className="w-full" /></a>
          <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">{t(
            "The master blueprint for 3D printing the back shell: reinforced M2 corner screw bosses, a ribbed battery bay, a deep recess for the magnetic wall mount, USB-C and vent cutouts, and a 2.0 mm wall — 60 × 63 × 53 mm overall.",
            "المخطط الأساسي لطباعة الغلاف الخلفي بالطابعة ثلاثية الأبعاد: دعامات براغي M2 مقوّاة في الأركان، وحجرة بطارية مضلَّعة، وتجويف عميق للقاعدة المغناطيسية، وفتحات لمنفذ USB-C والتهوية، وسماكة جدار 2.0 ملم — بأبعاد إجمالية 60 × 63 × 53 ملم.")}</p>
        </Panel>
      </Reveal>

      <Reveal>
        <Panel title={t("Full design sheet", "لوحة التصميم الكاملة")}>
          <a href={sheet.url} target="_blank" rel="noreferrer"><img src={sheet.url} alt="Vision Box full design sheet" loading="lazy" className="w-full" /></a>
        </Panel>
      </Reveal>
    </div>
  );
}
