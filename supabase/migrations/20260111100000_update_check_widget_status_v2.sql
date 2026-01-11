-- Update check_widget_status to include widget_config and games from profile
CREATE OR REPLACE FUNCTION public.check_widget_status(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_monthly_email_limit int := 100; -- Default free limit
    v_current_email_usage int;
    v_active_campaign record;
    v_widget_config jsonb;
    v_result jsonb;
BEGIN
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

    -- Get widget config
    SELECT widget_config INTO v_widget_config
    FROM profiles
    WHERE id = p_user_id;

    -- Determine allowed status
    IF v_current_email_usage < v_monthly_email_limit AND v_active_campaign IS NOT NULL THEN
        v_result := jsonb_build_object(
            'allowed', true,
            'game_type', v_active_campaign.game_type,
            'theme', v_active_campaign.theme,
            'games', COALESCE(v_active_campaign.games, ARRAY[]::text[]),
            'type', COALESCE(v_active_campaign.type, 'popup'),
            'config', COALESCE(v_widget_config, '{"cooldown_minutes": 1440}'::jsonb)
        );
    ELSE
         v_result := jsonb_build_object(
            'allowed', false,
            'reason', CASE 
                WHEN v_current_email_usage >= v_monthly_email_limit THEN 'limit_exceeded'
                WHEN v_active_campaign IS NULL THEN 'no_active_campaign'
                ELSE 'unknown'
            END,
            'config', COALESCE(v_widget_config, '{"cooldown_minutes": 1440}'::jsonb)
        );
    END IF;

    RETURN v_result;
END;
$function$;
