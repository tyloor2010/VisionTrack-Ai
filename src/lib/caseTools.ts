import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haversineKm, type Case, type CaseStatus, type Role } from "@/lib/store";

/* ============ Pure logic (unit-tested) ============ */

export type PriorityFactor = { key: "age" | "condition" | "elapsed" | "night" | "weather"; points: number; en: string; ar: string };

/** Explainable 0–100 priority. Weather is a mock input (heat index). */
export function computePriority(c: Pick<Case, "age" | "profile" | "openedAt" | "resolvedAt">, now: number, weatherHot = true): { score: number; factors: PriorityFactor[] } {
  const f: PriorityFactor[] = [];
  const vulnerableAge = c.age < 12 || c.age >= 65;
  f.push({ key: "age", points: c.age < 12 ? 25 : c.age >= 65 ? 20 : 5, en: vulnerableAge ? `Vulnerable age (${c.age})` : `Adult (${c.age})`, ar: vulnerableAge ? `عمر حرج (${c.age})` : `بالغ (${c.age})` });
  f.push({ key: "condition", points: c.profile === "alzheimers" ? 20 : c.profile === "child" ? 10 : c.profile === "elderly" ? 10 : 0, en: "Medical condition / dependency", ar: "الحالة الصحية والاعتمادية" });
  const hours = Math.max(0, ((c.resolvedAt ?? now) - c.openedAt) / 3600000);
  f.push({ key: "elapsed", points: Math.min(30, Math.round(hours * 6)), en: `Elapsed time (${hours.toFixed(1)} h)`, ar: `الوقت المنقضي (${hours.toFixed(1)} ساعة)` });
  const hr = new Date(now).getHours();
  const night = hr >= 20 || hr < 6;
  f.push({ key: "night", points: night ? 10 : 0, en: night ? "Night time" : "Daytime", ar: night ? "فترة الليل" : "فترة النهار" });
  f.push({ key: "weather", points: weatherHot ? 10 : 0, en: weatherHot ? "Heat warning (mock)" : "Mild weather (mock)", ar: weatherHot ? "تحذير من الحرارة (افتراضي)" : "طقس معتدل (افتراضي)" });
  const score = Math.min(100, f.reduce((s, x) => s + x.points, 0));
  return { score, factors: f };
}

export const priorityBand = (s: number) => (s >= 70 ? "critical" : s >= 45 ? "high" : "normal");

/** Minutes allowed in each stage before the SLA is breached. */
export const SLA_MIN: Partial<Record<CaseStatus, number>> = { reported: 10, active: 30, potential: 10, review: 15, dispatched: 30 };

/** Remaining ms in the current stage (negative = breached); null when the stage has no SLA. */
export function slaRemaining(status: CaseStatus, stageStart: number, now: number): number | null {
  const lim = SLA_MIN[status];
  if (lim === undefined) return null;
  return stageStart + lim * 60000 - now;
}

/** Similarity 0–100 between two cases for duplicate detection. */
export function duplicateScore(a: Pick<Case, "name" | "age" | "profile" | "lastSeen" | "openedAt">, b: typeof a): number {
  let s = 0;
  if (a.name.en.trim().toLowerCase() === b.name.en.trim().toLowerCase()) s += 40;
  else if (a.name.en.split(" ")[0]!.toLowerCase() === b.name.en.split(" ")[0]!.toLowerCase()) s += 20;
  const dAge = Math.abs(a.age - b.age);
  s += dAge <= 1 ? 20 : dAge <= 3 ? 10 : 0;
  if (a.profile === b.profile) s += 10;
  const km = haversineKm(a.lastSeen, b.lastSeen);
  s += km < 0.5 ? 20 : km < 1.5 ? 10 : 0;
  s += Math.abs(a.openedAt - b.openedAt) < 6 * 3600000 ? 10 : 0;
  return Math.min(100, s);
}

export function extractMentions(text: string): string[] {
  return Array.from(new Set((text.match(/@([\p{L}\w-]+)/gu) ?? []).map((m) => m.slice(1))));
}

export type ShareLink = { id: string; caseId: string; created: number; expiresAt: number; maxViews: number; views: number; password: string; revoked: boolean; log: { at: number; ok: boolean; reason: string }[] };

/** Decide whether a share link may be opened; returns the reason when refused. */
export function checkShare(l: ShareLink, now: number, password: string): { ok: boolean; reason: "ok" | "revoked" | "expired" | "limit" | "password" } {
  if (l.revoked) return { ok: false, reason: "revoked" };
  if (now > l.expiresAt) return { ok: false, reason: "expired" };
  if (l.views >= l.maxViews) return { ok: false, reason: "limit" };
  if (l.password && l.password !== password) return { ok: false, reason: "password" };
  return { ok: true, reason: "ok" };
}

