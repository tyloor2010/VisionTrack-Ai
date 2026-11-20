import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Upload, ShieldCheck } from "lucide-react";
import { Btn, Panel, SectionHead, inputClass } from "@/components/vt/ui";
import { SearchMap } from "@/components/vt/SearchMap";
import { SectionBg } from "@/components/vt/SectionBg";
import { media } from "@/data/mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/report")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Report a Missing Person or Sighting — VisionTrack AI" },
      { name: "description", content: "File a report or pass on a sighting: a photo, when and where the person was last seen, and what they wore. Every submission is checked by a person before it reaches authorities." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visiontrackai.site/report" },
      { property: "og:title", content: "Report a Sighting or Missing Person — VisionTrack AI" },
      { property: "og:description", content: "Citizen sightings and family reports, verified before reaching authorities." },
      { property: "og:image", content: "https://visiontrackai.site/og-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://visiontrackai.site/og-logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://visiontrackai.site/report" }],
  }),

  component: ReportPage,
});

function ReportPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<"sighting" | "missing">("sighting");
  return (
    <section className="relative isolate overflow-hidden px-4 py-14">
      <SectionBg video={media.video} poster={media.nightCv} position="object-[50%_70%]" />
      <div className="relative mx-auto max-w-4xl">
        <SectionHead as="h1" tag={t("Reporting", "الإبلاغ")} title={t("Help us find them faster.", "ساعدنا للوصول إليهم في وقتٍ أسرع.")} sub={t("This is a demo — no data is sent anywhere.", "هذه نسخة تجريبية، ولن تُرسَل أي بيانات.")} />
      </div>
      <div className="relative mx-auto mt-6 max-w-4xl sm:px-0">
      <div className="mb-6 flex gap-2" role="tablist">
        {(["sighting", "missing"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`flex-1 border px-4 py-3 font-mono text-xs uppercase tracking-wider ${tab === k ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            {k === "sighting" ? t("Submit a sighting", "إبلاغ عن مشاهدة") : t("Report a missing person", "أبلِغ عن شخص مفقود")}
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
    setStep(4);
  };
  return { step, submit, reset: () => setStep(-1) };
}

function Verification({ onReset }: { step: number; onReset: () => void }) {
  const { t } = useLang();
  return (
    <Panel className="p-8" title={t("Demo only", "عرض تجريبي فقط")}>
      <div className="flex items-start gap-3 text-sm text-muted-foreground"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />{t("This form is a demonstration. Your report was not sent to anyone — not to reviewers and not to the authorities. In a real emergency, call the police (122) right away.", "هذا النموذج للعرض فقط. لم يُرسَل بلاغك إلى أي جهة، لا إلى المراجعين ولا إلى السلطات. في حالات الطوارئ الحقيقية اتصل بالشرطة (122) فورًا.")}</div>
      <Btn variant="ghost" size="sm" className="mt-6" onClick={onReset}>{t("Back to the form", "العودة إلى النموذج")}</Btn>
    </Panel>
  );
}

function PhotoInput() {
  const { t } = useLang();
  const [name, setName] = useState("");
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-primary/40 bg-background/40 p-8 text-center text-sm text-muted-foreground hover:border-primary">
      <Upload className="h-6 w-6 text-primary" />
      {name || t("Upload photo(s)", "ارفع صورة أو أكثر")}
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
      <p dir="ltr" className="mt-1 font-mono text-[10px] text-muted-foreground">{pin ? `PIN ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}` : t("Tap anywhere on the map to drop the pin.", "اضغط على الخريطة لتحديد الموقع.")}</p>
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
          <option>{t("Alzheimer's / dementia", "الزهايمر / الخَرَف")}</option>
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
