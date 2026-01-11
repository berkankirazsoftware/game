/*
  # Secure Coupon Claiming Logic
  
  1. New Function: `claim_coupon`
    - Atomically checks stock and decrements it.
    - Inserts a log into `email_logs`.
    - Returns the claimed coupon code if successful.
  
  2. Security
    - Function will be callable by public (anon) but internally checks for quantity.
    - Uses `SECURITY DEFINER` to bypass RLS for the update/insert operations inside the function, 
      while controlling access via the function logic itself.
*/

CREATE OR REPLACE FUNCTION public.claim_coupon(
  p_coupon_id uuid,
  p_email text,
  p_game_type text,
  p_guest_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Run as owner to bypass RLS on update/insert
AS $$
DECLARE
  v_coupon record;
  v_log_id uuid;
BEGIN
  -- 1. Lock the coupon row for update to prevent race conditions
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  -- 2. Check if coupon exists and has stock
  IF v_coupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;

  IF v_coupon.quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Out of stock');
  END IF;

  -- 3. Decrement quantity and increment used_count
  UPDATE public.coupons
  SET 
    quantity = quantity - 1,
    used_count = used_count + 1
  WHERE id = p_coupon_id;

  -- 4. Insert into email_logs
  INSERT INTO public.email_logs (
    user_id, -- Merchant ID (owner of the coupon)
    email,
    coupon_code,
    game_type,
    discount_type,
    discount_value,
    status,
    sent_at
  ) VALUES (
    v_coupon.user_id,
    p_email,
    v_coupon.code,
    p_game_type,
    v_coupon.discount_type,
    v_coupon.discount_value,
    'pending', -- Will be updated to 'sent' when email edge function succeeds
    now()
  ) RETURNING id INTO v_log_id;

  -- 5. Return success info
  RETURN jsonb_build_object(
    'success', true,
    'coupon_code', v_coupon.code,
    'discount_value', v_coupon.discount_value,
    'log_id', v_log_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
