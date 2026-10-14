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
      { name: "twitter:card", content: "summary_large_image" },

    ],
    links: [{ rel: "canonical", href: "https://visiontrack2027.lovable.app/" }],

  }),
  component: Index,
});

/** Every photo and clip the site owns, flipped through behind the headline. */
const HERO_LAYERS: CycleLayer[] = [
  { kind: "video", src: media.heroVideo, poster: media.crosswalk },
  { kind: "img", src: media.walkGif },
  { kind: "img", src: media.streetCv },
  { kind: "img", src: media.nycGif },
  { kind: "img", src: media.crowdCv },
  { kind: "img", src: media.nightCv },
  { kind: "img", src: media.crosswalkCv },
  { kind: "img", src: media.trafficGif },
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
    <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <SectionBg src={media.walkGif} />

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
    { tag: "intake", c: "bg-det-yellow", h: t("A family files a report", "الأسرة تقدّم بلاغًا"), p: t("Photos, where and when the person was last seen, what they wore, their age — and any condition like Alzheimer's or autism, because it changes how someone moves.", "صور، آخر مكان ووقت، الملابس، العمر — وأي حالة مثل ألزهايمر أو التوحد، لأنها تغيّر طريقة حركة الشخص.") },
    { tag: "match", c: "bg-det-magenta", h: t("It compares more than faces", "يقارن أكتر من الوجه"), p: t("CCTV faces are usually blurry, so it also matches clothing, build and how the person walks.", "الوجوه في الكاميرات غالبًا مش واضحة، فبيقارن كمان الملابس والجسم وطريقة المشي.") },
    { tag: "radius", c: "bg-det-cyan", h: t("It works out where to look", "يحدد فين ندوّر"), p: t("A seven-year-old walks slower than an adult. Time passed × expected speed = the area worth searching.", "طفل عنده سبع سنين بيمشي أبطأ من الكبير. الوقت × السرعة المتوقعة = المنطقة اللي تستاهل البحث.") },
    { tag: "alert", c: "bg-det-red", h: t("Operators get a snapshot", "المشغّل يستلم لقطة"), p: t("Camera, time, place and a confidence score. Nothing happens automatically.", "الكاميرا، الوقت، المكان ودرجة الثقة. ولا حاجة بتحصل تلقائيًا.") },
    { tag: "human", c: "bg-det-green", h: t("A person decides", "إنسان هو اللي يقرر"), p: t("An authorized officer confirms or rejects before anyone is sent.", "ضابط مخوّل يأكد أو يرفض قبل إرسال أي حد.") },
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border py-24">
      <SectionBg src={media.nycGif} position="object-top" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead tag={t("How it works", "كيف يعمل")} title={t("From a phone call to a camera frame.", "من مكالمة لكادر كاميرا.")} />
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
      <SectionBg src={media.walkGif} />
      <div className="relative">
        <SectionHead tag={t("Live demo", "عرض مباشر")} title={t("Run a search yourself.", "جرّب البحث بنفسك.")} sub={t("Select a profile, start the search, and review the alert like an operator would.", "اختر حالة، ابدأ البحث، وراجع التنبيه كما يفعل المشغّل.")} />
        <LiveDemo />
      </div>
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
        <Reveal delay={0.35}><Panel className="overflow-hidden"><img src={media.crosswalkCv} alt="Crosswalk with person, bicycle and car detection labels" loading="lazy" className="aspect-square w-full object-cover" /></Panel></Reveal>
        <Reveal delay={0.4} className="md:col-span-2"><Panel className="overflow-hidden"><img src={media.trafficGif} alt="Animated traffic camera view with car, rider and person detection boxes" loading="lazy" className="aspect-[2/1] w-full object-cover" /></Panel></Reveal>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLang();
  const f = [
    [t("Face + appearance matching", "مطابقة الوجه والمظهر"), "bg-det-yellow"],
    [t("Search-radius prediction", "توقع نطاق البحث"), "bg-det-cyan"],
    [t("Real-time alerts", "تنبيهات لحظية"), "bg-det-red"],
    [t("Citizen sightings", "بلاغات المواطنين"), "bg-det-magenta"],
    [t("Age progression for older cases", "محاكاة التقدم في العمر للقضايا القديمة"), "bg-det-green"],
    [t("Live heat map", "خريطة حرارية مباشرة"), "bg-det-yellow"],
    [t("Several cameras, one track", "كاميرات كتير، مسار واحد"), "bg-det-cyan"],
    [t("Measured outcomes", "نتائج قابلة للقياس"), "bg-det-magenta"],
  ];
  return (
    <section className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 py-24">
      <SectionBg video={media.video} poster={media.crowdCv} />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead tag={t("What's inside", "إيه اللي جوّه")} title={t("Eight things it does.", "تمن حاجات بيعملها.")} />
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
    [t("Every alert says “potential match”", "كل تنبيه مكتوب عليه «تطابق محتمل»"), t("The system never claims it found someone. A reviewer does.", "النظام عمره ما يقول إنه لقى حد. المراجع هو اللي يقول.")],
    [t("Wrong matches are logged", "التطابقات الغلط بتتسجل"), t("Rejections feed back into the thresholds so the same mistake shows up less.", "الرفض بيرجع يظبط الحدود عشان نفس الغلطة تقل.")],
    [t("Tested across ages and backgrounds", "مختبر على أعمار وخلفيات مختلفة"), t("We check accuracy separately for children, elderly people and different groups.", "بنقيس الدقة لوحدها للأطفال وكبار السن والفئات المختلفة.")],
    [t("Cameras only with permission", "الكاميرات بإذن بس"), t("Access through official partnerships. Every view is in the audit log.", "الوصول عن طريق شراكات رسمية. وكل مشاهدة في سجل التدقيق.")],
    [t("Data is deleted when the case closes", "البيانات بتتمسح لما القضية تتقفل"), t("Encrypted while open, role-based access, removed afterwards.", "مشفرة وهي مفتوحة، صلاحيات حسب الدور، وبتتشال بعدها.")],
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-card/40 py-24">
      <SectionBg src={media.nycGif} position="object-[50%_70%]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead tag={t("Responsible AI", "ذكاء اصطناعي مسؤول")} title={t("The rules we built it around.", "القواعد اللي بنيناه عليها.")} />
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
    { v: 12, s: " min", l: t("Time to first match", "الوقت حتى أول تطابق") },
    { v: 89, s: "%", l: t("Alert precision", "دقة التنبيهات") },
    { v: 60, s: "%", l: t("Reduction in search time", "تقليل وقت البحث") },
  ];
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-card/30 py-24 hud-grid">
      <SectionBg src={media.walkGif} />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHead tag={t("Impact", "الأثر")} title={t("What we’re aiming for in the pilot.", "اللي بنستهدفه في التجربة.")} />
        <div className="grid gap-8 md:grid-cols-3">
          {m.map((x, k) => (
            <Reveal key={k} delay={k * 0.1}>
              <div className="text-6xl font-bold text-primary sm:text-7xl"><Counter to={x.v} suffix={x.s} /></div>
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
    <section className="relative isolate mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <SectionBg video={media.video} poster={media.streetCv} />

      <SectionHead tag={t("Roadmap", "خارطة الطريق")} title={t("Three phases.", "تلات مراحل.")} />
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
      <SectionBg src={media.nycGif} />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2">
        <SectionHead tag={t("Contact", "تواصل")} title={t("Running a pilot? Talk to us.", "عندك تجربة؟ كلمنا.")} sub={t("We're looking for camera partners and agencies for Phase 2.", "بندوّر على شركاء كاميرات وجهات للمرحلة التانية.")} />
        <div>
          {sent ? (
            <p className="font-mono text-success">✓ {t("Message received. We'll be in touch.", "تم استلام رسالتك. هنتواصل معاك.")}</p>
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

