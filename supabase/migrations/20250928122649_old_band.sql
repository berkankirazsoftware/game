/*
  # Email logs table for tracking sent coupons

  1. New Tables
    - `email_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `email` (text, recipient email)
      - `coupon_code` (text, sent coupon code)
      - `game_type` (text, which game was played)
      - `discount_type` (text, percentage or fixed)
      - `discount_value` (numeric, discount amount)
      - `sent_at` (timestamp, when email was sent)
      - `email_service_id` (text, external service email ID)
      - `status` (text, sent/failed/pending)

  2. Security
    - Enable RLS on `email_logs` table
    - Add policy for users to read their own email logs
    - Add policy for authenticated users to insert email logs

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on email for tracking
    - Add index on sent_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  coupon_code text NOT NULL,
  game_type text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  sent_at timestamptz DEFAULT now(),
  email_service_id text,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow anonymous email log insertion for widget"
  ON email_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_coupon_code ON email_logs(coupon_code);