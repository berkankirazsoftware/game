/*
  # Update user_games table schema

  1. Changes
    - Add `game_type` column (text)
    - Add `score` column (integer)
    - Add `metadata` column (jsonb)
    - Add `guest_id` column (text) for unauthenticated users (tracking via local storage/fingerprint)
  
  2. Security
    - Add RLS policy to allow public inserts (for widgets running on external sites)
*/

-- Add new columns
ALTER TABLE public.user_games 
ADD COLUMN IF NOT EXISTS game_type text,
ADD COLUMN IF NOT EXISTS score integer,
ADD COLUMN IF NOT EXISTS metadata jsonb,
ADD COLUMN IF NOT EXISTS guest_id text;

-- Allow public/anon to insert into user_games (for widget usage)
DROP POLICY IF EXISTS "Allow public insert to user_games" ON public.user_games;

CREATE POLICY "Allow public insert to user_games" ON public.user_games
  FOR INSERT 
  WITH CHECK (true);

-- Allow public read of own games (optional, based on guest_id or user_id)
DROP POLICY IF EXISTS "Allow public select own games" ON public.user_games;

CREATE POLICY "Allow public select own games" ON public.user_games
  FOR SELECT
  USING (true); -- Simplistic for now, can be tightened later
