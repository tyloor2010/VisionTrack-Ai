import { useState } from "react";
import { Check, X } from "lucide-react";
import { Btn, inputClass } from "./ui";
import { useVT, can } from "@/lib/store";
import { REVIEW_REASONS, type ReviewReason } from "@/lib/analytics";
import { useLang } from "@/lib/i18n";

export function ReviewControls({ alertId }: { alertId: string }) {
  const { t, lang } = useLang();
  const role = useVT((s) => s.role);
  const [decision, setDecision] = useState<"confirmed" | "rejected" | null>(null);
  const [reason, setReason] = useState<ReviewReason>("verified");
  const allowed = can(role, "reviewAlert");
  return <>
    <span className="inline-flex gap-1">
      <Btn size="sm" variant="success" className="h-7 px-2" disabled={!allowed} aria-label={t("Confirm", "تأكيد")} title={t("Confirm", "تأكيد")} onClick={() => { setReason("verified"); setDecision("confirmed"); }}><Check className="h-3 w-3" /></Btn>
      <Btn size="sm" variant="ghost" className="h-7 border border-border px-2" disabled={!allowed} aria-label={t("Reject", "رفض")} title={t("Reject", "رفض")} onClick={() => { setReason("wrong-person"); setDecision("rejected"); }}><X className="h-3 w-3" /></Btn>
    </span>
    {decision && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-4">
      <div role="dialog" aria-modal="true" aria-label={t("Review decision", "قرار المراجعة")} className="w-full max-w-md rounded-sm border border-border bg-card p-5 text-start">
        <h2 className="text-xl font-bold">{t("Review decision", "قرار المراجعة")} · <span dir="ltr">{alertId}</span></h2>
        <label className="mt-4 block text-sm">{t("Reason", "السبب")}<select className={`${inputClass} mt-2`} value={reason} onChange={(e) => setReason(e.target.value as ReviewReason)}>{(Object.keys(REVIEW_REASONS) as ReviewReason[]).filter((r) => decision === "confirmed" ? r === "verified" || r === "other" : r !== "verified").map((r) => <option key={r} value={r}>{REVIEW_REASONS[r][lang]}</option>)}</select></label>
        <p className="mt-3 text-xs text-warning">{t("Potential match — requires human review.", "تطابق محتمل — يتطلب مراجعة بشرية.")}</p>
        <div className="mt-5 flex justify-end gap-2"><Btn variant="ghost" size="sm" onClick={() => setDecision(null)}>{t("Cancel", "إلغاء")}</Btn><Btn size="sm" onClick={() => { const s = useVT.getState(); if (decision === "confirmed") s.confirmAlert(alertId, reason); else s.rejectAlert(alertId, reason); setDecision(null); }}>{t("Save decision", "حفظ القرار")}</Btn></div>
      </div>
    </div>}
  </>;
}