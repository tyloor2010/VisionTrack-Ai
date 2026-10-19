import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { usePrefs, DEFAULT_PREFS, type Prefs } from "@/lib/prefs";
import { Panel, Btn } from "@/components/vt/ui";
import { SHORTCUTS } from "@/components/vt/CommandPalette";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Accessibility — VisionTrack AI" },
      { name: "description", content: "Display, accessibility, units and language preferences for the VisionTrack AI demo console." },
      { property: "og:title", content: "Settings & Accessibility — VisionTrack AI" },
      { property: "og:description", content: "Display, accessibility, units and language preferences for the VisionTrack AI demo console." },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Seg<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="flex overflow-hidden rounded-sm border border-border">
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 font-mono text-xs ${value === o.v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full border border-border transition-colors ${value ? "bg-primary/30" : "bg-secondary"}`}>
      <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-primary transition-all ${value ? "start-5" : "start-1"}`} style={{ height: 18, width: 18 }} />
    </button>
  );
}

function SettingsPage() {
  const { t } = useLang();
  const p = usePrefs();
  const set = p.setPref;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div dir="ltr" className="mb-3 inline-block bg-primary px-1.5 font-mono text-xs font-semibold leading-5 text-primary-foreground">settings</div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Settings & accessibility", "الإعدادات وإمكانية الوصول")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("Personal display preferences — saved on this device only.", "تفضيلات العرض الشخصية — تُحفظ على هذا الجهاز فقط.")}</p>
        </div>
        <Btn variant="outline" size="sm" onClick={() => p.resetPrefs()}><RotateCcw className="h-3.5 w-3.5" />{t("Reset all", "إعادة ضبط الكل")}</Btn>
      </div>

      <Panel title={t("Display", "العرض")} className="mb-6 px-4">
        <Row label={t("UI density", "كثافة الواجهة")}>
          <Seg value={p.density} onChange={(v) => set("density", v)} options={[{ v: "compact", l: t("Compact", "مضغوطة") }, { v: "comfortable", l: t("Comfortable", "مريحة") }]} />
        </Row>
        <Row label={t("Text size", "حجم النص")}>
          <Seg value={p.textSize} onChange={(v) => set("textSize", v as Prefs["textSize"])} options={[{ v: 0, l: "S" }, { v: 1, l: "M" }, { v: 2, l: "L" }, { v: 3, l: "XL" }]} />
        </Row>
        <Row label={t("Scanline / noise intensity", "شدة خطوط المسح والتشويش")}>
          <input type="range" min={0} max={100} value={p.scanlines} onChange={(e) => set("scanlines", Number(e.target.value))} aria-label={t("Scanline intensity", "شدة خطوط المسح")} className="w-40 accent-primary" />
        </Row>
        <Row label={t("Detection-box thickness", "سماكة مربعات الرصد")}>
          <Seg value={p.boxThickness} onChange={(v) => set("boxThickness", v)} options={[1, 2, 3, 4].map((n) => ({ v: n, l: `${n}px` }))} />
        </Row>
        <Row label={t("Box label style", "نمط تسمية المربعات")}>
          <Seg value={p.labelStyle} onChange={(v) => set("labelStyle", v)} options={[{ v: "full", l: t("Name + confidence", "الاسم والنسبة") }, { v: "confidence", l: t("Confidence only", "النسبة فقط") }, { v: "hidden", l: t("Hidden", "مخفية") }]} />
        </Row>
      </Panel>

      <Panel title={t("Accessibility", "إمكانية الوصول")} className="mb-6 px-4">
        <Row label={t("Colorblind-safe palette", "لوحة ألوان آمنة لعمى الألوان")} hint={t("Recolors detection classes.", "يُعيد تلوين فئات الرصد.")}>
          <Seg value={p.palette} onChange={(v) => set("palette", v)} options={[{ v: "standard", l: t("Standard", "قياسية") }, { v: "deuteranopia", l: "Deu" }, { v: "protanopia", l: "Pro" }, { v: "tritanopia", l: "Tri" }]} />
        </Row>
        <Row label={t("High contrast", "تباين عالٍ")}>
          <Toggle value={p.highContrast} onChange={(v) => set("highContrast", v)} label={t("High contrast", "تباين عالٍ")} />
        </Row>
        <Row label={t("Reduce motion", "تقليل الحركة")}>
          <Toggle value={p.reduceMotion} onChange={(v) => set("reduceMotion", v)} label={t("Reduce motion", "تقليل الحركة")} />
        </Row>
        <Row label={t("Screen-reader announcements", "إعلانات قارئ الشاشة")}>
          <Toggle value={p.srAnnounce} onChange={(v) => set("srAnnounce", v)} label={t("Screen-reader announcements", "إعلانات قارئ الشاشة")} />
        </Row>
      </Panel>

      <Panel title={t("Units & formats", "الوحدات والتنسيقات")} className="mb-6 px-4">
        <Row label={t("Distance units", "وحدات المسافة")}>
          <Seg value={p.units} onChange={(v) => set("units", v)} options={[{ v: "km", l: t("Kilometres", "كيلومتر") }, { v: "mi", l: t("Miles", "ميل") }]} />
        </Row>
        <Row label={t("Clock format", "تنسيق الساعة")}>
          <Seg value={p.hourFormat} onChange={(v) => set("hourFormat", v)} options={[{ v: "24", l: "24h" }, { v: "12", l: "12h" }]} />
        </Row>
        <Row label={t("Date format", "تنسيق التاريخ")}>
          <Seg value={p.dateFormat} onChange={(v) => set("dateFormat", v)} options={[{ v: "dmy", l: "31/12/2027" }, { v: "mdy", l: "12/31/2027" }, { v: "iso", l: "2027-12-31" }]} />
        </Row>
        <Row label={t("Arabic-Indic digits", "الأرقام العربية المشرقية")} hint={t("Show numbers as ٠١٢٣ in Arabic.", "عرض الأرقام بالصيغة ٠١٢٣ في العربية.")}>
          <Toggle value={p.arabicDigits} onChange={(v) => set("arabicDigits", v)} label={t("Arabic-Indic digits", "الأرقام العربية المشرقية")} />
        </Row>
      </Panel>

      <Panel title={t("Shortcuts", "الاختصارات")} className="px-4">
        <ul className="divide-y divide-border">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span>{t(s.en, s.ar)}</span>
              <kbd dir="ltr" className="rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-xs text-primary">{s.keys}</kbd>
            </li>
          ))}
        </ul>
        <p className="py-3 text-xs text-muted-foreground">{t("Shortcut remapping is planned; defaults shown above.", "إعادة تعيين الاختصارات مخططة؛ تظهر الإعدادات الافتراضية أعلاه.")}</p>
      </Panel>
    </div>
  );
}

export { DEFAULT_PREFS };
