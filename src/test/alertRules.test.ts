import { describe, it, expect } from "vitest";
import { ruleMatches, matchingAlerts, evaluateRules, type AlertRule } from "@/lib/alertRules";
import type { Alert, Case } from "@/lib/store";

const mkCase = (id: string, profile: Case["profile"] = "child"): Case => ({
  id, name: { en: "X", ar: "س" }, age: 10, profile, status: "active",
  openedAt: 0, lastSeen: { lat: 30, lng: 31 }, clothing: { en: "", ar: "" }, timeline: [],
});
const mkAlert = (id: string, caseId: string, cam: string, conf: number, state: Alert["state"] = "open"): Alert => ({
  id, caseId, cam, conf, at: 0, state, truth: true,
});
const mkRule = (over: Partial<AlertRule> = {}): AlertRule => ({
  id: "R1", name: "r", enabled: true, minConf: 70, cams: [], profiles: [], action: "notify", createdBy: "supervisor", at: 0, ...over,
});

describe("ruleMatches", () => {
  const c = mkCase("VT-1", "child");
  it("matches an open alert above the confidence threshold", () => {
    expect(ruleMatches(mkRule(), mkAlert("A1", "VT-1", "CAM-014", 80), c)).toBe(true);
  });
  it("rejects alerts below the confidence threshold", () => {
    expect(ruleMatches(mkRule({ minConf: 90 }), mkAlert("A1", "VT-1", "CAM-014", 80), c)).toBe(false);
  });
  it("never matches non-open alerts", () => {
    expect(ruleMatches(mkRule(), mkAlert("A1", "VT-1", "CAM-014", 95, "confirmed"), c)).toBe(false);
    expect(ruleMatches(mkRule(), mkAlert("A1", "VT-1", "CAM-014", 95, "rejected"), c)).toBe(false);
  });
  it("filters by camera when cameras are listed", () => {
    const r = mkRule({ cams: ["CAM-022"] });
    expect(ruleMatches(r, mkAlert("A1", "VT-1", "CAM-014", 80), c)).toBe(false);
    expect(ruleMatches(r, mkAlert("A2", "VT-1", "CAM-022", 80), c)).toBe(true);
  });
  it("filters by profile when profiles are listed", () => {
    const r = mkRule({ profiles: ["elderly"] });
    expect(ruleMatches(r, mkAlert("A1", "VT-1", "CAM-014", 80), c)).toBe(false);
    expect(ruleMatches(r, mkAlert("A1", "VT-2", "CAM-014", 80), mkCase("VT-2", "elderly"))).toBe(true);
  });
});

describe("matchingAlerts", () => {
  it("returns only open matching alerts across cases", () => {
    const cases = [mkCase("VT-1", "child"), mkCase("VT-2", "adult")];
    const alerts = [
      mkAlert("A1", "VT-1", "CAM-014", 85),
      mkAlert("A2", "VT-2", "CAM-014", 85),
      mkAlert("A3", "VT-1", "CAM-014", 40),
      mkAlert("A4", "VT-1", "CAM-014", 90, "confirmed"),
    ];
    const hits = matchingAlerts(mkRule({ profiles: ["child"] }), alerts, cases);
    expect(hits.map((h) => h.id)).toEqual(["A1"]);
  });
});

describe("evaluateRules", () => {
  it("skips disabled rules and already-fired alerts", () => {
    const cases = [mkCase("VT-1")];
    const alerts = [mkAlert("A1", "VT-1", "CAM-014", 85), mkAlert("A2", "VT-1", "CAM-014", 88)];
    const rules = [mkRule({ id: "R1" }), mkRule({ id: "R2", enabled: false })];
    const first = evaluateRules(rules, {}, alerts, cases);
    expect(first).toHaveLength(1);
    expect(first[0]!.hits.map((h) => h.id)).toEqual(["A1", "A2"]);
    const second = evaluateRules(rules, { R1: ["A1", "A2"] }, alerts, cases);
    expect(second).toHaveLength(0);
  });
});
