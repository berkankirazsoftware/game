/*
  # Fix Subscriptions RLS for Widget Access

  1. Security Changes
    - Add anonymous read access for subscriptions (for widget)
    - Keep existing authenticated user policies
    - Ensure widget can read subscription data

  2. Notes
    - Widget needs to read subscription status
    - Anonymous users should be able to check subscription status
    - Maintains security for other operations
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Allow anonymous read access for widget functionality
CREATE POLICY "Allow anonymous subscription read for widget"
  ON subscriptions
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to read their own subscriptions
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own subscriptions
CREATE POLICY "Users can insert own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own subscriptions
CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);