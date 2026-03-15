
-- Shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- View to hide passwords from client queries
CREATE VIEW public.shops_public WITH (security_invoker=on) AS
  SELECT id, name, username, phone, address, active, created_at
  FROM public.shops;

-- Login verification function (password never exposed to client)
CREATE OR REPLACE FUNCTION public.verify_shop_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(shop_id UUID, shop_name TEXT, shop_username TEXT, shop_phone TEXT, shop_address TEXT, shop_active BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, s.name, s.username, s.phone, s.address, s.active
  FROM public.shops s
  WHERE s.username = p_username AND s.password = p_password AND s.active = true;
$$;

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT DEFAULT '',
  category TEXT DEFAULT '',
  buy_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  description TEXT DEFAULT '',
  imei TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  balance NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase')),
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  remaining NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT now()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'purchase')),
  amount NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ DEFAULT now(),
  notes TEXT DEFAULT ''
);

-- App settings (single row for global config)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_methods JSONB DEFAULT '[{"id":"cash","label":"كاش","active":true},{"id":"instapay","label":"انستاباي","active":true}]',
  categories JSONB DEFAULT '["هاتف","اكسسوارات","شاحن","سماعات","كفر","سكرينة","أخرى"]',
  currency TEXT DEFAULT 'ج.م',
  app_name TEXT DEFAULT 'Amr Cashier'
);

-- Insert default settings row
INSERT INTO public.app_settings (payment_methods, categories, currency, app_name)
VALUES (
  '[{"id":"cash","label":"كاش","active":true},{"id":"instapay","label":"انستاباي","active":true}]'::jsonb,
  '["هاتف","اكسسوارات","شاحن","سماعات","كفر","سكرينة","أخرى"]'::jsonb,
  'ج.م',
  'Amr Cashier'
);

-- Shop locks for dashboard/inventory password protection
CREATE TABLE public.shop_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  lock_type TEXT NOT NULL CHECK (lock_type IN ('dashboard', 'inventory')),
  password TEXT NOT NULL,
  UNIQUE(shop_id, lock_type)
);

-- Verify lock password (security definer - password never exposed)
CREATE OR REPLACE FUNCTION public.verify_lock_password(p_shop_id UUID, p_lock_type TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_locks
    WHERE shop_id = p_shop_id AND lock_type = p_lock_type AND password = p_password
  );
$$;

-- Change lock password (verifies current password first)
CREATE OR REPLACE FUNCTION public.change_lock_password(p_shop_id UUID, p_lock_type TEXT, p_current_password TEXT, p_new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.shop_locks WHERE shop_id = p_shop_id AND lock_type = p_lock_type) THEN
    INSERT INTO public.shop_locks (shop_id, lock_type, password) VALUES (p_shop_id, p_lock_type, p_new_password);
    RETURN true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shop_locks WHERE shop_id = p_shop_id AND lock_type = p_lock_type AND password = p_current_password) THEN
    RETURN false;
  END IF;
  UPDATE public.shop_locks SET password = p_new_password WHERE shop_id = p_shop_id AND lock_type = p_lock_type;
  RETURN true;
END;
$$;

-- Check if lock exists for a shop
CREATE OR REPLACE FUNCTION public.has_lock(p_shop_id UUID, p_lock_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_locks
    WHERE shop_id = p_shop_id AND lock_type = p_lock_type
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies - permissive for anon role (app handles auth logic client-side)
CREATE POLICY "anon_all_shops" ON public.shops FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_products" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_customers" ON public.customers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_invoices" ON public.invoices FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_invoice_items" ON public.invoice_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_transactions" ON public.transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_app_settings" ON public.app_settings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_shop_locks" ON public.shop_locks FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_products_shop_id ON public.products(shop_id);
CREATE INDEX idx_customers_shop_id ON public.customers(shop_id);
CREATE INDEX idx_invoices_shop_id ON public.invoices(shop_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_transactions_shop_id ON public.transactions(shop_id);
CREATE INDEX idx_shop_locks_shop_id ON public.shop_locks(shop_id);

-- Grant access to anon role
GRANT ALL ON public.shops TO anon;
GRANT ALL ON public.products TO anon;
GRANT ALL ON public.customers TO anon;
GRANT ALL ON public.invoices TO anon;
GRANT ALL ON public.invoice_items TO anon;
GRANT ALL ON public.transactions TO anon;
GRANT ALL ON public.app_settings TO anon;
GRANT ALL ON public.shop_locks TO anon;
GRANT SELECT ON public.shops_public TO anon;
