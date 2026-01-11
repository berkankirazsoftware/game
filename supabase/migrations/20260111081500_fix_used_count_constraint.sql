-- Fix coupons used_count check constraint
-- Original constraint might have been incorrectly comparing used_count to quantity (which decreases).
-- We want to ensure used_count is just non-negative.

ALTER TABLE public.coupons 
DROP CONSTRAINT IF EXISTS coupons_used_count_check;

ALTER TABLE public.coupons 
ADD CONSTRAINT coupons_used_count_check 
CHECK (used_count >= 0);
