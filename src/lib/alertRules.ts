import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useVT, type Alert, type Case, type Profile, type Role } from "./store";

/* ================= Alert rules (pure, tested) ================= */
export type RuleActionType = "notify" | "escalate" | "dispatch";
export type AlertRule = {
  id: string;
  name: string;
  enabled: boolean;
  minConf: number;        // 0–100
  cams: string[];         // empty = all cameras
  profiles: Profile[];    // empty = all profiles
  action: RuleActionType;
  createdBy: Role;
  at: number;
};

/** Does a rule match an alert? Only open alerts can match. */
export function ruleMatches(rule: Pick<AlertRule, "minConf" | "cams" | "profiles">, alert: Alert, c: Case | undefined): boolean {
  if (alert.state !== "open") return false;
  if (alert.conf < rule.minConf) return false;
  if (rule.cams.length > 0 && !rule.cams.includes(alert.cam)) return false;
  if (rule.profiles.length > 0 && (!c || !rule.profiles.includes(c.profile))) return false;
  return true;
}

/** All open alerts a rule currently matches. */
export function matchingAlerts(rule: Pick<AlertRule, "minConf" | "cams" | "profiles">, alerts: Alert[], cases: Case[]): Alert[] {
  return alerts.filter((a) => ruleMatches(rule, a, cases.find((c) => c.id === a.caseId)));
}

/* ================= Persisted rules store ================= */
type RulesState = {
  rules: AlertRule[];
  /** Alert IDs already acted on, per rule, so each alert fires a rule once. */
  fired: Record<string, string[]>;
  addRule: (r: Omit<AlertRule, "id" | "at" | "createdBy">) => boolean;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  markFired: (ruleId: string, alertIds: string[]) => void;
};

const deny = (en: string, ar: string) => {
  useVT.getState().emit({ action: `DENIED ${en}`, msg: { en, ar }, kind: "warning" });
  return false;
};

export const useAlertRules = create<RulesState>()(
  persist(
    (set, get) => ({
      rules: [
        {
          id: "AR-1", name: "High-confidence child sighting", enabled: true,
          minConf: 75, cams: [], profiles: ["child"], action: "escalate", createdBy: "supervisor", at: Date.UTC(2027, 3, 15),
        },
      ],
      fired: {},
      addRule: (r) => {
        const role = useVT.getState().role;
        if (role !== "supervisor" && role !== "investigator")
          return deny("Only a supervisor or investigator can create alert rules.", "لا ينشئ قواعد التنبيه إلا المشرف أو المحقّق.");
        const id = `AR-${Date.now().toString(36)}`;
        set({ rules: [{ ...r, id, createdBy: role, at: Date.now() }, ...get().rules] });
        useVT.getState().emit({ action: `RULE created "${r.name}" (${r.action}, ≥${r.minConf}%)`, msg: { en: `Alert rule "${r.name}" created`, ar: `أُنشئت قاعدة التنبيه «${r.name}»` }, kind: "success" });
        return true;
      },
      toggleRule: (id) => {
        const rule = get().rules.find((x) => x.id === id);
        if (!rule) return;
        set({ rules: get().rules.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)) });
        useVT.getState().emit({ action: `RULE ${rule.enabled ? "disabled" : "enabled"} "${rule.name}"`, msg: { en: `Rule "${rule.name}" ${rule.enabled ? "disabled" : "enabled"}`, ar: `قاعدة «${rule.name}» ${rule.enabled ? "مُعطّلة" : "مُفعّلة"}` }, quiet: true });
      },
      deleteRule: (id) => {
        const role = useVT.getState().role;
        if (role !== "supervisor") { deny("Only a supervisor can delete alert rules.", "لا يحذف قواعد التنبيه إلا المشرف."); return; }
        const rule = get().rules.find((x) => x.id === id);
        set({ rules: get().rules.filter((x) => x.id !== id) });
        if (rule) useVT.getState().emit({ action: `RULE deleted "${rule.name}"`, msg: { en: `Alert rule "${rule.name}" deleted`, ar: `حُذفت قاعدة التنبيه «${rule.name}»` }, kind: "warning" });
      },
      markFired: (ruleId, alertIds) =>
        set({ fired: { ...get().fired, [ruleId]: [...(get().fired[ruleId] ?? []), ...alertIds].slice(-200) } }),
    }),
    { name: "vt-alert-rules-v1" },
  ),
);

/**
 * Evaluate all enabled rules against current alerts. Returns the actions taken
 * (for the runner component to perform with store access).
 */
export function evaluateRules(
  rules: AlertRule[],
  fired: Record<string, string[]>,
  alerts: Alert[],
  cases: Case[],
): { rule: AlertRule; hits: Alert[] }[] {
  return rules
    .filter((r) => r.enabled)
    .map((rule) => {
      const done = new Set(fired[rule.id] ?? []);
      const hits = matchingAlerts(rule, alerts, cases).filter((a) => !done.has(a.id));
      return { rule, hits };
    })
    .filter((x) => x.hits.length > 0);
}
