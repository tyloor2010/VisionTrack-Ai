import type { Alert, Case, Txt, Role } from "./store";

export type ReviewReason = "verified" | "wrong-person" | "wrong-clothing" | "bad-image" | "other";
export const REVIEW_REASONS: Record<ReviewReason, Txt> = {
  verified: { en: "Appearance and context verified", ar: "التحقق من المظهر والسياق" },
  "wrong-person": { en: "Wrong person", ar: "شخص مختلف" },
  "wrong-clothing": { en: "Wrong clothing", ar: "ملابس مختلفة" },
  "bad-image": { en: "Poor image quality", ar: "ضعف جودة الصورة" },
  other: { en: "Other", ar: "سبب آخر" },
};
export type Feedback = { alertId: string; decision: "confirmed" | "rejected"; reason: ReviewReason; at: number; role: Role };
export type ReportSchedule = { recipients: string; frequency: "daily" | "weekly"; format: "csv" | "json" | "pdf"; enabled: boolean };
export const DEFAULT_ANALYTICS = { threshold: 70, gapLimit: 15 };
export const DEFAULT_SCHEDULE: ReportSchedule = { recipients: "", frequency: "weekly", format: "csv", enabled: false };

export function inRange(at: number, start: string, end: string) {
  const from = start ? Date.parse(`${start}T00:00:00Z`) : -Infinity;
  const to = end ? Date.parse(`${end}T23:59:59.999Z`) : Infinity;
  return at >= from && at <= to;
}
export function previousRange(start: string, end: string) {
  const from = Date.parse(`${start}T00:00:00Z`), to = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) return null;
  const span = to - from + 86400000;
  return { start: new Date(from - span).toISOString().slice(0, 10), end: new Date(from - 86400000).toISOString().slice(0, 10) };
}
/** Seed truth is evaluation-only, never a real identity determination. */
export function qualityAt(alerts: Alert[], threshold: number) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const a of alerts) {
    if (a.conf >= threshold) { if (a.truth) tp++; else fp++; }
    else { if (a.truth) fn++; else tn++; }
  }
  return { tp, fp, tn, fn, precision: tp + fp ? tp / (tp + fp) * 100 : null, recall: tp + fn ? tp / (tp + fn) * 100 : null };
}
export function qualityGroups(alerts: Alert[], cases: Case[], threshold: number, dimension: "camera" | "age" | "time") {
  const groups = new Map<string, Alert[]>();
  for (const a of alerts) {
    const c = cases.find((x) => x.id === a.caseId);
    const hour = new Date(a.at).getUTCHours();
    const key = dimension === "camera" ? a.cam : dimension === "age" ? c?.profile ?? "unknown" : hour >= 6 && hour < 18 ? "day" : "night";
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  return [...groups].map(([key, rows]) => ({ key, rows, ...qualityAt(rows, threshold) }));
}
export function needsReview(values: (number | null)[], limit: number) {
  const usable = values.filter((v): v is number => v !== null);
  return usable.length >= 2 && Math.max(...usable) - Math.min(...usable) > limit;
}
export function alertsCsv(alerts: Alert[]) {
  return "alert_id,case_id,camera,confidence,state,time_utc\n" + alerts.map((a) => [a.id, a.caseId, a.cam, a.conf, a.state, new Date(a.at).toISOString()].join(",")).join("\n");
}