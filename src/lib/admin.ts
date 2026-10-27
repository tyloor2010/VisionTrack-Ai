import type { Role, Txt } from "./store";

export const ROLES: Role[] = ["field", "investigator", "supervisor", "prosecutor", "family"];
export const RIGHTS = ["review", "dispatch", "governance"] as const;
export type Right = typeof RIGHTS[number];
export type DemoUser = { id: string; name: string; role: Role; enabled: boolean; mfa: boolean; lastLogin: number; sessions: string[] };
export type Connection = { id: string; label: Txt; connected: boolean; lastSync: number | null };
export type DemoKey = { id: string; label: string; scopes: string[]; expires: number; revoked: boolean };
export type Hook = { id: string; url: string; events: string[]; enabled: boolean };
export type Policy = { days: number; hold: boolean };
export type Consent = { id: string; person: Txt; granted: boolean; dataPresent: boolean; at: number };
export type Journal = { id: number; at: number; role: Role; action: string; previous: string; hash: string };
export type AdminData = {
  users: DemoUser[]; matrix: Record<Role, Right[]>; proposal: { matrix: Record<Role, Right[]>; by: Role } | null;
  connections: Connection[]; keys: DemoKey[]; hooks: Hook[]; delivery: { id: number; at: number; target: string; result: Txt }[];
  policies: Record<"child" | "elderly" | "alzheimers" | "adult", Policy>; consents: Consent[];
  requests: { id: number; person: string; type: "access" | "delete"; at: number; state: "pending" | "completed" }[]; journal: Journal[];
};
const EPOCH = Date.UTC(2027, 3, 15, 12);
export function freshAdmin(): AdminData {
  return {
    users: ROLES.map((role, i) => ({ id: `DEMO-U${i + 1}`, name: `Demo ${i + 1}`, role, enabled: true, mfa: i < 4, lastLogin: EPOCH - i * 3600000, sessions: [`DEMO-S${i + 1}`] })),
    matrix: { field: ["dispatch"], investigator: ["review"], supervisor: ["review", "dispatch", "governance"], prosecutor: [], family: [] }, proposal: null,
    connections: [
      ["cad", "Emergency CAD", "نظام تنسيق الطوارئ"], ["hospital", "Hospital network", "شبكة المستشفيات"],
      ["transport", "Transport authorities", "جهات النقل"], ["telecom", "Lawful telecom gateway", "بوابة الاتصالات بإذن قانوني"],
      ["rides", "Ride-hailing partners", "شركاء النقل التشاركي"], ["weather", "Weather service", "خدمة الطقس"], ["public", "Public alert gateway", "بوابة التنبيهات العامة"],
    ].map(([id = "", en = "", ar = ""]) => ({ id, label: { en, ar }, connected: false, lastSync: null })),
    keys: [], hooks: [], delivery: [], policies: { child: { days: 30, hold: false }, elderly: { days: 30, hold: false }, alzheimers: { days: 30, hold: false }, adult: { days: 30, hold: false } },
    consents: [{ id: "CONSENT-1", person: { en: "Demo family A", ar: "الأسرة التجريبية أ" }, granted: true, dataPresent: true, at: EPOCH }], requests: [], journal: [],
  };
}
/** Non-cryptographic demo checksum, not a tamper-proof or legal audit guarantee. */
export function checksum(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}
export function verifyJournal(rows: Journal[]): boolean {
  let previous = "GENESIS";
  return rows.every(({ hash, ...entry }) => { const valid = entry.previous === previous && checksum(JSON.stringify(entry)) === hash; previous = hash; return valid; });
}
export function retentionPreview(openedAt: number, policy: Policy, now: number) {
  const expires = openedAt + policy.days * 86400000;
  return { expires, remainingDays: Math.max(0, Math.ceil((expires - now) / 86400000)), eligible: !policy.hold && now >= expires };
}
export function safeHook(url: string) {
  try { const u = new URL(url); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}
export type AdminAction =
  | { type: "user-add"; name: string; role: Role }
  | { type: "user-toggle" | "session-revoke"; id: string }
  | { type: "user-role"; id: string; role: Role }
  | { type: "matrix-propose"; matrix: Record<Role, Right[]> }
  | { type: "matrix-approve" | "matrix-reject" | "reset" }
  | { type: "connection-toggle" | "connection-test"; id: string }
  | { type: "key-add"; label: string; scopes: string[]; days: number }
  | { type: "key-revoke" | "hook-toggle" | "hook-test"; id: string }
  | { type: "hook-add"; url: string; events: string[] }
  | { type: "policy"; profile: keyof AdminData["policies"]; policy: Policy }
  | { type: "consent-withdraw"; id: string }
  | { type: "request"; person: string; requestType: "access" | "delete" }
  | { type: "request-complete"; id: number }
  | { type: "audit-export" };
export function reduceAdmin(data: AdminData, action: AdminAction, role: Role, now: number): { data: AdminData; ok: boolean; msg: Txt } {
  const result = (ok: boolean, en: string, ar: string) => ({ data, ok, msg: { en, ar } });
  const matrixProposal = action.type === "matrix-propose" && role === "investigator";
  const subjectRequest = action.type === "request" && role === "family";
  if (role !== "supervisor" && !matrixProposal && !subjectRequest) return result(false, "This demo action requires a supervisor.", "يتطلب هذا الإجراء التجريبي دور المشرف.");
  data = structuredClone(data);
  const id = `DEMO-${now}-${data.journal.length}`;
  switch (action.type) {
    case "user-add":
      if (!action.name.trim() || !ROLES.includes(action.role)) return result(false, "Enter a name and valid role.", "أدخل اسمًا ودورًا صحيحًا.");
      data.users.push({ id, name: action.name.trim(), role: action.role, enabled: true, mfa: false, lastLogin: 0, sessions: [] }); break;
    case "user-toggle": case "session-revoke": case "user-role": {
      const user = data.users.find((u) => u.id === action.id); if (!user) return result(false, "User not found.", "لم يُعثر على المستخدم.");
      if (action.type === "user-role" && !ROLES.includes(action.role)) return result(false, "Invalid role.", "الدور غير صحيح.");
      const removesSupervisor = user.enabled && user.role === "supervisor" && (action.type === "user-toggle" || action.type === "user-role" && action.role !== "supervisor");
      if (removesSupervisor && data.users.filter((u) => u.enabled && u.role === "supervisor").length <= 1) return result(false, "Keep at least one active demo supervisor.", "يجب الإبقاء على مشرف تجريبي نشط واحد على الأقل.");
      if (action.type === "user-toggle") { user.enabled = !user.enabled; if (!user.enabled) user.sessions = []; }
      if (action.type === "session-revoke") user.sessions = [];
      if (action.type === "user-role") user.role = action.role;
      break;
    }
    case "matrix-propose":
      if (!ROLES.every((r) => Array.isArray(action.matrix[r]) && action.matrix[r].every((p) => RIGHTS.includes(p)))) return result(false, "Invalid permission proposal.", "مقترح الصلاحيات غير صحيح.");
      if (data.proposal) return result(false, "Review the pending proposal first.", "راجع المقترح المعلّق أولًا.");
      data.proposal = { matrix: action.matrix, by: role }; break;
    case "matrix-approve":
      if (!data.proposal || data.proposal.by === role) return result(false, "A supervisor of a different role must approve the proposal.", "يجب أن يعتمد المقترح مشرف بدور مختلف عن مقدّمه.");
      data.matrix = data.proposal.matrix; data.proposal = null; break;
    case "matrix-reject": data.proposal = null; break;
    case "connection-toggle": case "connection-test": {
      const c = data.connections.find((c) => c.id === action.id); if (!c) return result(false, "Connection not found.", "لم يُعثر على الاتصال.");
      if (action.type === "connection-toggle") c.connected = !c.connected;
      else { if (!c.connected) return result(false, "Connect the sandbox first.", "فعّل الاتصال التجريبي أولًا."); c.lastSync = now; data.delivery.unshift({ id: now, at: now, target: c.id, result: { en: "Sandbox test passed — no external request", ar: "نجح الاختبار التجريبي — لم يُرسل طلب خارجي" } }); }
      break;
    }
    case "key-add":
      if (!action.label.trim() || !action.scopes.length || action.scopes.some((s) => !["cases:read", "alerts:read", "webhooks:test"].includes(s)) || !Number.isInteger(action.days) || action.days < 1 || action.days > 365) return result(false, "Choose scopes and an expiry of 1–365 days.", "حدد النطاقات ومدة صلاحية من يوم إلى ٣٦٥ يومًا.");
      data.keys.push({ id, label: action.label.trim(), scopes: action.scopes, expires: now + action.days * 86400000, revoked: false }); break;
    case "key-revoke": { const key = data.keys.find((k) => k.id === action.id); if (!key) return result(false, "Key not found.", "لم يُعثر على المفتاح."); key.revoked = true; break; }
    case "hook-add":
      if (!safeHook(action.url) || !action.events.length || action.events.some((e) => !["case.opened", "alert.reviewed", "case.resolved"].includes(e))) return result(false, "Use an HTTPS address and select an event.", "استخدم عنوانًا آمنًا وحدد حدثًا.");
      data.hooks.push({ id, url: action.url, events: action.events, enabled: true }); break;
    case "hook-toggle": case "hook-test": { const hook = data.hooks.find((h) => h.id === action.id); if (!hook) return result(false, "Endpoint not found.", "لم يُعثر على الوجهة."); if (action.type === "hook-toggle") hook.enabled = !hook.enabled; else { if (!hook.enabled) return result(false, "Enable the endpoint first.", "فعّل الوجهة أولًا."); data.delivery.unshift({ id: now, at: now, target: hook.url, result: { en: "Simulated HTTP 200 — payload not transmitted", ar: "استجابة ٢٠٠ محاكاة — لم تُرسل البيانات" } }); } break; }
    case "policy": if (!data.policies[action.profile] || !Number.isInteger(action.policy.days) || action.policy.days < 1 || action.policy.days > 3650) return result(false, "Retention must be 1–3650 days.", "يجب أن تكون مدة الاحتفاظ من يوم إلى ٣٦٥٠ يومًا."); data.policies[action.profile] = action.policy; break;
    case "consent-withdraw": { const consent = data.consents.find((c) => c.id === action.id); if (!consent || !consent.granted) return result(false, "Consent is already withdrawn or unavailable.", "الموافقة مسحوبة بالفعل أو غير متاحة."); consent.granted = false; consent.dataPresent = false; consent.at = now; break; }
    case "request": if (!action.person.trim() || !["access", "delete"].includes(action.requestType)) return result(false, "Enter a demo person reference.", "أدخل مرجع شخص تجريبي."); data.requests.push({ id: now, person: action.person.trim(), type: action.requestType, at: now, state: "pending" }); break;
    case "request-complete": { const request = data.requests.find((r) => r.id === action.id); if (!request || request.state !== "pending") return result(false, "No pending request found.", "لا يوجد طلب معلّق."); request.state = "completed"; if (request.type === "delete") data.consents = data.consents.map((c) => c.id === request.person ? { ...c, dataPresent: false, granted: false, at: now } : c); break; }
    case "reset": { const journal = data.journal; data = freshAdmin(); data.journal = journal; break; }
    case "audit-export": break;
  }
  return result(true, "Demo administration updated", "حُدّثت الإدارة التجريبية");
}
export function appendJournal(data: AdminData, action: string, role: Role, at: number): AdminData {
  const entry = { id: data.journal.length + 1, at, role, action, previous: data.journal.at(-1)?.hash ?? "GENESIS" };
  return { ...data, journal: [...data.journal, { ...entry, hash: checksum(JSON.stringify(entry)) }] };
}