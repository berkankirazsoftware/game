-- Update get_analytics_report to include funnel metrics
CREATE OR REPLACE FUNCTION public.get_analytics_report(
    p_user_id uuid,
    p_start_date timestamptz DEFAULT date_trunc('month', now()),
    p_end_date timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_impressions bigint;
    v_total_opens bigint;
    v_total_game_plays bigint;
    v_total_conversions bigint;
    v_total_cart_visits bigint;
    v_total_checkout_visits bigint;
    v_total_purchases bigint;
    v_daily_stats jsonb;
    v_platform_stats jsonb;
    v_language_stats jsonb;
    v_coupon_stats jsonb;
    v_game_stats jsonb;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'widget_open' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'game_select' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'game_complete' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'page_view_cart' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'page_view_checkout' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN event_type = 'conversion_purchase' THEN 1 ELSE 0 END), 0)
    INTO 
        v_total_impressions,
        v_total_opens,
        v_total_game_plays,
        v_total_conversions,
        v_total_cart_visits,
        v_total_checkout_visits,
        v_total_purchases
    FROM public.analytics_events
    WHERE user_id = p_user_id
        AND created_at BETWEEN p_start_date AND p_end_date;

    -- Calculate daily stats
    SELECT jsonb_agg(daily)
    INTO v_daily_stats
    FROM (
        SELECT 
            to_char(date_trunc('day', d), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as date,
            COALESCE(SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END), 0) as impressions,
            COALESCE(SUM(CASE WHEN event_type = 'widget_open' THEN 1 ELSE 0 END), 0) as opens,
            COALESCE(SUM(CASE WHEN event_type = 'game_complete' THEN 1 ELSE 0 END), 0) as conversions
        FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
        LEFT JOIN public.analytics_events e 
            ON date_trunc('day', e.created_at) = date_trunc('day', d)
            AND e.user_id = p_user_id
        GROUP BY 1
        ORDER BY 1
    ) daily;

    -- Calculate Platform Stats
    SELECT jsonb_agg(p_stats) INTO v_platform_stats
    FROM (
        SELECT 
            COALESCE(metadata->>'platform', 'Unknown') as name,
            count(*) as value
        FROM public.analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'impression'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 5
    ) p_stats;

    -- Calculate Language Stats
    SELECT jsonb_agg(l_stats) INTO v_language_stats
    FROM (
        SELECT 
            COALESCE(metadata->>'language', 'Unknown') as name,
            count(*) as value
        FROM public.analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'impression'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 5
    ) l_stats;

    -- Calculate Coupon Stats
    SELECT jsonb_agg(c_stats) INTO v_coupon_stats
    FROM (
        SELECT 
            COALESCE(metadata->>'discount', 'Unknown') || ' - ' || COALESCE(metadata->>'coupon_code', 'No Code') as name,
            count(*) as value
        FROM public.analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'game_complete'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
    ) c_stats;

    -- Calculate Game Stats
    SELECT jsonb_agg(g_stats) INTO v_game_stats
    FROM (
        SELECT 
            COALESCE(metadata->>'game', 'Unknown') as name,
            count(*) as value
        FROM public.analytics_events
        WHERE user_id = p_user_id
          AND event_type = 'game_select'
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY 1
        ORDER BY 2 DESC
    ) g_stats;

    IF v_daily_stats IS NULL THEN v_daily_stats := '[]'::jsonb; END IF;
    IF v_platform_stats IS NULL THEN v_platform_stats := '[]'::jsonb; END IF;
    IF v_language_stats IS NULL THEN v_language_stats := '[]'::jsonb; END IF;
    IF v_coupon_stats IS NULL THEN v_coupon_stats := '[]'::jsonb; END IF;
    IF v_game_stats IS NULL THEN v_game_stats := '[]'::jsonb; END IF;

    RETURN jsonb_build_object(
        'impressions', v_total_impressions,
        'opens', v_total_opens,
        'game_plays', v_total_game_plays,
        'conversions', v_total_conversions,
        'cart_visits', v_total_cart_visits,
        'checkout_visits', v_total_checkout_visits,
        'purchases', v_total_purchases,
        'daily_stats', v_daily_stats,
        'platform_stats', v_platform_stats,
        'language_stats', v_language_stats,
        'coupon_stats', v_coupon_stats,
        'game_stats', v_game_stats
    );
END;
$$;
