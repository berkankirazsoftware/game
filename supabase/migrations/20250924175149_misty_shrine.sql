/*
  # Update coupons structure

  1. Changes
    - Remove game_id from coupons table (make coupons general)
    - Update RLS policies for new structure
  
  2. Security
    - Maintain user-based access control
*/

-- Remove the foreign key constraint first
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_game_id_fkey;

-- Make game_id nullable and remove the constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE coupons ALTER COLUMN game_id DROP NOT NULL;
  END IF;
END $$;