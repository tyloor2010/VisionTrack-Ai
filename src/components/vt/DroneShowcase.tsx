import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Battery, Radio, Satellite, Gauge } from "lucide-react";
import { DetectionBox } from "@/components/vt/DetectionBox";
import { IntelMap, type IntelLayer, type LL } from "@/components/vt/IntelMap";
import { Panel, Counter, Reveal } from "@/components/vt/ui";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

/** Patrol loop around Tahrir Sq, Cairo — the demo drone flies this circuit. */
const BASE: LL = [30.0444, 31.2357];
const PATROL: LL[] = [
  [30.0485, 31.2315],
  [30.0515, 31.2380],
  [30.0470, 31.2445],
  [30.0415, 31.2420],
  [30.0395, 31.2345],
  [30.0420, 31.2290],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Animated live-telemetry readout; values drift slowly so it feels alive. */
function useTelemetry() {
  const [t, setT] = useState({ alt: 118, bat: 84, sats: 14, spd: 9.2, tick: 0 });
  useEffect(() => {
    const id = setInterval(
      () =>
        setT((p) => ({
          alt: Math.round(115 + Math.sin(p.tick / 6) * 8),
          bat: p.bat <= 62 ? 84 : +(p.bat - 0.1).toFixed(1),
          sats: 13 + Math.floor(Math.random() * 3),
          spd: +(8.4 + Math.random() * 2.2).toFixed(1),
          tick: p.tick + 1,
        })),
      1200,
    );
    return () => clearInterval(id);
  }, []);
  return t;
}

/** The drone glides along the patrol loop; the map redraws only the moving layers. */
function useDronePosition() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), 700);
    return () => clearInterval(id);
  }, []);
  const SEG = 6; // ticks per leg
  const leg = Math.floor(step / SEG) % PATROL.length;
  const frac = (step % SEG) / SEG;
  const a = PATROL[leg]!;
  const b = PATROL[(leg + 1) % PATROL.length]!;
  const pos: LL = [lerp(a[0], b[0], frac), lerp(a[1], b[1], frac)];
  const trail = PATROL.slice(0, leg + 1).concat([pos]);
  return { pos, trail };
}

