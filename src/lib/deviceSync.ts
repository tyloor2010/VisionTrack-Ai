import { useEffect } from "react";
import { useVT } from "@/lib/store";
import { listDeviceAssignments, setDeviceAssignment } from "@/lib/deviceAssignments.functions";

type Row = { device_id: string; case_id: string | null };

function apply(rows: Row[]) {
  const map = new Map(rows.map((r) => [r.device_id, r.case_id ?? undefined]));
  useVT.setState((s) => ({
    devices: s.devices.map((d) => {
      if (!map.has(d.id)) return d;
      const caseId = map.get(d.id);
      if (caseId === d.caseId) return d;
      return { ...d, caseId, status: caseId ? "active" : d.status === "active" ? "idle" : d.status };
    }),
  }));
}

/** Save one assignment so it survives reloads and reaches the whole team. */
export async function saveAssignment(deviceId: string, caseId: string | undefined) {
  try { await setDeviceAssignment({ data: { deviceId: deviceId as never, caseId: caseId ?? null } }); }
  catch (e) { console.error("saveAssignment", e); }
}

/** Load saved assignments and refresh every 10 s while the page is open. */
export function useDeviceAssignmentSync() {
  useEffect(() => {
    let alive = true;
    const load = () => listDeviceAssignments().then((rows) => { if (alive) apply(rows); }).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => { alive = false; clearInterval(t); };
  }, []);
}
