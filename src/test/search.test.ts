import { describe, it, expect } from "vitest";
import { fuzzyScore, matchRule, matchGroup, applyGroups } from "@/lib/search";
import { DEFAULT_PREFS, fmtNum, fmtDist } from "@/lib/prefs";

describe("fuzzy search", () => {
  it("matches substrings and subsequences, rejects non-matches", () => {
    expect(fuzzyScore("vt-2041", "VT-2041 — Subject A")).toBeGreaterThanOrEqual(0);
    expect(fuzzyScore("vta", "VT-2041 — Subject A")).toBeGreaterThanOrEqual(0);
    expect(fuzzyScore("zzz", "VT-2041")).toBe(-1);
    expect(fuzzyScore("", "anything")).toBe(0);
  });
});

describe("filter builder rules", () => {
  const row = { status: "active", age: 7, cam: "CAM-014", conf: 87 };
  it("operators behave", () => {
    expect(matchRule({ field: "status", op: "is", value: "active" }, row)).toBe(true);
    expect(matchRule({ field: "status", op: "isNot", value: "active" }, row)).toBe(false);
    expect(matchRule({ field: "cam", op: "contains", value: "014" }, row)).toBe(true);
    expect(matchRule({ field: "conf", op: "gt", value: "80" }, row)).toBe(true);
    expect(matchRule({ field: "age", op: "lt", value: "5" }, row)).toBe(false);
    expect(matchRule({ field: "missing", op: "is", value: "x" }, row)).toBe(false);
  });
  it("AND requires all rules, OR requires any", () => {
    const rules = [
      { field: "status", op: "is" as const, value: "active" },
      { field: "conf", op: "gt" as const, value: "90" },
    ];
    expect(matchGroup({ comb: "and", rules }, row)).toBe(false);
    expect(matchGroup({ comb: "or", rules }, row)).toBe(true);
  });
  it("empty group matches everything; groups combine with AND", () => {
    expect(applyGroups([], row)).toBe(true);
    expect(applyGroups([{ comb: "and", rules: [] }], row)).toBe(true);
    expect(applyGroups([
      { comb: "and", rules: [{ field: "status", op: "is", value: "active" }] },
      { comb: "and", rules: [{ field: "status", op: "is", value: "resolved" }] },
    ], row)).toBe(false);
  });
});

describe("preferences formatting", () => {
  it("defaults are sensible", () => {
    expect(DEFAULT_PREFS.density).toBe("comfortable");
    expect(DEFAULT_PREFS.units).toBe("km");
    expect(DEFAULT_PREFS.labelStyle).toBe("full");
  });
  it("Arabic-Indic digits toggle", () => {
    expect(fmtNum(2041, false)).toBe("2041");
    expect(fmtNum(2041, true)).toBe("٢٠٤١");
  });
  it("distance units convert", () => {
    expect(fmtDist(2, "km")).toBe("2.0 km");
    expect(fmtDist(2, "mi")).toBe("1.2 mi");
  });
});
