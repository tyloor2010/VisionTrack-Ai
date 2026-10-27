import { describe, expect, it } from "vitest";
import { analyzeVideo, compareStills, enhanceFilter, filterFrames, framesToCSV, healthHistory, heatStrip, DEFAULT_FILTER } from "@/lib/media";

describe("video analysis", () => {
  it("is deterministic per seed and samples the whole duration", () => {
    const a = analyzeVideo("clip.mp4", 10);
    const b = analyzeVideo("clip.mp4", 10);
    expect(a).toEqual(b);
    expect(a[0]!.t).toBe(0);
    expect(a[a.length - 1]!.t).toBe(10);
  });
  it("boxes stay inside the frame and confidence within 30-98", () => {
    for (const f of analyzeVideo("x", 5))
      for (const b of f.boxes) {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.w).toBeLessThanOrEqual(100);
        expect(b.conf!).toBeGreaterThanOrEqual(30);
        expect(b.conf!).toBeLessThanOrEqual(98);
      }
  });
});

describe("filters", () => {
  const frames = analyzeVideo("f", 8);
  it("class filter keeps only matching labels", () => {
    const out = filterFrames(frames, { ...DEFAULT_FILTER, classes: ["person"] });
    for (const f of out) for (const b of f.boxes) expect(b.label).toBe("person");
  });
  it("confidence range is respected", () => {
    const out = filterFrames(frames, { ...DEFAULT_FILTER, minConf: 70 });
    for (const f of out) for (const b of f.boxes) expect(b.conf!).toBeGreaterThanOrEqual(70);
  });
  it("time window is respected", () => {
    const out = filterFrames(frames, { ...DEFAULT_FILTER, from: 2, to: 4 });
    for (const f of out) { expect(f.t).toBeGreaterThanOrEqual(2); expect(f.t).toBeLessThanOrEqual(4); }
  });
});

describe("heat strip", () => {
  it("returns one count per bucket", () => {
    const h = heatStrip(analyzeVideo("h", 10), 24);
    expect(h).toHaveLength(24);
    expect(h.reduce((a, b) => a + b, 0)).toBe(analyzeVideo("h", 10).reduce((a, f) => a + f.boxes.length, 0));
  });
});

describe("exports", () => {
  it("CSV has a header and one row per box", () => {
    const frames = analyzeVideo("csv", 2);
    const csv = framesToCSV(frames);
    const rows = csv.split("\n");
    expect(rows[0]).toBe("time_s,label,confidence,x_pct,y_pct,w_pct,h_pct");
    expect(rows.length - 1).toBe(frames.reduce((a, f) => a + f.boxes.length, 0));
  });
});

describe("compare", () => {
  it("shared classes raise the score", () => {
    const person = [{ label: "person", conf: 80, color: "yellow" as const, x: 0, y: 0, w: 5, h: 10 }];
    const car = [{ label: "car", conf: 80, color: "green" as const, x: 0, y: 0, w: 5, h: 10 }];
    expect(compareStills(person, person).score).toBeGreaterThan(compareStills(person, car).score);
  });
});

describe("enhancement + health", () => {
  it("filter string reflects options", () => {
    expect(enhanceFilter({ brightness: 110, contrast: 120, sharpen: true, denoise: false })).toContain("brightness(110%)");
    expect(enhanceFilter({ brightness: 100, contrast: 100, sharpen: false, denoise: true })).toContain("blur");
  });
  it("health history covers 24 hours", () => {
    const h = healthHistory("CAM-014");
    expect(h).toHaveLength(24);
    expect(h.every((x) => x.ok || x.ms === 0)).toBe(true);
  });
});