/* ============ Persisted store ============ */

export type CaseNote = { id: string; caseId: string; at: number; role: Role; text: string; pinned: boolean; attachment?: string | undefined };
export type RuleCond = "slaBreached" | "priorityAbove" | "openAlerts";
export type RuleAction = "notifySupervisor" | "raisePriority" | "notifyAll";
export type EscRule = { id: string; cond: RuleCond; value: number; action: RuleAction; enabled: boolean };
export type Handover = { id: string; at: number; by: Role; summary: string; ackBy?: Role | undefined; ackAt?: number | undefined };
export type WatchItem = { kind: "case" | "camera" | "vehicle"; id: string };

type S = {
  notes: CaseNote[];
  overrides: Record<string, { score: number; reason: string }>;
  rules: EscRule[];
  fired: string[];
  merged: Record<string, string>;
  handovers: Handover[];
  watch: WatchItem[];
  shares: ShareLink[];
  addNote: (n: Omit<CaseNote, "id" | "at" | "pinned">) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  setOverride: (caseId: string, v: { score: number; reason: string } | null) => void;
  addRule: (r: Omit<EscRule, "id" | "enabled">) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  markFired: (k: string) => void;
  merge: (dup: string, primary: string) => void;
  addHandover: (h: Omit<Handover, "id" | "at">) => void;
  ackHandover: (id: string, by: Role) => void;
  toggleWatch: (w: WatchItem) => void;
  addShare: (l: Omit<ShareLink, "id" | "created" | "views" | "revoked" | "log">) => ShareLink;
  openShare: (id: string, ok: boolean, reason: string) => void;
  revokeShare: (id: string) => void;
  resetTools: () => void;
};

const DEFAULT_RULES: EscRule[] = [
  { id: "R1", cond: "slaBreached", value: 0, action: "notifySupervisor", enabled: true },
  { id: "R2", cond: "priorityAbove", value: 80, action: "notifyAll", enabled: true },
];
const init = { notes: [], overrides: {}, rules: DEFAULT_RULES, fired: [], merged: {}, handovers: [], watch: [{ kind: "case" as const, id: "VT-2041" }], shares: [] };
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const useCaseTools = create<S>()(
  persist(
    (set) => ({
      ...init,
      addNote: (n) => set((s) => ({ notes: [{ ...n, id: uid("N"), at: Date.now(), pinned: false }, ...s.notes] })),
      togglePinNote: (id) => set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      setOverride: (caseId, v) => set((s) => { const o = { ...s.overrides }; if (v) o[caseId] = v; else delete o[caseId]; return { overrides: o }; }),
      addRule: (r) => set((s) => ({ rules: [...s.rules, { ...r, id: uid("R"), enabled: true }] })),
      toggleRule: (id) => set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),
      deleteRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      markFired: (k) => set((s) => ({ fired: [...s.fired, k].slice(-300) })),
      merge: (dup, primary) => set((s) => ({ merged: { ...s.merged, [dup]: primary } })),
      addHandover: (h) => set((s) => ({ handovers: [{ ...h, id: uid("H"), at: Date.now() }, ...s.handovers].slice(0, 20) })),
      ackHandover: (id, by) => set((s) => ({ handovers: s.handovers.map((h) => (h.id === id ? { ...h, ackBy: by, ackAt: Date.now() } : h)) })),
      toggleWatch: (w) => set((s) => ({ watch: s.watch.some((x) => x.kind === w.kind && x.id === w.id) ? s.watch.filter((x) => !(x.kind === w.kind && x.id === w.id)) : [...s.watch, w] })),
      addShare: (l) => { const link: ShareLink = { ...l, id: uid("SL"), created: Date.now(), views: 0, revoked: false, log: [] }; set((s) => ({ shares: [link, ...s.shares] })); return link; },
      openShare: (id, ok, reason) => set((s) => ({ shares: s.shares.map((l) => (l.id === id ? { ...l, views: l.views + (ok ? 1 : 0), log: [{ at: Date.now(), ok, reason }, ...l.log] } : l)) })),
      revokeShare: (id) => set((s) => ({ shares: s.shares.map((l) => (l.id === id ? { ...l, revoked: true } : l)) })),
      resetTools: () => set({ ...init }),
    }),
    { name: "vt-casetools-v1" },
  ),
);
