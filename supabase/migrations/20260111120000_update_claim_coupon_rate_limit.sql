-- Update claim_coupon to enforce 24-hour rate limit per email
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
  v_unique_code record;
  v_log_id uuid;
  v_monthly_usage integer;
  v_recent_claim_count integer;
  v_limit integer := 100;
  v_final_code text;
BEGIN
  -- 1. Get coupon info (without locking yet)
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id;
  
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;

  -- 2. Check Monthly Limits
  SELECT count(*) INTO v_monthly_usage
  FROM public.email_logs
  WHERE user_id = v_coupon.user_id
    AND created_at >= date_trunc('month', now());
    
  IF v_monthly_usage >= v_limit THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aylık e-posta limitiniz doldu (100/100). Lütfen paketinizi yükseltin.');
  END IF;

  -- 2b. Rate Limiting (24 Hours) - NEW
  SELECT count(*) INTO v_recent_claim_count
  FROM public.email_logs
  WHERE email = p_email
    AND user_id = v_coupon.user_id
    AND created_at > now() - interval '24 hours';

  IF v_recent_claim_count > 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Bu e-posta adresiyle son 24 saat içinde zaten bir kupon aldınız.');
  END IF;

  -- 3. Lock Main Coupon Record
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  -- Check global quantity (still applies for both types)
  IF v_coupon.quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;

  -- 4. Determine Code Strategy
  IF v_coupon.code IS NOT NULL THEN
    -- Strategy A: Single Generic Code
    v_final_code := v_coupon.code;
  ELSE
    -- Strategy B: Unique Codes from Pool
    -- Lock and select a random unused code
    SELECT * INTO v_unique_code
    FROM public.coupon_codes
    WHERE coupon_id = p_coupon_id
      AND is_used = false
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_unique_code IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No unique codes available');
    END IF;

    v_final_code := v_unique_code.code;
    
    -- Mark specific code as used
    UPDATE public.coupon_codes
    SET is_used = true
    WHERE id = v_unique_code.id;
  END IF;

  -- 5. Decrement Global Stock & Log
  UPDATE public.coupons
  SET quantity = quantity - 1, used_count = used_count + 1
  WHERE id = p_coupon_id;

  INSERT INTO public.email_logs (
    user_id, email, coupon_code, game_type, discount_type, discount_value, status, sent_at
  ) VALUES (
    v_coupon.user_id, p_email, v_final_code, p_game_type, v_coupon.discount_type, v_coupon.discount_value, 'pending', now()
  ) RETURNING id INTO v_log_id;

  RETURN jsonb_build_object(
    'success', true, 
    'coupon_code', v_final_code, 
    'discount_value', v_coupon.discount_value, 
    'log_id', v_log_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
