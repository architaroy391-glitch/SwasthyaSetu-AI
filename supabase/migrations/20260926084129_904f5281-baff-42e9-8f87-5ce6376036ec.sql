REVOKE EXECUTE ON FUNCTION public.guard_profile() FROM PUBLIC, anon, authenticated;
DROP POLICY "ID card read own or admin" ON storage.objects;
CREATE POLICY "ID card read own or admin" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='id-cards' AND ((storage.foldername(name))[1] = auth.uid()::text OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')));
DROP FUNCTION public.is_admin_user();