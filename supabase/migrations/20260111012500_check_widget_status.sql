/*
  # Widget Status Check RPC
  
  Creates a function `check_widget_status` to determine if the widget should be visible.
  
  Logic:
  1. If user is on 'free' plan and has sent >= 100 emails this month -> allowed: false
  2. Otherwise -> allowed: true
  
  This function is SECURITY DEFINER to access subscription and logs data.
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
BEGIN
  -- 1. Get Subscription
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
