import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ScanSearch, Images, PenBox, Wand2, EyeOff, Check, X, Trash2, Plus } from "lucide-react";
import { cameras, media } from "@/data/mock";
import { useVT, can } from "@/lib/store";
import { useMedia, type Annotation } from "@/lib/mediaStore";
import { analyzeVideo, filterFrames, heatStrip, framesToCSV, framesToJSON, enhanceFilter, compareStills, downloadText, DEFAULT_FILTER } from "@/lib/media";
import { DetectionBox } from "@/components/vt/DetectionBox";
import { Panel, Btn, inputClass } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

type Tab = "video" | "compare" | "annotate" | "enhance" | "privacy";
const boxKey = (b: { label: string; x: number; y: number }) => `${b.label}-${b.x}-${b.y}`;

export function MediaLab() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("video");
  const tabs: { k: Tab; l: string; i: typeof ScanSearch }[] = [
    { k: "video", l: t("Video analysis", "تحليل الفيديو"), i: ScanSearch },
    { k: "compare", l: t("Photo compare", "مقارنة الصور"), i: Images },
    { k: "annotate", l: t("Annotation", "الوسم اليدوي"), i: PenBox },
    { k: "enhance", l: t("Enhancement", "تحسين الصورة"), i: Wand2 },
    { k: "privacy", l: t("Privacy blur", "حجب الهوية"), i: EyeOff },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((x) => (
          <button key={x.k} onClick={() => setTab(x.k)} className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-mono text-xs uppercase tracking-wider ${tab === x.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <x.i className="h-3.5 w-3.5" />{x.l}
          </button>
        ))}
      </div>
      {tab === "video" && <VideoTool />}
      {tab === "compare" && <CompareTool />}
      {tab === "annotate" && <AnnotateTool />}
      {tab === "enhance" && <EnhanceTool />}
      {tab === "privacy" && <PrivacyTool />}
    </div>
  );
}

