-- Fix coupons quantity check constraint
-- Original constraint might have been "quantity > 0", preventing it from reaching 0.
-- We want "quantity >= 0".

ALTER TABLE public.coupons 
DROP CONSTRAINT IF EXISTS coupons_quantity_check;

ALTER TABLE public.coupons 
ADD CONSTRAINT coupons_quantity_check 
CHECK (quantity >= 0);
