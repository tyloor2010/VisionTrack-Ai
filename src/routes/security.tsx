import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, SlidersHorizontal, Scale, Gavel, Layers, ScrollText, Minimize2, Lock, Users, Trash2, Handshake, Server, WifiOff, Cpu, KeyRound, Network, ScanFace } from "lucide-react";
import { Reveal, SectionHead } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Responsible AI — VisionTrack AI" },
      { name: "description", content: "How VisionTrack AI is deployed and governed: on-prem and air-gapped options, edge processing, zero trust, judicial gates, audit trails and bias testing." },
      { property: "og:title", content: "Security & Responsible AI — VisionTrack AI" },
      { property: "og:description", content: "Sovereign deployment, legal gates and human review on every alert." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Security,
});

function Security() {
  const { t } = useLang();
  const ai = [
    [UserCheck, t("Human review on every alert", "مراجعة بشرية لكل تنبيه")], [SlidersHorizontal, t("Confidence thresholds & false-positive handling", "حدود ثقة ومعالجة الإيجابيات الكاذبة")],
    [Scale, t("Bias testing across ages and groups", "اختبار الانحياز عبر الأعمار والفئات")], [ScrollText, t("Metadata-first policy", "البيانات الوصفية أولًا")],
    [Gavel, t("Judicial authorization", "إذن قضائي")], [Layers, t("Two-level access", "صلاحيات على مستويين")],
    [ScrollText, t("Full audit trail", "سجل تدقيق كامل")], [Minimize2, t("Data minimization", "الحد الأدنى من البيانات")],
    [Lock, t("Encryption", "التشفير")], [Users, t("Role-based access", "صلاحيات حسب الدور")],
    [Trash2, t("Auto-deletion after case closure", "حذف تلقائي بعد إغلاق الحالة")], [Handshake, t("Official partnerships only", "شراكات رسمية فقط")],
  ] as const;
  const dep = [
    [Server, t("Sovereign / on-prem deployment", "نشر سيادي داخل المقار")], [WifiOff, t("Air-gapped mode — no internet", "وضع معزول تمامًا عن الإنترنت")],
    [Cpu, t("Edge AI — analysis near the camera, no raw video moves", "معالجة طرفية — التحليل قرب الكاميرا دون نقل الفيديو الخام")], [KeyRound, t("Zero trust + MFA", "انعدام الثقة الافتراضية + تحقق متعدد العوامل")],
    [Network, t("Chain of command by agency and rank", "تسلسل صلاحيات حسب الجهة والرتبة")], [ScanFace, t("Deepfake / tamper detection on uploads", "كشف التزييف والتلاعب في الصور المرفوعة")],
  ] as const;
  const Grid = ({ items }: { items: readonly (readonly [typeof ShieldCheck, string])[] }) => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([I, l], k) => (
        <Reveal key={l} delay={k * 0.03}><div className="flex h-full items-center gap-3 border border-border bg-card p-4 text-sm"><I className="h-5 w-5 shrink-0 text-primary" />{l}</div></Reveal>
      ))}
    </div>
  );
  const arch = [t("Cameras / Edge", "الكاميرات / الطرفيات"), t("Secure gateway", "بوابة آمنة"), t("AI engine", "محرك الذكاء الاصطناعي"), t("Command dashboard", "لوحة القيادة")];
  return (
    <section className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      <SectionHead tag={t("Security", "الأمان")} title={t("Built to be trusted.", "مصمَّم ليكون جديرًا بالثقة.")} sub={t("Every result is a potential match that a person must review.", "كل نتيجة هي تطابق محتمل لا بد أن يراجعه إنسان.")} />
      <div><h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-muted-foreground">{t("Responsible AI & privacy", "الذكاء الاصطناعي المسؤول والخصوصية")}</h2><Grid items={ai} /></div>
      <div><h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-muted-foreground">{t("Deployment & security", "النشر والأمان")}</h2><Grid items={dep} /></div>
      <div>
        <h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">{t("Architecture", "البنية")}</h2>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {arch.map((a, k) => (
            <div key={a} className="flex flex-1 items-center gap-2 md:flex-row">
              <div className="flex-1 border border-primary bg-primary/10 p-4 text-center text-sm font-semibold">{a}</div>
              {k < arch.length - 1 && <span className="text-center font-mono text-primary md:w-6">→</span>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 md:flex-row md:justify-center">
          <div className="border border-det-cyan/60 p-3 text-sm">{t("Telecom sources (official channels)", "مصادر الاتصالات (قنوات رسمية)")}</div>
          <span className="font-mono text-primary">→</span>
          <div className="border-2 border-det-red bg-det-red/10 p-3 text-sm font-semibold">⚖ {t("Legal gate", "البوابة القانونية")}</div>
          <span className="font-mono text-primary">→</span>
          <div className="border border-primary p-3 text-sm">{t("AI engine", "محرك الذكاء الاصطناعي")}</div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("The platform analyzes data received through lawful channels; it does not collect it.", "تحلّل المنصة البيانات الواردة عبر القنوات القانونية، ولا تجمعها بنفسها.")}</p>
      </div>
    </section>
  );
}
