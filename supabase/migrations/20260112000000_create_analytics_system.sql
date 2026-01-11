-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL, -- 'impression', 'widget_open', 'game_select', 'game_complete'
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Index for faster reporting queries
CREATE INDEX IF NOT EXISTS analytics_events_user_id_created_at_idx ON public.analytics_events (user_id, created_at);

-- RPC to track events (called by widget)
CREATE OR REPLACE FUNCTION public.track_event(
    p_user_id uuid,
    p_event_type text,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.analytics_events (user_id, event_type, metadata)
    VALUES (p_user_id, p_event_type, p_metadata);
END;
$$;

-- RPC to get analytics report (called by dashboard)
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
    v_report jsonb;
BEGIN
    SELECT jsonb_object_agg(
        event_type, 
        count
    ) INTO v_report
    FROM (
        SELECT event_type, count(*) as count
        FROM public.analytics_events
        WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY event_type
    ) t;

    -- Return empty object if no data
    IF v_report IS NULL THEN
        v_report := '{}'::jsonb;
    END IF;

    -- Add some computed stats if needed, or handle in frontend
    -- For now, returning raw counts by type is sufficient for MVP
    
    RETURN v_report;
END;
$$;
