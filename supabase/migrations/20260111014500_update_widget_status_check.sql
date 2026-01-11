/*
  # Update Widget Status Check
  
  Updates `check_widget_status` logic:
  1. Checks subscription limits (existing logic).
  2. NEW: Checks if user has at least one active coupon (quantity > 0).
     If no active coupons -> allowed: false.
*/

CREATE OR REPLACE FUNCTION public.check_widget_status(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub record;
  v_monthly_usage integer;
  v_limit integer := 100;
  v_has_coupons boolean;
BEGIN
  -- 1. Check for Active Coupons
  -- We require at least one coupon with quantity > 0
  SELECT EXISTS (
    SELECT 1 FROM public.coupons 
    WHERE user_id = p_user_id 
    AND quantity > 0
  ) INTO v_has_coupons;

  IF NOT v_has_coupons THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'No active coupons found'
    );
  END IF;

  -- 2. Get Subscription
  SELECT * INTO v_sub FROM public.subscriptions WHERE user_id = p_user_id;

  -- Default to free logic if no sub found or explicitly free
  IF v_sub IS NULL OR v_sub.plan_type = 'free' THEN
    
    -- Count emails sent this month
    SELECT count(*) INTO v_monthly_usage
    FROM public.email_logs
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('month', now());
      
    IF v_monthly_usage >= v_limit THEN
      RETURN jsonb_build_object(
        'allowed', false, 
        'reason', 'Monthly limit reached'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;
