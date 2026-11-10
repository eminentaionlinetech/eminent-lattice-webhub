CREATE TABLE public.marketplace_inventory (
  product_id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  price text NOT NULL,
  amount_ngn integer NOT NULL CHECK (amount_ngn > 0),
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_sold boolean NOT NULL DEFAULT false,
  reserved_order_reference text,
  reserved_until timestamptz,
  sold_order_reference text,
  sold_at timestamptz
);
GRANT SELECT ON public.marketplace_inventory TO anon, authenticated;
GRANT ALL ON public.marketplace_inventory TO service_role;
ALTER TABLE public.marketplace_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketplace listings are publicly readable" ON public.marketplace_inventory FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.marketplace_inventory (product_id, title, category, price, amount_ngn, features, is_sold) VALUES
('lattice-elite-fashion', 'Lattice Elite Fashion Portal', 'Fashion & Retail', '₦200,000', 200000, '["Lookbook gallery","Size/color variant selectors","Instagram feed integration","Korapay ready"]'::jsonb, false),
('aerofit-wellness', 'AeroFit Wellness Portal', 'Fitness & Gym', '₦180,000', 180000, '["Booking schedule calendar","Product store","Weight/transformation tracker UI","Video tutorial hub"]'::jsonb, false),
('omnivendor-smart-store', 'OmniVendor Smart Store', 'General E-Commerce', '₦150,000', 150000, '["Quick checkout buttons","WhatsApp ordering fallback chat","Inventory count banners"]'::jsonb, false),
('apex-corporate-hub', 'Apex Corporate Hub', 'Professional Services', '₦250,000', 250000, '["High-converting quote request forms","Live WhatsApp support floating button","Client testimonials layout"]'::jsonb, false),
('bitespeed-food-bakery', 'BiteSpeed Food & Bakery Delivery', 'Restaurant & Catering', '₦180,000', 180000, '["Interactive digital menu","Delivery fee calculator by location","Instant order notifications"]'::jsonb, false),
('lattice-chronicle-media', 'Lattice Chronicle Media Blog', 'Content & Media', '₦100,000', 100000, '["Google AdSense monetization layout","Newsletter subscription form","Fast loading speed"]'::jsonb, false);

CREATE TABLE public.marketplace_orders (
  reference text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.marketplace_inventory(product_id),
  customer_email text NOT NULL,
  amount_ngn integer NOT NULL CHECK (amount_ngn > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'pay_with_bank')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'conflict')),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT ALL ON public.marketplace_orders TO service_role;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX marketplace_orders_product_id_idx ON public.marketplace_orders (product_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'marketplace_inventory'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_inventory;
  END IF;
END
$$;