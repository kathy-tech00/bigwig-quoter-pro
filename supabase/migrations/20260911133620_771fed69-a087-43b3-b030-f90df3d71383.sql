CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER POLICY "Admins manage company settings" ON public.company_settings USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
ALTER POLICY "Admins manage clients" ON public.clients USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin') AND owner_id = auth.uid());
ALTER POLICY "Admins manage quotations" ON public.quotations USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin') AND owner_id = auth.uid());
ALTER POLICY "Admins manage quotation items" ON public.quotation_items USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND private.has_role(auth.uid(),'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND q.owner_id = auth.uid() AND private.has_role(auth.uid(),'admin')));
ALTER POLICY "Admins manage invoices" ON public.invoices USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin') AND owner_id = auth.uid());
ALTER POLICY "Admins manage payments" ON public.payments USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin') AND owner_id = auth.uid());

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.has_role(uuid, public.app_role);