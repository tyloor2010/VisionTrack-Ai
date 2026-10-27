import { describe, it, expect } from "vitest";
import { pathDistanceKm, polygonAreaKm2, toDMS, buildRoute, routePointAt, mockWeather } from "@/lib/mapTools";
import { haversineKm, type Case, type Alert } from "@/lib/store";

const A = { lat: 30.0444, lng: 31.2357 }; // Tahrir
const B = { lat: 30.0535, lng: 31.2452 }; // ~1.3 km away

describe("pathDistanceKm", () => {
  it("is 0 for fewer than 2 points", () => {
    expect(pathDistanceKm([])).toBe(0);
    expect(pathDistanceKm([A])).toBe(0);
  });
  it("equals the haversine for a single segment", () => {
    expect(pathDistanceKm([A, B])).toBeCloseTo(haversineKm(A, B), 10);
  });
  it("sums segments", () => {
    expect(pathDistanceKm([A, B, A])).toBeCloseTo(2 * haversineKm(A, B), 10);
  });
});

describe("polygonAreaKm2", () => {
  it("is 0 for fewer than 3 points", () => {
    expect(polygonAreaKm2([A, B])).toBe(0);
  });
  it("computes a ~1 km² square near Cairo", () => {
    const dLat = 1 / 110.57;
    const dLng = 1 / (111.32 * Math.cos((30.0444 * Math.PI) / 180));
    const sq = [A, { lat: A.lat, lng: A.lng + dLng }, { lat: A.lat + dLat, lng: A.lng + dLng }, { lat: A.lat + dLat, lng: A.lng }];
    expect(polygonAreaKm2(sq)).toBeCloseTo(1, 1);
  });
});

describe("toDMS", () => {
  it("formats with N/E hemispheres and zero-padded minutes/seconds", () => {
    expect(toDMS(A)).toMatch(/^30°\d{2}'\d{2}"N 31°\d{2}'\d{2}"E$/);
  });
  it("uses S/W for negative coordinates", () => {
    expect(toDMS({ lat: -33.86, lng: -70.0 })).toContain("S");
    expect(toDMS({ lat: -33.86, lng: -70.0 })).toContain("W");
  });
});

const mkCase = (id: string): Case => ({
  id, name: { en: "X", ar: "س" }, age: 10, profile: "child", status: "active",
  openedAt: 0, lastSeen: A, clothing: { en: "", ar: "" }, timeline: [],
});
const mkAlert = (id: string, caseId: string, cam: string, at: number): Alert => ({ id, caseId, cam, conf: 80, at, state: "open", truth: true });

describe("buildRoute", () => {
  it("starts at last-seen and orders alert cameras chronologically", () => {
    const c = mkCase("VT-1");
    const alerts = [
      mkAlert("a2", "VT-1", "CAM-031", 2000),
      mkAlert("a1", "VT-1", "CAM-022", 1000),
      mkAlert("a3", "OTHER", "CAM-047", 500),
    ];
    const r = buildRoute(c, alerts);
    expect(r).toHaveLength(3);
    expect(r[0]).toEqual(A);
    expect(r[1]).toEqual({ lat: 30.0535, lng: 31.2452 }); // CAM-022 first (earlier)
    expect(r[2]).toEqual({ lat: 30.0728, lng: 31.323 }); // CAM-031 second
  });
  it("returns only last-seen when the case has no alerts", () => {
    expect(buildRoute(mkCase("VT-9"), [])).toEqual([A]);
  });
});

describe("routePointAt", () => {
  it("returns endpoints at f=0 and f=1", () => {
    expect(routePointAt([A, B], 0)).toEqual(A);
    expect(routePointAt([A, B], 1)).toEqual(B);
  });
  it("interpolates the midpoint of a straight segment", () => {
    const mid = routePointAt([A, B], 0.5);
    expect(mid.lat).toBeCloseTo((A.lat + B.lat) / 2, 4);
    expect(mid.lng).toBeCloseTo((A.lng + B.lng) / 2, 4);
  });
});

describe("mockWeather", () => {
  it("returns a deterministic 16-cell grid around the center", () => {
    const w1 = mockWeather(A);
    const w2 = mockWeather(A);
    expect(w1).toHaveLength(16);
    expect(w1).toEqual(w2);
    expect(Math.abs(w1[0]!.lat - A.lat)).toBeLessThan(0.05);
  });
});
