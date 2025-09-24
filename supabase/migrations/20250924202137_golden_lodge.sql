/*
  # Fix coupon access for widget

  1. Security Changes
    - Add public read access for coupons table
    - Allow anonymous users to read coupons by user_id
    - Keep write operations protected for authenticated users only

  2. Changes
    - Add new RLS policy for anonymous coupon reading
    - This enables the widget to fetch coupons without authentication
*/

-- Add policy to allow anonymous users to read coupons
CREATE POLICY "Allow anonymous coupon reading for widget"
  ON coupons
  FOR SELECT
  TO anon
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;