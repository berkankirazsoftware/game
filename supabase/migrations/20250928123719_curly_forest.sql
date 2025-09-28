/*
  # Create email_logs table

  1. New Tables
    - `email_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `email` (text, recipient email)
      - `coupon_code` (text, coupon code sent)
      - `game_type` (text, which game was played)
      - `discount_type` (text, percentage or fixed)
      - `discount_value` (integer, discount amount)
      - `email_service_id` (text, external service ID)
      - `status` (text, sent/failed/pending)
      - `sent_at` (timestamp, when email was sent)
      - `created_at` (timestamp, record creation time)

  2. Security
    - Enable RLS on `email_logs` table
    - Add policy for users to view their own email logs
    - Add policy for users to insert their own email logs

  3. Constraints
    - Check constraints for discount_type and status values
    - Foreign key reference to profiles table
    - Default values for timestamps and status
*/

CREATE TABLE IF NOT EXISTS public.email_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    email text NOT NULL,
    coupon_code text NOT NULL,
    game_type text NOT NULL,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value integer NOT NULL,
    email_service_id text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email logs" ON public.email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);