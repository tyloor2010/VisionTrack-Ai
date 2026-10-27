import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Radio, Satellite, Navigation, Camera, Plane, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { IntelMap, type IntelLayer, type LL } from "./IntelMap";
import { Btn, btnClass } from "./ui";
import aerialClip from "@/assets/drone-aerial.webm.asset.json";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

const BASE: LL = [30.0444, 31.2357];
const PATROL: LL[] = [[30.0485,31.2315],[30.0515,31.238],[30.047,31.2445],[30.0415,31.242],[30.0395,31.2345],[30.042,31.229]];
export function DroneShowcase() {
  const { t } = useLang();
  const [view, setView] = useState<"prototype" | "aerial" | "patrol">("prototype");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setStep((s) => s + 1), 800);
    return () => clearInterval(id);
  }, [running]);
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
    { id: "prototype" as const, icon: Plane, label: t("Our prototype", "نموذجنا الأولي") },
    { id: "aerial" as const, icon: Camera, label: t("Aerial view", "المشهد الجوي") },
    { id: "patrol" as const, icon: Navigation, label: t("Patrol simulation", "محاكاة الدورية") },
  ];
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
      <div className="flex flex-wrap gap-1" role="tablist" aria-label={t("Drone views", "مشاهد الطائرة المسيّرة")}>
        {modes.map((m) => <Btn key={m.id} role="tab" aria-selected={view === m.id} variant={view === m.id ? "primary" : "ghost"} size="sm" onClick={() => setView(m.id)}><m.icon className="h-4 w-4" />{m.label}</Btn>)}
      </div>
      <span className="font-mono text-xs text-det-cyan">VTX-1 / {t("TEAM-BUILT", "من صنع الفريق")}</span>
    </div>
    <div className="relative min-w-0 overflow-hidden bg-muted" role="tabpanel">
      {view === "prototype" ? <img src={media.droneBuild} alt={t("VisionTrack team's hand-built quadcopter prototype", "النموذج الأولي للطائرة المسيّرة من صنع فريق VisionTrack")} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-contain sm:aspect-[16/9]" /> : view === "aerial" ? <video src={aerialClip.url} poster={media.aerialV2x} muted autoPlay loop playsInline controls className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" aria-label={t("Sample aerial footage, not a live drone feed", "تصوير جوي توضيحي، وليس بثًا مباشرًا من الطائرة")} /> : <IntelMap center={[30.0455,31.2365]} layers={layers} className="h-[440px] sm:h-[560px]" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap justify-between gap-2 bg-background/85 px-4 py-3 font-mono text-[11px]">
        <span className="flex items-center gap-2 text-primary"><Radio className="h-4 w-4" />VTX-1 · {t("VISIONTRACK AIR UNIT", "وحدة VISIONTRACK الجوية")}</span>
        <span className="text-muted-foreground">{view === "prototype" ? t("ACTUAL PROTOTYPE", "النموذج الأولي الفعلي") : t("DEMO — NOT A LIVE FEED", "عرض تجريبي — ليس بثًا مباشرًا")}</span>
      </div>
      <span className="pointer-events-none absolute bottom-4 start-4 border-s-4 border-primary bg-background/85 px-4 py-2 text-lg font-bold">{view === "prototype" ? t("Built here. Not a stock photo.", "من صنع فريقنا. ليست صورة جاهزة.") : t("Street cameras + aerial perspective", "كاميرات الشوارع + الرؤية الجوية")}</span>
    </div>
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
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="max-w-2xl text-xs text-muted-foreground">{t("Prototype shown is ours. Patrol movement and aerial footage are demonstrations, not proof of a live connection or measured flight performance.", "النموذج المعروض من صنع فريقنا. حركة الدورية والتصوير الجوي للعرض التوضيحي، ولا يثبتان اتصالًا مباشرًا أو أداء طيران مقاسًا.")}</p><Link to="/dashboard/case/$id" params={{ id: "VT-2041" }} className={btnClass("outline", "sm")}>{t("Open aerial case view", "عرض الحالة من الجو")}<ArrowUpRight className="h-4 w-4" /></Link></div>
  </div>;
}
