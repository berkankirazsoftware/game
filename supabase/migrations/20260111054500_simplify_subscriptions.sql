-- Simplify subscriptions table and update limits

-- 1. Remove unnecessary columns
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS expiration_date,
DROP COLUMN IF EXISTS start_date;

-- 2. Update check_widget_status with new limit (100)
CREATE OR REPLACE FUNCTION public.check_widget_status(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_has_active_plan boolean;
    v_monthly_email_limit int;
    v_current_email_usage int;
    v_active_campaign record;
    v_result jsonb;
BEGIN
    -- Check if user has active plan
    -- Simplified: Just check if record exists and is_active. 
    -- We assume 'free' plan or whatever is there implies the default limit for now.
    SELECT is_active, 
           CASE 
               WHEN plan_type = 'free' THEN 100 -- Updated to 100
               WHEN plan_type = 'basic' THEN 1000
               WHEN plan_type = 'advanced' THEN 10000
               ELSE 100 -- Default fallback
           END
    INTO v_has_active_plan, v_monthly_email_limit
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- Get current email usage
    SELECT count(*)
    INTO v_current_email_usage
    FROM email_logs
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());

    -- Get active campaign
    SELECT * INTO v_active_campaign
    FROM campaigns
    WHERE user_id = p_user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Determine allowed status
    IF v_has_active_plan = true AND v_current_email_usage < v_monthly_email_limit AND v_active_campaign IS NOT NULL THEN
        v_result := jsonb_build_object(
            'allowed', true,
            'game_type', v_active_campaign.game_type,
            'theme', v_active_campaign.theme,
            'games', COALESCE(v_active_campaign.games, ARRAY[]::text[]),
            'type', COALESCE(v_active_campaign.type, 'popup')
        );
    ELSE
         v_result := jsonb_build_object(
            'allowed', false,
            'reason', CASE 
                WHEN v_has_active_plan IS NOT true THEN 'no_active_plan'
                WHEN v_current_email_usage >= v_monthly_email_limit THEN 'limit_exceeded'
                WHEN v_active_campaign IS NULL THEN 'no_active_campaign'
                ELSE 'unknown'
            END
        );
    END IF;

    RETURN v_result;
END;
$function$;
