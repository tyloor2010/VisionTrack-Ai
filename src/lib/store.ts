import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import seedrandom from "seedrandom";
import { toast } from "sonner";
import { cameras as baseCams } from "@/data/mock";

/* ================= Types ================= */
export type Role = "field" | "investigator" | "supervisor" | "prosecutor" | "family";
export type Profile = "child" | "elderly" | "alzheimers" | "adult";
export type CaseStatus = "reported" | "active" | "potential" | "review" | "dispatched" | "resolved";
export type Txt = { en: string; ar: string };
export type GeoPos = { lat: number; lng: number };

export type TimelineEntry = { at: number; msg: Txt };
export type Case = {
  id: string; name: Txt; age: number; profile: Profile; status: CaseStatus;
  openedAt: number; firstMatchAt?: number | undefined; resolvedAt?: number | undefined;
  lastSeen: GeoPos; clothing: Txt; timeline: TimelineEntry[];
};
export type AlertState = "open" | "confirmed" | "rejected" | "dispatched";
export type Alert = { id: string; caseId: string; cam: string; conf: number; at: number; state: AlertState; truth: boolean };
export type Unit = { id: string; name: string; pos: GeoPos; busyWith?: string | undefined };
export type Agency = "police" | "traffic" | "ambulance" | "prosecution";
export type TaskCol = "todo" | "doing" | "done";
export type Task = { id: string; caseId: string; agency: Agency; title: Txt; col: TaskCol; at: number };
export type AuditEntry = { id: number; at: number; role: Role; action: string };
export type Note = { id: number; at: number; msg: Txt; kind: "alert" | "info" | "success" | "warning"; read: boolean };

export const ROLE_LABEL: Record<Role, Txt> = {
  field: { en: "Field officer", ar: "ضابط ميداني" },
  investigator: { en: "Investigator", ar: "محقّق" },
  supervisor: { en: "Supervisor", ar: "مشرف" },
  prosecutor: { en: "Prosecutor", ar: "وكيل النيابة" },
  family: { en: "Family member", ar: "أحد أفراد الأسرة" },
};
export const STATUS_LABEL: Record<CaseStatus, Txt> = {
  reported: { en: "Reported", ar: "مُبلَّغ عنها" },
  active: { en: "Active", ar: "نشطة" },
  potential: { en: "Potential match", ar: "تطابق محتمل" },
  review: { en: "Under review", ar: "قيد المراجعة" },
  dispatched: { en: "Dispatched", ar: "تم توجيه فريق" },
  resolved: { en: "Resolved", ar: "مُغلقة" },
};

/* ================= Rules (pure, tested) ================= */
/** Which roles may move a case from one status to another. */
export const TRANSITIONS: Partial<Record<CaseStatus, Partial<Record<CaseStatus, Role[]>>>> = {
  reported: { active: ["investigator", "supervisor"] },
  active: { potential: ["investigator", "supervisor"], resolved: ["supervisor"] },
  potential: { review: ["investigator", "supervisor", "field"], active: ["investigator", "supervisor"] },
  review: { dispatched: ["field", "supervisor"], active: ["investigator", "supervisor"] },
  dispatched: { resolved: ["supervisor", "field"] },
};
export function canTransition(from: CaseStatus, to: CaseStatus, role: Role): boolean {
  return TRANSITIONS[from]?.[to]?.includes(role) ?? false;
}
export const PERMS = {
  reviewAlert: ["investigator", "supervisor"] as Role[],
  dispatch: ["field", "supervisor"] as Role[],
  openCase: ["investigator", "supervisor", "field", "family"] as Role[],
};
export function can(role: Role, perm: keyof typeof PERMS) {
  return PERMS[perm].includes(role);
}

export function haversineKm(a: GeoPos, b: GeoPos) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** ETA in minutes at urban response speed (30 km/h) with a 2-minute floor. */
export const etaMin = (km: number) => Math.max(2, Math.round((km / 30) * 60));

export type Kpis = { precision: number | null; resolved: number; avgResponseMin: number | null; firstMatchMin: number | null; confirmed: number; rejected: number; open: number };
export function computeKpis(cases: Case[], alerts: Alert[]): Kpis {
  const confirmed = alerts.filter((a) => a.state === "confirmed" || a.state === "dispatched").length;
  const rejected = alerts.filter((a) => a.state === "rejected").length;
  const res = cases.filter((c) => c.resolvedAt);
  const fm = cases.filter((c) => c.firstMatchAt);
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const avg = mean(res.map((c) => (c.resolvedAt! - c.openedAt) / 60000));
  const first = mean(fm.map((c) => (c.firstMatchAt! - c.openedAt) / 60000));
  return {
    precision: confirmed + rejected ? confirmed / (confirmed + rejected) : null,
    resolved: res.length, avgResponseMin: avg, firstMatchMin: first, confirmed, rejected,
    open: alerts.filter((a) => a.state === "open").length,
  };
}

