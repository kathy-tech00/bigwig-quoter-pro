CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.quotation_status AS ENUM ('draft','sent','viewed','accepted','rejected','expired','invoiced');
CREATE TYPE public.invoice_status AS ENUM ('unpaid','partially_paid','paid','overdue');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "First user can claim admin" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'admin' AND NOT EXISTS (SELECT 1 FROM public.user_roles));

CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  company_name text NOT NULL CHECK (char_length(company_name) BETWEEN 2 AND 200),
  tagline text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  registration_number text NOT NULL DEFAULT '',
  signatory_name text NOT NULL DEFAULT '',
  signatory_position text NOT NULL DEFAULT '',
  ngn_bank jsonb NOT NULL DEFAULT '{}'::jsonb,
  usd_bank jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_exchange_rate numeric(14,4) NOT NULL DEFAULT 1600 CHECK (default_exchange_rate > 0),
  quote_prefix text NOT NULL DEFAULT 'BABC-Q',
  invoice_prefix text NOT NULL DEFAULT 'BABC-I',
  default_expiry_days integer NOT NULL DEFAULT 14 CHECK (default_expiry_days BETWEEN 1 AND 365),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage company settings" ON public.company_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  company_name text NOT NULL DEFAULT '' CHECK (char_length(company_name) <= 160),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 30),
  email text NOT NULL DEFAULT '' CHECK (char_length(email) <= 255),
  project_address text NOT NULL DEFAULT '' CHECK (char_length(project_address) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND owner_id = auth.uid());

CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  quotation_number text NOT NULL UNIQUE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  project_address text NOT NULL DEFAULT '',
  issue_date date NOT NULL DEFAULT current_date,
  expiry_date date NOT NULL,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN','USD')),
  exchange_rate numeric(14,4) NOT NULL CHECK (exchange_rate > 0),
  subtotal_minor bigint NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  grand_total_minor bigint NOT NULL DEFAULT 0 CHECK (grand_total_minor >= 0),
  deposit_minor bigint NOT NULL DEFAULT 0 CHECK (deposit_minor >= 0),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 3000),
  public_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  accepted_at timestamptz,
  rejected_at timestamptz,
  signature_name text CHECK (char_length(signature_name) <= 150),
  signature_data text CHECK (char_length(signature_data) <= 250000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quotations" ON public.quotations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND owner_id = auth.uid());

CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  unit text NOT NULL DEFAULT 'item' CHECK (char_length(unit) <= 30),
  quantity numeric(14,3) NOT NULL CHECK (quantity > 0),
  rate_minor bigint NOT NULL CHECK (rate_minor >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT ALL ON public.quotation_items TO service_role;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage quotation items" ON public.quotation_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND public.has_role(auth.uid(),'admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quotation_id AND q.owner_id = auth.uid() AND public.has_role(auth.uid(),'admin')));

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL,
  currency text NOT NULL CHECK (currency IN ('NGN','USD')),
  exchange_rate numeric(14,4) NOT NULL CHECK (exchange_rate > 0),
  total_minor bigint NOT NULL CHECK (total_minor >= 0),
  paid_minor bigint NOT NULL DEFAULT 0 CHECK (paid_minor >= 0),
  status public.invoice_status NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND owner_id = auth.uid());

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL CHECK (currency IN ('NGN','USD')),
  paid_at timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL DEFAULT 'Bank transfer' CHECK (char_length(method) <= 80),
  reference text NOT NULL DEFAULT '' CHECK (char_length(reference) <= 120),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin') AND owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER company_settings_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER quotations_updated BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX quotations_owner_status_idx ON public.quotations(owner_id, status);
CREATE INDEX quotations_expiry_idx ON public.quotations(expiry_date);
CREATE INDEX invoices_owner_status_idx ON public.invoices(owner_id, status);
CREATE INDEX quotation_items_quote_idx ON public.quotation_items(quotation_id, position);
CREATE INDEX payments_invoice_idx ON public.payments(invoice_id, paid_at DESC);