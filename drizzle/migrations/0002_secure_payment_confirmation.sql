REVOKE SELECT ON public.marketplace_inventory FROM anon, authenticated;
CREATE VIEW public.marketplace_catalog AS
SELECT product_id, title, category, price, amount_ngn, features, is_sold,
       (NOT is_sold AND reserved_until IS NOT NULL AND reserved_until > now()) AS is_reserved
FROM public.marketplace_inventory;
GRANT SELECT ON public.marketplace_catalog TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.finalize_marketplace_payment(_reference text, _amount_ngn integer, _provider_status text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.marketplace_orders%ROWTYPE;
  v_claimed integer;
BEGIN
  IF _provider_status NOT IN ('success', 'failed') THEN
    RETURN 'invalid_status';
  END IF;

  SELECT * INTO v_order
  FROM public.marketplace_orders
  WHERE reference = _reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'missing';
  END IF;

  IF v_order.amount_ngn <> _amount_ngn THEN
    RETURN 'amount_mismatch';
  END IF;

  IF v_order.status = 'paid' THEN
    RETURN 'paid';
  END IF;

  IF v_order.status <> 'pending' THEN
    RETURN v_order.status;
  END IF;

  IF _provider_status = 'failed' THEN
    UPDATE public.marketplace_orders SET status = 'failed' WHERE reference = _reference AND status = 'pending';
    UPDATE public.marketplace_inventory
      SET reserved_order_reference = NULL, reserved_until = NULL
      WHERE product_id = v_order.product_id
        AND reserved_order_reference = _reference
        AND is_sold = false;
    RETURN 'failed';
  END IF;

  UPDATE public.marketplace_inventory
    SET is_sold = true,
        sold_order_reference = _reference,
        sold_at = now(),
        reserved_order_reference = NULL,
        reserved_until = NULL
    WHERE product_id = v_order.product_id
      AND is_sold = false
      AND reserved_order_reference = _reference
      AND reserved_until > now();
  GET DIAGNOSTICS v_claimed = ROW_COUNT;

  IF v_claimed <> 1 THEN
    UPDATE public.marketplace_orders SET status = 'conflict' WHERE reference = _reference AND status = 'pending';
    RETURN 'conflict';
  END IF;

  UPDATE public.marketplace_orders
    SET status = 'paid', paid_at = now()
    WHERE reference = _reference AND status = 'pending';

  RETURN 'paid';
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_marketplace_payment(text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_marketplace_payment(text, integer, text) TO service_role;