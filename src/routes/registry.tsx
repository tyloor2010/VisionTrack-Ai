import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Upload, MapPin, Watch, Siren, Check } from "lucide-react";
import { Btn, Panel, SectionHead, inputClass, btnClass } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/registry")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Voluntary Safe Registry — VisionTrack AI" },
      { name: "description", content: "Families register vulnerable relatives — elderly, autism, Alzheimer's — ahead of time, so a search can start in seconds if they go missing." },
      { property: "og:title", content: "Voluntary Safe Registry — VisionTrack AI" },
      { property: "og:description", content: "Family-managed, consent-based profiles that pre-fill a search case instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Registry,
});

type Prof = { name: string; age: string; type: string; notes: string; places: string[]; band: string };

function Registry() {
  const { t } = useLang();
  const [list, setList] = useState<Prof[]>([{ name: t("Grandfather (demo)", "الجدّ (تجريبي)"), age: "78", type: t("Alzheimer's", "الزهايمر"), notes: t("Walks toward his old neighbourhood.", "يميل إلى السير نحو حيّه القديم."), places: [t("Al Hussein Mosque", "مسجد الحسين"), t("Old home, Shubra", "المنزل القديم بشبرا")], band: "BAND-4F2•" }]);
  const [f, setF] = useState({ name: "", age: "", type: "", notes: "", places: "", band: "", consent: false });
  const [active, setActive] = useState<number | null>(null);
  const add = (e: FormEvent) => {
    e.preventDefault();
    setList((l) => [...l, { ...f, places: f.places.split(",").map((x) => x.trim()).filter(Boolean) }]);
    setF({ name: "", age: "", type: "", notes: "", places: "", band: "", consent: false });
  };
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead tag={t("Safe registry", "السجل الآمن")} title={t("Register before it happens.", "سجّل قبل أن يقع الأمر.")} sub={t("Voluntary and family-managed. If a registered person goes missing, one button opens a ready case.", "تسجيل طوعي تديره الأسرة. إذا فُقد أحد المسجّلين، يكفي زر واحد لفتح حالة جاهزة.")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("Add a profile", "إضافة ملف")}>
          <form onSubmit={add} className="space-y-3 p-5">
            <label className="flex h-24 cursor-pointer items-center justify-center gap-2 border border-dashed border-border text-sm text-muted-foreground"><Upload className="h-4 w-4" />{t("Upload a recent photo", "ارفع صورة حديثة")}<input type="file" accept="image/*" className="sr-only" /></label>
            <div className="grid grid-cols-2 gap-3">
              <input required className={inputClass} placeholder={t("Name", "الاسم")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input required className={inputClass} placeholder={t("Age", "العمر")} value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
            </div>
            <input className={inputClass} placeholder={t("Condition (e.g. autism, Alzheimer's)", "الحالة (مثل التوحّد أو الزهايمر)")} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} />
            <textarea className={`${inputClass} h-20`} placeholder={t("Medical notes and how they behave when lost", "ملاحظات طبية وكيف يتصرف عند الضياع")} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
            <input className={inputClass} placeholder={t("Familiar / safe places, separated by commas", "أماكن مألوفة أو آمنة، تفصل بينها فواصل")} value={f.places} onChange={(e) => setF({ ...f, places: e.target.value })} />
            <input className={inputClass} placeholder={t("GPS bracelet ID (optional)", "رقم سوار التتبّع (اختياري)")} value={f.band} onChange={(e) => setF({ ...f, band: e.target.value })} />
            <label className="flex items-start gap-2 text-xs text-muted-foreground"><input required type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 accent-[var(--primary)]" />{t("I am the legal guardian and consent to storing this profile. I can delete it at any time.", "أقرّ بأنني الوصي القانوني وأوافق على حفظ هذا الملف، ويحق لي حذفه في أي وقت.")}</label>
            <Btn type="submit">{t("Save profile", "حفظ الملف")}</Btn>
          </form>
        </Panel>
        <div className="space-y-4">
          {list.map((p, k) => (
            <Panel key={k} className="p-5">
              <div className="flex items-center justify-between"><h3 className="font-bold">{p.name} · <span dir="ltr">{p.age}</span></h3><span className="border border-primary/50 px-1.5 font-mono text-[10px] text-primary">{p.type || "—"}</span></div>
              {p.notes && <p className="mt-2 text-sm text-muted-foreground">{p.notes}</p>}
              <ul className="mt-3 flex flex-wrap gap-2 text-xs">{p.places.map((pl) => <li key={pl} className="flex items-center gap-1 border border-border px-2 py-0.5"><MapPin className="h-3 w-3 text-success" />{pl}</li>)}</ul>
              {p.band && <p dir="ltr" className="mt-2 flex items-center gap-1 font-mono text-xs text-muted-foreground"><Watch className="h-3 w-3" />{p.band}</p>}
              {active === k ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 border border-success/50 bg-success/10 p-3 text-sm"><Check className="h-4 w-4 text-success" />{t("Case pre-filled and opened.", "تم تجهيز الحالة وفتحها.")}<Link to="/dashboard/case/$id" params={{ id: "VT-2038" }} className={btnClass("outline", "sm")}>{t("Open case", "فتح الحالة")}</Link></div>
              ) : (
                <Btn size="sm" variant="alert" className="mt-4" onClick={() => setActive(k)}><Siren className="h-3.5 w-3.5" />{t("Activate search", "تفعيل البحث")}</Btn>
              )}
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
