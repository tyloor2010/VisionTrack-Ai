import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVT } from "@/lib/store";

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
  const { error } = await supabase
    .from("device_assignments")
    .upsert({ device_id: deviceId, case_id: caseId ?? null, updated_at: new Date().toISOString() });
  if (error) console.error("saveAssignment", error);
}

/** Load saved assignments and keep them live while the page is open. */
export function useDeviceAssignmentSync() {
  useEffect(() => {
    let alive = true;
    supabase.from("device_assignments").select("device_id, case_id").then(({ data }) => {
      if (alive && data) apply(data);
    });
    const ch = supabase
      .channel("device_assignments")
      .on("postgres_changes", { event: "*", schema: "public", table: "device_assignments" }, (p) => {
        if (p.new && "device_id" in p.new) apply([p.new as Row]);
      })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, []);
}
