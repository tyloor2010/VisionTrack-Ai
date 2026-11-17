import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Panel, inputClass, Btn } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";
import { useVT, type Agency, type TaskCol } from "@/lib/store";

export const Route = createFileRoute("/dashboard/command-board")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Multi-Agency Command Board — VisionTrack AI" },
      { name: "description", content: "Police, traffic, ambulance and prosecution coordinate on one board with tasks, secure chat, transport-hub alerts and an activity feed." },
      { property: "og:title", content: "Multi-Agency Command Board — VisionTrack AI" },
      { property: "og:description", content: "One shared board for every agency on a missing-person case (demo)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Board,
});

function Board() {
  const { t, lang } = useLang();
  const { tasks, moveTask } = useVT();
  const [drag, setDrag] = useState<string | null>(null);
  const AG: Record<Agency, string> = { police: t("Police", "الشرطة"), traffic: t("Traffic", "المرور"), ambulance: t("Ambulance", "الإسعاف"), prosecution: t("Prosecution", "النيابة") };
  const cols: { k: TaskCol; l: string }[] = [{ k: "todo", l: t("To do", "قيد الانتظار") }, { k: "doing", l: t("In progress", "قيد التنفيذ") }, { k: "done", l: t("Done", "منجزة") }];
  const order: TaskCol[] = ["todo", "doing", "done"];
  const [msgs, setMsgs] = useState([{ who: "POLICE · Lt.", m: t("Sector B clear.", "القطاع B خالٍ.") }, { who: "TRAFFIC · Sgt.", m: t("Checkpoint 2 is live.", "نقطة التفتيش 2 تعمل.") }]);
  const [text, setText] = useState("");
  const hubs = [
    { n: t("Ramses Railway Station", "محطة سكك حديد رمسيس"), s: t("Sent", "أُرسل") },
    { n: t("Cairo International Airport", "مطار القاهرة الدولي"), s: t("Sent", "أُرسل") },
    { n: t("Alexandria Port", "ميناء الإسكندرية"), s: t("Queued", "في الانتظار") },
  ];
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{t("Multi-agency command board", "لوحة التنسيق بين الجهات")}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cols.map((c) => (
          <div key={c.k} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) moveTask(drag, c.k); setDrag(null); }}>
          <Panel title={`${c.l} · ${tasks.filter((x) => x.col === c.k).length}`} className="h-full">
            <ul className="min-h-32 space-y-2 p-3">
              {tasks.filter((x) => x.col === c.k).map((x) => {
                const i = order.indexOf(x.col);
                return (
                <li key={x.id} draggable onDragStart={() => setDrag(x.id)} className="cursor-grab border border-border bg-background/50 p-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2"><span className="border border-primary/50 px-1.5 font-mono text-[10px] uppercase text-primary">{AG[x.agency]}</span><span dir="ltr" className="font-mono text-[10px] text-muted-foreground">{x.caseId}</span></div>
                  <p className="mt-1.5">{x.title[lang]}</p>
                  <div className="mt-2 flex gap-1">
                    <button disabled={i === 0} onClick={() => moveTask(x.id, order[i - 1]!)} className="border border-border px-1.5 font-mono text-[10px] disabled:opacity-30" aria-label={t("Move back", "نقل للخلف")}>{lang === "ar" ? "→" : "←"}</button>
                    <button disabled={i === 2} onClick={() => moveTask(x.id, order[i + 1]!)} className="border border-border px-1.5 font-mono text-[10px] disabled:opacity-30" aria-label={t("Move forward", "نقل للأمام")}>{lang === "ar" ? "←" : "→"}</button>
                  </div>
                </li>
              ); })}
            </ul>
          </Panel>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("Secure chat", "محادثة آمنة")} right={<Lock className="h-3.5 w-3.5 text-success" />}>
          <ul className="max-h-56 space-y-2 overflow-auto p-4 text-sm">
            {msgs.map((m, k) => <li key={k}><span dir="ltr" className="me-2 border border-primary/50 px-1 font-mono text-[10px] text-primary">{m.who}</span>{m.m}</li>)}
          </ul>
          <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setMsgs((l) => [...l, { who: "COMMAND · You", m: text }]); setText(""); } }}>
            <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Message all agencies…", "رسالة إلى جميع الجهات…")} aria-label={t("Message", "رسالة")} />
            <Btn size="sm" type="submit" aria-label={t("Send", "إرسال")}><Send className="h-3.5 w-3.5" /></Btn>
          </form>
        </Panel>
        <Panel title={t("Transport hubs watch", "مراقبة مراكز النقل")}>
          <ul className="divide-y divide-border">
            {hubs.map((h) => <li key={h.n} className="flex justify-between px-4 py-3 text-sm"><span>{h.n}</span><span className="font-mono text-xs text-primary">{h.s}</span></li>)}
          </ul>
          <p className="p-4 text-xs text-muted-foreground">{t("Each hub receives the photo and vehicle info for case VT-2041.", "يتلقى كل مركز الصورة وبيانات المركبة الخاصة بالحالة VT-2041.")}</p>
        </Panel>
      </div>
    </div>
  );
}
