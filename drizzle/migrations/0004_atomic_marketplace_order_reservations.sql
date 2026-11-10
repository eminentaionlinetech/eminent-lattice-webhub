CREATE OR REPLACE FUNCTION public.reserve_marketplace_order(
  _product_id text,
  _reference text,
  _customer_email text,
  _payment_method text,
  _claim_token_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.marketplace_inventory%ROWTYPE;
BEGIN
  IF _payment_method NOT IN ('card', 'bank_transfer', 'pay_with_bank') THEN
    RETURN jsonb_build_object('status', 'invalid_method');
  END IF;

  SELECT * INTO v_listing
  FROM public.marketplace_inventory
  WHERE product_id = _product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'missing');
  END IF;

  IF v_listing.is_sold THEN
    RETURN jsonb_build_object('status', 'sold');
  END IF;

  IF v_listing.reserved_until IS NOT NULL AND v_listing.reserved_until > now() THEN
    RETURN jsonb_build_object('status', 'reserved');
  END IF;

  IF v_listing.reserved_order_reference IS NOT NULL THEN
    UPDATE public.marketplace_orders
      SET status = 'failed'
      WHERE reference = v_listing.reserved_order_reference
        AND status = 'pending';
  END IF;

  UPDATE public.marketplace_inventory
    SET reserved_order_reference = _reference,
        reserved_until = now() + interval '30 minutes'
    WHERE product_id = _product_id;

  INSERT INTO public.marketplace_orders (
    reference, product_id, customer_email, amount_ngn, payment_method, status, claim_token_hash
  ) VALUES (
    _reference, _product_id, lower(_customer_email), v_listing.amount_ngn, _payment_method, 'pending', _claim_token_hash
  );

  RETURN jsonb_build_object('status', 'reserved', 'amount_ngn', v_listing.amount_ngn, 'title', v_listing.title);
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_marketplace_order(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_marketplace_order(text, text, text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.release_marketplace_order(_reference text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.marketplace_orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.marketplace_orders WHERE reference = _reference FOR UPDATE;
  IF NOT FOUND OR v_order.status <> 'pending' THEN
    RETURN false;
  END IF;

  UPDATE public.marketplace_orders SET status = 'failed' WHERE reference = _reference AND status = 'pending';
  UPDATE public.marketplace_inventory
    SET reserved_order_reference = NULL, reserved_until = NULL
    WHERE product_id = v_order.product_id
      AND reserved_order_reference = _reference
      AND is_sold = false;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.release_marketplace_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_marketplace_order(text) TO service_role;