/* ================= Seed (deterministic) ================= */
const NAMES: Txt[] = "ABCDEFGHIJKL".split("").map((l, i) => ({ en: `Subject ${l}`, ar: `الحالة ${"أبجدهوزحطيكل"[i]}` }));
const CLOTHES: Txt[] = [
  { en: "Red hoodie, blue jeans", ar: "سترة حمراء، جينز أزرق" }, { en: "Grey coat, white cap", ar: "معطف رمادي، طاقية بيضاء" },
  { en: "Black jacket, backpack", ar: "سترة سوداء، حقيبة ظهر" }, { en: "Yellow T-shirt, shorts", ar: "قميص أصفر، سروال قصير" },
  { en: "Green galabeya", ar: "جلابية خضراء" }, { en: "White shirt, black trousers", ar: "قميص أبيض، بنطال أسود" },
];
const PROFILES: Profile[] = ["child", "elderly", "adult", "child", "alzheimers", "adult"];
const STATUSES: CaseStatus[] = ["active", "potential", "active", "resolved", "resolved", "review", "reported", "active", "dispatched", "resolved", "potential", "active"];

export function makeSeed(now: number) {
  const rng = seedrandom("visiontrack-v2");
  const pick = <T,>(xs: T[]) => xs[Math.floor(rng() * xs.length)]!;
  const cases: Case[] = STATUSES.map((status, i) => {
    const cam = baseCams[i % baseCams.length]!;
    const openedAt = now - Math.round((20 + rng() * 600) * 60000);
    const profile = PROFILES[i % PROFILES.length]!;
    const age = profile === "child" ? 5 + Math.floor(rng() * 8) : profile === "adult" ? 20 + Math.floor(rng() * 30) : 65 + Math.floor(rng() * 20);
    const c: Case = {
      id: `VT-${2041 - i}`, name: NAMES[i]!, age, profile, status, openedAt,
      lastSeen: { lat: cam.pos.lat + (rng() - 0.5) * 0.004, lng: cam.pos.lng + (rng() - 0.5) * 0.004 },
      clothing: pick(CLOTHES), timeline: [{ at: openedAt, msg: { en: "Case reported", ar: "تم تلقّي البلاغ" } }],
    };
    if (status !== "reported" && status !== "active") c.firstMatchAt = openedAt + Math.round((6 + rng() * 30) * 60000);
    if (status === "resolved") c.resolvedAt = (c.firstMatchAt ?? openedAt) + Math.round((10 + rng() * 40) * 60000);
    return c;
  });
  const alerts: Alert[] = [];
  let n = 0;
  cases.forEach((c) => {
    const k = c.status === "reported" ? 0 : 1 + Math.floor(rng() * 3);
    for (let j = 0; j < k; j++) {
      const conf = Math.round(45 + rng() * 50);
      const done = c.status === "resolved";
      const truth = rng() < conf / 100; // ground truth correlates with confidence
      alerts.push({
        id: `AL-${++n}`, caseId: c.id, cam: pick(baseCams).id, conf,
        at: (c.firstMatchAt ?? c.openedAt + 600000) + j * 240000,
        state: done ? (truth ? "confirmed" : "rejected") : c.status === "potential" || c.status === "active" ? "open" : truth ? "confirmed" : "rejected",
        truth,
      });
    }
  });
  const units: Unit[] = [
    { id: "U1", name: "Unit 1", pos: { lat: 30.047, lng: 31.238 } }, { id: "U2", name: "Unit 2", pos: { lat: 30.06, lng: 31.25 } },
    { id: "U3", name: "Unit 3", pos: { lat: 30.07, lng: 31.32 } }, { id: "K9", name: "K9", pos: { lat: 30.041, lng: 31.226 } },
    { id: "D1", name: "Drone 1", pos: { lat: 30.05, lng: 31.245 } }, { id: "AMB", name: "Ambulance 4", pos: { lat: 30.055, lng: 31.23 } },
  ];
  const tasks: Task[] = [
    { id: "T1", caseId: cases[0]!.id, agency: "police", title: { en: "Sweep sector B", ar: "تمشيط القطاع B" }, col: "doing", at: now },
    { id: "T2", caseId: cases[0]!.id, agency: "traffic", title: { en: "Checkpoint on Ramses St.", ar: "نقطة تفتيش بشارع رمسيس" }, col: "todo", at: now },
    { id: "T3", caseId: cases[2]!.id, agency: "prosecution", title: { en: "Telecom order request", ar: "طلب أمر الاتصالات" }, col: "done", at: now },
  ];
  return { cases, alerts, units, tasks };
}

