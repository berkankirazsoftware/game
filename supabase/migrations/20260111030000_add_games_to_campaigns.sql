/*
  # Add Games Array to Campaigns

  1. Add `games` column to `campaigns` table (text[]).
  2. Update `check_widget_status` to return `games` array.
*/

-- 1. Add games column
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS games text[] DEFAULT '{}';

-- 2. Update Widget Check Function
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
  v_active_campaign record;
BEGIN
  -- 1. Check for Active Coupons
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

  -- 2. Get Subscription & Limits
  SELECT * INTO v_sub FROM public.subscriptions WHERE user_id = p_user_id;

  IF v_sub IS NULL OR v_sub.plan_type = 'free' THEN
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

  -- 3. Fetch Active Campaign
  SELECT * INTO v_active_campaign
  FROM public.campaigns
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY updated_at DESC
  LIMIT 1;
  
  IF v_active_campaign IS NULL THEN
     RETURN jsonb_build_object(
        'allowed', true,
        'game_type', null,
        'games', '[]'::jsonb
     );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'game_type', v_active_campaign.game_type, -- Keep for legacy if needed, or primary
    'games', v_active_campaign.games,
    'theme', v_active_campaign.theme
  );
END;
$$;
