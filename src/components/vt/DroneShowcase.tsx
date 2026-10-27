import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Radio, Satellite, Navigation, Camera, Plane, ArrowUpRight, Box, ScanEye, ShieldCheck, Cpu, Workflow } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { IntelMap, type IntelLayer, type LL } from "./IntelMap";
import { Btn, btnClass } from "./ui";
import aerialClip from "@/assets/drone-aerial.webm.asset.json";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";
import { DroneExperience } from "./DroneExperience";
import { Button } from "@/components/ui/button";

const BASE: LL = [30.0444, 31.2357];
const PATROL: LL[] = [[30.0485,31.2315],[30.0515,31.238],[30.047,31.2445],[30.0415,31.242],[30.0395,31.2345],[30.042,31.229]];
export function DroneShowcase() {
  const { t } = useLang();
  const [view, setView] = useState<"model" | "prototype" | "aerial" | "patrol">("model");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running || view !== "patrol") return;
    const id = setInterval(() => setStep((s) => s + 1), 800);
    return () => clearInterval(id);
  }, [running, view]);
  const leg = Math.floor(step / 8) % PATROL.length;
  const a = PATROL[leg] ?? BASE, b = PATROL[(leg + 1) % PATROL.length] ?? BASE;
  const frac = step % 8 / 8;
  const pos: LL = [a[0] + (b[0]-a[0])*frac, a[1] + (b[1]-a[1])*frac];
  const layers = useMemo<IntelLayer[]>(() => [
    { kind: "zone", at: BASE, rx: 1.2, label: t("SEARCH SECTOR", "قطاع البحث") },
    { kind: "path", pts: [...PATROL, PATROL[0] ?? BASE], color: "var(--primary)", dashed: true },
    { kind: "path", pts: [...PATROL.slice(0,leg+1), pos], color: "var(--det-cyan)" },
    { kind: "node", at: BASE, label: t("BASE", "القاعدة"), color: "var(--det-green)" },
    { kind: "node", at: pos, label: "VTX-1", color: "var(--primary)" },
  ], [step, t]);
  const modes = [
    { id: "model" as const, icon: Box, label: t("3D aircraft", "الطائرة ثلاثية الأبعاد") },
    { id: "prototype" as const, icon: Plane, label: t("Our prototype", "نموذجنا الأولي") },
    { id: "aerial" as const, icon: Camera, label: t("Aerial view", "المشهد الجوي") },
    { id: "patrol" as const, icon: Navigation, label: t("Patrol simulation", "محاكاة الدورية") },
  ];
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
      <div className="flex flex-wrap gap-1" role="tablist" aria-label={t("Drone views", "مشاهد الطائرة المسيّرة")}>
        {modes.map((m) => <Button key={m.id} role="tab" id={`drone-tab-${m.id}`} aria-controls={`drone-panel-${m.id}`} aria-selected={view === m.id} variant={view === m.id ? "default" : "ghost"} size="sm" onClick={() => setView(m.id)}><m.icon className="h-4 w-4" />{m.label}</Button>)}
      </div>
      <span className="font-mono text-xs text-det-cyan">VTX-1 / {t("TEAM-BUILT", "من صنع الفريق")}</span>
    </div>
    {view === "model" ? <div role="tabpanel" id="drone-panel-model" aria-labelledby="drone-tab-model"><DroneExperience /></div> : <div className="relative min-w-0 overflow-hidden bg-muted" role="tabpanel" id={`drone-panel-${view}`} aria-labelledby={`drone-tab-${view}`}>
      {view === "prototype" ? <img src={media.droneBuild} alt={t("VisionTrack team's hand-built quadcopter prototype", "النموذج الأولي للطائرة المسيّرة من صنع فريق VisionTrack")} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-contain sm:aspect-[16/9]" /> : view === "aerial" ? <video src={aerialClip.url} poster={media.aerialV2x} muted autoPlay loop playsInline controls className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" aria-label={t("Sample aerial footage, not a live drone feed", "تصوير جوي توضيحي، وليس بثًا مباشرًا من الطائرة")} /> : <IntelMap center={[30.0455,31.2365]} layers={layers} className="h-[440px] sm:h-[560px]" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap justify-between gap-2 bg-background/85 px-4 py-3 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-primary"><Radio className="h-4 w-4" />VTX-1 · {t("VISIONTRACK AIR UNIT", "وحدة VISIONTRACK الجوية")}</span>
        <span className="text-muted-foreground">{view === "prototype" ? t("ACTUAL PROTOTYPE", "النموذج الأولي الفعلي") : t("DEMO — NOT A LIVE FEED", "عرض تجريبي — ليس بثًا مباشرًا")}</span>
      </div>
      <span className="pointer-events-none absolute bottom-4 start-4 border-s-4 border-primary bg-background/85 px-4 py-2 text-lg font-bold">{view === "prototype" ? t("Built here. Not a stock photo.", "من صنع فريقنا. ليست صورة جاهزة.") : t("Street cameras + aerial perspective", "كاميرات الشوارع + الرؤية الجوية")}</span>
    </div>}
    {view === "patrol" && <div className="flex flex-wrap items-center gap-3 border-b border-border py-4">
      <Btn size="sm" onClick={() => setRunning(!running)}>{running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{running ? t("Pause patrol", "إيقاف الدورية مؤقتًا") : t("Start patrol", "بدء الدورية")}</Btn>
      <Btn size="sm" variant="ghost" title={t("Reset patrol", "إعادة ضبط الدورية")} aria-label={t("Reset patrol", "إعادة ضبط الدورية")} onClick={() => { setRunning(false); setStep(0); }}><RotateCcw className="h-4 w-4" /></Btn>
      <span className="flex items-center gap-2 font-mono text-xs text-det-cyan"><Satellite className="h-4 w-4" /><span dir="ltr">{pos[0].toFixed(5)}, {pos[1].toFixed(5)}</span></span>
    </div>}
    <div className="grid gap-6 border-b border-border py-7 md:grid-cols-3">
      {[
        ["01", t("Above the blind spots", "فوق النقاط العمياء"), t("An aerial perspective for rooftops, riverbanks and places street cameras cannot see.", "رؤية جوية للأسطح وضفاف الأنهار والأماكن التي لا ترصدها كاميرات الشوارع.")],
        ["02", t("One search, two perspectives", "بحث واحد، من منظورين"), t("Drone imagery joins the camera search, bringing aerial leads into the same review workflow.", "تتكامل صور الطائرات المسيّرة مع البحث عبر الكاميرات، ضمن مسار مراجعة واحد.")],
        ["03", t("The decision stays human", "القرار يبقى للإنسان"), t("Potential match — requires human review. No autonomous pursuit or dispatch.", "تطابق محتمل — يتطلب مراجعة بشرية. لا ملاحقة ولا توجيه للفرق بصورة مستقلة.")],
      ].map(([n,h,p]) => <div key={n}><span className="font-mono text-xs text-primary">{n}</span><h3 className="mt-2 text-xl font-bold">{h}</h3><p className="mt-2 text-sm text-muted-foreground">{p}</p></div>)}
    </div>
    <DroneDetails />
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="max-w-2xl text-xs text-muted-foreground">{t("Prototype shown is ours. Patrol movement and aerial footage are demonstrations, not proof of a live connection or measured flight performance.", "النموذج المعروض من صنع فريقنا. حركة الدورية والتصوير الجوي للعرض التوضيحي، ولا يثبتان اتصالًا مباشرًا أو أداء طيران مقاسًا.")}</p><Link to="/dashboard/case/$id" params={{ id: "VT-2041" }} className={btnClass("outline", "sm")}>{t("Open aerial case view", "عرض الحالة من الجو")}<ArrowUpRight className="h-4 w-4" /></Link></div>
  </div>;
}

function DroneDetails() {
  const { t } = useLang();
  const [stage, setStage] = useState(0);
  const pipeline = [
    { icon: Camera, title: t("Capture", "التقاط الصور"), detail: t("A proposed stabilized camera collects aerial frames from an authorized search area. Sample footage demonstrates the perspective, not a live aircraft connection.", "تلتقط الكاميرا المثبّتة المقترحة صورًا جوية داخل نطاق بحث مصرح به. يوضّح التصوير التجريبي هذا المنظور ولا يمثّل اتصالًا مباشرًا بالطائرة.") },
    { icon: Cpu, title: t("Process", "معالجة الصور"), detail: t("The planned connection sends selected frames into the vision pipeline. Detection, quality checks and privacy masking would happen before review; onboard processing has not been verified.", "يرسل التكامل المخطط إطارات مختارة إلى مسار الرؤية الحاسوبية. تسبق المراجعة مراحل الرصد وفحص الجودة وإخفاء البيانات الحساسة؛ المعالجة على متن الطائرة غير مؤكدة.") },
    { icon: ScanEye, title: t("Compare", "المقارنة"), detail: t("Visual leads can be compared with approved case information and nearby camera sightings. A score is a review aid, not proof of identity.", "يمكن مقارنة المؤشرات البصرية بمعلومات الحالة المصرّح بها ونتائج كاميرات المنطقة. درجة التشابه أداة للمراجعة وليست إثباتًا للهوية.") },
    { icon: ShieldCheck, title: t("Human review", "المراجعة البشرية"), detail: t("Potential match — requires human review. An authorized reviewer checks the evidence and decides whether a field verification is appropriate; the aircraft does not pursue a person autonomously.", "تطابق محتمل — يتطلب مراجعة بشرية. يفحص المراجِع المختص الأدلة ويقرر الحاجة إلى التحقق الميداني؛ لا تتعقّب الطائرة الأشخاص بصورة مستقلة.") },
    { icon: Workflow, title: t("Coordinate", "التنسيق"), detail: t("Reviewed aerial leads would enter the same case timeline as street-camera sightings. Dispatch remains subject to authorized people and the existing case workflow.", "تُضاف المؤشرات الجوية المراجَعة إلى التسلسل الزمني نفسه الذي يسجل رصد كاميرات الشوارع. يظل توجيه الفرق خاضعًا للمختصين ومسار الحالة المعتمد.") },
  ];
  const current = pipeline[stage];
  return <div className="space-y-10 py-8">
    <section className="space-y-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-2xl font-bold">{t("From aerial frame to reviewed lead", "من الصورة الجوية إلى مؤشر خاضع للمراجعة")}</h3><span className="font-mono text-xs text-det-cyan">{t("PROPOSED WORKFLOW", "مسار عمل مقترح")}</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{pipeline.map((s, i) => <Button key={i} variant={stage === i ? "default" : "outline"} aria-pressed={stage === i} className="h-auto min-h-16 flex-col whitespace-normal py-3" onClick={() => setStage(i)}><s.icon />{s.title}</Button>)}</div><div className="min-h-32 border-s-2 border-primary ps-4" aria-live="polite"><h4 className="text-lg font-bold">{current?.title}</h4><p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{current?.detail}</p></div></section>
    <section className="space-y-4"><h3 className="text-2xl font-bold">{t("The next evolution", "المرحلة التالية من التطوير")}</h3><div className="grid gap-6 md:grid-cols-3">{[
      [t("01 / AIRFRAME", "٠١ / هيكل الطائرة"), t("Validate the foundations", "التحقق من الأساسيات"), t("Balance, wiring, motor response, vibration and safe bench testing come before flight. Endurance, payload and range need measured results.", "تسبق الطيرانَ اختباراتُ التوازن والتوصيلات واستجابة المحركات والاهتزاز على منصة آمنة. تحتاج مدة التشغيل والحمولة والمدى إلى نتائج مقاسة.")],
      [t("02 / VISION", "٠٢ / الرؤية"), t("Add the aerial eye", "إضافة الرؤية الجوية"), t("A stabilized camera, image-quality checks and secure frame transport are proposed upgrades. Integration should be evaluated on authorized, representative footage.", "الكاميرا المثبّتة وفحوص جودة الصورة والنقل الآمن للإطارات تطويرات مقترحة. يجب تقييم التكامل باستخدام تصوير مصرح به وممثّل لظروف التشغيل.")],
      [t("03 / OPERATIONS", "٠٣ / التشغيل"), t("Make the mission accountable", "تشغيل قابل للمراجعة والمساءلة"), t("Operator approval, documented search boundaries, connection-loss behavior and a reviewed incident log must precede operational deployment.", "يجب اعتماد المشغّل وتوثيق حدود البحث واختبار استجابة فقد الاتصال ومراجعة سجل المهمة قبل الاستخدام التشغيلي.")],
    ].map(([tag, title, text]) => <div key={tag} className="border-t-2 border-det-cyan pt-4"><p className="font-mono text-xs text-det-cyan">{tag}</p><h4 className="mt-3 text-xl font-bold">{title}</h4><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></div>)}</div></section>
    <section className="border-y border-border py-5"><h3 className="text-lg font-bold">{t("What is real, and what is a concept?", "ما الفعلي وما التصوّري في هذا العرض؟")}</h3><div className="mt-3 grid gap-4 text-sm md:grid-cols-2"><p className="border-s-2 border-success ps-3">{t("Real: the team's uploaded prototype photograph, kept unchanged. Its visible structure and electronics inspired this model.", "الفعلي: صورة النموذج الأولي التي رفعها الفريق، محفوظة دون تغيير. استُلهم النموذج من هيكله وإلكترونياته الظاهرة.")}</p><p className="border-s-2 border-warning ps-3 text-muted-foreground">{t("Concept: the 3D dimensions, camera payload, motion and integration story. No CAD measurements, proven autonomous flight, live telemetry or measured performance are represented.", "التصوّري: الأبعاد ثلاثية الأبعاد ووحدة الكاميرا والحركة ومسار التكامل. لا يمثّل العرض قياسات هندسية معتمدة أو طيرانًا ذاتيًا مثبتًا أو بيانات مباشرة أو أداءً مقاسًا.")}</p></div></section>
  </div>;
}
