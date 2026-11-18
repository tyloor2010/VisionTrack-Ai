import { describe, it, expect } from "vitest";
import { deviceTrail } from "./deviceHistory";
const d = { id: "VTX-1A", kind: "drone", name: { en: "", ar: "" }, pos: { lat: 30.05, lng: 31.24 }, battery: 1, status: "active" } as const;
describe("deviceTrail", () => {
  it("covers the chosen hours at 10-minute steps and ends at the current position", () => {
    const pts = deviceTrail(d as any, 4, 1_700_000_000_000);
    expect(pts.length).toBe(25);
    expect(pts.at(-1)).toMatchObject({ lat: 30.05, lng: 31.24 });
    expect(pts.at(-1)!.at - pts[0]!.at).toBe(4 * 3600000);
  });
});
