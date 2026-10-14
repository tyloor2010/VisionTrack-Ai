import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Upload, ShieldCheck, Check, Loader2 } from "lucide-react";
import { Btn, Panel, SectionHead, inputClass } from "@/components/vt/ui";
import { SearchMap } from "@/components/vt/SearchMap";
import { SectionBg } from "@/components/vt/SectionBg";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report — VisionTrack AI" },
      { name: "description", content: "Submit a sighting or report a missing person. Submissions are checked before reaching authorities." },
      { property: "og:title", content: "Report a Sighting or Missing Person — VisionTrack AI" },
      { property: "og:description", content: "Citizen sightings and family reports, verified before reaching authorities." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<"sighting" | "missing">("sighting");
  return (
    <section className="relative overflow-hidden px-4 py-14">
      <SectionBg src={media.nightCv} position="object-[50%_70%]" />
      <div className="relative mx-auto max-w-4xl">
        <SectionHead tag={t("Reporting", "الإبلاغ")} title={t("Help us find them faster.", "ساعدنا نوصل لهم أسرع.")} sub={t("This is a demo — no data is sent anywhere.", "هذا عرض تجريبي — لا يتم إرسال أي بيانات.")} />
      </div>
      <div className="relative mx-auto mt-6 max-w-4xl sm:px-0">
      <div className="mb-6 flex gap-2" role="tablist">
        {(["sighting", "missing"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`flex-1 border px-4 py-3 font-mono text-xs uppercase tracking-wider ${tab === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            {k === "sighting" ? t("Submit a sighting", "إبلاغ عن مشاهدة") : t("Report a missing person", "الإبلاغ عن مفقود")}
          </button>
        ))}
      </div>
      {tab === "sighting" ? <SightingForm key="s" /> : <MissingForm key="m" />}
      </div>
    </section>
  );
}

function useSubmit() {
  const [step, setStep] = useState(-1);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setStep(0);
    [1, 2, 3].forEach((s) => setTimeout(() => setStep(s), s * 900));
  };
  return { step, submit, reset: () => setStep(-1) };
}

function Verification({ step, onReset }: { step: number; onReset: () => void }) {
  const { t } = useLang();
  const checks = [t("Image quality & duplicates", "جودة الصورة والتكرار"), t("Location & time consistency", "اتساق الموقع والوقت"), t("Spam / abuse screening", "فحص البلاغات المزعجة")];
  return (
    <Panel className="p-8" title={t("Verification", "التحقق")}>
      <div className="flex items-center gap-3 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 text-success" />{t("Submission checked before reaching authorities.", "يتم فحص البلاغ قبل وصوله للجهات المختصة.")}</div>
      <ul className="mt-6 space-y-3 font-mono text-sm">
        {checks.map((c, i) => (
          <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }} className="flex items-center gap-3">
            {step > i ? <Check className="h-4 w-4 text-success" /> : <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            <span className={step > i ? "text-foreground" : "text-muted-foreground"}>{c}</span>
          </motion.li>
        ))}
      </ul>
      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 border border-success/50 bg-success/10 p-4">
          <p className="font-mono text-sm uppercase text-success">✓ {t("Forwarded for human review", "أُرسل للمراجعة البشرية")}</p>
          <p dir="ltr" className="mt-1 font-mono text-xs text-muted-foreground">REF #VT-{Math.floor(Math.random() * 9000 + 1000)}</p>
          <Btn variant="ghost" size="sm" className="mt-3" onClick={onReset}>{t("New report", "بلاغ جديد")}</Btn>
        </motion.div>
      )}
    </Panel>
  );
}

function PhotoInput() {
  const { t } = useLang();
  const [name, setName] = useState("");
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-primary/40 bg-background/40 p-8 text-center text-sm text-muted-foreground hover:border-primary">
      <Upload className="h-6 w-6 text-primary" />
      {name || t("Upload photo(s)", "ارفع صورة")}
      <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setName(Array.from(e.target.files ?? []).map((f) => f.name).join(", "))} />
    </label>
  );
}

function PinPicker() {
  const { t } = useLang();
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  return (
    <div>
      <span className="mb-1 block font-mono text-xs uppercase text-muted-foreground">{t("Location — tap the map", "الموقع — اضغط على الخريطة")}</span>
      <SearchMap
        interactive
        origin={{ lat: 30.0450, lng: 31.2400 }}
        radiusKm={pin ? 0.3 : 0}
        pin={pin}
        onPick={setPin}
        className="aspect-[3/1] w-full"
      />
      <p dir="ltr" className="mt-1 font-mono text-[10px] text-muted-foreground">{pin ? `PIN ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}` : t("Tap anywhere on the map to drop the pin.", "اضغط في أي مكان على الخريطة لتحديد الموقع.")}</p>
    </div>
  );
}

function SightingForm() {
  const { t } = useLang();
  const { step, submit, reset } = useSubmit();
  if (step >= 0) return <Verification step={step} onReset={reset} />;
  return (
    <Panel className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <PhotoInput />
        <PinPicker />
        <input required type="datetime-local" aria-label="Time" className={inputClass} />
        <textarea required rows={3} aria-label="Description" placeholder={t("What did you see? Clothing, direction…", "ماذا رأيت؟ الملابس، الاتجاه…")} className={inputClass} />
        <Btn type="submit" className="w-full">{t("Submit sighting", "إرسال المشاهدة")}</Btn>
      </form>
    </Panel>
  );
}

function MissingForm() {
  const { t } = useLang();
  const { step, submit, reset } = useSubmit();
  if (step >= 0) return <Verification step={step} onReset={reset} />;
  return (
    <Panel className="p-6">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><PhotoInput /></div>
        <input required aria-label="Full name" placeholder={t("Full name", "الاسم بالكامل")} className={inputClass} />
        <input required type="number" min={0} aria-label="Age" placeholder={t("Age", "العمر")} className={inputClass} />
        <input required aria-label="Last seen place" placeholder={t("Last seen place", "آخر مكان شوهد فيه")} className={inputClass} />
        <input required type="datetime-local" aria-label="Last seen time" className={inputClass} />
        <input aria-label="Clothing" placeholder={t("Clothing", "الملابس")} className={inputClass} />
        <select aria-label="Health condition" className={inputClass} defaultValue="">
          <option value="" disabled>{t("Health condition", "الحالة الصحية")}</option>
          <option>{t("None", "لا يوجد")}</option>
          <option>{t("Alzheimer's / dementia", "ألزهايمر / خرف")}</option>
          <option>{t("Autism", "توحّد")}</option>
          <option>{t("Other", "أخرى")}</option>
        </select>
        <input required type="tel" aria-label="Contact phone" placeholder={t("Contact phone", "رقم التواصل")} className={`${inputClass} sm:col-span-2`} />
        <label className="flex items-start gap-3 text-sm text-muted-foreground sm:col-span-2">
          <input required type="checkbox" className="mt-1 accent-[var(--primary)]" />
          {t("I consent to sharing this information with authorized authorities for the purpose of this search.", "أوافق على مشاركة هذه البيانات مع الجهات المختصة لغرض البحث.")}
        </label>
        <Btn type="submit" className="sm:col-span-2">{t("Submit report", "إرسال البلاغ")}</Btn>
      </form>
    </Panel>
  );
}
