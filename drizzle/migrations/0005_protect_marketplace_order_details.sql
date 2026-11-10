REVOKE SELECT ON public.marketplace_inventory FROM anon, authenticated;
GRANT SELECT (product_id, title, category, price, amount_ngn, features, is_sold, reserved_until) ON public.marketplace_inventory TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_marketplace_credential_claim(_reference text, _claim_token_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_orders
    SET claim_token_hash = NULL
    WHERE reference = _reference
      AND status = 'paid'
      AND claim_token_hash = _claim_token_hash;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_marketplace_credential_claim(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_marketplace_credential_claim(text, text) TO service_role;