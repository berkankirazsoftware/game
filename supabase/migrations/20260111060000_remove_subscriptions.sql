-- Remove subscriptions system and update widget logic

-- 1. Drop subscriptions table and related triggers
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop trigger on profiles if exists (it was creating subscriptions)
DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription;

-- 2. Update check_widget_status to generic free logic
CREATE OR REPLACE FUNCTION public.check_widget_status(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_monthly_email_limit int := 100; -- Default free limit
    v_current_email_usage int;
    v_active_campaign record;
    v_result jsonb;
BEGIN
    -- No subscription check anymore, everyone is generic free plan

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
    IF v_current_email_usage < v_monthly_email_limit AND v_active_campaign IS NOT NULL THEN
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
                WHEN v_current_email_usage >= v_monthly_email_limit THEN 'limit_exceeded'
                WHEN v_active_campaign IS NULL THEN 'no_active_campaign'
                ELSE 'unknown'
            END
        );
    END IF;

    RETURN v_result;
END;
$function$;
