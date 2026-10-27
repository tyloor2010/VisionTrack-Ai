import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { btnClass } from "@/components/vt/ui";
export const Route = createFileRoute("/dashboard/model-card")({
  head: () => ({meta:[{title:"Model Card — VisionTrack AI v2"},{name:"description",content:"VisionTrack v2 demo model card: intended use, data placeholders, limitations, failure cases and human-review policy."},{property:"og:title",content:"Model Card — VisionTrack AI v2"},{property:"og:description",content:"Intended use and limits of the VisionTrack demonstration."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),
  component: ModelCard,
});
function ModelCard() {
  const { t } = useLang();
  const rows = [
    [t("Status","الحالة"),t("VisionTrack AI v2 · ITC 2027. Demonstration interface, not a validated or deployed identity model.","VisionTrack AI v2 · ITC 2027. واجهة تجريبية، وليست نموذجًا موثّقًا أو منشورًا للتحقق من الهوية.")],
    [t("Intended use","الاستخدام المقصود"),t("Help authorized missing-person search teams organize possible leads from street and aerial imagery for human review.","مساعدة فرق البحث المخوّلة في تنظيم القرائن المحتملة من صور الشوارع والتصوير الجوي لمراجعتها بشريًا.")],
    [t("Data and training","البيانات والتدريب"),t("Cases and evaluation truth labels are synthetic and deterministically seeded. Camera images are illustrative. No training dataset, provenance, consent record or independent benchmark has been supplied; these remain unverified.","الحالات وتسميات التقييم مصطنعة ومولّدة تجريبيًا، وصور الكاميرات توضيحية. لم تُقدَّم بيانات تدريب أو مصادرها أو سجلات موافقتها أو تقييمات مستقلة؛ ولذلك تبقى غير موثّقة.")],
    [t("Known failure cases","حالات الإخفاق المعروفة"),t("Low light, occlusion, small aerial subjects, lookalike clothing, motion blur and viewpoint changes can all produce wrong matches or missed detections.","الإضاءة الضعيفة وحجب الأشخاص وصغر حجمهم في التصوير الجوي وتشابه الملابس وضبابية الحركة وتغيّر زاوية الرؤية قد تؤدي إلى مطابقات خاطئة أو رصد ناقص.")],
    [t("Evaluation limits","حدود التقييم"),t("Threshold charts use seeded confidence and truth labels. Tiny group samples cannot establish fairness, accuracy or real-world recall. Reviewer agreement is separate from model precision.","تعتمد مخططات العتبة على نسب ثقة وتسميات تجريبية. العينات الصغيرة لا تثبت العدالة أو الدقة أو الاسترجاع الفعلي. اتفاق المراجعين مؤشر منفصل عن إحكام النموذج.")],
    [t("Human-review policy","سياسة المراجعة البشرية"),t("Potential match — requires human review. An authorized reviewer records a decision and reason. No autonomous identification, pursuit or enforcement; drone footage and patrol are demonstrations.","تطابق محتمل — يتطلب مراجعة بشرية. يسجّل مراجع مخوّل القرار وسببه. لا تحديد مستقل للهوية ولا ملاحقة ولا إجراءات تنفيذية آلية؛ التصوير الجوي والدورية للعرض التجريبي.")],
    [t("Feedback and updates","الملاحظات والتحديثات"),t("Confirm and reject reasons update demo reports and the activity log. They do not train a model or change operational thresholds automatically.","تُحدّث أسباب التأكيد والرفض التقارير التجريبية وسجل النشاط، ولا تدرّب نموذجًا ولا تغيّر عتبات التشغيل تلقائيًا.")],
  ];
  return <div className="mx-auto max-w-4xl p-4 sm:p-6"><h1 className="text-3xl font-bold">{t("VisionTrack AI v2 — Model card","VisionTrack AI v2 — بطاقة النموذج")}</h1><p className="mt-3 text-warning">{t("Demo documentation · ITC 2027","توثيق تجريبي · ITC 2027")}</p><dl className="mt-8">{rows.map(([h,p]) => <div key={h} className="border-t border-border py-6"><dt className="text-xl font-bold">{h}</dt><dd className="mt-3 leading-relaxed text-muted-foreground">{p}</dd></div>)}</dl><Link to="/dashboard/model-quality" className={btnClass("outline","sm")}>{t("Model quality","جودة النموذج")}</Link></div>;
}
