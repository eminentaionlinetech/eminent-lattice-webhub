CREATE OR REPLACE VIEW public.marketplace_catalog WITH (security_invoker = true) AS
SELECT product_id, title, category, price, amount_ngn, features, is_sold,
       (NOT is_sold AND reserved_until IS NOT NULL AND reserved_until > now()) AS is_reserved
FROM public.marketplace_inventory;
GRANT SELECT ON public.marketplace_catalog TO anon, authenticated, service_role;