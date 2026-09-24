CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY "Administrators update facilities" ON public.facilities;
CREATE POLICY "Administrators update facilities" ON public.facilities FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'HOSPITAL_ADMIN') OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);
DROP POLICY "Operational staff add inventory" ON public.inventory_items;
CREATE POLICY "Operational staff add inventory" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(),'PHC_STAFF') OR private.has_role(auth.uid(),'HOSPITAL_ADMIN') OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN'));
DROP POLICY "Operational staff update inventory" ON public.inventory_items;
CREATE POLICY "Operational staff update inventory" ON public.inventory_items FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'PHC_STAFF') OR private.has_role(auth.uid(),'HOSPITAL_ADMIN') OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);
DROP POLICY "Administrators decide recommendations" ON public.redistribution_recommendations;
CREATE POLICY "Administrators decide recommendations" ON public.redistribution_recommendations FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'HOSPITAL_ADMIN') OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);
DROP POLICY "Coordinators update emergencies" ON public.emergency_sos;
CREATE POLICY "Coordinators update emergencies" ON public.emergency_sos FOR UPDATE TO authenticated USING (private.has_role(auth.uid(),'EMERGENCY_COORDINATOR') OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);
DROP POLICY "Administrators view audit logs" ON public.audit_logs;
CREATE POLICY "Administrators view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.has_role(uuid, public.app_role);