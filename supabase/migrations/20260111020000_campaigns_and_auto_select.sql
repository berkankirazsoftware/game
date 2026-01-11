/*
  # Campaigns & Auto-Select Logic

  1. Create `campaigns` table to store widget configurations.
  2. Update `check_widget_status` to:
     - Check limits (existing).
     - Check coupons (existing).
     - Fetch ACTIVE campaign for the user.
     - Return `game_type` and `theme` of the active campaign.
*/

-- 1. Create Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  game_type text NOT NULL, -- 'wheel', 'circle-dash', 'memory'
  status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'ended')),
  theme text DEFAULT 'light',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own campaigns"
  ON public.campaigns
  FOR ALL
  USING (auth.uid() = user_id);

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

  -- If no active campaign, maybe allowed=false? Or fallback?
  -- User request: "aktif boosteyi seçip o otomatik şekidle gösterilmeli"
  -- If no active campaign, we can't show anything automatically.
  
  IF v_active_campaign IS NULL THEN
     -- If generic widget usage is allowed, maybe return allowed=true but no game (defaults to manual selection if script provides list, OR nothing).
     -- Let's return allowed=false or allowed=true with no game_type.
     -- Let's return allowed=true but null game_type -> Widget might show selection screen or fallback.
     RETURN jsonb_build_object(
        'allowed', true,
        'game_type', null
     );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'game_type', v_active_campaign.game_type,
    'theme', v_active_campaign.theme
  );
END;
$$;
