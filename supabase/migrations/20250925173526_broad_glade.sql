/*
  # Kupon Level ve Miktar Sistemi

  1. Yeni Kolonlar
    - `level` (integer) - Kupon seviyesi (1, 2, 3)
    - `quantity` (integer) - Kupon miktarı
    - `used_count` (integer) - Kullanılan miktar

  2. Constraints
    - Level 1, 2 veya 3 olmalı
    - Quantity pozitif olmalı
    - Used count quantity'den fazla olamaz

  3. Indexes
    - Level bazında sorgulama için index
*/

-- Kupon tablosuna yeni kolonlar ekle
DO $$
BEGIN
  -- Level kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'level'
  ) THEN
    ALTER TABLE coupons ADD COLUMN level integer NOT NULL DEFAULT 1;
  END IF;

  -- Quantity kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE coupons ADD COLUMN quantity integer NOT NULL DEFAULT 1;
  END IF;

  -- Used count kolonu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'used_count'
  ) THEN
    ALTER TABLE coupons ADD COLUMN used_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Level constraint'i ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'coupons_level_check'
  ) THEN
    ALTER TABLE coupons ADD CONSTRAINT coupons_level_check CHECK (level IN (1, 2, 3));
  END IF;
END $$;

-- Quantity constraint'i ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'coupons_quantity_check'
  ) THEN
    ALTER TABLE coupons ADD CONSTRAINT coupons_quantity_check CHECK (quantity > 0);
  END IF;
END $$;

-- Used count constraint'i ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'coupons_used_count_check'
  ) THEN
    ALTER TABLE coupons ADD CONSTRAINT coupons_used_count_check CHECK (used_count >= 0 AND used_count <= quantity);
  END IF;
END $$;

-- Level bazında index ekle
CREATE INDEX IF NOT EXISTS idx_coupons_level ON coupons(level);
CREATE INDEX IF NOT EXISTS idx_coupons_user_level ON coupons(user_id, level);

-- Mevcut kuponları güncelle (eğer varsa)
UPDATE coupons SET level = 1, quantity = 10, used_count = 0 WHERE level IS NULL;