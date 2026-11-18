import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEVICE_IDS = ["VTX-1A", "VTX-1B", "VB-01", "VB-02", "VB-03", "NT-01", "NT-02"] as const;

export const listDeviceAssignments = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("device_assignments").select("device_id, case_id");
  if (error) { console.error(error); return []; }
  return data;
});

export const setDeviceAssignment = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      deviceId: z.enum(DEVICE_IDS),
      caseId: z.string().regex(/^VT-\d{3,6}$/).nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("device_assignments").upsert({
      device_id: data.deviceId, case_id: data.caseId, updated_at: new Date().toISOString(),
    });
    if (error) { console.error(error); throw new Error("Could not save assignment"); }
    return { ok: true };
  });
