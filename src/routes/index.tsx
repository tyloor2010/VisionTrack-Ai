import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileInput, BrainCircuit, MapPinned, BellRing, UserCheck, ScanFace, Radar, Users, Hourglass, Map, Cctv, BarChart3,
  ShieldCheck, Scale, Lock, Eye, FlaskConical, Gavel, Mail,
} from "lucide-react";
import { DetectionBox } from "@/components/vt/DetectionBox";
import { HudText } from "@/components/vt/HudText";
import { SearchMap } from "@/components/vt/SearchMap";
import { LiveDemo } from "@/components/vt/LiveDemo";
import { Counter, Panel, Reveal, SectionHead, btnClass, inputClass, Btn } from "@/components/vt/ui";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionTrack AI — Every Minute Counts" },
      { name: "description", content: "AI + computer vision platform helping authorities find missing persons during the critical Golden Hours." },
      { property: "og:title", content: "VisionTrack AI — Every Minute Counts" },
      { property: "og:description", content: "Real-time potential-match alerts with confidence scores, geo search-radius prediction and human review." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <DemoSection />
      <Gallery />
      <Features />
      <Responsible />
      <Impact />
      <Roadmap />
      <Team />
    </>
  );
}

function useTicker() {
  const [n, setN] = useState({ cams: 128, frames: 48210, acc: 94.2 });
  useEffect(() => {
    const id = setInterval(() => setN((p) => ({ cams: 126 + Math.floor(Math.random() * 4), frames: p.frames + Math.floor(Math.random() * 90 + 20), acc: +(93.8 + Math.random() * 0.8).toFixed(1) })), 1000);
    return () => clearInterval(id);
  }, []);
  return n;
}

function Hero() {
  const { t } = useLang();
  const n = useTicker();
  const boxes = [
    { label: "person", conf: 91, x: 10, y: 34, w: 5, h: 18 },
    { label: "person", conf: 76, x: 24, y: 52, w: 5, h: 18 },
    { label: "person", conf: 62, x: 43, y: 27, w: 5, h: 17 },
    { label: "person", conf: 42, x: 66, y: 40, w: 5, h: 17 },
    { label: "person", conf: 88, x: 78, y: 54, w: 5, h: 18 },
    { label: "person", conf: 33, x: 36, y: 70, w: 5, h: 17 },
  ];
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden scanlines">
      <video src={media.heroVideo} poster={media.crosswalk} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/40" />
      <div className="absolute inset-0 hidden sm:block">
        {boxes.map((b, i) => <DetectionBox key={i} {...b} confidence={b.conf} color="yellow" jitter delay={2 + i * 0.2} />)}
        <DetectionBox label="POTENTIAL MATCH" confidence={87} color="red" x={53} y={48} w={5.5} h={19} delay={3.4} alert />
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.line x1="58.5%" y1="48%" x2="80%" y2="54%" stroke="var(--det-red)" strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3.8, duration: 1 }} />
          <motion.line x1="53%" y1="58%" x2="29%" y2="60%" stroke="var(--det-yellow)" strokeOpacity="0.5" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3.9, duration: 1 }} />
        </svg>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.8 }} className="max-w-3xl">
          <div dir="ltr" className="mb-5 inline-block bg-det-magenta px-1.5 font-mono text-xs font-semibold leading-5 text-ink">
            ⚠ {t("Golden Hours protocol", "بروتوكول الساعات الذهبية")}
          </div>
          <h1 className="text-6xl font-extrabold leading-[0.92] tracking-tighter sm:text-8xl lg:text-9xl">
            {t("Every Minute", "كل دقيقة")}<br /><span className="hand-underline">{t("Counts.", "فارقة.")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium text-foreground/80 sm:text-xl">
            {t("AI-powered computer vision to find missing persons during the Golden Hours.", "رؤية حاسوبية مدعومة بالذكاء الاصطناعي للعثور على المفقودين خلال الساعات الذهبية.")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/demo" className={btnClass("primary", "lg")}>{t("Launch Live Demo", "تشغيل العرض المباشر")}</Link>
            <Link to="/report" className={btnClass("outline", "lg")}>{t("Report a Missing Person", "الإبلاغ عن مفقود")}</Link>
          </div>
        </motion.div>
        <HudText className="mt-12" lines={["SYSTEM STATUS: ONLINE", `ACCURACY: ${n.acc}%`, `CAMERAS: ${n.cams} ACTIVE`, `FRAMES: ${n.frames.toLocaleString("en")}`, "MODEL: VISIONTRACK v1"]} />
      </div>
    </section>
  );
}

