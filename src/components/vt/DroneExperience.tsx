import { useState } from "react";
import { Play, Pause, RotateCcw, Layers3, Rotate3d, MoveUpRight, Cpu, Camera, BatteryCharging, Radio, Fan, Box, ArrowDown, Check, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { DRONE_PARTS } from "@/lib/drone";
import { DroneScene } from "./DroneScene";

const ICONS = [Box, Fan, Cpu, Radio, BatteryCharging, Camera];
export function DroneExperience() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState("frame"); const [exploded, setExploded] = useState(false); const [flying, setFlying] = useState(false); const [spinning, setSpinning] = useState(true); const [angle, setAngle] = useState<"perspective" | "top" | "front">("perspective"); const [reset, setReset] = useState(0);
  const part = DRONE_PARTS.find((p) => p.id === selected) ?? DRONE_PARTS[0];
  return <div className="space-y-6">
    <div className="relative isolate -mx-6 overflow-hidden border-y border-border bg-background/80 sm:mx-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-2 p-4 sm:p-6"><div><p className="font-mono text-xs text-primary">VTX-1 / {t("3D CONCEPT", "تصوّر ثلاثي الأبعاد")}</p><p className="mt-1 text-xs text-muted-foreground">{t("Prototype-inspired · proposed vision payload", "مستوحى من النموذج الأولي · وحدة رؤية مقترحة")}</p></div><span className="flex items-center gap-2 font-mono text-[10px] text-det-cyan"><FlaskConical className="size-3" />{flying ? t("FLIGHT SIMULATION", "محاكاة الطيران") : exploded ? t("COMPONENT BREAKDOWN", "تفكيك المكوّنات") : t("INTERACTIVE MODEL", "نموذج تفاعلي")}</span></div>
      <DroneScene selected={selected} exploded={exploded} flying={flying} spinning={spinning} angle={angle} reset={reset} onSelect={setSelected} />
      <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-3 sm:bottom-6 sm:start-6 sm:end-6"><p className="max-w-[65%] border-s-2 border-primary ps-3 text-sm font-semibold">{part?.label[lang]}<span className="mt-1 block text-xs font-normal text-muted-foreground">{part?.purpose[lang]}</span></p><span className="font-mono text-xs text-det-cyan">{String(DRONE_PARTS.findIndex((p) => p.id === selected) + 1).padStart(2, "0")} / 06</span></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><div className="flex flex-wrap gap-2">
      <Button size="sm" variant={exploded ? "default" : "outline"} aria-pressed={exploded} onClick={() => setExploded(!exploded)}><Layers3 />{t("Exploded view", "عرض المكوّنات منفصلة")}</Button>
      <Button size="sm" variant={flying ? "default" : "outline"} aria-pressed={flying} onClick={() => { setFlying(!flying); if (!flying) { setSpinning(true); setExploded(false); } }}><MoveUpRight />{t("Flight demo", "محاكاة الطيران")}</Button>
      <Button size="icon" variant="outline" aria-label={spinning ? t("Pause propellers", "إيقاف المراوح") : t("Spin propellers", "تشغيل المراوح")} title={spinning ? t("Pause propellers", "إيقاف المراوح") : t("Spin propellers", "تشغيل المراوح")} onClick={() => setSpinning(!spinning)}>{spinning ? <Pause /> : <Play />}</Button>
      <Button size="icon" variant="outline" aria-label={t("Reset 3D view", "إعادة ضبط العرض ثلاثي الأبعاد")} title={t("Reset 3D view", "إعادة ضبط العرض ثلاثي الأبعاد")} onClick={() => { setAngle("perspective"); setReset((r) => r + 1); setFlying(false); setExploded(false); setSelected("frame"); }}><RotateCcw /></Button>
    </div><div className="flex items-center gap-1" aria-label={t("View angle", "زاوية العرض")}>{([{ id: "perspective" as const, icon: Rotate3d, label: t("Perspective view", "عرض منظور") }, { id: "top" as const, icon: ArrowDown, label: t("Top view", "عرض علوي") }, { id: "front" as const, icon: Camera, label: t("Front view", "عرض أمامي") }]).map((a) => <Button key={a.id} variant={angle === a.id ? "default" : "outline"} size="icon" aria-label={a.label} title={a.label} aria-pressed={angle === a.id} onClick={() => { setAngle(a.id); setReset((r) => r + 1); }}><a.icon /></Button>)}</div></div>
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2" aria-label={t("Drone components", "مكوّنات الطائرة المسيّرة")}>{DRONE_PARTS.map((p, i) => { const Icon = ICONS[i] ?? Box; return <Button key={p.id} variant={selected === p.id ? "default" : "outline"} className="h-auto min-h-20 justify-start whitespace-normal px-3 py-3 text-start" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}><Icon /><span className="min-w-0"><span className="block font-mono text-[10px] opacity-70">0{i + 1}</span><span className="block text-xs font-semibold">{p.label[lang]}</span></span></Button>; })}</div>
      <section aria-live="polite" className="min-w-0 space-y-3 border-s-2 border-det-cyan ps-5"><p className="font-mono text-xs text-det-cyan">VTX-1 / {t("COMPONENT FILE", "ملف المكوّن")}</p><h3 className="text-2xl font-bold">{part?.label[lang]}</h3><p className="font-semibold">{part?.purpose[lang]}</p><p className="text-sm leading-7 text-muted-foreground">{part?.detail[lang]}</p><p className="flex items-start gap-2 border-t border-border pt-3 text-xs text-warning"><Check className="mt-0.5 size-3 shrink-0" />{part?.status[lang]}</p></section>
    </div>
  </div>;
}