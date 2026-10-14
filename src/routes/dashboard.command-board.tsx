import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Panel, inputClass, Btn } from "@/components/vt/ui";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/command-board")({
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
  const { t } = useLang();
  const cols = [
    { k: t("Police", "الشرطة"), items: [[t("Sweep Tahrir Sq. sector B", "تمشيط القطاع B بميدان التحرير"), "active"], [t("Interview witness at CAM-014", "سؤال الشاهد عند CAM-014"), "done"]] },
    { k: t("Traffic", "المرور"), items: [[t("Checkpoints on Ramses St.", "نقاط تفتيش بشارع رمسيس"), "active"], [t("Pull plate ABC 12•• history", "سجل اللوحة ABC 12••"), "pending"]] },
    { k: t("Ambulance", "الإسعاف"), items: [[t("Standby near Downtown", "الاستعداد قرب وسط البلد"), "active"]] },
    { k: t("Prosecution", "النيابة"), items: [[t("Telecom order VT-2041", "أمر الاتصالات VT-2041"), "done"], [t("Content access request", "طلب الاطلاع على المحتوى"), "pending"]] },
  ];
  const chip = { active: "text-primary border-primary/50", done: "text-success border-success/50", pending: "text-warning border-warning/50" } as Record<string, string>;
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cols.map((c) => (
          <Panel key={c.k} title={c.k}>
            <ul className="space-y-2 p-3">
              {c.items.map(([l, s]) => (
                <li key={l} className="border border-border bg-background/50 p-2.5 text-sm">
                  {l}
                  <span className={`mt-2 block w-fit border px-1.5 font-mono text-[10px] uppercase ${chip[s!]}`}>{s}</span>
                </li>
              ))}
            </ul>
          </Panel>
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
