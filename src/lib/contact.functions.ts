import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Where pilot-enquiry notifications are emailed once the sender domain is verified.
export const OWNER_EMAIL = "moonasser.official@gmail.com";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert({ name: data.name, email: data.email, message: data.message })
      .select("id")
      .single();
    if (error) {
      console.error(error);
      throw new Error("Could not save your message");
    }

    // TODO: after the sender domain is verified and email templates are scaffolded,
    // email a notification to OWNER_EMAIL with idempotencyKey `contact-notify-${row.id}`.
    return { ok: true };
  });
