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
import { MediaCycle, type CycleLayer } from "@/components/vt/MediaCycle";

import { SectionBg } from "@/components/vt/SectionBg";
import { LiveDemo } from "@/components/vt/LiveDemo";
import { Counter, Panel, Reveal, SectionHead, btnClass, inputClass, Btn } from "@/components/vt/ui";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionTrack AI — Every Minute Counts" },
      { name: "description", content: "VisionTrack AI searches live camera feeds for a missing person: face and clothing matching, a predicted search radius that grows with time, and potential-match alerts a human reviewer confirms." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrack2027.lovable.app/" },
      { property: "og:title", content: "VisionTrack AI — Every Minute Counts" },
      { property: "og:description", content: "Real-time potential-match alerts with confidence scores, geo search-radius prediction and human review." },
      { property: "og:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrack2027.lovable.app/og-logo.png" },

    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/" }],

  }),
  component: Index,
});

/** Every photo and clip the site owns, flipped through behind the headline. */
const HERO_LAYERS: CycleLayer[] = [
  { kind: "video", src: media.heroVideo, poster: media.crosswalk },
  { kind: "video", src: media.walkGif, poster: media.streetCv },
  { kind: "img", src: media.streetCv },
  { kind: "video", src: media.nycGif, poster: media.nightCv },
  { kind: "img", src: media.crowdCv },
  { kind: "img", src: media.nightCv },
  { kind: "img", src: media.crosswalkCv },
  { kind: "video", src: media.trafficGif, poster: media.trafficHud },
  { kind: "video", src: media.streetCam, poster: media.streetCv },
];

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
      <Credits />
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
    { label: "person", conf: 91, x: 66, y: 14, w: 5, h: 18 },
    { label: "person", conf: 76, x: 77, y: 28, w: 5, h: 18 },
    { label: "person", conf: 62, x: 88, y: 18, w: 5, h: 17 },
    { label: "person", conf: 42, x: 70, y: 76, w: 5, h: 17 },
    { label: "person", conf: 88, x: 82, y: 62, w: 5, h: 18 },
    { label: "person", conf: 33, x: 92, y: 44, w: 5, h: 17 },
  ];

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden scanlines">
      <MediaCycle layers={HERO_LAYERS} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/60" />

      <div className="absolute inset-0 hidden sm:block">
        {boxes.map((b, i) => <DetectionBox key={i} {...b} confidence={b.conf} color="yellow" jitter delay={1 + i * 0.2} />)}
        <DetectionBox label="POTENTIAL MATCH" confidence={87} color="red" x={74} y={46} w={5.5} h={19} delay={2.2} alert />
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.line x1="79.5%" y1="48%" x2="94%" y2="52%" stroke="var(--det-red)" strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.6, duration: 1 }} />
          <motion.line x1="74%" y1="65%" x2="87%" y2="70%" stroke="var(--det-yellow)" strokeOpacity="0.5" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.7, duration: 1 }} />

        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="max-w-3xl">
          <div dir="ltr" className="mb-5 inline-block bg-det-magenta px-1.5 font-mono text-xs font-semibold leading-5 text-ink">
            ⚠ {t("Golden Hours protocol", "بروتوكول الساعات الذهبية")}
          </div>
          <h1 className="text-6xl font-extrabold leading-[0.92] tracking-tighter sm:text-8xl lg:text-9xl">
            {t("Every Minute", "كل دقيقة")}<br /><span className="hand-underline">{t("Counts.", "تصنع الفارق.")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium text-foreground/80 sm:text-xl">
            {t("AI-powered computer vision to find missing persons during the Golden Hours.", "نظام رؤية حاسوبية يساعد في العثور على المفقودين خلال الساعات الأولى الحاسمة.")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/demo" className={btnClass("primary", "lg")}>{t("Launch Live Demo", "جرّب العرض الحي")}</Link>
            <Link to="/report" className={btnClass("outline", "lg")}>{t("Report a Missing Person", "أبلِغ عن شخص مفقود")}</Link>
          </div>
        </motion.div>
        <HudText className="mt-12" lines={["SYSTEM STATUS: ONLINE", `ACCURACY: ${n.acc}%`, `CAMERAS: ${n.cams} ACTIVE`, `FRAMES: ${n.frames.toLocaleString("en")}`, "MODEL: VISIONTRACK v2"]} />
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
    <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <SectionBg video={media.walkGif} poster={media.streetCv} />

      <SectionHead tag={t("The problem", "المشكلة")} title={t("The search radius grows with every minute.", "كل دقيقة تمر تُوسّع دائرة البحث.")} sub={t("The first hours decide most outcomes. Manual review of hundreds of cameras simply can't keep up.", "الساعات الأولى هي التي تحسم معظم الحالات، ومراجعة تسجيلات مئات الكاميرات يدويًا لا تواكب هذا السباق.")} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          {[
            { v: 128, s: "", l: t("cameras per district to review", "كاميرا في الحي الواحد تنتظر المراجعة") },
            { v: 3, s: "×", l: t("radius growth from 1h to 6h (walking)", "اتساع النطاق بين الساعة الأولى والسادسة (سيرًا على الأقدام)") },
            { v: 72, s: "h", l: t("window where leads go cold", "ساعة تضعف بعدها فرص تتبّع الأثر") },
            { v: 24, s: "/7", l: t("continuous automated scanning", "مراقبة آلية دون توقف") },
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
        <Panel title={t("Search radius over time", "تطوّر نطاق البحث مع الوقت")}>
          <SearchMap origin={{ lat: 30.0444, lng: 31.2357 }} radiusKm={Math.min(2.5, 0.3 + 0.26 * Math.sqrt(steps[i]!))} fitKm={2.5} compact />
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
    { tag: "intake", c: "bg-det-yellow", h: t("A family files a report", "الأسرة تتقدّم ببلاغ"), p: t("Photos, where and when the person was last seen, what they wore, their age — and any condition like Alzheimer's or autism, because it changes how someone moves.", "صور حديثة، وآخر مكان وزمان شوهد فيهما، والملابس، والعمر، وأي حالة صحية كالزهايمر أو التوحّد؛ فهي تؤثر في طريقة تحرّك الشخص.") },
    { tag: "match", c: "bg-det-magenta", h: t("It compares more than faces", "المطابقة لا تقتصر على الوجه"), p: t("CCTV faces are usually blurry, so it also matches clothing, build and how the person walks.", "نادرًا ما تظهر الوجوه بوضوح في كاميرات المراقبة، لذا يطابق النظام أيضًا الملابس وهيئة الجسم وطريقة المشي.") },
    { tag: "radius", c: "bg-det-cyan", h: t("It works out where to look", "يحدّد أين نبحث"), p: t("A seven-year-old walks slower than an adult. Time passed × expected speed = the area worth searching.", "طفل في السابعة يمشي أبطأ من شخص بالغ. الوقت المنقضي × السرعة المتوقعة = المنطقة الأجدر بالبحث.") },
    { tag: "alert", c: "bg-det-red", h: t("Operators get a snapshot", "يصل المشغّلَ تنبيهٌ مصوَّر"), p: t("Camera, time, place and a confidence score. Nothing happens automatically.", "الكاميرا والتوقيت والمكان ونسبة الثقة. لا يُتّخذ أي إجراء تلقائيًا.") },
    { tag: "human", c: "bg-det-green", h: t("A person decides", "القرار للإنسان"), p: t("An authorized officer confirms or rejects before anyone is sent.", "يؤكد ضابط مخوَّل التطابق أو يرفضه قبل تحريك أي فريق.") },
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border py-24">
      <SectionBg video={media.nycGif} poster={media.nightCv} position="object-top" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead tag={t("How it works", "آلية العمل")} title={t("From a phone call to a camera frame.", "من البلاغ إلى لقطة الكاميرا.")} />
        <ol>
          {steps.map((s, k) => (
            <Reveal key={k}>
              <li className="grid gap-4 border-t border-border py-8 md:grid-cols-[120px_1fr_1.2fr] md:items-baseline">
                <span dir="ltr" className="font-pixel text-5xl text-muted-foreground">{String(k + 1).padStart(2, "0")}</span>
                <div>
                  <span dir="ltr" className={`mb-2 inline-block px-1.5 font-mono text-[11px] font-semibold leading-5 text-ink ${s.c}`}>{s.tag}</span>
                  <h3 className="text-2xl font-bold tracking-tight">{s.h}</h3>
                </div>
                <p className="text-muted-foreground">{s.p}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}


function DemoSection() {
  const { t } = useLang();
  return (
    <section className="relative isolate overflow-hidden mx-auto max-w-[1500px] px-4 py-24 sm:px-6">
      <SectionBg video={media.walkGif} poster={media.streetCv} />
      <div className="relative">
        <SectionHead tag={t("Live demo", "عرض حي")} title={t("Run a search yourself.", "جرّب البحث بنفسك.")} sub={t("Select a profile, start the search, and review the alert like an operator would.", "اختر حالة، وابدأ البحث، ثم راجع التنبيه كما يفعل المشغّل تمامًا.")} />
        <LiveDemo />
      </div>
    </section>
  );
}

function Gallery() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead tag={t("Through the model's eyes", "بعين النظام")} title={t("Every person is a story.", "وراء كل شخص حكاية.")} sub={t("VisionTrack sees the street the way a detector does — then a human decides.", "يقرأ VisionTrack الشارع كما يقرؤه نموذج الرصد، ثم يبقى القرار للإنسان.")} />
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="md:row-span-2">
          <Panel className="h-full overflow-hidden">
            <video src={media.video} poster={media.crosswalk} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-label="Aerial street footage" />
          </Panel>
        </Reveal>
        <Reveal delay={0.1}><Panel className="overflow-hidden"><img src={media.streetCv} alt="Street scene with object detection labels" loading="lazy" className="aspect-square w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.2}><Panel className="overflow-hidden"><img src={media.crowdCv} alt="Crowd crossing with person confidence labels" loading="lazy" className="aspect-square w-full object-cover object-top" /></Panel></Reveal>
        <Reveal delay={0.3} className="md:col-span-2"><Panel className="overflow-hidden"><img src={media.nightCv} alt="Night sidewalk with detection boxes" loading="lazy" className="aspect-[2/1] w-full object-cover object-[50%_70%]" /></Panel></Reveal>
        <Reveal delay={0.35}><Panel className="overflow-hidden"><img src={media.crosswalkCv} alt="Crosswalk with person, bicycle and car detection labels" loading="lazy" className="aspect-square w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.4} className="md:col-span-2"><Panel className="overflow-hidden"><video src={media.trafficGif} poster={media.trafficHud} autoPlay muted loop playsInline preload="metadata" aria-label="Animated traffic camera view with car, rider and person detection boxes" className="aspect-[2/1] w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.45}><Panel className="overflow-hidden"><img src={media.aerialV2x} alt="Aerial intersection with vehicle path lines and signal waves" loading="lazy" className="aspect-square w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.5}><Panel className="overflow-hidden"><img src={media.zebraIds} alt="Pedestrians on a zebra crossing with numbered tracking boxes" loading="lazy" className="aspect-square w-full object-cover object-top" /></Panel></Reveal>
        <Reveal delay={0.55}><Panel className="overflow-hidden"><img src={media.avPerception} alt="Driving scene with 3D boxes around vehicles and sensor path lines" loading="lazy" className="aspect-square w-full object-cover object-center" /></Panel></Reveal>
        <Reveal delay={0.6} className="md:col-span-2"><Panel className="overflow-hidden"><img src={media.trafficHud} alt="City intersection read by a traffic control system, with vehicle and pedestrian boxes" loading="lazy" className="aspect-[2/1] w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.65}><Panel className="overflow-hidden"><img src={media.crosswalkTop} alt="Overhead crosswalk with person and bicycle detection boxes" loading="lazy" className="aspect-square w-full object-cover object-center" /></Panel></Reveal>
        <Reveal delay={0.7} className="md:col-span-3"><Panel className="overflow-hidden"><img src={media.camWall} alt="Six night camera feeds with person, car and bus labels beside a geo-analysis map" loading="lazy" className="aspect-[5/2] w-full object-cover" /></Panel></Reveal>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLang();
  const f = [
    [t("Face + appearance matching", "مطابقة الوجه والمظهر العام"), "bg-det-yellow"],
    [t("Search-radius prediction", "التنبؤ بنطاق البحث"), "bg-det-cyan"],
    [t("Real-time alerts", "تنبيهات فورية"), "bg-det-red"],
    [t("Citizen sightings", "مشاهدات المواطنين"), "bg-det-magenta"],
    [t("Age progression for older cases", "محاكاة تقدّم العمر في الحالات القديمة"), "bg-det-green"],
    [t("Live heat map", "خريطة حرارية حيّة"), "bg-det-yellow"],
    [t("Several cameras, one track", "كاميرات متعددة، مسار واحد"), "bg-det-cyan"],
    [t("Measured outcomes", "نتائج قابلة للقياس"), "bg-det-magenta"],
  ];
  return (
    <section className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 py-24">
      <SectionBg video={media.video} poster={media.crowdCv} />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead tag={t("What's inside", "المزايا")} title={t("Eight things it does.", "ثماني قدرات أساسية.")} />
        <ul className="flex flex-wrap content-start gap-3">
          {f.map(([h, c], k) => (
            <Reveal key={k} delay={k * 0.04}>
              <li className="relative border border-border px-4 py-3 text-lg font-medium">
                <span className={`absolute -top-0.5 start-3 h-1 w-8 ${c}`} />
                {h}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Responsible() {
  const { t } = useLang();
  const r = [
    [t("Every alert says “potential match”", "كل تنبيه يُوصف بأنه «تطابق محتمل»"), t("The system never claims it found someone. A reviewer does.", "لا يجزم النظام أبدًا بالعثور على أحد؛ هذا قرار المراجِع وحده.")],
    [t("Wrong matches are logged", "توثيق التطابقات الخاطئة"), t("Rejections feed back into the thresholds so the same mistake shows up less.", "كل رفض يُستخدم لضبط معايير المطابقة، فيقلّ تكرار الخطأ نفسه.")],
    [t("Tested across ages and backgrounds", "مُختبَر على مختلف الأعمار والفئات"), t("We check accuracy separately for children, elderly people and different groups.", "نقيس الدقة بشكل منفصل للأطفال وكبار السن ومختلف الفئات.")],
    [t("Cameras only with permission", "لا وصول إلى الكاميرات دون إذن"), t("Access through official partnerships. Every view is in the audit log.", "يتم الوصول عبر شراكات رسمية، وتُوثَّق كل مشاهدة في سجل التدقيق.")],
    [t("Data is deleted when the case closes", "حذف البيانات فور إغلاق الحالة"), t("Encrypted while open, role-based access, removed afterwards.", "مشفّرة طوال فترة البحث، وصلاحيات الاطلاع محددة بالدور، ثم تُحذف نهائيًا.")],
    [t("Abduction mode: metadata first", "وضع الاختطاف: البيانات الوصفية أولًا"), t("Telecom data opens only with a judicial order, at metadata level. Message and call content needs a second, supervisor approval.", "لا تُتاح بيانات الاتصالات إلا بأمر قضائي، وعلى مستوى البيانات الوصفية فقط. أما محتوى الرسائل والمكالمات فيستلزم موافقة ثانية من المشرف.")],
    [t("Full audit trail, minimum data", "سجل تدقيق كامل وحدّ أدنى من البيانات"), t("Every access is logged with officer and time. Only data tied to the case window is pulled.", "تُسجَّل كل عملية اطلاع باسم الضابط ووقتها، ولا تُستدعى إلا البيانات المرتبطة بالإطار الزمني للحالة.")],
    [t("Plate matches reviewed for bias", "مراجعة مطابقات اللوحات للتحقق من الانحياز"), t("Vehicle and plate links are audited for false positives before any checkpoint alert.", "تخضع روابط المركبات واللوحات لمراجعة الإيجابيات الكاذبة قبل إرسال أي تنبيه إلى نقاط التفتيش.")],
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-card/40 py-24">
      <SectionBg video={media.nycGif} poster={media.nightCv} position="object-[50%_70%]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead tag={t("Responsible AI", "ذكاء اصطناعي مسؤول")} title={t("The rules we built it around.", "المبادئ التي يقوم عليها النظام.")} />
        <dl className="grid gap-x-12 md:grid-cols-2">
          {r.map(([h, p], k) => (
            <Reveal key={k}>
              <div className="border-t border-border py-6">
                <dt className="text-xl font-bold">{h}</dt>
                <dd className="mt-2 text-muted-foreground">{p}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}


function Impact() {
  const { t } = useLang();
  const m = [
    { v: 12, s: " min", l: t("Time to first match", "الزمن حتى أول تطابق") },
    { v: 89, s: "%", l: t("Alert precision", "دقة التنبيهات") },
    { v: 60, s: "%", l: t("Reduction in search time", "اختصار زمن البحث") },
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-card/30 py-24 hud-grid">
      <SectionBg video={media.walkGif} poster={media.streetCv} />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHead tag={t("Impact", "الأثر المتوقع")} title={t("What we’re aiming for in the pilot.", "ما نستهدفه في المرحلة التجريبية.")} />
        <div className="grid gap-8 md:grid-cols-3">
          {m.map((x, k) => (
            <Reveal key={k} delay={k * 0.1}>
              <div className="text-6xl font-bold text-primary sm:text-7xl"><Counter to={x.v} suffix={x.s} /></div>
              <p className="mt-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">{x.l}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">* {t("Target / pilot metrics — not measured results", "مؤشرات مستهدفة، وليست نتائج فعلية")}</p>
      </div>
    </section>
  );
}

function Roadmap() {
  const { t } = useLang();
  const p = [
    { h: t("Phase 1 — MVP", "المرحلة الأولى — النموذج الأولي"), d: t("Photo + location + time → search zone + ranked matches from a sample dataset.", "صورة وموقع وتوقيت، يقابلها نطاق بحث وقائمة تطابقات مرتبة من بيانات تجريبية."), s: t("In progress", "قيد التنفيذ") },
    { h: t("Phase 2 — Pilot", "المرحلة الثانية — التشغيل التجريبي"), d: t("Pilot with real camera partners.", "تشغيل تجريبي بالتعاون مع شركاء يملكون شبكات كاميرات فعلية."), s: t("Next", "المرحلة القادمة") },
    { h: t("Phase 3 — National scale", "المرحلة الثالثة — التوسع على المستوى الوطني"), d: t("Integration with national authorities and multi-city scaling.", "الربط مع الجهات الرسمية والتوسع إلى مدن عدة."), s: t("Planned", "مُخطَّط لها") },
  ];
  return (
    <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <SectionBg video={media.video} poster={media.streetCv} />

      <SectionHead tag={t("Roadmap", "خارطة الطريق")} title={t("Three phases.", "ثلاث مراحل.")} />
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
  return (
    <section className="relative isolate overflow-hidden border-t border-border py-24">
      <SectionBg video={media.nycGif} poster={media.nightCv} />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
        <SectionHead tag={t("Contact", "تواصل معنا")} title={t("Running a pilot? Talk to us.", "هل تودّ المشاركة في التجربة؟ تواصل معنا.")} sub={t("We're looking for camera partners and agencies for Phase 2.", "نبحث عن شركاء من مالكي الكاميرات والجهات المعنية للمرحلة الثانية.")} />
        <div>
          {sent ? (
            <p className="font-mono text-success">✓ {t("Message received. We'll be in touch.", "وصلتنا رسالتك، وسنتواصل معك قريبًا.")}</p>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input required aria-label="Name" placeholder={t("Name / organization", "الاسم / الجهة")} className={inputClass} />
              <input required type="email" aria-label="Email" placeholder={t("Email", "البريد الإلكتروني")} className={inputClass} />
              <textarea required aria-label="Message" rows={4} placeholder={t("Message", "الرسالة")} className={inputClass} />
              <Btn type="submit">{t("Send", "إرسال")}</Btn>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Credits() {
  const { t, lang } = useLang();
  const team = [
    { n: "Mohamed Nasser", ar: "محمد ناصر", r: t("Project Leader — designed and built the entire website from scratch: the look, the interface, and every page and feature on it. Everything you see here went through his hands.", "مدير المشروع — تولّى تصميم الموقع وتطويره بالكامل من الصفر: الشكل العام، والواجهة، وكل صفحة وكل ميزة فيه. كل ما تراه هنا من إعداده.") },
    { n: "Youssef Salama", ar: "يوسف سلامة", r: t("Team leader of the first version — he came up with the original idea and started this project in its first year, leading the team alongside Mohamed Nasser. The idea this whole build is built on is his.", "قائد الفريق الأول — صاحب الفكرة الأصلية، أطلق المشروع في عامه الأول وقاد فريقه إلى جانب محمد ناصر. الفكرة التي يقوم عليها هذا العمل كله هي فكرته.") },
    { n: "Mohamed Sayyad", ar: "محمد صياد", r: t("AI & machine learning — everything with an AI tag on it: training the models, recognizing people in photos and video, and the matching logic that makes the system work.", "مسؤول الذكاء الاصطناعي وتعلّم الآلة — كل ما يتعلق بالذكاء الاصطناعي: تدريب النماذج، والتعرّف على الأشخاص في الصور والفيديو، وخوارزمية المطابقة التي يقوم عليها النظام.") },
    { n: "Ahmed Yasser", ar: "أحمد ياسر", r: t("Data & ideas — collected and organized the data the system runs on, and shaped the ideas and proposals the team worked from.", "مسؤول جمع البيانات والأفكار — جمع البيانات التي يعمل عليها النظام ونظّمها، وصاغ الأفكار والمقترحات التي انطلق منها الفريق.") },
    { n: "Ahmed Walid", ar: "أحمد وليد", r: t("Quality control — checked every feature and every report before release, monitored the data end to end, and turned the team's ideas into working reality.", "مسؤول ضبط الجودة — راجع كل ميزة وكل بلاغ قبل إطلاقه، وتابع البيانات من البداية إلى النهاية، ونقل أفكار الفريق إلى واقع تطبيقي.") },
  ];
  return (
    <section className="relative border-t border-border bg-card/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead tag={t("The Team", "الفريق")} title={t("Two years in a row.", "عامان على التوالي.")} sub={t("This idea has been developed for the second consecutive year by:", "طُوِّرت هذه الفكرة للعام الثاني على التوالي بواسطة:")} />
        <ul className="mt-10 grid gap-3 md:grid-cols-2">
          {team.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.05}>
              <li className="flex h-full items-start gap-4 border border-border bg-background/60 p-5">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 bg-primary" />
                <div className="min-w-0">
                  <p className="font-bold" dir={lang === "ar" ? "rtl" : "ltr"}>{lang === "ar" ? m.ar : m.n}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.r}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

