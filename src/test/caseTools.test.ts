import { describe, it, expect } from "vitest";
import { computePriority, slaRemaining, duplicateScore, extractMentions, checkShare, type ShareLink } from "@/lib/caseTools";

const noon = new Date(2027, 4, 15, 12).getTime();
const base = { name: { en: "Omar Adel", ar: "" }, age: 7, profile: "child" as const, lastSeen: { lat: 30.05, lng: 31.24 }, openedAt: noon - 3600000 };

describe("priority", () => {
  it("child, 1h elapsed, daytime, hot = 25+10+6+0+10", () => {
    expect(computePriority(base, noon).score).toBe(51);
  });
  it("caps at 100", () => {
    expect(computePriority({ ...base, profile: "alzheimers", age: 80, openedAt: noon - 20 * 3600000 }, noon).score).toBeLessThanOrEqual(100);
  });
});

describe("SLA", () => {
  it("potential stage allows 10 minutes", () => {
    expect(slaRemaining("potential", noon, noon + 4 * 60000)).toBe(6 * 60000);
    expect(slaRemaining("potential", noon, noon + 11 * 60000)!).toBeLessThan(0);
    expect(slaRemaining("resolved", noon, noon)).toBeNull();
  });
});

describe("duplicates", () => {
  it("same person reported twice scores 100", () => {
    expect(duplicateScore(base, { ...base, age: 8 })).toBe(100);
  });
  it("different people far apart score low", () => {
    expect(duplicateScore(base, { ...base, name: { en: "Mona Ali", ar: "" }, age: 70, profile: "elderly", lastSeen: { lat: 30.2, lng: 31.5 }, openedAt: noon - 48 * 3600000 })).toBe(0);
  });
});

it("extracts mentions", () => {
  expect(extractMentions("ping @supervisor and @field, @supervisor")).toEqual(["supervisor", "field"]);
});

describe("share links", () => {
  const l: ShareLink = { id: "x", caseId: "VT-1", created: noon, expiresAt: noon + 3600000, maxViews: 2, views: 0, password: "1234", revoked: false, log: [] };
  it("needs the right password", () => { expect(checkShare(l, noon, "0000").reason).toBe("password"); expect(checkShare(l, noon, "1234").ok).toBe(true); });
  it("refuses after expiry, view limit or revoke", () => {
    expect(checkShare(l, noon + 7200000, "1234").reason).toBe("expired");
    expect(checkShare({ ...l, views: 2 }, noon, "1234").reason).toBe("limit");
    expect(checkShare({ ...l, revoked: true }, noon, "1234").reason).toBe("revoked");
  });
});
