import { describe, it, expect, beforeEach } from "vitest";
import { qualityAt, needsReview, inRange, previousRange, alertsCsv, DEFAULT_ANALYTICS } from "@/lib/analytics";
import { fresh, useVT, type Alert } from "@/lib/store";
const rows: Alert[] = [
  {id:"a",caseId:"VT-1",cam:"CAM-014",conf:80,at:Date.UTC(2026,9,27),state:"open",truth:true},
  {id:"b",caseId:"VT-1",cam:"CAM-014",conf:70,at:Date.UTC(2026,9,27),state:"open",truth:false},
  {id:"c",caseId:"VT-1",cam:"CAM-014",conf:60,at:Date.UTC(2026,9,27),state:"open",truth:true},
  {id:"d",caseId:"VT-1",cam:"CAM-014",conf:40,at:Date.UTC(2026,9,27),state:"open",truth:false},
];
describe("analytics evaluation", () => {
  it("computes precision and recall including the threshold boundary", () => { expect(qualityAt(rows,70)).toEqual({tp:1,fp:1,tn:1,fn:1,precision:50,recall:50}); });
  it("returns unavailable percentages rather than invented scores for empty samples", () => { expect(qualityAt([],70).precision).toBeNull(); expect(qualityAt([],70).recall).toBeNull(); });
  it("flags gaps only when they exceed the selected limit", () => {expect(needsReview([80,65],15)).toBe(false);expect(needsReview([81,65],15)).toBe(true);expect(needsReview([null,80],15)).toBe(false);});
  it("includes the complete UTC end date", () => {expect(inRange(Date.UTC(2026,9,27,23,59,59,999),"2026-10-27","2026-10-27")).toBe(true);expect(inRange(Date.UTC(2026,9,28),"2026-10-27","2026-10-27")).toBe(false);});
  it("compares an equally sized prior week", () => {expect(previousRange("2026-10-21","2026-10-27")).toEqual({start:"2026-10-14",end:"2026-10-20"});});
  it("exports actual selected alert data", () => {expect(alertsCsv(rows.slice(0,1))).toContain("a,VT-1,CAM-014,80,open,2026-10-27T00:00:00.000Z");});
});
describe("review feedback and report settings", () => {
  beforeEach(() => useVT.setState({...fresh(0),alerts:rows}));
  it("records rejection reasons once and writes audit", () => {useVT.getState().rejectAlert("b","bad-image");useVT.getState().rejectAlert("b","wrong-person");expect(useVT.getState().feedback).toHaveLength(1);expect(useVT.getState().feedback[0]?.reason).toBe("bad-image");expect(useVT.getState().audit[0]?.action).toContain("reason=bad-image");});
  it("records confirmation reasons and audit", () => {useVT.getState().confirmAlert("a","verified");expect(useVT.getState().feedback[0]?.decision).toBe("confirmed");expect(useVT.getState().audit[0]?.action).toContain("reason=verified");});
  it("family cannot review alerts", () => {useVT.setState({role:"family"});useVT.getState().rejectAlert("b","bad-image");expect(useVT.getState().feedback).toHaveLength(0);expect(useVT.getState().alerts[1]?.state).toBe("open");});
  it("only supervisor can schedule and enabled schedules require recipients", () => {const schedule={recipients:"",enabled:true,frequency:"weekly" as const,format:"csv" as const};expect(useVT.getState().setReportSchedule(schedule)).toBe(false);useVT.setState({role:"investigator"});expect(useVT.getState().setReportSchedule({...schedule,recipients:"demo@example.test"})).toBe(false);useVT.setState({role:"supervisor"});expect(useVT.getState().setReportSchedule({...schedule,recipients:"demo@example.test"})).toBe(true);});
  it("evaluation settings do not modify operational alert data", () => {useVT.getState().setAnalyticsSettings({threshold:90,gapLimit:10});expect(useVT.getState().alerts).toEqual(rows);useVT.getState().setAnalyticsSettings({...DEFAULT_ANALYTICS});expect(useVT.getState().analyticsSettings).toEqual({threshold:70,gapLimit:15});});
});
