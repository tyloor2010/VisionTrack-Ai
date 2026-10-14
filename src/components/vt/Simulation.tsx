import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Btn, Panel } from "./ui";
import { SearchMap } from "./SearchMap";
import { cameras } from "@/data/mock";
import { useLang } from "@/lib/i18n";

/** Scripted 10-minute incident replayed in ~60 seconds at 1x. */
export function Simulation() {
  const { t } = useLang();
  const [sec, setSec] = useState(0); // simulated seconds, 0..600
  const [run, setRun] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setSec((s) => (s >= 600 ? (setRun(false), 600) : Math.min(600, s + 10 * speed))), 1000);
    return () => clearInterval(id);
  }, [run, speed]);
  const steps = [
    { at: 0, l: t("Report received from family", "استلام البلاغ من الأسرة") },
    { at: 60, l: t("Search radius starts expanding", "بدء توسيع نطاق البحث") },
    { at: 240, l: t("Camera hit — CAM-014", "رصد بالكاميرا — CAM-014") },
    { at: 300, l: t("Potential match alert 87%", "تنبيه تطابق محتمل 87%") },
    { at: 420, l: t("Human review — confirmed", "مراجعة بشرية — تم التأكيد") },
    { at: 540, l: t("Unit dispatched", "توجيه فريق ميداني") },
  ];
  const mm = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <Panel title={t("Simulation mode", "وضع المحاكاة")} right={<span dir="ltr" className="font-mono text-xs text-primary">T+{mm}</span>}>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <SearchMap origin={cameras[0]!.pos} radiusKm={Math.min(2.5, 0.2 + sec / 240)} fitKm={2.5} matches={sec >= 240 ? ["CAM-014"] : []} className="h-64" />
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Btn size="sm" onClick={() => { if (sec >= 600) setSec(0); setRun(!run); }}>{run ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{run ? t("Pause", "إيقاف مؤقت") : t("Run scenario", "تشغيل السيناريو")}</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { setRun(false); setSec(0); }} aria-label={t("Reset", "إعادة")}><RotateCcw className="h-3.5 w-3.5" /></Btn>
            {[1, 2, 4].map((s) => <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 font-mono text-xs ${speed === s ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>{s}x</button>)}
          </div>
          <div className="mb-3 h-1 bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${(sec / 600) * 100}%` }} /></div>
          <ol className="space-y-1.5 text-xs">
            {steps.map((s) => (
              <li key={s.at} className={`flex gap-2 ${sec >= s.at ? "text-foreground" : "text-muted-foreground/50"}`}>
                <span dir="ltr" className="font-mono text-primary">{String(Math.floor(s.at / 60)).padStart(2, "0")}:00</span>{s.l}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Panel>
  );
}
