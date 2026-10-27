import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, RotateCcw, CalendarClock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Btn, Panel, inputClass, btnClass } from "./ui";
import { ReviewControls } from "./ReviewControls";
import { useLang } from "@/lib/i18n";
import { useVT, computeKpis, can, type Alert } from "@/lib/store";
import { DEFAULT_ANALYTICS, DEFAULT_SCHEDULE, REVIEW_REASONS, alertsCsv, inRange, previousRange, qualityAt, qualityGroups, needsReview, type ReportSchedule } from "@/lib/analytics";
import { cameras } from "@/data/mock";

export function Analytics({ quality = false }: { quality?: boolean }) {
  const { t, lang } = useLang();
  const s = useVT();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [compare, setCompare] = useState(false);
  const [drill, setDrill] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ReportSchedule>(s.reportSchedule);
  const { threshold, gapLimit } = s.analyticsSettings;
  const alerts = useMemo(() => s.alerts.filter((a) => inRange(a.at,start,end)), [s.alerts,start,end]);
  const cases = s.cases.filter((c) => inRange(c.openedAt,start,end));
  const k = computeKpis(cases,alerts), q = qualityAt(alerts,threshold);
  const previous = previousRange(start,end);
  const prevAlerts = previous ? s.alerts.filter((a) => inRange(a.at,previous.start,previous.end)) : [];
  const curve = useMemo(() => Array.from({length:11},(_,i) => ({ threshold:i*10, ...qualityAt(alerts,i*10) })), [alerts]);
  const cameraGroups = qualityGroups(alerts,s.cases,threshold,"camera"), ageGroups = qualityGroups(alerts,s.cases,threshold,"age"), timeGroups = qualityGroups(alerts,s.cases,threshold,"time");
  const pct = (v: number | null) => v === null ? "—" : `${v.toFixed(1)}%`;
  const groupLabel = (key: string) => ({ child:t("Children","الأطفال"),elderly:t("Older adults","كبار السن"),adult:t("Adults","البالغون"),alzheimers:t("Alzheimer's","الزهايمر"),day:t("Day (UTC)","النهار (UTC)"),night:t("Night (UTC)","الليل (UTC)"),unknown:t("Unknown","غير معروف") }[key] ?? key);
  const exportData = (format: "csv" | "json" | "pdf") => {
    if (format === "pdf") window.print();
    else {
      const data = format === "csv" ? alertsCsv(alerts) : JSON.stringify({ demo:true, range:{start,end}, evaluationThreshold:threshold, quality:q, alerts, feedback:s.feedback.filter((f) => alerts.some((a) => a.id === f.alertId)) },null,2);
      const url = URL.createObjectURL(new Blob([data],{type:format === "csv" ? "text/csv;charset=utf-8" : "application/json"}));
      const a = document.createElement("a"); a.href=url; a.download=`visiontrack-demo-report.${format}`; a.click(); URL.revokeObjectURL(url);
    }
    s.emit({ action:`REPORT exported ${format}`,msg:{en:"Demo report exported",ar:"صُدّر التقرير التجريبي"},quiet:true });
  };
  const selectWeek = () => {
    const now = new Date(); const last = now.toISOString().slice(0,10); now.setUTCDate(now.getUTCDate()-6);
    setStart(now.toISOString().slice(0,10)); setEnd(last); setCompare(true); setDrill(null);
  };
  const filteredRows = alerts.filter((a) => {
    if (!drill || drill === "all") return true;
    if (drill === "confirmed") return a.state === "confirmed" || a.state === "dispatched";
    if (drill === "rejected" || drill === "open") return a.state === drill;
    if (drill === "tp") return a.conf >= threshold && a.truth;
    if (drill === "fp") return a.conf >= threshold && !a.truth;
    if (drill === "tn") return a.conf < threshold && !a.truth;
    if (drill === "fn") return a.conf < threshold && a.truth;
    return a.cam === drill || (s.cases.find((c) => c.id === a.caseId)?.profile === drill) || (drill === "day" ? new Date(a.at).getUTCHours() >= 6 && new Date(a.at).getUTCHours() < 18 : drill === "night" ? new Date(a.at).getUTCHours() < 6 || new Date(a.at).getUTCHours() >= 18 : false);
  });
  const table = (rows: ReturnType<typeof qualityGroups>) => <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="p-3 text-start">{t("Group","الفئة")}</th><th>{t("Samples","العينات")}</th><th>{t("Precision","الإحكام")}</th><th>{t("Recall","الاسترجاع")}</th></tr></thead><tbody>{rows.map((g) => <tr key={g.key} className="border-t border-border"><td className="p-3"><Btn size="sm" variant="ghost" className="h-auto whitespace-normal px-0 text-start" onClick={() => setDrill(g.key)}>{groupLabel(g.key)}</Btn></td><td className="text-center">{g.rows.length}</td><td className="text-center">{pct(g.precision)}</td><td className="text-center">{pct(g.recall)}</td></tr>)}</tbody></table>{!rows.length && <p className="p-4 text-sm text-muted-foreground">{t("No samples in this range.","لا عينات ضمن هذه الفترة.")}</p>}</div>;
  return <div className="analytics-print space-y-6 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">{quality ? t("Model quality","جودة النموذج") : t("Analytics & reports","التحليلات والتقارير")}</h1><Link className={btnClass("outline","sm")} to={quality ? "/dashboard/analytics" : "/dashboard/model-quality"}>{quality ? t("Analytics","التحليلات") : t("Model quality","جودة النموذج")}</Link></div>
    <p className="border-s-2 border-warning ps-3 text-sm text-warning">{t("Seeded demo evaluation — not measured model performance. Potential match — requires human review.","تقييم ببيانات تجريبية، وليس قياسًا فعليًا لأداء النموذج. تطابق محتمل — يتطلب مراجعة بشرية.")}</p>
    <div className="flex flex-wrap items-end gap-3 border-y border-border py-4 print:hidden">
      <label className="text-xs">{t("From (UTC)","من (UTC)")}<input type="date" className={`${inputClass} mt-1`} value={start} max={end || undefined} onChange={(e) => {setStart(e.target.value);setDrill(null);}} /></label>
      <label className="text-xs">{t("To (UTC)","إلى (UTC)")}<input type="date" className={`${inputClass} mt-1`} value={end} min={start || undefined} onChange={(e) => {setEnd(e.target.value);setDrill(null);}} /></label>
      <Btn size="sm" variant="outline" onClick={selectWeek}>{t("This week vs last","هذا الأسبوع مقابل السابق")}</Btn>
      <label className="flex h-8 items-center gap-2 text-xs"><input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />{t("Compare equal periods","مقارنة فترتين متساويتين")}</label>
      <Btn size="sm" variant="ghost" aria-label={t("Reset filters","إعادة ضبط المرشحات")} title={t("Reset filters","إعادة ضبط المرشحات")} onClick={() => {setStart("");setEnd("");setCompare(false);setDrill(null);}}><RotateCcw className="h-4 w-4" /></Btn>
      <div className="flex flex-wrap gap-1">{(["csv","json","pdf"] as const).map((f) => <Btn key={f} size="sm" variant="ghost" onClick={() => exportData(f)}><Download className="h-3 w-3" />{f.toUpperCase()}</Btn>)}</div>
    </div>
    {compare && <p className="text-sm text-muted-foreground">{previous ? `${t("Current / previous alert count","عدد التنبيهات الحالي / السابق")}: ${alerts.length} / ${prevAlerts.length} · ${previous.start} → ${previous.end}` : t("Choose both dates to compare equal periods.","اختر تاريخَي البداية والنهاية لمقارنة فترتين متساويتين.")}</p>}
    {!quality && <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        [t("Reviewed precision","دقة التنبيهات المُراجَعة"),pct(k.precision === null ? null : k.precision*100),"confirmed"],
        [t("Confirmed","مؤكدة"),String(k.confirmed),"confirmed"], [t("Rejected","مرفوضة"),String(k.rejected),"rejected"], [t("Pending review","بانتظار المراجعة"),String(k.open),"open"],
      ].map(([l,v,key]) => <Panel key={l} className="p-4"><p className="text-xs text-muted-foreground">{l}</p><Btn variant="ghost" className="mt-2 h-auto px-0 text-3xl text-primary" onClick={() => setDrill(key)}>{v}</Btn></Panel>)}</div>
      <div className="flex flex-wrap gap-8 border-y border-border py-5"><p>{t("Resolved cases","الحالات المغلقة")}: <strong className="text-primary">{k.resolved} / {cases.length}</strong></p><p>{t("Average first match","متوسط زمن أول تطابق")}: <strong className="text-primary">{k.firstMatchMin === null ? "—" : `${Math.round(k.firstMatchMin)} ${t("min","دقيقة")}`}</strong></p><p>{t("Average resolution time","متوسط زمن إغلاق الحالة")}: <strong className="text-primary">{k.avgResponseMin === null ? "—" : `${Math.round(k.avgResponseMin)} ${t("min","دقيقة")}`}</strong></p></div>
    </>}
    {quality && <>
      <div className="flex flex-wrap items-center gap-5 border-b border-border pb-5">
        <label className="text-sm">{t("Evaluation threshold","عتبة التقييم")} <strong className="text-primary">{threshold}%</strong><input aria-label={t("Evaluation threshold","عتبة التقييم")} type="range" min="0" max="100" value={threshold} disabled={!can(s.role,"reviewAlert")} onChange={(e) => s.setAnalyticsSettings({...s.analyticsSettings,threshold:Number(e.target.value)})} className="mt-2 block w-56 accent-[var(--primary)]" /></label>
        <label className="text-sm">{t("Review gap limit (percentage points)","حد الفارق للمراجعة (نقاط مئوية)")}<input aria-label={t("Review gap limit","حد الفارق للمراجعة")} type="number" min="0" max="100" value={gapLimit} disabled={!can(s.role,"reviewAlert")} onChange={(e) => s.setAnalyticsSettings({...s.analyticsSettings,gapLimit:Number(e.target.value)})} className={`${inputClass} mt-1 max-w-24`} /></label>
        <Btn size="sm" variant="ghost" disabled={!can(s.role,"reviewAlert")} onClick={() => s.setAnalyticsSettings({...DEFAULT_ANALYTICS})}><RotateCcw className="h-4 w-4" />{t("Reset","إعادة ضبط")}</Btn>
      </div>
      <div className="grid gap-4 xl:grid-cols-2"><Panel title={t("Precision / recall vs threshold","الإحكام والاسترجاع مقابل العتبة")}><div dir="ltr" className="h-72 p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={curve} onClick={(data) => { if (data?.activeLabel != null && can(s.role,"reviewAlert")) {s.setAnalyticsSettings({...s.analyticsSettings,threshold:Number(data.activeLabel)});setDrill("all");} }}><XAxis dataKey="threshold" tick={{fill:"var(--muted-foreground)",fontSize:11}} /><YAxis domain={[0,100]} tick={{fill:"var(--muted-foreground)",fontSize:11}} /><Tooltip /><Line dataKey="precision" name={t("Precision","الإحكام")} stroke="var(--primary)" connectNulls={false} /><Line dataKey="recall" name={t("Recall","الاسترجاع")} stroke="var(--det-cyan)" connectNulls={false} /></LineChart></ResponsiveContainer></div></Panel>
      <Panel title={t("Confusion matrix — seeded truth","مصفوفة الالتباس — الحقيقة التجريبية")}><div className="grid grid-cols-2 gap-3 p-4">{(["tp","fp","fn","tn"] as const).map((key) => <Btn key={key} variant="outline" className="h-24 flex-col text-sm" onClick={() => setDrill(key)}><span>{({tp:t("True positive","إيجابي صحيح"),fp:t("False positive","إيجابي كاذب"),fn:t("False negative","سلبي كاذب"),tn:t("True negative","سلبي صحيح")})[key]}</span><strong className="text-3xl">{q[key]}</strong></Btn>)}</div><p className="p-4 pt-0 text-xs text-muted-foreground">{t("A threshold experiment on seeded labels; changing it does not alter live alert rules or retrain a model.","تجربة للعتبة على تسميات تجريبية؛ تغييرها لا يعدّل قواعد التنبيه ولا يعيد تدريب نموذج.")}</p></Panel></div>
      {needsReview(ageGroups.map((g) => g.precision),gapLimit) && <p className="border-s-2 border-det-red ps-3 text-sm text-det-red">{t("Needs review: age-group precision gap exceeds the selected limit. Small demo samples are not evidence of validated fairness.","تحتاج إلى مراجعة: فارق الإحكام بين الفئات العمرية يتجاوز الحد المحدد. العينات التجريبية الصغيرة لا تثبت عدالة النموذج.")}</p>}
      <div className="grid gap-4 xl:grid-cols-3"><Panel title={t("By camera","حسب الكاميرا")}>{table(cameraGroups)}</Panel><Panel title={t("By age group","حسب الفئة العمرية")}>{table(ageGroups)}</Panel><Panel title={t("By time of day","حسب وقت اليوم")}>{table(timeGroups)}</Panel></div>
      <h2 className="text-xl font-bold">{t("False-positive examples","أمثلة الإيجابيات الكاذبة")}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{alerts.filter((a) => a.conf >= threshold && !a.truth).slice(0,6).map((a) => <Panel key={a.id}><img src={cameras.find((c) => c.id === a.cam)?.img} alt={t("Illustrative camera scene, not a verified event crop","مشهد كاميرا توضيحي، وليس لقطة موثّقة للحدث")} loading="lazy" className="aspect-video w-full object-cover" /><div className="p-3 text-xs"><p dir="ltr" className="font-mono text-warning">{a.id} · {a.cam} · {a.conf}%</p><p className="my-2 text-muted-foreground">{t("Illustrative image; seeded false-positive label.","صورة توضيحية؛ تصنيف تجريبي لإيجابي كاذب.")}</p><Btn size="sm" variant="ghost" onClick={() => setDrill("fp")}>{t("View records","عرض السجلات")}</Btn></div></Panel>)}</div>
      <Link to="/dashboard/model-card" className={btnClass("outline","sm")}>{t("Read the model card","قراءة بطاقة النموذج")}</Link>
    </>}
    <section className="border-t border-border pt-5"><h2 className="text-xl font-bold">{t("Rejection reasons","أسباب الرفض")}</h2><ul className="mt-3 space-y-2">{Object.entries(REVIEW_REASONS).filter(([key]) => key !== "verified").map(([key,label]) => <li key={key} className="flex max-w-lg justify-between border-b border-border py-2 text-sm"><span>{label[lang]}</span><strong className="text-primary">{s.feedback.filter((f) => f.decision === "rejected" && f.reason === key && alerts.some((a) => a.id === f.alertId)).length}</strong></li>)}</ul></section>
    <section className="border-t border-border pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{t("Underlying alert records","سجلات التنبيهات الأساسية")} · {filteredRows.length}</h2>{drill && <Btn size="sm" variant="ghost" onClick={() => setDrill(null)}>{t("Show all","عرض الكل")}</Btn>}</div><ul className="mt-3 max-h-96 overflow-auto divide-y divide-border">{filteredRows.map((a: Alert) => <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><Link to="/dashboard/case/$id" params={{id:a.caseId}} className="font-mono text-primary">{a.id} · {a.caseId}</Link><p className="mt-1 text-xs text-muted-foreground">{a.cam} · {a.conf}% · {new Date(a.at).toISOString().slice(0,16)} UTC</p><p className="text-xs text-warning">{t("Potential match — requires human review","تطابق محتمل — يتطلب مراجعة بشرية")}</p></div>{a.state === "open" ? <ReviewControls alertId={a.id} /> : <span className="text-xs text-muted-foreground">{a.state === "rejected" ? t("Rejected","مرفوض") : t("Reviewed","تمت المراجعة")}</span>}</li>)}{!filteredRows.length && <li className="py-6 text-sm text-muted-foreground">{t("No records match this selection.","لا سجلات تطابق هذا الاختيار.")}</li>}</ul></section>
    {!quality && <section className="border-t border-border pt-5 print:hidden"><h2 className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5 text-primary" />{t("Scheduled report — demo","تقرير مجدول — تجريبي")}</h2><form className="mt-4 grid max-w-3xl gap-3 sm:grid-cols-2" onSubmit={(e) => {e.preventDefault();s.setReportSchedule(schedule);}}>
      <label className="text-sm sm:col-span-2">{t("Recipients (comma-separated)","المستلمون (مفصولون بفواصل)")}<input className={`${inputClass} mt-1`} value={schedule.recipients} onChange={(e) => setSchedule({...schedule,recipients:e.target.value})} disabled={s.role !== "supervisor"} /></label>
      <label className="text-sm">{t("Frequency","التكرار")}<select className={`${inputClass} mt-1`} disabled={s.role !== "supervisor"} value={schedule.frequency} onChange={(e) => setSchedule({...schedule,frequency:e.target.value as ReportSchedule["frequency"]})}><option value="daily">{t("Daily","يوميًا")}</option><option value="weekly">{t("Weekly","أسبوعيًا")}</option></select></label>
      <label className="text-sm">{t("Format","الصيغة")}<select className={`${inputClass} mt-1`} disabled={s.role !== "supervisor"} value={schedule.format} onChange={(e) => setSchedule({...schedule,format:e.target.value as ReportSchedule["format"]})}>{["csv","json","pdf"].map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={s.role !== "supervisor"} checked={schedule.enabled} onChange={(e) => setSchedule({...schedule,enabled:e.target.checked})} />{t("Enable demo schedule","تفعيل الجدول التجريبي")}</label><div className="flex gap-2"><Btn size="sm" disabled={s.role !== "supervisor"} type="submit">{t("Save schedule","حفظ الجدول")}</Btn><Btn size="sm" variant="ghost" type="button" disabled={s.role !== "supervisor"} onClick={() => {setSchedule({...DEFAULT_SCHEDULE});s.setReportSchedule({...DEFAULT_SCHEDULE});}}><RotateCcw className="h-4 w-4" />{t("Reset","إعادة ضبط")}</Btn></div>
    </form><p className="mt-3 text-xs text-muted-foreground">{s.reportSchedule.enabled ? t("Saved as enabled. No emails are sent; no background scheduler is connected.","حُفظ الجدول مفعّلًا. لا تُرسل رسائل ولا توجد خدمة جدولة فعلية.") : t("Schedule disabled. Supervisor only. No emails are sent.","الجدول غير مفعّل. للمشرف فقط. لا تُرسل رسائل فعلية.")}</p></section>}
  </div>;
}
