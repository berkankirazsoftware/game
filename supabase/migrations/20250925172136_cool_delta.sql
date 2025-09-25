/*
  # Remove games table and update related tables

  1. Changes
    - Drop games table (no longer needed - games are static in frontend)
    - Remove game_id foreign key from user_games table
    - Remove game_id foreign key from coupons table
    - Update RLS policies accordingly

  2. Security
    - Maintain existing RLS policies for remaining tables
    - Keep coupon access policies intact
*/

-- Remove foreign key constraints first
ALTER TABLE user_games DROP CONSTRAINT IF EXISTS user_games_game_id_fkey;
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_game_id_fkey;

-- Remove game_id columns from related tables
ALTER TABLE user_games DROP COLUMN IF EXISTS game_id;
ALTER TABLE coupons DROP COLUMN IF EXISTS game_id;

-- Drop the games table
DROP TABLE IF EXISTS games;

-- Update unique constraint on user_games (remove game_id)
ALTER TABLE user_games DROP CONSTRAINT IF EXISTS user_games_user_id_game_id_key;
-- Note: We don't add a new unique constraint as user can have multiple game records without game_id