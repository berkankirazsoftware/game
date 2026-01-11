/*
  # Free Plan Implementation
  
  1. Changes
    - Update `subscriptions` table check constraint to allow 'free'.
    - Create a trigger to insert 'free' subscription when a new user registers.
    - Update `claim_coupon` function to check for monthly limits.
*/

-- 1. Update Check Constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type IN ('free', 'basic', 'advanced'));

-- 2. Create Trigger Function for Auto-Subscription
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, is_active, start_date)
  VALUES (new.id, 'free', true, now());
  RETURN new;
END;
$$;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
-- Note: We usually trigger on public.profiles creation if that handles user setup, 
-- but auth.users is the source of truth. 
-- However, creating it on public.profiles is safer if we want to ensure profile exists first (which implies user exists).
-- Let's stick to inserting into subscriptions directly based on auth.users if possible, or profiles.
-- The existing app seems to use profiles. Let's assume on profile creation.

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 4. Update claim_coupon logic to enforce limits
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
  v_sub record;
  v_monthly_usage integer;
  v_limit integer := 100;
BEGIN
  -- 1. Check Subscription & Limits
  -- Get coupon owner's subscription
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id;
  
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;

  SELECT * INTO v_sub FROM public.subscriptions WHERE user_id = v_coupon.user_id;

  -- Default to free limit if no sub found (shouldn't happen with trigger)
  IF v_sub IS NULL OR v_sub.plan_type = 'free' THEN
    
    -- Count emails sent this month
    SELECT count(*) INTO v_monthly_usage
    FROM public.email_logs
    WHERE user_id = v_coupon.user_id
      AND created_at >= date_trunc('month', now());
      
    IF v_monthly_usage >= v_limit THEN
      RETURN jsonb_build_object('success', false, 'error', 'Aylık e-posta limitiniz doldu (100/100). Lütfen paketinizi yükseltin.');
    END IF;
  END IF;

  -- 2. Lock and Check Stock (Existing Logic)
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF v_coupon.quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;

  -- 3. Decrement & Log
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