/* ================= Store ================= */
type Data = ReturnType<typeof makeSeed> & { audit: AuditEntry[]; notes: Note[]; role: Role; seq: number };
type Actions = {
  setRole: (r: Role) => void;
  reset: () => void;
  /** Event bus: one call updates audit log, notification center, toast and the case timeline. */
  emit: (e: { action: string; msg: Txt; kind?: Note["kind"]; caseId?: string }) => void;
  transition: (caseId: string, to: CaseStatus) => boolean;
  confirmAlert: (id: string) => void;
  rejectAlert: (id: string) => void;
  dispatch: (caseId: string, alertId?: string) => void;
  moveTask: (id: string, col: TaskCol) => void;
  markAllRead: () => void;
};

const fresh = (): Data => ({ ...makeSeed(Date.now()), audit: [], notes: [], role: "supervisor", seq: 1 });
let langRef: "en" | "ar" = "en";
export const setStoreLang = (l: "en" | "ar") => { langRef = l; };
const deny = (msg: Txt) => { toast.error(msg[langRef]); return false; };

export const useVT = create<Data & Actions>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setRole: (role) => { set({ role }); get().emit({ action: `ROLE switched to ${role}`, msg: { en: `Now acting as ${ROLE_LABEL[role].en}`, ar: `الدور الحالي: ${ROLE_LABEL[role].ar}` } }); },
      reset: () => { set(fresh()); toast.success(langRef === "ar" ? "أُعيد ضبط البيانات التجريبية" : "Demo data reset"); },
      emit: ({ action, msg, kind = "info", caseId }) => {
        const s = get(); const at = Date.now();
        set({
          seq: s.seq + 1,
          audit: [{ id: s.seq, at, role: s.role, action: caseId ? `${action} [${caseId}]` : action }, ...s.audit].slice(0, 400),
          notes: [{ id: s.seq, at, msg, kind, read: false }, ...s.notes].slice(0, 100),
          cases: caseId ? s.cases.map((c) => (c.id === caseId ? { ...c, timeline: [...c.timeline, { at, msg }] } : c)) : s.cases,
        });
        const t = msg[langRef];
        if (kind === "alert" || kind === "warning") toast.warning(t); else if (kind === "success") toast.success(t); else toast(t);
      },
      transition: (caseId, to) => {
        const s = get(); const c = s.cases.find((x) => x.id === caseId);
        if (!c) return false;
        if (!canTransition(c.status, to, s.role))
          return deny({ en: `${ROLE_LABEL[s.role].en} cannot move a case from "${STATUS_LABEL[c.status].en}" to "${STATUS_LABEL[to].en}".`, ar: `لا يملك ${ROLE_LABEL[s.role].ar} نقل الحالة من «${STATUS_LABEL[c.status].ar}» إلى «${STATUS_LABEL[to].ar}».` });
        const at = Date.now();
        set({ cases: s.cases.map((x) => (x.id === caseId ? { ...x, status: to, resolvedAt: to === "resolved" ? at : x.resolvedAt, firstMatchAt: to === "potential" ? x.firstMatchAt ?? at : x.firstMatchAt } : x)),
          units: to === "resolved" ? s.units.map((u) => (u.busyWith === caseId ? { ...u, busyWith: undefined } : u)) : s.units });
        get().emit({ action: `STATUS ${c.status} -> ${to}`, msg: { en: `${caseId}: ${STATUS_LABEL[to].en}`, ar: `${caseId}: ${STATUS_LABEL[to].ar}` }, kind: to === "resolved" ? "success" : "info", caseId });
        return true;
      },
      confirmAlert: (id) => {
        const s = get(); const a = s.alerts.find((x) => x.id === id);
        if (!a || a.state !== "open") return;
        if (!can(s.role, "reviewAlert")) { deny({ en: "Only an investigator or supervisor can confirm a potential match.", ar: "لا يملك تأكيد التطابق المحتمل إلا المحقّق أو المشرف." }); return; }
        set({
          alerts: s.alerts.map((x) => (x.id === id ? { ...x, state: "confirmed" } : x)),
          cases: s.cases.map((c) => (c.id === a.caseId && (c.status === "potential" || c.status === "active") ? { ...c, status: "review", firstMatchAt: c.firstMatchAt ?? Date.now() } : c)),
          tasks: [{ id: `T${s.seq}`, caseId: a.caseId, agency: "police", title: { en: `Verify sighting at ${a.cam}`, ar: `التحقق من الرصد عند ${a.cam}` }, col: "todo", at: Date.now() }, ...s.tasks],
        });
        get().emit({ action: `CONFIRMED alert ${id} ${a.cam} ${a.conf}%`, msg: { en: `Potential match confirmed by reviewer — task sent to Police`, ar: "أكّد المراجِع التطابق المحتمل — أُرسلت مهمة إلى الشرطة" }, kind: "success", caseId: a.caseId });
      },
      rejectAlert: (id) => {
        const s = get(); const a = s.alerts.find((x) => x.id === id);
        if (!a || a.state !== "open") return;
        if (!can(s.role, "reviewAlert")) { deny({ en: "Only an investigator or supervisor can reject a potential match.", ar: "لا يملك رفض التطابق المحتمل إلا المحقّق أو المشرف." }); return; }
        const alerts = s.alerts.map((x) => (x.id === id ? { ...x, state: "rejected" as const } : x));
        const stillOpen = alerts.some((x) => x.caseId === a.caseId && x.state === "open");
        set({ alerts, cases: s.cases.map((c) => (c.id === a.caseId && c.status === "potential" && !stillOpen ? { ...c, status: "active" } : c)) });
        get().emit({ action: `REJECTED alert ${id} (false positive)`, msg: { en: "Marked as false positive — precision updated", ar: "سُجّل كإيجابي كاذب — تم تحديث دقة التنبيهات" }, kind: "warning", caseId: a.caseId });
      },
      dispatch: (caseId, alertId) => {
        const s = get(); const c = s.cases.find((x) => x.id === caseId);
        if (!c) return;
        if (!can(s.role, "dispatch")) { deny({ en: "Only a field officer or supervisor can dispatch a unit.", ar: "لا يملك توجيه الفرق إلا الضابط الميداني أو المشرف." }); return; }
        const free = s.units.filter((u) => !u.busyWith).map((u) => ({ u, km: haversineKm(u.pos, c.lastSeen) })).sort((a, b) => a.km - b.km)[0];
        if (!free) { deny({ en: "No unit available — all units are assigned.", ar: "لا توجد فرق متاحة — جميع الفرق مكلّفة." }); return; }
        const eta = etaMin(free.km);
        set({
          units: s.units.map((u) => (u.id === free.u.id ? { ...u, busyWith: caseId } : u)),
          alerts: alertId ? s.alerts.map((x) => (x.id === alertId ? { ...x, state: "dispatched" } : x)) : s.alerts,
          cases: s.cases.map((x) => (x.id === caseId && x.status !== "resolved" ? { ...x, status: "dispatched", firstMatchAt: x.firstMatchAt ?? Date.now() } : x)),
          tasks: [{ id: `T${s.seq}`, caseId, agency: "police", title: { en: `${free.u.name} en route — ETA ${eta} min`, ar: `${free.u.name} في الطريق — الوصول خلال ${eta} د` }, col: "doing", at: Date.now() }, ...s.tasks],
        });
        get().emit({ action: `DISPATCHED ${free.u.name} (${free.km.toFixed(1)} km, ETA ${eta}m)`, msg: { en: `${free.u.name} dispatched — ${free.km.toFixed(1)} km, ETA ${eta} min`, ar: `توجيه ${free.u.name} — ${free.km.toFixed(1)} كم، الوصول خلال ${eta} د` }, kind: "alert", caseId });
      },
      moveTask: (id, col) => {
        const s = get(); const tk = s.tasks.find((x) => x.id === id);
        if (!tk || tk.col === col) return;
        set({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, col } : x)) });
        const cl: Record<TaskCol, Txt> = { todo: { en: "To do", ar: "قيد الانتظار" }, doing: { en: "In progress", ar: "قيد التنفيذ" }, done: { en: "Done", ar: "منجزة" } };
        get().emit({ action: `TASK ${id} -> ${col}`, msg: { en: `Task "${tk.title.en}" → ${cl[col].en}`, ar: `المهمة «${tk.title.ar}» ← ${cl[col].ar}` }, caseId: tk.caseId });
      },
      markAllRead: () => set((s) => ({ notes: s.notes.map((n) => ({ ...n, read: true })) })),
    }),
    { name: "vt-store-v1", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
