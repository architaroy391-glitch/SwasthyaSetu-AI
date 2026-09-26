CREATE TYPE public.verification_status AS ENUM ('not_applicable','pending','verified','rejected','more_info');
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  account_type text NOT NULL DEFAULT 'normal_user' CHECK (account_type IN ('normal_user','hospital_staff')),
  avatar_url text,
  hospital_name text,
  hospital_id text,
  hospital_state text,
  hospital_district text,
  id_card_path text,
  verification_status public.verification_status NOT NULL DEFAULT 'not_applicable',
  verification_note text,
  verified_by uuid,
  verified_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN'));
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own or admin update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.guard_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_admin boolean := private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN');
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.verified_by := NULL; NEW.verified_at := NULL; NEW.verification_note := NULL;
    IF NEW.account_type = 'hospital_staff' THEN NEW.verification_status := 'pending'; NEW.submitted_at := now();
    ELSE NEW.verification_status := 'not_applicable'; END IF;
    RETURN NEW;
  END IF;
  IF is_admin AND OLD.id <> auth.uid() THEN
    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN NEW.verified_by := auth.uid(); NEW.verified_at := now(); END IF;
    RETURN NEW;
  END IF;
  -- self edits
  NEW.account_type := OLD.account_type;
  NEW.verified_by := OLD.verified_by; NEW.verified_at := OLD.verified_at;
  IF OLD.account_type = 'hospital_staff' AND (NEW.hospital_name IS DISTINCT FROM OLD.hospital_name OR NEW.hospital_id IS DISTINCT FROM OLD.hospital_id OR NEW.id_card_path IS DISTINCT FROM OLD.id_card_path) THEN
    NEW.verification_status := 'pending'; NEW.verification_note := NULL; NEW.submitted_at := now(); NEW.verified_by := NULL; NEW.verified_at := NULL;
  ELSE
    NEW.verification_status := OLD.verification_status; NEW.verification_note := OLD.verification_note; NEW.submitted_at := OLD.submitted_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_guard BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_profile();

CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT private.has_role(auth.uid(),'DISTRICT_ADMIN') OR private.has_role(auth.uid(),'SUPER_ADMIN') $$;
REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

CREATE POLICY "Avatar upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "ID card upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "ID card read own or admin" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='id-cards' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin_user()));