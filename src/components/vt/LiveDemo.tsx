import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, X, Siren, Search, RotateCcw } from "lucide-react";
import { cameras, profiles } from "@/data/mock";
import { DetectionBox } from "./DetectionBox";
import { SearchMap } from "./SearchMap";
import { Btn, Panel } from "./ui";
import { useLang } from "@/lib/i18n";

type Phase = "idle" | "scanning" | "found";

export function LiveDemo() {
  const { t, lang } = useLang();
  const [pid, setPid] = useState(profiles[0]!.id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hours, setHours] = useState(2);
  const [decision, setDecision] = useState<null | "confirmed" | "rejected" | "dispatched">(null);
  const [clock, setClock] = useState("");
  const profile = profiles.find((p) => p.id === pid)!;
  const matchCams = cameras.filter((c) => c.match).map((c) => c.id);

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const start = () => {
    setDecision(null);
    setPhase("scanning");
    setTimeout(() => setPhase("found"), 3200);
  };

  // radius in km: speed (km/h) × hours elapsed
  const top = cameras.find((c) => c.id === matchCams[0])!;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)]">
      {/* Profile panel */}
      <Panel title={t("Missing person", "الشخص المفقود")}>
        <div className="space-y-4 p-4">
          <div className="grid gap-2" role="radiogroup" aria-label="Select profile">
            {profiles.map((p) => (
              <button key={p.id} role="radio" aria-checked={pid === p.id} onClick={() => { setPid(p.id); setPhase("idle"); }}
                className={`border px-3 py-2 text-start text-sm transition-colors ${pid === p.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {p.name[lang]}
              </button>
            ))}
          </div>
          <dl className="space-y-2 font-mono text-xs">
            {[
              [t("Age", "العمر"), String(profile.age)],
              [t("Clothing", "الملابس"), profile.clothing[lang]],
              [t("Last seen", "آخر ظهور"), `${profile.lastSeen[lang]} · ${profile.time}`],
              [t("Condition", "الحالة الصحية"), profile.condition[lang]],
              [t("Est. speed", "السرعة المتوقعة"), `${profile.speedKmh} km/h`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
                <dt className="uppercase text-muted-foreground">{k}</dt>
                <dd className="text-end text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <Btn className="w-full" onClick={start} disabled={phase === "scanning"}>
            {phase === "scanning" ? <><Search className="h-4 w-4 animate-pulse" />{t("Scanning…", "جارٍ البحث…")}</> : phase === "found" ? <><RotateCcw className="h-4 w-4" />{t("Search again", "بحث جديد")}</> : <><Search className="h-4 w-4" />{t("Start search", "ابدأ البحث")}</>}
          </Btn>
        </div>
      </Panel>

      {/* Camera wall */}
      <Panel title={t("Camera wall", "شاشات المراقبة")} right={<span dir="ltr" className="font-mono text-[10px] text-det-red">● REC {clock}</span>} className="cursor-crosshair-hud">
        <div className="grid grid-cols-2 gap-1.5 p-1.5 md:grid-cols-3">
          {cameras.map((c) => {
            const flagged = phase === "found" && c.match;
            return (
              <div key={c.id} className={`relative aspect-video overflow-hidden bg-muted scanlines ${phase === "scanning" ? "scan-sweep" : ""} ${flagged ? "ring-2 ring-det-red" : ""}`}>
                <img src={c.img} alt={c.name.en} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                {c.boxes.map((b, i) => <DetectionBox key={i} {...b} confidence={b.conf} jitter delay={i * 0.15} />)}
                {flagged && c.match && <DetectionBox {...c.match} confidence={c.match.conf} alert />}
                <div dir="ltr" className="absolute bottom-0 inset-x-0 flex justify-between bg-background/70 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  <span>{c.id}</span>
                  <span className="truncate ps-2">{c.name[lang]}</span>
                </div>
                {phase === "scanning" && <div dir="ltr" className="absolute end-1.5 top-1.5 font-mono text-[9px] text-primary animate-flicker">ANALYZING {Math.floor(Math.random() * 90 + 10)}%</div>}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Map + alert */}
      <div className="space-y-4">
        <Panel title={t("Geo-analysis", "التحليل الجغرافي")}>
          <SearchMap origin={profile.lastSeenPos} radiusKm={Math.min(2.5, Math.max(0.4, profile.speedKmh * hours * 0.15))} matches={phase === "found" ? matchCams : []} fitKm={2.5} />
          <div className="p-4">
            <label htmlFor="elapsed" className="flex justify-between font-mono text-xs uppercase text-muted-foreground">
              <span>{t("Time elapsed", "الوقت المنقضي")}</span>
              <span dir="ltr" className="text-warning">{hours}h · r≈{Math.min(2.5, Math.max(0.4, profile.speedKmh * hours * 0.15)).toFixed(1)} km</span>
            </label>
            <input id="elapsed" type="range" min={0} max={24} value={hours} onChange={(e) => setHours(+e.target.value)} className="mt-2 w-full accent-[var(--warning)] outline-none focus:outline-none focus-visible:ring-0 bg-transparent" />
          </div>
        </Panel>

        <AnimatePresence>
          {phase === "found" && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="alert">
              <Panel className="border-det-red/60 glow-red">
                <div className="p-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-det-red">
                    <span className="animate-blink">⚠</span> {t("Potential match", "تطابق محتمل")}
                  </div>
                  <div dir="ltr" className="mt-2 text-4xl font-bold text-foreground">{top.match!.conf}%</div>
                  <div className="h-1.5 w-full bg-secondary"><div className="h-full bg-det-red" style={{ width: `${top.match!.conf}%` }} /></div>
                  <dl className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                    <div dir="ltr">{top.id} · {clock}</div>
                    <div>{top.name[lang]}</div>
                  </dl>
                  <p className="mt-3 border-s-2 border-warning ps-2 text-xs text-warning">{t("Requires human review — not a confirmed identification.", "يستلزم مراجعة بشرية، ولا يُعدّ تعرّفًا مؤكدًا.")}</p>
                  {decision ? (
                    <p className="mt-4 font-mono text-sm uppercase text-success">✓ {decision === "confirmed" ? t("Confirmed by reviewer", "أكّده المراجِع") : decision === "rejected" ? t("Rejected — logged as false positive", "مرفوض، وسُجّل كإنذار كاذب") : t("Unit dispatched", "تم توجيه فريق ميداني")}</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Btn size="sm" variant="success" onClick={() => setDecision("confirmed")}><Check className="h-3.5 w-3.5" />{t("Confirm", "تأكيد")}</Btn>
                      <Btn size="sm" variant="ghost" className="border border-border" onClick={() => setDecision("rejected")}><X className="h-3.5 w-3.5" />{t("Reject", "رفض")}</Btn>
                      <Btn size="sm" variant="alert" onClick={() => setDecision("dispatched")}><Siren className="h-3.5 w-3.5" />{t("Dispatch", "إرسال")}</Btn>
                    </div>
                  )}
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