function Problem() {
  const { t } = useLang();
  const steps = [0, 1, 6, 24, 72];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % steps.length), 1600); return () => clearInterval(id); }, []);
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead tag={t("The problem", "المشكلة")} title={t("The search radius grows with every minute.", "نطاق البحث يتسع مع كل دقيقة.")} sub={t("The first hours decide most outcomes. Manual review of hundreds of cameras simply can't keep up.", "الساعات الأولى تحسم أغلب النتائج. والمراجعة اليدوية لمئات الكاميرات لا تستطيع المواكبة.")} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          {[
            { v: 128, s: "", l: t("cameras per district to review", "كاميرا لكل حي تحتاج مراجعة") },
            { v: 3, s: "×", l: t("radius growth from 1h to 6h (walking)", "تضاعف النطاق من ساعة إلى 6 ساعات (سيرًا)") },
            { v: 72, s: "h", l: t("window where leads go cold", "نافذة تبرد بعدها الخيوط") },
            { v: 24, s: "/7", l: t("continuous automated scanning", "مسح آلي مستمر") },
          ].map((s, k) => (
            <Reveal key={k} delay={k * 0.08}>
              <Panel className="h-full p-6">
                <div className="text-4xl font-bold text-primary"><Counter to={s.v} suffix={s.s} /></div>
                <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
              </Panel>
            </Reveal>
          ))}
          <p className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">* {t("Illustrative figures", "أرقام توضيحية")}</p>
        </div>
        <Panel title={t("Search radius over time", "نطاق البحث عبر الوقت")}>
          <SearchMap radius={4 + steps[i]! * 0.75} compact />
          <div className="flex items-center gap-2 p-4" dir="ltr">
            {steps.map((s, k) => (
              <button key={s} onClick={() => setI(k)} className="flex-1 text-center" aria-label={`${s} hours`}>
                <div className={`h-1.5 ${k <= i ? "bg-warning" : "bg-secondary"} transition-colors`} />
                <span className={`mt-1 block font-mono text-xs ${k === i ? "text-warning" : "text-muted-foreground"}`}>{s}h</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { i: FileInput, c: "text-det-yellow", h: t("Report intake", "استلام البلاغ"), p: t("Photos, last-seen location & time, clothing, age, and conditions like Alzheimer's or autism that change movement.", "صور، آخر مكان ووقت، الملابس، العمر، وحالات مثل ألزهايمر أو التوحد التي تغيّر نمط الحركة.") },
    { i: BrainCircuit, c: "text-det-magenta", h: t("AI matching engine", "محرك المطابقة"), p: t("Face embeddings plus clothing, appearance and body-shape matching — faces are often unclear on CCTV.", "بصمات الوجه مع مطابقة الملابس والمظهر وشكل الجسم — فالوجوه غالبًا غير واضحة في الكاميرات.") },
    { i: MapPinned, c: "text-det-cyan", h: t("Geo-analysis", "التحليل الجغرافي"), p: t("Search radius from elapsed time, expected speed by profile and area type.", "حساب نطاق البحث من الوقت المنقضي والسرعة المتوقعة حسب الفئة ونوع المنطقة.") },
    { i: BellRing, c: "text-det-red", h: t("Smart alerts", "تنبيهات ذكية"), p: t("Confidence score, snapshot, location and timestamp — instantly.", "درجة الثقة، لقطة، الموقع والتوقيت — فورًا.") },
    { i: UserCheck, c: "text-det-green", h: t("Human verification", "تحقق بشري"), p: t("An authorized officer confirms before any action is taken.", "ضابط مخوّل يؤكد قبل اتخاذ أي إجراء.") },
  ];
  return (
    <section className="border-y border-border bg-card/30 py-24 hud-grid">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead tag={t("How it works", "كيف يعمل")} title={t("From report to response.", "من البلاغ إلى الاستجابة.")} />
        <div className="relative grid gap-4 md:grid-cols-5">
          <motion.div className="absolute top-8 hidden h-px bg-gradient-to-r from-det-yellow via-det-cyan to-det-green md:block" style={{ insetInlineStart: "10%", insetInlineEnd: "10%" }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
          {steps.map((s, k) => (
            <Reveal key={k} delay={k * 0.15}>
              <div className="relative">
                <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center border border-border bg-background">
                  <s.i className={`h-7 w-7 ${s.c}`} />
                  <span dir="ltr" className="absolute -top-2 -end-2 rounded-full bg-coral px-1.5 font-mono text-[10px] font-bold text-primary-foreground">0{k + 1}</span>
                </div>
                <h3 className="font-bold">{s.h}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-24 sm:px-6">
      <SectionHead tag={t("Live demo", "عرض مباشر")} title={t("Try it now.", "جرّبه الآن.")} sub={t("Select a profile, start the search, and review the alert like an operator would.", "اختر حالة، ابدأ البحث، وراجع التنبيه كما يفعل المشغّل.")} />
      <LiveDemo />
    </section>
  );
}

function Gallery() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead tag={t("Through the model's eyes", "بعيون النموذج")} title={t("Every person is a story.", "كل شخص قصة.")} sub={t("VisionTrack sees the street the way a detector does — then a human decides.", "VisionTrack يرى الشارع كما يراه نموذج الكشف — ثم يقرر الإنسان.")} />
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="md:row-span-2">
          <Panel className="h-full overflow-hidden">
            <video src={media.video} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label="Aerial street footage" />
          </Panel>
        </Reveal>
        <Reveal delay={0.1}><Panel className="overflow-hidden"><img src={media.streetCv} alt="Street scene with object detection labels" loading="lazy" className="aspect-square w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.2}><Panel className="overflow-hidden"><img src={media.crowdCv} alt="Crowd crossing with person confidence labels" loading="lazy" className="aspect-square w-full object-cover object-top" /></Panel></Reveal>
        <Reveal delay={0.3} className="md:col-span-2"><Panel className="overflow-hidden"><img src={media.nightCv} alt="Night sidewalk with detection boxes" loading="lazy" className="aspect-[2/1] w-full object-cover object-[50%_70%]" /></Panel></Reveal>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLang();
  const f = [
    { i: ScanFace, h: t("Face + appearance matching", "مطابقة الوجه والمظهر") },
    { i: Radar, h: t("Geo search-radius prediction", "توقع نطاق البحث جغرافيًا") },
    { i: BellRing, h: t("Real-time alerts", "تنبيهات لحظية") },
    { i: Users, h: t("Citizen sightings", "بلاغات المواطنين") },
    { i: Hourglass, h: t("Age progression (long-term cases)", "محاكاة التقدم في العمر") },
    { i: Map, h: t("Live heat-map dashboard", "خريطة حرارية مباشرة") },
    { i: Cctv, h: t("Multi-camera fusion", "دمج الكاميرات المتعددة") },
    { i: BarChart3, h: t("Impact metrics", "مؤشرات الأثر") },
  ];
  return (
    <section className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead tag={t("Capabilities", "القدرات")} title={t("Built for the field.", "مصمم للميدان.")} />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {f.map((x, k) => (
            <Reveal key={k} delay={k * 0.05} className="group relative bg-background p-6 transition-colors hover:bg-card">
              <x.i className="h-8 w-8 text-primary" />
              <h3 className="mt-6 font-semibold">{x.h}</h3>
              <span className="absolute inset-0 border border-transparent transition-colors group-hover:border-primary/60" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Responsible() {
  const { t } = useLang();
  const r = [
    { i: Eye, h: t("Human-in-the-loop", "الإنسان في الحلقة"), p: t("Every alert is a potential match, never a confirmation.", "كل تنبيه تطابق محتمل، وليس تأكيدًا أبدًا.") },
    { i: Scale, h: t("False-positive handling", "معالجة الإنذارات الخاطئة"), p: t("Tunable confidence thresholds and logged rejections.", "حدود ثقة قابلة للضبط وتسجيل حالات الرفض.") },
    { i: FlaskConical, h: t("Bias testing", "اختبار التحيز"), p: t("Continuous evaluation across age and ethnicity.", "تقييم مستمر عبر الأعمار والأعراق.") },
    { i: Gavel, h: t("Legal compliance", "الامتثال القانوني"), p: t("Official partnerships, camera permissions, full audit logs.", "شراكات رسمية، تصاريح الكاميرات، سجلات تدقيق كاملة.") },
    { i: Lock, h: t("Data protection", "حماية البيانات"), p: t("Encryption, role-based access, auto-deletion after case closure.", "تشفير، صلاحيات حسب الدور، حذف تلقائي بعد إغلاق القضية.") },
    { i: ShieldCheck, h: t("Accountability", "المساءلة"), p: t("Every decision is attributed and reviewable.", "كل قرار منسوب لصاحبه وقابل للمراجعة.") },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead tag={t("Responsible AI", "ذكاء اصطناعي مسؤول")} title={t("Privacy and security by design.", "الخصوصية والأمان من الأساس.")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {r.map((x, k) => (
          <Reveal key={k} delay={k * 0.06}>
            <Panel className="h-full p-6">
              <x.i className="h-7 w-7 text-success" />
              <h3 className="mt-4 font-semibold">{x.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.p}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Impact() {
  const { t } = useLang();
  const m = [
    { v: 12, s: " min", l: t("Time to first match", "الوقت حتى أول تطابق") },
    { v: 89, s: "%", l: t("Alert precision", "دقة التنبيهات") },
    { v: 60, s: "%", l: t("Reduction in search time", "تقليل وقت البحث") },
  ];
  return (
    <section className="relative overflow-hidden border-y border-border bg-card/30 py-24 hud-grid">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead tag={t("Impact", "الأثر")} title={t("Target pilot metrics.", "مؤشرات التجربة المستهدفة.")} />
        <div className="grid gap-8 md:grid-cols-3">
          {m.map((x, k) => (
            <Reveal key={k} delay={k * 0.1}>
              <div className="text-6xl font-bold text-primary text-glow sm:text-7xl"><Counter to={x.v} suffix={x.s} /></div>
              <p className="mt-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">{x.l}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">* {t("Target / pilot metrics — not measured results", "مؤشرات مستهدفة — وليست نتائج مقاسة")}</p>
      </div>
    </section>
  );
}

function Roadmap() {
  const { t } = useLang();
  const p = [
    { h: t("Phase 1 — MVP", "المرحلة 1 — النموذج الأولي"), d: t("Photo + location + time → search zone + ranked matches from a sample dataset.", "صورة + موقع + وقت ← نطاق بحث + تطابقات مرتبة من بيانات تجريبية."), s: t("In progress", "قيد التنفيذ") },
    { h: t("Phase 2 — Pilot", "المرحلة 2 — التجربة"), d: t("Pilot with real camera partners.", "تجربة مع شركاء كاميرات حقيقيين."), s: t("Next", "التالي") },
    { h: t("Phase 3 — National scale", "المرحلة 3 — التوسع الوطني"), d: t("Integration with national authorities and multi-city scaling.", "التكامل مع الجهات الوطنية والتوسع لعدة مدن."), s: t("Planned", "مخطط") },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead tag={t("Roadmap", "خارطة الطريق")} title={t("Where we're going.", "إلى أين نتجه.")} />
      <div className="grid gap-4 md:grid-cols-3">
        {p.map((x, k) => (
          <Reveal key={k} delay={k * 0.1}>
            <Panel className={`h-full p-6 ${k === 0 ? "border-primary/60" : ""}`}>
              <span className={`font-mono text-[10px] uppercase tracking-widest ${k === 0 ? "text-primary" : "text-muted-foreground"}`}>{x.s}</span>
              <h3 className="mt-2 text-xl font-bold">{x.h}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Team() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const team = [
    { r: t("Team Lead & ML", "قائد الفريق وتعلم الآلة") },
    { r: t("Computer Vision", "الرؤية الحاسوبية") },
    { r: t("Full-stack Engineer", "مهندس برمجيات") },
    { r: t("Product & Design", "المنتج والتصميم") },
  ];
  return (
    <section className="border-t border-border bg-card/30 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
        <div>
          <SectionHead tag={t("Team", "الفريق")} title={t("The people behind it.", "الفريق وراء المشروع.")} />
          <div className="grid grid-cols-2 gap-4">
            {team.map((m, k) => (
              <Panel key={k} className="p-5">
                <div className="relative mb-4 flex aspect-square items-center justify-center bg-secondary">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <DetectionBox label="member" confidence={99} color="cyan" x={15} y={15} w={70} h={70} />
                </div>
                <p className="font-semibold">{t("Team member", "عضو الفريق")} {k + 1}</p>
                <p className="text-xs text-muted-foreground">{m.r}</p>
              </Panel>
            ))}
          </div>
        </div>
        <div>
          <SectionHead tag={t("Contact", "تواصل")} title={t("Partner with us.", "كن شريكًا لنا.")} />
          <Panel className="p-6">
            {sent ? (
              <p className="font-mono text-success">✓ {t("Message received. We'll be in touch.", "تم استلام رسالتك. سنتواصل معك.")}</p>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <input required aria-label="Name" placeholder={t("Name / organization", "الاسم / الجهة")} className={inputClass} />
                <input required type="email" aria-label="Email" placeholder={t("Email", "البريد الإلكتروني")} className={inputClass} />
                <textarea required aria-label="Message" rows={4} placeholder={t("Message", "الرسالة")} className={inputClass} />
                <Btn type="submit"><Mail className="h-4 w-4" />{t("Send", "إرسال")}</Btn>
              </form>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}