export function DroneShowcase() {
  const { t } = useLang();
  const tm = useTelemetry();
  const { pos, trail } = useDronePosition();

  const layers = useMemo<IntelLayer[]>(
    () => [
      { kind: "zone", at: BASE, rx: 1.2, label: t("SECTOR A", "القطاع A") },
      { kind: "path", pts: PATROL.concat([PATROL[0]!]), color: "#facc15", dashed: true },
      { kind: "path", pts: trail, color: "#22d3ee" },
      { kind: "node", at: BASE, label: t("BASE", "القاعدة"), color: "#22c55e" },
      { kind: "node", at: pos, label: "VTX-1", color: "#facc15" },
    ],
    [pos, trail, t],
  );

  const stats = [
    { v: 25, s: t(" min", " دقيقة"), l: t("flight time per charge", "زمن الطيران بالشحنة الواحدة") },
    { v: 4, s: t(" km²", " كم²"), l: t("searched from the air per sortie", "تُمسح جوًا في الطلعة الواحدة") },
    { v: 3, s: t(" min", " دقائق"), l: t("from alert to wheels-up", "من التنبيه حتى الإقلاع") },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Our actual prototype with a live HUD laid over it */}
      <Panel title={t("VTX-1 — our prototype", "VTX-1 — النموذج الأولي لدينا")} className="p-0">
        <div className="scanlines relative aspect-[6/5] overflow-hidden">
          <img src={media.droneBuild} alt={t("The team's hand-built quadcopter prototype on the workbench", "النموذج الأولي للطائرة المسيّرة الذي بناه الفريق")} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />
          <DetectionBox label="MOTOR M1" confidence={98} color="green" x={10} y={8} w={16} h={20} delay={0.4} />
          <DetectionBox label="MOTOR M2" confidence={97} color="green" x={74} y={14} w={16} h={20} delay={0.6} />
          <DetectionBox label="MOTOR M3" confidence={98} color="green" x={6} y={64} w={20} h={22} delay={0.8} />
          <DetectionBox label="MOTOR M4" confidence={96} color="green" x={72} y={62} w={18} h={24} delay={1} />
          <DetectionBox label="FLIGHT CTRL" confidence={99} color="cyan" x={38} y={38} w={24} h={22} delay={1.2} />
          <div dir="ltr" className="absolute start-2 top-2 space-y-0.5 bg-background/75 px-2 py-1.5 font-mono text-[10px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-primary"><Radio className="h-3 w-3" /> LINK 2.4GHz · OK</div>
            <div className="flex items-center gap-1.5"><Satellite className="h-3 w-3" /> GPS · {tm.sats} SATS</div>
            <div className="flex items-center gap-1.5"><Gauge className="h-3 w-3" /> ALT {tm.alt} m · {tm.spd} m/s</div>
            <div className="flex items-center gap-1.5"><Battery className="h-3 w-3" /> {tm.bat}%</div>
          </div>
          <div dir="ltr" className="absolute bottom-2 end-2 bg-det-yellow px-1.5 font-mono text-[10px] font-bold leading-5 text-ink">VTX-1 · PROTOTYPE</div>
        </div>
        <p className="p-4 text-xs text-muted-foreground">
          {t(
            "Built by the team from the frame up: flight controller, GPS hold and a camera link that feeds the same matching pipeline as the street cameras.",
            "بناه الفريق قطعةً قطعة: وحدة تحكم في الطيران، وتثبيت بالقمر الصناعي، وكاميرا تغذي خط المطابقة نفسه الذي تعمل به كاميرات الشوارع.",
          )}
        </p>
      </Panel>

      {/* Live patrol map */}
      <Panel
        title={t("Live patrol — Sector A", "دورية جوية مباشرة — القطاع A")}
        right={<span className="flex items-center gap-1.5 font-mono text-[10px] text-det-red"><motion.span className="inline-block h-1.5 w-1.5 rounded-full bg-det-red" animate={{ opacity: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} />LIVE</span>}
        className="p-0"
      >
        <IntelMap center={[30.0455, 31.2365]} layers={layers} className="h-80 sm:h-96" />
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border text-center">
          {stats.map((s, k) => (
            <div key={k} className="p-3">
              <div dir="ltr" className="text-xl font-bold text-primary"><Counter to={s.v} suffix={s.s} /></div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Reveal className="lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { h: t("Eyes above the crowd", "عيون فوق الزحام"), p: t("A drone covers in minutes what a ground team needs hours to walk — rooftops, rail tracks, river banks and empty lots.", "تغطي الطائرة في دقائق ما يحتاج فريق الأرض ساعات لتمشيطه — الأسطح وخطوط السكك الحديد وضفاف النيل والأراضي الخالية.") },
            { h: t("Same brain, higher view", "العقل نفسه، من أعلى"), p: t("The aerial feed runs through the same face, clothing and movement matching — no separate system, no extra training for operators.", "يمر البث الجوي عبر منظومة المطابقة نفسها للوجه والملابس والحركة — دون نظام منفصل أو تدريب إضافي للمشغّلين.") },
            { h: t("A human still decides", "والقرار يبقى للإنسان"), p: t("The drone only flags potential matches from above. An authorized officer reviews every alert before anyone is sent.", "الطائرة لا تفعل سوى رصد تطابقات محتملة من الجو، ويراجع ضابط مخوَّل كل تنبيه قبل تحريك أي فريق.") },
          ].map((c, k) => (
            <Panel key={k} className="h-full p-5">
              <h3 className="text-lg font-bold">{c.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.p}</p>
            </Panel>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
