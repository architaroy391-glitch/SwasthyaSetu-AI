CREATE TYPE public.app_role AS ENUM ('PHC_STAFF','HOSPITAL_ADMIN','DISTRICT_ADMIN','EMERGENCY_COORDINATOR','STATE_ANALYST','SUPER_ADMIN');
CREATE TYPE public.facility_status AS ENUM ('healthy','warning','critical','offline');
CREATE TYPE public.risk_level AS ENUM ('critical','high','medium','low');
CREATE TYPE public.workflow_status AS ENUM ('pending','approved','rejected','modified','active','responded','resolved','unavailable');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'PHC_STAFF',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  facility_type text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  status public.facility_status NOT NULL DEFAULT 'healthy',
  available_beds integer NOT NULL DEFAULT 0 CHECK (available_beds >= 0),
  icu_beds integer NOT NULL DEFAULT 0 CHECK (icu_beds >= 0),
  doctors_available integer NOT NULL DEFAULT 0 CHECK (doctors_available >= 0),
  specialists_available integer NOT NULL DEFAULT 0 CHECK (specialists_available >= 0),
  critical_medicines integer NOT NULL DEFAULT 0 CHECK (critical_medicines >= 0),
  is_online boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view facilities" ON public.facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Administrators update facilities" ON public.facilities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'HOSPITAL_ADMIN') OR public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);

CREATE TABLE public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  unit text NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.medicines TO authenticated;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view medicines" ON public.medicines FOR SELECT TO authenticated USING (true);

CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  current_stock integer NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  daily_usage numeric(10,2) NOT NULL DEFAULT 0 CHECK (daily_usage >= 0),
  reorder_level integer NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  batch_number text,
  expiry_date date,
  sync_status text NOT NULL DEFAULT 'synced',
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(facility_id, medicine_id)
);
GRANT SELECT, INSERT, UPDATE ON public.inventory_items TO authenticated;
GRANT ALL ON public.inventory_items TO service_role;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view inventory" ON public.inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operational staff add inventory" ON public.inventory_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'PHC_STAFF') OR public.has_role(auth.uid(),'HOSPITAL_ADMIN') OR public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN'));
CREATE POLICY "Operational staff update inventory" ON public.inventory_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'PHC_STAFF') OR public.has_role(auth.uid(),'HOSPITAL_ADMIN') OR public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);

CREATE TABLE public.shortage_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  predicted_days_remaining numeric(10,1) NOT NULL,
  risk public.risk_level NOT NULL,
  confidence numeric(5,2) NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  model_version text NOT NULL DEFAULT 'demo-v1.0',
  contributing_factors text[] NOT NULL DEFAULT '{}',
  predicted_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shortage_predictions TO authenticated;
GRANT ALL ON public.shortage_predictions TO service_role;
ALTER TABLE public.shortage_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view predictions" ON public.shortage_predictions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.redistribution_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_facility_id uuid NOT NULL REFERENCES public.facilities(id),
  destination_facility_id uuid NOT NULL REFERENCES public.facilities(id),
  resource_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  distance_km numeric(8,1) NOT NULL,
  travel_minutes integer NOT NULL,
  reason text NOT NULL,
  status public.workflow_status NOT NULL DEFAULT 'pending',
  decided_by uuid,
  decided_at timestamptz,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.redistribution_recommendations TO authenticated;
GRANT ALL ON public.redistribution_recommendations TO service_role;
ALTER TABLE public.redistribution_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view recommendations" ON public.redistribution_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts create recommendations" ON public.redistribution_recommendations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Administrators decide recommendations" ON public.redistribution_recommendations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'HOSPITAL_ADMIN') OR public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);

CREATE TABLE public.emergency_sos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE,
  emergency_type text NOT NULL,
  location_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  required_resource text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  urgency text NOT NULL,
  notes text,
  status public.workflow_status NOT NULL DEFAULT 'active',
  created_by uuid,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.emergency_sos TO authenticated;
GRANT ALL ON public.emergency_sos TO service_role;
ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view emergencies" ON public.emergency_sos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coordinators create emergencies" ON public.emergency_sos FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Coordinators update emergencies" ON public.emergency_sos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'EMERGENCY_COORDINATOR') OR public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN')) WITH CHECK (true);

CREATE TABLE public.emergency_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id uuid NOT NULL REFERENCES public.emergency_sos(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id),
  available_resource text NOT NULL,
  distance_km numeric(8,1) NOT NULL,
  travel_minutes integer NOT NULL,
  status public.workflow_status NOT NULL DEFAULT 'pending',
  responded_at timestamptz,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.emergency_responses TO authenticated;
GRANT ALL ON public.emergency_responses TO service_role;
ALTER TABLE public.emergency_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view responses" ON public.emergency_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Facilities create responses" ON public.emergency_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Facilities update responses" ON public.emergency_responses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  notification_type text NOT NULL,
  priority public.risk_level NOT NULL DEFAULT 'low',
  facility_id uuid REFERENCES public.facilities(id),
  is_read boolean NOT NULL DEFAULT false,
  recipient_id uuid,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view operational notifications" ON public.notifications FOR SELECT TO authenticated USING (recipient_id IS NULL OR recipient_id = auth.uid());
