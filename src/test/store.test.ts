import { describe, it, expect } from "vitest";
import { canTransition, computeKpis, haversineKm, etaMin, makeSeed } from "@/lib/store";

describe("store rules", () => {
  it("enforces role-based transitions", () => {
    expect(canTransition("reported", "active", "investigator")).toBe(true);
    expect(canTransition("reported", "active", "family")).toBe(false);
    expect(canTransition("reported", "resolved", "supervisor")).toBe(false);
  });
  it("computes precision from live alerts", () => {
    const { cases, alerts } = makeSeed(0);
    const k = computeKpis(cases, alerts);
    const c = alerts.filter((a) => a.state === "confirmed").length, r = alerts.filter((a) => a.state === "rejected").length;
    expect(k.precision).toBeCloseTo(c / (c + r));
  });
  it("seed is deterministic", () => {
    expect(JSON.stringify(makeSeed(0))).toBe(JSON.stringify(makeSeed(0)));
  });
  it("geo distance and ETA", () => {
    const d = haversineKm({ lat: 30.0444, lng: 31.2357 }, { lat: 30.0535, lng: 31.2452 });
    expect(d).toBeGreaterThan(1.2); expect(d).toBeLessThan(1.5);
    expect(etaMin(0.1)).toBe(2); expect(etaMin(15)).toBe(30);
  });
});
