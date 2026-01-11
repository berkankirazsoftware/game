-- Backfill subscriptions for existing users who might have been created before the trigger existed

-- 1. Insert for users found in campaigns table
INSERT INTO public.subscriptions (id, user_id, plan_type, is_active, start_date, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    user_id, 
    'free', 
    true, 
    now(), 
    now(), 
    now()
FROM (
    SELECT DISTINCT user_id FROM public.campaigns
) c
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id = c.user_id
);

-- 2. Insert for users found in profiles table (if any missed by campaigns)
INSERT INTO public.subscriptions (id, user_id, plan_type, is_active, start_date, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    id as user_id, 
    'free', 
    true, 
    now(), 
    now(), 
    now()
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id
);