CREATE POLICY "Users mark own notifications" ON public.notifications FOR UPDATE TO authenticated USING (recipient_id IS NULL OR recipient_id = auth.uid()) WITH CHECK (recipient_id IS NULL OR recipient_id = auth.uid());

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Administrators view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'DISTRICT_ADMIN') OR public.has_role(auth.uid(),'SUPER_ADMIN'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER redistribution_updated_at BEFORE UPDATE ON public.redistribution_recommendations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER emergency_updated_at BEFORE UPDATE ON public.emergency_sos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.facilities (id,name,facility_type,district,state,latitude,longitude,status,available_beds,icu_beds,doctors_available,specialists_available,critical_medicines,is_online,last_synced_at) VALUES
('10000000-0000-0000-0000-000000000001','PHC Khordha','Primary Health Centre','Khordha','Odisha',20.1851,85.6165,'warning',8,0,3,1,2,true,now()-interval '8 minutes'),
('10000000-0000-0000-0000-000000000002','Capital Hospital Bhubaneswar','District Hospital','Khordha','Odisha',20.2687,85.8395,'healthy',42,4,18,7,0,true,now()-interval '4 minutes'),
('10000000-0000-0000-0000-000000000003','CHC Jatni','Community Health Centre','Khordha','Odisha',20.1597,85.7074,'critical',3,1,4,1,5,true,now()-interval '13 minutes'),
('10000000-0000-0000-0000-000000000004','PHC Banki','Primary Health Centre','Cuttack','Odisha',20.3811,85.5294,'offline',6,0,2,0,1,false,now()-interval '3 hours'),
('10000000-0000-0000-0000-000000000005','SCB Medical College','Medical College Hospital','Cuttack','Odisha',20.4744,85.8899,'healthy',96,12,42,19,0,true,now()-interval '2 minutes'),
('10000000-0000-0000-0000-000000000006','District Hospital Puri','District Hospital','Puri','Odisha',19.8135,85.8312,'warning',17,2,11,4,2,true,now()-interval '16 minutes');

INSERT INTO public.medicines (id,name,unit) VALUES
('20000000-0000-0000-0000-000000000001','Amoxicillin','tablets'),
('20000000-0000-0000-0000-000000000002','ORS','sachets'),
('20000000-0000-0000-0000-000000000003','Paracetamol','tablets'),
('20000000-0000-0000-0000-000000000004','Oxytocin','ampoules'),
('20000000-0000-0000-0000-000000000005','Insulin','vials');

INSERT INTO public.inventory_items (id,facility_id,medicine_id,current_stock,daily_usage,reorder_level,batch_number,expiry_date) VALUES
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',120,38,250,'AMX-2408',current_date+interval '140 days'),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',180,24,120,'ORS-2411',current_date+interval '260 days'),
('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',640,42,300,'PCM-2501',current_date+interval '300 days'),
('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',920,31,200,'ORS-2502',current_date+interval '330 days'),
('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004',18,7,35,'OXY-2412',current_date+interval '62 days'),
('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005',380,18,120,'INS-2503',current_date+interval '90 days');

INSERT INTO public.shortage_predictions (inventory_item_id,predicted_days_remaining,risk,confidence,contributing_factors) VALUES
('30000000-0000-0000-0000-000000000001',3.2,'high',91.0,ARRAY['Usage increased 18%','Current stock below normal','Seasonal demand increasing']),
('30000000-0000-0000-0000-000000000002',7.5,'high',87.0,ARRAY['Monsoon demand increasing','Nearby facility has surplus']),
('30000000-0000-0000-0000-000000000005',2.6,'critical',94.0,ARRAY['Stock below reorder level','Daily usage above baseline']);

INSERT INTO public.redistribution_recommendations (id,source_facility_id,destination_facility_id,resource_name,quantity,distance_km,travel_minutes,reason) VALUES
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','ORS',150,31.0,45,'Destination predicted shortage in 2 days. Source facility has surplus.');

INSERT INTO public.emergency_sos (id,reference_number,emergency_type,location_name,latitude,longitude,required_resource,quantity,urgency,notes,status) VALUES
('50000000-0000-0000-0000-000000000001','1048','Accident','Demo Accident Site — NH16',20.2201,85.7431,'ICU bed + trauma specialist',1,'Critical','Simulated multi-vehicle incident. No patient-identifying data.','active');
INSERT INTO public.emergency_responses (emergency_id,facility_id,available_resource,distance_km,travel_minutes,status,responded_at) VALUES
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','2 ICU beds; trauma specialist available',4.2,11,'responded',now()-interval '3 minutes'),
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','1 ICU bed; availability check in progress',7.8,18,'pending',null),
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','No ICU beds',11.4,24,'unavailable',now()-interval '1 minute');

INSERT INTO public.notifications (title,description,notification_type,priority,facility_id,created_at) VALUES
('Critical Oxytocin shortage','CHC Jatni may deplete Oxytocin in under 3 days.','predicted_shortage','critical','10000000-0000-0000-0000-000000000003',now()-interval '9 minutes'),
('Emergency response received','Capital Hospital confirmed ICU capacity for Emergency #1048.','emergency_sos','high','10000000-0000-0000-0000-000000000002',now()-interval '14 minutes'),
('Facility data is stale','PHC Banki has not synchronized for over 3 hours.','offline_sync','medium','10000000-0000-0000-0000-000000000004',now()-interval '3 hours');