/* ---------------- Video analysis ---------------- */
function VideoTool() {
  const { t } = useLang();
  const { emit } = useVT();
  const { filters, setFilters } = useMedia();
  const [src, setSrc] = useState(media.trafficGif);
  const [name, setName] = useState("traffic-cv.mp4");
  const [dur, setDur] = useState(12);
  const [cur, setCur] = useState(0);
  const vid = useRef<HTMLVideoElement>(null);

  const frames = useMemo(() => analyzeVideo(name, Math.min(30, dur)), [name, dur]);
  const shown = useMemo(() => filterFrames(frames, filters), [frames, filters]);
  const frame = shown.reduce((best, f) => (Math.abs(f.t - cur) < Math.abs(best.t - cur) ? f : best), shown[0] ?? { t: 0, boxes: [] });
  const heat = useMemo(() => heatStrip(shown), [shown]);
  const maxHeat = Math.max(1, ...heat);
  const classes = ["person", "car", "bus", "bicycle"];

  const pick = (f: File | undefined) => {
    if (!f) return;
    setSrc(URL.createObjectURL(f));
    setName(f.name);
    setCur(0);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={t("Frame-by-frame detection", "الرصد إطارًا بإطار")} className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <video ref={vid} src={src} muted loop playsInline autoPlay className="h-full w-full object-cover" onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 12)} onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} />
          {frame.boxes.map((b, i) => <DetectionBox key={i} label={b.label} confidence={b.conf} color={b.color} x={b.x} y={b.y} w={b.w} h={b.h} />)}
          <div dir="ltr" className="absolute start-2 top-2 bg-background/75 px-1.5 py-0.5 font-mono text-[10px]">t={cur.toFixed(1)}s · {frame.boxes.length} {t("objects", "عناصر")}</div>
        </div>
        <div className="space-y-2 p-3" dir="ltr">
          <input type="range" min={0} max={dur} step={0.1} value={cur} onChange={(e) => { const v = +e.target.value; setCur(v); if (vid.current) vid.current.currentTime = v; }} className="w-full accent-[var(--primary)]" aria-label={t("Scrub timeline", "شريط الزمن")} />
          <div className="relative h-4 border border-border bg-secondary/40">
            {shown.filter((f) => f.boxes.some((b) => b.label === "person")).map((f, i) => (
              <span key={i} className="absolute top-0 h-full w-0.5 bg-det-red/80" style={{ left: `${(f.t / dur) * 100}%` }} />
            ))}
          </div>
          <div className="flex h-8 items-end gap-px" aria-label={t("Detections per time bucket", "كثافة الرصد عبر الزمن")}>
            {heat.map((h, i) => <div key={i} className="flex-1 bg-primary" style={{ height: `${(h / maxHeat) * 100}%`, opacity: h ? 0.4 + (h / maxHeat) * 0.6 : 0.08 }} />)}
          </div>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title={t("Source & export", "المصدر والتصدير")}>
          <div className="space-y-3 p-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary">
              <Plus className="h-4 w-4" />{t("Upload a short video…", "ارفع مقطع فيديو قصيرًا…")}
              <input type="file" accept="video/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </label>
            <p className="font-mono text-[10px] text-muted-foreground" dir="ltr">{name} · {dur.toFixed(1)}s · {frames.length} {t("sampled frames", "إطارًا مُحللًا")}</p>
            <div className="flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => { downloadText(`${name}.json`, framesToJSON(shown), "application/json"); emit({ action: `EXPORT detections JSON (${name})`, msg: { en: "Detection results exported as JSON", ar: "صُدّرت نتائج الرصد بصيغة JSON" } }); }}><Download className="h-3.5 w-3.5" />JSON</Btn>
              <Btn size="sm" variant="outline" onClick={() => { downloadText(`${name}.csv`, framesToCSV(shown), "text/csv"); emit({ action: `EXPORT detections CSV (${name})`, msg: { en: "Detection results exported as CSV", ar: "صُدّرت نتائج الرصد بصيغة CSV" } }); }}><Download className="h-3.5 w-3.5" />CSV</Btn>
            </div>
          </div>
        </Panel>
        <Panel title={t("Detection filters", "مرشّحات الرصد")}>
          <div className="space-y-3 p-4 text-sm">
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <label key={c} className={`cursor-pointer border px-2 py-1 font-mono text-[11px] ${filters.classes.includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                  <input type="checkbox" className="hidden" checked={filters.classes.includes(c)} onChange={(e) => setFilters({ classes: e.target.checked ? [...filters.classes, c] : filters.classes.filter((x) => x !== c) })} />{c}
                </label>
              ))}
            </div>
            <label className="block text-xs text-muted-foreground">{t("Min confidence", "أدنى نسبة ثقة")}: <span dir="ltr" className="font-mono text-primary">{filters.minConf}%</span>
              <input type="range" min={0} max={95} step={5} value={filters.minConf} onChange={(e) => setFilters({ minConf: +e.target.value })} className="mt-1 w-full accent-[var(--primary)]" dir="ltr" />
            </label>
            <div className="flex gap-2" dir="ltr">
              <label className="flex-1 text-xs text-muted-foreground">{t("From", "من")} (s)<input type="number" min={0} className={inputClass + " mt-1"} value={filters.from} onChange={(e) => setFilters({ from: +e.target.value })} /></label>
              <label className="flex-1 text-xs text-muted-foreground">{t("To", "إلى")} (s)<input type="number" min={0} className={inputClass + " mt-1"} value={filters.to === Infinity ? dur : filters.to} onChange={(e) => setFilters({ to: +e.target.value || Infinity })} /></label>
            </div>
            <Btn size="sm" variant="ghost" className="border border-border" onClick={() => setFilters({ ...DEFAULT_FILTER })}>{t("Reset filters", "إعادة ضبط المرشحات")}</Btn>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------- Photo compare ---------------- */
function CompareTool() {
  const { t } = useLang();
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const ca = cameras[a]!, cb = cameras[b]!;
  const r = compareStills(ca.boxes, cb.boxes);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={t("Side by side", "جنبًا إلى جنب")} className="p-0">
        <div className="grid grid-cols-2 gap-px bg-border">
          {[ca, cb].map((c, k) => (
            <div key={k} className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img src={c.img} alt={c.name.en} className="h-full w-full object-cover" loading="lazy" decoding="async" />
              {c.boxes.map((bx, i) => <DetectionBox key={i} label={bx.label} confidence={bx.conf} color={bx.color} x={bx.x} y={bx.y} w={bx.w} h={bx.h} />)}
              <span dir="ltr" className="absolute start-2 top-2 bg-background/75 px-1.5 font-mono text-[10px]">{c.id}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title={t("Similarity", "درجة التشابه")}>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <select className={inputClass} value={a} onChange={(e) => setA(+e.target.value)} aria-label={t("First photo", "الصورة الأولى")}>{cameras.map((c, i) => <option key={c.id} value={i}>{c.id}</option>)}</select>
            <select className={inputClass} value={b} onChange={(e) => setB(+e.target.value)} aria-label={t("Second photo", "الصورة الثانية")}>{cameras.map((c, i) => <option key={c.id} value={i}>{c.id}</option>)}</select>
          </div>
          <div dir="ltr" className="text-center"><span className="text-5xl font-bold text-primary">{r.score}%</span></div>
          <div className="h-1.5 bg-secondary"><div className="h-full bg-primary" style={{ width: `${r.score}%` }} /></div>
          <p className="text-xs text-muted-foreground">{t("Shared object classes", "فئات العناصر المشتركة")}: {r.shared.length ? r.shared.join(", ") : t("none", "لا شيء")}</p>
          <p className="border-t border-border pt-3 text-xs text-warning">{t("Potential match — requires human review.", "تطابق محتمل — يتطلب مراجعة بشرية.")}</p>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Annotation ---------------- */
function AnnotateTool() {
  const { t } = useLang();
  const { role, emit } = useVT();
  const { annotations, addAnnotation, setVerdict, removeAnnotation } = useMedia();
  const [camId, setCamId] = useState(cameras[0]!.id);
  const cam = cameras.find((c) => c.id === camId)!;
  const [label, setLabel] = useState("backpack");
  const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const list = annotations[camId] ?? [];
  const canReview = can(role, "reviewAlert");

  const pct = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={t("Draw boxes on the frame", "ارسم المربعات على اللقطة")} className="p-0">
        <div
          className="relative aspect-[4/3] cursor-crosshair overflow-hidden bg-muted"
          onPointerDown={(e) => { start.current = pct(e); }}
          onPointerMove={(e) => { if (start.current) { const p = pct(e); setDraft({ x: Math.min(p.x, start.current.x), y: Math.min(p.y, start.current.y), w: Math.abs(p.x - start.current.x), h: Math.abs(p.y - start.current.y) }); } }}
          onPointerUp={() => {
            if (start.current && draft && draft.w > 2 && draft.h > 2) {
              addAnnotation(camId, { ...draft, id: `A-${Date.now()}`, label, color: "cyan" });
              emit({ action: `ANNOTATION added on ${camId} (${label})`, msg: { en: `Manual annotation added: ${label}`, ar: `أُضيف وسم يدوي: ${label}` }, quiet: true });
            }
            start.current = null; setDraft(null);
          }}
        >
          <img src={cam.img} alt={cam.name.en} className="pointer-events-none h-full w-full object-cover" draggable={false} />
          {cam.boxes.map((b, i) => <DetectionBox key={i} label={b.label} confidence={b.conf} color={b.color} x={b.x} y={b.y} w={b.w} h={b.h} />)}
          {list.map((a) => <DetectionBox key={a.id} label={a.label} color="cyan" x={a.x} y={a.y} w={a.w} h={a.h} />)}
          {draft && <div className="pointer-events-none absolute border-2 border-dashed border-det-cyan" style={{ left: `${draft.x}%`, top: `${draft.y}%`, width: `${draft.w}%`, height: `${draft.h}%` }} />}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <span className="text-xs text-muted-foreground">{t("Label for next box", "تسمية المربع التالي")}:</span>
          <input className={inputClass + " max-w-40"} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("e.g. red jacket", "مثال: سترة حمراء")} />
        </div>
      </Panel>
      <Panel title={`${t("Annotations", "الوسوم")} · ${list.length}`}>
        <div className="space-y-3 p-4">
          <select className={inputClass} value={camId} onChange={(e) => setCamId(e.target.value)} aria-label={t("Camera", "الكاميرا")}>
            {cameras.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.name.en}</option>)}
          </select>
          {list.length === 0 && <p className="text-xs text-muted-foreground">{t("Drag on the image to draw a box.", "اسحب على الصورة لرسم مربع.")}</p>}
          <ul className="space-y-2">
            {list.map((a: Annotation) => (
              <li key={a.id} className="flex items-center justify-between gap-2 border border-border p-2 text-sm">
                <span className="font-mono text-xs">{a.label}{a.verdict && <span className={a.verdict === "correct" ? " text-success" : " text-det-red"}> · {a.verdict === "correct" ? t("correct", "صحيح") : t("incorrect", "خاطئ")}</span>}</span>
                <span className="flex gap-1">
                  <Btn size="sm" variant="ghost" className="h-6 border border-border px-1.5" disabled={!canReview} title={canReview ? t("Mark correct", "صحيح") : t("Your role can't review.", "دورك لا يسمح بالمراجعة.")} onClick={() => { setVerdict(camId, a.id, "correct"); emit({ action: `ANNOTATION ${a.id} marked correct`, msg: { en: "Annotation marked correct — feeds precision", ar: "سُجّل الوسم صحيحًا — يغذي مقياس الدقة" }, quiet: true }); }}><Check className="h-3 w-3" /></Btn>
                  <Btn size="sm" variant="ghost" className="h-6 border border-border px-1.5" disabled={!canReview} onClick={() => { setVerdict(camId, a.id, "incorrect"); emit({ action: `ANNOTATION ${a.id} marked incorrect`, msg: { en: "Annotation marked incorrect — feeds precision", ar: "سُجّل الوسم خاطئًا — يغذي مقياس الدقة" }, quiet: true }); }}><X className="h-3 w-3" /></Btn>
                  <Btn size="sm" variant="ghost" className="h-6 border border-border px-1.5" onClick={() => removeAnnotation(camId, a.id)} aria-label={t("Delete", "حذف")}><Trash2 className="h-3 w-3" /></Btn>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Enhancement ---------------- */
function EnhanceTool() {
  const { t } = useLang();
  const [camId, setCamId] = useState(cameras[1]!.id);
  const cam = cameras.find((c) => c.id === camId)!;
  const [br, setBr] = useState(100);
  const [ct, setCt] = useState(100);
  const [sharpen, setSharpen] = useState(false);
  const [denoise, setDenoise] = useState(false);
  const [up, setUp] = useState(false);
  const [after, setAfter] = useState(true);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c || !after) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = cam.img;
    img.onload = () => {
      const k = up ? 2 : 1;
      c.width = img.naturalWidth * k;
      c.height = img.naturalHeight * k;
      const ctx = c.getContext("2d")!;
      ctx.filter = enhanceFilter({ brightness: br, contrast: ct, sharpen, denoise });
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, c.width, c.height);
    };
  }, [cam.img, br, ct, sharpen, denoise, up, after]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={after ? t("Enhanced", "بعد التحسين") : t("Original", "الأصلية")} className="p-0"
        right={<Btn size="sm" variant="outline" onClick={() => setAfter(!after)}>{after ? t("Show original", "عرض الأصلية") : t("Show enhanced", "عرض المحسّنة")}</Btn>}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {after
            ? <canvas ref={cv} className="h-full w-full object-contain" />
            : <img src={cam.img} alt={cam.name.en} className="h-full w-full object-cover" />}
          {up && after && <span dir="ltr" className="absolute end-2 top-2 bg-det-cyan px-1.5 font-mono text-[10px] font-bold text-ink">2×</span>}
        </div>
      </Panel>
      <Panel title={t("Enhancement controls", "أدوات التحسين")}>
        <div className="space-y-4 p-4 text-sm">
          <select className={inputClass} value={camId} onChange={(e) => setCamId(e.target.value)} aria-label={t("Camera", "الكاميرا")}>
            {cameras.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.name.en}</option>)}
          </select>
          <label className="block text-xs text-muted-foreground">{t("Brightness", "السطوع")}: <span dir="ltr" className="font-mono text-primary">{br}%</span>
            <input type="range" min={40} max={200} value={br} onChange={(e) => setBr(+e.target.value)} className="mt-1 w-full accent-[var(--primary)]" dir="ltr" /></label>
          <label className="block text-xs text-muted-foreground">{t("Contrast", "التباين")}: <span dir="ltr" className="font-mono text-primary">{ct}%</span>
            <input type="range" min={40} max={200} value={ct} onChange={(e) => setCt(+e.target.value)} className="mt-1 w-full accent-[var(--primary)]" dir="ltr" /></label>
          {[[t("Sharpen", "زيادة الحدة"), sharpen, setSharpen], [t("Denoise", "تقليل التشويش"), denoise, setDenoise], [t("Upscale 2×", "تكبير 2×"), up, setUp]] .map(([l, v, set]) => (
            <label key={l as string} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v as boolean} onChange={(e) => (set as (b: boolean) => void)(e.target.checked)} className="accent-[var(--primary)]" />{l as string}
            </label>
          ))}
          <div className="flex gap-2">
            <Btn size="sm" variant="ghost" className="border border-border" onClick={() => { setBr(100); setCt(100); setSharpen(false); setDenoise(false); setUp(false); }}>{t("Reset", "إعادة ضبط")}</Btn>
            <Btn size="sm" variant="outline" onClick={() => { const c = cv.current; if (!c) return; const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `${camId}-enhanced.png`; a.click(); }}><Download className="h-3.5 w-3.5" />PNG</Btn>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Privacy blur ---------------- */
function PrivacyTool() {
  const { t } = useLang();
  const { role, emit } = useVT();
  const { privacyOn, privacyExempt, setPrivacy, setPrivacyExempt } = useMedia();
  const [camId, setCamId] = useState(cameras[0]!.id);
  const cam = cameras.find((c) => c.id === camId)!;
  const canReview = can(role, "reviewAlert");
  const people = cam.boxes.filter((b) => b.label === "person");

  const toggle = (on: boolean) => {
    setPrivacy(on);
    emit({ action: `PRIVACY blur ${on ? "ON" : "OFF"}`, msg: { en: `Privacy blur ${on ? "enabled — bystanders hidden" : "disabled"}`, ar: on ? "فُعّل حجب الهوية — أُخفي المارّة" : "أُوقف حجب الهوية" }, kind: on ? "warning" : "info" });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Panel title={t("Bystander protection", "حماية المارّة")} className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={cam.img} alt={cam.name.en} className="h-full w-full object-cover" />
          {people.map((b) => {
            const k = boxKey(b);
            const exempt = privacyExempt === k;
            return (
              <button
                key={k}
                onClick={() => setPrivacyExempt(exempt ? null : k)}
                aria-label={exempt ? t("Selected candidate", "المرشّح المحدد") : t("Blurred bystander — click to select", "مارّ محجوب — انقر للتحديد")}
                className="absolute border-2"
                style={{
                  left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`,
                  borderColor: exempt ? "var(--det-yellow)" : "var(--det-magenta)",
                  backdropFilter: privacyOn && !exempt ? "blur(14px)" : undefined,
                  background: privacyOn && !exempt ? "color-mix(in oklab, var(--background) 35%, transparent)" : "transparent",
                }}
              >
                <span dir="ltr" className={`absolute -top-[18px] start-[-2px] whitespace-nowrap px-1 font-mono text-[10px] font-semibold leading-[18px] text-ink ${exempt ? "bg-det-yellow" : "bg-det-magenta"}`}>
                  {exempt ? t("CANDIDATE", "المرشّح") : privacyOn ? t("BLURRED", "محجوب") : b.label}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title={t("Privacy mode", "وضع الخصوصية")}>
        <div className="space-y-3 p-4 text-sm">
          <label className={`flex items-center gap-2 ${canReview ? "" : "opacity-50"}`}>
            <input type="checkbox" checked={privacyOn} disabled={!canReview} onChange={(e) => toggle(e.target.checked)} className="accent-[var(--primary)]" />
            {t("Blur everyone except the selected candidate", "احجب الجميع عدا المرشّح المحدد")}
          </label>
          {!canReview && <p className="text-xs text-warning">{t("Your role can't change privacy mode.", "دورك لا يسمح بتغيير وضع الخصوصية.")}</p>}
          <select className={inputClass} value={camId} onChange={(e) => { setCamId(e.target.value); setPrivacyExempt(null); }} aria-label={t("Camera", "الكاميرا")}>
            {cameras.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.name.en}</option>)}
          </select>
          <p className="text-xs text-muted-foreground">{t("Click a person box to mark them as the candidate. Every toggle is written to the audit log.", "انقر على مربع شخص لتحديده كمرشّح. يُسجَّل كل تبديل في سجل التدقيق.")}</p>
        </div>
      </Panel>
    </div>
  );
}
