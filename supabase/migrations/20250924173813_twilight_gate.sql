/*
  # Oyun ve Kupon Sistemi

  1. Yeni Tablolar
    - `games`
      - `id` (uuid, primary key)
      - `name` (text, oyun adı)
      - `description` (text, oyun açıklaması)
      - `code` (text, oyun kodu/tipi)
      - `created_at` (timestamp)
    
    - `user_games`
      - `id` (uuid, primary key)
      - `user_id` (uuid, kullanıcı referansı)
      - `game_id` (uuid, oyun referansı)
      - `created_at` (timestamp)
    
    - `coupons` tablosunu güncelle
      - Mevcut yapıyı koru ama game_id referansını ekle

  2. Güvenlik
    - Tüm tablolarda RLS etkin
    - Kullanıcılar sadece kendi verilerine erişebilir
*/

-- Games tablosu (admin tarafından yönetilen oyunlar)
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Kullanıcıların seçtiği oyunlar
CREATE TABLE IF NOT EXISTS user_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Coupons tablosunu güncelle (eğer yoksa oluştur)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
    CREATE TABLE coupons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      game_id uuid REFERENCES games(id) ON DELETE CASCADE,
      code text NOT NULL,
      description text NOT NULL,
      discount_type text CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
      discount_value numeric NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- RLS etkinleştir
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Games için policy (herkes okuyabilir)
CREATE POLICY "Anyone can read games"
  ON games
  FOR SELECT
  TO authenticated
  USING (true);

-- User games için policies
CREATE POLICY "Users can read own games"
  ON user_games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON user_games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own games"
  ON user_games
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Coupons için policies
CREATE POLICY "Users can read own coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons"
  ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coupons"
  ON coupons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Örnek oyunlar ekle
INSERT INTO games (name, description, code) VALUES
  ('Yılan Oyunu', 'Klasik yılan oyunu. Yemi toplayarak büyüyün ve 50 puana ulaşın!', 'snake'),
  ('Hafıza Oyunu', 'Kartları eşleştirerek hafızanızı test edin. Tüm çiftleri bulun!', 'memory')
ON CONFLICT DO NOTHING;