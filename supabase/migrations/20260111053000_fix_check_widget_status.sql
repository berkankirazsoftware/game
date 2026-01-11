-- Force update check_widget_status to ensure games and type are returned correctly

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
    SELECT is_active, 
           CASE 
               WHEN plan_type = 'free' THEN 50
               WHEN plan_type = 'basic' THEN 1000
               WHEN plan_type = 'advanced' THEN 10000
               ELSE 0
           END
    INTO v_has_active_plan, v_monthly_email_limit
    FROM subscriptions
    WHERE user_id = p_user_id;

    -- Get current email usage (count logs for current month)
    SELECT count(*)
    INTO v_current_email_usage
    FROM email_logs
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());

    -- Get active campaign (limit 1)
    SELECT * INTO v_active_campaign
    FROM campaigns
    WHERE user_id = p_user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Determine allowed status
    IF v_has_active_plan = true AND v_current_email_usage < v_monthly_email_limit AND v_active_campaign IS NOT NULL THEN
        -- Ensure 'games' is never null in the JSON
        v_result := jsonb_build_object(
            'allowed', true,
            'game_type', v_active_campaign.game_type,
            'theme', v_active_campaign.theme,
            'games', COALESCE(v_active_campaign.games, ARRAY[]::text[]), -- Default to empty array if null
            'type', COALESCE(v_active_campaign.type, 'popup') -- Default to popup if null
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
