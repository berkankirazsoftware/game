-- Create coupon_codes table
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    code text NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(coupon_id, code)
);

-- Enable RLS
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own coupon codes"
    ON public.coupon_codes
    FOR ALL
    USING (auth.uid() = user_id);

-- Make coupons.code nullable
ALTER TABLE public.coupons
ALTER COLUMN code DROP NOT NULL;
