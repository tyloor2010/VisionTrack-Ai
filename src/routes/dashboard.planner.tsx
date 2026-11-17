import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Btn, Panel } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/planner")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Search Grid Planner — VisionTrack AI" },
      { name: "description", content: "Split the search area into probability cells, drag teams onto them and let the planner optimize deployment and checkpoints." },
      { property: "og:title", content: "Search Grid Planner — VisionTrack AI" },
      { property: "og:description", content: "Probability grid and team deployment for missing-person searches (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

const N = 6;
const prob = Array.from({ length: N * N }, (_, i) => {
  const r = Math.floor(i / N), c = i % N;
  return Math.round(90 * Math.exp(-((r - 2.2) ** 2 + (c - 3) ** 2) / 5));
});
const units = ["Unit 1", "Unit 2", "K9", "Drone 1"];

function Planner() {
  const { t } = useLang();
  const [place, setPlace] = useState<Record<string, number>>({ "Unit 1": 0, "Unit 2": 5, K9: 30, "Drone 1": 35 });
  const [drag, setDrag] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState(false);
  const covered = new Set(Object.values(place));
  const coverage = Math.round((Array.from(covered).reduce((s, i) => s + prob[i]!, 0) / prob.slice().sort((a, b) => b - a).slice(0, units.length).reduce((a, b) => a + b, 0)) * 100);
  const optimize = () => {
    const best = prob.map((p, i) => [p, i] as const).sort((a, b) => b[0] - a[0]).slice(0, units.length);
    setPlace(Object.fromEntries(units.map((u, k) => [u, best[k]![1]])));
  };
  const cps = [5, 11, 24];
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Search grid planner", "مخطط شبكة البحث")}</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel title={t("Probability grid", "شبكة الاحتمالات")}>
          <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
            {prob.map((p, i) => (
              <div key={i} onDragOver={(e) => e.preventDefault()} onDrop={() => drag && setPlace((s) => ({ ...s, [drag]: i }))}
                className="relative flex aspect-square flex-col items-center justify-center gap-1 border border-border text-[10px]"
                style={{ background: `color-mix(in oklab, var(--det-red) ${p * 0.6}%, transparent)` }}>
                <span dir="ltr" className="font-mono text-muted-foreground">{p}%</span>
                {units.filter((u) => place[u] === i).map((u) => <span key={u} className="bg-primary px-1 font-mono text-primary-foreground transition-all">{u}</span>)}
                {checkpoints && cps.includes(i) && <span className="absolute end-1 top-1 font-mono text-warning">⛔</span>}
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title={t("Teams — drag onto a cell", "الفرق — اسحبها إلى خلية")}>
            <div className="flex flex-wrap gap-2 p-4">
              {units.map((u) => <span key={u} draggable onDragStart={() => setDrag(u)} className="cursor-grab border border-primary px-2 py-1 font-mono text-xs text-primary">{u}</span>)}
            </div>
          </Panel>
          <Panel title={t("Coverage", "نسبة التغطية")}>
            <div className="p-4">
              <div className="flex justify-between font-mono text-xs"><span>{t("Probability covered", "الاحتمال المُغطّى")}</span><span dir="ltr">{coverage}%</span></div>
              <div className="mt-2 h-2 bg-secondary"><div className="h-full bg-primary transition-all duration-700" style={{ width: `${coverage}%` }} /></div>
              <Btn size="sm" className="mt-4 w-full" onClick={optimize}><Wand2 className="h-3.5 w-3.5" />{t("Optimize deployment", "تحسين توزيع الفرق")}</Btn>
              <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={checkpoints} onChange={(e) => setCheckpoints(e.target.checked)} className="accent-[var(--primary)]" />{t("Checkpoint optimizer", "اقتراح نقاط التفتيش")}</label>
              {checkpoints && <p className="mt-2 text-xs text-muted-foreground">{t("Suggested checkpoints (⛔) along predicted exit routes.", "نقاط تفتيش مقترحة (⛔) على مسارات الخروج المتوقعة.")}</p>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
