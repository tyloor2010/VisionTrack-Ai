DROP POLICY IF EXISTS "Team can read device assignments" ON public.device_assignments;
DROP POLICY IF EXISTS "Team can add device assignments" ON public.device_assignments;
DROP POLICY IF EXISTS "Team can update device assignments" ON public.device_assignments;
REVOKE ALL ON public.device_assignments FROM anon, authenticated;
ALTER PUBLICATION supabase_realtime DROP TABLE public.device_assignments;