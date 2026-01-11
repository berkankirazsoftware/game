-- Fix claim_coupon function to remove dependency on subscriptions table
-- Enforces a hardcoded 100 email limit for all users (Free Plan MVP)

CREATE OR REPLACE FUNCTION public.claim_coupon(
  p_coupon_id uuid,
  p_email text,
  p_game_type text,
  p_guest_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon record;
  v_log_id uuid;
  v_monthly_usage integer;
  v_limit integer := 100; -- Hardcoded limit for Free MVP
BEGIN
  -- 1. Get coupon info
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id;
  
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;

  -- 2. Check Monthly Limits (Always enforce free limit)
  -- Count emails sent this month
  SELECT count(*) INTO v_monthly_usage
  FROM public.email_logs
  WHERE user_id = v_coupon.user_id
    AND created_at >= date_trunc('month', now());
    
  IF v_monthly_usage >= v_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aylık e-posta limitiniz doldu (100/100). Lütfen paketinizi yükseltin.');
  END IF;

  -- 3. Lock and Check Stock
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF v_coupon.quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;

  -- 4. Decrement & Log
  UPDATE public.coupons
  SET quantity = quantity - 1, used_count = used_count + 1
  WHERE id = p_coupon_id;

  INSERT INTO public.email_logs (
    user_id, email, coupon_code, game_type, discount_type, discount_value, status, sent_at
  ) VALUES (
    v_coupon.user_id, p_email, v_coupon.code, p_game_type, v_coupon.discount_type, v_coupon.discount_value, 'pending', now()
  ) RETURNING id INTO v_log_id;

  RETURN jsonb_build_object(
    'success', true, 
    'coupon_code', v_coupon.code, 
    'discount_value', v_coupon.discount_value, 
    'log_id', v_log_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
