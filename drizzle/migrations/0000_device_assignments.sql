CREATE TABLE public.device_assignments (
  device_id text PRIMARY KEY,
  case_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.device_assignments TO anon, authenticated;
GRANT ALL ON public.device_assignments TO service_role;
ALTER TABLE public.device_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can read device assignments" ON public.device_assignments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Team can add device assignments" ON public.device_assignments FOR INSERT TO anon, authenticated WITH CHECK (device_id ~ '^[A-Z0-9-]{2,16}$' AND (case_id IS NULL OR case_id ~ '^[A-Z0-9-]{2,16}$'));
CREATE POLICY "Team can update device assignments" ON public.device_assignments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (device_id ~ '^[A-Z0-9-]{2,16}$' AND (case_id IS NULL OR case_id ~ '^[A-Z0-9-]{2,16}$'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_assignments;